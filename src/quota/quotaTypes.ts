export interface QuotaMetric {
  weeklyPercent: number;       // 0 - 100
  weeklyResetText?: string;    // e.g. "6d 13h"
  fiveHourPercent: number;     // 0 - 100
  fiveHourResetText?: string;  // e.g. "1h 37m"
}

export interface ModelQuotaSnapshot {
  gemini: QuotaMetric;
  claudeGpt: QuotaMetric;
  fetchedAt: Date;
  isAvailable: boolean;
  errorMessage?: string;
}
