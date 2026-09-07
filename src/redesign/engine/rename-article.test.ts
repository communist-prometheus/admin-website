import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ensureFreshToken } from '@/composables/useAuth/ensure-fresh-token';
import { renameArticleViaApi } from './rename-article.ts';

vi.mock('@/composables/useAuth/ensure-fresh-token', () => ({ ensureFreshToken: vi.fn() }));

/*
 * Changing an article's address moves every file of its folder — all languages
 * and its assets — because the folder IS the address. The dangerous outcomes
 * are a half-moved article (some languages at the old address, some at the new)
 * and an address that silently lands on top of another article's folder.
 */
const repo = (): Record<string, string> => ({
  'blog/old-name/index.ru.md': '---\ntitle: T\nlang: ru\ncategory: t\n---\n\nRU\n',
  'blog/old-name/index.en.md': '---\ntitle: T\nlang: en\ncategory: t\n---\n\nEN\n',
  'blog/old-name/assets/cover.png': 'PNG-BYTES',
  'blog/other/index.ru.md': '---\ntitle: O\nlang: ru\ncategory: t\n---\n\nO\n',
});

const decode = (b64: string): string =>
  new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));
const encode = (text: string): string => {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
};

const acceptOf = (init?: RequestInit): string => {
  const h = init?.headers;
  return typeof h === 'object' && 'accept' in h ? String(Reflect.get(h, 'accept')) : '';
};

/** A Contents API double: tree listing, raw/base64 reads, PUT and DELETE. */
const stubGitHub = (files: Record<string, string>, calls: string[]): void => {
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    if (url.includes('/git/trees/')) {
      return new Response(JSON.stringify({ tree: Object.keys(files).map((path) => ({ path })) }), {
        status: 200,
      });
    }
    const path = decodeURIComponent(url.match(/contents\/([^?]+)/)?.[1] ?? '');
    if (init?.method === 'PUT') {
      files[path] = decode(JSON.parse(String(init.body)).content);
      calls.push(`PUT ${path}`);
      return new Response(JSON.stringify({ commit: { sha: 'c' } }), { status: 201 });
    }
    if (init?.method === 'DELETE') {
      delete files[path];
      calls.push(`DELETE ${path}`);
      return new Response(JSON.stringify({ commit: { sha: 'c' } }), { status: 200 });
    }
    if (files[path] === undefined) return new Response('', { status: 404 });
    if (acceptOf(init).includes('raw')) return new Response(files[path], { status: 200 });
    return new Response(JSON.stringify({ sha: 'blob', content: encode(files[path]) }), { status: 200 });
  });
};

beforeEach(() => {
  vi.stubEnv('VITE_DEV_TOKEN', '');
  vi.stubEnv('VITE_GITHUB_BRANCH', 'develop');
  vi.mocked(ensureFreshToken).mockResolvedValue('tok');
});
afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

describe('renameArticleViaApi', () => {
  it('moves every language and asset to the new address', async () => {
    const files = repo();
    const calls: string[] = [];
    stubGitHub(files, calls);

    const result = await renameArticleViaApi('blog', 'old-name', 'new-name');
    expect(result.ok).toBe(true);

    expect(Object.keys(files).sort()).toEqual([
      'blog/new-name/assets/cover.png',
      'blog/new-name/index.en.md',
      'blog/new-name/index.ru.md',
      'blog/other/index.ru.md',
    ]);
    expect(files['blog/new-name/index.ru.md']).toContain('RU');
    expect(files['blog/new-name/assets/cover.png']).toBe('PNG-BYTES');
  });

  it('writes every file before deleting any, so a failure cannot lose content', async () => {
    const files = repo();
    const calls: string[] = [];
    stubGitHub(files, calls);
    await renameArticleViaApi('blog', 'old-name', 'new-name');
    const firstDelete = calls.findIndex((c) => c.startsWith('DELETE'));
    const lastPut = calls.map((c) => c.startsWith('PUT')).lastIndexOf(true);
    expect(lastPut).toBeLessThan(firstDelete);
  });

  it('refuses an address another article already occupies, touching nothing', async () => {
    const files = repo();
    const calls: string[] = [];
    stubGitHub(files, calls);
    const result = await renameArticleViaApi('blog', 'old-name', 'other');
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/занят/i);
    expect(calls).toEqual([]);
  });

  it('refuses a malformed address', async () => {
    const files = repo();
    const calls: string[] = [];
    stubGitHub(files, calls);
    const result = await renameArticleViaApi('blog', 'old-name', 'Новое Имя');
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/латин/i);
    expect(calls).toEqual([]);
  });

  it('is a no-op when the address does not change', async () => {
    const files = repo();
    const calls: string[] = [];
    stubGitHub(files, calls);
    const result = await renameArticleViaApi('blog', 'old-name', 'old-name');
    expect(result.ok).toBe(true);
    expect(calls).toEqual([]);
  });

  it('stops before deleting anything when a copy fails', async () => {
    const files = repo();
    const calls: string[] = [];
    stubGitHub(files, calls);
    const original = globalThis.fetch;
    vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
      if (init?.method === 'PUT' && url.includes('index.en.md')) {
        return new Response(JSON.stringify({ message: 'Bad credentials' }), { status: 401 });
      }
      return original(url, init);
    });

    const result = await renameArticleViaApi('blog', 'old-name', 'new-name');
    expect(result.ok).toBe(false);
    expect(calls.some((c) => c.startsWith('DELETE'))).toBe(false);
    // The original article is still whole.
    expect(files['blog/old-name/index.ru.md']).toBeDefined();
    expect(files['blog/old-name/index.en.md']).toBeDefined();
  });
});
