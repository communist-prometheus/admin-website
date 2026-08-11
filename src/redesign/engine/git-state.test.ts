import { test, expect } from 'bun:test';
import { createGitStateStore, toSyncStatus, type ChannelIo } from './git-state.ts';
import { SW_PUSH_STATE_CHANNEL } from '../../sw/protocol/push-state.ts';
import { SW_CONNECTIVITY_CHANNEL } from '../../sw/protocol/connectivity.ts';
import { SW_PUSH_ERROR_CHANNEL } from '../../sw/protocol/push-error.ts';

/** A fake channel IO that lets tests emit events into the store. */
const makeFakeIo = (): { io: ChannelIo; emit: (channel: string, data: unknown) => void } => {
  const handlers = new Map<string, (data: unknown) => void>();
  return {
    io: {
      listen: (channel, onMessage) => {
        handlers.set(channel, onMessage);
        return () => handlers.delete(channel);
      },
    },
    emit: (channel, data) => handlers.get(channel)?.(data),
  };
};

test('starts idle, online, synced', () => {
  const store = createGitStateStore(makeFakeIo().io);
  expect(store.get()).toMatchObject({ status: 'idle', pending: 0, online: true });
  expect(store.syncStatus()).toEqual({ tone: 'success', label: 'синхронизировано' });
});

test('push-state event → syncing + info status', () => {
  const fake = makeFakeIo();
  const store = createGitStateStore(fake.io);
  fake.emit(SW_PUSH_STATE_CHANNEL, { status: 'syncing', pending: 2 });
  expect(store.get().status).toBe('syncing');
  expect(store.syncStatus()).toEqual({ tone: 'info', label: 'синхронизация… (2)' });
});

test('offline connectivity → warning status', () => {
  const fake = makeFakeIo();
  const store = createGitStateStore(fake.io);
  fake.emit(SW_CONNECTIVITY_CHANNEL, { online: false, at: 1 });
  expect(store.get().online).toBe(false);
  expect(store.syncStatus().tone).toBe('warning');
});

test('classified push error → danger status with reason copy', () => {
  const fake = makeFakeIo();
  const store = createGitStateStore(fake.io);
  fake.emit(SW_PUSH_ERROR_CHANNEL, {
    reason: 'auth',
    sha: 'abc',
    target: 'develop',
    at: 1,
    terminal: true,
    attempt: 1,
  });
  expect(store.get().status).toBe('error');
  expect(store.syncStatus()).toEqual({ tone: 'danger', label: 'нужен вход' });
});

test('subscribers are notified and dispose unsubscribes', () => {
  const fake = makeFakeIo();
  const store = createGitStateStore(fake.io);
  let seen = 0;
  const off = store.subscribe(() => (seen += 1));
  fake.emit(SW_PUSH_STATE_CHANNEL, { status: 'syncing', pending: 1 });
  expect(seen).toBe(1);
  off();
  fake.emit(SW_PUSH_STATE_CHANNEL, { status: 'idle', pending: 0 });
  expect(seen).toBe(1);
  store.dispose();
  fake.emit(SW_PUSH_STATE_CHANNEL, { status: 'error', pending: 0 });
  expect(store.get().status).toBe('idle');
});

test('non-fast-forward maps to merge copy', () => {
  expect(
    toSyncStatus({
      status: 'error',
      pending: 0,
      online: true,
      lastError: {
        reason: 'non-fast-forward',
        sha: 'x',
        target: 'develop',
        at: 1,
        terminal: false,
        attempt: 1,
      },
    }).label,
  ).toBe('нужно объединить');
});
