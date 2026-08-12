import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ensureFreshToken } from '@/composables/useAuth/ensure-fresh-token';
import {
  listArticlesViaApi,
  readFileViaApi,
  articleLangsViaApi,
  publishFileViaApi,
  listDirViaApi,
  uploadBinaryViaApi,
  deleteFileViaApi,
} from './content.ts';

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
  it('lists articles from the flat tree, titles from raw files, newest → oldest', async () => {
    stub();
    const { articles, error } = await listArticlesViaApi();
    expect(error).toBeUndefined();
    expect(articles.map((a) => a.slug)).toEqual(['newer', 'older']); // newest first
    expect(articles[0].title).toBe('Новее');
    expect(articles[0].date).toBe('2026-05-01'); // publishDate read too
    expect(articles[1].languages).toEqual(['en', 'ru']);
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

describe('editor single-file API (read / langs / publish, no clone)', () => {
  const decode = (b64: string): string =>
    new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));

  it('readFileViaApi returns the raw file body', async () => {
    vi.stubGlobal('fetch', async () => new Response('# Заголовок', { status: 200 }));
    expect(await readFileViaApi('blog/x/index.ru.md')).toBe('# Заголовок');
  });

  it('articleLangsViaApi lists only index.<lang>.md languages, sorted', async () => {
    vi.stubGlobal(
      'fetch',
      async () =>
        new Response(
          JSON.stringify([{ name: 'index.ru.md' }, { name: 'index.en.md' }, { name: 'cover.jpg' }]),
          { status: 200 },
        ),
    );
    expect(await articleLangsViaApi('x')).toEqual(['en', 'ru']);
  });

  it('articleLangsViaApi reads the given collection folder (magazine issues too)', async () => {
    let seen = '';
    vi.stubGlobal('fetch', async (url: string) => {
      seen = url;
      return new Response(JSON.stringify([{ name: 'index.ru.md' }]), { status: 200 });
    });
    await articleLangsViaApi('nomer-1', 'magazine');
    expect(seen).toContain('/contents/magazine/nomer-1');
  });

  it('publishFileViaApi commits ONE file (UTF-8 base64) and returns the commit sha', async () => {
    const calls: Array<{ method?: string; body?: Record<string, string> }> = [];
    vi.stubGlobal('fetch', async (_url: string, init?: RequestInit) => {
      calls.push({
        method: init?.method,
        body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
      });
      if (init?.method === 'PUT') {
        return new Response(JSON.stringify({ commit: { sha: 'commit1' } }), { status: 201 });
      }
      return new Response(JSON.stringify({ sha: 'blob1' }), { status: 200 });
    });
    const r = await publishFileViaApi('blog/x/index.ru.md', 'Привет, мир', 'msg');
    expect(r).toEqual({ ok: true, sha: 'commit1' });
    const put = calls.find((c) => c.method === 'PUT');
    expect(put?.body?.sha).toBe('blob1'); // updates against the current blob
    expect(put?.body?.message).toBe('msg');
    expect(decode(String(put?.body?.content))).toBe('Привет, мир'); // Cyrillic survives
  });

  it('listDirViaApi returns only files (not sub-dirs), with size and sha', async () => {
    vi.stubGlobal(
      'fetch',
      async () =>
        new Response(
          JSON.stringify([
            { type: 'file', name: 'issue.ru.pdf', path: 'magazine/x/assets/issue.ru.pdf', size: 2048, sha: 'a' },
            { type: 'file', name: 'book.fb2', path: 'magazine/x/assets/book.fb2', size: 500, sha: 'b' },
            { type: 'dir', name: 'nested', path: 'magazine/x/assets/nested', size: 0, sha: 'c' },
          ]),
          { status: 200 },
        ),
    );
    const files = await listDirViaApi('magazine/x/assets');
    expect(files.map((f) => f.name)).toEqual(['issue.ru.pdf', 'book.fb2']);
    expect(files[1]).toMatchObject({ path: 'magazine/x/assets/book.fb2', size: 500, sha: 'b' });
  });

  it('uploadBinaryViaApi PUTs base64 content, overwriting via the current sha', async () => {
    const calls: Array<{ method?: string; body?: Record<string, string> }> = [];
    vi.stubGlobal('fetch', async (_url: string, init?: RequestInit) => {
      calls.push({
        method: init?.method,
        body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
      });
      if (init?.method === 'PUT') return new Response('{}', { status: 200 });
      return new Response(JSON.stringify({ sha: 'existing' }), { status: 200 });
    });
    const r = await uploadBinaryViaApi('magazine/x/assets/book.fb2', 'QkFTRTY0', 'add fb2');
    expect(r.ok).toBe(true);
    const put = calls.find((c) => c.method === 'PUT');
    expect(put?.body).toMatchObject({ content: 'QkFTRTY0', sha: 'existing', message: 'add fb2' });
  });

  it('deleteFileViaApi DELETEs with the file sha', async () => {
    const calls: Array<{ method?: string; body?: Record<string, string> }> = [];
    vi.stubGlobal('fetch', async (_url: string, init?: RequestInit) => {
      calls.push({
        method: init?.method,
        body: typeof init?.body === 'string' ? JSON.parse(init.body) : undefined,
      });
      if (init?.method === 'DELETE') return new Response('{}', { status: 200 });
      return new Response(JSON.stringify({ sha: 'todelete' }), { status: 200 });
    });
    const r = await deleteFileViaApi('magazine/x/assets/old.pdf', 'remove');
    expect(r.ok).toBe(true);
    expect(calls.find((c) => c.method === 'DELETE')?.body).toMatchObject({ sha: 'todelete' });
  });

  it('publishFileViaApi surfaces the GitHub error message on failure', async () => {
    vi.stubGlobal('fetch', async (_url: string, init?: RequestInit) =>
      init?.method === 'PUT'
        ? new Response(JSON.stringify({ message: 'Resource not accessible by integration' }), {
            status: 403,
          })
        : new Response(JSON.stringify({ sha: 'b' }), { status: 200 }),
    );
    const r = await publishFileViaApi('p', 'c', 'm');
    expect(r.ok).toBe(false);
    expect(r.error).toContain('Resource not accessible');
  });
});
