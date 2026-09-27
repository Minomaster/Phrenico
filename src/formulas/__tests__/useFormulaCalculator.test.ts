import { act, renderHook } from '@testing-library/react-native';

import { testFormula, testImplementation } from '../../testing/fixtures';
import { useFormulaCalculator } from '../useFormulaCalculator';

async function setup() {
  const hook = await renderHook(() => useFormulaCalculator(testFormula, testImplementation));
  const { result } = hook;
  return {
    result,
    fillValid: () =>
      act(() => {
        result.current.update('x', '12,5');
        result.current.update('y', '3');
        result.current.update('mode', 'plain');
      }),
    calculate: async () => {
      let ok = false;
      await act(() => {
        ok = result.current.calculate();
      });
      return ok;
    },
  };
}

describe('useFormulaCalculator (the Beregn button design)', () => {
  it('shows no result until Beregn is pressed', async () => {
    const { result, fillValid, calculate } = await setup();
    await fillValid();
    expect(result.current.result).toBeNull();

    expect(await calculate()).toBe(true);
    expect(result.current.result).toMatchObject({ ok: true, outputs: [{ display: '28,00' }] });
  });

  it('removes the result as soon as any field changes', async () => {
    const { result, fillValid, calculate } = await setup();
    await fillValid();
    await calculate();
    expect(result.current.result).not.toBeNull();

    await act(() => result.current.update('y', '4'));
    expect(result.current.result).toBeNull();
    expect(result.current.cleared).toBe(true);
  });

  it('shows field errors and no result when a field is invalid', async () => {
    const { result, calculate } = await setup();
    await act(() => result.current.update('x', '1.000'));
    expect(await calculate()).toBe(false);
    expect(result.current.result).toBeNull();
    expect(Object.keys(result.current.errors).sort()).toEqual(['mode', 'x', 'y']);
  });

  it('clears the error of a field when it is edited', async () => {
    const { result, calculate } = await setup();
    await calculate();
    expect(result.current.errors.x).toBeDefined();
    await act(() => result.current.update('x', '2'));
    expect(result.current.errors.x).toBeUndefined();
    expect(result.current.errors.y).toBeDefined();
  });

  it('resets everything', async () => {
    const { result, fillValid, calculate } = await setup();
    await fillValid();
    await calculate();
    await act(() => result.current.reset());
    expect(result.current).toMatchObject({ raw: {}, errors: {}, result: null, cleared: false });
  });
});
