import { parseDecimal } from '../parseDecimal';

describe('parseDecimal', () => {
  it.each([
    ['12,5', 12.5, 1],
    ['12.5', 12.5, 1],
    ['  7 ', 7, 0],
    ['007', 7, 0],
    ['0', 0, 0],
    ['-0', 0, 0],
    ['-3,25', -3.25, 2],
    ['0.125', 0.125, 3],
    ['1,000', 1, 3],
    ['2,500', 2.5, 3],
  ])('accepts %p as %p', (input, value, decimals) => {
    expect(parseDecimal(input)).toEqual({ ok: true, value, decimals });
  });

  it('never returns negative zero', () => {
    const result = parseDecimal('-0,0');
    expect(result.ok && Object.is(result.value, -0)).toBe(false);
  });

  it.each(['', '   '])('reports %p as empty', (input) => {
    expect(parseDecimal(input)).toEqual({ ok: false, error: 'empty' });
  });

  it.each(['1.000', '2.500', '-1.000', '12.345'])('rejects %p as ambiguous (period as thousands separator)', (input) => {
    expect(parseDecimal(input)).toEqual({ ok: false, error: 'ambiguous' });
  });

  it.each(['1,2,3', '1.000,5', '1 000', '+5', ',5', '5,', '.5', 'abc', '1e3', '−5', '5 kg', '0x10', 'Infinity'])(
    'rejects %p instead of guessing',
    (input) => {
      expect(parseDecimal(input)).toEqual({ ok: false, error: 'invalid' });
    },
  );
});
