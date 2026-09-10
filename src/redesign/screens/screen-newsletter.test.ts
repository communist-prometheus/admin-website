import { describe, it, expect, beforeEach, vi } from 'vitest';

const listSubscribers = vi.fn();
const listRuns = vi.fn();
const forceDispatch = vi.fn();
const readSchedule = vi.fn();
const saveSchedule = vi.fn();
const readCutoff = vi.fn();
const listDispatches = vi.fn();
const listDispatchRecipients = vi.fn();

vi.mock('../engine/comms.js', () => ({
  listSubscribers: () => listSubscribers(),
  listRuns: () => listRuns(),
  forceDispatch: () => forceDispatch(),
  readSchedule: () => readSchedule(),
  saveSchedule: (s: unknown) => saveSchedule(s),
  readCutoff: () => readCutoff(),
  listDispatches: () => listDispatches(),
  listDispatchRecipients: (at: string) => listDispatchRecipients(at),
}));

import './screen-newsletter.ts';
import type { ScreenNewsletter } from './screen-newsletter.ts';

const shadowText = (el: HTMLElement): string =>
  (el.shadowRoot?.textContent ?? '').replace(/\s+/g, ' ').trim();

/** The screen internals a test drives directly, mirroring its private members. */
interface NewsletterInternals {
  tab: string;
  statusFilter: string;
  weekday: number;
  time: string;
  confirmSend: () => Promise<void>;
  submitSchedule: () => Promise<void>;
  openDispatch: (tickAt: string) => Promise<void>;
}

const inner = (el: ScreenNewsletter): NewsletterInternals =>
  el as unknown as NewsletterInternals;

const mount = async (): Promise<ScreenNewsletter> => {
  const el: ScreenNewsletter = document.createElement('screen-newsletter');
  document.body.append(el);
  await el.updateComplete;
  // Let the connectedCallback reads settle.
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await el.updateComplete;
  return el;
};

const SCHEDULE = {
  cron: '0 12 * * 6',
  timezone: 'Europe/Moscow',
  nextRunAt: '2026-09-12T09:00:00.000Z',
};

const dispatch = (tickAt: string, over: Record<string, number> = {}) => ({
  tickAt,
  recipients: 120,
  sent: 118,
  failed: 0,
  bounced: 2,
  complained: 0,
  skipped: 0,
  articleCount: 2,
  ...over,
});

const subscriber = (id: number, status = 'active') => ({
  id,
  email: `u${id}@example.org`,
  langs: ['ru'],
  status,
  createdAt: '2026-01-02T00:00:00Z',
});

const ALL = [
  listSubscribers,
  listRuns,
  forceDispatch,
  readSchedule,
  saveSchedule,
  readCutoff,
  listDispatches,
  listDispatchRecipients,
];

/** Every read the screen performs on connect resolves to a quiet default. */
const resetReads = (): void => {
  document.body.replaceChildren();
  for (const m of ALL) m.mockReset();
  listSubscribers.mockResolvedValue({ ok: true, data: [] });
  listRuns.mockResolvedValue({ ok: true, data: [] });
  readSchedule.mockResolvedValue({ ok: true, data: SCHEDULE });
  readCutoff.mockResolvedValue({ ok: true, data: '2026-08-08T09:00:19.000Z' });
  listDispatches.mockResolvedValue({ ok: true, data: [] });
  listDispatchRecipients.mockResolvedValue({ ok: true, data: [] });
};

describe('screen-newsletter (wired to the real comms worker)', () => {
  beforeEach(resetReads);

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
    await inner(el).confirmSend();
    await el.updateComplete;
    expect(forceDispatch).toHaveBeenCalledTimes(1);
    // The banner heading lives in cp-banner's shadow root; assert on its slotted body.
    expect(shadowText(el)).toContain('Разослано: 1');
  });

  it('surfaces a failed read as an error, not as "no integration"', async () => {
    listSubscribers.mockResolvedValue({ ok: false });
    const el = await mount();
    inner(el).tab = 'subscribers';
    await el.updateComplete;
    expect(shadowText(el)).toContain('Не удалось загрузить подписчиков');
  });
});

