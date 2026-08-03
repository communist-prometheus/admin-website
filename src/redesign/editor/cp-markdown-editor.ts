import { LitElement, html, css, type PropertyValues } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { markdown } from '@codemirror/lang-markdown';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { EditorState } from '@codemirror/state';
import { EditorView, keymap, placeholder } from '@codemirror/view';
import { livePreview } from './live-preview.js';

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
      caret-color: var(--color-accent);
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
            if (update.docChanged) this.emit();
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

  override render() {
    return html`<div class="host"></div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cp-markdown-editor': CpMarkdownEditor;
  }
}
