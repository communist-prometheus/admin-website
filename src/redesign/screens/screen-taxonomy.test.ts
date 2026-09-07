import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ensureFreshToken } from '@/composables/useAuth/ensure-fresh-token';
import './screen-topics.ts';
import './screen-categories.ts';
import type { ScreenTopics } from './screen-topics.ts';
import type { ScreenCategories } from './screen-categories.ts';

vi.mock('@/composables/useAuth/ensure-fresh-token', () => ({ ensureFreshToken: vi.fn() }));

/*
 * Reported 2026-09-07: the topics screen never got past its loading placeholder
 * (it read through the Service Worker git engine, which needs a clone), and
 * categories had no screen at all. Between them an editor could neither create
 * nor edit either taxonomy — the tags every article carries.
 */
const TOPICS = [
  { key: 'editorial', color: '#b03a2e', name: { ru: 'От редакции' }, subtitle: {}, description: {} },
];
const LABELS = [{ key: 'programme', translations: { ru: 'Программа', en: 'Programme' } }];

const decode = (b64: string): string =>
  new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));

const acceptOf = (init?: RequestInit): string => {
  const h = init?.headers;
  return typeof h === 'object' && 'accept' in h ? String(Reflect.get(h, 'accept')) : '';
};

const stubGitHub = (files: Record<string, string>, puts: string[]): void => {
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    const path = decodeURIComponent(url.match(/contents\/([^?]+)/)?.[1] ?? '');
    if (init?.method === 'PUT') {
      files[path] = decode(JSON.parse(String(init.body)).content);
      puts.push(path);
      return new Response(JSON.stringify({ commit: { sha: 'c' } }), { status: 201 });
    }
    if (acceptOf(init).includes('raw')) {
      return new Response(files[path] ?? '', { status: files[path] ? 200 : 404 });
    }
    return new Response(JSON.stringify({ sha: 'blob' }), { status: 200 });
  });
};

interface TaxonomyInternals {
  loading: boolean;
  error: string;
  save: () => Promise<void>;
  add: () => void;
}

const settle = async (el: HTMLElement & { updateComplete: Promise<unknown> }): Promise<void> => {
  const priv = el as unknown as TaxonomyInternals;
  for (let i = 0; i < 60 && priv.loading; i += 1) await new Promise((r) => setTimeout(r, 10));
  await el.updateComplete;
};

const mountTopics = async (): Promise<ScreenTopics> => {
  const el = document.createElement('screen-topics') as ScreenTopics;
  document.body.append(el);
  await settle(el);
  return el;
};

const mountCategories = async (): Promise<ScreenCategories> => {
  const el = document.createElement('screen-categories') as ScreenCategories;
  document.body.append(el);
  await settle(el);
  return el;
};

const text = (el: HTMLElement): string => (el.shadowRoot?.textContent ?? '').replace(/\s+/g, ' ').trim();

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

describe('screen-topics reads over the API', () => {
  it('shows the repository topics instead of a stuck loading placeholder', async () => {
    stubGitHub({ 'settings/topics.json': JSON.stringify(TOPICS) }, []);
    const el = await mountTopics();
    expect(text(el)).toContain('От редакции');
    expect(text(el)).not.toContain('Загружаем');
  });

  it('says so when the settings file cannot be read', async () => {
    vi.stubGlobal('fetch', async () => new Response('nope', { status: 500 }));
    const el = await mountTopics();
    expect(text(el)).toMatch(/не удалось|ошибка/i);
    expect(text(el)).not.toContain('Загружаем');
  });

  it('adds a topic and commits the whole list', async () => {
    const files: Record<string, string> = { 'settings/topics.json': JSON.stringify(TOPICS) };
    const puts: string[] = [];
    stubGitHub(files, puts);
    const el = await mountTopics();
    const priv = el as unknown as TaxonomyInternals;

    priv.add();
    el.requestUpdate();
    await el.updateComplete;
    const rows = el.shadowRoot?.querySelectorAll('.row');
    expect(rows?.length).toBe(2);

    // A new row has no key yet, so saving must be refused rather than corrupt the file.
    await priv.save();
    expect(puts).toEqual([]);
    expect(text(el)).toContain('ключ');
  });

  it('saves an edited topic', async () => {
    const files: Record<string, string> = { 'settings/topics.json': JSON.stringify(TOPICS) };
    const puts: string[] = [];
    stubGitHub(files, puts);
    const el = await mountTopics();
    const priv = el as unknown as TaxonomyInternals & {
      updateColor: (index: number, value: string) => void;
    };
    priv.updateColor(0, '#123456');
    await priv.save();
    expect(puts).toEqual(['settings/topics.json']);
    expect(JSON.parse(files['settings/topics.json'])[0].color).toBe('#123456');
  });
});

describe('screen-categories: the rubric editor that did not exist', () => {
  it('lists the repository categories', async () => {
    stubGitHub({ 'settings/labels.json': JSON.stringify(LABELS) }, []);
    const el = await mountCategories();
    // The values live in the inputs the editor types into, not in page text.
    const values = [...(el.shadowRoot?.querySelectorAll('.row cp-input') ?? [])].map((input) =>
      Reflect.get(input, 'value'),
    );
    expect(values).toContain('programme');
    expect(values).toContain('Программа');
    expect(text(el)).not.toContain('Загружаем');
  });

  it('creates a category and commits it', async () => {
    const files: Record<string, string> = { 'settings/labels.json': JSON.stringify(LABELS) };
    const puts: string[] = [];
    stubGitHub(files, puts);
    const el = await mountCategories();
    const priv = el as unknown as TaxonomyInternals & {
      updateKey: (index: number, value: string) => void;
      updateText: (index: number, lang: string, value: string) => void;
    };

    priv.add();
    priv.updateKey(1, 'appeal');
    priv.updateText(1, 'ru', 'Обращение');
    await priv.save();

    expect(puts).toEqual(['settings/labels.json']);
    const stored = JSON.parse(files['settings/labels.json']);
    expect(stored).toHaveLength(2);
    expect(stored[1]).toMatchObject({ key: 'appeal', translations: { ru: 'Обращение' } });
  });

  it('removes a category', async () => {
    const files: Record<string, string> = { 'settings/labels.json': JSON.stringify(LABELS) };
    const puts: string[] = [];
    stubGitHub(files, puts);
    const el = await mountCategories();
    const priv = el as unknown as TaxonomyInternals & { removeAt: (index: number) => void };
    priv.removeAt(0);
    await priv.save();
    expect(JSON.parse(files['settings/labels.json'])).toEqual([]);
  });
});
