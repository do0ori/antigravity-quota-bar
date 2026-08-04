# Antigravity Group Quota Bar

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Korean README](https://img.shields.io/badge/Language-%ED%95%9C%EA%B5%AD%EC%96%B4-green.svg)](https://github.com/do0ori/antigravity-quota-bar/blob/main/README.ko.md)

Monitor your **Gemini** and **Claude / GPT** 4-group weekly and 5-hour quotas directly in the VS Code / Antigravity IDE Status Bar.

![Antigravity Quota Preview](https://raw.githubusercontent.com/do0ori/antigravity-quota-bar/main/images/preview.jpg)

---

## ✨ Features

- **Exact 4-Group Quota Tracking**: Matches the official Antigravity IDE Settings screen (`Gemini Weekly/5-Hour` + `Claude & GPT Weekly/5-Hour`) 100%.
- **Minimalist Status Bar Indicator**: Displays current 5-hour limit percentages in an elegant, non-distracting style (`✨ 78% │ 🤖 0%`).
- **Pixel-Perfect Hover Tooltip**: Hovering over the status bar opens a theme-adaptive HTML grid with 100-percentage SVG progress bars.
- **Accurate Hit-Limit Parser**: Correctly parses weekly limits even when 5-hour limits are currently active (`You have hit your 5-hour limit, so the weekly limit does not currently apply`).
- **100% Private & Local**: Communicates strictly with your local Antigravity Language Server (`127.0.0.1`). Zero external data transmission.

---

## 🚀 Installation

### Option 1: Open VSX / Marketplace
Search for **`Antigravity Group Quota Bar`** in the Extensions view (`Ctrl + Shift + X`) and click **Install**.

### Option 2: Direct VSIX Install
1. Download `antigravity-quota-bar-0.1.0.vsix` from Releases.
2. In VS Code / Antigravity IDE, press `Ctrl + Shift + X`.
3. Click `...` (More Actions) ➔ **Install from VSIX...** and select the file.

---

## 🔒 Privacy & Security

This extension runs completely offline relative to third-party servers. All gRPC-Web quota retrieval happens locally via `127.0.0.1` using locally authenticated CSRF tokens.

---

## 📄 License

[MIT License](LICENSE) © 2026 do0ori
