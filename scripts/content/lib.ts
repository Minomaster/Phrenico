/**
 * Reads, validates and bundles the content files. Used by build.ts and
 * fingerprint.ts, and by the tests. Node-only (uses fs and crypto).
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { parseDocument } from 'yaml';

import { canonicalJson } from '../../src/content/canonical';
import { bundleSchema, diseaseSchema, formulaSchema } from '../../src/content/schema';
import type { ContentBundle, ContentKind, Disease, Formula } from '../../src/content/types';
import { checkVerifiedExamples } from '../../src/formulas/engine';
import { implementationsFor, type ImplementationMap } from '../../src/formulas/registry';

export const ROOT = path.resolve(__dirname, '..', '..');

export type BundleKind = ContentBundle['kind'];

export const SOURCE_DIRS: Record<BundleKind, string> = {
  approved: path.join(ROOT, 'content'),
  demo: path.join(ROOT, 'demo-content'),
};

export const OUTPUT_FILES: Record<BundleKind, string> = {
  approved: path.join(ROOT, 'src', 'content', 'generated', 'approved.json'),
  demo: path.join(ROOT, 'src', 'content', 'generated', 'demo.json'),
};

const COLLECTIONS = {
  formula: { folder: 'formler', schema: formulaSchema },
  disease: { folder: 'sygdomme', schema: diseaseSchema },
} as const;

export interface Issue {
  level: 'error' | 'warning';
  file: string;
  message: string;
}

export interface LoadedFile<T> {
  kind: ContentKind;
  file: string;
  /** Exactly what the YAML file contains. The fingerprint is computed from this. */
  raw: Record<string, unknown>;
  item: T;
}

export const relative = (file: string) => path.relative(ROOT, file).split(path.sep).join('/');

/** The approval fingerprint: SHA-256 of everything in the file except `approval`. */
export function fingerprintOf(raw: Record<string, unknown>): string {
  const { approval: _approval, ...content } = raw;
  return createHash('sha256').update(canonicalJson(content), 'utf8').digest('hex');
}

export function readYaml(file: string): { data?: unknown; errors: string[] } {
  const document = parseDocument(readFileSync(file, 'utf8'), { prettyErrors: true, uniqueKeys: true });
  if (document.errors.length > 0) {
    return { errors: document.errors.map((error) => `YAML-fejl: ${error.message}`) };
  }
  return { data: document.toJS(), errors: [] };
}

function formatPath(pathParts: readonly PropertyKey[]): string {
  return pathParts.length === 0 ? '(filen)' : pathParts.map(String).join('.');
}

function statusOf(data: unknown): unknown {
  if (data && typeof data === 'object' && 'approval' in data) {
    const approval = (data as { approval?: unknown }).approval;
    if (approval && typeof approval === 'object' && 'status' in approval) {
      return (approval as { status?: unknown }).status;
    }
  }
  return undefined;
}

export function listContentFiles(sourceDir: string, kind: ContentKind): string[] {
  const dir = path.join(sourceDir, COLLECTIONS[kind].folder);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((name) => /\.ya?ml$/.test(name))
    .sort()
    .map((name) => path.join(dir, name));
}

/**
 * Loads one file. Problems in a draft only give warnings (a draft may be work
 * in progress and is never included), while problems in approved content or
 * demo content are errors that stop the build.
 */
export function loadFile<T extends Formula | Disease>(
  file: string,
  kind: ContentKind,
  strict: boolean,
): { loaded?: LoadedFile<T>; issues: Issue[] } {
  const name = relative(file);
  const { data, errors } = readYaml(file);
  const isDraft = !strict && statusOf(data) === 'draft';
  const level: Issue['level'] = isDraft ? 'warning' : 'error';

  if (errors.length > 0) {
    return { issues: errors.map((message) => ({ level, file: name, message })) };
  }
  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return { issues: [{ level: 'error', file: name, message: 'Filen er tom eller er ikke en YAML-ordbog' }] };
  }

  const parsed = COLLECTIONS[kind].schema.safeParse(data);
  if (!parsed.success) {
    const prefix = isDraft ? 'Udkastet springes over: ' : '';
    return {
      issues: parsed.error.issues.map((issue) => ({ level, file: name, message: `${prefix}${formatPath(issue.path)}: ${issue.message}` })),
    };
  }

  const item = parsed.data as T;
  const expectedName = path.basename(file).replace(/\.ya?ml$/, '');
  if (item.id !== expectedName) {
    return { issues: [{ level, file: name, message: `Filnavnet skal være "${item.id}.yaml" (samme som id)` }] };
  }

  return { loaded: { kind, file: name, raw: data as Record<string, unknown>, item }, issues: [] };
}

export interface BuildResult {
  bundle: ContentBundle;
  issues: Issue[];
  skippedDrafts: string[];
}

export interface BuildOptions {
  /** Defaults to content/ or demo-content/. Tests use a temporary folder. */
  sourceDir?: string;
  /** Defaults to the registry for the bundle kind. */
  implementations?: ImplementationMap;
  /** ISO date used for the review date check. */
  today?: string;
}

