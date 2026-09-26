import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ensureFreshToken } from '@/composables/useAuth/ensure-fresh-token';
import './screen-editor.ts';
import type { ScreenEditor } from './screen-editor.ts';

vi.mock('@/composables/useAuth/ensure-fresh-token', () => ({ ensureFreshToken: vi.fn() }));
vi.mock('../engine/github-api.js', () => ({ listDeployRuns: async () => [] }));

/**
 * A translation created with the add-a-language button is seeded from the
 * original, and it used to inherit the original's date with it. Three English
 * translations uploaded on 22–23 September were therefore dated early July —
 * older than the newsletter's watermark — and the digest never carried them.
 *
 * A translation is published the day it is made, so that is the date it gets.
 *
 * The second half of the same failure: a file that carries BOTH `pubDate` and
 * `publishDate` was edited on `pubDate` alone, because that key comes first.
 * The site reads `publishDate` when present, so the editor's date change was
 * invisible on the site. Every date key the file carries is written now.
 */
const RU = [
  '---',
  'title: "Original"',
  'lang: ru',
  'category: programme',
  'publishDate: 2026-07-04',
  'published: true',
  '---',
  '',
  'Body text.',
  '',
].join('\n');

const BOTH_KEYS = [
  '---',
  'title: "Original"',
  'lang: ru',
  'category: programme',
  'pubDate: 2026-07-04',
  'publishDate: 2026-07-04',
  'published: true',
  '---',
  '',
  'Body text.',
  '',
].join('\n');

const TODAY = '2026-09-27';

interface EditorInternals {
  slug: string;
  collection: string;
  live: boolean;
  activeLang: string;
  availableLangs: readonly string[];
  addLangChoice: string;
  pubDate: string;
  readonly editedMarkdown: string;
  applyMarkdown: (markdown: string, path: string, live: boolean) => void;
  confirmAddLang: () => Promise<void>;
}

const inner = (el: ScreenEditor): EditorInternals => el as unknown as EditorInternals;

/** Captures what the screen commits, so the seed can be inspected. */
const written: { path: string; body: string }[] = [];

const stubRepo = (): void => {
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    if (init?.method === 'PUT') {
      const body: unknown = JSON.parse(String(init.body));
      const path = decodeURIComponent(url.match(/contents\/([^?]+)/)?.[1] ?? '');
      const content = String(Reflect.get(Object(body), 'content'));
      written.push({ path, body: new TextDecoder().decode(Uint8Array.from(atob(content), (c) => c.charCodeAt(0))) });
      return new Response(JSON.stringify({ content: { sha: 'new' } }), { status: 200 });
    }
    if (url.includes('/git/trees/')) return new Response(JSON.stringify({ tree: [] }), { status: 200 });
    return new Response(JSON.stringify({ sha: 'blob' }), { status: 200 });
  });
};

const editor = (markdown: string): { el: ScreenEditor; priv: EditorInternals } => {
  const el: ScreenEditor = document.createElement('screen-editor');
  const priv = inner(el);
  priv.slug = 'x';
  priv.collection = 'blog';
  priv.live = true;
  priv.activeLang = 'ru';
  priv.availableLangs = ['ru'];
  priv.applyMarkdown(markdown, 'blog/x/index.ru.md', true);
  return { el, priv };
};

beforeEach(() => {
  written.length = 0;
  document.body.replaceChildren();
  vi.useFakeTimers();
  vi.setSystemTime(new Date(`${TODAY}T10:00:00Z`));
  vi.stubEnv('VITE_DEV_TOKEN', '');
  vi.mocked(ensureFreshToken).mockResolvedValue('tok');
  stubRepo();
});

afterEach(() => {
  vi.useRealTimers();
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('a translation is dated the day it is made', () => {
  it('stamps today on the new language instead of the original date', async () => {
    const { priv } = editor(RU);
    priv.addLangChoice = 'en';
    await priv.confirmAddLang();
    const seed = written.find((w) => w.path.endsWith('index.en.md'));
    expect(seed?.body).toContain(`publishDate: ${TODAY}`);
    expect(seed?.body).not.toContain('2026-07-04');
  });

  it('shows that date in the translation properties straight away', async () => {
    const { priv } = editor(RU);
    priv.addLangChoice = 'en';
    await priv.confirmAddLang();
    expect(priv.pubDate).toBe(TODAY);
  });

  it('leaves the original untouched', async () => {
    const { priv } = editor(RU);
    priv.addLangChoice = 'en';
    await priv.confirmAddLang();
    expect(written.some((w) => w.path.endsWith('index.ru.md'))).toBe(false);
  });

  it('stamps every date key the original carried', async () => {
    const { priv } = editor(BOTH_KEYS);
    priv.addLangChoice = 'en';
    await priv.confirmAddLang();
    const seed = written.find((w) => w.path.endsWith('index.en.md'))?.body ?? '';
    expect(seed).toContain(`pubDate: ${TODAY}`);
    expect(seed).toContain(`publishDate: ${TODAY}`);
  });

  it('still marks the new translation an unpublished draft', async () => {
    const { priv } = editor(RU);
    priv.addLangChoice = 'en';
    await priv.confirmAddLang();
    expect(written[0]?.body).toContain('published: false');
  });
});

describe('editing the date of a file with two date keys', () => {
  it('writes both, so the site cannot read a stale one', () => {
    const { priv } = editor(BOTH_KEYS);
    priv.pubDate = '2026-09-27';
    expect(priv.editedMarkdown).toContain('pubDate: 2026-09-27');
    expect(priv.editedMarkdown).toContain('publishDate: 2026-09-27');
  });

  it('does not grow a second key on a file that carries one', () => {
    const { priv } = editor(RU);
    priv.pubDate = '2026-09-27';
    expect(priv.editedMarkdown).toContain('publishDate: 2026-09-27');
    expect(priv.editedMarkdown).not.toContain('pubDate: ');
  });
});
