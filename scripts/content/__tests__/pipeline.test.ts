/**
 * Tests of the approval pipeline: the checks that stop unapproved or changed
 * content from ever reaching the app. Uses neutral placeholder content only.
 */
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import path from 'node:path';

import { stringify } from 'yaml';

import { loadContent } from '../../../src/content/active';
import { bundleSchema } from '../../../src/content/schema';
import type { FormulaImplementation } from '../../../src/formulas/types';
import { buildBundle, fingerprintOf, OUTPUT_FILES, serializeBundle } from '../lib';

const sum: FormulaImplementation = {
  id: 'pladsholder-formel',
  compute: (inputs) => ({ outputs: { sum: Number(inputs.a) + Number(inputs.b) }, steps: [] }),
};

function formulaData(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'pladsholder-formel',
    title: 'Pladsholderformel',
    summary: 'Pladsholder.',
    inputs: [
      { id: 'a', kind: 'number', label: 'A', unit: 'enhed', min: 0, max: 10, maxDecimals: 1 },
      { id: 'b', kind: 'number', label: 'B', unit: 'enhed', min: 0, max: 10, maxDecimals: 1 },
    ],
    outputs: [{ id: 'sum', label: 'Sum', unit: 'enhed', decimals: 1 }],
    documentation: [{ type: 'paragraph', text: 'Pladsholder.' }],
    example: [{ type: 'paragraph', text: 'Pladsholder.' }],
    verifiedExamples: [{ description: 'eksempel', inputs: { a: 1.5, b: 2 }, expected: { sum: 3.5 } }],
    relatedDiseases: [],
    sources: [{ title: 'Pladsholderkilde' }],
    approval: { status: 'draft' },
    version: 1,
    ...overrides,
  };
}

function diseaseData(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'pladsholder-side',
    title: 'Pladsholderside',
    summary: 'Pladsholder.',
    causes: [{ type: 'paragraph', text: 'Pladsholder.' }],
    symptoms: [{ type: 'bullets', items: ['Pladsholder'] }],
    treatment: [{ type: 'paragraph', text: 'Pladsholder.' }],
    relatedFormulas: [],
    sources: [{ title: 'Pladsholderkilde' }],
    approval: { status: 'draft' },
    version: 1,
    ...overrides,
  };
}

/** Marks content as approved with a correct fingerprint, as the approval workflow does. */
function approve(data: Record<string, unknown>, approvedAt = '2026-01-15'): Record<string, unknown> {
  return {
    ...data,
    approval: {
      status: 'approved',
      approvedBy: { name: 'Læge Pladsholder', title: 'Overlæge' },
      approvedAt,
      fingerprint: fingerprintOf(data),
    },
  };
}

let root: string;

function write(folder: 'formler' | 'sygdomme', name: string, data: Record<string, unknown>) {
  mkdirSync(path.join(root, folder), { recursive: true });
  writeFileSync(path.join(root, folder, `${name}.yaml`), stringify(data));
}

const build = (kind: 'approved' | 'demo' = 'approved', implementations = { [sum.id]: sum }) =>
  buildBundle(kind, { sourceDir: root, implementations, today: '2026-06-01' });

const errors = (result: ReturnType<typeof build>) => result.issues.filter((issue) => issue.level === 'error').map((issue) => issue.message);
const warnings = (result: ReturnType<typeof build>) =>
  result.issues.filter((issue) => issue.level === 'warning').map((issue) => issue.message);

beforeEach(() => {
  root = mkdtempSync(path.join(tmpdir(), 'phrenico-content-'));
});

afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('the real content folders', () => {
  it.each(['approved', 'demo'] as const)('%s content builds without errors and the generated file is up to date', (kind) => {
    const result = buildBundle(kind);
    expect(errors(result)).toEqual([]);
    expect(readFileSync(OUTPUT_FILES[kind], 'utf8')).toBe(serializeBundle(result.bundle));
  });
});

describe('approval fingerprint', () => {
  it('does not depend on key order or YAML formatting', () => {
    const data = formulaData();
    const reordered = Object.fromEntries(Object.entries(data).reverse());
    expect(fingerprintOf(reordered)).toBe(fingerprintOf(data));
  });

  it('ignores the approval block itself but changes with any content change', () => {
    const data = formulaData();
    expect(fingerprintOf({ ...data, approval: { status: 'approved' } })).toBe(fingerprintOf(data));
    expect(fingerprintOf({ ...data, summary: 'Pladsholder!' })).not.toBe(fingerprintOf(data));
    expect(fingerprintOf({ ...data, version: 2 })).not.toBe(fingerprintOf(data));
  });
});

