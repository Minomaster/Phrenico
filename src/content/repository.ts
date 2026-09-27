import type { ImplementationMap } from '../formulas/registry';
import { compareDanish } from '../search/danishSort';
import { buildSearchIndex, type SearchIndex } from '../search/search';

import type { ContentBundle, ContentRef, Disease, Formula } from './types';

export type ResolvedItem = { kind: 'formula'; item: Formula } | { kind: 'disease'; item: Disease };

/** Read-only access to the loaded content. Pure, so it can be tested without the app. */
export interface ContentRepository {
  bundle: ContentBundle;
  /** Sorted A–Å (Danish). */
  formulas: Formula[];
  /** Sorted A–Å (Danish). */
  diseases: Disease[];
  implementations: ImplementationMap;
  searchIndex: SearchIndex;
  getFormula: (id: string) => Formula | undefined;
  getDisease: (id: string) => Disease | undefined;
  /** Returns only pages that exist, so links to removed or unapproved pages disappear. */
  resolve: (refs: ContentRef[]) => ResolvedItem[];
}

export function createRepository(bundle: ContentBundle, implementations: ImplementationMap): ContentRepository {
  const formulas = [...bundle.formulas].sort((a, b) => compareDanish(a.title, b.title));
  const diseases = [...bundle.diseases].sort((a, b) => compareDanish(a.title, b.title));
  const formulaById = new Map(formulas.map((formula) => [formula.id, formula]));
  const diseaseById = new Map(diseases.map((disease) => [disease.id, disease]));

  return {
    bundle,
    formulas,
    diseases,
    implementations,
    searchIndex: buildSearchIndex(formulas, diseases),
    getFormula: (id) => formulaById.get(id),
    getDisease: (id) => diseaseById.get(id),
    resolve: (refs) =>
      refs.flatMap<ResolvedItem>((ref) => {
        if (ref.kind === 'formula') {
          const item = formulaById.get(ref.id);
          return item ? [{ kind: 'formula', item }] : [];
        }
        const item = diseaseById.get(ref.id);
        return item ? [{ kind: 'disease', item }] : [];
      }),
  };
}
