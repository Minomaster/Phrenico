/**
 * Test fixtures. NOT MEDICAL: neutral placeholder formulas and pages used only
 * to test the machinery (validation, rounding, search, approval checks).
 */
import { diseaseSchema, formulaSchema } from '../content/schema';
import type { Disease, Formula } from '../content/types';
import { numberInput } from '../formulas/inputs';
import type { FormulaImplementation } from '../formulas/types';

export const testFormula: Formula = formulaSchema.parse({
  id: 'test-formel',
  title: 'Testformel',
  summary: 'Fordobler felt X og lægger felt Y til.',
  keywords: ['prøve'],
  inputs: [
    { id: 'x', kind: 'number', label: 'Felt X', unit: 'enhed', min: 0.5, max: 250, maxDecimals: 3 },
    { id: 'y', kind: 'number', label: 'Felt Y', unit: 'enhed', min: 0, max: 10, maxDecimals: 0 },
    {
      id: 'mode',
      kind: 'choice',
      label: 'Tilstand',
      options: [
        { value: 'plain', label: 'Almindelig' },
        { value: 'negated', label: 'Negativ' },
      ],
    },
  ],
  outputs: [{ id: 'total', label: 'Total', unit: 'enhed', decimals: 2 }],
  documentation: [{ type: 'paragraph', text: 'Pladsholder med ordet blåbærsyltetøj.' }],
  example: [{ type: 'paragraph', text: 'Pladsholder.' }],
  verifiedExamples: [
    { description: 'to tal', inputs: { x: 1.005, y: 0, mode: 'plain' }, expected: { total: 2.01 } },
    { description: 'negativ', inputs: { x: 2.5, y: 3, mode: 'negated' }, expected: { total: -8 } },
  ],
  sources: [{ title: 'Pladsholderkilde' }],
  approval: { status: 'draft' },
  version: 1,
});

export const testImplementation: FormulaImplementation = {
  id: 'test-formel',
  compute: (inputs) => {
    const total = 2 * numberInput(inputs, 'x') + numberInput(inputs, 'y');
    const signed = inputs.mode === 'negated' ? -total : total;
    return { outputs: { total: signed }, steps: [`2 × X + Y = ${signed}`] };
  },
};

export const testDisease: Disease = diseaseSchema.parse({
  id: 'test-sygdom',
  title: 'Testside',
  summary: 'En neutral side til test af søgningen.',
  keywords: ['synonym'],
  causes: [{ type: 'paragraph', text: 'Pladsholder om **årsager**.' }],
  symptoms: [{ type: 'bullets', items: ['Pladsholderord', 'Ønskeseddel'] }],
  treatment: [{ type: 'steps', items: ['Første trin'] }],
  relatedFormulas: ['test-formel'],
  sources: [{ title: 'Pladsholderkilde' }],
  approval: { status: 'draft' },
  version: 1,
});
