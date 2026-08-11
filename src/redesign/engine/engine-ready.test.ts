import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * The engine-ready broadcast keeps module-level state, so every test re-imports
 * a fresh copy via `vi.resetModules()` to start from "not ready".
 */
const freshModule = async (): Promise<typeof import('./engine-ready.js')> => {
  vi.resetModules();
  return import('./engine-ready.js');
};

describe('engine-ready', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('starts not ready', async () => {
    const { isEngineReady } = await freshModule();
    expect(isEngineReady()).toBe(false);
  });

  it('marks ready and reports it', async () => {
    const { isEngineReady, markEngineReady } = await freshModule();
    markEngineReady();
    expect(isEngineReady()).toBe(true);
  });

  it('notifies a subscriber registered before readiness', async () => {
    const { onEngineReady, markEngineReady } = await freshModule();
    const listener = vi.fn();
    onEngineReady(listener);
    expect(listener).not.toHaveBeenCalled();
    markEngineReady();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('runs a subscriber registered after readiness on a microtask', async () => {
    const { onEngineReady, markEngineReady } = await freshModule();
    markEngineReady();
    const listener = vi.fn();
    onEngineReady(listener);
    expect(listener).not.toHaveBeenCalled();
    await Promise.resolve();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('is idempotent: a second mark does not re-notify', async () => {
    const { onEngineReady, markEngineReady } = await freshModule();
    const listener = vi.fn();
    onEngineReady(listener);
    markEngineReady();
    markEngineReady();
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('unsubscribe prevents notification', async () => {
    const { onEngineReady, markEngineReady } = await freshModule();
    const listener = vi.fn();
    const off = onEngineReady(listener);
    off();
    markEngineReady();
    expect(listener).not.toHaveBeenCalled();
  });

  it('notifies multiple subscribers', async () => {
    const { onEngineReady, markEngineReady } = await freshModule();
    const a = vi.fn();
    const b = vi.fn();
    onEngineReady(a);
    onEngineReady(b);
    markEngineReady();
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });
});
