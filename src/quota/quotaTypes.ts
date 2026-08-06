export interface QuotaMetric {
  weeklyPercent: number;       // 0 - 100
  weeklyResetText?: string;    // e.g. "6d 13h"
  hasWeeklyLimit: boolean;     // true if weekly limit exists
  fiveHourPercent?: number;    // 0 - 100 (undefined if no 5-hour limit exists)
  fiveHourResetText?: string;  // e.g. "1h 37m"
  hasFiveHourLimit: boolean;   // true if 5-hour limit exists
}

export interface ModelQuotaSnapshot {
  gemini: QuotaMetric;
  claudeGpt: QuotaMetric;
  fetchedAt: Date;
  isAvailable: boolean;
  errorMessage?: string;
}
