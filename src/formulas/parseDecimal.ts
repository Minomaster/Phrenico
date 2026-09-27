/**
 * Strict parsing of numbers typed by the user.
 *
 * Rules (chosen for safety, see docs/ARKITEKTUR.md):
 *  - Comma is the decimal separator (Danish). Period is also accepted, so an
 *    English keyboard works: "12,5" and "12.5" both mean 12.5.
 *  - Thousands separators, spaces inside the number, a plus sign, a leading
 *    separator (",5") and anything else unusual are rejected, never guessed.
 *  - A period followed by exactly three digits ("1.000") is rejected as
 *    ambiguous, because in Danish it usually means one thousand. "0.125" is
 *    fine, because it cannot mean one thousand.
 *
 * The value is never rounded or adjusted. That is up to the range check.
 */
export type ParseDecimalResult =
  | { ok: true; value: number; decimals: number }
  | { ok: false; error: 'empty' | 'invalid' | 'ambiguous' };

const NUMBER_PATTERN = /^(-?)(\d+)(?:([.,])(\d+))?$/;

export function parseDecimal(raw: string): ParseDecimalResult {
  const input = raw.trim();
  if (input === '') return { ok: false, error: 'empty' };

  const match = NUMBER_PATTERN.exec(input);
  if (!match) return { ok: false, error: 'invalid' };

  const [, sign = '', integerPart = '', separator, fraction = ''] = match;

  if (separator === '.' && fraction.length === 3 && Number(integerPart) !== 0) {
    return { ok: false, error: 'ambiguous' };
  }

  const value = Number(`${sign}${integerPart}${fraction ? `.${fraction}` : ''}`);
  if (!Number.isFinite(value)) return { ok: false, error: 'invalid' };

  // Avoid "-0" reaching a formula.
  return { ok: true, value: value === 0 ? 0 : value, decimals: fraction.length };
}
