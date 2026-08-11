import { describe, it, expect, beforeEach, vi } from 'vitest';

/** A fake BroadcastChannel that lets the test emit messages to the listener. */
class FakeChannel {
  static last: FakeChannel | undefined;
  onmessage?: (e: { data: unknown }) => void;
  constructor(public name: string) {
    FakeChannel.last = this;
  }
  emit(data: unknown): void {
    this.onmessage?.({ data });
  }
  postMessage(): void {}
  close(): void {}
}

const fresh = async (): Promise<typeof import('./engine-progress.js')> => {
  vi.resetModules();
  vi.stubGlobal('BroadcastChannel', FakeChannel);
  return import('./engine-progress.js');
};

describe('engine-progress', () => {
  beforeEach(() => {
    vi.resetModules();
    FakeChannel.last = undefined;
  });

  it('has no progress before any event', async () => {
    const { currentProgress } = await fresh();
    expect(currentProgress()).toBeUndefined();
  });

  it('captures a broadcast progress event and notifies subscribers', async () => {
    const { currentProgress, onEngineProgress } = await fresh();
    const listener = vi.fn();
    onEngineProgress(listener);
    FakeChannel.last?.emit({ phase: 'Receiving objects', loaded: 30, total: 60 });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(currentProgress()).toEqual({ phase: 'Receiving objects', loaded: 30, total: 60 });
  });

  it('ignores malformed messages', async () => {
    const { currentProgress } = await fresh();
    currentProgress(); // opens the channel
    FakeChannel.last?.emit(undefined);
    FakeChannel.last?.emit({ loaded: 1 });
    expect(currentProgress()).toBeUndefined();
  });

  it('coerces missing numbers to zero', async () => {
    const { currentProgress } = await fresh();
    currentProgress(); // opens the channel
    FakeChannel.last?.emit({ phase: 'Counting objects' });
    expect(currentProgress()).toEqual({ phase: 'Counting objects', loaded: 0, total: 0 });
  });

  it('unsubscribe stops notifications', async () => {
    const { onEngineProgress } = await fresh();
    const listener = vi.fn();
    const off = onEngineProgress(listener);
    off();
    FakeChannel.last?.emit({ phase: 'Resolving deltas', loaded: 1, total: 2 });
    expect(listener).not.toHaveBeenCalled();
  });
});
