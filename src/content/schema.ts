/**
 * The content schema: exactly which fields a formula and a disease page must
 * have before they can go into the app.
 *
 * This file is used in two places:
 *  1. `scripts/content/build.ts` validates the YAML files in `content/` when
 *     the app is built. Invalid or unapproved content stops the build.
 *  2. The app validates the generated bundle again at startup. If the bundle
 *     is invalid, the app shows an error instead of partial content.
 *
 * Error messages are in Danish, because they are read by the person writing
 * the content files. See docs/INDHOLD.md for a description of every field.
 */
import { z } from 'zod';

// Zod's own built-in messages in Danish as well (e.g. "Ukendt nøgle").
z.config(z.locales.da());

/** Page ids and file names: lowercase a–z, digits and hyphens, e.g. `demo-formel-a`. */
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Field ids used in formula code, e.g. `fieldA`. */
export const FIELD_ID_PATTERN = /^[a-z][a-zA-Z0-9]*$/;

const text = z.string().trim().min(1, 'Må ikke være tom');

const slug = z
  .string()
  .regex(SLUG_PATTERN, 'Id må kun indeholde små bogstaver a–z, tal og bindestreger (fx "min-formel")');

const fieldId = z
  .string()
  .regex(FIELD_ID_PATTERN, 'Felt-id skal starte med et lille bogstav og kun indeholde bogstaver og tal (fx "felt1")');

