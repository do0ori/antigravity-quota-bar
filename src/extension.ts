import * as vscode from 'vscode';
import { QuotaClient } from './quota/quotaClient';
import { QuotaStatusBar } from './statusBar/quotaStatusBar';

let pollingTimer: NodeJS.Timeout | undefined;

export function activate(context: vscode.ExtensionContext) {
  console.log('Antigravity Model Quota extension activated.');

  const quotaClient = new QuotaClient();
  const statusBar = new QuotaStatusBar(context.extensionPath);

  async function updateQuota() {
    try {
      const snapshot = await quotaClient.fetchQuotaSnapshot();
      statusBar.update(snapshot);
    } catch (e) {
      console.error('Error updating quota:', e);
    }
  }

  // Initial update
  updateQuota();

  // 60 seconds auto-polling
  pollingTimer = setInterval(updateQuota, 60000);

  // Register manual refresh command
  const refreshCommand = vscode.commands.registerCommand('antigravityQuota.refresh', async () => {
    statusBar.showLoading();
    await updateQuota();
    vscode.window.setStatusBarMessage('Antigravity Quota Refreshed', 2000);
  });

  context.subscriptions.push(statusBar, refreshCommand);
}

export function deactivate() {
  if (pollingTimer) {
    clearInterval(pollingTimer);
  }
}
