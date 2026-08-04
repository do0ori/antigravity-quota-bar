# Status Bar UX Specification

## 상태바 기본 표기 규칙

### Compact Format (기본값)
`G W67 H100 │ C/G W33 H0`

- `G`: Gemini Models
- `C/G`: Claude & GPT Models
- `W`: Weekly Limit (%)
- `H`: 5-Hour Limit (%)

## 마우스 오버 툴팁 (Hover Details)

```text
Antigravity Model Quota Status

Gemini Models
- Weekly Limit: 67% (Refreshes in 6d 13h)
- 5-Hour Limit: 100% (Fully Refreshed)

Claude & GPT Models
- Weekly Limit: 33%
- 5-Hour Limit: 0% ⚠️ (Refreshes in 1h 37m)

Last Updated: 20:44:00
```

## 상태별 상태바 UI 변화

1. **정상 상태**: 기본 아이콘 `$(sparkle)` 및 일반 텍스트
2. **경고 (Limit < 20%)**: `$(warning)` 아이콘 및 주황색 경고
3. **한도 도달 (Limit = 0%)**: `$(error)` 아이콘 및 빨간색 강조
4. **로딩 중**: `$(sync~spin) Quota...`
5. **연결 실패 / 서버 미감지**: `$(warning) Quota Offline`
