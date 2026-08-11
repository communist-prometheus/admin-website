import { describe, it, expect } from 'vitest';
import { EditorState } from '@codemirror/state';
import { wrapSelectionSpec, prefixLinesSpec, insertTextSpec } from './editor-commands.ts';

/** Builds a state with a single selection range and returns the applied doc text. */
const apply = (
  doc: string,
  anchor: number,
  head: number,
  spec: (state: EditorState) => import('@codemirror/state').TransactionSpec,
): string => {
  const state = EditorState.create({ doc, selection: { anchor, head } });
  return state.update(spec(state)).state.doc.toString();
};

describe('editor toolbar commands (QA: dead formatting toolbar)', () => {
  it('wraps a selection with inline markers (bold)', () => {
    expect(apply('hello world', 0, 5, (s) => wrapSelectionSpec(s, '**', '**'))).toBe(
      '**hello** world',
    );
  });

  it('inserts empty markers around a collapsed caret (italic)', () => {
    expect(apply('ab', 1, 1, (s) => wrapSelectionSpec(s, '_', '_'))).toBe('a__b');
  });

  it('prefixes every line the selection touches (heading)', () => {
    // selection spans line 1 and line 2, not line 3.
    expect(apply('a\nb\nc', 0, 3, (s) => prefixLinesSpec(s, '## '))).toBe('## a\n## b\nc');
  });

  it('prefixes the single caret line for a list item', () => {
    expect(apply('one\ntwo', 5, 5, (s) => prefixLinesSpec(s, '- '))).toBe('one\n- two');
  });

  it('replaces the selection with inserted text (image link)', () => {
    expect(apply('xy', 1, 1, (s) => insertTextSpec(s, '![](/a.png)'))).toBe('x![](/a.png)y');
  });
});
