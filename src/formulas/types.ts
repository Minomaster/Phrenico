/** A validated value from a field: a number, or the `value` of the chosen option. */
export type InputValue = number | string;
export type InputValues = Readonly<Record<string, InputValue>>;

export interface FormulaComputation {
  /** Unrounded result per output id, in the unit given in the content file. */
  outputs: Record<string, number>;
  /** Calculation steps shown under "Udregning", so the doctor can check the result. */
  steps: string[];
}

/**
 * The code that performs one formula's calculation.
 *
 * Rules for implementations (see src/formulas/README.md):
 *  - Only implement a formula exactly as described in its approved content file.
 *  - Pure function: same inputs always give the same result, no side effects.
 *  - Never round (the engine does that) and never adjust inputs.
 *  - The build and tests check the code against the doctor-verified examples.
 */
export interface FormulaImplementation {
  /** Must match the `id` of the content file in content/formler/. */
  id: string;
  compute: (inputs: InputValues) => FormulaComputation;
}
