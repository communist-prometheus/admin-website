import { describe, expect, it } from 'vitest';
import { summariseAction } from './action-summary.ts';

/**
 * The recorded history is a discriminated union — a navigation carries a
 * route pair, a save carries a path and an outcome. Rendering it needs one
 * line per kind, and every kind must produce one: an entry that summarises
 * to nothing is a row the editor cannot act on.
 */
describe('summarising a recorded action', () => {
  it('reads a navigation as where it went', () => {
    expect(
      summariseAction({ id: '1', ts: 0, kind: 'navigation', from: '/a', to: '/b' }),
    ).toContain('/b');
  });

  it('reads a save as its path and outcome', () => {
    const line = summariseAction({
      id: '1',
      ts: 0,
      kind: 'save',
      action: 'push',
      path: 'blog/x/index.ru.md',
      status: 'failed',
      errorMessage: 'отказано',
    });
    expect(line).toContain('blog/x/index.ru.md');
    expect(line).toContain('отказано');
  });

  it('reads a stage event as what it did to which file', () => {
    expect(
      summariseAction({ id: '1', ts: 0, kind: 'stage', action: 'discard', path: 'a.md' }),
    ).toContain('a.md');
  });

  it('reads an auth event as the action taken', () => {
    expect(summariseAction({ id: '1', ts: 0, kind: 'auth', action: 'logout' })).not.toBe('');
  });

  it('reads a worker error as its reason', () => {
    expect(
      summariseAction({ id: '1', ts: 0, kind: 'sw-error', reason: 'timeout' }),
    ).toContain('timeout');
  });

  it('reads a network failure as its address and status', () => {
    const line = summariseAction({
      id: '1',
      ts: 0,
      kind: 'network-error',
      url: 'https://api.github.com/x',
      status: 404,
      reason: 'not found',
    });
    expect(line).toContain('api.github.com');
    expect(line).toContain('404');
  });

  it('never summarises to nothing', () => {
    const entries = [
      { id: '1', ts: 0, kind: 'navigation', from: '', to: '' },
      { id: '2', ts: 0, kind: 'auth', action: 'login' },
      { id: '3', ts: 0, kind: 'sw-error', reason: '' },
    ] as const;
    for (const entry of entries) expect(summariseAction(entry).trim()).not.toBe('');
  });
});
