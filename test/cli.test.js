import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseArgs, main } from '../src/cli.js';
import { simple } from './fixtures.js';

const EXAMPLES = join(fileURLToPath(import.meta.url), '..', '..', 'examples');

function sink() {
  let data = '';
  return { write(s) { data += s; }, get text() { return data; } };
}

async function scenarioFile(t, content) {
  const dir = await mkdtemp(join(tmpdir(), 'bob-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const file = join(dir, 's.json');
  await writeFile(file, typeof content === 'string' ? content : JSON.stringify(content));
  return { dir, file };
}

test('parseArgs', () => {
  const o = parseArgs(['s.json', '--format', 'csv', '--years', '7', '--discount', '0.1', '--sensitivity', '--break-even-users']);
  assert.equal(o.file, 's.json');
  assert.equal(o.format, 'csv');
  assert.equal(o.years, 7);
  assert.equal(o.discount, 0.1);
  assert.ok(o.sensitivity && o.breakEvenUsers);
  assert.throws(() => parseArgs([]), /scenario file is required/);
  assert.throws(() => parseArgs(['a', 'b']), /only one scenario file/);
  assert.throws(() => parseArgs(['a', '--format', 'xml']), /unknown format/);
  assert.throws(() => parseArgs(['a', '--nope']), /unknown option/);
  assert.throws(() => parseArgs(['a', '--years']), /needs a value/);
  assert.equal(parseArgs(['--help']).help, true);
});

test('help', async () => {
  const out = sink();
  assert.equal(await main(['--help'], { stdout: out, stderr: sink() }), 0);
  assert.match(out.text, /Every price comes from the scenario file/);
});

test('runs a scenario, with overrides from the command line', async (t) => {
  const { file } = await scenarioFile(t, simple());
  const out = sink();
  assert.equal(await main([file, '--years', '3', '--break-even-users'], { stdout: out, stderr: sink() }), 0);
  assert.equal(out.text.split('\n').filter((l) => /^\d+\s/.test(l)).length, 4);
  assert.match(out.text, /over 3 years from \d+ users at the start/);
});

test('writes to a file', async (t) => {
  const { dir, file } = await scenarioFile(t, simple());
  const target = join(dir, 'out.md');
  assert.equal(await main([file, '--format', 'markdown', '--output', target], { stdout: sink(), stderr: sink() }), 0);
  assert.match(await readFile(target, 'utf8'), /^## Build or buy/);
});

test('bad input exits 2 with the reason', async (t) => {
  const { file } = await scenarioFile(t, '{ not json');
  const err = sink();
  assert.equal(await main([file], { stdout: sink(), stderr: err }), 2);
  assert.match(err.text, /cannot read/);
  const bad = simple();
  delete bad.custom.build;
  const second = await scenarioFile(t, bad);
  const err2 = sink();
  assert.equal(await main([second.file], { stdout: sink(), stderr: err2 }), 2);
  assert.match(err2.text, /custom\.build is required/);
  const err3 = sink();
  assert.equal(await main([join(tmpdir(), 'no-such-bob.json')], { stdout: sink(), stderr: err3 }), 2);
});

test('every example scenario is valid and runs', async () => {
  for (const name of ['internal-operations-tool.json', 'small-team.json', 'growing-customer-portal.json']) {
    const out = sink();
    assert.equal(await main([join(EXAMPLES, name), '--sensitivity'], { stdout: out, stderr: sink() }), 0, name);
    assert.match(out.text, /example inputs/);
  }
});
