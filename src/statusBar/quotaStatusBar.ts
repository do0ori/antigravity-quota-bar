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

    // Status Bar Item: Show 5-Hour Limit % only (Gemini $(sparkle), Claude/GPT $(hubot))
    this.statusBarItem.text = `$(sparkle) ${gemini.fiveHourPercent}%  │  $(hubot) ${claudeGpt.fiveHourPercent}%`;

    // Seamless background blending
    this.statusBarItem.backgroundColor = undefined;

    // Compact, tight-gap HTML table for pixel-perfect hover tooltip alignment
    const tooltip = new vscode.MarkdownString();
    tooltip.isTrusted = true;
    tooltip.supportHtml = true;

    // Gemini Models Section (Compact Bar width 110)
    const gWeeklyBar = SvgGenerator.createProgressBarSvgDataUri(gemini.weeklyPercent, 110, 8);
    const g5hBar = SvgGenerator.createProgressBarSvgDataUri(gemini.fiveHourPercent, 110, 8);

    // Claude & GPT Models Section
    const cWeeklyBar = SvgGenerator.createProgressBarSvgDataUri(claudeGpt.weeklyPercent, 110, 8);
    const c5hBar = SvgGenerator.createProgressBarSvgDataUri(claudeGpt.fiveHourPercent, 110, 8);

    const htmlContent = `
<h4 style="margin:0 0 4px 0;">✨ Gemini Models</h4>
<table border="0" cellpadding="1" cellspacing="0" style="margin-bottom:8px;">
  <tr>
    <td width="92"><b>Weekly Limit</b></td>
    <td><img src="${gWeeklyBar}" align="center" /></td>
    <td width="36" align="right"><b>${gemini.weeklyPercent}%</b></td>
    <td style="color:#888; padding-left:6px;"><i>${gemini.weeklyResetText ? `(${gemini.weeklyResetText})` : ''}</i></td>
  </tr>
  <tr>
    <td width="92"><b>5-Hour Limit</b></td>
    <td><img src="${g5hBar}" align="center" /></td>
    <td width="36" align="right"><b>${gemini.fiveHourPercent}%</b></td>
    <td style="color:#888; padding-left:6px;"><i>${gemini.fiveHourResetText ? `(${gemini.fiveHourResetText})` : ''}</i></td>
  </tr>
</table>

<h4 style="margin:8px 0 4px 0;">🤖 Claude and GPT models</h4>
<table border="0" cellpadding="1" cellspacing="0">
  <tr>
    <td width="92"><b>Weekly Limit</b></td>
    <td><img src="${cWeeklyBar}" align="center" /></td>
    <td width="36" align="right"><b>${claudeGpt.weeklyPercent}%</b></td>
    <td style="color:#888; padding-left:6px;"><i>${claudeWeeklyResetText(claudeGpt.weeklyResetText)}</i></td>
  </tr>
  <tr>
    <td width="92"><b>5-Hour Limit</b></td>
    <td><img src="${c5hBar}" align="center" /></td>
    <td width="36" align="right"><b>${claudeGpt.fiveHourPercent}%</b></td>
    <td style="color:#888; padding-left:6px;"><i>${claudeGpt.fiveHourResetText ? `(${claudeGpt.fiveHourResetText})` : ''}</i></td>
  </tr>
</table>

<hr style="margin:8px 0 4px 0; border:0; border-top:1px solid #3c3c3c;"/>
<div style="font-size:10px; color:#888;">Updated ${snapshot.fetchedAt.toLocaleTimeString()} • Click to refresh</div>
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

function claudeWeeklyResetText(text?: string): string {
  if (!text) return '';
  return `(${text})`;
}