/** Builds the bundle for `approved` (from content/) or `demo` (from demo-content/). */
export function buildBundle(kind: BundleKind, options: BuildOptions = {}): BuildResult {
  const sourceDir = options.sourceDir ?? SOURCE_DIRS[kind];
  const today = options.today ?? new Date().toISOString().slice(0, 10);
  const strict = kind === 'demo';
  const issues: Issue[] = [];
  const formulas: LoadedFile<Formula>[] = [];
  const diseases: LoadedFile<Disease>[] = [];

  for (const file of listContentFiles(sourceDir, 'formula')) {
    const result = loadFile<Formula>(file, 'formula', strict);
    issues.push(...result.issues);
    if (result.loaded) formulas.push(result.loaded);
  }
  for (const file of listContentFiles(sourceDir, 'disease')) {
    const result = loadFile<Disease>(file, 'disease', strict);
    issues.push(...result.issues);
    if (result.loaded) diseases.push(result.loaded);
  }

  // Ids must be unique across all pages.
  const seen = new Map<string, string>();
  for (const entry of [...formulas, ...diseases]) {
    const other = seen.get(entry.item.id);
    if (other) issues.push({ level: 'error', file: entry.file, message: `Id "${entry.item.id}" bruges også i ${other}` });
    seen.set(entry.item.id, entry.file);
  }

  const skippedDrafts: string[] = [];
  const include = <T extends Formula | Disease>(entries: LoadedFile<T>[]) =>
    entries.filter((entry) => {
      const { approval } = entry.item;
      if (kind === 'demo') {
        if (approval.status === 'approved') {
          issues.push({ level: 'error', file: entry.file, message: 'Demo-indhold må aldrig være markeret som godkendt' });
          return false;
        }
        return true;
      }
      if (approval.status !== 'approved') {
        skippedDrafts.push(entry.file);
        return false;
      }
      const actual = fingerprintOf(entry.raw);
      if (approval.fingerprint !== actual) {
        issues.push({
          level: 'error',
          file: entry.file,
          message:
            'Indholdet er ændret efter godkendelsen (fingeraftrykket passer ikke). ' +
            'Lægen skal godkende den nye version, og fingeraftrykket skal opdateres med npm run content:fingerprint.',
        });
        return false;
      }
      if (approval.reviewBy && approval.reviewBy < today) {
        issues.push({ level: 'warning', file: entry.file, message: `Gennemgangen var planlagt til ${approval.reviewBy}` });
      }
      return true;
    });

  const includedFormulas = include(formulas);
  const includedDiseases = include(diseases);
  const includedIds = {
    formula: new Set(includedFormulas.map((entry) => entry.item.id)),
    disease: new Set(includedDiseases.map((entry) => entry.item.id)),
  };
  const allIds = {
    formula: new Set(formulas.map((entry) => entry.item.id)),
    disease: new Set(diseases.map((entry) => entry.item.id)),
  };

  // Cross references. Links to pages that are not (yet) approved are hidden by the app.
  const checkRefs = (file: string, refs: string[], target: ContentKind) => {
    for (const ref of refs) {
      if (includedIds[target].has(ref)) continue;
      const what = target === 'formula' ? 'formlen' : 'sygdommen';
      issues.push(
        allIds[target].has(ref)
          ? { level: 'warning', file, message: `Linket til ${what} "${ref}" vises ikke, fordi den ikke er godkendt` }
          : { level: 'error', file, message: `Henviser til ${what} "${ref}", som ikke findes` },
      );
    }
  };
  includedFormulas.forEach((entry) => checkRefs(entry.file, entry.item.relatedDiseases, 'disease'));
  includedDiseases.forEach((entry) => checkRefs(entry.file, entry.item.relatedFormulas, 'formula'));

  // Every included formula needs code, and the code must reproduce the doctor-verified examples.
  const implementations = options.implementations ?? implementationsFor(kind);
  for (const entry of includedFormulas) {
    const implementation = implementations[entry.item.id];
    if (!implementation) {
      issues.push({
        level: 'error',
        file: entry.file,
        message: `Der er ingen beregningskode for "${entry.item.id}" i src/formulas/registry.ts`,
      });
      continue;
    }
    for (const check of checkVerifiedExamples(entry.item, implementation)) {
      if (!check.ok) {
        issues.push({
          level: 'error',
          file: entry.file,
          message: `Lægeverificeret eksempel »${check.description}« fejler: ${check.problems.join('; ')}`,
        });
      }
    }
  }
  for (const id of Object.keys(implementations)) {
    if (!includedIds.formula.has(id)) {
      issues.push({
        level: 'warning',
        file: 'src/formulas/registry.ts',
        message: `Der er beregningskode for "${id}", men ingen ${kind === 'approved' ? 'godkendt ' : ''}formel med det id`,
      });
    }
  }

  const byId = <T extends { id: string }>(a: T, b: T) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const bundleFormulas = includedFormulas.map((entry) => entry.item).sort(byId);
  const bundleDiseases = includedDiseases.map((entry) => entry.item).sort(byId);
  const all = [...bundleFormulas, ...bundleDiseases];

  const contentVersion = createHash('sha256')
    .update(canonicalJson(all.map((item) => [item.id, item.version, item.approval.fingerprint ?? 'udkast'])), 'utf8')
    .digest('hex')
    .slice(0, 12);
  const approvalDates = all.map((item) => item.approval.approvedAt).filter((date): date is string => Boolean(date));
  const latestApproval = approvalDates.length > 0 ? approvalDates.sort().at(-1)! : null;

  const bundle = bundleSchema.parse({
    schemaVersion: 1,
    kind,
    contentVersion,
    latestApproval,
    formulas: bundleFormulas,
    diseases: bundleDiseases,
  });

  return { bundle, issues, skippedDrafts };
}

export function serializeBundle(bundle: ContentBundle): string {
  return `${JSON.stringify(bundle, null, 2)}\n`;
}
