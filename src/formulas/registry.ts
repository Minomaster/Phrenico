/**
 * The formula registry: connects each formula's content file (by id) to the
 * code that performs its calculation.
 *
 * `approvedImplementations` is EMPTY on purpose. A formula is only added
 * here after its content file in content/formler/ has been approved by a
 * doctor, and the implementation must reproduce every doctor-verified
 * example in that file (checked by `npm run content:build` and `npm test`).
 * See src/formulas/README.md.
 */
import { demoAlfa, demoBeta, demoGamma } from './demo/demoFormulas';
import type { FormulaImplementation } from './types';

export type ImplementationMap = Readonly<Record<string, FormulaImplementation>>;

function byId(implementations: FormulaImplementation[]): ImplementationMap {
  return Object.fromEntries(implementations.map((implementation) => [implementation.id, implementation]));
}

/** Real formulas. Add new implementations to this list. */
export const approvedImplementations: ImplementationMap = byId([]);

/** Placeholder formulas for demo-content/ (design and tests only). */
export const demoImplementations: ImplementationMap = byId([demoAlfa, demoBeta, demoGamma]);

export function implementationsFor(kind: 'approved' | 'demo'): ImplementationMap {
  return kind === 'approved' ? approvedImplementations : demoImplementations;
}
