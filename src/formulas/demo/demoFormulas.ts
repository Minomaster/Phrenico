/**
 * PLACEHOLDER FORMULAS FOR DESIGN AND TESTING ONLY. NOT MEDICAL.
 *
 * These trivial calculations (sum and product of "Felt A" etc.) exist so the
 * formula page can be shown and tested before any real, approved formula
 * exists. They belong to `demo-content/` and are only available in demo
 * mode (`npm run demo`), never in a release build.
 */
import { choiceInput, numberInput } from '../inputs';
import { formatDecimal } from '../format';
import type { FormulaImplementation } from '../types';

export const demoAlfa: FormulaImplementation = {
  id: 'demo-alfa',
  compute: (inputs) => {
    const a = numberInput(inputs, 'fieldA');
    const b = numberInput(inputs, 'fieldB');
    const sum = a + b;
    return {
      outputs: { sum },
      steps: [`Felt A + Felt B = ${formatDecimal(a)} + ${formatDecimal(b)}`, `= ${formatDecimal(sum)}`],
    };
  },
};

export const demoBeta: FormulaImplementation = {
  id: 'demo-beta',
  compute: (inputs) => {
    const c = numberInput(inputs, 'fieldC');
    const factor = choiceInput(inputs, 'factor') === 'double' ? 2 : 1;
    const product = c * factor;
    return {
      outputs: { product },
      steps: [`Felt C × faktor = ${formatDecimal(c)} × ${factor}`, `= ${formatDecimal(product)}`],
    };
  },
};

export const demoGamma: FormulaImplementation = {
  id: 'demo-gamma',
  compute: (inputs) => {
    const d = numberInput(inputs, 'fieldD');
    const e = numberInput(inputs, 'fieldE');
    const quotient = d / e;
    return {
      outputs: { quotient, difference: d - e },
      steps: [
        `Felt D ÷ Felt E = ${formatDecimal(d)} ÷ ${formatDecimal(e)} = ${formatDecimal(quotient)}`,
        `Felt D − Felt E = ${formatDecimal(d)} − ${formatDecimal(e)} = ${formatDecimal(d - e)}`,
      ],
    };
  },
};
