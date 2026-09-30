// Command line: build-or-buy <scenario.json> [--format text|markdown|csv|json] [--years N] [--discount R]
//               [--sensitivity] [--break-even-users] [--output file]

import { readFile, writeFile } from 'node:fs/promises';
import { parseScenario } from './scenario.js';
import { compare } from './tco.js';
import { sensitivity, usersToBreakEven } from './sensitivity.js';
import { toText, toMarkdown, toCsv, toJson, sensitivityText } from './report.js';

export const USAGE = `build-or-buy <scenario.json> [options]

Compares the total cost of building custom software with renting an off-the-shelf product, year by year.
Every price comes from the scenario file. See examples/ and docs/inputs.md.

Options
  --format <f>          text (default), markdown, csv or json
  --output <file>       write the report to a file
  --years <n>           override the number of years in the file
  --discount <rate>     override the yearly discount rate, for example 0.08
  --sensitivity         show which inputs move the answer most
  --break-even-users    the smallest starting user count at which custom costs less
  --help                this text

Exit codes: 0 done, 2 wrong usage or an invalid scenario.`;

export function parseArgs(argv) {
  const o = { format: 'text', sensitivity: false, breakEvenUsers: false, help: false };
  const val = (i, n) => {
    if (i + 1 >= argv.length || argv[i + 1].startsWith('--')) throw new Error(`${n} needs a value`);
    return argv[i + 1];
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--format') { o.format = val(i, a); i++; }
    else if (a === '--output') { o.output = val(i, a); i++; }
    else if (a === '--years') { o.years = Number(val(i, a)); i++; }
    else if (a === '--discount') { o.discount = Number(val(i, a)); i++; }
    else if (a === '--sensitivity') o.sensitivity = true;
    else if (a === '--break-even-users') o.breakEvenUsers = true;
    else if (a === '--help' || a === '-h') o.help = true;
    else if (a.startsWith('-')) throw new Error(`unknown option: ${a}`);
    else if (o.file) throw new Error(`only one scenario file, got a second: ${a}`);
    else o.file = a;
  }
  if (!['text', 'markdown', 'csv', 'json'].includes(o.format)) throw new Error(`unknown format: ${o.format}`);
  if (!o.help && !o.file) throw new Error('a scenario file is required');
  return o;
}

export async function main(argv, { stdout = process.stdout, stderr = process.stderr } = {}) {
  let o, scenario;
  try {
    o = parseArgs(argv);
    if (o.help) { stdout.write(`${USAGE}\n`); return 0; }
    let raw;
    try {
      raw = JSON.parse(await readFile(o.file, 'utf8'));
    } catch (err) {
      throw new Error(`cannot read ${o.file}: ${err.message}`);
    }
    if (o.years !== undefined) raw.years = o.years;
    if (o.discount !== undefined) raw.discountRate = o.discount;
    scenario = parseScenario(raw);
  } catch (err) {
    stderr.write(`${err.message}\n\n${USAGE}\n`);
    return 2;
  }
  const result = compare(scenario);
  const parts = [o.format === 'json' ? toJson(result) : o.format === 'csv' ? toCsv(result)
    : o.format === 'markdown' ? toMarkdown(result) : toText(result)];
  if (o.sensitivity) parts.push(sensitivityText(sensitivity(scenario), scenario.currency));
  if (o.breakEvenUsers) {
    const n = usersToBreakEven(scenario);
    parts.push(n === null ? 'Custom does not cost less at any user count up to 1,000,000 in this scenario.'
      : n === 1 ? `Custom costs less over ${scenario.years} years at any user count, from a single user.`
        : `Custom costs less over ${scenario.years} years from ${n.toLocaleString('en-US')} users at the start.`);
  }
  const text = parts.join('\n\n');
  if (o.output) await writeFile(o.output, `${text}\n`);
  else stdout.write(`${text}\n`);
  return 0;
}