/*
 * The interval control had disappeared from the screen entirely: the
 * worker has stored a cron + timezone all along and exposes GET/PUT
 * /api/schedule, but the panel only offered "Отправить сейчас" and prose
 * saying the rest happens "по расписанию воркера-рассыльщика".
 */
describe('the dispatch schedule is editable again', () => {
  beforeEach(() => {
    resetReads();
    listSubscribers.mockResolvedValue({ ok: true, data: [subscriber(1)] });
  });

  it('shows the saved day and time, not just a "send now" button', async () => {
    const el = await mount();
    const form = el.shadowRoot?.querySelector('.schedule');
    expect(form).not.toBeNull();
    const day = form?.querySelector<HTMLSelectElement>('select[name="weekday"]');
    const time = form?.querySelector<HTMLInputElement>('input[name="time"]');
    expect(day?.value).toBe('6');
    expect(time?.value).toBe('12:00');
  });

  it('tells the editor when the next dispatch fires', async () => {
    const el = await mount();
    expect(shadowText(el)).toContain('Следующая отправка');
  });

  it('saves the chosen day and time as the worker cron', async () => {
    saveSchedule.mockResolvedValue({ ok: true, schedule: { ...SCHEDULE, cron: '0 9 * * 1' } });
    const el = await mount();
    const priv = inner(el);
    priv.weekday = 1;
    priv.time = '09:00';
    await priv.submitSchedule();
    expect(saveSchedule).toHaveBeenCalledWith({ cron: '0 9 * * 1', timezone: 'Europe/Moscow' });
  });

  it('names the cutoff that decides what counts as new material', async () => {
    const el = await mount();
    expect(shadowText(el)).toContain('2026-08-08');
  });

  it('keeps a hand-written crontab editable as cron instead of rewriting it', async () => {
    readSchedule.mockResolvedValue({
      ok: true,
      data: { cron: '0 9 * * 1,4', timezone: 'Europe/Moscow', nextRunAt: '' },
    });
    const el = await mount();
    const raw = el.shadowRoot?.querySelector<HTMLInputElement>('input[name="cron"]');
    expect(raw?.value).toBe('0 9 * * 1,4');
    expect(el.shadowRoot?.querySelector('select[name="weekday"]')).toBeNull();
  });

  it('surfaces the worker refusal instead of pretending the save worked', async () => {
    saveSchedule.mockResolvedValue({ ok: false, error: 'bad cron' });
    const el = await mount();
    await inner(el).submitSchedule();
    await el.updateComplete;
    expect(shadowText(el)).toContain('bad cron');
  });
});

/*
 * `send_log` holds one row per RECIPIENT, and the journal rendered each
 * of them as its own dispatch — so a lone Resend bounce webhook showed
 * up as "Отправка от 13:37 · 0 материалов". The journal lists runs now,
 * and opening one names who it reached.
 */
