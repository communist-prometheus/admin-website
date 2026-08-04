import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@communist-prometheus/cp-components';
import type { CpTab, CpTableColumn, CpTableRow } from '@communist-prometheus/cp-components';
import {
  listSubscribers,
  listRuns,
  forceDispatch,
  type Subscriber,
  type SendRun,
  type DispatchResult,
} from '../engine/comms.js';

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
];

/** Maps a subscriber status to a cp-status tone + label. */
const STATUS_META: Readonly<Record<Subscriber['status'], { state: string; label: string }>> = {
  active: { state: 'success', label: 'активен' },
  unsubscribed: { state: 'danger', label: 'отписался' },
  bounced: { state: 'warning', label: 'отскок' },
  complained: { state: 'warning', label: 'жалоба' },
};

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

  /** Real send-log rows from the comms worker; empty until loaded. */
  @state() private runs: readonly SendRun[] = [];

  /** Whether each read has completed, and whether it failed (vs empty). */
  @state() private subsLoaded = false;
  @state() private runsLoaded = false;
  @state() private subsFailed = false;
  @state() private runsFailed = false;

  /** Confirmation dialog + dispatch state. */
  @state() private confirmOpen = false;
  @state() private sending = false;
  @state() private result?: DispatchResult;

  override connectedCallback(): void {
    super.connectedCallback();
    void this.loadSubscribers();
    void this.loadRuns();
  }

  private async loadSubscribers(): Promise<void> {
    const read = await listSubscribers();
    this.subsFailed = !read.ok;
    this.subscribers = read.ok ? read.data : [];
    this.subsLoaded = true;
  }

  private async loadRuns(): Promise<void> {
    const read = await listRuns();
    this.runsFailed = !read.ok;
    this.runs = read.ok ? read.data : [];
    this.runsLoaded = true;
  }

  /** Number of active subscribers a dispatch would reach. */
  private get activeCount(): number {
    return this.subscribers.filter((s) => s.status === 'active').length;
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
    if (result.ok) void this.loadRuns();
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

  private renderSchedule(): TemplateResult {
    return html`
      <section aria-label="Отправка выпуска">
        <p class="hint">
          Выпуск собирается автоматически и уходит подписчикам по расписанию воркера-рассыльщика. В
          письмо попадают материалы, опубликованные с прошлой отправки. Кнопка ниже запускает
          отправку немедленно — всем ${this.activeCount} активным подписчикам.
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
    const rows: CpTableRow[] = this.subscribers.map((sub) => {
      const meta = STATUS_META[sub.status];
      return {
        id: String(sub.id),
        email: sub.email,
        langs: sub.langs.join(', ').toUpperCase(),
        status: html`<cp-status state=${meta.state} label=${meta.label}></cp-status>`,
        since: sub.createdAt.slice(0, 10),
      };
    });
    const unsub = this.subscribers.filter((s) => s.status !== 'active').length;
    return html`
      <section aria-label="Подписчики">
        <div class="toolbar">
          <span class="meta"
            >${this.activeCount} активных${unsub > 0 ? html` · ${unsub} неактивных` : nothing}</span
          >
        </div>
        ${this.subscribers.length === 0
          ? html`<p class="muted">Пока нет ни одного подписчика.</p>`
          : html`<div class="scroll-x">
              <cp-table caption="Список рассылки" .columns=${SUBSCRIBER_COLUMNS} .rows=${rows}></cp-table>
            </div>`}
      </section>
    `;
  }

  private renderLog(): TemplateResult {
    if (!this.runsLoaded) return html`<p class="muted">Загружаем журнал…</p>`;
    if (this.runsFailed) {
      return html`
        <section aria-label="Журнал отправок">
          <p class="muted">Не удалось загрузить журнал отправок.</p>
          <cp-button variant="secondary" @cp-click=${() => void this.loadRuns()}>Повторить</cp-button>
        </section>
      `;
    }
    if (this.runs.length === 0) {
      return html`<section aria-label="Журнал отправок">
        <p class="muted">Отправок ещё не было.</p>
      </section>`;
    }
    return html`
      <section aria-label="Журнал отправок">
        <div class="log">
          ${this.runs.map(
            (run) => html`
              <cp-list-row
                title="Отправка от ${run.tickAt.slice(0, 16).replace('T', ' ')}"
                meta="${run.articleCount} материалов"
              >
                <cp-status
                  slot="actions"
                  state=${run.status === 'sent' ? 'success' : run.status === 'failed' ? 'danger' : 'warning'}
                  label=${run.error ?? run.status}
                ></cp-status>
              </cp-list-row>
            `,
          )}
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
