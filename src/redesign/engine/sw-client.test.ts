import { test, expect } from 'bun:test';
import { createSwClient, type SwTransport } from './sw-client.ts';
import type { SWRequest } from '../../sw/protocol/request-types.ts';

/** A fake transport that records requests and returns scripted replies. */
const makeTransport = (reply: unknown): { transport: SwTransport; sent: SWRequest[] } => {
  const sent: SWRequest[] = [];
  return {
    sent,
    transport: async (message) => {
      sent.push(message);
      return reply;
    },
  };
};

test('init posts SW_INIT with the config', async () => {
  const { transport, sent } = makeTransport(undefined);
  const client = createSwClient(transport);
  const config = {
    owner: 'communist-prometheus',
    repo: 'public-website-content',
    branch: 'develop',
    contentPath: 'content',
    corsProxy: 'https://proxy',
    token: 'gho_x',
  };
  await client.init(config);
  expect(sent[0]).toEqual({ type: 'SW_INIT', config });
});

test('status returns the SW status reply', async () => {
  const status = {
    state: 'ready',
    cloned: true,
    lastSync: 123,
    commitSha: 'abc',
    fsBytes: 1024,
    version: '1',
  };
  const { transport, sent } = makeTransport(status);
  const client = createSwClient(transport);
  await expect(client.status()).resolves.toEqual(status);
  expect(sent[0]).toEqual({ type: 'SW_STATUS' });
});

test('status rejects on an unexpected reply shape', async () => {
  const client = createSwClient(makeTransport({ nope: true }).transport);
  await expect(client.status()).rejects.toThrow('unexpected reply shape');
});

test('invalidate posts SW_INVALIDATE', async () => {
  const { transport, sent } = makeTransport(undefined);
  await createSwClient(transport).invalidate();
  expect(sent[0]).toEqual({ type: 'SW_INVALIDATE' });
});
