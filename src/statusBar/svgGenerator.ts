export class SvgGenerator {
  /**
   * Generate Data URI for SVG Circular Progress Ring
   */
  public static createCircleRingSvgDataUri(percent: number, size = 20): string {
    const clampedPct = Math.max(0, Math.min(100, percent));
    
    let strokeColor = '#34D399'; // Emerald Green
    if (clampedPct <= 20) {
      strokeColor = '#EF4444'; // Red
    } else if (clampedPct <= 50) {
      strokeColor = '#F59E0B'; // Amber
    }

    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 36 36">
      <path stroke="rgba(128, 128, 128, 0.3)" stroke-width="4.5" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
      <path stroke="${strokeColor}" stroke-width="4.5" stroke-dasharray="${clampedPct}, 100" stroke-linecap="round" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
    </svg>`;

    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }

  /**
   * Generate Horizontal SVG Progress Bar (Theme-adaptive transparent background)
   */
  public static createProgressBarSvgDataUri(percent: number, width = 110, height = 8): string {
    const clampedPct = Math.max(0, Math.min(100, percent));
    const fillWidth = Math.max(0, (clampedPct / 100) * width);

    let fillColor = '#10B981'; // Green
    if (clampedPct <= 20) fillColor = '#EF4444'; // Red
    else if (clampedPct <= 50) fillColor = '#F59E0B'; // Amber

    // Background track uses semi-transparent gray (rgba) for Dark & Light Theme compatibility
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <rect width="${width}" height="${height}" rx="${height / 2}" fill="rgba(128, 128, 128, 0.25)"/>
      <rect width="${fillWidth}" height="${height}" rx="${height / 2}" fill="${fillColor}"/>
    </svg>`;

    const base64 = Buffer.from(svg).toString('base64');
    return `data:image/svg+xml;base64,${base64}`;
  }
}
