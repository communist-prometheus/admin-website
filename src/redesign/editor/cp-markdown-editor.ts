import { LitElement, html, css, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { markdown } from '@codemirror/lang-markdown';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import { livePreview } from './live-preview.js';
import { insertTextSpec, prefixLinesSpec, wrapSelectionSpec } from './editor-commands.js';

/**
 * `cp-markdown-editor` — a self-contained Obsidian-style live-preview markdown
 * editor built on CodeMirror 6. Formatting renders inline and the raw syntax
 * reveals itself only on the caret's line (see {@link livePreview}). It takes a
 * `value` (the markdown) and emits `cp-change` with the edited text — no engine
 * coupling, so it can be tested and reused in isolation.
 */
@customElement('cp-markdown-editor')
export class CpMarkdownEditor extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    .host {
      font-size: 1.05rem;
    }
    .cm-editor {
      background: transparent;
      color: var(--color-text-primary);
    }
    .cm-editor.cm-focused {
      outline: none;
    }
    .cm-scroller {
      font-family: var(--font-sans);
      line-height: 1.7;
    }
    .cm-content {
      padding: 0;
      /* CodeMirror's baseTheme forces the native caret black via
         '.cm-light .cm-content' (specificity 0,2,0). Override with !important so
         the caret is the accent colour on the dark ground — cheaper and, unlike
         an '&light' theme rule, valid (that selector throws in EditorView.theme
         and killed the whole editor init). */
      caret-color: var(--color-accent) !important;
    }
    .cm-line {
      padding: 0;
    }
    .cm-cursor {
      border-left-color: var(--color-accent);
      border-left-width: 2px;
    }
  `;

  /** The markdown document. Two-way: external changes push into the editor. */
  @property({ type: String }) value = '';

  /** Placeholder shown when the document is empty. */
  @property({ type: String }) placeholder = '';

  private view?: EditorView;

  override firstUpdated(): void {
    const parent = this.renderRoot.querySelector<HTMLElement>('.host');
    if (parent === null) return;
    this.view = new EditorView({
      parent,
      root: this.shadowRoot ?? undefined,
      state: EditorState.create({
        doc: this.value,
        extensions: [
          history(),
          keymap.of([...defaultKeymap, ...historyKeymap]),
          markdown(),
          livePreview(),
          EditorView.lineWrapping,
          placeholder(this.placeholder),
          this.appTheme(),
          EditorView.updateListener.of((update) => {
            // Emit only for user edits, never for the programmatic `value` sync in
            // updated(): after a sync the doc equals `this.value`; a user edit
            // leaves the doc diverged from the (stale) prop. Emitting on the sync
            // made the host mark every freshly-opened article as dirty.
            if (update.docChanged && update.state.doc.toString() !== this.value) this.emit();
          }),
        ],
      }),
    });
  }

  override updated(changed: PropertyValues): void {
    if (!changed.has('value') || this.view === undefined) return;
    const current = this.view.state.doc.toString();
    if (this.value === current) return;
    this.view.dispatch({
      changes: { from: 0, to: current.length, insert: this.value },
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.view?.destroy();
  }

  /** CodeMirror theme wired to the app's design tokens (light + dark). */
  private appTheme() {
    return EditorView.theme({
      '&': { backgroundColor: 'transparent', color: 'var(--color-text-primary)' },
      // CodeMirror defaults the content to a monospace font; the article editor
      // must read in the site's sans like the rendered page.
      '.cm-content, .cm-scroller, .cm-line': {
        fontFamily: 'var(--font-sans)',
        fontSize: '1.05rem',
        lineHeight: '1.75',
      },
      '.cm-selectionBackground, ::selection': {
        backgroundColor: 'var(--accent-bg) !important',
      },
      // NB: the caret colour is handled by the static `.cm-content` rule with
      // `!important` (see styles above). Do NOT add an `&light`/`&dark` selector
      // here — those are only valid in `baseTheme`; in `theme()` they throw
      // "Unsupported selector" and abort editor initialisation entirely.
      '.cm-activeLine': { backgroundColor: 'transparent' },
      '.cm-placeholder': { color: 'var(--color-text-secondary)' },
    });
  }

  private emit(): void {
    const value = this.view?.state.doc.toString() ?? '';
    this.dispatchEvent(
      new CustomEvent('cp-change', { detail: { value }, bubbles: true, composed: true }),
    );
  }

  /** Focuses the editor (used when opening a document). */
  focus(): void {
    this.view?.focus();
  }

  /** Wraps the selection with `before`/`after` (bold, italic). */
  wrapSelection(before: string, after: string): void {
    const view = this.view;
    if (view === undefined) return;
    view.dispatch(wrapSelectionSpec(view.state, before, after));
    view.focus();
  }

  /** Prepends `prefix` to every selected line (heading, quote, list). */
  prefixLines(prefix: string): void {
    const view = this.view;
    if (view === undefined) return;
    view.dispatch(prefixLinesSpec(view.state, prefix));
    view.focus();
  }

  /** Inserts `text` at the caret, replacing any selection (image link). */
  insertText(text: string): void {
    const view = this.view;
    if (view === undefined) return;
    view.dispatch(insertTextSpec(view.state, text));
    view.focus();
  }

  override render() {
    return html`<div class="host"></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cp-markdown-editor': CpMarkdownEditor;
  }
}
