import { afterEach, describe, expect, it, vi } from 'vitest';
import { contentRepoBase, contentRepoSlug, rawContentBase } from './content-repo.ts';

/**
 * The rebuilt admin hard-coded `communist-prometheus/public-website-content`
 * into its REST base, while the previous client read the coordinates from
 * `VITE_GITHUB_OWNER` / `VITE_GITHUB_REPO`. That is why no end-to-end spec
 * could be pointed at the sandbox repository: a real-mode run against the
 * rebuilt admin would have committed into production content.
 *
 * The defaults stay exactly what was hard-coded, so an unconfigured build
 * behaves as before.
 */

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('where the editor reads and writes content', () => {
  it('defaults to the production content repository', () => {
    expect(contentRepoSlug()).toBe('communist-prometheus/public-website-content');
    expect(contentRepoBase()).toBe(
      'https://api.github.com/repos/communist-prometheus/public-website-content',
    );
  });

  it('follows the build to another repository, so a test run can be sandboxed', () => {
    vi.stubEnv('VITE_GITHUB_OWNER', 'communist-prometheus');
    vi.stubEnv('VITE_GITHUB_REPO', 'admin-e2e-sandbox');
    expect(contentRepoSlug()).toBe('communist-prometheus/admin-e2e-sandbox');
    expect(contentRepoBase()).toBe(
      'https://api.github.com/repos/communist-prometheus/admin-e2e-sandbox',
    );
  });

  it('points raw file reads at the same repository', () => {
    vi.stubEnv('VITE_GITHUB_OWNER', 'acme');
    vi.stubEnv('VITE_GITHUB_REPO', 'content');
    expect(rawContentBase()).toBe('https://raw.githubusercontent.com/acme/content');
  });

  it('ignores an empty override rather than building a broken URL', () => {
    vi.stubEnv('VITE_GITHUB_OWNER', '');
    vi.stubEnv('VITE_GITHUB_REPO', '');
    expect(contentRepoSlug()).toBe('communist-prometheus/public-website-content');
  });
});
