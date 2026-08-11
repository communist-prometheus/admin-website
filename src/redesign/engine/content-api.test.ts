import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ensureFreshToken } from '@/composables/useAuth/ensure-fresh-token';
import { listArticlesViaApi } from './content.ts';

vi.mock('@/composables/useAuth/ensure-fresh-token', () => ({ ensureFreshToken: vi.fn() }));

/** A tree with two articles: `older` (ru+en) and `newer` (ru). */
const TREE = {
  tree: [
    { path: 'blog/older/index.ru.md' },
    { path: 'blog/older/index.en.md' },
    { path: 'blog/newer/index.ru.md' },
    { path: 'README.md' },
    { path: 'blog/older/cover.jpg' },
  ],
};

const FILES: Record<string, string> = {
  'blog/older/index.ru.md': '---\ntitle: Старее\npubDate: 2026-01-01\n---\n\nBody\n',
  'blog/newer/index.ru.md': '---\ntitle: Новее\npublishDate: 2026-05-01\n---\n\nBody\n',
};

/** Stubs global fetch: tree endpoint returns TREE, contents return raw md. */
const stub = (opts: { treeStatus?: number; failFile?: string } = {}): void => {
  vi.stubGlobal('fetch', async (url: string) => {
    if (url.includes('/git/trees/')) {
      return new Response(JSON.stringify(TREE), { status: opts.treeStatus ?? 200 });
    }
    const m = url.match(/contents\/(blog\/[^?]+)/);
    const path = m ? decodeURIComponent(m[1]) : '';
    if (opts.failFile !== undefined && path === opts.failFile) throw new Error('throttled');
    return new Response(FILES[path] ?? '', { status: FILES[path] ? 200 : 404 });
  });
};

beforeEach(() => {
  vi.stubEnv('VITE_DEV_TOKEN', '');
  vi.stubEnv('VITE_GITHUB_BRANCH', 'master');
  vi.mocked(ensureFreshToken).mockResolvedValue('tok');
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('listArticlesViaApi (API-first article list)', () => {
  it('lists articles from the flat tree, titles from raw files, oldest → newest', async () => {
    stub();
    const { articles, error } = await listArticlesViaApi();
    expect(error).toBeUndefined();
    expect(articles.map((a) => a.slug)).toEqual(['older', 'newer']); // by date asc
    expect(articles[0].title).toBe('Старее');
    expect(articles[0].languages).toEqual(['en', 'ru']);
    expect(articles[1].date).toBe('2026-05-01'); // publishDate read too
  });

  it('reports the tree fetch error instead of a silent empty (throttling/failure)', async () => {
    stub({ treeStatus: 502 });
    const { articles, error } = await listArticlesViaApi();
    expect(articles).toEqual([]);
    expect(error).toContain('502');
  });

  it('is signed-out when no token is available', async () => {
    vi.mocked(ensureFreshToken).mockResolvedValue(undefined);
    stub();
    const { error } = await listArticlesViaApi();
    expect(error).toBe('signed-out');
  });

  it('survives a single title fetch failing (falls back to the slug, no error)', async () => {
    stub({ failFile: 'blog/newer/index.ru.md' });
    const { articles, error } = await listArticlesViaApi();
    expect(error).toBeUndefined();
    expect(articles).toHaveLength(2);
    expect(articles.find((a) => a.slug === 'newer')?.title).toBe('newer');
  });

  it('reports title-fetch progress from 0 to total', async () => {
    stub();
    const seen: string[] = [];
    await listArticlesViaApi((done, total) => seen.push(`${done}/${total}`));
    expect(seen[0]).toBe('0/2');
    expect(seen.at(-1)).toBe('2/2');
  });
});