export function isRealIsoDate(value: string): boolean {
  const [year, month, day] = value.split('-').map(Number);
  if (year === undefined || month === undefined || day === undefined) return false;
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Dato skal skrives som ÅÅÅÅ-MM-DD')
  .refine(isRealIsoDate, 'Datoen findes ikke');

// ---------------------------------------------------------------------------
// Sources and approval
// ---------------------------------------------------------------------------

export const sourceSchema = z.strictObject({
  /** Title of the book, guideline or article. */
  title: text,
  publisher: text.optional(),
  edition: text.optional(),
  year: z.number().int().min(1900).max(2100).optional(),
  pages: text.optional(),
  url: z.url('Ugyldig webadresse').optional(),
  /** Date the web source was read. */
  accessed: isoDate.optional(),
});

export const approvalSchema = z
  .strictObject({
    /** `draft` never goes into the app. Only `approved` does. */
    status: z.enum(['draft', 'approved'], 'status skal være "draft" eller "approved"'),
    /** The doctor who verified the content. */
    approvedBy: z.strictObject({ name: text, title: text }).optional(),
    approvedAt: isoDate.optional(),
    /** Date by which the content must be reviewed again. */
    reviewBy: isoDate.optional(),
    /**
     * Fingerprint of the exact content that was approved. The build fails if
     * the content changes afterwards, so a changed page cannot slip through
     * without a new approval. Generate it with `npm run content:fingerprint`.
     */
    fingerprint: z
      .string()
      .regex(/^[a-f0-9]{64}$/, 'Fingeraftrykket skal være 64 tegn (brug npm run content:fingerprint)')
      .optional(),
    note: text.optional(),
  })
  .superRefine((approval, ctx) => {
    if (approval.status !== 'approved') return;
    if (!approval.approvedBy) {
      ctx.addIssue({ code: 'custom', path: ['approvedBy'], message: 'Godkendt indhold skal angive den godkendende læge (approvedBy: name og title)' });
    }
    if (!approval.approvedAt) {
      ctx.addIssue({ code: 'custom', path: ['approvedAt'], message: 'Godkendt indhold skal have en godkendelsesdato (approvedAt)' });
    }
    if (!approval.fingerprint) {
      ctx.addIssue({ code: 'custom', path: ['fingerprint'], message: 'Godkendt indhold skal have et fingeraftryk (kør npm run content:fingerprint)' });
    }
  });

// ---------------------------------------------------------------------------
// Text blocks (the body text of every section)
// ---------------------------------------------------------------------------

/**
 * Text is written as a list of blocks. `**fed**` inside a text marks bold.
 * No other formatting exists, so text always looks the same as approved.
 */
export const blockSchema = z.discriminatedUnion(
  'type',
  [
    z.strictObject({ type: z.literal('paragraph'), text }),
    z.strictObject({ type: z.literal('bullets'), items: z.array(text).min(1) }),
    z.strictObject({ type: z.literal('steps'), items: z.array(text).min(1) }),
    z.strictObject({ type: z.literal('warning'), text }),
  ],
  'Ukendt tekstblok: type skal være paragraph, bullets, steps eller warning',
);

const blocks = z.array(blockSchema).min(1, 'Sektionen skal have mindst én tekstblok');

// ---------------------------------------------------------------------------
// Formulas
// ---------------------------------------------------------------------------

export const numberInputSchema = z.strictObject({
  id: fieldId,
  kind: z.literal('number'),
  label: text,
  unit: text,
  /** Lowest allowed value (inclusive). Values outside the range are rejected, never adjusted. */
  min: z.number(),
  /** Highest allowed value (inclusive). */
  max: z.number(),
  /** Maximum number of decimals the user may type. */
  maxDecimals: z.number().int().min(0).max(6),
  hint: text.optional(),
});

export const choiceInputSchema = z.strictObject({
  id: fieldId,
  kind: z.literal('choice'),
  label: text,
  options: z.array(z.strictObject({ value: fieldId, label: text })).min(2, 'Et valgfelt skal have mindst to muligheder'),
  hint: text.optional(),
});

export const inputSchema = z.discriminatedUnion(
  'kind',
  [numberInputSchema, choiceInputSchema],
  'Ukendt felttype: kind skal være number eller choice',
);

export const outputSchema = z.strictObject({
  id: fieldId,
  label: text,
  unit: text,
  /** Number of decimals shown. Rounding is half up (away from zero). */
  decimals: z.number().int().min(0).max(6),
});

/**
 * A worked example verified by a doctor: these inputs must give exactly these
 * (rounded) results. Every formula implementation is tested against them in
 * the build and in `npm test`.
 */
export const verifiedExampleSchema = z.strictObject({
  description: text,
  inputs: z.record(z.string(), z.union([z.number(), z.string()])),
  expected: z.record(z.string(), z.number()),
});

export const formulaSchema = z
  .strictObject({
    id: slug,
    title: text,
    /** Short description shown under the title and in lists. */
    summary: text,
    /** Extra search words, e.g. synonyms and abbreviations. */
    keywords: z.array(text).default([]),
    inputs: z.array(inputSchema).min(1, 'En formel skal have mindst ét felt'),
    outputs: z.array(outputSchema).min(1, 'En formel skal have mindst ét resultat'),
    /** "Dokumentation" section. */
    documentation: blocks,
    /** "Eksempel på brug" section. */
    example: blocks,
    verifiedExamples: z.array(verifiedExampleSchema).min(1, 'En formel skal have mindst ét lægeverificeret eksempel'),
    relatedDiseases: z.array(slug).default([]),
    sources: z.array(sourceSchema).min(1, 'Mindst én kilde er påkrævet'),
    approval: approvalSchema,
    /** Raise by one every time the content changes. */
    version: z.number().int().min(1),
  })
  .superRefine((formula, ctx) => {
    const inputIds = formula.inputs.map((input) => input.id);
    const outputIds = formula.outputs.map((output) => output.id);
    reportDuplicates(inputIds, ['inputs'], 'felt-id', ctx);
    reportDuplicates(outputIds, ['outputs'], 'resultat-id', ctx);

    formula.inputs.forEach((input, index) => {
      if (input.kind === 'number' && !(input.min < input.max)) {
        ctx.addIssue({ code: 'custom', path: ['inputs', index, 'max'], message: 'max skal være større end min' });
      }
    });

    formula.verifiedExamples.forEach((example, index) => {
      const path = ['verifiedExamples', index];
      for (const input of formula.inputs) {
        const value = example.inputs[input.id];
        if (value === undefined) {
          ctx.addIssue({ code: 'custom', path: [...path, 'inputs'], message: `Eksemplet mangler en værdi for feltet "${input.id}"` });
        } else if (input.kind === 'number' && (typeof value !== 'number' || value < input.min || value > input.max)) {
          ctx.addIssue({ code: 'custom', path: [...path, 'inputs', input.id], message: `Værdien skal være et tal mellem ${input.min} og ${input.max}` });
        } else if (input.kind === 'choice' && !input.options.some((option) => option.value === value)) {
          ctx.addIssue({ code: 'custom', path: [...path, 'inputs', input.id], message: `Værdien skal være en af mulighederne for "${input.id}"` });
        }
      }
      for (const key of Object.keys(example.inputs)) {
        if (!inputIds.includes(key)) {
          ctx.addIssue({ code: 'custom', path: [...path, 'inputs', key], message: `Ukendt felt "${key}"` });
        }
      }
      for (const output of formula.outputs) {
        if (example.expected[output.id] === undefined) {
          ctx.addIssue({ code: 'custom', path: [...path, 'expected'], message: `Eksemplet mangler det forventede resultat for "${output.id}"` });
        }
      }
      for (const key of Object.keys(example.expected)) {
        if (!outputIds.includes(key)) {
          ctx.addIssue({ code: 'custom', path: [...path, 'expected', key], message: `Ukendt resultat "${key}"` });
        }
      }
    });
  });

// ---------------------------------------------------------------------------
// Diseases
// ---------------------------------------------------------------------------

export const diseaseSchema = z.strictObject({
  id: slug,
  title: text,
  summary: text,
  keywords: z.array(text).default([]),
  /** "Årsager" section. */
  causes: blocks,
  /** "Symptomer" section. */
  symptoms: blocks,
  /** "Behandling" section (practical treatment guidance). */
  treatment: blocks,
  relatedFormulas: z.array(slug).default([]),
  sources: z.array(sourceSchema).min(1, 'Mindst én kilde er påkrævet'),
  approval: approvalSchema,
  version: z.number().int().min(1),
});

// ---------------------------------------------------------------------------
// The generated bundle that the app loads
// ---------------------------------------------------------------------------

export const bundleSchema = z
  .strictObject({
    schemaVersion: z.literal(1),
    /** `approved` is real content. `demo` is placeholder text for design work only. */
    kind: z.enum(['approved', 'demo']),
    /** Short hash of all included pages. Shown under Mere → Om and in feedback. */
    contentVersion: z.string().min(1),
    /** The most recent approval date among the included pages. */
    latestApproval: isoDate.nullable(),
    formulas: z.array(formulaSchema),
    diseases: z.array(diseaseSchema),
  })
  .superRefine((bundle, ctx) => {
    if (bundle.kind !== 'approved') return;
    [...bundle.formulas, ...bundle.diseases].forEach((item) => {
      if (item.approval.status !== 'approved') {
        ctx.addIssue({ code: 'custom', path: ['kind'], message: `"${item.id}" er ikke godkendt og må ikke ligge i det godkendte indhold` });
      }
    });
  });

function reportDuplicates(ids: string[], path: (string | number)[], what: string, ctx: z.RefinementCtx) {
  const seen = new Set<string>();
  for (const id of ids) {
    if (seen.has(id)) ctx.addIssue({ code: 'custom', path, message: `Dobbelt ${what}: "${id}"` });
    seen.add(id);
  }
}
