// Output: a text table for a terminal, Markdown for a document or a pull request, CSV for a spreadsheet, JSON.

export function money(value, currency = '') {
  const s = Math.round(value).toLocaleString('en-US');
  return currency ? `${currency} ${s}` : s;
}

function pad(s, n, right = false) {
  s = String(s);
  return right ? s.padStart(n) : s.padEnd(n);
}

function verdict(result) {
  const cur = result.currency;
  const diff = Math.abs(result.totals.difference);
  const when = result.breakEven === null
    ? `custom does not catch up within ${result.years} years`
    : result.breakEven === 0 ? 'custom costs less from the start'
      : `custom catches up after ${result.breakEven} years`;
  const which = result.cheaper === 'equal' ? 'Both cost the same'
    : result.cheaper === 'custom' ? `Custom costs ${money(diff, cur)} less` : `Off-the-shelf costs ${money(diff, cur)} less`;
  const pv = result.discountRate ? ` in present value at ${(result.discountRate * 100).toFixed(1)}% a year` : '';
  return `${which} over ${result.years} years${pv}; ${when}.`;
}

export function toText(result) {
  const cur = result.currency;
  const lines = [`${result.name}${cur ? ` (${cur})` : ''}`, ''];
  lines.push([pad('Year', 5), pad('Users', 7, true), pad('Custom', 14, true), pad('Off-the-shelf', 15, true),
    pad('Custom, total', 15, true), pad('Off-the-shelf, total', 21, true)].join('  '));
  for (const r of result.rows) {
    lines.push([pad(r.year, 5), pad(r.year === 0 ? '-' : r.users, 7, true), pad(money(r.custom.total), 14, true),
      pad(money(r.offTheShelf.total), 15, true), pad(money(r.cumulativeCustom), 15, true), pad(money(r.cumulativeOffTheShelf), 21, true)].join('  '));
  }
  lines.push('');
  lines.push(verdict(result));
  lines.push('Year 0 holds the one-time costs. Every figure comes from the scenario file; none is built into the tool.');
  return lines.join('\n');
}

export function toMarkdown(result) {
  const cur = result.currency;
  const out = [`## Build or buy: ${result.name}`, '', verdict(result), ''];
  out.push(`| Year | Users | Custom | Off-the-shelf | Custom, total | Off-the-shelf, total |`);
  out.push('|---:|---:|---:|---:|---:|---:|');
  for (const r of result.rows) {
    out.push(`| ${r.year} | ${r.year === 0 ? '-' : r.users} | ${money(r.custom.total, cur)} | ${money(r.offTheShelf.total, cur)} | ${money(r.cumulativeCustom, cur)} | ${money(r.cumulativeOffTheShelf, cur)} |`);
  }
  out.push('');
  out.push('Year 0 holds the one-time costs. Every figure comes from the scenario file.');
  return out.join('\n');
}

const csvCell = (v) => (/[",\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : String(v));

export function toCsv(result) {
  const head = ['year', 'users', 'custom_build', 'custom_hosting', 'custom_support', 'custom_bridge', 'custom_total',
    'ots_setup', 'ots_integration', 'ots_licences', 'ots_workaround', 'ots_total', 'cumulative_custom', 'cumulative_ots'];
  const rows = result.rows.map((r) => [r.year, r.year === 0 ? 0 : r.users,
    r.custom.build, r.custom.hosting, r.custom.support, r.custom.bridge, r.custom.total,
    r.offTheShelf.setup, r.offTheShelf.integration, r.offTheShelf.licences, r.offTheShelf.workaround, r.offTheShelf.total,
    r.cumulativeCustom, r.cumulativeOffTheShelf].map((v, i) => (i < 2 ? v : Math.round(v * 100) / 100)));
  return [head, ...rows].map((r) => r.map(csvCell).join(',')).join('\n');
}

export function toJson(result) {
  return JSON.stringify(result, null, 2);
}

export function sensitivityText(sens, currency = '') {
  const lines = [`Present-value difference (off-the-shelf minus custom): ${money(sens.base, currency)}`,
    `Each input moved ${Math.round(sens.step * 100)}% down and up, the rest kept:`, ''];
  for (const s of sens.inputs) {
    lines.push(`  ${pad(s.input, 44)} ${pad(money(s.low, currency), 16, true)}  ${pad(money(s.high, currency), 16, true)}`);
  }
  lines.push('', 'A positive difference means custom costs less. The inputs at the top move the answer most.');
  return lines.join('\n');
}
