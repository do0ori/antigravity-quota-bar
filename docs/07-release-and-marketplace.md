# Release and Marketplace Specification

## Distribution Strategy & Targets

1. **Open VSX Registry** (1st Priority for Antigravity IDE Users)
2. **Visual Studio Marketplace** (2nd Priority for VS Code Users)
3. **GitHub Releases** (Direct VSIX Download)

## Release Prerequisites Checklist

- [x] All build & compilation tests pass (`npm run compile`).
- [x] 4-group quota metrics match Antigravity IDE Settings screen 100%.
- [x] Zero external network requests (100% local `127.0.0.1` communication).
- [x] No sensitive tokens or credentials logged.
- [x] License file (`LICENSE`) included.
- [x] Changelog (`CHANGELOG.md`) included.
- [x] Privacy policy (`PRIVACY.md`) included.
- [x] Security policy (`SECURITY.md`) included.
- [x] Marketplace icon (128x128 PNG) prepared.
- [x] `.vscodeignore` configured properly.

## Extension Identifier
`do0ori.antigravity-quota-bar`

## Marketplace Build & Publish Commands

```bash
# 1. Compile TypeScript
npm run compile

# 2. Package VSIX
npx vsce package

# 3. Publish to Open VSX
npx ovsx publish -p $OVSX_PAT

# 4. Publish to VS Code Marketplace
npx vsce publish -p $VSCE_PAT
```
