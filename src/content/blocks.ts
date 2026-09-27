import type { Block } from './types';

/** A piece of text that is either normal or bold (`**fed**`). */
export interface TextSpan {
  text: string;
  bold: boolean;
}

/**
 * Splits text on `**` into normal and bold parts. An unmatched `**` is kept
 * as literal text, so nothing written in the content ever disappears.
 */
export function parseInline(text: string): TextSpan[] {
  const parts = text.split('**');
  if (parts.length % 2 === 0) return [{ text, bold: false }];
  return parts
    .map((part, index) => ({ text: part, bold: index % 2 === 1 }))
    .filter((span) => span.text.length > 0);
}

/** Plain text of a block (without `**`), used by the search. */
export function blockText(block: Block): string[] {
  const strip = (text: string) => parseInline(text).map((span) => span.text).join('');
  switch (block.type) {
    case 'paragraph':
    case 'warning':
      return [strip(block.text)];
    case 'bullets':
    case 'steps':
      return block.items.map(strip);
  }
}

export function blocksText(blocks: Block[]): string {
  return blocks.flatMap(blockText).join('\n');
}
