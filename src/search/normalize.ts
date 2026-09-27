/**
 * Text normalisation for search. Both the search word and the content are
 * folded the same way, so these all find each other:
 *   "Årsag" = "årsag" = "aarsag",  "Ødem" = "oedem",  "Æble" = "aeble",
 *   "é" = "e" (accents are ignored).
 */
export function foldText(text: string): string {
  return text
    .toLowerCase()
    .replace(/æ/g, 'ae')
    .replace(/ø/g, 'oe')
    .replace(/å/g, 'aa')
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

/** Splits folded text into words (letters and digits). */
export function tokenize(text: string): string[] {
  return foldText(text)
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 0);
}
