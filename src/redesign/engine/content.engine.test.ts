import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * Drives content.ts against a stubbed SW fetch. Covers the read cache (shared
 * across screens, invalidated on writes), the bounded readFile fan-out, and the
 * magazine commit counting only the articles actually back-linked (QA #17).
 */
interface Call {
  url: string;
  method: string;
  body?: string;
}
const calls: Call[] = [];
let inFlight = 0;
let maxInFlight = 0;
// path -> file content the stubbed repo returns (missing = 404-ish undefined)
const files: Record<string, string> = {};
const tree: Record<string, { type: 'file' | 'dir'; name: string; path: string }[]> = {};

const jsonResponse = (body: unknown): { ok: boolean; json: () => Promise<unknown> } => ({
  ok: true,
  json: () => Promise.resolve(body),
});

vi.mock('./sw-fetch.js', () => ({
  swFetch: async (url: string, opts?: { method?: string; body?: string }) => {
    const method = opts?.method ?? 'GET';
    calls.push({ url, method, body: opts?.body });
    if (url.startsWith('/api/github/file?')) {
      inFlight += 1;
      maxInFlight = Math.max(maxInFlight, inFlight);
      await Promise.resolve();
      inFlight -= 1;
      const path = decodeURIComponent(new URL(url, 'http://x').searchParams.get('path') ?? '');
      const content = files[path];
      return jsonResponse(content === undefined ? {} : { content });
    }
    if (url.startsWith('/api/github/tree?')) {
      const path = decodeURIComponent(new URL(url, 'http://x').searchParams.get('path') ?? '');
      return jsonResponse({ tree: tree[path] ?? [] });
    }
    if (url === '/api/github/commit') return jsonResponse({ sha: 'deadbee' });
    return jsonResponse({}); // stage endpoints
  },
}));

import {
  readFile,
  listArticles,
  stageFile,
  clearContentCache,
  createMagazineIssue,
} from './content.ts';

beforeEach(() => {
  calls.length = 0;
  inFlight = 0;
  maxInFlight = 0;
  for (const k of Object.keys(files)) delete files[k];
  for (const k of Object.keys(tree)) delete tree[k];
  clearContentCache();
});

const fileCalls = (): number => calls.filter((c) => c.url.startsWith('/api/github/file?')).length;

describe('content read cache', () => {
  it('serves a repeated read from cache (one network read)', async () => {
    files['a.md'] = 'A';
    expect(await readFile('a.md')).toBe('A');
    expect(await readFile('a.md')).toBe('A');
    expect(fileCalls()).toBe(1);
  });

  it('does not cache a missing file (stays re-fetchable once it appears)', async () => {
    expect(await readFile('missing.md')).toBeUndefined();
    files['missing.md'] = 'now here';
    expect(await readFile('missing.md')).toBe('now here');
    expect(fileCalls()).toBe(2);
  });

  it('invalidates the cache on a write so an edit is never served stale', async () => {
    files['a.md'] = 'A';
    expect(await readFile('a.md')).toBe('A');
    await stageFile('a.md', 'A2');
    files['a.md'] = 'A2';
    expect(await readFile('a.md')).toBe('A2');
    expect(fileCalls()).toBe(2);
  });
});

describe('listArticles fan-out', () => {
  it('bounds concurrent reads to the pool size and keeps every article', async () => {
    tree['blog'] = Array.from({ length: 20 }, (_v, i) => ({
      type: 'dir' as const,
      name: `index.ru.md`,
      path: `blog/a${i}/index.ru.md`,
    }));
    for (let i = 0; i < 20; i += 1) files[`blog/a${i}/index.ru.md`] = `---\ntitle: T${i}\n---\n`;
    const list = await listArticles();
    expect(list).toHaveLength(20);
    expect(maxInFlight).toBeLessThanOrEqual(6);
  });

  it('returns articles oldest → newest by pubDate, undated last (QA sort)', async () => {
    tree['blog'] = [
      { type: 'dir', name: 'index.ru.md', path: 'blog/newer/index.ru.md' },
      { type: 'dir', name: 'index.ru.md', path: 'blog/older/index.ru.md' },
      { type: 'dir', name: 'index.ru.md', path: 'blog/undated/index.ru.md' },
    ];
    files['blog/newer/index.ru.md'] = '---\ntitle: N\npubDate: 2026-05-01\n---\n';
    files['blog/older/index.ru.md'] = '---\ntitle: O\npubDate: 2026-01-01\n---\n';
    files['blog/undated/index.ru.md'] = '---\ntitle: U\n---\n';
    const order = (await listArticles()).map((a) => a.slug);
    expect(order).toEqual(['older', 'newer', 'undated']);
  });

  it('sorts articles dated with `publishDate` too, not just `pubDate` (QA sort)', async () => {
    tree['blog'] = [
      { type: 'dir', name: 'index.ru.md', path: 'blog/a-pubdate/index.ru.md' },
      { type: 'dir', name: 'index.ru.md', path: 'blog/b-publishdate/index.ru.md' },
    ];
    // The `publishDate` article is older; it must sort FIRST, not clump last as
    // undated (the bug: half the real articles use `publishDate`).
    files['blog/a-pubdate/index.ru.md'] = '---\ntitle: A\npubDate: 2026-06-01\n---\n';
    files['blog/b-publishdate/index.ru.md'] = '---\ntitle: B\npublishDate: 2026-02-01\n---\n';
    const order = (await listArticles()).map((a) => a.slug);
    expect(order).toEqual(['b-publishdate', 'a-pubdate']);
  });
});

describe('createMagazineIssue count (QA #17)', () => {
  it('counts only articles that actually have the issue language', async () => {
    files['blog/has-it/index.en.md'] = '---\ntitle: H\nlang: en\n---\n';
    files['blog/also/index.en.md'] = '---\ntitle: A\nlang: en\n---\n';
    // 'no-en' has no en file → cannot be linked, must not be counted.
    const result = await createMagazineIssue({
      slug: 'nomer-9-2026',
      lang: 'en',
      title: 'Issue 9',
      publishDate: '2026-09-01',
      articles: ['has-it', 'no-en', 'also'],
      pdfBase64: 'AAAA',
    });
    expect(result.ok).toBe(true);

    const commit = calls.find((c) => c.url === '/api/github/commit');
    const message = JSON.parse(commit?.body ?? '{}').message as string;
    expect(message).toContain('(2 статей)');

    const indexStage = calls.find(
      (c) =>
        c.url === '/api/github/file/stage' &&
        JSON.parse(c.body ?? '{}').path === 'magazine/nomer-9-2026/index.en.md',
    );
    const indexContent = JSON.parse(indexStage?.body ?? '{}').content as string;
    expect(indexContent).toContain('- has-it');
    expect(indexContent).toContain('- also');
    expect(indexContent).not.toContain('no-en');
  });
});
