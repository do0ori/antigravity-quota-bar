import * as assert from 'node:assert/strict';
import { renderTooltipFooter } from './tooltipFooter';

assert.equal(
  renderTooltipFooter('g1-pro-tier', '10:32:59'),
  '<em>Plan: g1-pro-tier · Updated 10:32:59</em>'
);

assert.equal(
  renderTooltipFooter(undefined, '10:32:59'),
  '<em>Updated 10:32:59</em>'
);

console.log('tooltipFooter tests passed');
