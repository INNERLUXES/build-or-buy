import test from 'node:test';
import assert from 'node:assert/strict';
import { parseScenario, withValue } from '../src/scenario.js';
import { simple, clone } from './fixtures.js';

test('a minimal scenario is filled with neutral values, never with prices', () => {
  const s = parseScenario(simple());
  assert.equal(s.discountRate, 0);
  assert.equal(s.users.growthPerYear, 0);
  assert.equal(s.offTheShelf.priceIncreasePerYear, 0);
  assert.equal(s.offTheShelf.integrationBuild, 0);
  assert.equal(s.offTheShelf.workaroundHoursPerUserPerMonth, 0);
  assert.equal(s.currency, '');
});

test('support as a share of the build', () => {
  const x = simple();
  delete x.custom.supportPerYear;
  x.custom.supportRate = 0.2;
  assert.equal(parseScenario(x).custom.supportPerYear, 200);
});

test('every missing price is reported at once', () => {
  const x = simple();
  delete x.custom.build;
  delete x.offTheShelf.pricePerUserPerMonth;
  assert.throws(() => parseScenario(x), (err) => /custom\.build is required/.test(err.message) && /pricePerUserPerMonth is required/.test(err.message));
});

test('support must be given one way only', () => {
  const both = simple();
  both.custom.supportRate = 0.1;
  assert.throws(() => parseScenario(both), /not both/);
  const none = simple();
  delete none.custom.supportPerYear;
  assert.throws(() => parseScenario(none), /supportRate or supportPerYear is required/);
});

test('ranges, types and pairs are checked', () => {
  const cases = [
    [(x) => { x.years = 0; }, /years must be between 1/],
    [(x) => { x.years = 2.5; }, /years must be a whole number/],
    [(x) => { x.users.start = '10'; }, /users\.start must be a number/],
    [(x) => { x.custom.build = -1; }, /custom\.build must be between 0/],
    [(x) => { delete x.custom.buildMonths; }, /custom\.buildMonths is required/],
    [(x) => { x.discountRate = 1.5; }, /discountRate must be between 0 and 1/],
    [(x) => { x.offTheShelf.hourlyCost = 30; }, /go together/],
    [(x) => { x.currency = 'dollars'; }, /three-letter code/]
  ];
  for (const [change, msg] of cases) {
    const x = clone(simple());
    change(x);
    assert.throws(() => parseScenario(x), msg);
  }
  assert.throws(() => parseScenario(null), /must be an object/);
  assert.throws(() => parseScenario([]), /must be an object/);
});

test('withValue changes one value and leaves the original alone', () => {
  const s = parseScenario(simple());
  const t = withValue(s, 'users.start', 50);
  assert.equal(t.users.start, 50);
  assert.equal(s.users.start, 10);
  assert.throws(() => withValue(s, 'users.nope', 1), /unknown path/);
  assert.throws(() => withValue(s, 'nope.start', 1), /unknown path/);
});
