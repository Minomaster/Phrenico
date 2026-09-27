/**
 * Phrenico's colour palette: a white background and a combination of blues.
 *
 * Only change colours here and in `tokens.ts`. Screens and components never
 * use hex values directly, only the semantic tokens (e.g. `colors.primary`).
 *
 * All text/background pairs in `tokens.ts` meet WCAG AA contrast (≥ 4.5:1),
 * and input borders meet ≥ 3:1. Re-check contrast if you change a value.
 */
export const blue = {
  50: '#F2F7FD',
  100: '#E3EEFB',
  200: '#C7DDF6',
  300: '#9DBFE8',
  400: '#6A88B3',
  500: '#3D82D6',
  600: '#1F5FB4',
  700: '#174C92',
  800: '#153F78',
  900: '#0F2D56',
  950: '#0A1D38',
} as const;

export const navy = {
  base: '#07142A',
  raised: '#0E2140',
  raisedAlt: '#15305A',
  line: '#1D3A64',
  lineStrong: '#2F5A92',
} as const;

/** Red, amber and white. Used only where a signal must stand out from the blue. */
export const signal = {
  white: '#FFFFFF',
  red: '#B42318',
  redSurface: '#FEF3F2',
  redLight: '#FF8C82',
  redDarkSurface: '#3A1418',
  amber: '#8A5300',
  amberSurface: '#FFF7E6',
  amberLight: '#F4BC5C',
  amberDarkSurface: '#33250C',
} as const;
