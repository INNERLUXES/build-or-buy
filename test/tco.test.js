import test from 'node:test';
import assert from 'node:assert/strict';
import { parseScenario } from '../src/scenario.js';
import { compare, customYear, offTheShelfYear, usersInYear, breakEvenYear } from '../src/tco.js';
import { simple } from './fixtures.js';

const close = (a, b, eps = 1e-6) => assert.ok(Math.abs(a - b) < eps, `${a} != ${b}`);

test('worked by hand: one-time costs in year 0, running costs after', () => {
  const r = compare(parseScenario(simple()));
  assert.deepEqual(r.rows.map((x) => x.custom.total), [1000, 200, 200]);
  assert.deepEqual(r.rows.map((x) => x.offTheShelf.total), [0, 1200, 1200]);
  assert.deepEqual(r.rows.map((x) => x.cumulativeCustom), [1000, 1200, 1400]);
  assert.deepEqual(r.rows.map((x) => x.cumulativeOffTheShelf), [0, 1200, 2400]);
  assert.equal(r.totals.difference, 1000);
  assert.equal(r.cheaper, 'custom');
  assert.equal(r.breakEven, 1);
});

test('users grow each year and are whole people', () => {
  const x = simple();
  x.users.growthPerYear = 0.5;
  const s = parseScenario(x);
  assert.equal(usersInYear(s, 1), 10);
  assert.equal(usersInYear(s, 2), 15);
  assert.equal(usersInYear(s, 3), 23);
});

test('shrinking use never drops below one user', () => {
  const x = simple();
  x.users.start = 1;
  x.users.growthPerYear = -0.9;
  assert.equal(usersInYear(parseScenario(x), 5), 1);
});

test('licence price rises every year and the minimum seat count is paid for', () => {
  const x = simple();
  x.offTheShelf.priceIncreasePerYear = 0.1;
  x.offTheShelf.minimumSeats = 20;
  const s = parseScenario(x);
  close(offTheShelfYear(s, 1).licences, 20 * 10 * 12);
  close(offTheShelfYear(s, 2).licences, 20 * 11 * 12);
});

test('integration and the cost of working around the product', () => {
  const x = simple();
  Object.assign(x.offTheShelf, { integrationBuild: 500, integrationPerYear: 50, workaroundHoursPerUserPerMonth: 2, hourlyCost: 30 });
  const s = parseScenario(x);
  assert.equal(offTheShelfYear(s, 0).total, 500);
  const y1 = offTheShelfYear(s, 1);
  assert.equal(y1.workaround, 10 * 2 * 30 * 12);
  assert.equal(y1.total, 1200 + 50 + 7200);
});

test('while custom is being built the current tool is still paid for', () => {
  const x = simple();
  x.custom.buildMonths = 6;
  const s = parseScenario(x);
  const y1 = customYear(s, 1);
  assert.equal(y1.bridge, 600);
  assert.equal(y1.hosting, 50);
  assert.equal(y1.support, 50);
  assert.equal(y1.total, 700);
  assert.equal(customYear(s, 2).bridge, 0);
});

test('a build longer than a year bridges the whole first year and part of the second', () => {
  const x = simple();
  x.custom.buildMonths = 18;
  const s = parseScenario(x);
  assert.equal(customYear(s, 1).total, 1200);
  assert.equal(customYear(s, 2).bridge, 600);
});

test('present value with a discount rate', () => {
  const x = simple();
  x.discountRate = 0.1;
  const r = compare(parseScenario(x));
  close(r.totals.presentCustom, 1000 + 200 / 1.1 + 200 / 1.21);
  close(r.totals.presentOffTheShelf, 1200 / 1.1 + 1200 / 1.21);
  assert.equal(r.totals.custom, 1400);
});

test('off-the-shelf wins when licences are cheap', () => {
  const x = simple();
  x.offTheShelf.pricePerUserPerMonth = 1;
  const r = compare(parseScenario(x));
  assert.equal(r.cheaper, 'off-the-shelf');
  assert.equal(r.breakEven, null);
  assert.ok(r.totals.difference < 0);
});

test('break-even inside a year, and one that does not hold is not counted', () => {
  const rows = (gaps) => gaps.map((g) => ({ cumulativeCustom: g, cumulativeOffTheShelf: 0 }));
  assert.equal(breakEvenYear(rows([1000, 400, -200])), 1.67);
  assert.equal(breakEvenYear(rows([100, -50, 20, -10])), 2.67);
  assert.equal(breakEvenYear(rows([0, -1])), 0);
  assert.equal(breakEvenYear(rows([10, 5])), null);
});

test('equal totals are called equal', () => {
  const x = simple();
  x.offTheShelf.pricePerUserPerMonth = 1400 / 240; // 10 users x 12 months x 2 years = 1400, the custom total
  const r = compare(parseScenario(x));
  assert.ok(Math.abs(r.totals.difference) < 0.01);
  assert.equal(r.cheaper, 'equal');
});
