# Antigravity Quota Data Source Feasibility

## 1. 목적

Antigravity IDE의 다음 4개 Model Quota 값을 확장 프로그램에서 안정적으로 조회할 수 있는지 검증한다.

1. Gemini Models / Weekly Limit
2. Gemini Models / Five Hour Limit
3. Claude and GPT Models / Weekly Limit
4. Claude and GPT Models / Five Hour Limit

각 항목에 대해 다음 데이터도 함께 확인한다.

- 현재 퍼센트 (잔여량 vs 사용량 의미 확인)
- 초기화 예정 시각 (Refresh Time)
- quota 제한 도달 여부 (Is Limited)
- 데이터가 마지막으로 갱신된 시각 (Timestamp)

## 2. 대상 환경

- Antigravity IDE 버전: 최신 (Windows 호환)
- 운영체제: Windows (PowerShell / Node.js)
- Extension Host 버전: VS Code 호환 API
- Node.js 버전: v18+

## 3. 데이터 접근 방식

### 방법 A. Antigravity 로컬 Language Server / Internal Service 탐색 (기본 접근 방식)

- Antigravity 프로세스 탐색 (`language_server`, `antigravity-agent` 등)
- 실행 포트 및 CSRF/AUTH 토큰 탐색 (`--http-port`, `--grpc-port`, token file)
- Quota API (gRPC-Web / HTTP JSON/Protobuf) 호출
- 요청 헤더 및 인증 처리
- 응답 payload 디코딩 및 Gemini / Claude-GPT 항목 분리

### 방법 B. 기존 Antigravity Panel / Community Toolkit 분석

- 참고: `n2ns/antigravity-panel` 오픈소스 분석
- Language Server 포트 탐색 알고리즘 (netstat / process args)
- protobuf / RPC payload 구조 파싱
- reset time 계산식 검증

## 4. 필드 매핑 및 검증 계획

| 화면 항목 | 파싱 대상 필드 | 단위 및 변환 규칙 |
| --- | --- | --- |
| Gemini Weekly | `gemini_weekly_remaining` | 퍼센티지 및 refresh timestamp 파싱 |
| Gemini Five Hour | `gemini_5h_remaining` | 퍼센티지 및 refresh timestamp 파싱 |
| Claude/GPT Weekly | `claude_gpt_weekly_remaining` | 퍼센티지 및 refresh timestamp 파싱 |
| Claude/GPT Five Hour | `claude_gpt_5h_remaining` | 퍼센티지 및 refresh timestamp 파싱 |

## 5. probe-quota.ts 검증 산출물

`scripts/probe-quota.ts`를 실행하여 4가지 Quota 및 Reset time이 제대로 출력되는지 확인한다.
