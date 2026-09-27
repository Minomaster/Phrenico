/**
 * Text search over the approved content.
 *
 * The user types a word (e.g. a symptom). Every page where the word occurs is
 * listed, grouped into Sygdomme and Formler, with the place it was found
 * ("Fundet i: Symptomer"). Words match anywhere inside a word, so Danish
 * compound words work: "svigt" finds "hjertesvigt". If several words are
 * typed, a page must contain all of them.
 *
 * Search only finds text. It makes no medical assessment and does not rank
 * diagnoses by likelihood. The order only reflects where the word was found.
 */
import { blocksText } from '../content/blocks';
import type { ContentKind, Disease, Formula } from '../content/types';

import { compareDanish } from './danishSort';
import { foldText, tokenize } from './normalize';

export type SearchField =
  | 'title'
  | 'keywords'
  | 'summary'
  | 'symptoms'
  | 'causes'
  | 'treatment'
  | 'documentation'
  | 'example'
  | 'inputs'
  | 'outputs';

/** How strongly a match in each field counts. */
const FIELD_WEIGHT: Record<SearchField, number> = {
  title: 100,
  keywords: 60,
  summary: 30,
  symptoms: 20,
  causes: 12,
  treatment: 12,
  inputs: 10,
  outputs: 10,
  documentation: 8,
  example: 5,
};

export const MIN_QUERY_LENGTH = 2;

interface IndexedDocument {
  kind: ContentKind;
  id: string;
  title: string;
  summary: string;
  foldedTitle: string;
  fields: { field: SearchField; tokens: string[] }[];
}

export type SearchIndex = IndexedDocument[];

export interface SearchHit {
  kind: ContentKind;
  id: string;
  title: string;
  summary: string;
  /** The most important place the word was found. */
  field: SearchField;
  score: number;
}

export interface SearchResults {
  diseases: SearchHit[];
  formulas: SearchHit[];
  total: number;
}

function indexFields(entries: [SearchField, string][]): IndexedDocument['fields'] {
  return entries.map(([field, text]) => ({ field, tokens: [...new Set(tokenize(text))] }));
}

export function buildSearchIndex(formulas: Formula[], diseases: Disease[]): SearchIndex {
  const formulaDocs = formulas.map<IndexedDocument>((formula) => ({
    kind: 'formula',
    id: formula.id,
    title: formula.title,
    summary: formula.summary,
    foldedTitle: foldText(formula.title),
    fields: indexFields([
      ['title', formula.title],
      ['keywords', formula.keywords.join(' ')],
      ['summary', formula.summary],
      ['inputs', formula.inputs.map((input) => input.label).join(' ')],
      ['outputs', formula.outputs.map((output) => output.label).join(' ')],
      ['documentation', blocksText(formula.documentation)],
      ['example', blocksText(formula.example)],
    ]),
  }));
  const diseaseDocs = diseases.map<IndexedDocument>((disease) => ({
    kind: 'disease',
    id: disease.id,
    title: disease.title,
    summary: disease.summary,
    foldedTitle: foldText(disease.title),
    fields: indexFields([
      ['title', disease.title],
      ['keywords', disease.keywords.join(' ')],
      ['summary', disease.summary],
      ['symptoms', blocksText(disease.symptoms)],
      ['causes', blocksText(disease.causes)],
      ['treatment', blocksText(disease.treatment)],
    ]),
  }));
  return [...diseaseDocs, ...formulaDocs];
}

/** 3 = whole word, 2 = start of word, 1 = inside a word, 0 = no match. */
function matchQuality(token: string, queryToken: string): number {
  if (token === queryToken) return 3;
  if (token.startsWith(queryToken)) return 2;
  return token.includes(queryToken) ? 1 : 0;
}

function scoreDocument(doc: IndexedDocument, queryTokens: string[], foldedQuery: string): SearchHit | null {
  let score = 0;
  let bestField: SearchField | null = null;
  let bestFieldWeight = -1;

  for (const queryToken of queryTokens) {
    let tokenScore = 0;
    for (const { field, tokens } of doc.fields) {
      const quality = Math.max(0, ...tokens.map((token) => matchQuality(token, queryToken)));
      if (quality === 0) continue;
      tokenScore = Math.max(tokenScore, FIELD_WEIGHT[field] * quality);
      if (FIELD_WEIGHT[field] > bestFieldWeight) {
        bestFieldWeight = FIELD_WEIGHT[field];
        bestField = field;
      }
    }
    if (tokenScore === 0) return null; // every word must be found
    score += tokenScore;
  }

  if (doc.foldedTitle.startsWith(foldedQuery)) score += 50;
  return bestField ? { kind: doc.kind, id: doc.id, title: doc.title, summary: doc.summary, field: bestField, score } : null;
}

export function search(index: SearchIndex, query: string): SearchResults {
  const queryTokens = tokenize(query);
  const foldedQuery = foldText(query.trim());
  if (queryTokens.length === 0 || queryTokens.join('').length < MIN_QUERY_LENGTH) {
    return { diseases: [], formulas: [], total: 0 };
  }

  const hits = index
    .map((doc) => scoreDocument(doc, queryTokens, foldedQuery))
    .filter((hit): hit is SearchHit => hit !== null)
    .sort((a, b) => b.score - a.score || compareDanish(a.title, b.title));

  const diseases = hits.filter((hit) => hit.kind === 'disease');
  const formulas = hits.filter((hit) => hit.kind === 'formula');
  return { diseases, formulas, total: hits.length };
}
