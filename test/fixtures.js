// Small scenarios whose answers can be worked out by hand.

export const simple = () => ({
  name: 'simple',
  years: 2,
  users: { start: 10 },
  custom: { build: 1000, buildMonths: 0, hostingPerYear: 100, supportPerYear: 100 },
  offTheShelf: { setup: 0, pricePerUserPerMonth: 10 }
});

export function clone(x) {
  return JSON.parse(JSON.stringify(x));
}
