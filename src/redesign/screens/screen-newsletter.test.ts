import { describe, it, expect, beforeEach, vi } from 'vitest';

const listSubscribers = vi.fn();
const listRuns = vi.fn();
const forceDispatch = vi.fn();

vi.mock('../engine/comms.js', () => ({
  listSubscribers: () => listSubscribers(),
  listRuns: () => listRuns(),
  forceDispatch: () => forceDispatch(),
}));

import './screen-newsletter.ts';
import type { ScreenNewsletter } from './screen-newsletter.ts';

const shadowText = (el: HTMLElement): string =>
  (el.shadowRoot?.textContent ?? '').replace(/\s+/g, ' ').trim();

const mount = async (): Promise<ScreenNewsletter> => {
  const el = document.createElement('screen-newsletter') as ScreenNewsletter;
  document.body.append(el);
  await el.updateComplete;
  // Let the connectedCallback reads settle.
  await Promise.resolve();
  await Promise.resolve();
  await el.updateComplete;
  return el;
};

const subscriber = (id: number, status = 'active') => ({
  id,
  email: `u${id}@example.org`,
  langs: ['ru'],
  status,
  createdAt: '2026-01-02T00:00:00Z',
});

describe('screen-newsletter (wired to the real comms worker)', () => {
  beforeEach(() => {
    document.body.replaceChildren();
    listSubscribers.mockReset();
    listRuns.mockReset();
    forceDispatch.mockReset();
    listSubscribers.mockResolvedValue({ ok: true, data: [] });
    listRuns.mockResolvedValue({ ok: true, data: [] });
  });

  it('never claims the integration is missing', async () => {
    const el = await mount();
    const text = shadowText(el);
    expect(text).not.toContain('не подключен');
    expect(text).not.toContain('демонстрационные');
  });

  it('counts real active subscribers for the dispatch', async () => {
    listSubscribers.mockResolvedValue({
      ok: true,
      data: [subscriber(1), subscriber(2), subscriber(3, 'unsubscribed')],
    });
    const el = await mount();
    // Schedule tab mentions the active count (2 of 3).
    expect(shadowText(el)).toContain('2 активным');
  });

  it('confirmSend calls the real dispatch and reports the result', async () => {
    listSubscribers.mockResolvedValue({ ok: true, data: [subscriber(1)] });
    forceDispatch.mockResolvedValue({ ok: true, sent: 1, failed: 0 });
    const el = await mount();
    await (el as unknown as { confirmSend: () => Promise<void> }).confirmSend();
    await el.updateComplete;
    expect(forceDispatch).toHaveBeenCalledTimes(1);
    // The banner heading lives in cp-banner's shadow root; assert on its slotted body.
    expect(shadowText(el)).toContain('Разослано: 1');
  });

  it('surfaces a failed read as an error, not as "no integration"', async () => {
    listSubscribers.mockResolvedValue({ ok: false });
    const el = await mount();
    (el as unknown as { tab: string }).tab = 'subscribers';
    await el.updateComplete;
    expect(shadowText(el)).toContain('Не удалось загрузить подписчиков');
  });
});
