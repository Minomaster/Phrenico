import { formatDanishDate, formatDecimal, roundHalfAwayFromZero } from '../format';

describe('roundHalfAwayFromZero', () => {
  it.each([
    [1.005, 2, 1.01],
    [2.45, 1, 2.5],
    [2.5, 0, 3],
    [-2.5, 0, -3],
    [1.0049, 2, 1],
    [0.1 + 0.2, 2, 0.3],
    [1234.5678, 0, 1235],
    [10 / 3, 2, 3.33],
    [2 / 3, 2, 0.67],
  ])('rounds %p to %p decimals as %p', (value, decimals, expected) => {
    expect(roundHalfAwayFromZero(value, decimals)).toBe(expected);
  });

  it('never returns negative zero', () => {
    expect(Object.is(roundHalfAwayFromZero(-0.001, 2), -0)).toBe(false);
  });

  it('rejects an invalid number of decimals', () => {
    expect(() => roundHalfAwayFromZero(1, -1)).toThrow(RangeError);
    expect(() => roundHalfAwayFromZero(1, 1.5)).toThrow(RangeError);
  });
});

describe('formatDecimal', () => {
  it('uses a decimal comma and shows exactly the given decimals', () => {
    expect(formatDecimal(12.5, 2)).toBe('12,50');
    expect(formatDecimal(15.5, 1)).toBe('15,5');
    expect(formatDecimal(8, 0)).toBe('8');
  });

  it('uses the shortest exact form without decimals given', () => {
    expect(formatDecimal(0.5)).toBe('0,5');
    expect(formatDecimal(250)).toBe('250');
    expect(formatDecimal(0.1 + 0.2)).toBe('0,3');
  });

  it('never shows a thousands separator or negative zero', () => {
    expect(formatDecimal(12345.5, 1)).toBe('12345,5');
    expect(formatDecimal(-0.001, 2)).toBe('0,00');
  });

  it('shows a dash for values that are not numbers', () => {
    expect(formatDecimal(Number.NaN)).toBe('–');
    expect(formatDecimal(Number.POSITIVE_INFINITY, 2)).toBe('–');
  });
});

describe('formatDanishDate', () => {
  it('formats ISO dates the Danish way', () => {
    expect(formatDanishDate('2026-09-27')).toBe('27.09.2026');
  });
});
