import { useState } from 'react';

import type { Formula } from '../content/types';

import { calculate, validateInputs, type CalculationResult, type FieldErrors, type RawInputs } from './engine';
import type { FormulaImplementation } from './types';

export interface FormulaCalculator {
  /** What the user has typed or chosen, per field id. */
  raw: RawInputs;
  errors: FieldErrors;
  /** null until Beregn is pressed, and again as soon as any field changes. */
  result: CalculationResult | null;
  /** True when a result was removed because a field was changed afterwards. */
  cleared: boolean;
  update: (inputId: string, value: string) => void;
  /** Validates all fields and, only if they are all valid, calculates. Returns true on a valid result. */
  calculate: () => boolean;
  reset: () => void;
}

/**
 * The state of a formula page, following the "Beregn-knap" design:
 *  - the result is only calculated when the user presses Beregn,
 *  - any change to a field removes the result at once, so a result is never
 *    shown next to values it was not calculated from.
 */
export function useFormulaCalculator(formula: Formula, implementation: FormulaImplementation | undefined): FormulaCalculator {
  const [raw, setRaw] = useState<RawInputs>({});
  const [errors, setErrors] = useState<FieldErrors>({});
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [cleared, setCleared] = useState(false);

  const update = (inputId: string, value: string) => {
    setRaw((previous) => ({ ...previous, [inputId]: value }));
    if (result) {
      setResult(null);
      setCleared(true);
    }
    setErrors((previous) => {
      if (!(inputId in previous)) return previous;
      const { [inputId]: _removed, ...rest } = previous;
      return rest;
    });
  };

  const run = () => {
    setCleared(false);
    const validation = validateInputs(formula, raw);
    if (!validation.ok) {
      setErrors(validation.errors);
      setResult(null);
      return false;
    }
    setErrors({});
    const calculation = calculate(formula, implementation, validation.values);
    setResult(calculation);
    return calculation.ok;
  };

  const reset = () => {
    setRaw({});
    setErrors({});
    setResult(null);
    setCleared(false);
  };

  return { raw, errors, result, cleared, update, calculate: run, reset };
}
