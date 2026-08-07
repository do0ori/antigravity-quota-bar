export function renderTooltipFooter(planId: string | undefined, updatedAt: string): string {
  const planText = planId ? `Plan: ${planId} · ` : '';
  return `<em>${planText}Updated ${updatedAt}</em>`;
}
