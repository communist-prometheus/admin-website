import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ensureFreshToken } from '@/composables/useAuth/ensure-fresh-token';
import {
  readLabelsViaApi,
  readTopicsViaApi,
  saveLabelsViaApi,
  saveTopicsViaApi,
} from './settings-io.ts';

vi.mock('@/composables/useAuth/ensure-fresh-token', () => ({ ensureFreshToken: vi.fn() }));

/*
 * The topics screen read `settings/topics.json` through the Service Worker git
 * engine, which needs a full repository clone. Every other screen had long since
 * moved to the GitHub API, so on a session where the clone never completed the
 * screen sat on its loading placeholder forever — the editor could neither see nor
 * edit topics. Categories (`settings/labels.json`) had no screen at all.
 */
const TOPICS = [
  {
    key: 'editorial',
    color: '#b03a2e',
    name: { ru: 'От редакции', en: 'Editorial' },
    subtitle: { ru: 'Позиция редакции' },
    description: {},
  },
];

const LABELS = [
  { key: 'programme', translations: { ru: 'Программа', en: 'Programme' } },
  { key: 'history', translations: { ru: 'История', en: 'History' } },
];

const decode = (b64: string): string =>
  new TextDecoder().decode(Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)));

const acceptOf = (init?: RequestInit): string => {
  const h = init?.headers;
  return typeof h === 'object' && 'accept' in h ? String(Reflect.get(h, 'accept')) : '';
};

/** A Contents API double over an in-memory settings tree; records PUTs. */
const stubGitHub = (files: Record<string, string>, puts: Array<{ path: string; body: string; message: string }>): void => {
  vi.stubGlobal('fetch', async (url: string, init?: RequestInit) => {
    const path = decodeURIComponent(url.match(/contents\/([^?]+)/)?.[1] ?? '');
    if (init?.method === 'PUT') {
      const parsed = JSON.parse(String(init.body));
      files[path] = decode(parsed.content);
      puts.push({ path, body: files[path], message: String(parsed.message) });
      return new Response(JSON.stringify({ commit: { sha: 'c' } }), { status: 201 });
    }
    if (acceptOf(init).includes('raw')) {
      return new Response(files[path] ?? '', { status: files[path] ? 200 : 404 });
    }
    return new Response(JSON.stringify({ sha: 'blob' }), { status: 200 });
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

describe('settings read over the API (no clone needed)', () => {
  it('reads the repository topics', async () => {
    stubGitHub({ 'settings/topics.json': JSON.stringify(TOPICS) }, []);
    const topics = await readTopicsViaApi();
    expect(topics).toHaveLength(1);
    expect(topics[0]).toMatchObject({ key: 'editorial', color: '#b03a2e' });
    expect(topics[0]?.name['ru']).toBe('От редакции');
  });

  it('reads the repository categories', async () => {
    stubGitHub({ 'settings/labels.json': JSON.stringify(LABELS) }, []);
    const labels = await readLabelsViaApi();
    expect(labels.map((l) => l.key)).toEqual(['programme', 'history']);
    expect(labels[0]?.translations['ru']).toBe('Программа');
  });

  it('reports a read failure instead of pretending the repository is empty', async () => {
    vi.stubGlobal('fetch', async () => new Response('boom', { status: 500 }));
    await expect(readTopicsViaApi()).rejects.toThrow();
  });

  it('reads an empty list from an empty settings file without throwing', async () => {
    stubGitHub({ 'settings/topics.json': '[]' }, []);
    expect(await readTopicsViaApi()).toEqual([]);
  });
});

describe('settings write over the API', () => {
  it('saves topics as formatted JSON under a descriptive message', async () => {
    const files: Record<string, string> = { 'settings/topics.json': JSON.stringify(TOPICS) };
    const puts: Array<{ path: string; body: string; message: string }> = [];
    stubGitHub(files, puts);

    const next = [...TOPICS, { key: 'primer', color: '#2563eb', name: { ru: 'Ликбез' }, subtitle: {}, description: {} }];
    const result = await saveTopicsViaApi(next);
    expect(result.ok).toBe(true);
    expect(puts).toHaveLength(1);
    expect(puts[0].path).toBe('settings/topics.json');
    expect(puts[0].message).toMatch(/тем/i);
    // Stored as readable JSON, and it round-trips.
    expect(puts[0].body.endsWith('\n')).toBe(true);
    expect(JSON.parse(puts[0].body)).toHaveLength(2);
    expect(puts[0].body).toContain('\n  ');
  });

  it('saves categories the same way', async () => {
    const files: Record<string, string> = { 'settings/labels.json': JSON.stringify(LABELS) };
    const puts: Array<{ path: string; body: string; message: string }> = [];
    stubGitHub(files, puts);

    const result = await saveLabelsViaApi([...LABELS, { key: 'appeal', translations: { ru: 'Обращение' } }]);
    expect(result.ok).toBe(true);
    expect(puts[0].path).toBe('settings/labels.json');
    expect(JSON.parse(puts[0].body).map((l: { key: string }) => l.key)).toEqual([
      'programme',
      'history',
      'appeal',
    ]);
  });

  it('refuses to save an entry without a key, rather than corrupting the file', async () => {
    const puts: Array<{ path: string; body: string; message: string }> = [];
    stubGitHub({ 'settings/labels.json': JSON.stringify(LABELS) }, puts);
    const result = await saveLabelsViaApi([...LABELS, { key: '  ', translations: {} }]);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/ключ/i);
    expect(puts).toEqual([]);
  });

  it('refuses duplicate keys', async () => {
    const puts: Array<{ path: string; body: string; message: string }> = [];
    stubGitHub({ 'settings/topics.json': JSON.stringify(TOPICS) }, puts);
    const result = await saveTopicsViaApi([...TOPICS, { ...TOPICS[0] }]);
    expect(result.ok).toBe(false);
    expect(result.error).toMatch(/editorial/);
    expect(puts).toEqual([]);
  });

  it('surfaces the GitHub error when the write is rejected', async () => {
    vi.stubGlobal('fetch', async (_url: string, init?: RequestInit) =>
      init?.method === 'PUT'
        ? new Response(JSON.stringify({ message: 'Resource not accessible by integration' }), { status: 403 })
        : new Response(JSON.stringify({ sha: 'blob' }), { status: 200 }),
    );
    const result = await saveLabelsViaApi(LABELS);
    expect(result.ok).toBe(false);
    expect(result.error).toContain('Resource not accessible');
  });
});
