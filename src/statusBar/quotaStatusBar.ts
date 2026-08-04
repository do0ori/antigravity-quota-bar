import * as vscode from 'vscode';
import { ModelQuotaSnapshot } from '../quota/quotaTypes';

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
      this.statusBarItem.tooltip = `Antigravity Quota: Unable to connect to Language Server\nLast attempted: ${snapshot.fetchedAt.toLocaleTimeString()}`;
      this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
      return;
    }

    const { gemini, claudeGpt } = snapshot;

    // Icon logic & background status
    const isError = gemini.fiveHourPercent === 0 || claudeGpt.fiveHourPercent === 0;
    const isWarning = gemini.weeklyPercent <= 20 || claudeGpt.weeklyPercent <= 20 || gemini.fiveHourPercent <= 20 || claudeGpt.fiveHourPercent <= 20;

    const icon = isError ? '$(error)' : isWarning ? '$(warning)' : '$(sparkle)';
    
    // Status Bar Text Format
    this.statusBarItem.text = `${icon} G W:${gemini.weeklyPercent}% H:${gemini.fiveHourPercent}% │ C/G W:${claudeGpt.weeklyPercent}% H:${claudeGpt.fiveHourPercent}%`;

    // Background color
    if (isError) {
      this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
    } else if (isWarning) {
      this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.warningBackground');
    } else {
      this.statusBarItem.backgroundColor = undefined;
    }

    // Rich Markdown Tooltip
    const tooltip = new vscode.MarkdownString();
    tooltip.isTrusted = true;
    tooltip.appendMarkdown(`### Antigravity Model Quota Status\n\n`);

    tooltip.appendMarkdown(`**Gemini Models**\n`);
    tooltip.appendMarkdown(`- Weekly Limit: **${gemini.weeklyPercent}%** ${gemini.weeklyResetText ? `*(Refreshes in ${gemini.weeklyResetText})*` : ''}\n`);
    tooltip.appendMarkdown(`- 5-Hour Limit: **${gemini.fiveHourPercent}%** ${gemini.fiveHourResetText ? `*(Refreshes in ${gemini.fiveHourResetText})*` : ''}\n\n`);

    tooltip.appendMarkdown(`**Claude & GPT Models**\n`);
    tooltip.appendMarkdown(`- Weekly Limit: **${claudeGpt.weeklyPercent}%** ${claudeGpt.weeklyResetText ? `*(Refreshes in ${claudeGpt.weeklyResetText})*` : ''}\n`);
    tooltip.appendMarkdown(`- 5-Hour Limit: **${claudeGpt.fiveHourPercent}%** ${claudeGpt.fiveHourResetText ? `*(Refreshes in ${claudeGpt.fiveHourResetText})*` : ''}\n\n`);

    tooltip.appendMarkdown(`---\n*Last Updated: ${snapshot.fetchedAt.toLocaleTimeString()} (Click to Refresh)*`);

    this.statusBarItem.tooltip = tooltip;
  }

  public showLoading(): void {
    this.statusBarItem.text = `$(sync~spin) Quota...`;
  }

  public dispose(): void {
    this.statusBarItem.dispose();
  }
}
