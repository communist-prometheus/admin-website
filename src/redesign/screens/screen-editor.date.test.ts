import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ensureFreshToken } from '@/composables/useAuth/ensure-fresh-token';
import './screen-editor.ts';
import type { ScreenEditor } from './screen-editor.ts';

vi.mock('@/composables/useAuth/ensure-fresh-token', () => ({ ensureFreshToken: vi.fn() }));

/**
 * The publication date belongs to the translation, not to the material: a
 * translation goes out when it is ready, which is rarely the day the original
 * did. It sat with the material's properties, implying one date for all of them.
 *
 * A translation that carries no date of its own is seeded from another language
 * of the same material, so the field is never blank and the date is filled in
 * on the next publish rather than lost.
 */
const RU = '---\ntitle: "RU"\nlang: ru\ncategory: programme\npubDate: 2026-06-28\n---\n\nRU body\n';
const EN_NO_DATE = '---\ntitle: "EN"\nlang: en\ncategory: programme\n---\n\nEN body\n';

const acceptOf = (init?: RequestInit): string => {
  const h = init?.headers;
  return typeof h === 'object' && 'accept' in h ? String(Reflect.get(h, 'accept')) : '';
};

const stubRepo = (files: Record<string, string>): void => {
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    const path = decodeURIComponent(url.match(/contents\/([^?]+)/)?.[1] ?? '');
    if (url.includes('/git/trees/')) {
      return new Response(JSON.stringify({ tree: Object.keys(files).map((p) => ({ path: p })) }), {
        status: 200,
      });
    }
    if (acceptOf(init).includes('raw')) {
      return new Response(files[path] ?? '', { status: files[path] ? 200 : 404 });
    }
    return new Response(JSON.stringify({ sha: 'blob' }), { status: 200 });
  });
};

interface EditorInternals {
  slug: string;
  collection: string;
  live: boolean;
  activeLang: string;
  availableLangs: readonly string[];
  pubDate: string;
  readonly editedMarkdown: string;
  applyMarkdown: (markdown: string, path: string, live: boolean) => void;
  fillMissingDate: () => Promise<void>;
}

const editor = (markdown: string, lang = 'ru'): { el: ScreenEditor; priv: EditorInternals } => {
  const el = document.createElement('screen-editor') as ScreenEditor;
  const priv = el as unknown as EditorInternals;
  priv.slug = 'x';
  priv.collection = 'blog';
  priv.live = true;
  priv.activeLang = lang;
  priv.availableLangs = ['ru', 'en'];
  priv.applyMarkdown(markdown, `blog/x/index.${lang}.md`, true);
  return { el, priv };
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

describe('the date belongs to the translation', () => {
  it('sits with the translation properties, not the material ones', async () => {
    stubRepo({ 'blog/x/index.ru.md': RU });
    const { el } = editor(RU);
    document.body.append(el);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.props-translation cp-date-input')).not.toBeNull();
    expect(el.shadowRoot?.querySelector('.props-material cp-date-input')).toBeNull();
  });

  it('writes an edited date into the language being edited', () => {
    const { priv } = editor(RU);
    priv.pubDate = '2026-09-09';
    expect(priv.editedMarkdown).toContain('pubDate: 2026-09-09');
  });
});

describe('a translation with no date of its own', () => {
  it('takes the date from another language of the material', async () => {
    stubRepo({ 'blog/x/index.ru.md': RU, 'blog/x/index.en.md': EN_NO_DATE });
    const { priv } = editor(EN_NO_DATE, 'en');
    expect(priv.pubDate).toBe('');
    await priv.fillMissingDate();
    expect(priv.pubDate).toBe('2026-06-28');
  });

  it('stores that date on the next publish, so it stops being borrowed', async () => {
    stubRepo({ 'blog/x/index.ru.md': RU, 'blog/x/index.en.md': EN_NO_DATE });
    const { priv } = editor(EN_NO_DATE, 'en');
    await priv.fillMissingDate();
    expect(priv.editedMarkdown).toContain('pubDate: 2026-06-28');
  });

  it('leaves a translation that has its own date alone', async () => {
    const enDated = '---\ntitle: "EN"\nlang: en\ncategory: programme\npubDate: 2026-09-05\n---\n\nEN\n';
    stubRepo({ 'blog/x/index.ru.md': RU, 'blog/x/index.en.md': enDated });
    const { priv } = editor(enDated, 'en');
    await priv.fillMissingDate();
    expect(priv.pubDate).toBe('2026-09-05');
  });

  it('stays empty when no language of the material carries a date', async () => {
    const ruNoDate = '---\ntitle: "RU"\nlang: ru\ncategory: programme\n---\n\nRU\n';
    stubRepo({ 'blog/x/index.ru.md': ruNoDate, 'blog/x/index.en.md': EN_NO_DATE });
    const { priv } = editor(EN_NO_DATE, 'en');
    await priv.fillMissingDate();
    expect(priv.pubDate).toBe('');
    expect(priv.editedMarkdown).not.toContain('pubDate');
  });
});
