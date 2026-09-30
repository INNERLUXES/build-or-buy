// Which inputs move the answer, and by how much. Every run changes one input and keeps the rest.

import { compare } from './tco.js';
import { withValue } from './scenario.js';

export const INPUTS = Object.freeze([
  'users.start',
  'users.growthPerYear',
  'custom.build',
  'custom.supportPerYear',
  'custom.hostingPerYear',
  'offTheShelf.pricePerUserPerMonth',
  'offTheShelf.priceIncreasePerYear',
  'offTheShelf.workaroundHoursPerUserPerMonth'
]);

function get(scenario, path) {
  return path.split('.').reduce((o, p) => o[p], scenario);
}

// For each input: the present-value difference (off-the-shelf minus custom) with the input lowered and raised by
// `step` (a fraction). Inputs that are zero in the scenario are skipped: a share of zero is still zero.
export function sensitivity(scenario, { step = 0.2, inputs = INPUTS } = {}) {
  if (!(step > 0 && step < 1)) throw new Error('step must be between 0 and 1');
  const base = compare(scenario).totals.difference;
  const out = [];
  for (const path of inputs) {
    const v = get(scenario, path);
    if (v === 0) continue;
    const at = (f) => {
      let nv = v * f;
      if (path === 'users.start') nv = Math.max(1, Math.round(nv));
      return compare(withValue(scenario, path, nv)).totals.difference;
    };
    const low = at(1 - step), high = at(1 + step);
    out.push({ input: path, value: v, low, high, swing: Math.abs(high - low) });
  }
  out.sort((a, b) => b.swing - a.swing);
  return { base, step, inputs: out };
}

// The smallest starting user count at which custom is cheaper over the horizon, or null if none up to `max`.
export function usersToBreakEven(scenario, { max = 1_000_000 } = {}) {
  const cheaper = (n) => compare(withValue(scenario, 'users.start', n)).totals.difference > 0;
  if (cheaper(1)) return 1;
  if (!cheaper(max)) return null;
  let lo = 1, hi = max;
  while (hi - lo > 1) {
    const mid = Math.floor((lo + hi) / 2);
    if (cheaper(mid)) hi = mid; else lo = mid;
  }
  return hi;
}
