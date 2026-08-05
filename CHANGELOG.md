# Change Log

All notable changes to the "Antigravity Group Quota Bar" extension will be documented in this file.

## [0.2.0] - 2026-08-05

### Added
- **Configurable Refresh Interval**: Added `antigravityQuota.refreshInterval` setting (10s to 300s, default 30s).
- **Smart Event-based Refresh**: Added `antigravityQuota.enableSmartRefresh` setting for debounced (3s) auto-refresh after editor code changes or saves.
- **Support Section**: Added PayPalMe donation link in documentation.

### Changed
- **Default Polling Interval**: Reduced default auto-polling interval from 60s to 30s for enhanced responsiveness.
- **Minimum Interval Guardrail**: Updated minimum refresh interval validation from 5s to 10s.

## [0.1.0] - 2026-08-04

### Added
- **Real-time Quota Monitoring**: Support for Gemini and Claude/GPT 4-group quota metrics (Weekly and 5-Hour Limits).
- **Status Bar Integration**: Minimalist, theme-adaptive status bar display with provider icons (`✨`, `🤖`).
- **Rich Hover Tooltip**: Pixel-perfect HTML grid layout rendering 100-percentage theme-transparent SVG progress bars.
- **Robust Language Server Probe**: Local win32 process and port scanner with CSRF token authentication (`x-codeium-csrf-token`).
- **Privacy First**: 100% local communication with zero external network requests or credential transmission.
- **Documentation**: Includes Korean (`README.ko.md`) and English documentation with GitHub badge navigation.
