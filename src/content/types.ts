import type { z } from 'zod';

import type {
  approvalSchema,
  blockSchema,
  bundleSchema,
  choiceInputSchema,
  diseaseSchema,
  formulaSchema,
  inputSchema,
  numberInputSchema,
  outputSchema,
  sourceSchema,
  verifiedExampleSchema,
} from './schema';

export type ContentKind = 'formula' | 'disease';

/** Points to one page: a formula or a disease. Used by favourites, history and links. */
export interface ContentRef {
  kind: ContentKind;
  id: string;
}

export type Source = z.infer<typeof sourceSchema>;
export type Approval = z.infer<typeof approvalSchema>;
export type Block = z.infer<typeof blockSchema>;
export type NumberInput = z.infer<typeof numberInputSchema>;
export type ChoiceInput = z.infer<typeof choiceInputSchema>;
export type FormulaInput = z.infer<typeof inputSchema>;
export type FormulaOutput = z.infer<typeof outputSchema>;
export type VerifiedExample = z.infer<typeof verifiedExampleSchema>;
export type Formula = z.infer<typeof formulaSchema>;
export type Disease = z.infer<typeof diseaseSchema>;
export type ContentBundle = z.infer<typeof bundleSchema>;
export type ContentItem = Formula | Disease;
