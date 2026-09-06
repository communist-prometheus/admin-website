import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { parse as parseYaml } from 'yaml';
import { ensureFreshToken } from '@/composables/useAuth/ensure-fresh-token';
import {
  listArticlesViaApi,
  readFileViaApi,
  articleLangsViaApi,
  publishFileViaApi,
  listDirViaApi,
  uploadBinaryViaApi,
  deleteFileViaApi,
  linkIssueArticlesViaApi,
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
    { path: 'pages/home/index.ru.md' },
  ],
};

const FILES: Record<string, string> = {
  'blog/older/index.ru.md': '---\ntitle: Старее\npubDate: 2026-01-01\n---\n\nBody\n',
  'blog/newer/index.ru.md': '---\ntitle: Новее\npublishDate: 2026-05-01\n---\n\nBody\n',
  'pages/home/index.ru.md': '---\ntitle: Главная\n---\n\nBody\n',
};

/** Stubs global fetch: tree endpoint returns TREE, contents return raw md. */
const stub = (opts: { treeStatus?: number; failFile?: string } = {}): void => {
  vi.stubGlobal('fetch', async (url: string) => {
    if (url.includes('/git/trees/')) {
      return new Response(JSON.stringify(TREE), { status: opts.treeStatus ?? 200 });
    }
    const m = url.match(/contents\/([^?]+)/);
    const path = m ? decodeURIComponent(m[1]) : '';
    if (opts.failFile !== undefined && path === opts.failFile) throw new Error('throttled');
    return new Response(FILES[path] ?? '', { status: FILES[path] ? 200 : 404 });
  });
};

/** The `accept` header of a fetch init, without casting an opaque HeadersInit. */
const acceptOf = (init?: RequestInit): string => {
  const h = init?.headers;
  return typeof h === 'object' && 'accept' in h ? String(Reflect.get(h, 'accept')) : '';
};

