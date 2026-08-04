# Technical Design Document

## 시스템 구조

```text
src/
├── extension.ts                # Extension Entrypoint
├── quota/
│   ├── languageServerDiscovery.ts  # Antigravity 로컬 LS 포트 및 프로세스 감지
│   ├── quotaClient.ts              # Quota Fetcher & Polling Manager
│   ├── quotaTypes.ts               # Quota 데이터 구조 정의
│   └── quotaDecoder.ts             # gRPC / JSON response parsing
├── statusBar/
│   ├── quotaStatusBar.ts           # VS Code StatusBarItem 관리
│   └── quotaFormatter.ts           # 상태바 텍스트 & Tooltip 마크다운 포맷팅
└── commands/
    └── refreshQuota.ts             # 수동 새로고침 커맨드
```

## Data Types (`src/quota/quotaTypes.ts`)

```typescript
export interface QuotaInfo {
  weeklyPercent: number;
  weeklyResetTime?: string;
  fiveHourPercent: number;
  fiveHourResetTime?: string;
}

export interface ModelQuotaSnapshot {
  gemini: QuotaInfo;
  claudeGpt: QuotaInfo;
  fetchedAt: Date;
  isAvailable: boolean;
  errorMessage?: string;
}
```
