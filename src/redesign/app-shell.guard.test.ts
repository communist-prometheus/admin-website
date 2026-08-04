import { describe, it, expect, beforeEach } from 'vitest';
import { render } from 'lit';
import './app-shell.ts';
import { AppShell } from './app-shell.ts';
import type { ViewerRole } from './engine/github-api.ts';

interface ShellInternals {
  account?: string;
  viewerRole?: ViewerRole;
  route: string;
  renderRouted: (screen: undefined) => unknown;
}

/** Renders the routed region for a given session and returns its text. */
const routedText = (route: string, account: string | undefined, role?: ViewerRole): string => {
  const el = document.createElement('app-shell') as AppShell;
  const priv = el as unknown as ShellInternals;
  priv.account = account;
  priv.viewerRole = role;
  priv.route = route;
  const container = document.createElement('div');
  render(priv.renderRouted(undefined), container);
  return (container.textContent ?? '').replace(/\s+/g, ' ').trim();
};

describe('app-shell route guard (QA #2)', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('denies the owner-only newsletter to an editor', () => {
    expect(routedText('newsletter', 'u', { role: 'editor', owner: false })).toContain('Нет доступа');
  });

  it('denies admin-only settings to an editor', () => {
    expect(routedText('settings', 'u', { role: 'editor', owner: false })).toContain('Нет доступа');
  });

  it('is fail-closed for owner-only routes before the role resolves', () => {
    // viewerRole undefined → auth falls back to editor → owner-only stays denied.
    expect(routedText('newsletter', 'u', undefined)).toContain('Нет доступа');
  });

  it('allows the newsletter for a confirmed owner', () => {
    expect(routedText('newsletter', 'u', { role: 'admin', owner: true })).not.toContain(
      'Нет доступа',
    );
  });

  it('never guards an editor content route', () => {
    expect(routedText('articles', 'u', { role: 'editor', owner: false })).not.toContain(
      'Нет доступа',
    );
  });
});
