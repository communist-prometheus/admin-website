import { describe, it, expect, beforeEach, vi } from 'vitest';

/** Re-import both modules fresh so engine-ready's module state starts unset. */
const fresh = async (): Promise<{
  classifyEmpty: typeof import('./load-state.js').classifyEmpty;
  markEngineReady: typeof import('./engine-ready.js').markEngineReady;
}> => {
  vi.resetModules();
  const [{ classifyEmpty }, { markEngineReady }] = await Promise.all([
    import('./load-state.js'),
    import('./engine-ready.js'),
  ]);
  return { classifyEmpty, markEngineReady };
};

describe('classifyEmpty (QA #14)', () => {
  beforeEach(() => {
    vi.resetModules();
    localStorage.clear();
  });

  it('reports loading before the read completes', async () => {
    const { classifyEmpty } = await fresh();
    expect(classifyEmpty(false)).toBe('loading');
  });

  it('reports signed-out when loaded, engine not booted, and no session', async () => {
    const { classifyEmpty } = await fresh();
    expect(classifyEmpty(true)).toBe('signed-out');
  });

  it('reports empty (reload, not sign-in) when a session exists but boot failed', async () => {
    localStorage.setItem('gh_token', 'gho_x');
    const { classifyEmpty } = await fresh();
    // Engine never marked ready (boot failed) but the editor IS signed in.
    expect(classifyEmpty(true)).toBe('empty');
  });

  it('reports empty (not signed-out) when the engine is ready', async () => {
    const { classifyEmpty, markEngineReady } = await fresh();
    markEngineReady();
    expect(classifyEmpty(true)).toBe('empty');
  });

  it('still reports loading while the engine is ready but the read is pending', async () => {
    const { classifyEmpty, markEngineReady } = await fresh();
    markEngineReady();
    expect(classifyEmpty(false)).toBe('loading');
  });
});
