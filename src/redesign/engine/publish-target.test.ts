import { afterEach, describe, expect, it, vi } from 'vitest';
import { publishTarget } from './publish-target.ts';

/*
 * The 2026-09-06 report: an editor added a translation, published it, saw a
 * success, and the article never appeared on comprom.org. It had gone to the
 * `develop` content branch, because the admin they were using was the dev one —
 * and nothing in the UI distinguishes the two. The editor then hand-created the
 * file on master through github.com and broke the production build.
 *
 * A publish must therefore be able to say, in the editor's own words, which
 * site it reaches.
 */
afterEach(() => {
  vi.unstubAllEnvs();
});

describe('publishTarget', () => {
  it('names the production site for the master content branch', () => {
    vi.stubEnv('VITE_GITHUB_BRANCH', 'master');
    expect(publishTarget()).toEqual({
      branch: 'master',
      site: 'comprom.org',
      siteUrl: 'https://comprom.org',
      production: true,
    });
  });

  it('names the dev site for the develop content branch', () => {
    vi.stubEnv('VITE_GITHUB_BRANCH', 'develop');
    expect(publishTarget()).toEqual({
      branch: 'develop',
      site: 'dev.comprom.org',
      siteUrl: 'https://dev.comprom.org',
      production: false,
    });
  });

  it('treats any other branch as a non-production target and names it', () => {
    vi.stubEnv('VITE_GITHUB_BRANCH', 'experiment');
    const target = publishTarget();
    expect(target.branch).toBe('experiment');
    expect(target.production).toBe(false);
    expect(target.site).toContain('experiment');
  });

  it('falls back to the develop target when the branch is unset', () => {
    vi.stubEnv('VITE_GITHUB_BRANCH', '');
    expect(publishTarget().production).toBe(false);
  });
});
