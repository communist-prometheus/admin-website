import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ensureFreshToken } from '@/composables/useAuth/ensure-fresh-token';
import './screen-editor.ts';
import type { ScreenEditor } from './screen-editor.ts';

vi.mock('@/composables/useAuth/ensure-fresh-token', () => ({ ensureFreshToken: vi.fn() }));

/**
 * The add-translation dialog seeds `index.<lang>.md` from the open language's
 * text with ONE Contents-API commit. That commit must pass the same content gate
 * every other write does: a source whose frontmatter is already unbuildable (say, edited by hand
 * on github.com) must not be cloned into a second broken language, and the
 * editor must see why instead of a silent success.
 */
const BROKEN_RU = [
  '---',
  'title: Excess Capital',
  'lang: ru',
  'description: Marx exposes the paradox of the system: surplus capital.',
  '"Without revolutionary theory", reads the axiom.',
  'category: programme',
  'published: true',
  '---',
  '',
  'Body',
  '',
].join('\n');

const GOOD_RU = '---\ntitle: "RU"\nlang: ru\ncategory: t\npublished: true\n---\n\nRU body\n';

interface EditorInternals {
  slug: string;
  collection: string;
  live: boolean;
  activeLang: string;
  availableLangs: readonly string[];
  addLangChoice: string;
  addLangError: string;
  applyMarkdown: (markdown: string, path: string, live: boolean) => void;
  confirmAddLang: () => Promise<void>;
}

const seededEditor = (markdown: string): EditorInternals => {
  const el = document.createElement('screen-editor') as ScreenEditor;
  const priv = el as unknown as EditorInternals;
  priv.slug = 'x';
  priv.collection = 'blog';
  priv.live = true;
  priv.activeLang = 'ru';
  priv.availableLangs = ['ru'];
  priv.applyMarkdown(markdown, 'blog/x/index.ru.md', true);
  priv.addLangChoice = 'en';
  return priv;
};

/** Records every Contents-API PUT; answers the blob-sha probe with 404 (new file). */
const stubGitHub = (puts: Array<{ path: string; content: string }>): void => {
  const decode = (b64: string): string =>
    new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    const path = decodeURIComponent(url.match(/contents\/([^?]+)/)?.[1] ?? '');
    if (init?.method === 'PUT') {
      puts.push({ path, content: decode(JSON.parse(String(init.body)).content) });
      return new Response(JSON.stringify({ commit: { sha: 'c' } }), { status: 201 });
    }
    return new Response('', { status: 404 });
  });
};

beforeEach(() => {
  document.body.replaceChildren();
  vi.stubEnv('VITE_DEV_TOKEN', '');
  vi.stubEnv('VITE_GITHUB_BRANCH', 'develop');
  vi.mocked(ensureFreshToken).mockResolvedValue('tok');
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('screen-editor add-translation goes through the content gate', () => {
  it('seeds a valid source into a new language with lang + draft flag rewritten', async () => {
    const puts: Array<{ path: string; content: string }> = [];
    stubGitHub(puts);
    const el = seededEditor(GOOD_RU);
    await el.confirmAddLang();
    expect(el.addLangError).toBe('');
    expect(puts).toHaveLength(1);
    expect(puts[0].path).toBe('blog/x/index.en.md');
    expect(puts[0].content).toContain('lang: en');
    expect(puts[0].content).toContain('published: false');
    expect(el.availableLangs).toEqual(['en', 'ru']);
  });

  it('refuses to clone unbuildable frontmatter and tells the editor why (no commit)', async () => {
    const puts: Array<{ path: string; content: string }> = [];
    stubGitHub(puts);
    const el = seededEditor(BROKEN_RU);
    await el.confirmAddLang();
    expect(puts).toEqual([]);
    expect(el.addLangError).toMatch(/YAML/);
    expect(el.availableLangs).toEqual(['ru']);
  });
});
