import { describe, it, expect, beforeEach, vi } from 'vitest';

const commsFetch = vi.fn();
vi.mock('@/stores/comms-http', () => ({ commsFetch: (...a: unknown[]) => commsFetch(...a) }));

import {
  addSubscriber,
  removeSubscriber,
  forceDispatch,
  listSubscribers,
  readSchedule,
  saveSchedule,
  readCutoff,
  listDispatches,
  listDispatchRecipients,
} from './comms.ts';

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

describe('the dispatch schedule', () => {
  beforeEach(() => commsFetch.mockReset());

  it('reads the saved schedule together with its next fire time', async () => {
    commsFetch.mockResolvedValueOnce(
      res(200, { cron: '0 12 * * 6', timezone: 'Europe/Moscow', nextRunAt: '2026-09-12T09:00:00.000Z' }),
    );
    expect(await readSchedule()).toEqual({
      ok: true,
      data: { cron: '0 12 * * 6', timezone: 'Europe/Moscow', nextRunAt: '2026-09-12T09:00:00.000Z' },
    });
  });

  it('treats a worker that has no schedule row as a failed read, not an empty one', async () => {
    commsFetch.mockResolvedValueOnce(res(404, { error: 'not_found' }));
    expect(await readSchedule()).toEqual({ ok: false });
  });

  it('saves the schedule as a PUT carrying cron + timezone', async () => {
    commsFetch.mockResolvedValueOnce(res(200, { cron: '0 9 * * 1', timezone: 'Europe/Moscow', nextRunAt: 'x' }));
    const saved = await saveSchedule({ cron: '0 9 * * 1', timezone: 'Europe/Moscow' });
    expect(saved.ok).toBe(true);
    const [path, init] = commsFetch.mock.calls[0] as [string, RequestInit];
    expect(path).toBe('/api/schedule');
    expect(init.method).toBe('PUT');
    expect(JSON.parse(String(init.body))).toEqual({ cron: '0 9 * * 1', timezone: 'Europe/Moscow' });
  });

  it('reports the worker rejection of an invalid crontab', async () => {
    commsFetch.mockResolvedValueOnce(res(422, { error: 'bad cron' }));
    expect(await saveSchedule({ cron: 'nope', timezone: 'Europe/Moscow' })).toEqual({
      ok: false,
      error: 'bad cron',
    });
  });

  it('reads the cutoff that decides what counts as new', async () => {
    commsFetch.mockResolvedValueOnce(res(200, { at: '2026-08-08T09:00:19.000Z' }));
    expect(await readCutoff()).toEqual({ ok: true, data: '2026-08-08T09:00:19.000Z' });
    commsFetch.mockResolvedValueOnce(res(200, { at: null }));
    expect(await readCutoff()).toEqual({ ok: true, data: undefined });
  });
});

describe('the send journal', () => {
  beforeEach(() => commsFetch.mockReset());

  it('lists dispatches rather than one entry per recipient', async () => {
    commsFetch.mockResolvedValueOnce(
      res(200, { ticks: [{ tickAt: '2026-08-08T09:00:00.000Z', recipients: 120, sent: 118 }] }),
    );
    const read = await listDispatches();
    expect(read).toEqual({ ok: true, data: [{ tickAt: '2026-08-08T09:00:00.000Z', recipients: 120, sent: 118 }] });
    expect(commsFetch).toHaveBeenCalledWith('/api/runs/ticks');
  });

  it('opens one dispatch to name its recipients', async () => {
    commsFetch.mockResolvedValueOnce(res(200, { runs: [{ id: 1, email: 'a@b.c', status: 'sent' }] }));
    await listDispatchRecipients('2026-08-08T09:00:00.000Z');
    expect(commsFetch).toHaveBeenCalledWith('/api/runs/tick?at=2026-08-08T09%3A00%3A00.000Z');
  });
});
