import { blocksText, parseInline } from '../blocks';

describe('parseInline', () => {
  it('splits **bold** from normal text', () => {
    expect(parseInline('Tekst med **fed** tekst')).toEqual([
      { text: 'Tekst med ', bold: false },
      { text: 'fed', bold: true },
      { text: ' tekst', bold: false },
    ]);
  });

  it('keeps an unmatched ** as literal text, so nothing disappears', () => {
    expect(parseInline('Tekst med **halv')).toEqual([{ text: 'Tekst med **halv', bold: false }]);
  });
});

describe('blocksText', () => {
  it('returns the plain text of all blocks without ** markers', () => {
    expect(
      blocksText([
        { type: 'paragraph', text: 'Et **afsnit**' },
        { type: 'bullets', items: ['a', 'b'] },
        { type: 'steps', items: ['c'] },
        { type: 'warning', text: 'd' },
      ]),
    ).toBe('Et afsnit\na\nb\nc\nd');
  });
});
