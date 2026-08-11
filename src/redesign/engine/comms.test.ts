import { describe, it, expect, beforeEach, vi } from 'vitest';

const commsFetch = vi.fn();
vi.mock('@/stores/comms-http', () => ({ commsFetch: (...a: unknown[]) => commsFetch(...a) }));

import { addSubscriber, removeSubscriber, forceDispatch, listSubscribers } from './comms.ts';

const res = (status: number, body: unknown): Response =>
  ({ status, ok: status >= 200 && status < 300, json: async () => body }) as unknown as Response;

describe('comms engine', () => {
  beforeEach(() => commsFetch.mockReset());

  it('lists subscribers, distinguishing failure from empty', async () => {
    commsFetch.mockResolvedValueOnce(res(200, { subscribers: [{ id: 1, email: 'a@b.c' }] }));
    expect(await listSubscribers()).toEqual({ ok: true, data: [{ id: 1, email: 'a@b.c' }] });
    commsFetch.mockResolvedValueOnce(res(500, {}));
    expect(await listSubscribers()).toEqual({ ok: false });
  });

  it('adds a subscriber (201) and posts email + langs', async () => {
    commsFetch.mockResolvedValueOnce(res(201, { id: 7, email: 'x@y.z' }));
    const result = await addSubscriber(' x@y.z ', ['ru', 'en']);
    expect(result).toEqual({ ok: true, subscriber: { id: 7, email: 'x@y.z' } });
    const [, init] = commsFetch.mock.calls[0] as [string, RequestInit];
    expect(JSON.parse(String(init.body))).toEqual({ email: 'x@y.z', langs: ['ru', 'en'] });
  });

  it('maps a duplicate (409) and invalid (422) add to typed reasons', async () => {
    commsFetch.mockResolvedValueOnce(res(409, { error: 'duplicate' }));
    expect(await addSubscriber('a@b.c', ['ru'])).toEqual({ ok: false, reason: 'duplicate' });
    commsFetch.mockResolvedValueOnce(res(422, { error: 'bad' }));
    expect(await addSubscriber('a@b.c', ['ru'])).toEqual({ ok: false, reason: 'invalid' });
  });

  it('removes a subscriber via DELETE and reports success', async () => {
    commsFetch.mockResolvedValueOnce(res(200, {}));
    expect(await removeSubscriber(7)).toBe(true);
    expect(commsFetch).toHaveBeenCalledWith('/api/subscribers/7', { method: 'DELETE' });
  });

  it('reports a real dispatch summary (202)', async () => {
    commsFetch.mockResolvedValueOnce(res(202, { sent: 3, failed: 1 }));
    expect(await forceDispatch()).toEqual({ ok: true, sent: 3, failed: 1 });
  });
});
