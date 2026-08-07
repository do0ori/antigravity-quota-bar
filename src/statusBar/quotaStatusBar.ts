import * as vscode from 'vscode';
import { ModelQuotaSnapshot } from '../quota/quotaTypes';
import { SvgGenerator } from './svgGenerator';
import { renderTooltipFooter } from './tooltipFooter';

export class QuotaStatusBar {
  private statusBarItem: vscode.StatusBarItem;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(
      vscode.StatusBarAlignment.Right,
      100
    );
    this.statusBarItem.command = 'antigravityQuota.refresh';
    this.statusBarItem.show();
  }

  public update(snapshot: ModelQuotaSnapshot): void {
    if (!snapshot.isAvailable) {
      this.statusBarItem.text = `$(warning) Quota Offline`;
      this.statusBarItem.tooltip = `Antigravity Quota: Language Server offline`;
      this.statusBarItem.backgroundColor = undefined;
      return;
    }

    const { gemini, claudeGpt } = snapshot;

    // Helper to get effective percentage for status bar display
    const getEffectivePercent = (m: typeof gemini) => {
      // 1. If weekly limit is exhausted (0%), status bar shows 0%
      if (m.hasWeeklyLimit && m.weeklyPercent === 0) {
        return 0;
      }
      // 2. If 5-hour limit exists, show 5-hour rolling percentage
      if (m.hasFiveHourLimit && m.fiveHourPercent !== undefined) {
        return m.fiveHourPercent;
      }
      // 3. Fallback: show weekly percentage (for plans without 5-hour limit)
      return m.weeklyPercent;
    };

    const gPct = getEffectivePercent(gemini);
    const cPct = getEffectivePercent(claudeGpt);

    // Status Bar Item: Show active effective limit % for each group
    this.statusBarItem.text = `$(sparkle) ${gPct}%  │  $(hubot) ${cPct}%`;

    // Seamless background blending
    this.statusBarItem.backgroundColor = undefined;

    // Hover tooltip uses the safe HTML subset supported by VS Code MarkdownString.
    const tooltip = new vscode.MarkdownString();
    tooltip.supportHtml = true;

    // Gemini Bars
    const gWeeklyBar = SvgGenerator.createProgressBarSvgDataUri(gemini.weeklyPercent, 110, 8);
    const g5hBar = gemini.hasFiveHourLimit && gemini.fiveHourPercent !== undefined
      ? SvgGenerator.createProgressBarSvgDataUri(gemini.fiveHourPercent, 110, 8)
      : '';

    // Claude & GPT Bars
    const cWeeklyBar = SvgGenerator.createProgressBarSvgDataUri(claudeGpt.weeklyPercent, 110, 8);
    const c5hBar = claudeGpt.hasFiveHourLimit && claudeGpt.fiveHourPercent !== undefined
      ? SvgGenerator.createProgressBarSvgDataUri(claudeGpt.fiveHourPercent, 110, 8)
      : '';

    const render5hRow = (m: typeof gemini, barUri: string) => {
      // 5-hour limit inactive, unapplicable, or weekly limit exhausted
      if (!m.hasFiveHourLimit || m.fiveHourPercent === undefined || (m.hasWeeklyLimit && m.weeklyPercent === 0)) {
        return `
  <div>
    5-Hour Limit N/A (Not Applicable)
  </div>`;
      }
      // Active 5-hour limit
      return `
  <div>
    5-Hour Limit <img src="${barUri}" /> ${m.fiveHourPercent}% ${m.fiveHourResetText ? `(${m.fiveHourResetText})` : ''}
  </div>`;
    };

    const htmlContent = `
<h4>✨ Gemini Models</h4>
<div>
  <div>
    Weekly Limit <img src="${gWeeklyBar}" /> ${gemini.weeklyPercent}% ${gemini.weeklyResetText ? `(${gemini.weeklyResetText})` : ''}
  </div>
  ${render5hRow(gemini, g5hBar)}
</div>

<h4>🤖 Claude and GPT models</h4>
<div>
  <div>
    Weekly Limit <img src="${cWeeklyBar}" /> ${claudeGpt.weeklyPercent}% ${claudeGpt.weeklyResetText ? `(${claudeGpt.weeklyResetText})` : ''}
  </div>
  ${render5hRow(claudeGpt, c5hBar)}
</div>

<hr>
${renderTooltipFooter(snapshot.planId, snapshot.fetchedAt.toLocaleTimeString())}
`;

    tooltip.appendMarkdown(htmlContent);

    this.statusBarItem.tooltip = tooltip;
  }

  public showLoading(): void {
    this.statusBarItem.text = `$(sync~spin) Updating Quota...`;
  }

  public dispose(): void {
    this.statusBarItem.dispose();
  }
}
