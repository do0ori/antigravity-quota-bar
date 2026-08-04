# Acceptance Tests Specification

## Acceptance Criteria

### 1. Probe & Quota Fetching
- [ ] `scripts/probe-quota.ts` 실행 시 Antigravity Language Server 포트를 감지한다.
- [ ] Gemini (Weekly, 5-Hour) 및 Claude/GPT (Weekly, 5-Hour) 퍼센티지가 추출된다.
- [ ] Refresh time(초기화까지 남은 시간)이 존재할 경우 파싱된다.

### 2. Status Bar UI
- [ ] Extension 활성화 시 하단 Status Bar에 Quota 요약 정보가 표시된다.
- [ ] Hover 툴팁에 4개 요인의 상세 %와 초기화 시간이 표기된다.
- [ ] Command Palette에서 `Antigravity Quota: Refresh` 실행 시 즉시 새로고침된다.
