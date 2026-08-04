import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

const reinitEngine = vi.fn<() => Promise<boolean>>();
vi.mock('./engine-boot.js', () => ({ reinitEngine: () => reinitEngine() }));

import { swFetch } from './sw-fetch.ts';

const notReady = (): Response =>
  ({ status: 503, clone: () => ({ text: async () => '{"error":"SW not ready"}' }) }) as unknown as Response;
const ok = (): Response => ({ status: 200, clone: () => ({ text: async () => '{}' }) }) as unknown as Response;

describe('swFetch (SW-not-ready self-heal)', () => {
  beforeEach(() => {
    reinitEngine.mockReset();
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => vi.unstubAllGlobals());

  it('passes a healthy response straight through without re-init', async () => {
    vi.mocked(fetch).mockResolvedValue(ok());
    const res = await swFetch('/api/github/tree?path=blog');
    expect(res.status).toBe(200);
    expect(reinitEngine).not.toHaveBeenCalled();
  });

  it('re-inits and retries once on "SW not ready", returning the retry', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(notReady()).mockResolvedValueOnce(ok());
    reinitEngine.mockResolvedValue(true);
    const res = await swFetch('/api/github/tree?path=blog');
    expect(reinitEngine).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(2);
    expect(res.status).toBe(200);
  });

  it('does not retry when re-init fails — returns the original 503', async () => {
    vi.mocked(fetch).mockResolvedValue(notReady());
    reinitEngine.mockResolvedValue(false);
    const res = await swFetch('/api/github/tree?path=blog');
    expect(reinitEngine).toHaveBeenCalledTimes(1);
    expect(vi.mocked(fetch)).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(503);
  });

  it('dedupes concurrent heals into a single re-init', async () => {
    vi.mocked(fetch).mockResolvedValueOnce(notReady()).mockResolvedValueOnce(notReady()).mockResolvedValue(ok());
    reinitEngine.mockResolvedValue(true);
    const [a, b] = await Promise.all([
      swFetch('/api/github/tree?path=blog'),
      swFetch('/api/github/file?path=x'),
    ]);
    expect(reinitEngine).toHaveBeenCalledTimes(1);
    expect(a.status).toBe(200);
    expect(b.status).toBe(200);
  });
});
