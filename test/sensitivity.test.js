import test from 'node:test';
import assert from 'node:assert/strict';
import { parseScenario } from '../src/scenario.js';
import { compare } from '../src/tco.js';
import { sensitivity, usersToBreakEven, INPUTS } from '../src/sensitivity.js';
import { simple } from './fixtures.js';

test('inputs are ranked by how far they move the answer', () => {
  const s = parseScenario(simple());
  const r = sensitivity(s);
  assert.equal(r.base, compare(s).totals.difference);
  for (let i = 1; i < r.inputs.length; i++) assert.ok(r.inputs[i - 1].swing >= r.inputs[i].swing);
  const price = r.inputs.find((x) => x.input === 'offTheShelf.pricePerUserPerMonth');
  assert.equal(price.low, 2400 * 0.8 - 1400);
  assert.equal(price.high, 2400 * 1.2 - 1400);
});

test('inputs that are zero are skipped', () => {
  const r = sensitivity(parseScenario(simple()));
  const names = r.inputs.map((x) => x.input);
  assert.ok(!names.includes('users.growthPerYear'));
  assert.ok(!names.includes('offTheShelf.workaroundHoursPerUserPerMonth'));
  assert.ok(INPUTS.includes('users.growthPerYear'));
});

test('the step must be a fraction', () => {
  assert.throws(() => sensitivity(parseScenario(simple()), { step: 0 }), /step/);
  assert.throws(() => sensitivity(parseScenario(simple()), { step: 1.5 }), /step/);
});

test('the user count where custom starts to cost less', () => {
  // custom: 1400 over two years; off-the-shelf: 240 per user over two years, so custom wins from 6 users (1440)
  const s = parseScenario(simple());
  assert.equal(usersToBreakEven(s), 6);
  const cheap = simple();
  cheap.offTheShelf.pricePerUserPerMonth = 0;
  assert.equal(usersToBreakEven(parseScenario(cheap)), null);
  const seats = simple();
  seats.offTheShelf.minimumSeats = 100;
  assert.equal(usersToBreakEven(parseScenario(seats)), 1);
});
