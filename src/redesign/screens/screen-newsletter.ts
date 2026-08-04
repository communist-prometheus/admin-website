import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@communist-prometheus/cp-components';
import type { CpTab, CpTableColumn, CpTableRow, CpSelectOption } from '@communist-prometheus/cp-components';

/** The three sub-nav panels of the newsletter screen. */
type TabId = 'schedule' | 'subscribers' | 'log';

/** Narrowing guard so an arbitrary `cp-tab-change` id resolves to a known panel. */
const isTabId = (value: string): value is TabId =>
  value === 'schedule' || value === 'subscribers' || value === 'log';

/** Sub-nav segments, in display order (comms, design.md R5). */
const TABS: readonly CpTab[] = [
  { id: 'schedule', label: 'Расписание' },
  { id: 'subscribers', label: 'Подписчики' },
  { id: 'log', label: 'Журнал отправок' },
];

/** Number of active subscribers the "send now" confirmation warns about. */
const ACTIVE_SUBSCRIBERS = 312;

/** Timezone choices for the schedule panel's `cp-select`. */
const TIMEZONES: readonly CpSelectOption[] = [
  { value: 'Europe/Moscow', label: 'Europe/Moscow · МСК (UTC+3)' },
  { value: 'UTC', label: 'UTC · Всемирное время' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin · ЦЕВ (UTC+1)' },
  { value: 'Europe/Kyiv', label: 'Europe/Kyiv · (UTC+2)' },
];

/** Weekday choices for the send schedule. */
const WEEKDAYS: readonly CpSelectOption[] = [
  { value: 'sat', label: 'Каждую субботу' },
  { value: 'sun', label: 'Каждое воскресенье' },
  { value: 'mon', label: 'Каждый понедельник' },
];

/** What material is collected into an issue. */
const CONTENTS: readonly CpSelectOption[] = [
  { value: 'week', label: 'Материалы за 7 дней до отправки' },
  { value: 'since', label: 'Всё, вышедшее после прошлого выпуска' },
  { value: 'manual', label: 'Вручную отобранные материалы' },
];

/** One mailing-list subscriber (representative preview data). */
interface Subscriber {
  readonly email: string;
  readonly state: 'success' | 'danger';
  readonly label: string;
  readonly since: string;
}

const SUBSCRIBERS: readonly Subscriber[] = [
  { email: 'a.rosa@example.org', state: 'success', label: 'активен', since: 'ноя 2025' },
  { email: 'k.zetkin@example.org', state: 'success', label: 'активен', since: 'янв 2026' },
  { email: 'e.thalmann@example.org', state: 'danger', label: 'отписался', since: 'сен 2025' },
  { email: 'a.bordiga@example.org', state: 'success', label: 'активен', since: 'мар 2026' },
  { email: 'r.luxemburg@example.org', state: 'success', label: 'активен', since: 'апр 2026' },
];

/** Column definitions for the subscribers table. */
const SUBSCRIBER_COLUMNS: readonly CpTableColumn[] = [
  { key: 'email', label: 'Email' },
  { key: 'status', label: 'Статус' },
  { key: 'since', label: 'Дата подписки' },
];

/** One past send in the delivery log. */
interface Send {
  readonly issue: string;
  readonly sentAt: string;
  readonly recipients: number;
  readonly outcome: 'success' | 'danger';
  readonly outcomeLabel: string;
}

const SENDS: readonly Send[] = [
  { issue: 'Выпуск №17', sentAt: '14 июня 2026, 10:00', recipients: 308, outcome: 'success', outcomeLabel: 'доставлено' },
  { issue: 'Выпуск №16', sentAt: '7 июня 2026, 10:00', recipients: 305, outcome: 'danger', outcomeLabel: '4 адреса не приняли' },
  { issue: 'Выпуск №15', sentAt: '31 мая 2026, 10:00', recipients: 301, outcome: 'success', outcomeLabel: 'доставлено' },
  { issue: 'Выпуск №14', sentAt: '24 мая 2026, 10:00', recipients: 297, outcome: 'success', outcomeLabel: 'доставлено' },
];

/**
 * Owner-only newsletter console (comms, design.md R5). A self-contained screen
 * element for the admin redesign: a gradient section heading with an owner-scope
 * `cp-tag`, a `cp-tabs` sub-nav that swaps three panels through local `@state`
 * (schedule / subscribers / delivery log), and a danger-tone `cp-dialog` guarding
 * the irreversible "send to every active subscriber" action. Composes design-system
 * primitives only; theme tokens inherit into this shadow root from `:root`.
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

    /* Wide tables scroll inside their own gutter instead of pushing the whole
       screen past the viewport (the horizontal-overflow "вёрстка" bug). */
    .scroll-x {
      max-width: 100%;
      overflow-x: auto;
    }

    section {
      display: grid;
      gap: var(--spacing-md);
    }

    .field-grid {
      display: grid;
      gap: var(--spacing-md);
      grid-template-columns: 1fr;
      max-width: 34rem;
    }

    @media (min-width: 640px) {
      .field-grid {
        grid-template-columns: 1fr 1fr;
      }
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

    .dialog-note {
      margin: 0;
      color: var(--color-text-secondary);
    }

    /* Token-driven footer buttons for the confirm dialog. The danger action
       resolves entirely through semantic tokens so it flips with the theme. */
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
      background: var(--danger);
      color: var(--color-background);
      border-color: var(--danger);
    }

    .btn.danger:hover:not(:disabled) {
      filter: brightness(1.06);
    }
  `;

  /** Active sub-nav panel. */
  @state() private tab: TabId = 'schedule';

  /** Whether the "send now" confirmation dialog is open. */
  @state() private confirmOpen = false;

  /**
   * Whether a send was attempted. There is no mail transport wired to this
   * console yet, so a confirmed "send" does NOT dispatch anything — it flips
   * this flag to surface an honest "not delivered" notice instead of faking a
   * successful delivery (QA #9: the previous mock pretended to send).
   */
  @state() private sendAttempted = false;

  /** Adopts the chosen tab from the `cp-tabs` change event. */
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
    this.confirmOpen = false;
  };

  /**
   * Confirms the "send" action. No email transport is connected, so this never
   * dispatches a message: it records the attempt (surfacing a "not delivered"
   * banner) and closes the dialog. It must not report success.
   */
  private readonly confirmSend = (): void => {
    this.sendAttempted = true;
    this.confirmOpen = false;
  };

  private readonly renderSchedule = (): TemplateResult => html`
    <section aria-label="Расписание рассылки">
      <p class="hint">
        Выпуск собирается автоматически и уходит по расписанию. В письмо попадают материалы,
        опубликованные до момента отправки.
      </p>
      <div class="field-grid">
        <cp-select label="День недели" value="sat" .options=${WEEKDAYS}></cp-select>
        <cp-input label="Время отправки" type="time" value="10:00"></cp-input>
        <cp-select label="Часовой пояс" value="Europe/Moscow" .options=${TIMEZONES}></cp-select>
        <cp-select label="Что попадает в выпуск" value="week" .options=${CONTENTS}></cp-select>
      </div>
      <div class="actions">
        <cp-button @cp-click=${this.openConfirm}>Отправить сейчас</cp-button>
        <cp-button variant="secondary" disabled title="Появится после подключения почтового сервиса">
          Тест на свою почту
        </cp-button>
      </div>
    </section>
  `;

  private readonly renderSubscribers = (): TemplateResult => {
    const rows: CpTableRow[] = SUBSCRIBERS.map((sub) => ({
      id: sub.email,
      email: sub.email,
      status: html`<cp-status state=${sub.state} label=${sub.label}></cp-status>`,
      since: sub.since,
    }));
    return html`
      <section aria-label="Подписчики">
        <div class="toolbar">
          <span class="meta">${ACTIVE_SUBSCRIBERS} активных · 4 отписались за неделю</span>
          <cp-button variant="ghost" size="sm" disabled title="Появится после подключения почтового сервиса">
            <cp-icon name="plus" size="16"></cp-icon>
            Добавить
          </cp-button>
        </div>
        <div class="scroll-x">
          <cp-table
            caption="Список рассылки"
            .columns=${SUBSCRIBER_COLUMNS}
            .rows=${rows}
          ></cp-table>
        </div>
      </section>
    `;
  };

  private readonly renderLog = (): TemplateResult => html`
    <section aria-label="Журнал отправок">
      <div class="log">
        ${SENDS.map(
          (send) => html`
            <cp-list-row
              title=${send.issue}
              meta="${send.sentAt} · ${send.recipients} получателей"
            >
              <cp-status
                slot="actions"
                state=${send.outcome}
                label=${send.outcomeLabel}
              ></cp-status>
              <cp-button slot="actions" variant="ghost" size="sm" disabled
                >Подробно</cp-button
              >
            </cp-list-row>
          `,
        )}
      </div>
    </section>
  `;

  private renderPanel(): TemplateResult {
    const panels: Readonly<Record<TabId, () => TemplateResult>> = {
      schedule: this.renderSchedule,
      subscribers: this.renderSubscribers,
      log: this.renderLog,
    };
    return panels[this.tab]();
  }

  private renderConfirmDialog(): TemplateResult | typeof nothing {
    if (!this.confirmOpen) {
      return nothing;
    }
    return html`
      <cp-dialog
        open
        tone="warning"
        heading="Отправить выпуск ${ACTIVE_SUBSCRIBERS} подписчикам?"
        @cp-cancel=${this.cancelConfirm}
      >
        <p class="dialog-note">
          Почтовый сервис ещё не подключён, поэтому письмо не будет отправлено —
          рассылка появится в интерфейсе после интеграции доставки.
        </p>
        <button
          slot="footer"
          class="btn secondary"
          type="button"
          @click=${this.cancelConfirm}
        >
          Отмена
        </button>
        <button
          slot="footer"
          class="btn danger"
          type="button"
          @click=${this.confirmSend}
        >
          Понятно
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
      <cp-banner
        tone=${this.sendAttempted ? 'danger' : 'info'}
        title=${this.sendAttempted
          ? 'Письмо не отправлено'
          : 'Рассылка ещё не подключена'}
      >
        ${this.sendAttempted
          ? 'Почтовый сервис пока не интегрирован — ни одно письмо не ушло. Ниже демонстрационные данные.'
          : 'Почтовый сервис ещё не интегрирован: расписание, список подписчиков и журнал ниже — демонстрационные, реальная отправка не выполняется.'}
      </cp-banner>
      <cp-tabs
        .tabs=${TABS}
        active=${this.tab}
        @cp-tab-change=${this.onTabChange}
      ></cp-tabs>
      ${this.renderPanel()}
      ${this.renderConfirmDialog()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'screen-newsletter': ScreenNewsletter;
  }
}
