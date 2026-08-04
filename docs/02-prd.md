# Antigravity Model Quota Status Bar PRD

## 문제 정의

현재 Antigravity IDE에서 Model Quota를 확인하기 위해서는 `Settings > Advanced Settings > Models` 메뉴로 깊게 진입해야 한다.
개발 작업 중 현재 남은 쿼터(Weekly, 5-Hour Limit)를 한눈에 파악하기 어렵고, 5시간 한도 초과 시 시점을 즉각 인지하기 힘들다.

## 목표

Antigravity IDE 하단 상태바(Status Bar)에 Gemini 및 Claude/GPT 모델 쿼터 4종의 수치(퍼센티지)를 즉각 보여주고, 마우스 오버 시 초기화 시간 정보(Tooltip)를 제공한다.

## 핵심 요구사항

### 1. 표시 데이터
- Gemini Models: Weekly Limit (%), 5-Hour Limit (%)
- Claude and GPT Models: Weekly Limit (%), 5-Hour Limit (%)

### 2. Status Bar UI
- 컴팩트한 형태: `G W:67% H:100% | C/G W:33% H:0%`
- 마우스 오버 툴팁: 그룹별 상세 쿼터 %, 리프레시까지 남은 시간, 갱신 시간 표시
- 경고 색상 표시: 쿼터 부족(20% 이하) 또는 5시간 limit 도달 시 색상 강조

### 3. 기능 범위
- 30초~60초 주기 자동 폴링
- 수동 새로고침 커맨드 제공 (`Antigravity Quota: Refresh`)
- 로컬 전용 처리 (외부 서버 전송 없음)
