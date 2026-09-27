/**
 * Rounding and Danish number formatting.
 *
 * Rounding is "half up" (away from zero): 2.45 with 1 decimal becomes 2.5.
 * Binary floating-point noise (1.005 stored as 1.00499999…) is removed first,
 * so the result matches what a person rounding by hand would get.
 */
export function roundHalfAwayFromZero(value: number, decimals: number): number {
  if (!Number.isFinite(value)) return value;
  if (!Number.isInteger(decimals) || decimals < 0 || decimals > 10) {
    throw new RangeError(`Invalid number of decimals: ${decimals}`);
  }
  const cleaned = Number(value.toPrecision(15));
  const factor = 10 ** decimals;
  const scaled = Number((Math.abs(cleaned) * factor).toPrecision(15));
  const rounded = Math.round(scaled) / factor;
  const result = Math.sign(cleaned) * rounded;
  return result === 0 ? 0 : result;
}

/**
 * Formats a number the Danish way ("12,5"). With `decimals`, the value is
 * rounded and always shown with exactly that many decimals ("12,50").
 * Without it, the shortest exact form is used (for limits such as "0,5").
 * No thousands separator is used, to avoid confusion with decimals.
 */
export function formatDecimal(value: number, decimals?: number): string {
  if (!Number.isFinite(value)) return '–';
  const text =
    decimals === undefined
      ? String(Number(value.toPrecision(12)))
      : roundHalfAwayFromZero(value, decimals).toFixed(decimals);
  return text.replace('.', ',');
}

/** Formats an ISO date (ÅÅÅÅ-MM-DD) as a Danish date (DD.MM.ÅÅÅÅ). */
export function formatDanishDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-');
  return year && month && day ? `${day}.${month}.${year}` : isoDate;
}
