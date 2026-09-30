import test from 'node:test';
import assert from 'node:assert/strict';
import { parseScenario } from '../src/scenario.js';
import { compare } from '../src/tco.js';
import { sensitivity } from '../src/sensitivity.js';
import { toText, toMarkdown, toCsv, toJson, sensitivityText, money } from '../src/report.js';
import { simple } from './fixtures.js';

const result = (change = () => {}) => {
  const x = simple();
  change(x);
  return compare(parseScenario(x));
};

test('money rounds and groups thousands', () => {
  assert.equal(money(1234567.6), '1,234,568');
  assert.equal(money(99.4, 'EUR'), 'EUR 99');
});

test('text report: one row per year and a plain verdict', () => {
  const t = toText(result());
  assert.match(t, /^simple\n/);
  assert.equal(t.split('\n').filter((l) => /^\d+\s/.test(l)).length, 3);
  assert.match(t, /Custom costs 1,000 less over 2 years; custom catches up after 1 years\./);
  assert.match(t, /none is built into the tool/);
});

test('verdicts for each outcome', () => {
  assert.match(toText(result((x) => { x.offTheShelf.pricePerUserPerMonth = 1; })), /Off-the-shelf costs .* less .* does not catch up within 2 years/);
  assert.match(toText(result((x) => { x.custom.build = 0; })), /custom costs less from the start/);
  assert.match(toText(result((x) => { x.discountRate = 0.05; x.currency = 'USD'; })), /in present value at 5\.0% a year/);
});

test('markdown table carries the currency', () => {
  const md = toMarkdown(result((x) => { x.currency = 'GBP'; }));
  assert.match(md, /^## Build or buy: simple/);
  assert.match(md, /\| 1 \| 10 \| GBP 200 \| GBP 1,200 \| GBP 1,200 \| GBP 1,200 \|/);
});

test('csv has a header and one line per year, numbers without grouping', () => {
  const lines = toCsv(result()).split('\n');
  assert.equal(lines.length, 4);
  assert.match(lines[0], /^year,users,custom_build/);
  assert.equal(lines[1].split(',')[2], '1000');
});

test('json round-trips', () => {
  const r = result();
  assert.deepEqual(JSON.parse(toJson(r)).totals, r.totals);
});

test('sensitivity text lists each input', () => {
  const t = sensitivityText(sensitivity(parseScenario(simple())), 'USD');
  assert.match(t, /offTheShelf\.pricePerUserPerMonth/);
  assert.match(t, /A positive difference means custom costs less/);
});