describe('the send journal reads as dispatches, not rows', () => {
  beforeEach(() => {
    resetReads();
    listSubscribers.mockResolvedValue({ ok: true, data: [subscriber(1)] });
    listDispatches.mockResolvedValue({
      ok: true,
      data: [dispatch('2026-08-08T09:00:00.000Z'), dispatch('2026-07-25T09:00:00.000Z')],
    });
  });

  const openLog = async (): Promise<ScreenNewsletter> => {
    const el = await mount();
    inner(el).tab = 'log';
    await el.updateComplete;
    return el;
  };

  it('lists one entry per dispatch with how many addresses it reached', async () => {
    const el = await openLog();
    const rows = [...(el.shadowRoot?.querySelectorAll('.log cp-list-row') ?? [])];
    expect(rows).toHaveLength(2);
    // cp-list-row renders title/meta inside its own shadow root.
    expect(rows[0]?.getAttribute('meta')).toBe('120 получателей · 2 материалов');
    expect(rows[0]?.getAttribute('title')).toContain('Отправка от');
  });

  it('opens a dispatch to show who received it and with what status', async () => {
    listDispatchRecipients.mockResolvedValue({
      ok: true,
      data: [
        {
          id: 1,
          email: 'a@example.org',
          tickAt: '2026-08-08T09:00:00.000Z',
          articleCount: 2,
          status: 'sent',
        },
        {
          id: 2,
          email: 'b@example.org',
          tickAt: '2026-08-08T09:00:00.000Z',
          articleCount: 2,
          status: 'failed',
          error: 'resend 500',
        },
      ],
    });
    const el = await openLog();
    await inner(el).openDispatch('2026-08-08T09:00:00.000Z');
    await el.updateComplete;
    expect(listDispatchRecipients).toHaveBeenCalledWith('2026-08-08T09:00:00.000Z');
    const table = el.shadowRoot?.querySelector('cp-table');
    const rows: readonly Record<string, unknown>[] = Reflect.get(table ?? {}, 'rows') ?? [];
    expect(rows.map((r) => r.email)).toEqual(['a@example.org', 'b@example.org']);
    expect(rows[1]?.error).toBe('resend 500');
  });

  it('shows a tick that found nothing as a run that happened, not a failure', async () => {
    listDispatches.mockResolvedValue({
      ok: true,
      data: [
        dispatch('2026-08-15T09:00:00.000Z', {
          recipients: 1,
          sent: 0,
          bounced: 0,
          skipped: 1,
          articleCount: 0,
        }),
      ],
    });
    const el = await openLog();
    const row = el.shadowRoot?.querySelector('.log cp-list-row');
    expect(row?.getAttribute('meta')).toBe('новых материалов не было');
    // An idle tick has no recipients to drill into.
    expect(el.shadowRoot?.querySelector('.log-row')).toBeNull();
  });

  it('explains an empty history rather than showing nothing', async () => {
    listDispatches.mockResolvedValue({ ok: true, data: [] });
    const el = await openLog();
    expect(shadowText(el)).toContain('Отправок ещё не было');
  });
});

/*
 * The list mixes four lifecycle states, and three of them are terminal:
 * an editor looking for "кто отвалился" had to read 130 rows to find
 * them. The panel filters by status, and says what each status means —
 * "отскок" and "жалоба" are not self-explanatory.
 */
