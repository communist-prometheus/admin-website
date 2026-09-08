import { beforeEach, describe, expect, it } from 'vitest';
import './screen-editor.ts';
import { ScreenEditor } from './screen-editor.ts';

/**
 * The lead (`description`) is the block the public article page renders above
 * the body, with an accent rule down its left edge. In the admin it was a plain
 * two-row textarea with a scrollbar, so a long lead was edited through a slot
 * three lines high and looked nothing like what a reader gets.
 */
const ARTICLE = '---\ntitle: "T"\nlang: ru\ncategory: programme\n---\n\nBody\n';

interface EditorInternals {
  slug: string;
  collection: string;
  live: boolean;
  activeLang: string;
  availableLangs: readonly string[];
  description: string;
  onLeadInput: (event: Event) => void;
  applyMarkdown: (markdown: string, path: string, live: boolean) => void;
}

const mounted = async (): Promise<{ el: ScreenEditor; priv: EditorInternals }> => {
  const el = document.createElement('screen-editor') as ScreenEditor;
  const priv = el as unknown as EditorInternals;
  priv.slug = 'x';
  priv.collection = 'blog';
  priv.live = true;
  priv.activeLang = 'ru';
  priv.availableLangs = ['ru'];
  priv.applyMarkdown(ARTICLE, 'blog/x/index.ru.md', true);
  document.body.append(el);
  await el.updateComplete;
  return { el, priv };
};

const leadOf = (el: ScreenEditor): HTMLTextAreaElement => {
  const lead = el.shadowRoot?.querySelector('textarea.lead');
  if (!(lead instanceof HTMLTextAreaElement)) throw new Error('lead missing');
  return lead;
};

beforeEach(() => {
  document.body.replaceChildren();
});

describe('the lead field', () => {
  it('grows with the text instead of scrolling inside a fixed box', async () => {
    const { el } = await mounted();
    const lead = leadOf(el);
    // jsdom reports no layout, so the component must set the height itself.
    Object.defineProperty(lead, 'scrollHeight', { value: 420, configurable: true });
    lead.value = 'A very long lead, several lines worth.';
    lead.dispatchEvent(new Event('input', { bubbles: true, composed: true }));
    await el.updateComplete;
    expect(lead.style.height).toBe('420px');
    expect(lead.rows).toBe(1);
  });

  it('sizes itself for the text it was loaded with, not only while typing', async () => {
    const el = document.createElement('screen-editor') as ScreenEditor;
    const priv = el as unknown as EditorInternals;
    priv.slug = 'x';
    priv.collection = 'blog';
    priv.live = true;
    priv.activeLang = 'ru';
    priv.availableLangs = ['ru'];
    document.body.append(el);
    await el.updateComplete;
    const lead = leadOf(el);
    Object.defineProperty(lead, 'scrollHeight', { value: 260, configurable: true });

    priv.applyMarkdown(
      '---\ntitle: "T"\nlang: ru\ncategory: t\ndescription: |-\n  Line one.\n  Line two.\n---\n\nB\n',
      'blog/x/index.ru.md',
      true,
    );
    await el.updateComplete;
    expect(lead.style.height).toBe('260px');
  });

  it('carries the article-page lead styling: an accent rule down its left edge', () => {
    // Read the component's own stylesheet: the test DOM does not implement
    // adopted stylesheets.
    const sheets = Array.isArray(ScreenEditor.styles) ? ScreenEditor.styles : [ScreenEditor.styles];
    const css = sheets.map((sheet) => String(Reflect.get(sheet ?? {}, 'cssText') ?? '')).join('\n');
    const start = css.indexOf('.lead {');
    const leadRule = css.slice(start, css.indexOf('}', start));
    expect(leadRule).toContain('border-left: 3px solid var(--color-accent)');
    expect(leadRule).toContain('font-size: 1.125rem');
    expect(leadRule).toContain('line-height: 1.65');
    // It grows instead of scrolling: no resize handle, no inner scrollbar.
    expect(leadRule).toContain('resize: none');
    expect(leadRule).toContain('overflow: hidden');
  });
});
