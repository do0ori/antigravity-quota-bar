# Antigravity Group Quota Bar (한국어)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![English README](https://img.shields.io/badge/Language-English-blue.svg)](https://github.com/do0ori/antigravity-quota-bar/blob/main/README.md)

Antigravity IDE의 **Gemini** 및 **Claude / GPT** 4가지 Group Quota(주간 및 5시간 한도) 상태를 하단 상태바에서 실시간으로 직관적으로 확인할 수 있는 초경량 확장 프로그램입니다.

![Antigravity Quota Preview](https://raw.githubusercontent.com/do0ori/antigravity-quota-bar/main/images/preview.jpg)

---

## ✨ 핵심 기능

- **정확한 4대 Group Quota 추적**: Antigravity IDE 설정(`Settings > Models`) 화면의 수치와 100% 동일하게 일치합니다.
  - Gemini Models: Weekly Limit + 5-Hour Limit
  - Claude and GPT models: Weekly Limit + 5-Hour Limit
- **미니멀 상태바 표시**: 자극적인 빨간색 전체 배경 대신, 현재 5시간 잔여 한도 %를 세련되게 표기합니다 (`✨ 78% │ 🤖 0%`).
- **호버 툴팁 칼정렬**: 상태바에 마우스를 올려놓으면 픽셀 단위로 완벽하게 수평 정렬된 100분율 SVG Progress Bar 툴팁이 나타납니다.
- **주간 한도 보존 파싱**: 5시간 한도에 먼저 도달하여 주간 한도가 일시 중단된 상태에서도 원래의 주간 한도 수치(예: 33%)를 0%로 오판하지 않고 정확히 디코딩합니다.
- **스마트 자동 갱신 & 자유로운 주기 설정**: 기본 30초 주기 자동 갱신 및 에디터 코드 수정/저장(AI 사용 시) 직후 스마트 자동 갱신 지원.
- **100% 프라이버시 & 로컬 실행**: 외부 서버 통신 0%! 오직 로컬 환경(`127.0.0.1`)의 Antigravity Language Server와만 통신하며, 어떠한 개인정보나 인증 토큰도 외부에 수집/전송하지 않습니다.

---

## ⚙️ 환경설정 옵션

| 설정 항목 | 타입 | 기본값 | 설명 |
| :--- | :--- | :--- | :--- |
| `antigravityQuota.refreshInterval` | `integer` | `30` | 자동 갱신 주기(초 단위, 최소 10초 ~ 최대 300초). |
| `antigravityQuota.enableSmartRefresh` | `boolean` | `true` | 코드 수정/저장 등 AI 사용 직후 스마트 자동 갱신 여부. |

---

## 🚀 설치 방법

### 방법 1: 마켓플레이스 검색 설치
VS Code 또는 Antigravity IDE 확장에 들어가서 **`Antigravity Group Quota Bar`** 검색 후 **설치** 클릭.

### 방법 2: VSIX 직접 설치
1. [Releases](https://github.com/do0ori/antigravity-quota-bar/releases)에서 `antigravity-quota-bar-0.1.0.vsix` 파일 다운로드.
2. IDE에서 `Ctrl + Shift + X` 눌러 확장 메뉴 열기.
3. 우측 상단 `...` (More Actions) ➔ **Install from VSIX...** 클릭 후 파일 선택.

---

## 🔒 개인정보 및 보안 정책

이 확장 프로그램은 오직 사용자 로컬 시스템의 `127.0.0.1` gRPC-Web 엔드포인트와만 통신합니다. 원격 추적 및 원격 의존성이 전혀 없는 100% 안심 안전 소프트웨어입니다.

## 💳 후원하기 (Support)

이 확장 프로그램이 유용하셨다면 개발자를 후원해 주세요!

[![Donate via PayPal](https://img.shields.io/badge/Donate-PayPal-blue.svg?logo=paypal)](https://www.paypal.com/paypalme/do0ori)

- **PayPal**: [paypal.me/do0ori](https://www.paypal.com/paypalme/do0ori)

---

## 📄 라이선스

[MIT License](LICENSE) © 2026 do0ori
