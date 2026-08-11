import { describe, it, expect, beforeEach } from 'vitest';

/**
 * Regression guard for the editor that renders every article. A caret-colour
 * tweak once added an `&light` selector to `EditorView.theme()`; that selector
 * is only valid in `baseTheme`, so `theme()` threw "Unsupported selector" inside
 * `firstUpdated()` — the CodeMirror view was never created and NO article body
 * rendered. These tests mount the real component and assert the view exists and
 * shows the value, so a broken theme can never ship silently again.
 */
import './cp-markdown-editor.ts';

const mount = async (value: string): Promise<HTMLElement> => {
  // The tag map gives this the CpMarkdownEditor type; `value` is public.
  const el = document.createElement('cp-markdown-editor');
  el.value = value;
  document.body.append(el);
  await el.updateComplete;
  return el;
};

describe('cp-markdown-editor', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('creates the CodeMirror view during firstUpdated (theme must not throw)', async () => {
    const el = await mount('# Title\n\nHello body');
    expect(Reflect.get(el, 'view')).toBeDefined();
    expect(el.shadowRoot?.querySelector('.cm-editor')).not.toBeNull();
  });

  it('renders the supplied markdown into the editor content', async () => {
    const el = await mount('# Title\n\nHello body');
    const content = el.shadowRoot?.querySelector('.cm-content')?.textContent ?? '';
    expect(content).toContain('Hello body');
  });
});
