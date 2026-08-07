import * as assert from 'node:assert/strict';
import { extractPlanId, resolvePlanIdFromResponse, shouldRefreshPlan } from './userPlan';

assert.equal(
  extractPlanId(Buffer.from('\u0008\u0001g1-pro-tier\u0012status', 'utf8')),
  'g1-pro-tier'
);

assert.equal(
  extractPlanId(Buffer.from('Gemini Pro models only', 'utf8')),
  undefined
);

assert.equal(
  extractPlanId(Buffer.from('free-tier\u0000g1-pro-tier', 'utf8')),
  undefined
);

assert.equal(shouldRefreshPlan(undefined, 300_000), true);
assert.equal(shouldRefreshPlan(300_000, 599_999), false);
assert.equal(shouldRefreshPlan(300_000, 600_000), true);
assert.equal(shouldRefreshPlan(300_000, 300_001, true), true);

assert.equal(resolvePlanIdFromResponse('g1-pro-tier', null), 'g1-pro-tier');
assert.equal(resolvePlanIdFromResponse('g1-pro-tier', Buffer.from('free-tier')), 'free-tier');
assert.equal(resolvePlanIdFromResponse('g1-pro-tier', Buffer.from('free-tier\u0000g1-pro-tier')), undefined);

console.log('userPlan tests passed');