/** Parses a stored issue index's `articles:` block for assertions. */
const readSeq = (md: string): string[] =>
  md
    .split('\n')
    .map((l) => l.match(/^\s+-\s+(.+?)\s*$/)?.[1])
    .filter((v): v is string => v !== undefined);

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

  it('lists a non-blog collection (pages) when asked, ignoring blog entries', async () => {
    stub();
    const { articles, error } = await listArticlesViaApi(undefined, 'pages');
    expect(error).toBeUndefined();
    expect(articles.map((a) => a.slug)).toEqual(['home']);
    expect(articles[0].title).toBe('Главная');
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
    const md = '---\ntitle: Привет\nlang: ru\ncategory: t\n---\n\nПривет, мир\n';
    const r = await publishFileViaApi('blog/x/index.ru.md', md, 'msg');
    expect(r).toEqual({ ok: true, sha: 'commit1' });
    const put = calls.find((c) => c.method === 'PUT');
    expect(put?.body?.sha).toBe('blob1'); // updates against the current blob
    expect(put?.body?.message).toBe('msg');
    expect(decode(String(put?.body?.content))).toBe(md); // Cyrillic survives
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

  it('linkIssueArticlesViaApi back-links new articles and rewrites the TOC', async () => {
    const repo: Record<string, string> = {
      'magazine/n3/index.ru.md': '---\ntitle: N3\nlang: ru\narticles:\n  - a\n---\n\nB\n',
      'blog/a/index.ru.md': '---\ntitle: A\nlang: ru\ncategory: t\nmagazine: n3\n---\n\nB\n',
      'blog/b/index.ru.md': '---\ntitle: B\nlang: ru\ncategory: t\n---\n\nB\n',
    };
    const puts: Array<{ path: string; content: string }> = [];
    const decode = (b64: string): string =>
      new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
    vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
      const path = decodeURIComponent(url.match(/contents\/([^?]+)/)?.[1] ?? '');
      if (init?.method === 'PUT') {
        const body = JSON.parse(String(init.body));
        repo[path] = decode(body.content);
        puts.push({ path, content: repo[path] });
        return new Response(JSON.stringify({ commit: { sha: 'c' } }), { status: 201 });
      }
      if (acceptOf(init).includes('raw')) return new Response(repo[path] ?? '', { status: repo[path] ? 200 : 404 });
      return new Response(JSON.stringify({ sha: 'blob' }), { status: 200 });
    });

    const r = await linkIssueArticlesViaApi('n3', 'ru', ['a', 'b']);
    expect(r).toMatchObject({ ok: true, linked: 1, unlinked: 0 });
    // b gained the back-link; a kept its; TOC now lists both.
    expect(repo['blog/b/index.ru.md']).toContain('magazine: n3');
    expect(readSeq(repo['magazine/n3/index.ru.md'])).toEqual(['a', 'b']);
    // a was already linked and already in the TOC → not re-committed pointlessly.
    expect(puts.some((p) => p.path === 'blog/a/index.ru.md')).toBe(false);
  });

  it('linkIssueArticlesViaApi drops the back-link from de-selected articles', async () => {
    const repo: Record<string, string> = {
      'magazine/n3/index.ru.md': '---\ntitle: N3\nlang: ru\narticles:\n  - a\n  - b\n---\n\nB\n',
      'blog/a/index.ru.md': '---\ntitle: A\nlang: ru\ncategory: t\nmagazine: n3\n---\n\nB\n',
      'blog/b/index.ru.md': '---\ntitle: B\nlang: ru\ncategory: t\nmagazine: n3\n---\n\nB\n',
    };
    const decode = (b64: string): string =>
      new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
    vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
      const path = decodeURIComponent(url.match(/contents\/([^?]+)/)?.[1] ?? '');
      if (init?.method === 'PUT') {
        repo[path] = decode(JSON.parse(String(init.body)).content);
        return new Response(JSON.stringify({ commit: { sha: 'c' } }), { status: 201 });
      }
      if (acceptOf(init).includes('raw')) return new Response(repo[path] ?? '', { status: repo[path] ? 200 : 404 });
      return new Response(JSON.stringify({ sha: 'blob' }), { status: 200 });
    });

    const r = await linkIssueArticlesViaApi('n3', 'ru', ['a']);
    expect(r).toMatchObject({ ok: true, linked: 0, unlinked: 1 });
    expect(repo['blog/b/index.ru.md']).not.toContain('magazine:');
    expect(readSeq(repo['magazine/n3/index.ru.md'])).toEqual(['a']);
  });

  it('linkIssueArticlesViaApi writes a YAML array (never a bare key) when no article exists in the language', async () => {
    // The real incident: an issue translated to `en` inherited the ru TOC, none
    // of those articles had an `en` file, so the rewritten TOC came out as a bare
    // `articles:` (an empty YAML value) and the public build failed on the schema.
    const repo: Record<string, string> = {
      'magazine/n2/index.en.md':
        '---\ntitle: N2\nlang: en\npublished: false\narticles:\n  - a\n  - b\nimage: ./assets/cover.ru.png\n---\n\nB\n',
      'blog/a/index.ru.md': '---\ntitle: A\nlang: ru\ncategory: t\nmagazine: n2\n---\n\nB\n',
      'blog/b/index.ru.md': '---\ntitle: B\nlang: ru\ncategory: t\nmagazine: n2\n---\n\nB\n',
    };
    vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
      const path = decodeURIComponent(url.match(/contents\/([^?]+)/)?.[1] ?? '');
      if (init?.method === 'PUT') {
        repo[path] = decode(JSON.parse(String(init.body)).content);
        return new Response(JSON.stringify({ commit: { sha: 'c' } }), { status: 201 });
      }
      if (acceptOf(init).includes('raw')) return new Response(repo[path] ?? '', { status: repo[path] ? 200 : 404 });
      return new Response(JSON.stringify({ sha: 'blob' }), { status: 200 });
    });

    const r = await linkIssueArticlesViaApi('n2', 'en', ['a']);
    expect(r.ok).toBe(true);
    const fm: unknown = parseYaml(repo['magazine/n2/index.en.md'].split('\n---')[0].slice(4));
    expect(fm).toMatchObject({ articles: [] });
  });

  it('linkIssueArticlesViaApi aborts (no writes) when an article read fails for a reason other than 404', async () => {
    const puts: string[] = [];
    vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
      if (init?.method === 'PUT') puts.push(url);
      const path = decodeURIComponent(url.match(/contents\/([^?]+)/)?.[1] ?? '');
      if (path === 'magazine/n2/index.en.md') {
        return new Response('---\ntitle: N2\nlang: en\narticles:\n  - a\n---\n\nB\n', { status: 200 });
      }
      return new Response(JSON.stringify({ message: 'Bad credentials' }), { status: 401 });
    });
    const r = await linkIssueArticlesViaApi('n2', 'en', ['a', 'b']);
    expect(r.ok).toBe(false);
    expect(r.error).toContain('Bad credentials');
    expect(puts).toEqual([]);
  });

  it('publishFileViaApi refuses a content file whose frontmatter is not valid YAML (no commit)', async () => {
    // The real master incident: a multi-line `description` pasted unquoted with a
    // `: ` inside — js-yaml: "bad indentation of a mapping entry".
    const broken = [
      '---',
      'title: Excess Capital And Excess Population',
      'lang: en',
      'description: While bourgeois thought writes off crises, Marx exposes the paradox of the system: the surplus.',
      '"Without revolutionary theory", reads the axiom.',
      'category: programme',
      'published: true',
      '---',
      '',
      'Body',
      '',
    ].join('\n');
    const puts: string[] = [];
    vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
      if (init?.method === 'PUT') puts.push(url);
      return new Response(JSON.stringify({ sha: 'b', commit: { sha: 'c' } }), { status: 200 });
    });
    const r = await publishFileViaApi('blog/surplus/index.en.md', broken, 'm');
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/YAML/);
    expect(puts).toEqual([]);
  });

  it('publishFileViaApi refuses a content file the site schema would reject (no commit)', async () => {
    const bareToc = '---\ntitle: N2\nlang: en\npublished: false\narticles:\nimage: ./assets/cover.ru.png\n---\n\nB\n';
    const puts: string[] = [];
    vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
      if (init?.method === 'PUT') puts.push(url);
      return new Response(JSON.stringify({ sha: 'b', commit: { sha: 'c' } }), { status: 200 });
    });
    const r = await publishFileViaApi('magazine/n2/index.en.md', bareToc, 'm');
    expect(r.ok).toBe(false);
    expect(r.error).toMatch(/articles/);
    expect(puts).toEqual([]);
  });

  it('publishFileViaApi refuses a frontmatter lang that contradicts the filename (no commit)', async () => {
    const puts: string[] = [];
    vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
      if (init?.method === 'PUT') puts.push(url);
      return new Response(JSON.stringify({ sha: 'b', commit: { sha: 'c' } }), { status: 200 });
    });
    const md = '---\ntitle: A\nlang: ru\ncategory: t\n---\n\nB\n';
    const r = await publishFileViaApi('blog/a/index.en.md', md, 'm');
    expect(r.ok).toBe(false);
    expect(puts).toEqual([]);
  });

  it('publishFileViaApi leaves non-content paths (assets, settings) ungated', async () => {
    const puts: string[] = [];
    vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
      if (init?.method === 'PUT') puts.push(url);
      return new Response(JSON.stringify({ sha: 'b', commit: { sha: 'c' } }), { status: 200 });
    });
    const r = await publishFileViaApi('settings/topics.json', '{}', 'm');
    expect(r.ok).toBe(true);
    expect(puts).toHaveLength(1);
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
