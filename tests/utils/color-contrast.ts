/**
 * Color Contrast Calculation Utilities
 * 
 * Implements WCAG 2.1 color contrast calculations for accessibility testing.
 * Based on the WCAG 2.1 specification for relative luminance and contrast ratios.
 */

export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface HSL {
  h: number;
  s: number;
  l: number;
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
  };
}

/**
 * Convert HSL to RGB
 */
export function hslToRgb(hsl: HSL): RGB {
  const { h, s, l } = hsl;
  const hNorm = h / 360;
  const sNorm = s / 100;
  const lNorm = l / 100;

  const c = (1 - Math.abs(2 * lNorm - 1)) * sNorm;
  const x = c * (1 - Math.abs((hNorm * 6) % 2 - 1));
  const m = lNorm - c / 2;

  let r = 0, g = 0, b = 0;

  if (0 <= hNorm && hNorm < 1/6) {
    r = c; g = x; b = 0;
  } else if (1/6 <= hNorm && hNorm < 2/6) {
    r = x; g = c; b = 0;
  } else if (2/6 <= hNorm && hNorm < 3/6) {
    r = 0; g = c; b = x;
  } else if (3/6 <= hNorm && hNorm < 4/6) {
    r = 0; g = x; b = c;
  } else if (4/6 <= hNorm && hNorm < 5/6) {
    r = x; g = 0; b = c;
  } else if (5/6 <= hNorm && hNorm < 1) {
    r = c; g = 0; b = x;
  }

  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
  };
}

/**
 * Calculate relative luminance according to WCAG 2.1
 * https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
 */
export function getRelativeLuminance(rgb: RGB): number {
  const { r, g, b } = rgb;
  
  // Convert to sRGB
  const rsRGB = r / 255;
  const gsRGB = g / 255;
  const bsRGB = b / 255;

  // Apply gamma correction
  const rLinear = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const gLinear = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const bLinear = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  // Calculate luminance using WCAG formula
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
}

/**
 * Calculate contrast ratio between two colors according to WCAG 2.1
 * Returns a value between 1 (no contrast) and 21 (maximum contrast)
 */
export function calculateContrastRatio(color1: RGB, color2: RGB): number {
  const luminance1 = getRelativeLuminance(color1);
  const luminance2 = getRelativeLuminance(color2);

  // Ensure the lighter color is the numerator
  const lighter = Math.max(luminance1, luminance2);
  const darker = Math.min(luminance1, luminance2);

  // WCAG contrast ratio formula: (L1 + 0.05) / (L2 + 0.05)
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if a color combination meets WCAG AA standards
 */
export function meetsWCAGAA(foreground: RGB, background: RGB, isLargeText: boolean = false): {
  passes: boolean;
  ratio: number;
  required: number;
} {
  const ratio = calculateContrastRatio(foreground, background);
  const required = isLargeText ? 3.0 : 4.5;
  
  return {
    passes: ratio >= required,
    ratio: Math.round(ratio * 100) / 100,
    required,
  };
}

/**
 * Check if a color combination meets WCAG AAA standards
 */
export function meetsWCAGAAA(foreground: RGB, background: RGB, isLargeText: boolean = false): {
  passes: boolean;
  ratio: number;
  required: number;
} {
  const ratio = calculateContrastRatio(foreground, background);
  const required = isLargeText ? 4.5 : 7.0;
  
  return {
    passes: ratio >= required,
    ratio: Math.round(ratio * 100) / 100,
    required,
  };
}

/**
 * Generate a comprehensive contrast report for a color palette
 */
export function generateContrastReport(colors: Record<string, string>): {
  [combination: string]: {
    ratio: number;
    passesAA: boolean;
    passesAAA: boolean;
    passeALargeText: boolean;
    passesAAAALargeText: boolean;
  };
} {
  const report: any = {};
  const colorEntries = Object.entries(colors);

  for (let i = 0; i < colorEntries.length; i++) {
    for (let j = i + 1; j < colorEntries.length; j++) {
      const [name1, hex1] = colorEntries[i];
      const [name2, hex2] = colorEntries[j];
      
      try {
        const color1 = hexToRgb(hex1);
        const color2 = hexToRgb(hex2);
        const ratio = calculateContrastRatio(color1, color2);

        const combination = `${name1} on ${name2}`;
        report[combination] = {
          ratio: Math.round(ratio * 100) / 100,
          passesAA: ratio >= 4.5,
          passesAAA: ratio >= 7.0,
          passesAALargeText: ratio >= 3.0,
          passesAAAALargeText: ratio >= 4.5,
        };
      } catch (error) {
        console.warn(`Could not calculate contrast for ${name1} (${hex1}) and ${name2} (${hex2}):`, error);
      }
    }
  }

  return report;
}

/**
 * Find the best text color (black or white) for a given background
 */
export function getBestTextColor(background: RGB): { color: RGB; type: 'dark' | 'light'; ratio: number } {
  const white = { r: 255, g: 255, b: 255 };
  const black = { r: 0, g: 0, b: 0 };

  const whiteRatio = calculateContrastRatio(white, background);
  const blackRatio = calculateContrastRatio(black, background);

  return whiteRatio > blackRatio 
    ? { color: white, type: 'light', ratio: Math.round(whiteRatio * 100) / 100 }
    : { color: black, type: 'dark', ratio: Math.round(blackRatio * 100) / 100 };
}

/**
 * Validate that a color meets minimum contrast requirements for interactive elements
 * WCAG requires 3:1 for non-text UI components
 */
export function validateInteractiveElementContrast(element: RGB, background: RGB): {
  passes: boolean;
  ratio: number;
  recommendation: string;
} {
  const ratio = calculateContrastRatio(element, background);
  const passes = ratio >= 3.0;

  let recommendation = '';
  if (!passes) {
    if (ratio < 2.0) {
      recommendation = 'Critical: Element is barely visible. Increase contrast significantly.';
    } else if (ratio < 2.5) {
      recommendation = 'Poor: Element may be difficult to distinguish. Increase contrast.';
    } else {
      recommendation = 'Marginal: Consider increasing contrast for better accessibility.';
    }
  } else if (ratio >= 4.5) {
    recommendation = 'Excellent: High contrast provides great accessibility.';
  } else {
    recommendation = 'Good: Meets minimum requirements for interactive elements.';
  }

  return {
    passes,
    ratio: Math.round(ratio * 100) / 100,
    recommendation,
  };
}