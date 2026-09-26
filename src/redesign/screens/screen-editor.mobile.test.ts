import { describe, it, expect, beforeEach, vi } from 'vitest';

vi.mock('../engine/github-api.js', () => ({ listDeployRuns: async () => [] }));

import './screen-editor.ts';
import { ScreenEditor } from './screen-editor.ts';

/**
 * Both editor actions an author reaches for on a phone were built as desktop
 * afterthoughts: the import control sat among the 35px formatting glyphs,
 * reading as one more of them, and the add-a-language button was a ghost
 * control dropped below the language tabs at 30px tall. Both are below any
 * usable touch target, and neither looked like the action it is.
 *
 * Formatting and document actions are separate groups now, and every control
 * an author taps gets a real target on a touch screen.
 */
const ARTICLE = '---\ntitle: "A"\nlang: ru\ncategory: programme\n---\n\nТекст\n';

interface EditorInternals {
  slug: string;
  collection: string;
  live: boolean;
  activeLang: string;
  availableLangs: readonly string[];
  applyMarkdown: (markdown: string, path: string, live: boolean) => void;
}

const inner = (el: ScreenEditor): EditorInternals => el as unknown as EditorInternals;

const mount = async (): Promise<ScreenEditor> => {
  const el: ScreenEditor = document.createElement('screen-editor');
  const priv = inner(el);
  priv.slug = 'x';
  priv.collection = 'blog';
  priv.live = true;
  priv.activeLang = 'ru';
  priv.availableLangs = ['ru'];
  document.body.append(el);
  await el.updateComplete;
  priv.applyMarkdown(ARTICLE, 'blog/x/index.ru.md', true);
  await el.updateComplete;
  return el;
};

const css = (): string => {
  const sheets = Array.isArray(ScreenEditor.styles) ? ScreenEditor.styles : [ScreenEditor.styles];
  return sheets.map((sheet) => String(Reflect.get(sheet ?? {}, 'cssText') ?? '')).join('\n');
};

/** The `@media (pointer: coarse)` block, where touch sizing lives. */
const coarseBlock = (): string => {
  const all = css();
  const at = all.indexOf('pointer: coarse');
  if (at === -1) return '';
  return all.slice(at, at + 1400);
};

beforeEach(() => {
  document.body.replaceChildren();
});

describe('the editor toolbar separates formatting from document actions', () => {
  it('keeps every formatting glyph in its own group', async () => {
    const el = await mount();
    const sr = el.shadowRoot;
    expect(sr?.querySelectorAll('.toolbar .tools .t').length).toBeGreaterThan(3);
  });

  it('puts import with the document actions, not among the glyphs', async () => {
    const el = await mount();
    const sr = el.shadowRoot;
    expect(sr?.querySelector('.toolbar .acts .import-pick')).not.toBeNull();
    expect(sr?.querySelector('.toolbar .tools .import-pick')).toBeNull();
  });

  it('still carries the file input that does the importing', async () => {
    const el = await mount();
    const input = el.shadowRoot?.querySelector<HTMLInputElement>('.import-pick input.import');
    expect(input?.accept).toBe('.docx,.html,.htm,.md');
  });

  it('lets the glyph row scroll instead of reflowing the actions away', () => {
    expect(css()).toMatch(/\.toolbar \.tools \{[^}]*overflow-x: auto/);
  });
});

describe('the language row keeps "add a language" beside the tabs', () => {
  it('renders the button as a sibling of the tabs, not below them', async () => {
    const el = await mount();
    const row = el.shadowRoot?.querySelector('.lang-row');
    expect(row?.querySelector('cp-tabs')).not.toBeNull();
    expect(row?.querySelector('[data-testid="add-lang"]')).not.toBeNull();
  });

  it('lays the row out as a row', () => {
    expect(css()).toMatch(/\.lang-row \{[^}]*display: flex/);
  });
});

describe('touch targets on a phone', () => {
  it('sizes the formatting glyphs for a finger', () => {
    expect(coarseBlock()).toMatch(/\.toolbar \.t \{[^}]*2\.75rem/);
  });

  it('sizes the import control for a finger', () => {
    expect(coarseBlock()).toMatch(/\.import-pick \{[^}]*min-height: 2\.75rem/);
  });

  it('sizes "add a language" for a finger', () => {
    expect(coarseBlock()).toMatch(/\.lang-row cp-button \{[^}]*min-height: 2\.75rem/);
  });
});
