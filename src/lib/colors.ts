/**
 * Centralized Color System for Gameshop Enter
 * Maintains brand consistency and WCAG AA compliance
 */

export const COLORS = {
  // Primary palette
  primary: {
    emerald: '#10b981',
    emeraldLight: '#d1fae5',
    emeraldDark: '#059669',
  },

  // Secondary palette
  secondary: {
    teal: '#14b8a6',
    cyan: '#0ea5e9',
    purple: '#a855f7',
    purple200: '#e9d5ff',
  },

  // Accent palette
  accent: {
    amber: '#f59e0b',
    orange: '#f97316',
  },

  // Semantic colors
  semantic: {
    success: '#10b981', // Emerald
    warning: '#f59e0b', // Amber
    danger: '#ef4444', // Red
    info: '#0ea5e9', // Cyan
  },

  // Neutral palette (grayscale)
  neutral: {
    white: '#ffffff',
    light: '#f8fafc', // slate-50
    lightGray: '#f1f5f9', // slate-100
    mediumLight: '#e2e8f0', // slate-200
    medium: '#cbd5e1', // slate-300
    mediumDark: '#94a3b8', // slate-400
    dark: '#475569', // slate-700
    darker: '#1e293b', // slate-800
    darkest: '#0f172a', // slate-900
  },

  // Backgrounds
  background: {
    light: '#ffffff',
    lightWithAlpha: 'rgba(255, 255, 255, 0.05)',
    dark: '#050810',
    darkWithGradient: '#0a1628',
  },

  // Text colors
  text: {
    primary: '#0f172a', // slate-900
    secondary: '#475569', // slate-700
    tertiary: '#94a3b8', // slate-400
    light: '#e2e8f0', // slate-200
    lighter: '#f1f5f9', // slate-100
    white: '#ffffff',
    muted: 'rgba(255, 255, 255, 0.5)',
    mutedLight: 'rgba(0, 0, 0, 0.5)',
  },

  // Borders
  border: {
    light: '#e2e8f0', // slate-200
    medium: '#cbd5e1', // slate-300
    dark: '#475569', // slate-700
  },
} as const;

/**
 * Color semantic tokens for consistent usage
 */
export const COLOR_TOKENS = {
  // Button states
  button: {
    primary: {
      bg: COLORS.neutral.white,
      text: COLORS.text.primary,
      hover: 'rgba(255, 255, 255, 0.95)',
      active: 'rgba(255, 255, 255, 0.9)',
    },
    secondary: {
      bg: 'rgba(255, 255, 255, 0.08)',
      text: COLORS.text.light,
      hover: 'rgba(255, 255, 255, 0.12)',
      active: 'rgba(255, 255, 255, 0.15)',
    },
  },

  // Card/container shadows
  shadow: {
    light: '0 1px 3px rgba(0,0,0,0.04), 0 4px 12px rgba(0,0,0,0.02)',
    medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
    large: '0 25px 60px -12px rgba(0,0,0,0.2)',
  },

  // Glows
  glow: {
    emerald: `rgb(16, 185, 129)`,
    cyan: `rgb(14, 165, 233)`,
    teal: `rgb(20, 184, 166)`,
    purple: `rgb(168, 85, 247)`,
  },
} as const;

/**
 * Process step colors (for ProcessTimeline and similar sequences)
 */
export const PROCESS_COLORS = [
  {
    title: 'Inkoop',
    accent: '#10b981', // Emerald
    glowRgb: '16, 185, 129',
  },
  {
    title: 'Testen',
    accent: '#0ea5e9', // Cyan
    glowRgb: '14, 165, 233',
  },
  {
    title: 'Catalogiseren',
    accent: '#a855f7', // Purple
    glowRgb: '168, 85, 247',
  },
  {
    title: 'Verzenden',
    accent: '#f59e0b', // Amber
    glowRgb: '245, 158, 11',
  },
] as const;

/**
 * Utility function to get contrast-safe color combinations
 */
export function getContrastColor(bgColor: string): string {
  // Simplified: return dark text for light backgrounds, light text for dark backgrounds
  const lightBackgrounds = [COLORS.neutral.white, COLORS.background.light, '#f8fafc'];
  return lightBackgrounds.includes(bgColor) ? COLORS.text.primary : COLORS.text.white;
}

/**
 * Add opacity to hex color
 */
export function colorWithOpacity(hexColor: string, opacity: number): string {
  // Parse hex and convert to RGB, then apply opacity
  const hex = hexColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
