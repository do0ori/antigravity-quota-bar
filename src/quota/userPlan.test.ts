import * as assert from 'node:assert/strict';
import { extractPlanId } from './userPlan';

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

console.log('userPlan tests passed');
