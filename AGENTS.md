# Implementation Instructions for AI Agents

1. 전체 확장을 바로 구현하지 않고 `scripts/probe-quota.ts`로 로컬 Antigravity Quota API 접근부터 탐색/검증한다.
2. 4가지 Quota(Gemini Weekly/5h, Claude-GPT Weekly/5h)와 Reset time 조회가 정상 작동하는지 먼저 확인한다.
3. 검증된 API 통신부 로직을 `src/quota/` 서비스 모듈로 이식한다.
4. VS Code `StatusBarItem`을 이용해 UI를 완성한다.
5. 사용자 개인정보나 OAuth 토큰을 외부 서버로 전송하지 않는 로컬 통신만을 유지한다.
