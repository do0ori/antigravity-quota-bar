import * as vscode from 'vscode';
import { QuotaClient } from './quota/quotaClient';
import { QuotaStatusBar } from './statusBar/quotaStatusBar';

let pollingTimer: NodeJS.Timeout | undefined;
let smartDebounceTimer: NodeJS.Timeout | undefined;

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

  function getRefreshIntervalMs(): number {
    const config = vscode.workspace.getConfiguration('antigravityQuota');
    const seconds = config.get<number>('refreshInterval', 30);
    const validSeconds = Math.max(10, Math.min(300, seconds));
    return validSeconds * 1000;
  }

  function startPolling() {
    if (pollingTimer) {
      clearInterval(pollingTimer);
    }
    const intervalMs = getRefreshIntervalMs();
    pollingTimer = setInterval(updateQuota, intervalMs);
  }

  function triggerSmartRefresh() {
    const config = vscode.workspace.getConfiguration('antigravityQuota');
    const enableSmart = config.get<boolean>('enableSmartRefresh', true);
    if (!enableSmart) return;

    if (smartDebounceTimer) {
      clearTimeout(smartDebounceTimer);
    }
    smartDebounceTimer = setTimeout(() => {
      updateQuota();
    }, 3000);
  }

  // Initial update & start polling
  updateQuota();
  startPolling();

  // Listen for configuration changes
  const configListener = vscode.workspace.onDidChangeConfiguration((e) => {
    if (e.affectsConfiguration('antigravityQuota.refreshInterval')) {
      startPolling();
    }
  });

  // Listen for document changes (Smart Refresh after AI usage/editing)
  const docChangeListener = vscode.workspace.onDidChangeTextDocument((e) => {
    if (e.document.uri.scheme === 'file' || e.document.uri.scheme === 'untitled') {
      triggerSmartRefresh();
    }
  });

  // Register manual refresh command
  const refreshCommand = vscode.commands.registerCommand('antigravityQuota.refresh', async () => {
    statusBar.showLoading();
    await updateQuota();
    vscode.window.setStatusBarMessage('Antigravity Quota Refreshed', 2000);
  });

  context.subscriptions.push(statusBar, refreshCommand, configListener, docChangeListener);
}

export function deactivate() {
  if (pollingTimer) {
    clearInterval(pollingTimer);
  }
  if (smartDebounceTimer) {
    clearTimeout(smartDebounceTimer);
  }
}
