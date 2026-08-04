import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * The editor reads a language's markdown through the content engine; stub that
 * one read. These tests drive the element WITHOUT connecting it to the document
 * so LitElement never renders — that keeps the CodeMirror preview (which under
 * jsdom echoes stale change events back into `body`) out of the picture, so the
 * assertions observe the language-buffer logic itself, not a jsdom artefact.
 */
vi.mock('../engine/content.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../engine/content.js')>();
  const docs: Record<string, string> = {
    'blog/x/index.ru.md': '---\ntitle: "RU"\ncategory: t\npublished: true\n---\n\nRU body\n',
    'blog/x/index.en.md': '---\ntitle: "EN"\ncategory: t\npublished: true\n---\n\nEN body\n',
  };
  return { ...actual, readFile: async (path: string) => docs[path] };
});

const RU = '---\ntitle: "RU"\ncategory: t\npublished: true\n---\n\nRU body\n';

import './screen-editor.ts';
import type { ScreenEditor } from './screen-editor.ts';

interface EditorInternals {
  slug: string;
  live: boolean;
  activeLang: string;
  body: string;
  applyMarkdown: (markdown: string, path: string, live: boolean) => void;
  onLangChange: (event: Event) => void;
  switchLang: (lang: string) => Promise<void>;
}

/** An editor seeded with the RU article, as if it had just loaded. */
const seededEditor = (): EditorInternals => {
  const el = document.createElement('screen-editor') as ScreenEditor;
  const priv = el as unknown as EditorInternals;
  priv.slug = 'x';
  priv.live = true;
  priv.activeLang = 'ru';
  priv.applyMarkdown(RU, 'blog/x/index.ru.md', true);
  return priv;
};

const langEvent = (lang: string): Event =>
  new CustomEvent('cp-tab-change', { detail: { id: lang } });

/** Lets the fire-and-forget switchLang() readFile chain settle. */
const flush = async (): Promise<void> => {
  for (let i = 0; i < 4; i += 1) await Promise.resolve();
};

describe('screen-editor language tab (QA #8: edits survive tab switches)', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('reads the requested language from disk', async () => {
    const el = seededEditor();
    expect(el.body).toContain('RU body');
    await el.switchLang('en');
    expect(el.body).toContain('EN body');
  });

  it('buffers the current language edits when switching away', () => {
    const el = seededEditor();
    el.body = 'RU EDITED';
    el.onLangChange(langEvent('en'));
    const buffered = (el as unknown as { langBuffers: Map<string, string> }).langBuffers.get('ru');
    expect(buffered).toBeDefined();
    expect(buffered).toContain('RU EDITED');
  });

  it('restores an unsaved edit when switching back to a language', async () => {
    const el = seededEditor();
    el.body = 'RU EDITED';

    // Switch to EN (loads from disk), then back to RU (restores the buffer).
    el.onLangChange(langEvent('en'));
    await flush();
    expect(el.body).toContain('EN body');

    el.onLangChange(langEvent('ru'));
    await flush();
    expect(el.body).toContain('RU EDITED');
  });
});
