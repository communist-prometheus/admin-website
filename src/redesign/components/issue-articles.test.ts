import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { ensureFreshToken } from '@/composables/useAuth/ensure-fresh-token';
import './issue-articles.ts';
import type { IssueArticles } from './issue-articles.ts';

vi.mock('@/composables/useAuth/ensure-fresh-token', () => ({ ensureFreshToken: vi.fn() }));

/**
 * The develop incident, end to end through the panel: a journal issue was
 * translated to `en` and inherited the ru table of contents; the editor then
 * removed the one article that had an `en` file. Every remaining slug was
 * ru-only, so the rewritten TOC came out as a bare `articles:` (an empty YAML value) and
 * the public build failed on the collection schema.
 */
const article = (title: string, lang: string): string =>
  `---\ntitle: ${title}\nlang: ${lang}\ncategory: t\nmagazine: n2\n---\n\nB\n`;

const seedRepo = (): Record<string, string> => ({
  'magazine/n2/index.ru.md': '---\ntitle: N2\nlang: ru\narticles:\n  - a\n  - b\n---\n\nB\n',
  'magazine/n2/index.en.md':
    '---\ntitle: N2\nlang: en\npublished: false\narticles:\n  - a\n  - b\nimage: ./assets/cover.ru.png\n---\n\nB\n',
  'blog/a/index.ru.md': article('A ru', 'ru'),
  'blog/a/index.en.md': article('A en', 'en'),
  'blog/b/index.ru.md': article('B ru', 'ru'),
});

const decode = (b64: string): string =>
  new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));

const acceptOf = (init?: RequestInit): string => {
  const h = init?.headers;
  return typeof h === 'object' && 'accept' in h ? String(Reflect.get(h, 'accept')) : '';
};

/** A GitHub Contents/Trees API double over an in-memory repo; records PUTs. */
const stubGitHub = (repo: Record<string, string>, puts: string[]): void => {
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    if (url.includes('/git/trees/')) {
      return new Response(JSON.stringify({ tree: Object.keys(repo).map((path) => ({ path })) }), { status: 200 });
    }
    const path = decodeURIComponent(url.match(/contents\/([^?]+)/)?.[1] ?? '');
    if (init?.method === 'PUT') {
      repo[path] = decode(JSON.parse(String(init.body)).content);
      puts.push(path);
      return new Response(JSON.stringify({ commit: { sha: 'c' } }), { status: 201 });
    }
    if (acceptOf(init).includes('raw')) return new Response(repo[path] ?? '', { status: repo[path] ? 200 : 404 });
    return new Response(JSON.stringify({ sha: 'blob' }), { status: 200 });
  });
};

interface PanelInternals {
  selected: ReadonlySet<string>;
  loading: boolean;
  busy: boolean;
  toggle: (slug: string) => void;
  save: () => Promise<void>;
}

const mount = async (lang: string): Promise<{ el: IssueArticles; priv: PanelInternals }> => {
  const el = document.createElement('issue-articles');
  el.issueSlug = 'n2';
  el.lang = lang;
  document.body.append(el);
  const priv = el as unknown as PanelInternals;
  // load() is fire-and-forget from connectedCallback; wait for it to settle.
  for (let i = 0; i < 50 && (priv.loading || priv.selected.size === 0); i += 1) {
    await new Promise((r) => setTimeout(r, 0));
  }
  await el.updateComplete;
  return { el, priv };
};

const shadowText = (el: HTMLElement): string => (el.shadowRoot?.textContent ?? '').replace(/\s+/g, ' ').trim();

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

describe('issue-articles: removing the last translated article from an issue', () => {
  it('stores an explicit empty TOC the site schema accepts, never a bare `articles:`', async () => {
    const repo = seedRepo();
    const puts: string[] = [];
    stubGitHub(repo, puts);

    const { el, priv } = await mount('en');
    expect([...priv.selected].sort()).toEqual(['a', 'b']);
    // Only `a` has an English file, so it is the only article the panel lists
    // (titles come from the preferred ru file).
    expect(shadowText(el)).toContain('A ru');
    expect(shadowText(el)).not.toContain('B ru');

    priv.toggle('a');
    await priv.save();
    await el.updateComplete;

    expect(puts).toContain('magazine/n2/index.en.md');
    const fm: unknown = parseYaml(repo['magazine/n2/index.en.md'].split('\n---')[0].slice(4));
    expect(fm).toMatchObject({ lang: 'en', articles: [] });
    // The de-selected article lost its back-link.
    expect(repo['blog/a/index.en.md']).not.toContain('magazine:');
    expect(shadowText(el)).toContain('Связи обновлены');
  });

  it('aborts instead of silently dropping links when an article read fails (expired token)', async () => {
    const repo = seedRepo();
    const puts: string[] = [];
    stubGitHub(repo, puts);
    const { el, priv } = await mount('en');

    // The session token expires mid-edit: every raw read now answers 401.
    vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
      if (init?.method === 'PUT') puts.push(url);
      return new Response(JSON.stringify({ message: 'Bad credentials' }), { status: 401 });
    });
    priv.toggle('a');
    await priv.save();
    await el.updateComplete;

    expect(puts).toEqual([]);
    expect(shadowText(el)).toContain('Bad credentials');
  });
});
