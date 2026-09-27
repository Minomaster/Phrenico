import { compareDanish, groupByLetter, sectionLetter } from '../danishSort';

describe('Danish A–Å order', () => {
  it('puts Æ, Ø and Å after Z, digits first, and ignores case and accents', () => {
    const titles = ['Øvelse', 'alfa', 'Ærø', 'Zulu', 'Åben', 'Beta', 'Émile', '10 test', 'Delta'];
    expect([...titles].sort(compareDanish)).toEqual(['10 test', 'alfa', 'Beta', 'Delta', 'Émile', 'Zulu', 'Ærø', 'Øvelse', 'Åben']);
  });

  it('sorts a shorter prefix first', () => {
    expect(['Alfa (demo)', 'Alfa'].sort(compareDanish)).toEqual(['Alfa', 'Alfa (demo)']);
  });

  it('gives the letter each title is listed under', () => {
    expect(sectionLetter('émile')).toBe('E');
    expect(sectionLetter('Øvelse')).toBe('Ø');
    expect(sectionLetter('åben')).toBe('Å');
    expect(sectionLetter('10 test')).toBe('#');
    expect(sectionLetter('')).toBe('#');
  });

  it('groups items into sections in Danish order', () => {
    const sections = groupByLetter(['Åben', 'Beta', 'Alfa', 'Asta', 'Øvelse'], (title) => title);
    expect(sections).toEqual([
      { letter: 'A', data: ['Alfa', 'Asta'] },
      { letter: 'B', data: ['Beta'] },
      { letter: 'Ø', data: ['Øvelse'] },
      { letter: 'Å', data: ['Åben'] },
    ]);
  });
});
