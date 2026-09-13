import test from 'node:test';
import assert from 'node:assert/strict';
import standalone from '../../scripts.js';
import { calculateForecast } from '../lib/forecast.ts';

test('standalone calculator agrees with the application formulas', () => {
  for (const [revenue, order, lead, prospect] of [[10000,1000,40,20],[1500,1000,40,20],[0,1000,40,20],[10000,1000,100,100],[-1,1000,40,20],[10000,0,40,20],[NaN,1000,40,20],[10000,1000,0,20],[Number.MAX_VALUE,Number.MIN_VALUE,1,1]]) {
    assert.deepEqual(standalone.calculateCampaign(revenue,order,lead,prospect), calculateForecast({revenue,averageOrderValue:order,leadResponseRate:lead,prospectResponseRate:prospect}));
  }
});
test('campaign chart ends at the full six-month targets', () => {
  const totals = standalone.calculateCampaign(10000,1000,40,20);
  const campaign = standalone.campaignRows('2026-05-08','2026-11-04',totals);
  assert.equal(campaign.months,6);
  assert.deepEqual(campaign.rows.at(-1),{month:6,...totals});
  assert.equal(campaign.rows.length,6);
});
test('invalid dates clear the chart; long campaigns remain bounded', () => {
  const totals={customers:10,leads:25,prospects:125};
  assert.equal(standalone.campaignRows('','2026-11-04',totals),null);
  assert.equal(standalone.campaignRows('2026-11-04','2026-05-08',totals),null);
  assert.equal(standalone.campaignRows('2026-05-08','2026-05-08',totals).months,1);
  const long=standalone.campaignRows('2026-01-01','2036-01-01',totals);
  assert.equal(long.rows.length,24);
  assert.deepEqual(long.rows.at(-1),{month:long.months,...totals});
});
