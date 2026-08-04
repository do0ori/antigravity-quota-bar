# Antigravity Model Quota Status Bar Indicator

A Lightweight VS Code / Antigravity IDE Extension that displays your current **Gemini** & **Claude/GPT** Model Quotas (Weekly & 5-Hour limits) directly in the Status Bar.

## Features

- 📊 **Status Bar Overview**: Displays `G W:67% H:100% │ C/G W:33% H:0%` right at your status bar.
- 💡 **Hover Breakdown**: Shows remaining percentages, reset time countdowns, and last update timestamp in Markdown.
- ⚡ **Auto-Polling & Manual Refresh**: Auto-updates every 60 seconds or via command `Antigravity Quota: Refresh`.
- 🛡️ **Strict Local Privacy**: Operates entirely locally with Antigravity Language Server, sending no data externally.

## Commands

- `Antigravity Quota: Refresh` (`antigravityQuota.refresh`): Instantly updates model quota metrics.

## Installation

1. Build VSIX package via `npx vsce package`.
2. Install in Antigravity / VS Code via Extensions menu > `Install from VSIX...`.
