import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@communist-prometheus/cp-components';
import type { CpTab, CpTableColumn, CpTableRow } from '@communist-prometheus/cp-components';
import {
  listSubscribers,
  forceDispatch,
  addSubscriber,
  removeSubscriber,
  readSchedule,
  saveSchedule,
  readCutoff,
  listDispatches,
  listDispatchRecipients,
  type Subscriber,
  type DispatchResult,
  type DispatchSchedule,
  type DispatchTick,
  type DispatchRecipient,
} from '../engine/comms.js';
import { parseWeekly, weeklyCron, WEEKDAYS } from '../engine/schedule-cron.js';

/** The seven publication languages a subscriber can receive. */
const LANGS: readonly string[] = ['ru', 'en', 'it', 'es', 'uk', 'pl', 'bl'];

/**
 * Timezones the schedule is offered in. The saved one is appended when it
 * is none of these, so a hand-set zone is never silently replaced.
 */
const TIMEZONES: readonly string[] = ['Europe/Moscow', 'UTC', 'Europe/Berlin', 'America/New_York'];

/** Column definitions for the per-dispatch recipient table. */
const RECIPIENT_COLUMNS: readonly CpTableColumn[] = [
  { key: 'email', label: 'Адрес' },
  { key: 'articles', label: 'Материалов' },
  { key: 'status', label: 'Статус' },
  { key: 'error', label: 'Ошибка' },
];

/** Maps a send-log status to a cp-status tone + label. */
const SEND_STATUS: Readonly<Record<string, { state: string; label: string }>> = {
  sent: { state: 'success', label: 'доставлено' },
  failed: { state: 'danger', label: 'ошибка' },
  bounced: { state: 'warning', label: 'отскок' },
  complained: { state: 'warning', label: 'жалоба' },
  skipped: { state: 'neutral', label: 'пропущен' },
};

const sendStatusOf = (status: string): { state: string; label: string } =>
  SEND_STATUS[status] ?? { state: 'neutral', label: status };

/**
 * Render an ISO instant in the schedule's timezone. The worker stores and
 * returns UTC; the editor reads the wall clock they set the schedule in.
 */
const inZone = (iso: string, timezone: string): string => {
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) return iso;
  try {
    return new Intl.DateTimeFormat('ru-RU', {
      dateStyle: 'long',
      timeStyle: 'short',
      timeZone: timezone,
    }).format(new Date(ms));
  } catch {
    return new Date(ms).toISOString().slice(0, 16).replace('T', ' ');
  }
};

/**
 * Whether the tick fired but had nothing to carry. Such a tick records a
 * single marker row belonging to no recipient, so a quiet week reads as a
 * run that happened rather than as a gap in the journal.
 */
const isIdle = (tick: DispatchTick): boolean =>
  tick.articleCount === 0 && tick.sent === 0 && tick.failed === 0 && tick.skipped > 0;

/**
 * How a dispatch ended, as one chip. Red is reserved for real errors: a
 * run that delivered nothing but broke nothing — the delivery-event rows
 * written before the webhook fix, among others — is uneventful, not
 * alarming, and reads grey.
 */
const tickTone = (tick: DispatchTick): { state: string; label: string } => {
  if (isIdle(tick)) return { state: 'neutral', label: 'нечего отправлять' };
  if (tick.failed > 0 && tick.sent === 0) return { state: 'danger', label: 'все с ошибкой' };
  if (tick.failed > 0) return { state: 'warning', label: `${tick.failed} с ошибкой` };
  if (tick.sent === 0) return { state: 'neutral', label: 'ничего не ушло' };
  return { state: 'success', label: 'доставлено' };
};

/** The one-line summary under a journal entry's title. */
const tickMeta = (tick: DispatchTick): string =>
  isIdle(tick)
    ? 'новых материалов не было'
    : `${tick.recipients} получателей · ${tick.articleCount} материалов`;

/** The three sub-nav panels of the newsletter screen. */
type TabId = 'schedule' | 'subscribers' | 'log';

/** Narrowing guard so an arbitrary `cp-tab-change` id resolves to a known panel. */
const isTabId = (value: string): value is TabId =>
  value === 'schedule' || value === 'subscribers' || value === 'log';

