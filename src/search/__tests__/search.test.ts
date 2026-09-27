import { testDisease, testFormula } from '../../testing/fixtures';
import { foldText, tokenize } from '../normalize';
import { buildSearchIndex, search } from '../search';

describe('foldText / tokenize', () => {
  it('treats æ/ø/å and their two-letter spellings the same, and ignores case and accents', () => {
    expect(foldText('Årsag')).toBe(foldText('aarsag'));
    expect(foldText('Ønske')).toBe(foldText('oenske'));
    expect(foldText('Æble')).toBe(foldText('aeble'));
    expect(foldText('Café')).toBe('cafe');
  });

  it('splits text into words', () => {
    expect(tokenize('Felt X, (enhed) – 12,5')).toEqual(['felt', 'x', 'enhed', '12', '5']);
  });
});

describe('search', () => {
  const index = buildSearchIndex([testFormula], [testDisease]);

  it('finds a page by its title and ranks the title first', () => {
    const results = search(index, 'testformel');
    expect(results.formulas.map((hit) => hit.id)).toEqual(['test-formel']);
    expect(results.formulas[0]?.field).toBe('title');
  });

  it('says where the word was found', () => {
    expect(search(index, 'ønskeseddel').diseases[0]?.field).toBe('symptoms');
    expect(search(index, 'synonym').diseases[0]?.field).toBe('keywords');
    expect(search(index, 'tilstand').formulas[0]?.field).toBe('inputs');
  });

  it('finds parts of Danish compound words', () => {
    expect(search(index, 'syltetøj').formulas.map((hit) => hit.id)).toEqual(['test-formel']);
  });

  it('works with aa/oe spellings and ignores case', () => {
    expect(search(index, 'OENSKESEDDEL').total).toBe(1);
    expect(search(index, 'aarsager').diseases.map((hit) => hit.id)).toEqual(['test-sygdom']);
  });

  it('requires every word when several are typed', () => {
    expect(search(index, 'pladsholderord trin').total).toBe(1);
    expect(search(index, 'pladsholderord ukendtord').total).toBe(0);
  });

  it('groups results into diseases and formulas', () => {
    const results = search(index, 'pladsholder');
    expect(results.diseases.map((hit) => hit.id)).toEqual(['test-sygdom']);
    expect(results.formulas.map((hit) => hit.id)).toEqual(['test-formel']);
    expect(results.total).toBe(2);
  });

  it('ignores searches shorter than two characters and unknown words', () => {
    expect(search(index, 't').total).toBe(0);
    expect(search(index, '  ').total).toBe(0);
    expect(search(index, 'xyzxyz').total).toBe(0);
  });
});
