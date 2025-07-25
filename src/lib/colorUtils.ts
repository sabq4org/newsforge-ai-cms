/**
 * OKLCH Color Utilities for Sabq Althakiyah Theme System
 * Provides functions to work with OKLCH color space for better color handling
 */

export interface OKLCHColor {
  l: number; // lightness (0-1)
  c: number; // chroma (0-0.4)
  h: number; // hue (0-360)
}

/**
 * Parse OKLCH color string to components
 */
export function parseOKLCH(colorStr: string): OKLCHColor | null {
  const match = colorStr.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/);
  if (!match) return null;
  
  return {
    l: parseFloat(match[1]),
    c: parseFloat(match[2]),
    h: parseFloat(match[3])
  };
}

/**
 * Convert OKLCH components to string
 */
export function oklchToString(color: OKLCHColor): string {
  return `oklch(${color.l} ${color.c} ${color.h})`;
}

/**
 * Generate color variations for theme presets
 */
export function generateColorVariations(baseColor: OKLCHColor) {
  return {
    lighter: oklchToString({ ...baseColor, l: Math.min(1, baseColor.l + 0.15) }),
    darker: oklchToString({ ...baseColor, l: Math.max(0, baseColor.l - 0.15) }),
    muted: oklchToString({ ...baseColor, c: baseColor.c * 0.3, l: 0.9 }),
    foreground: oklchToString({ 
      l: baseColor.l < 0.5 ? 0.95 : 0.1, 
      c: 0, 
      h: 0 
    })
  };
}

/**
 * Check if a color provides sufficient contrast
 */
export function hasGoodContrast(color1: string, color2: string): boolean {
  // This is a simplified contrast check
  // In a real implementation, you'd convert to RGB and calculate luminance
  const c1 = parseOKLCH(color1);
  const c2 = parseOKLCH(color2);
  
  if (!c1 || !c2) return true; // fallback to true if parsing fails
  
  const lightnessDiff = Math.abs(c1.l - c2.l);
  return lightnessDiff >= 0.5; // WCAG AA requires ~4.5:1, this is simplified
}

/**
 * Generate a complete color palette from a primary color
 */
export function generatePaletteFromPrimary(primaryOklch: string) {
  const primary = parseOKLCH(primaryOklch);
  if (!primary) return null;

  const variations = generateColorVariations(primary);
  
  // Generate accent color (complementary hue)
  const accentHue = (primary.h + 180) % 360;
  const accent = {
    l: primary.l * 1.2,
    c: primary.c * 0.8,
    h: accentHue
  };

  // Generate secondary color (analogous hue)
  const secondaryHue = (primary.h + 30) % 360;
  const secondary = {
    l: 0.9,
    c: primary.c * 0.1,
    h: secondaryHue
  };

  return {
    primary: primaryOklch,
    primaryForeground: variations.foreground,
    accent: oklchToString(accent),
    accentForeground: variations.foreground,
    secondary: oklchToString(secondary),
    secondaryForeground: oklchToString({ l: 0.2, c: primary.c * 0.2, h: primary.h }),
    background: 'oklch(1 0 0)',
    foreground: 'oklch(0.15 0 0)',
    card: 'oklch(0.98 0 0)',
    cardForeground: 'oklch(0.15 0 0)',
    muted: variations.muted,
    mutedForeground: 'oklch(0.45 0 0)',
    border: 'oklch(0.9 0 0)',
    destructive: 'oklch(0.577 0.245 27.325)',
    destructiveForeground: 'oklch(1 0 0)',
  };
}

/**
 * Predefined color harmonies for quick theme generation
 */
export const colorHarmonies = {
  editorial: {
    name: 'تحريري',
    description: 'ألوان مناسبة للمحتوى التحريري',
    primary: 'oklch(0.25 0.08 250)', // Deep blue
    accent: 'oklch(0.65 0.15 45)', // Golden amber
  },
  business: {
    name: 'تجاري',
    description: 'ألوان احترافية للمحتوى التجاري',
    primary: 'oklch(0.2 0.1 280)', // Purple
    accent: 'oklch(0.7 0.2 50)', // Gold
  },
  modern: {
    name: 'عصري',
    description: 'ألوان عصرية وجذابة',
    primary: 'oklch(0.45 0.15 220)', // Ocean blue
    accent: 'oklch(0.6 0.18 180)', // Cyan
  },
  warm: {
    name: 'دافئ',
    description: 'ألوان دافئة ومريحة',
    primary: 'oklch(0.35 0.12 40)', // Warm brown
    accent: 'oklch(0.65 0.15 25)', // Orange
  }
};

/**
 * Validate color accessibility
 */
export function validateAccessibility(colors: Record<string, string>) {
  const issues: string[] = [];
  
  // Check critical color pairs
  const criticalPairs = [
    ['primary', 'primaryForeground'],
    ['secondary', 'secondaryForeground'],
    ['accent', 'accentForeground'],
    ['background', 'foreground'],
    ['card', 'cardForeground'],
    ['destructive', 'destructiveForeground']
  ];

  criticalPairs.forEach(([bg, fg]) => {
    if (colors[bg] && colors[fg] && !hasGoodContrast(colors[bg], colors[fg])) {
      issues.push(`التباين غير كافٍ بين ${bg} و ${fg}`);
    }
  });

  return {
    isValid: issues.length === 0,
    issues
  };
}

/**
 * Export theme as CSS custom properties
 */
export function exportThemeAsCSS(colors: Record<string, string>, settings: any) {
  const cssVars = Object.entries(colors)
    .map(([key, value]) => {
      const cssVar = '--' + key.replace(/([A-Z])/g, '-$1').toLowerCase();
      return `  ${cssVar}: ${value};`;
    })
    .join('\n');

  const designVars = `
  --radius: ${settings.radius}rem;
  --user-font-scale: ${settings.fontScale};
  --user-line-height-scale: ${settings.lineHeightScale};
  --user-letter-spacing: ${settings.letterSpacing}em;`;

  return `:root {\n${cssVars}${designVars}\n}`;
}