/** Sub-nav segments, in display order (comms, design.md R5). */
const TABS: readonly CpTab[] = [
  { id: 'schedule', label: 'Отправка' },
  { id: 'subscribers', label: 'Подписчики' },
  { id: 'log', label: 'Журнал отправок' },
];

/** Column definitions for the subscribers table. */
const SUBSCRIBER_COLUMNS: readonly CpTableColumn[] = [
  { key: 'email', label: 'Email' },
  { key: 'langs', label: 'Языки' },
  { key: 'status', label: 'Статус' },
  { key: 'since', label: 'Подписан' },
  { key: 'actions', label: '' },
];

/**
 * Maps a subscriber status to a cp-status tone, its label, the wording of
 * the filter that selects it, and what the status actually means —
 * "отскок" and "жалоба" say nothing to an editor who has not run a
 * mailing list before.
 */
const STATUS_META: Readonly<
  Record<
    Subscriber['status'],
    { state: string; label: string; filter: string; meaning: string }
  >
> = {
  active: {
    state: 'success',
    label: 'активен',
    filter: 'Активные',
    meaning: 'получает выпуски',
  },
  unsubscribed: {
    state: 'danger',
    label: 'отписался',
    filter: 'Отписались',
    meaning: 'сам отказался от рассылки — письма ему больше не уходят',
  },
  bounced: {
    state: 'warning',
    label: 'отскок',
    filter: 'Отскок',
    meaning: 'сервер получателя не принял письмо (нет такого ящика, переполнен, домен отверг) — отправка прекращена',
  },
  complained: {
    state: 'warning',
    label: 'жалоба',
    filter: 'Жалобы',
    meaning: 'получатель пометил письмо как спам — отправка прекращена',
  },
};

/** Subscriber statuses in the order the filter offers them. */
const STATUSES: readonly Subscriber['status'][] = [
  'active',
  'unsubscribed',
  'bounced',
  'complained',
];

/** The subscriber filter: one status, or every one of them. */
type StatusFilter = Subscriber['status'] | 'all';

/**
 * Owner-only newsletter console (comms, design.md R5), wired to the REAL
 * comms-worker (`VITE_COMMS_BASE`): it lists the actual subscribers and send log
 * and triggers the actual manual dispatch (`POST /api/dispatch?force=1`). There
 * is deliberately no mock data and no "not connected" claim — the service is
 * deployed and this screen drives it. Loads/failures are surfaced honestly so an
 * empty list never reads as a broken integration.
 */
