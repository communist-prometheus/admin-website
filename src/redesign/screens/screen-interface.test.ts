import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ensureFreshToken } from '@/composables/useAuth/ensure-fresh-token';
import { parseFrontmatterStrict } from '@/sw/handlers/shared/frontmatter';
import './screen-interface.ts';
import type { ScreenInterface } from './screen-interface.ts';

vi.mock('@/composables/useAuth/ensure-fresh-token', () => ({ ensureFreshToken: vi.fn() }));

/*
 * Reported 2026-10-27: the site's header and shared captions "got lost", and
 * the admin had no place to translate them. They live in `common/menu` and
 * `common/labels`, one file per language. Only the retired client could edit
 * them; the rebuilt admin had no screen at all, and four of the eight site
 * languages had no files, so their header silently rendered in English.
 */
const LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
  { code: 'de', label: 'Deutsch' },
];
const MENU_EN = '---\ntitle: Navigation\nhome: Home\nblog: Blog\nlang: en\n---\n';
const MENU_RU = '---\ntitle: Навигация\nhome: Главная\nblog: Блог\nlang: ru\n---\n';
const LABELS_EN = '---\ntitle: Common Labels\nreadMore: Read more\nlang: en\n---\n';
const LABELS_RU = '---\ntitle: Общие метки\nreadMore: Читать далее\nlang: ru\n---\n';

const baseFiles = (): Record<string, string> => ({
  'settings/languages.json': JSON.stringify(LANGUAGES),
  'common/menu/index.en.md': MENU_EN,
  'common/menu/index.ru.md': MENU_RU,
  'common/labels/index.en.md': LABELS_EN,
  'common/labels/index.ru.md': LABELS_RU,
});

const decode = (b64: string): string =>
  new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));

const acceptOf = (init?: RequestInit): string => {
  const h = init?.headers;
  return typeof h === 'object' && 'accept' in h ? String(Reflect.get(h, 'accept')) : '';
};

const stubGitHub = (files: Record<string, string>, puts: string[], failing = ''): void => {
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    const path = decodeURIComponent(url.match(/contents\/([^?]+)/)?.[1] ?? '');
    if (path === failing) return new Response('{"message":"Bad credentials"}', { status: 401 });
    if (init?.method === 'PUT') {
      files[path] = decode(JSON.parse(String(init.body)).content);
      puts.push(path);
      return new Response(JSON.stringify({ commit: { sha: 'c' } }), { status: 201 });
    }
    if (acceptOf(init).includes('raw')) {
      return new Response(files[path] ?? '', { status: files[path] ? 200 : 404 });
    }
    return new Response(JSON.stringify({ sha: 'blob' }), { status: files[path] ? 200 : 404 });
  });
};

interface InterfaceInternals {
  loading: boolean;
  activeLang: string;
  save: () => Promise<void>;
  updateString: (group: 'menu' | 'labels', key: string, value: string) => void;
}

const inner = (el: ScreenInterface): InterfaceInternals => el as unknown as InterfaceInternals;

const mount = async (): Promise<ScreenInterface> => {
  const el = document.createElement('screen-interface');
  document.body.append(el);
  for (let i = 0; i < 60 && inner(el).loading; i += 1) await new Promise((r) => setTimeout(r, 10));
  await el.updateComplete;
  return el;
};

const text = (el: HTMLElement): string => (el.shadowRoot?.textContent ?? '').replace(/\s+/g, ' ').trim();

const inputs = (el: HTMLElement): readonly { value: string; placeholder: string }[] =>
  [...(el.shadowRoot?.querySelectorAll('cp-input') ?? [])].map((input) => ({
    value: String(Reflect.get(input, 'value') ?? ''),
    placeholder: String(Reflect.get(input, 'placeholder') ?? ''),
  }));

const tabIds = (el: HTMLElement): readonly string[] => {
  const tabs: unknown = Reflect.get(el.shadowRoot?.querySelector('cp-tabs') ?? {}, 'tabs');
  return Array.isArray(tabs) ? tabs.map((tab) => String(Reflect.get(tab, 'id'))) : [];
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

describe('screen-interface: where the site header and captions are translated', () => {
  it('offers a tab for every language the site publishes in', async () => {
    stubGitHub(baseFiles(), []);
    const el = await mount();
    expect(tabIds(el)).toEqual(['en', 'ru', 'de']);
  });

  it('shows the texts of the chosen language', async () => {
    stubGitHub(baseFiles(), []);
    const el = await mount();
    inner(el).activeLang = 'ru';
    await el.updateComplete;
    expect(inputs(el).map((input) => input.value)).toEqual(['Главная', 'Блог', 'Читать далее']);
  });

  it('names the languages that would fall back to the default one', async () => {
    stubGitHub(baseFiles(), []);
    const el = await mount();
    expect(text(el)).toMatch(/не переведено/i);
    expect(text(el)).toContain('DE');
  });

  it('shows an untranslated text empty, with the default-language text as the hint', async () => {
    stubGitHub(baseFiles(), []);
    const el = await mount();
    inner(el).activeLang = 'de';
    await el.updateComplete;
    expect(inputs(el)[0]).toEqual({ value: '', placeholder: 'Home' });
  });

  it('creates the file of a language that had none', async () => {
    const files = baseFiles();
    const puts: string[] = [];
    stubGitHub(files, puts);
    const el = await mount();
    inner(el).activeLang = 'de';
    inner(el).updateString('menu', 'home', 'Startseite');
    await inner(el).save();
    expect(puts).toEqual(['common/menu/index.de.md']);
    expect(parseFrontmatterStrict(files['common/menu/index.de.md'] ?? '')).toEqual({
      title: 'Navigation',
      home: 'Startseite',
      lang: 'de',
    });
  });

  it('writes only the language that changed, keeping its title', async () => {
    const files = baseFiles();
    const puts: string[] = [];
    stubGitHub(files, puts);
    const el = await mount();
    inner(el).activeLang = 'ru';
    inner(el).updateString('menu', 'blog', 'Журнал статей');
    await inner(el).save();
    expect(puts).toEqual(['common/menu/index.ru.md']);
    expect(parseFrontmatterStrict(files['common/menu/index.ru.md'] ?? '')).toEqual({
      title: 'Навигация',
      home: 'Главная',
      blog: 'Журнал статей',
      lang: 'ru',
    });
  });

  it('commits nothing when nothing changed', async () => {
    const puts: string[] = [];
    stubGitHub(baseFiles(), puts);
    const el = await mount();
    await inner(el).save();
    expect(puts).toEqual([]);
    expect(text(el)).toMatch(/изменений нет/i);
  });

  it('refuses to edit when a file cannot be read, instead of passing it off as untranslated', async () => {
    const puts: string[] = [];
    stubGitHub(baseFiles(), puts, 'common/menu/index.ru.md');
    const el = await mount();
    expect(text(el)).toMatch(/не удалось/i);
    expect(inputs(el)).toEqual([]);
    await inner(el).save();
    expect(puts).toEqual([]);
  });
});