describe('approved content', () => {
  it('is included when approved with a matching fingerprint and working code', () => {
    write('formler', 'pladsholder-formel', approve(formulaData()));
    write('sygdomme', 'pladsholder-side', approve(diseaseData(), '2026-02-01'));
    const result = build();
    expect(errors(result)).toEqual([]);
    expect(result.bundle.formulas.map((item) => item.id)).toEqual(['pladsholder-formel']);
    expect(result.bundle.diseases.map((item) => item.id)).toEqual(['pladsholder-side']);
    expect(result.bundle.latestApproval).toBe('2026-02-01');
    expect(result.bundle.contentVersion).toMatch(/^[a-f0-9]{12}$/);
  });

  it('is rejected without an approving doctor and date', () => {
    write('formler', 'pladsholder-formel', formulaData({ approval: { status: 'approved', fingerprint: fingerprintOf(formulaData()) } }));
    const result = build();
    expect(errors(result).join('\n')).toContain('godkendende læge');
    expect(errors(result).join('\n')).toContain('godkendelsesdato');
    expect(result.bundle.formulas).toEqual([]);
  });

  it('is rejected without a source', () => {
    write('sygdomme', 'pladsholder-side', approve(diseaseData({ sources: [] })));
    expect(errors(build()).join('\n')).toContain('Mindst én kilde er påkrævet');
  });

  it('is rejected when changed after approval', () => {
    const approved = approve(formulaData());
    write('formler', 'pladsholder-formel', { ...approved, summary: 'Ændret efter godkendelsen.' });
    const result = build();
    expect(errors(result).join('\n')).toContain('ændret efter godkendelsen');
    expect(result.bundle.formulas).toEqual([]);
  });

  it('is rejected when the formula has no code', () => {
    write('formler', 'pladsholder-formel', approve(formulaData()));
    expect(errors(build('approved', {})).join('\n')).toContain('ingen beregningskode');
  });

  it('is rejected when the code does not reproduce a doctor-verified example', () => {
    write('formler', 'pladsholder-formel', approve(formulaData()));
    const wrong: FormulaImplementation = { id: sum.id, compute: () => ({ outputs: { sum: 3.6 }, steps: [] }) };
    expect(errors(build('approved', { [sum.id]: wrong })).join('\n')).toContain('Lægeverificeret eksempel');
  });

  it('is rejected when the file name does not match the id', () => {
    write('formler', 'forkert-navn', approve(formulaData()));
    expect(errors(build()).join('\n')).toContain('Filnavnet skal være "pladsholder-formel.yaml"');
  });

  it('is rejected when an id is used twice', () => {
    write('formler', 'pladsholder-formel', approve(formulaData()));
    write('sygdomme', 'pladsholder-formel', approve(diseaseData({ id: 'pladsholder-formel' })));
    expect(errors(build()).join('\n')).toContain('bruges også i');
  });

  it('is rejected when it links to a page that does not exist', () => {
    write('sygdomme', 'pladsholder-side', approve(diseaseData({ relatedFormulas: ['findes-ikke'] })));
    expect(errors(build()).join('\n')).toContain('som ikke findes');
  });

  it('warns (and the app hides the link) when it links to a page that is not approved yet', () => {
    write('formler', 'pladsholder-formel', formulaData());
    write('sygdomme', 'pladsholder-side', approve(diseaseData({ relatedFormulas: ['pladsholder-formel'] })));
    const result = build();
    expect(errors(result)).toEqual([]);
    expect(warnings(result).join('\n')).toContain('vises ikke, fordi den ikke er godkendt');
  });

  it('warns when the review date has passed', () => {
    const data = diseaseData();
    const approved = approve(data);
    write('sygdomme', 'pladsholder-side', {
      ...approved,
      approval: { ...(approved.approval as object), reviewBy: '2026-05-01' },
    });
    expect(warnings(build()).join('\n')).toContain('Gennemgangen var planlagt til 2026-05-01');
  });
});

describe('drafts', () => {
  it('are never included in the approved content', () => {
    write('formler', 'pladsholder-formel', formulaData());
    const result = build();
    expect(result.bundle.formulas).toEqual([]);
    expect(result.skippedDrafts).toEqual(['pladsholder-formel.yaml'].map((name) => expect.stringContaining(name)));
  });

  it('only give warnings for problems while they are work in progress', () => {
    write('formler', 'pladsholder-formel', formulaData({ sources: [] }));
    const result = build();
    expect(errors(result)).toEqual([]);
    expect(warnings(result).join('\n')).toContain('Udkastet springes over');
  });
});

describe('demo content', () => {
  it('may never be marked as approved', () => {
    write('formler', 'pladsholder-formel', approve(formulaData()));
    expect(errors(build('demo')).join('\n')).toContain('Demo-indhold må aldrig være markeret som godkendt');
  });
});

describe('runtime check of the bundle', () => {
  it('refuses an "approved" bundle that contains unapproved content', () => {
    const bundle = { schemaVersion: 1, kind: 'approved', contentVersion: 'x', latestApproval: null, formulas: [], diseases: [diseaseData()] };
    expect(bundleSchema.safeParse(bundle).success).toBe(false);
    expect(loadContent(bundle, 'approved').ok).toBe(false);
  });

  it('refuses a bundle of the wrong kind or shape', () => {
    const demo = { schemaVersion: 1, kind: 'demo', contentVersion: 'x', latestApproval: null, formulas: [], diseases: [] };
    expect(loadContent(demo, 'approved').ok).toBe(false);
    expect(loadContent({ nonsense: true }, 'approved').ok).toBe(false);
    expect(loadContent(demo, 'demo').ok).toBe(true);
  });
});
