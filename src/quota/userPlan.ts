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
