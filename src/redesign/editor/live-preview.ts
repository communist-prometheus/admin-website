import { syntaxTree, HighlightStyle, syntaxHighlighting } from '@codemirror/language';
import { RangeSetBuilder, type Extension } from '@codemirror/state';
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
} from '@codemirror/view';
import { tags } from '@lezer/highlight';

/**
 * Obsidian-style live preview for a CodeMirror 6 markdown editor. Two pieces
 * working together:
 *
 * 1. {@link markdownHighlight} renders the formatting itself — headings grow,
 *    `**bold**` is bold, `_italic_` is italic, quotes and inline code get their
 *    own look — straight off the Lezer markdown tree, so it is always on.
 * 2. {@link hideMarkersPlugin} hides the raw syntax markers (`#`, `**`, `>`, …)
 *    on every line EXCEPT the one the caret is on, so the source reveals itself
 *    only where you are editing. This is exactly Obsidian's live-preview model.
 */

/** Formatting rendered from the markdown syntax tree (always visible). */
const markdownHighlight = HighlightStyle.define([
  { tag: tags.heading1, fontSize: '1.9rem', fontWeight: '700', lineHeight: '1.25' },
  { tag: tags.heading2, fontSize: '1.5rem', fontWeight: '700', lineHeight: '1.3' },
  { tag: tags.heading3, fontSize: '1.25rem', fontWeight: '700' },
  { tag: [tags.heading4, tags.heading5, tags.heading6], fontWeight: '700' },
  { tag: tags.strong, fontWeight: '700' },
  { tag: tags.emphasis, fontStyle: 'italic' },
  { tag: tags.strikethrough, textDecoration: 'line-through' },
  { tag: tags.quote, color: 'var(--color-text-secondary)', fontStyle: 'italic' },
  { tag: tags.monospace, fontFamily: 'var(--font-mono)', fontSize: '0.9em' },
  { tag: tags.link, color: 'var(--color-accent)' },
  { tag: tags.url, color: 'var(--color-text-secondary)' },
  { tag: [tags.processingInstruction, tags.meta], color: 'var(--color-text-secondary)' },
]);

/** Lezer node names for the raw syntax markers we hide off the active line. */
const MARKER_NODES = new Set([
  'HeaderMark',
  'EmphasisMark',
  'StrongMark',
  'StrikethroughMark',
  'QuoteMark',
  'CodeMark',
  'LinkMark',
  'URL',
]);

const hide = Decoration.replace({});

/** Builds the "hide markers except on the caret's line" decoration set. */
const buildMarkerDecorations = (view: EditorView): DecorationSet => {
  const builder = new RangeSetBuilder<Decoration>();
  const { head } = view.state.selection.main;
  const activeLine = view.state.doc.lineAt(head).number;
  for (const { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter: (node) => {
        if (!MARKER_NODES.has(node.name)) return;
        if (node.from === node.to) return;
        if (view.state.doc.lineAt(node.from).number === activeLine) return;
        builder.add(node.from, node.to, hide);
      },
    });
  }
  return builder.finish();
};

/** Re-hides markers on every doc/selection/viewport change. */
const hideMarkersPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    constructor(view: EditorView) {
      this.decorations = buildMarkerDecorations(view);
    }
    update(update: ViewUpdate): void {
      if (update.docChanged || update.selectionSet || update.viewportChanged) {
        this.decorations = buildMarkerDecorations(update.view);
      }
    }
  },
  { decorations: (plugin) => plugin.decorations },
);

/** The full live-preview extension bundle (highlight + marker hiding). */
export const livePreview = (): Extension => [
  syntaxHighlighting(markdownHighlight),
  hideMarkersPlugin,
];
