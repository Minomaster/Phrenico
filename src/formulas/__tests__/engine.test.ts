import { testFormula, testImplementation } from '../../testing/fixtures';
import { calculate, checkVerifiedExamples, countDecimals, validateInputs } from '../engine';
import type { FormulaImplementation } from '../types';

const valid = { x: '12,5', y: '3', mode: 'plain' };

describe('validateInputs', () => {
  it('accepts valid values and parses them', () => {
    expect(validateInputs(testFormula, valid)).toEqual({ ok: true, values: { x: 12.5, y: 3, mode: 'plain' } });
  });

  it('accepts the limits themselves (min and max are inclusive)', () => {
    expect(validateInputs(testFormula, { x: '0,5', y: '10', mode: 'plain' }).ok).toBe(true);
    expect(validateInputs(testFormula, { x: '250', y: '0', mode: 'plain' }).ok).toBe(true);
  });

  it('reports every problem with a Danish message', () => {
    const result = validateInputs(testFormula, { x: '', y: '1.000' });
    expect(result).toEqual({
      ok: false,
      errors: {
        x: 'Skal udfyldes',
        y: 'Tvetydigt tal: punktum kan betyde tusinde. Brug komma som decimaltegn, fx 1,5',
        mode: 'Vælg en mulighed',
      },
    });
  });

  it('rejects values outside the range instead of adjusting them', () => {
    const result = validateInputs(testFormula, { ...valid, x: '250,01' });
    expect(result).toEqual({ ok: false, errors: { x: 'Skal være mellem 0,5 og 250 enhed' } });
    expect(validateInputs(testFormula, { ...valid, x: '0,49' }).ok).toBe(false);
  });

  it('rejects more decimals than allowed instead of rounding', () => {
    expect(validateInputs(testFormula, { ...valid, x: '1,0005' })).toEqual({ ok: false, errors: { x: 'Højst 3 decimaler' } });
    expect(validateInputs(testFormula, { ...valid, y: '2,5' })).toEqual({ ok: false, errors: { y: 'Skriv et helt tal' } });
  });

  it('rejects an unknown choice', () => {
    expect(validateInputs(testFormula, { ...valid, mode: 'other' })).toEqual({ ok: false, errors: { mode: 'Vælg en mulighed' } });
  });
});

describe('calculate', () => {
  const values = { x: 12.5, y: 3, mode: 'plain' };

  it('returns the rounded result, the values used and the steps', () => {
    const result = calculate(testFormula, testImplementation, values);
    expect(result).toEqual({
      ok: true,
      outputs: [{ id: 'total', label: 'Total', unit: 'enhed', value: 28, display: '28,00' }],
      steps: ['2 × X + Y = 28'],
      usedInputs: [
        { id: 'x', label: 'Felt X', display: '12,5 enhed' },
        { id: 'y', label: 'Felt Y', display: '3 enhed' },
        { id: 'mode', label: 'Tilstand', display: 'Almindelig' },
      ],
    });
  });

  const failing = (compute: FormulaImplementation['compute']): FormulaImplementation => ({ id: 'test-formel', compute });

  it.each([
    ['there is no implementation', undefined],
    ['the implementation belongs to another formula', { ...testImplementation, id: 'another' }],
    ['the code throws', failing(() => { throw new Error('boom'); })],
    ['the result is NaN', failing(() => ({ outputs: { total: Number.NaN }, steps: [] }))],
    ['the result is infinite', failing(() => ({ outputs: { total: Number.POSITIVE_INFINITY }, steps: [] }))],
    ['a result is missing', failing(() => ({ outputs: {}, steps: [] }))],
    ['an unknown result is returned', failing(() => ({ outputs: { total: 1, extra: 2 }, steps: [] }))],
  ])('shows no result when %s', (_case, implementation) => {
    const result = calculate(testFormula, implementation, values);
    expect(result.ok).toBe(false);
  });

  it('re-checks values passed directly, so invalid values never reach the formula', () => {
    const compute = jest.fn(testImplementation.compute);
    const result = calculate(testFormula, { id: 'test-formel', compute }, { x: 999, y: 3, mode: 'plain' });
    expect(result.ok).toBe(false);
    expect(compute).not.toHaveBeenCalled();
  });
});

describe('checkVerifiedExamples', () => {
  it('passes when the code reproduces every doctor-verified example', () => {
    expect(checkVerifiedExamples(testFormula, testImplementation).every((check) => check.ok)).toBe(true);
  });

  it('fails when the code gives a different result', () => {
    const offByOne: FormulaImplementation = {
      id: 'test-formel',
      compute: (inputs) => {
        const computed = testImplementation.compute(inputs);
        return { ...computed, outputs: { total: (computed.outputs.total ?? 0) + 1 } };
      },
    };
    const checks = checkVerifiedExamples(testFormula, offByOne);
    expect(checks.some((check) => !check.ok)).toBe(true);
    expect(checks[0]?.problems[0]).toContain('forventet 2.01');
  });
});

describe('countDecimals', () => {
  it.each([
    [0.125, 3],
    [70, 0],
    [2.5, 1],
    [1e-7, 7],
    [2.5e-3, 4],
  ])('counts the decimals of %p as %p', (value, expected) => {
    expect(countDecimals(value)).toBe(expected);
  });
});
