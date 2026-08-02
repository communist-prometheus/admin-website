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

/** Representative backlog for the local shell preview (no live issues). */
const SAMPLE: readonly Ticket[] = [
  {
    number: 341,
    title: 'Битые ссылки в архиве журнала за 2024 год',
    state: 'open',
    author: 'andswew',
    date: '2026-07-29',
    kind: 'bug',
  },
  {
    number: 338,
    title: 'Ошибка 500 при загрузке FB2 больше 10 МБ',
    state: 'open',
    author: 'undeadliner',
    date: '2026-07-27',
    kind: 'bug',
  },
  {
    number: 335,
    title: 'Планировщик отложенной публикации рассылки',
    state: 'open',
    author: 'undeadliner',
    date: '2026-07-25',
    kind: 'story',
  },
  {
    number: 330,
    title: 'Автосохранение черновиков каждые 30 секунд',
    state: 'open',
    author: 'newcomer',
    date: '2026-07-18',
    kind: 'story',
  },
  {
    number: 322,
    title: 'Тёмная тема: контраст плашек тем ниже AAA',
    state: 'closed',
    author: 'andswew',
    date: '2026-07-21',
    kind: 'bug',
  },
  {
    number: 318,
    title: 'Экспорт статьи в PDF для печати',
    state: 'closed',
    author: 'andswew',
    date: '2026-07-10',
    kind: 'other',
  },
];

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
    const source = live ? this.tickets : SAMPLE;
    const visible = this.visible(source);
    const rows = visible.map(toRow);
    return html`
      <header class="head">
        <p class="eyebrow">Задачи · ${visible.length} на экране</p>
        <h1 tabindex="-1">Тикеты</h1>
        <cp-button>
          <cp-icon name="plus" size="18"></cp-icon>
          Новый тикет
        </cp-button>
        ${live
          ? html`<cp-tag tone="success">данные из репозитория</cp-tag>`
          : this.loaded
            ? html`<cp-tag tone="neutral">демо-данные</cp-tag>`
            : nothing}
      </header>

      <div class="toolbar">
        <div class="tabs-scroll">
          <cp-tabs
            .tabs=${FILTERS}
            active=${this.filter}
            @cp-tab-change=${this.onFilterChange}
          ></cp-tabs>
        </div>
      </div>

      <cp-table
        caption="Тикеты и баг-репорты"
        .columns=${COLUMNS}
        .rows=${rows}
      ></cp-table>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'screen-tickets': ScreenTickets;
  }
}
