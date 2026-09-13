import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateForecast } from '../lib/forecast.ts';

const defaults = { revenue: 10000, averageOrderValue: 1000, leadResponseRate: 40, prospectResponseRate: 20 };

test('matches the screenshot targets', () => {
  assert.deepEqual(calculateForecast(defaults), { customers: 10, leads: 25, prospects: 125 });
});
test('keeps fractional precision between stages', () => {
  assert.deepEqual(calculateForecast({ ...defaults, revenue: 1500 }), { customers: 1.5, leads: 3.75, prospects: 18.75 });
});
test('zero revenue requires no people', () => {
  assert.deepEqual(calculateForecast({ ...defaults, revenue: 0 }), { customers: 0, leads: 0, prospects: 0 });
});
test('100 percent response rates keep all stages equal', () => {
  assert.deepEqual(calculateForecast({ ...defaults, leadResponseRate: 100, prospectResponseRate: 100 }), { customers: 10, leads: 10, prospects: 10 });
});
test('rejects invalid amounts and response rates', () => {
  for (const override of [{ revenue: -1 }, { revenue: NaN }, { revenue: Infinity }, { averageOrderValue: 0 }, { averageOrderValue: -1 }, { leadResponseRate: 0 }, { prospectResponseRate: 0 }, { leadResponseRate: 101 }, { prospectResponseRate: -1 }]) {
    assert.equal(calculateForecast({ ...defaults, ...override }), null);
  }
});
test('rejects overflow instead of displaying infinity', () => {
  assert.equal(calculateForecast({ ...defaults, revenue: Number.MAX_VALUE, averageOrderValue: Number.MIN_VALUE }), null);
});
