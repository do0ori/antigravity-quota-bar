# Antigravity Group Quota Bar

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Korean README](https://img.shields.io/badge/Language-%ED%95%9C%EA%B5%AD%EC%96%B4-green.svg)](https://github.com/do0ori/antigravity-quota-bar/blob/main/README.ko.md)
[![Donate via PayPal](https://img.shields.io/badge/Donate-PayPal-blue.svg?logo=paypal)](https://www.paypal.com/paypalme/do0ori)

Monitor your **Gemini** and **Claude / GPT** 4-group weekly and 5-hour quotas directly in the VS Code / Antigravity IDE Status Bar.

<p align="center">
  <img src="https://raw.githubusercontent.com/do0ori/antigravity-quota-bar/main/images/antigravity-group-quota-bar-thumbnail.png" alt="Antigravity Group Quota Bar Thumbnail" />
</p>

## 📊 Demo

![Antigravity Quota Preview](https://raw.githubusercontent.com/do0ori/antigravity-quota-bar/main/images/preview.jpg)

---

## ✨ Features

- **Exact 4-Group Quota Tracking**: Matches the official Antigravity IDE Settings screen (`Gemini Weekly/5-Hour` + `Claude & GPT Weekly/5-Hour`) 100%.
- **Minimalist Status Bar Indicator**: Displays current 5-hour limit percentages in an elegant, non-distracting style (`✨ 78% │ 🤖 0%`).
- **Hover Tooltip**: Hovering over the status bar shows SVG quota progress bars, the raw local plan ID, and the refresh time.
- **Accurate Hit-Limit Parser**: Correctly parses weekly limits even when 5-hour limits are currently active (`You have hit your 5-hour limit, so the weekly limit does not currently apply`).
- **Configurable Auto-Polling & Smart Refresh**: Auto-refreshes every 30 seconds (configurable) and automatically updates right after you use AI models in the editor.
- **100% Private & Local**: Communicates strictly with your local Antigravity Language Server (`127.0.0.1`). Zero external data transmission.

---

## ⚙️ Extension Settings

| Setting | Type | Default | Description |
| :--- | :--- | :--- | :--- |
| `antigravityQuota.refreshInterval` | `integer` | `30` | Auto-refresh interval in seconds (min: 10, max: 300). |
| `antigravityQuota.enableSmartRefresh` | `boolean` | `true` | Smart refresh shortly after editor code edits or saves. |

---

## 🚀 Installation

### Option 1: Open VSX / Marketplace
Search for **`Antigravity Group Quota Bar`** in the Extensions view (`Ctrl + Shift + X`) and click **Install**.

### Option 2: Direct VSIX Install
1. Download the latest `antigravity-quota-bar-<version>.vsix` from Releases.
2. In VS Code / Antigravity IDE, press `Ctrl + Shift + X`.
3. Click `...` (More Actions) ➔ **Install from VSIX...** and select the file.

---

## 🔒 Privacy & Security

This extension runs completely offline relative to third-party servers. All gRPC-Web quota retrieval happens locally via `127.0.0.1` using locally authenticated CSRF tokens.

---

## 📄 License

[MIT License](LICENSE) © 2026 do0ori