@customElement('screen-newsletter')
export class ScreenNewsletter extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .head {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-xs);
    }

    h1 {
      font-size: clamp(1.9rem, 7vw, 2.6rem);
      line-height: 1.15;
      font-weight: 700;
      margin: 0;
      background: linear-gradient(135deg, var(--color-accent), var(--color-text-primary));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    h1:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 4px;
    }

    .eyebrow {
      margin: 0 0 var(--spacing-md);
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }

    cp-banner {
      display: block;
      margin-bottom: var(--spacing-lg);
    }

    cp-tabs {
      margin-bottom: var(--spacing-lg);
      max-width: 100%;
      overflow-x: auto;
    }

    .scroll-x {
      max-width: 100%;
      overflow-x: auto;
    }

    section {
      display: grid;
      gap: var(--spacing-md);
    }

    .hint {
      margin: 0;
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      max-width: 60ch;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
      align-items: center;
    }

    .toolbar {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
    }

    .toolbar .meta {
      margin-right: auto;
      font-size: 0.9rem;
      color: var(--color-text-secondary);
    }

    .log {
      display: grid;
      gap: var(--spacing-sm);
    }

    .log-row {
      display: block;
      width: 100%;
      padding: 0;
      border: 0;
      background: none;
      font: inherit;
      color: inherit;
      text-align: inherit;
      cursor: pointer;
      border-radius: var(--radius-md);
    }

    .log-row:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }

    .schedule {
      display: grid;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
    }

    .schedule h2 {
      margin: 0;
      font-size: 1rem;
      font-weight: 600;
    }

    .schedule-grid {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-md);
      align-items: end;
    }

    .field {
      display: grid;
      gap: 0.3rem;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }

    .field select,
    .field input {
      font: inherit;
      font-size: 0.95rem;
      color: var(--color-text-primary);
      padding: 0.4rem 0.6rem;
      border: 1px solid var(--color-border);
      border-radius: var(--radius-sm);
      background: var(--color-background);
      min-width: 11rem;
    }

    .field input[name='cron'] {
      font-family: var(--font-mono, ui-monospace, monospace);
    }

    .add-form {
      display: grid;
      gap: var(--spacing-sm);
      padding: var(--spacing-md);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
      max-width: 32rem;
    }

    .langs {
      border: 0;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 0.4rem;
    }

    .langs legend {
      padding: 0;
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--color-text-secondary);
    }

    .lang-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .status-filter {
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }

    .status-filter .chip {
      font: inherit;
      font-size: 0.8rem;
      color: inherit;
      background: none;
    }

    .status-filter .chip.on {
      background: var(--color-accent);
      color: var(--color-on-accent, var(--color-background));
      border-color: var(--color-accent);
    }

    .status-filter .count {
      font-variant-numeric: tabular-nums;
      opacity: 0.75;
    }

    .legend {
      display: grid;
      grid-template-columns: auto 1fr;
      gap: 0.35rem var(--spacing-sm);
      margin: 0;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      align-items: baseline;
    }

    .legend dt,
    .legend dd {
      margin: 0;
    }

    .chip {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      padding: 0.2rem 0.55rem;
      border: 1px solid var(--color-border);
      border-radius: 999px;
      font-size: 0.8rem;
      cursor: pointer;
      user-select: none;
    }

    .chip.on {
      background: var(--color-accent);
      color: var(--color-on-accent, var(--color-background));
      border-color: var(--color-accent);
    }

    .chip input {
      position: absolute;
      opacity: 0;
      width: 0;
      height: 0;
    }

    .field-error {
      margin: 0;
      font-size: 0.8rem;
      color: var(--color-danger, #c0392b);
    }

    .row-remove {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 0.25rem;
      border: 0;
      background: transparent;
      color: var(--color-text-secondary);
      border-radius: var(--radius-sm);
      cursor: pointer;
    }

    .row-remove:hover:not(:disabled) {
      color: var(--color-danger, #c0392b);
      background: var(--color-danger-bg, rgba(192, 57, 43, 0.1));
    }

    .row-remove:disabled {
      opacity: 0.5;
      cursor: progress;
    }

    .muted {
      color: var(--color-text-secondary);
      font-size: 0.9rem;
      margin: 0;
    }

    .dialog-note {
      margin: 0;
      color: var(--color-text-secondary);
    }

    .btn {
      font: inherit;
      font-weight: 600;
      padding: var(--spacing-xs) var(--spacing-md);
      border-radius: var(--radius-sm);
      border: 1px solid transparent;
      cursor: pointer;
      transition: background var(--transition-fast), border-color var(--transition-fast);
    }

    .btn:disabled {
      opacity: 0.6;
      cursor: progress;
    }

    .btn:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }

    .btn.secondary {
      background: var(--color-surface);
      color: var(--color-text-primary);
      border-color: var(--color-border);
    }

    .btn.danger {
      background: var(--danger, var(--color-danger));
      color: var(--color-background);
      border-color: var(--danger, var(--color-danger));
    }

    .btn.danger:hover:not(:disabled) {
      filter: brightness(1.06);
    }
  `;

  /** Active sub-nav panel. */
  @state() private tab: TabId = 'schedule';

  /** Real subscribers from the comms worker; empty until loaded. */
  @state() private subscribers: readonly Subscriber[] = [];

  /** Past dispatches, one entry per tick (not per recipient). */
  @state() private dispatches: readonly DispatchTick[] = [];

  /** Whether each read has completed, and whether it failed (vs empty). */
  @state() private subsLoaded = false;
  @state() private runsLoaded = false;
  @state() private subsFailed = false;
  @state() private runsFailed = false;

  /**
   * Saved dispatch schedule. The worker has always stored a cron +
   * timezone and exposed GET/PUT /api/schedule — the screen simply had
   * no control for it, which read as "интервал рассылки пропал".
   */
  @state() private schedule?: DispatchSchedule;
  @state() private scheduleLoaded = false;
  @state() private weekday = 6;
  @state() private time = '12:00';
  @state() private timezone = 'Europe/Moscow';
  /** Raw crontab, used when the saved one is richer than a day + time. */
  @state() private cron = '';
  @state() private weeklyForm = true;
  @state() private savingSchedule = false;
  @state() private scheduleError = '';
  @state() private scheduleSaved = false;

  /** Watermark deciding which published material still counts as new. */
  @state() private cutoff?: string;

  /** The dispatch currently opened in the journal, and its recipients. */
  @state() private openTick?: string;
  @state() private recipients: readonly DispatchRecipient[] = [];
  @state() private recipientsLoading = false;
  @state() private recipientsFailed = false;

  /** Confirmation dialog + dispatch state. */
  @state() private confirmOpen = false;
  @state() private sending = false;
  @state() private result?: DispatchResult;

  /** Add-subscriber form state. */
  @state() private addEmail = '';
  @state() private addLangs: ReadonlySet<string> = new Set(['ru']);
  @state() private adding = false;
  @state() private addError = '';

  /** Which lifecycle state the subscriber table is narrowed to. */
  @state() private statusFilter: StatusFilter = 'all';

  /** Id of the subscriber currently being removed (disables its row control). */
  @state() private removingId?: number;

  override connectedCallback(): void {
    super.connectedCallback();
    void this.loadSubscribers();
    void this.loadDispatches();
    void this.loadSchedule();
    void this.loadCutoff();
  }

  private async loadSubscribers(): Promise<void> {
    const read = await listSubscribers();
    this.subsFailed = !read.ok;
    this.subscribers = read.ok ? read.data : [];
    this.subsLoaded = true;
  }

  private async loadDispatches(): Promise<void> {
    const read = await listDispatches();
    this.runsFailed = !read.ok;
    this.dispatches = read.ok ? read.data : [];
    this.runsLoaded = true;
  }

  /** Loads the saved schedule and seeds the form from it. */
  private async loadSchedule(): Promise<void> {
    const read = await readSchedule();
    this.scheduleLoaded = true;
    if (!read.ok) return;
    this.schedule = read.data;
    this.timezone = read.data.timezone;
    this.cron = read.data.cron;
    const weekly = parseWeekly(read.data.cron);
    this.weeklyForm = weekly !== undefined;
    if (weekly !== undefined) {
      this.weekday = weekly.weekday;
      this.time = weekly.time;
    }
  }

  private async loadCutoff(): Promise<void> {
    const read = await readCutoff();
    if (read.ok) this.cutoff = read.data;
  }

  /** Persists the edited schedule, surfacing the worker's refusal verbatim. */
  private readonly submitSchedule = async (): Promise<void> => {
    if (this.savingSchedule) return;
    this.savingSchedule = true;
    this.scheduleError = '';
    this.scheduleSaved = false;
    const cron = this.weeklyForm ? weeklyCron(this.weekday, this.time) : this.cron.trim();
    const result = await saveSchedule({ cron, timezone: this.timezone });
    this.savingSchedule = false;
    if (result.ok) {
      this.schedule = result.schedule;
      this.cron = result.schedule.cron;
      this.scheduleSaved = true;
    } else {
      this.scheduleError = result.error;
    }
  };

  /** Opens one dispatch and reads who it reached. */
  private readonly openDispatch = async (tickAt: string): Promise<void> => {
    this.openTick = tickAt;
    this.recipients = [];
    this.recipientsLoading = true;
    this.recipientsFailed = false;
    const read = await listDispatchRecipients(tickAt);
    this.recipientsLoading = false;
    this.recipientsFailed = !read.ok;
    this.recipients = read.ok ? read.data : [];
  };

  private readonly closeDispatch = (): void => {
    this.openTick = undefined;
    this.recipients = [];
  };

  /**
   * Number of active subscribers a dispatch would reach. Counted over the
   * whole list — the table filter narrows what the editor is looking at,
   * never who the mailing goes to.
   */
  private get activeCount(): number {
    return this.countOf('active');
  }

  /** How many subscribers carry one status. */
  private countOf(status: Subscriber['status']): number {
    return this.subscribers.filter((s) => s.status === status).length;
  }

  /** The subscribers the table shows under the current filter. */
  private get visibleSubscribers(): readonly Subscriber[] {
    return this.statusFilter === 'all'
      ? this.subscribers
      : this.subscribers.filter((s) => s.status === this.statusFilter);
  }

  private readonly onTabChange = (event: Event): void => {
    if (event instanceof CustomEvent) {
      const id: unknown = event.detail?.id;
      typeof id === 'string' && isTabId(id) && (this.tab = id);
    }
  };

  private readonly openConfirm = (): void => {
    this.confirmOpen = true;
  };

  private readonly cancelConfirm = (): void => {
    if (!this.sending) this.confirmOpen = false;
  };

  /** Fires the REAL manual dispatch, then reports the outcome. */
  private readonly confirmSend = async (): Promise<void> => {
    if (this.sending) return;
    this.sending = true;
    this.result = undefined;
    const result = await forceDispatch();
    this.sending = false;
    this.confirmOpen = false;
    this.result = result;
    if (result.ok) void this.loadDispatches();
  };

  private readonly toggleAddLang = (lang: string): void => {
    const next = new Set(this.addLangs);
    next.has(lang) ? next.delete(lang) : next.add(lang);
    this.addLangs = next;
  };

  /** Whether the add form is ready to submit (valid email + at least one lang). */
  private get canAdd(): boolean {
    return !this.adding && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(this.addEmail.trim()) && this.addLangs.size > 0;
  }

  private readonly submitAdd = async (): Promise<void> => {
    if (!this.canAdd) return;
    this.adding = true;
    this.addError = '';
    const result = await addSubscriber(this.addEmail, [...this.addLangs]);
    this.adding = false;
    if (result.ok) {
      this.addEmail = '';
      this.addLangs = new Set(['ru']);
      await this.loadSubscribers();
    } else {
      this.addError =
        result.reason === 'duplicate'
          ? 'Этот адрес уже подписан.'
          : result.reason === 'invalid'
            ? 'Проверьте адрес и языки.'
            : 'Не удалось добавить подписчика.';
    }
  };

  private readonly removeSub = async (id: number): Promise<void> => {
    if (this.removingId !== undefined) return;
    this.removingId = id;
    const ok = await removeSubscriber(id);
    this.removingId = undefined;
    if (ok) await this.loadSubscribers();
  };

  private renderResultBanner(): TemplateResult | typeof nothing {
    if (this.result === undefined) return nothing;
    if (this.result.ok) {
      const sent = this.result.sent ?? 0;
      const failed = this.result.failed ?? 0;
      return html`<cp-banner tone="success" title="Отправка запущена">
        Разослано: ${sent}${failed > 0 ? html` · не доставлено: ${failed}` : nothing}. Подробности — во
        вкладке «Журнал отправок».
      </cp-banner>`;
    }
    return html`<cp-banner tone="danger" title="Не удалось отправить"
      >${this.result.error ?? 'Отправка не выполнена.'}</cp-banner
    >`;
  }

  private renderScheduleFields(): TemplateResult {
    if (!this.weeklyForm) {
      return html`
        <label class="field">
          <span>Расписание (crontab)</span>
          <input
            name="cron"
            type="text"
            .value=${this.cron}
            spellcheck="false"
            @input=${(e: Event) => (this.cron = (e.target as HTMLInputElement).value)}
          />
        </label>
        <p class="hint">
          Сохранённое расписание сложнее, чем «день недели и время», поэтому редактируется как есть.
        </p>
      `;
    }
    return html`
      <label class="field">
        <span>День недели</span>
        <select
          name="weekday"
          .value=${String(this.weekday)}
          @change=${(e: Event) => (this.weekday = Number((e.target as HTMLSelectElement).value))}
        >
          ${WEEKDAYS.map(
            (d) => html`<option value=${String(d.value)} ?selected=${d.value === this.weekday}>
              ${d.label}
            </option>`,
          )}
        </select>
      </label>
      <label class="field">
        <span>Время</span>
        <input
          name="time"
          type="time"
          .value=${this.time}
          @input=${(e: Event) => (this.time = (e.target as HTMLInputElement).value)}
        />
      </label>
    `;
  }

  private renderScheduleForm(): TemplateResult {
    if (!this.scheduleLoaded) return html`<p class="muted">Загружаем расписание…</p>`;
    if (this.schedule === undefined) {
      return html`
        <div class="schedule">
          <p class="muted">Не удалось прочитать расписание из сервиса рассылки.</p>
          <cp-button variant="secondary" @cp-click=${() => void this.loadSchedule()}
            >Повторить</cp-button
          >
        </div>
      `;
    }
    const zones = TIMEZONES.includes(this.timezone) ? TIMEZONES : [...TIMEZONES, this.timezone];
    return html`
      <form
        class="schedule"
        @submit=${(e: Event) => {
          e.preventDefault();
          void this.submitSchedule();
        }}
      >
        <h2>Расписание</h2>
        <div class="schedule-grid">
          ${this.renderScheduleFields()}
          <label class="field">
            <span>Часовой пояс</span>
            <select
              name="timezone"
              .value=${this.timezone}
              @change=${(e: Event) => (this.timezone = (e.target as HTMLSelectElement).value)}
            >
              ${zones.map(
                (z) => html`<option value=${z} ?selected=${z === this.timezone}>${z}</option>`,
              )}
            </select>
          </label>
        </div>
        ${this.schedule.nextRunAt === ''
          ? nothing
          : html`<p class="hint">
              Следующая отправка: ${inZone(this.schedule.nextRunAt, this.timezone)}
            </p>`}
        <p class="hint">
          ${this.cutoff === undefined
            ? 'Водораздел не задан — в первый выпуск попадут все опубликованные материалы.'
            : html`В выпуск попадут материалы, опубликованные после ${this.cutoff.slice(0, 10)}.`}
        </p>
        ${this.scheduleError === ''
          ? nothing
          : html`<p class="field-error" role="alert">${this.scheduleError}</p>`}
        ${this.scheduleSaved ? html`<p class="hint" role="status">Расписание сохранено.</p>` : nothing}
        <div class="actions">
          <cp-button ?disabled=${this.savingSchedule} @cp-click=${() => void this.submitSchedule()}>
            ${this.savingSchedule ? 'Сохраняем…' : 'Сохранить расписание'}
          </cp-button>
        </div>
      </form>
    `;
  }

  private renderSchedule(): TemplateResult {
    return html`
      <section aria-label="Отправка выпуска">
        ${this.renderScheduleForm()}
        <p class="hint">
          Выпуск собирается автоматически и уходит подписчикам по расписанию выше. В письмо попадают
          материалы, опубликованные после водораздела. Кнопка ниже запускает отправку немедленно —
          всем ${this.activeCount} активным подписчикам.
        </p>
        <div class="actions">
          <cp-button @cp-click=${this.openConfirm} ?disabled=${this.activeCount === 0}
            >Отправить сейчас</cp-button
          >
        </div>
        ${this.activeCount === 0
          ? html`<p class="muted">Нет активных подписчиков — отправлять некому.</p>`
          : nothing}
      </section>
    `;
  }

  /** Filter chips: every status plus "all", each carrying its own count. */
  private renderStatusFilter(): TemplateResult {
    const chip = (value: StatusFilter, label: string, count: number): TemplateResult => html`
      <button
        type="button"
        class="chip ${this.statusFilter === value ? 'on' : ''}"
        aria-pressed=${this.statusFilter === value ? 'true' : 'false'}
        @click=${() => (this.statusFilter = value)}
      >
        ${label} <span class="count">${count}</span>
      </button>
    `;
    return html`
      <div class="status-filter" role="group" aria-label="Фильтр по статусу подписчика">
        ${chip('all', 'Все', this.subscribers.length)}
        ${STATUSES.map((status) =>
          chip(status, STATUS_META[status].filter, this.countOf(status)),
        )}
      </div>
    `;
  }

  /** What each lifecycle state actually means, in the editor's words. */
  private renderStatusLegend(): TemplateResult {
    return html`
      <dl class="legend">
        ${STATUSES.map(
          (status) => html`
            <dt><cp-status state=${STATUS_META[status].state} label=${STATUS_META[status].label}></cp-status></dt>
            <dd>${STATUS_META[status].meaning}</dd>
          `,
        )}
      </dl>
    `;
  }

  private renderSubscribers(): TemplateResult {
    if (!this.subsLoaded) return html`<p class="muted">Загружаем подписчиков…</p>`;
    if (this.subsFailed) {
      return html`
        <section aria-label="Подписчики">
          <p class="muted">Не удалось загрузить подписчиков из сервиса рассылки.</p>
          <cp-button variant="secondary" @cp-click=${() => void this.loadSubscribers()}
            >Повторить</cp-button
          >
        </section>
      `;
    }
    const visible = this.visibleSubscribers;
    const rows: CpTableRow[] = visible.map((sub) => {
      const meta = STATUS_META[sub.status];
      return {
        id: String(sub.id),
        email: sub.email,
        langs: sub.langs.join(', ').toUpperCase(),
        status: html`<cp-status state=${meta.state} label=${meta.label}></cp-status>`,
        since: sub.createdAt.slice(0, 10),
        actions: html`<button
          class="row-remove"
          type="button"
          ?disabled=${this.removingId === sub.id}
          aria-label="Удалить ${sub.email}"
          title="Удалить подписчика"
          @click=${() => void this.removeSub(sub.id)}
        >
          <cp-icon name="trash" size="16"></cp-icon>
        </button>`,
      };
    });
    const unsub = this.subscribers.length - this.activeCount;
    return html`
      <section aria-label="Подписчики">
        <div class="toolbar">
          <span class="meta"
            >${this.activeCount} активных${unsub > 0 ? html` · ${unsub} неактивных` : nothing}</span
          >
        </div>
        ${this.renderStatusFilter()} ${this.renderStatusLegend()} ${this.renderAddForm()}
        ${this.subscribers.length === 0
          ? html`<p class="muted">Пока нет ни одного подписчика.</p>`
          : visible.length === 0
            ? html`<p class="muted">С этим статусом подписчиков нет.</p>`
            : html`<div class="scroll-x">
                <cp-table caption="Список рассылки" .columns=${SUBSCRIBER_COLUMNS} .rows=${rows}></cp-table>
              </div>`}
      </section>
    `;
  }

  private renderAddForm(): TemplateResult {
    return html`
      <form
        class="add-form"
        @submit=${(e: Event) => {
          e.preventDefault();
          void this.submitAdd();
        }}
      >
        <cp-input
          label="Email нового подписчика"
          type="email"
          .value=${this.addEmail}
          ?invalid=${this.addError !== ''}
          @cp-input=${(e: CustomEvent<{ value: string }>) => {
            this.addEmail = e.detail.value;
            this.addError = '';
          }}
          @cp-change=${(e: CustomEvent<{ value: string }>) => (this.addEmail = e.detail.value)}
        ></cp-input>
        <fieldset class="langs">
          <legend>Языки дайджеста</legend>
          <div class="lang-chips">
            ${LANGS.map(
              (lang) => html`<label class="chip ${this.addLangs.has(lang) ? 'on' : ''}">
                <input
                  type="checkbox"
                  .checked=${this.addLangs.has(lang)}
                  @change=${() => this.toggleAddLang(lang)}
                />
                ${lang.toUpperCase()}
              </label>`,
            )}
          </div>
        </fieldset>
        ${this.addError !== '' ? html`<p class="field-error" role="alert">${this.addError}</p>` : nothing}
        <cp-button ?disabled=${!this.canAdd} @cp-click=${() => void this.submitAdd()}>
          ${this.adding ? 'Добавляем…' : 'Добавить подписчика'}
        </cp-button>
      </form>
    `;
  }

  private renderRecipients(): TemplateResult {
    const tick = this.openTick ?? '';
    const rows: CpTableRow[] = this.recipients.map((r) => {
      const meta = sendStatusOf(r.status);
      return {
        id: String(r.id),
        email: r.email ?? '— адрес удалён —',
        articles: String(r.articleCount),
        status: html`<cp-status state=${meta.state} label=${meta.label}></cp-status>`,
        error: r.error ?? '',
      };
    });
    return html`
      <section aria-label="Получатели отправки">
        <div class="toolbar">
          <span class="meta">Отправка от ${inZone(tick, this.timezone)}</span>
          <cp-button variant="secondary" @cp-click=${this.closeDispatch}>Ко всем отправкам</cp-button>
        </div>
        ${this.recipientsLoading
          ? html`<p class="muted">Загружаем получателей…</p>`
          : this.recipientsFailed
            ? html`<p class="muted">Не удалось загрузить получателей этой отправки.</p>`
            : this.recipients.length === 0
              ? html`<p class="muted">Эта отправка не записала ни одного получателя.</p>`
              : html`<div class="scroll-x">
                  <cp-table
                    caption="Получатели отправки"
                    .columns=${RECIPIENT_COLUMNS}
                    .rows=${rows}
                  ></cp-table>
                </div>`}
      </section>
    `;
  }

  /** One journal entry. An idle tick has no recipients, so it does not open. */
  private renderTickRow(tick: DispatchTick): TemplateResult {
    const tone = tickTone(tick);
    const when = inZone(tick.tickAt, this.timezone);
    const row = html`
      <cp-list-row title="Отправка от ${when}" meta=${tickMeta(tick)}>
        <cp-status slot="actions" state=${tone.state} label=${tone.label}></cp-status>
      </cp-list-row>
    `;
    if (isIdle(tick)) return row;
    return html`
      <button
        class="log-row"
        type="button"
        @click=${() => void this.openDispatch(tick.tickAt)}
        aria-label="Открыть отправку от ${when}"
      >
        ${row}
      </button>
    `;
  }

  private renderLog(): TemplateResult {
    if (!this.runsLoaded) return html`<p class="muted">Загружаем журнал…</p>`;
    if (this.runsFailed) {
      return html`
        <section aria-label="Журнал отправок">
          <p class="muted">Не удалось загрузить журнал отправок.</p>
          <cp-button variant="secondary" @cp-click=${() => void this.loadDispatches()}
            >Повторить</cp-button
          >
        </section>
      `;
    }
    if (this.openTick !== undefined) return this.renderRecipients();
    if (this.dispatches.length === 0) {
      return html`<section aria-label="Журнал отправок">
        <p class="muted">Отправок ещё не было.</p>
      </section>`;
    }
    return html`
      <section aria-label="Журнал отправок">
        <p class="hint">
          Одна строка — одна отправка. Откройте её, чтобы увидеть, кому и с каким результатом ушло
          письмо.
        </p>
        <div class="log">
          ${this.dispatches.map((tick) => this.renderTickRow(tick))}
        </div>
      </section>
    `;
  }

  private renderPanel(): TemplateResult {
    if (this.tab === 'subscribers') return this.renderSubscribers();
    if (this.tab === 'log') return this.renderLog();
    return this.renderSchedule();
  }

  private renderConfirmDialog(): TemplateResult | typeof nothing {
    if (!this.confirmOpen) return nothing;
    return html`
      <cp-dialog
        open
        tone="danger"
        heading="Отправить выпуск ${this.activeCount} подписчикам?"
        ?busy=${this.sending}
        @cp-cancel=${this.cancelConfirm}
      >
        <p class="dialog-note">
          Письмо уйдёт всем активным подписчикам немедленно и необратимо через сервис рассылки.
        </p>
        <button
          slot="footer"
          class="btn secondary"
          type="button"
          ?disabled=${this.sending}
          @click=${this.cancelConfirm}
        >
          Отмена
        </button>
        <button
          slot="footer"
          class="btn danger"
          type="button"
          ?disabled=${this.sending}
          @click=${this.confirmSend}
        >
          ${this.sending ? 'Отправляется…' : 'Отправить всем'}
        </button>
      </cp-dialog>
    `;
  }

  override render(): TemplateResult {
    return html`
      <header class="head">
        <h1 tabindex="-1">Рассылка</h1>
        <cp-tag tone="warning">только владелец</cp-tag>
      </header>
      <p class="eyebrow">Коммуникации · еженедельный дайджест для читателей</p>
      ${this.renderResultBanner()}
      <cp-tabs .tabs=${TABS} active=${this.tab} @cp-tab-change=${this.onTabChange}></cp-tabs>
      ${this.renderPanel()} ${this.renderConfirmDialog()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'screen-newsletter': ScreenNewsletter;
  }
}
