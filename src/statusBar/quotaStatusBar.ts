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

    // Hover Tooltip using HTML <table> for pixel-perfect progress bar alignment
    const tooltip = new vscode.MarkdownString();
    tooltip.isTrusted = true;
    tooltip.supportHtml = true;

    // Gemini Models Section
    const gWeeklyBar = SvgGenerator.createProgressBarSvgDataUri(gemini.weeklyPercent, 130, 10);
    const g5hBar = SvgGenerator.createProgressBarSvgDataUri(gemini.fiveHourPercent, 130, 10);

    // Claude & GPT Models Section
    const cWeeklyBar = SvgGenerator.createProgressBarSvgDataUri(claudeGpt.weeklyPercent, 130, 10);
    const c5hBar = SvgGenerator.createProgressBarSvgDataUri(claudeGpt.fiveHourPercent, 130, 10);

    const htmlContent = `
<h3>✨ Gemini Models</h3>
<table border="0" cellpadding="3" cellspacing="0">
  <tr>
    <td width="110"><b>Weekly Limit</b></td>
    <td><img src="${gWeeklyBar}" align="center" /></td>
    <td width="40" align="right"><b>${gemini.weeklyPercent}%</b></td>
    <td style="color:#888;"><i>${gemini.weeklyResetText ? `(Refreshes in ${gemini.weeklyResetText})` : ''}</i></td>
  </tr>
  <tr>
    <td width="110"><b>5-Hour Limit</b></td>
    <td><img src="${g5hBar}" align="center" /></td>
    <td width="40" align="right"><b>${gemini.fiveHourPercent}%</b></td>
    <td style="color:#888;"><i>${gemini.fiveHourResetText ? `(Refreshes in ${gemini.fiveHourResetText})` : ''}</i></td>
  </tr>
</table>

<br/>

<h3>🤖 Claude and GPT models</h3>
<table border="0" cellpadding="3" cellspacing="0">
  <tr>
    <td width="110"><b>Weekly Limit</b></td>
    <td><img src="${cWeeklyBar}" align="center" /></td>
    <td width="40" align="right"><b>${claudeGpt.weeklyPercent}%</b></td>
    <td style="color:#888;"><i>${claudeGpt.weeklyResetText ? `(Refreshes in ${claudeGpt.weeklyResetText})` : ''}</i></td>
  </tr>
  <tr>
    <td width="110"><b>5-Hour Limit</b></td>
    <td><img src="${c5hBar}" align="center" /></td>
    <td width="40" align="right"><b>${claudeGpt.fiveHourPercent}%</b></td>
    <td style="color:#888;"><i>${claudeGpt.fiveHourResetText ? `(Refreshes in ${claudeGpt.fiveHourResetText})` : ''}</i></td>
  </tr>
</table>

<hr/>
<div style="font-size:11px; color:#888;">Updated ${snapshot.fetchedAt.toLocaleTimeString()} • Click status bar to refresh</div>
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
