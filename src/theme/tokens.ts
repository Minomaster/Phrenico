import type { TextStyle } from 'react-native';

import { blue, navy, signal } from './palette';

export type ColorScheme = 'light' | 'dark';

export interface ThemeColors {
  /** Page background. White in light mode. */
  background: string;
  /** Cards, grouped rows and fold-out boxes. */
  surface: string;
  /** Chips, selected states, filled input fields. */
  surfaceAlt: string;
  border: string;
  /** Boundary of input fields (≥ 3:1 against the background). */
  inputBorder: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  primary: string;
  primaryPressed: string;
  onPrimary: string;
  /** The result box on formula pages. */
  resultSurface: string;
  resultBorder: string;
  resultText: string;
  danger: string;
  dangerSurface: string;
  warning: string;
  warningSurface: string;
  tabInactive: string;
  overlay: string;
}

export const lightColors: ThemeColors = {
  background: signal.white,
  surface: blue[50],
  surfaceAlt: blue[100],
  border: '#D3E1F2',
  inputBorder: blue[400],
  text: blue[950],
  textSecondary: '#3F5677',
  textMuted: '#54698A',
  primary: blue[600],
  primaryPressed: blue[700],
  onPrimary: signal.white,
  resultSurface: '#EAF2FC',
  resultBorder: blue[300],
  resultText: blue[900],
  danger: signal.red,
  dangerSurface: signal.redSurface,
  warning: signal.amber,
  warningSurface: signal.amberSurface,
  tabInactive: '#54698A',
  overlay: 'rgba(10, 29, 56, 0.4)',
};

export const darkColors: ThemeColors = {
  background: navy.base,
  surface: navy.raised,
  surfaceAlt: navy.raisedAlt,
  border: navy.line,
  inputBorder: '#5A83BA',
  text: '#EAF2FD',
  textSecondary: '#AFC3DF',
  textMuted: '#8FA7C9',
  primary: '#74AEF2',
  primaryPressed: '#9CC6F6',
  onPrimary: '#06142A',
  resultSurface: '#102A4F',
  resultBorder: navy.lineStrong,
  resultText: '#EAF2FD',
  danger: signal.redLight,
  dangerSurface: signal.redDarkSurface,
  warning: signal.amberLight,
  warningSurface: signal.amberDarkSurface,
  tabInactive: '#8FA7C9',
  overlay: 'rgba(0, 0, 0, 0.55)',
};

export const spacing = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  pill: 999,
} as const;

/** Minimum size of anything that can be tapped (Apple HIG / Material). */
export const minTouchTarget = 44;

/**
 * Typography uses the system font (San Francisco on iOS, Roboto on Android),
 * which is the most legible choice and follows the phone's text size setting.
 */
export const typography = {
  display: { fontSize: 30, lineHeight: 36, fontWeight: '700', letterSpacing: -0.4 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '700', letterSpacing: -0.2 },
  heading: { fontSize: 18, lineHeight: 24, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24, fontWeight: '400' },
  bodyStrong: { fontSize: 16, lineHeight: 24, fontWeight: '600' },
  callout: { fontSize: 15, lineHeight: 21, fontWeight: '400' },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '500' },
  overline: { fontSize: 12, lineHeight: 16, fontWeight: '700', letterSpacing: 0.6, textTransform: 'uppercase' },
  result: { fontSize: 34, lineHeight: 40, fontWeight: '700', fontVariant: ['tabular-nums'] },
} satisfies Record<string, TextStyle>;

export type TypographyVariant = keyof typeof typography;

export interface Theme {
  scheme: ColorScheme;
  colors: ThemeColors;
  spacing: typeof spacing;
  radius: typeof radius;
  typography: typeof typography;
}

export function createTheme(scheme: ColorScheme): Theme {
  return {
    scheme,
    colors: scheme === 'dark' ? darkColors : lightColors,
    spacing,
    radius,
    typography,
  };
}
