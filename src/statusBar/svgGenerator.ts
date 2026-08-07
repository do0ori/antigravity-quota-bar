export class SvgGenerator {
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
