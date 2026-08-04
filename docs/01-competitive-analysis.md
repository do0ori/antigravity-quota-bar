# Competitive Analysis & Strategic Positioning

## Market Landscape

Open VSX 및 VS Code Marketplace에는 Antigravity Quota 관련 기존 확장들이 존재합니다:
- **Antigravity Panel**: 종합 대시보드, 캐시 모니터링, 그래프 등 복잡한 UI 제공.
- **Antigravity Quota Simple**: 기본 할당량 표시.
- **Antigravity Status**: 모델별 쿼터 상태바 표시.

## Our Core Differentiators (차별화 포인트)

1. **최신 Group Quota 구조 100% 반영**:
   - 단일 모델별 조회가 아닌, 최신 Antigravity IDE 설정 화면과 100% 동일한 4대 Group Quota 구조 반영:
     - Gemini (Weekly Limit + 5-Hour Limit)
     - Claude & GPT (Weekly Limit + 5-Hour Limit)
2. **초경량 및 직관적 UX**:
   - 무거운 대시보드 없이 상태바만 사용하는 초경량 footprint (`✨ 78% │ 🤖 0%`).
   - 마우스 호버 시 픽셀 단위로 칼정렬된 테마 호환 SVG Progress Bar 렌더링.
3. **5시간 Limit 걸림 상태의 주간 한도 보존 파싱**:
   - 5시간 한도에 도달해 주간 한도가 일시 중단된 상태에서도 주간 한도 잔여량(예: 33%)을 잘못 0%로 판단하지 않고 정확히 파싱.
4. **100% 프라이버시 보장**:
   - 외부 서버 통신 0%, 오직 로컬 `127.0.0.1` gRPC-Web 통신만 수행.
