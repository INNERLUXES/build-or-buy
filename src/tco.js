// Total cost of ownership, year by year, for building custom software and for renting an off-the-shelf product.
// Year 0 holds the one-time costs; years 1..N hold the running costs. See docs/model.md for every formula.

export function usersInYear(scenario, year) {
  const n = scenario.users.start * Math.pow(1 + scenario.users.growthPerYear, year - 1);
  return Math.max(1, Math.round(n));
}

// Custom software is not usable while it is being built. For the months of the build in year 1 the business still
// pays for what it uses today, which the scenario states as the off-the-shelf running cost for those months.
export function customYear(scenario, year) {
  const c = scenario.custom;
  if (year === 0) return { build: c.build, hosting: 0, support: 0, bridge: 0, total: c.build };
  const bridgeMonths = Math.max(0, Math.min(12, c.buildMonths - 12 * (year - 1)));
  const live = (12 - bridgeMonths) / 12;
  const bridge = bridgeMonths > 0 ? offTheShelfYear(scenario, year).total * (bridgeMonths / 12) : 0;
  const hosting = c.hostingPerYear * live;
  const support = c.supportPerYear * live;
  return { build: 0, hosting, support, bridge, total: hosting + support + bridge };
}

export function offTheShelfYear(scenario, year) {
  const o = scenario.offTheShelf;
  if (year === 0) return { setup: o.setup, integration: o.integrationBuild, licences: 0, workaround: 0, total: o.setup + o.integrationBuild };
  const users = usersInYear(scenario, year);
  const seats = Math.max(users, o.minimumSeats);
  const price = o.pricePerUserPerMonth * Math.pow(1 + o.priceIncreasePerYear, year - 1);
  const licences = seats * price * 12;
  const workaround = users * o.workaroundHoursPerUserPerMonth * o.hourlyCost * 12;
  return { setup: 0, integration: o.integrationPerYear, licences, workaround, total: licences + o.integrationPerYear + workaround };
}

const discount = (value, rate, year) => value / Math.pow(1 + rate, year);

export function compare(scenario) {
  const rows = [];
  let cc = 0, oc = 0, cpv = 0, opv = 0;
  for (let y = 0; y <= scenario.years; y++) {
    const c = customYear(scenario, y);
    const o = offTheShelfYear(scenario, y);
    cc += c.total; oc += o.total;
    cpv += discount(c.total, scenario.discountRate, y);
    opv += discount(o.total, scenario.discountRate, y);
    rows.push({ year: y, users: y === 0 ? 0 : usersInYear(scenario, y), custom: c, offTheShelf: o,
      cumulativeCustom: cc, cumulativeOffTheShelf: oc, presentCustom: cpv, presentOffTheShelf: opv });
  }
  const last = rows.at(-1);
  const breakEven = breakEvenYear(rows);
  const cheaper = Math.abs(last.presentCustom - last.presentOffTheShelf) < 0.005 ? 'equal'
    : last.presentCustom < last.presentOffTheShelf ? 'custom' : 'off-the-shelf';
  return {
    name: scenario.name,
    currency: scenario.currency,
    years: scenario.years,
    discountRate: scenario.discountRate,
    rows,
    totals: {
      custom: last.cumulativeCustom,
      offTheShelf: last.cumulativeOffTheShelf,
      presentCustom: last.presentCustom,
      presentOffTheShelf: last.presentOffTheShelf,
      difference: last.presentOffTheShelf - last.presentCustom
    },
    breakEven,
    cheaper
  };
}

// The first moment the cumulative cost of custom is at or below off-the-shelf and stays there, as a year with a
// fraction (linear inside the year). null when custom never catches up inside the horizon.
export function breakEvenYear(rows) {
  const gap = rows.map((r) => r.cumulativeCustom - r.cumulativeOffTheShelf);
  if (gap.every((g) => g <= 0)) return 0;
  for (let i = 1; i < gap.length; i++) {
    if (gap[i] <= 0 && gap.slice(i).every((g) => g <= 0)) {
      const before = gap[i - 1];
      const fraction = before === gap[i] ? 1 : before / (before - gap[i]);
      return Math.round((i - 1 + fraction) * 100) / 100;
    }
  }
  return null;
}
