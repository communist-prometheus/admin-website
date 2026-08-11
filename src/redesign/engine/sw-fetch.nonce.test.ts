import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

vi.mock('./engine-boot.js', () => ({ reinitEngine: vi.fn(async () => true) }));

import { swFetch, setSwNonce } from './sw-fetch.ts';

beforeEach(() => {
  setSwNonce(undefined);
});
afterEach(() => {
  vi.unstubAllGlobals();
});

describe('redesign swFetch nonce', () => {
  it('attaches the X-SW-Nonce header once a nonce is known', async () => {
    setSwNonce('abc');
    const seen: (string | null)[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: unknown, init?: RequestInit) => {
        seen.push(new Headers(init?.headers).get('X-SW-Nonce'));
        return new Response('ok', { status: 200 });
      }),
    );
    await swFetch('/api/github/tree');
    expect(seen[0]).toBe('abc');
  });

  it('sends no nonce header before init (nonce undefined)', async () => {
    const seen: (string | null)[] = [];
    vi.stubGlobal(
      'fetch',
      vi.fn(async (_input: unknown, init?: RequestInit) => {
        seen.push(new Headers(init?.headers).get('X-SW-Nonce'));
        return new Response('ok', { status: 200 });
      }),
    );
    await swFetch('/api/github/tree');
    expect(seen[0]).toBeNull();
  });

  it('re-inits and retries once on a nonce 403', async () => {
    setSwNonce('abc');
    let calls = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        calls += 1;
        return calls === 1
          ? new Response(JSON.stringify({ error: 'SW nonce required' }), { status: 403 })
          : new Response('ok', { status: 200 });
      }),
    );
    const res = await swFetch('/api/github/tree');
    expect(res.status).toBe(200);
    expect(calls).toBe(2);
  });

  it('does not retry a normal 200', async () => {
    setSwNonce('abc');
    let calls = 0;
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => {
        calls += 1;
        return new Response('ok', { status: 200 });
      }),
    );
    await swFetch('/api/github/tree');
    expect(calls).toBe(1);
  });
});
