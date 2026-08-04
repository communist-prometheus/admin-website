import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// getViewerRole needs a token, then reads the repo's `permissions`. Stub the
// token source and GitHub fetch so the permission→role mapping can be asserted.
vi.mock('@/composables/useAuth/ensure-fresh-token', () => ({
  ensureFreshToken: async () => 'test-token',
}));

import { getViewerRole } from './github-api.ts';

const repoResponse = (permissions: unknown): Response =>
  ({ ok: true, json: async () => ({ permissions }) }) as unknown as Response;

describe('getViewerRole (QA #2 role derivation)', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('maps admin permission to owner/admin', async () => {
    vi.mocked(fetch).mockResolvedValue(repoResponse({ admin: true, push: true, pull: true }));
    expect(await getViewerRole()).toEqual({ role: 'admin', owner: true });
  });

  it('maps push permission to editor (not owner)', async () => {
    vi.mocked(fetch).mockResolvedValue(repoResponse({ admin: false, push: true, pull: true }));
    expect(await getViewerRole()).toEqual({ role: 'editor', owner: false });
  });

  it('maps read-only permission to viewer', async () => {
    vi.mocked(fetch).mockResolvedValue(repoResponse({ admin: false, push: false, pull: true }));
    expect(await getViewerRole()).toEqual({ role: 'viewer', owner: false });
  });

  it('returns undefined when the request fails', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as unknown as Response);
    expect(await getViewerRole()).toBeUndefined();
  });
});
