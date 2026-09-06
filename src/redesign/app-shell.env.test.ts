import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import './app-shell.ts';
import type { AppShell } from './app-shell.ts';

/**
 * The dev admin and the production admin are the same UI pointed at different
 * content branches, and used to be indistinguishable. An editor published a
 * translation on the dev one, never found it on comprom.org, and hand-edited
 * the file on GitHub — which broke the production build. The shell must say
 * which site it writes to whenever that site is not the public one.
 */
const mount = async (): Promise<AppShell> => {
  const el = document.createElement('app-shell') as AppShell;
  document.body.append(el);
  await el.updateComplete;
  return el;
};

const text = (el: AppShell): string => (el.shadowRoot?.textContent ?? '').replace(/\s+/g, ' ').trim();

beforeEach(() => {
  document.body.replaceChildren();
});
afterEach(() => {
  vi.unstubAllEnvs();
});

describe('app-shell environment badge', () => {
  it('marks a non-production admin with the site it publishes to', async () => {
    vi.stubEnv('VITE_GITHUB_BRANCH', 'develop');
    const el = await mount();
    expect(text(el)).toContain('dev.comprom.org');
  });

  it('stays clean on the production admin', async () => {
    vi.stubEnv('VITE_GITHUB_BRANCH', 'master');
    const el = await mount();
    expect(text(el)).not.toContain('dev.comprom.org');
  });
});
