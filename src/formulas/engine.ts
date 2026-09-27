/**
 * The formula engine: the shared machinery every formula runs through.
 *
 *  1. `validateInputs` checks each field against the approved content file
 *     (required, valid number, max decimals, allowed range, valid choice).
 *  2. `calculate` runs the formula's implementation only when every field is
 *     valid, and rounds each result as the content file specifies.
 *  3. If anything is wrong (missing code, an exception, NaN/Infinity, missing
 *     or unknown results), an error is returned instead of a result. The
 *     engine never shows a result it cannot vouch for.
 *
 * The engine contains no medical knowledge. It is used by the app, by the
 * content build and by the tests.
 */
import type { Formula, FormulaInput, VerifiedExample } from '../content/types';
import { da } from '../i18n/da';

import { formatDecimal, roundHalfAwayFromZero } from './format';
import { parseDecimal } from './parseDecimal';
import type { FormulaImplementation, InputValue, InputValues } from './types';

/** What the user has entered: text for number fields, the option value for choice fields. */
export type RawInputs = Readonly<Record<string, string | undefined>>;
export type FieldErrors = Record<string, string>;

export type ValidationResult = { ok: true; values: InputValues } | { ok: false; errors: FieldErrors };

type InputCheck = { ok: true; value: InputValue } | { ok: false; error: string };

/** Number of decimals in a number's shortest exact form (0.125 → 3, 70 → 0). */
export function countDecimals(value: number): number {
  const text = String(Number(value.toPrecision(15)));
  const [mantissa = '', exponent] = text.split('e');
  const mantissaDecimals = (mantissa.split('.')[1] ?? '').length;
  return exponent === undefined ? mantissaDecimals : Math.max(0, mantissaDecimals - Number(exponent));
}

function checkNumber(input: Extract<FormulaInput, { kind: 'number' }>, value: number, decimals: number): InputCheck {
  if (!Number.isFinite(value)) return { ok: false, error: da.validation.invalidNumber };
  if (decimals > input.maxDecimals) {
    return { ok: false, error: da.validation.tooManyDecimals(input.maxDecimals) };
  }
  if (value < input.min || value > input.max) {
    return { ok: false, error: da.validation.outOfRange(formatDecimal(input.min), formatDecimal(input.max), input.unit) };
  }
  return { ok: true, value };
}

/** Validates what the user typed or chose in one field. */
export function validateInput(input: FormulaInput, raw: string | undefined): InputCheck {
  if (input.kind === 'choice') {
    return input.options.some((option) => option.value === raw)
      ? { ok: true, value: raw as string }
      : { ok: false, error: da.validation.chooseOption };
  }

  const parsed = parseDecimal(raw ?? '');
  if (!parsed.ok) {
    const error = {
      empty: da.validation.required,
      invalid: da.validation.invalidNumber,
      ambiguous: da.validation.ambiguousNumber,
    }[parsed.error];
    return { ok: false, error };
  }
  return checkNumber(input, parsed.value, parsed.decimals);
}

/** Validates an already parsed value (used for re-checks and verified examples). */
export function validateValue(input: FormulaInput, value: InputValue | undefined): InputCheck {
  if (input.kind === 'choice') {
    return validateInput(input, typeof value === 'string' ? value : undefined);
  }
  if (typeof value !== 'number') return { ok: false, error: da.validation.required };
  return checkNumber(input, value, countDecimals(value));
}

export function validateInputs(formula: Formula, raw: RawInputs): ValidationResult {
  const values: Record<string, InputValue> = {};
  const errors: FieldErrors = {};
  for (const input of formula.inputs) {
    const result = validateInput(input, raw[input.id]);
    if (result.ok) values[input.id] = result.value;
    else errors[input.id] = result.error;
  }
  return Object.keys(errors).length > 0 ? { ok: false, errors } : { ok: true, values };
}

export interface CalculatedOutput {
  id: string;
  label: string;
  unit: string;
  /** Rounded to the number of decimals in the content file. */
  value: number;
  /** The rounded value formatted the Danish way, e.g. "12,50". */
  display: string;
}

export interface UsedInput {
  id: string;
  label: string;
  /** e.g. "70,5 kg" or the label of the chosen option. */
  display: string;
}

export type CalculationResult =
  | { ok: true; outputs: CalculatedOutput[]; steps: string[]; usedInputs: UsedInput[] }
  | { ok: false; error: string; detail?: string };

export function describeInputs(formula: Formula, values: InputValues): UsedInput[] {
  return formula.inputs.map((input) => {
    const value = values[input.id];
    const display =
      input.kind === 'number'
        ? `${typeof value === 'number' ? formatDecimal(value) : '–'} ${input.unit}`
        : (input.options.find((option) => option.value === value)?.label ?? '–');
    return { id: input.id, label: input.label, display };
  });
}

export function calculate(
  formula: Formula,
  implementation: FormulaImplementation | undefined,
  values: InputValues,
): CalculationResult {
  if (!implementation || implementation.id !== formula.id) {
    return { ok: false, error: da.calculation.unavailable, detail: `No implementation registered for "${formula.id}"` };
  }

  // Re-check the values, so the engine is safe even if called directly.
  for (const input of formula.inputs) {
    const recheck = validateValue(input, values[input.id]);
    if (!recheck.ok) {
      return { ok: false, error: da.calculation.failed, detail: `Invalid value for "${input.id}"` };
    }
  }

  let computation;
  try {
    computation = implementation.compute(values);
  } catch (error) {
    return { ok: false, error: da.calculation.failed, detail: error instanceof Error ? error.message : String(error) };
  }

  const expectedIds = formula.outputs.map((output) => output.id);
  const unknown = Object.keys(computation.outputs).filter((id) => !expectedIds.includes(id));
  if (unknown.length > 0) {
    return { ok: false, error: da.calculation.invalidResult, detail: `Unknown outputs: ${unknown.join(', ')}` };
  }

  const outputs: CalculatedOutput[] = [];
  for (const output of formula.outputs) {
    const raw = computation.outputs[output.id];
    if (typeof raw !== 'number' || !Number.isFinite(raw)) {
      return { ok: false, error: da.calculation.invalidResult, detail: `Output "${output.id}" is ${String(raw)}` };
    }
    const value = roundHalfAwayFromZero(raw, output.decimals);
    outputs.push({ id: output.id, label: output.label, unit: output.unit, value, display: formatDecimal(value, output.decimals) });
  }

  return { ok: true, outputs, steps: computation.steps, usedInputs: describeInputs(formula, values) };
}

export interface ExampleCheck {
  description: string;
  ok: boolean;
  problems: string[];
}

/**
 * Runs the doctor-verified examples from the content file through the
 * implementation. Every rounded result must equal the expected value exactly.
 */
export function checkVerifiedExamples(formula: Formula, implementation: FormulaImplementation | undefined): ExampleCheck[] {
  return formula.verifiedExamples.map((example: VerifiedExample) => {
    const result = calculate(formula, implementation, example.inputs);
    if (!result.ok) {
      return { description: example.description, ok: false, problems: [`${result.error} (${result.detail ?? 'ingen detaljer'})`] };
    }
    const problems = result.outputs
      .filter((output) => output.value !== example.expected[output.id])
      .map((output) => `${output.id}: forventet ${String(example.expected[output.id])}, fik ${output.value}`);
    return { description: example.description, ok: problems.length === 0, problems };
  });
}
