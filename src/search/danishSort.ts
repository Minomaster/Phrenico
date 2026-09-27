/**
 * Danish alphabetical order for the A–Å lists: digits first, then A–Z,
 * then Æ, Ø, Å. Upper/lower case and accents (é, ü) do not affect order.
 * Implemented by hand so the order is identical on every phone.
 */
const ALPHABET = 'abcdefghijklmnopqrstuvwxyzæøå';

function foldAccents(char: string): string {
  return ALPHABET.includes(char) ? char : char.normalize('NFD').replace(/\p{M}/gu, '');
}

function sortKey(text: string): string {
  let key = '';
  for (const original of text.toLowerCase()) {
    const char = foldAccents(original);
    const letterIndex = ALPHABET.indexOf(char);
    if (/[0-9]/.test(char)) key += `1${char}`;
    else if (letterIndex >= 0) key += `2${String.fromCharCode(65 + letterIndex)}`;
    else if (/\s/.test(char)) key += '0 ';
    else key += `3${char}`;
  }
  return key;
}

export function compareDanish(a: string, b: string): number {
  const keyA = sortKey(a);
  const keyB = sortKey(b);
  if (keyA !== keyB) return keyA < keyB ? -1 : 1;
  return a < b ? -1 : a > b ? 1 : 0;
}

/** The section letter a title is listed under ("#" for digits and symbols). */
export function sectionLetter(title: string): string {
  const first = foldAccents(title.trim().charAt(0).toLowerCase());
  return ALPHABET.includes(first) && first !== '' ? first.toUpperCase() : '#';
}

export interface LetterSection<T> {
  letter: string;
  data: T[];
}

/** Groups items into A–Å sections, sorted the Danish way. "#" comes first. */
export function groupByLetter<T>(items: T[], getTitle: (item: T) => string): LetterSection<T>[] {
  const sorted = [...items].sort((a, b) => compareDanish(getTitle(a), getTitle(b)));
  const sections: LetterSection<T>[] = [];
  for (const item of sorted) {
    const letter = sectionLetter(getTitle(item));
    const last = sections.at(-1);
    if (last && last.letter === letter) last.data.push(item);
    else sections.push({ letter, data: [item] });
  }
  return sections;
}
