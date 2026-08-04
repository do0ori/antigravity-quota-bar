import * as vscode from 'vscode';
import { ModelQuotaSnapshot } from '../quota/quotaTypes';
import { SvgGenerator } from './svgGenerator';

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

  /**
   * Return a circular ring progress character for the main Status Bar Item
   */
  private getCircleRing(percent: number): string {
    if (percent >= 88) return '●'; // fully filled
    if (percent >= 63) return '◕'; // 3/4 filled
    if (percent >= 38) return '◑'; // half filled
    if (percent >= 13) return '◔'; // 1/4 filled
    return '◯'; // empty ring
  }

  public update(snapshot: ModelQuotaSnapshot): void {
    if (!snapshot.isAvailable) {
      this.statusBarItem.text = `$(warning) Quota Offline`;
      this.statusBarItem.tooltip = `Antigravity Quota: Language Server offline`;
      this.statusBarItem.backgroundColor = undefined;
      return;
    }

    const { gemini, claudeGpt } = snapshot;

    // Circle Rings directly rendered in the main Status Bar Item!
    const gRingW = this.getCircleRing(gemini.weeklyPercent);
    const gRingH = this.getCircleRing(gemini.fiveHourPercent);

    const cRingW = this.getCircleRing(claudeGpt.weeklyPercent);
    const cRingH = this.getCircleRing(claudeGpt.fiveHourPercent);

    // Status Bar Text: Provider Logos + Circular Rings + Percentages
    this.statusBarItem.text = `$(sparkle) ${gRingW}${gemini.weeklyPercent}% ${gRingH}${gemini.fiveHourPercent}%  │  $(hubot) ${cRingW}${claudeGpt.weeklyPercent}% ${cRingH}${claudeGpt.fiveHourPercent}%`;

    // Seamless background blending (no harsh red background)
    this.statusBarItem.backgroundColor = undefined;

    // Hover Tooltip rendered with REAL SVG 100-Percentage Progress Bars!
    const tooltip = new vscode.MarkdownString();
    tooltip.isTrusted = true;
    tooltip.supportHtml = true;

    tooltip.appendMarkdown(`### ⚡ Antigravity Model Quota Status\n\n`);

    // Gemini Models Section with 100-percentage SVG Progress Bar
    const gWeeklyBar = SvgGenerator.createProgressBarSvgDataUri(gemini.weeklyPercent, 140, 10);
    const g5hBar = SvgGenerator.createProgressBarSvgDataUri(gemini.fiveHourPercent, 140, 10);

    tooltip.appendMarkdown(`#### ✨ Gemini Models\n`);
    tooltip.appendMarkdown(`- **Weekly Limit**: <img src="${gWeeklyBar}" align="center" /> **${gemini.weeklyPercent}%** ${gemini.weeklyResetText ? `*(Refreshes in ${gemini.weeklyResetText})*` : ''}\n\n`);
    tooltip.appendMarkdown(`- **5-Hour Limit**: <img src="${g5hBar}" align="center" /> **${gemini.fiveHourPercent}%** ${gemini.fiveHourResetText ? `*(Refreshes in ${gemini.fiveHourResetText})*` : ''}\n\n`);

    // Claude & GPT Models Section
    const cWeeklyBar = SvgGenerator.createProgressBarSvgDataUri(claudeGpt.weeklyPercent, 140, 10);
    const c5hBar = SvgGenerator.createProgressBarSvgDataUri(claudeGpt.fiveHourPercent, 140, 10);

    tooltip.appendMarkdown(`#### 🤖 Claude and GPT models\n`);
    tooltip.appendMarkdown(`- **Weekly Limit**: <img src="${cWeeklyBar}" align="center" /> **${claudeGpt.weeklyPercent}%** ${claudeGpt.weeklyResetText ? `*(Refreshes in ${claudeGpt.weeklyResetText})*` : ''}\n\n`);
    tooltip.appendMarkdown(`- **5-Hour Limit**: <img src="${c5hBar}" align="center" /> **${claudeGpt.fiveHourPercent}%** ${claudeGpt.fiveHourResetText ? `*(Refreshes in ${claudeGpt.fiveHourResetText})*` : ''}\n\n`);

    tooltip.appendMarkdown(`---\n*Updated ${snapshot.fetchedAt.toLocaleTimeString()} • Click status bar to refresh*`);

    this.statusBarItem.tooltip = tooltip;
  }

  public showLoading(): void {
    this.statusBarItem.text = `$(sync~spin) Updating Quota...`;
  }

  public dispose(): void {
    this.statusBarItem.dispose();
  }
}
