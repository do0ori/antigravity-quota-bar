import * as vscode from 'vscode';
import { ModelQuotaSnapshot } from '../quota/quotaTypes';
import { SvgGenerator } from './svgGenerator';

export class QuotaStatusBar {
  private statusBarItem: vscode.StatusBarItem;

  constructor(private extensionPath: string) {
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

    // Hover Tooltip using <div> flex layout
    const tooltip = new vscode.MarkdownString();
    tooltip.isTrusted = true;
    tooltip.supportHtml = true;

    const flexRowStyle = `display:flex; align-items:center; white-space:nowrap; margin:3px 0; font-size:12px;`;
    const labelStyle = `display:inline-block; width:92px; font-weight:bold; white-space:nowrap;`;
    const barStyle = `display:inline-block; margin:0 6px; vertical-align:middle;`;
    const pctStyle = `display:inline-block; width:36px; text-align:right; font-weight:bold; white-space:nowrap;`;
    const timeStyle = `display:inline-block; color:#888; margin-left:8px; font-style:italic; white-space:nowrap;`;

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
      // Priority 1: Plan itself does not have a 5-hour limit
      if (!m.hasFiveHourLimit || m.fiveHourPercent === undefined) {
        return `
  <div style="${flexRowStyle}">
    <span style="${labelStyle}">5-Hour Limit</span>
    <span style="${timeStyle}; margin-left:0;">N/A (No 5-hour limit)</span>
  </div>`;
      }
      // Priority 2: Weekly limit reached (5-hour limit temporarily disabled)
      if (m.hasWeeklyLimit && m.weeklyPercent === 0) {
        return `
  <div style="${flexRowStyle}">
    <span style="${labelStyle}">5-Hour Limit</span>
    <span style="${timeStyle}; margin-left:0;">N/A (Weekly limit reached)</span>
  </div>`;
      }
      // Priority 3: Active 5-hour limit
      return `
  <div style="${flexRowStyle}">
    <span style="${labelStyle}">5-Hour Limit</span>
    <span style="${barStyle}"><img src="${barUri}" align="center" /></span>
    <span style="${pctStyle}">${m.fiveHourPercent}%</span>
    <span style="${timeStyle}">${m.fiveHourResetText ? `(${m.fiveHourResetText})` : ''}</span>
  </div>`;
    };

    const htmlContent = `
<h4 style="margin:0 0 6px 0; white-space:nowrap;">✨ Gemini Models</h4>
<div style="display:flex; flex-direction:column; margin-bottom:10px;">
  <div style="${flexRowStyle}">
    <span style="${labelStyle}">Weekly Limit</span>
    <span style="${barStyle}"><img src="${gWeeklyBar}" align="center" /></span>
    <span style="${pctStyle}">${gemini.weeklyPercent}%</span>
    <span style="${timeStyle}">${gemini.weeklyResetText ? `(${gemini.weeklyResetText})` : ''}</span>
  </div>
  ${render5hRow(gemini, g5hBar)}
</div>

<h4 style="margin:10px 0 6px 0; white-space:nowrap;">🤖 Claude and GPT models</h4>
<div style="display:flex; flex-direction:column;">
  <div style="${flexRowStyle}">
    <span style="${labelStyle}">Weekly Limit</span>
    <span style="${barStyle}"><img src="${cWeeklyBar}" align="center" /></span>
    <span style="${pctStyle}">${claudeGpt.weeklyPercent}%</span>
    <span style="${timeStyle}">${claudeGpt.weeklyResetText ? `(${claudeGpt.weeklyResetText})` : ''}</span>
  </div>
  ${render5hRow(claudeGpt, c5hBar)}
</div>

<hr style="margin:10px 0 4px 0; border:0; border-top:1px solid rgba(128,128,128,0.3);"/>
<div style="font-size:10px; color:#888; white-space:nowrap;">Updated ${snapshot.fetchedAt.toLocaleTimeString()} • Click to refresh</div>
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
