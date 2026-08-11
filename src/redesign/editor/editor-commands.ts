import { EditorSelection, type EditorState, type TransactionSpec } from '@codemirror/state';

/**
 * Pure CodeMirror transaction builders for the editor's formatting toolbar.
 * They take an `EditorState` and return a `TransactionSpec` — no view, no DOM —
 * so the toolbar's behaviour is unit-testable without a live editor.
 */

/**
 * Wraps every selection range with `before`/`after` (inline formatting like
 * bold `**` or italic `_`). A collapsed selection inserts the markers and
 * leaves the caret between them so the editor can keep typing inside.
 */
export const wrapSelectionSpec = (
  state: EditorState,
  before: string,
  after: string,
): TransactionSpec =>
  state.changeByRange((range) => ({
    changes: [
      { from: range.from, insert: before },
      { from: range.to, insert: after },
    ],
    range: EditorSelection.range(range.from + before.length, range.to + before.length),
  }));

/**
 * Prepends `prefix` to the start of every line the selection touches
 * (block formatting like a heading `## `, quote `> ` or list `- `). Lines are
 * deduplicated so overlapping ranges never prefix a line twice.
 */
export const prefixLinesSpec = (state: EditorState, prefix: string): TransactionSpec => {
  const seen = new Set<number>();
  const changes: { from: number; insert: string }[] = [];
  for (const range of state.selection.ranges) {
    const first = state.doc.lineAt(range.from).number;
    const last = state.doc.lineAt(range.to).number;
    for (let n = first; n <= last; n += 1) {
      const line = state.doc.line(n);
      if (seen.has(line.from)) continue;
      seen.add(line.from);
      changes.push({ from: line.from, insert: prefix });
    }
  }
  return { changes };
};

/** Replaces the current selection with `text` (e.g. an image placeholder). */
export const insertTextSpec = (state: EditorState, text: string): TransactionSpec =>
  state.replaceSelection(text);
