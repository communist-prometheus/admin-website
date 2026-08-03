import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { CpTab, CpTableColumn, CpTableRow } from '@communist-prometheus/cp-components';
import '@communist-prometheus/cp-components';
import { listTickets, type Ticket } from '../engine/github-api.js';

/** The active list filter (`all` shows every ticket). */
type TicketFilter = 'all' | 'bug' | 'story';

/** Filter segments for the `cp-tabs` strip above the table. */
const FILTERS: readonly CpTab[] = [
  { id: 'all', label: 'Все' },
  { id: 'bug', label: 'Баги' },
  { id: 'story', label: 'Истории' },
];

/** Table column definitions in display order. */
const COLUMNS: readonly CpTableColumn[] = [
  { key: 'number', label: '№' },
  { key: 'title', label: 'Заголовок' },
  { key: 'kind', label: 'Тип' },
  { key: 'status', label: 'Статус' },
  { key: 'author', label: 'Автор' },
  { key: 'date', label: 'Дата' },
];

/** Narrows a tab id to a known {@link TicketFilter}. */
const isFilter = (value: string): value is TicketFilter =>
  value === 'all' || value === 'bug' || value === 'story';

/** Tinted `cp-tag` cell for a ticket's kind (bug / story / other). */
const kindCell: Readonly<Record<Ticket['kind'], TemplateResult>> = {
  bug: html`<cp-tag tone="danger">Баг</cp-tag>`,
  story: html`<cp-tag tone="info">История</cp-tag>`,
  other: html`<cp-tag tone="neutral">Задача</cp-tag>`,
};

/** Redundant-cue `cp-status` cell for a ticket's lifecycle state. */
const statusCell: Readonly<Record<Ticket['state'], TemplateResult>> = {
  open: html`<cp-status state="warning" label="открыт"></cp-status>`,
  closed: html`<cp-status state="success" label="закрыт"></cp-status>`,
};

/** Projects a ticket into a `cp-table` row, rendering tag/status cells inline. */
const toRow = (ticket: Ticket): CpTableRow => ({
  id: `t-${ticket.number}`,
  number: `#${ticket.number}`,
  title: ticket.title,
  kind: kindCell[ticket.kind],
  status: statusCell[ticket.state],
  author: ticket.author,
  date: ticket.date,
});

/**
 * Ticket tracker screen (tickets spec: tasks and bug-reports). When the dev
 * token is present (local dev:token), it reads the repo's real GitHub issues
 * through {@link listTickets} and lists them in a semantic `cp-table` — number,
 * title, kind (`cp-tag`), lifecycle state (`cp-status`), author and date — above
 * a "Новый тикет" primary action, proving live data end-to-end. Without a token
 * (or when the token lacks issues scope / the repo has no issues) it falls back
 * to a representative sample carrying an honest demo badge. A `cp-tabs` filter
 * strip (Все / Баги / Истории) tracked in local `@state` narrows the rows by
 * `kind` without touching the source data. Theme tokens inherit from `:root`
 * through the shadow boundary; no ad-hoc chrome.
 */
@customElement('screen-tickets')
export class ScreenTickets extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--font-sans);
      color: var(--color-text-primary);
      line-height: 1.6;
    }

    .head {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-lg);
    }

    h1 {
      font-size: clamp(1.9rem, 7vw, 2.6rem);
      line-height: 1.15;
      font-weight: 700;
      margin: 0;
      margin-right: auto;
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
      flex-basis: 100%;
      margin: 0;
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }

    .toolbar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
    }

    .tabs-scroll {
      overflow-x: auto;
      max-width: 100%;
    }

    cp-table {
      border: 1px solid var(--color-hairline);
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--color-surface);
    }
  `;

  /** Tickets read from GitHub; empty until loaded (or if the token is absent). */
  @state() private tickets: readonly Ticket[] = [];

  /** Whether the real read has completed. */
  @state() private loaded = false;

  /** Active ticket-kind filter; `all` shows every ticket. */
  @state() private filter: TicketFilter = 'all';

  override connectedCallback(): void {
    super.connectedCallback();
    void this.load();
  }

  private async load(): Promise<void> {
    const tickets = await listTickets();
    this.tickets = tickets;
    this.loaded = true;
  }

  private readonly onFilterChange = (event: CustomEvent<{ readonly id: string }>): void => {
    if (isFilter(event.detail.id)) {
      this.filter = event.detail.id;
    }
  };

  private visible(source: readonly Ticket[]): readonly Ticket[] {
    return this.filter === 'all'
      ? source
      : source.filter((ticket) => ticket.kind === this.filter);
  }

  override render() {
    const live = this.tickets.length > 0;
    const visible = this.visible(this.tickets);
    const rows = visible.map(toRow);
    return html`
      <header class="head">
        <p class="eyebrow">Задачи${live ? html` · ${visible.length} на экране` : nothing}</p>
        <h1 tabindex="-1">Тикеты</h1>
        <cp-button>
          <cp-icon name="plus" size="18"></cp-icon>
          Новый тикет
        </cp-button>
      </header>

      ${live
        ? html`
            <div class="toolbar">
              <div class="tabs-scroll">
                <cp-tabs
                  .tabs=${FILTERS}
                  active=${this.filter}
                  @cp-tab-change=${this.onFilterChange}
                ></cp-tabs>
              </div>
            </div>

            <cp-table caption="Тикеты и баг-репорты" .columns=${COLUMNS} .rows=${rows}></cp-table>
          `
        : html`<p class="eyebrow">
            ${this.loaded
              ? 'Войдите через GitHub, чтобы увидеть тикеты и баг-репорты репозитория.'
              : 'Загружаем тикеты…'}
          </p>`}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'screen-tickets': ScreenTickets;
  }
}
