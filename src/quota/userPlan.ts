const PLAN_REFRESH_INTERVAL_MS = 5 * 60 * 1000;

/**
 * Extract the raw user plan identifier exposed by GetUserStatus.
 * Examples: "free-tier", "g1-pro-tier".
 */
export function extractPlanId(buf: Buffer): string | undefined {
  const strings = buf.toString('utf8').match(/[\x20-\x7E]{3,}/g) ?? [];
  const planIds = strings
    .map((value) => value.trim())
    .filter((value) => /^[a-z0-9]+(?:-[a-z0-9]+)*-tier$/i.test(value));

  return planIds.length === 1 ? planIds[0] : undefined;
}

export function shouldRefreshPlan(lastFetchedAt: number | undefined, now: number, force = false): boolean {
  return force || lastFetchedAt === undefined || now - lastFetchedAt >= PLAN_REFRESH_INTERVAL_MS;
}

export function resolvePlanIdFromResponse(cachedPlanId: string | undefined, response: Buffer | null): string | undefined {
  return response === null ? cachedPlanId : extractPlanId(response);
}
