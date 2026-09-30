// A scenario is everything the comparison needs, supplied by the reader. Nothing here has a default price:
// a missing cost is an error, because a made-up number would decide the answer.

const isNum = (v) => typeof v === 'number' && Number.isFinite(v);

function need(errors, obj, path, { min = 0, max = Infinity, optional = false, integer = false } = {}) {
  const parts = path.split('.');
  let v = obj;
  for (const p of parts) v = v == null ? undefined : v[p];
  if (v === undefined) {
    if (!optional) errors.push(`${path} is required`);
    return undefined;
  }
  if (!isNum(v)) errors.push(`${path} must be a number`);
  else if (v < min || v > max) errors.push(`${path} must be between ${min} and ${max === Infinity ? 'any' : max}`);
  else if (integer && !Number.isInteger(v)) errors.push(`${path} must be a whole number`);
  return v;
}

// Returns a normalized scenario or throws one error listing every problem found.
export function parseScenario(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input)) throw new Error('scenario must be an object');
  const e = [];
  need(e, input, 'years', { min: 1, max: 30, integer: true });
  need(e, input, 'discountRate', { min: 0, max: 1, optional: true });
  need(e, input, 'users.start', { min: 1, integer: true });
  need(e, input, 'users.growthPerYear', { min: -0.9, max: 10, optional: true });

  need(e, input, 'custom.build', {});
  need(e, input, 'custom.hostingPerYear', {});
  const supportRate = need(e, input, 'custom.supportRate', { max: 2, optional: true });
  const supportPerYear = need(e, input, 'custom.supportPerYear', { optional: true });
  if (supportRate !== undefined && supportPerYear !== undefined) e.push('custom: give supportRate or supportPerYear, not both');
  if (supportRate === undefined && supportPerYear === undefined) e.push('custom: supportRate or supportPerYear is required');
  need(e, input, 'custom.buildMonths', { min: 0, max: 60 });

  need(e, input, 'offTheShelf.setup', {});
  need(e, input, 'offTheShelf.pricePerUserPerMonth', {});
  need(e, input, 'offTheShelf.priceIncreasePerYear', { min: -0.5, max: 2, optional: true });
  need(e, input, 'offTheShelf.minimumSeats', { min: 0, integer: true, optional: true });
  need(e, input, 'offTheShelf.integrationBuild', { optional: true });
  need(e, input, 'offTheShelf.integrationPerYear', { optional: true });
  need(e, input, 'offTheShelf.workaroundHoursPerUserPerMonth', { max: 200, optional: true });
  need(e, input, 'offTheShelf.hourlyCost', { optional: true });
  const wh = input.offTheShelf && input.offTheShelf.workaroundHoursPerUserPerMonth;
  const hc = input.offTheShelf && input.offTheShelf.hourlyCost;
  if ((wh === undefined) !== (hc === undefined)) e.push('offTheShelf: workaroundHoursPerUserPerMonth and hourlyCost go together');
  if (input.currency !== undefined && !/^[A-Z]{3}$/.test(input.currency)) e.push('currency must be a three-letter code such as USD');
  if (e.length) throw new Error(`invalid scenario:\n  ${e.join('\n  ')}`);

  const c = input.custom, o = input.offTheShelf, u = input.users;
  return Object.freeze({
    name: typeof input.name === 'string' ? input.name : 'scenario',
    currency: input.currency || '',
    years: input.years,
    discountRate: input.discountRate || 0,
    users: { start: u.start, growthPerYear: u.growthPerYear || 0 },
    custom: {
      build: c.build,
      buildMonths: c.buildMonths,
      hostingPerYear: c.hostingPerYear,
      supportPerYear: supportPerYear !== undefined ? supportPerYear : c.build * supportRate
    },
    offTheShelf: {
      setup: o.setup,
      pricePerUserPerMonth: o.pricePerUserPerMonth,
      priceIncreasePerYear: o.priceIncreasePerYear || 0,
      minimumSeats: o.minimumSeats || 0,
      integrationBuild: o.integrationBuild || 0,
      integrationPerYear: o.integrationPerYear || 0,
      workaroundHoursPerUserPerMonth: o.workaroundHoursPerUserPerMonth || 0,
      hourlyCost: o.hourlyCost || 0
    }
  });
}

// A copy of the scenario with one value replaced, for sensitivity runs. path like 'users.start'.
export function withValue(scenario, path, value) {
  const copy = JSON.parse(JSON.stringify(scenario));
  const parts = path.split('.');
  let o = copy;
  for (const p of parts.slice(0, -1)) {
    if (!o[p] || typeof o[p] !== 'object') throw new Error(`unknown path: ${path}`);
    o = o[p];
  }
  const last = parts.at(-1);
  if (!(last in o)) throw new Error(`unknown path: ${path}`);
  o[last] = value;
  return Object.freeze(copy);
}