describe('the subscriber list filters by status', () => {
  const list = [
    subscriber(1),
    subscriber(2),
    subscriber(3, 'unsubscribed'),
    subscriber(4, 'bounced'),
    subscriber(5, 'bounced'),
    subscriber(6, 'complained'),
  ];

  const rowsOf = (el: ScreenNewsletter): readonly Record<string, unknown>[] => {
    const table = el.shadowRoot?.querySelector('cp-table');
    return Reflect.get(table ?? {}, 'rows') ?? [];
  };

  const openSubscribers = async (): Promise<ScreenNewsletter> => {
    const el = await mount();
    inner(el).tab = 'subscribers';
    await el.updateComplete;
    return el;
  };

  beforeEach(() => {
    resetReads();
    listSubscribers.mockResolvedValue({ ok: true, data: list });
  });

  it('offers one filter per status, each carrying its count', async () => {
    const el = await openSubscribers();
    const chips = [...(el.shadowRoot?.querySelectorAll('.status-filter button') ?? [])];
    const labels = chips.map((c) => (c.textContent ?? '').replace(/\s+/g, ' ').trim());
    expect(labels).toEqual([
      'Все 6',
      'Активные 2',
      'Отписались 1',
      'Отскок 2',
      'Жалобы 1',
    ]);
  });

  it('narrows the table to the chosen status', async () => {
    const el = await openSubscribers();
    inner(el).statusFilter = 'bounced';
    await el.updateComplete;
    expect(rowsOf(el).map((r) => r.id)).toEqual(['4', '5']);
  });

  it('restores the whole list when the filter is cleared', async () => {
    const el = await openSubscribers();
    inner(el).statusFilter = 'complained';
    await el.updateComplete;
    inner(el).statusFilter = 'all';
    await el.updateComplete;
    expect(rowsOf(el)).toHaveLength(6);
  });

  it('marks the chosen filter as pressed for assistive tech', async () => {
    const el = await openSubscribers();
    inner(el).statusFilter = 'unsubscribed';
    await el.updateComplete;
    const pressed = [...(el.shadowRoot?.querySelectorAll('.status-filter button') ?? [])].filter(
      (c) => c.getAttribute('aria-pressed') === 'true',
    );
    expect(pressed).toHaveLength(1);
    expect(pressed[0]?.textContent).toContain('Отписались');
  });

  it('explains what each status means', async () => {
    const el = await openSubscribers();
    const text = shadowText(el);
    expect(text).toContain('получает выпуски');
    expect(text).toContain('отказался от рассылки');
    expect(text).toContain('не принял письмо');
    expect(text).toContain('пометил письмо как спам');
  });

  it('says so when a filter matches nobody', async () => {
    listSubscribers.mockResolvedValue({ ok: true, data: [subscriber(1)] });
    const el = await openSubscribers();
    inner(el).statusFilter = 'bounced';
    await el.updateComplete;
    expect(shadowText(el)).toContain('С этим статусом подписчиков нет');
  });

  it('keeps the dispatch aimed at every active address, not the filtered view', async () => {
    const el = await openSubscribers();
    inner(el).statusFilter = 'bounced';
    await el.updateComplete;
    inner(el).tab = 'schedule';
    await el.updateComplete;
    expect(shadowText(el)).toContain('2 активным');
  });
});

/*
 * A tick that delivered nothing is not automatically a failure: the
 * pre-fix bounce rows and any run with no successful send but no error
 * either are simply uneventful. Red is reserved for real errors.
 */
describe('the journal chip separates "quiet" from "broken"', () => {
  const openLog = async (tick: Record<string, number>): Promise<ScreenNewsletter> => {
    listDispatches.mockResolvedValue({ ok: true, data: [dispatch('2026-08-08T09:00:00.000Z', tick)] });
    const el = await mount();
    inner(el).tab = 'log';
    await el.updateComplete;
    return el;
  };

  // cp-status renders its label inside its own shadow root — read the attribute.
  const chip = (el: ScreenNewsletter): { state?: string; label?: string } => {
    const node = el.shadowRoot?.querySelector('.log cp-status');
    return { state: node?.getAttribute('state') ?? undefined, label: node?.getAttribute('label') ?? undefined };
  };
  const chipState = (el: ScreenNewsletter): string | undefined => chip(el).state;

  beforeEach(resetReads);

  it('greys out a run that sent nothing and broke nothing', async () => {
    const el = await openLog({ recipients: 1, sent: 0, failed: 0, bounced: 1, skipped: 0 });
    expect(chip(el)).toEqual({ state: 'neutral', label: 'ничего не ушло' });
  });

  it('keeps red for a run where every send failed', async () => {
    const el = await openLog({ recipients: 3, sent: 0, failed: 3, bounced: 0, skipped: 0 });
    expect(chipState(el)).toBe('danger');
  });

  it('warns, not alarms, when only some sends failed', async () => {
    const el = await openLog({ recipients: 3, sent: 2, failed: 1, bounced: 0, skipped: 0 });
    expect(chipState(el)).toBe('warning');
  });

  it('keeps a clean run green', async () => {
    const el = await openLog({ recipients: 3, sent: 3, failed: 0, bounced: 0, skipped: 0 });
    expect(chipState(el)).toBe('success');
  });
});
