import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type {
  CpTab,
  CpTableColumn,
  CpTableRow,
  CpSelectOption,
} from '@communist-prometheus/cp-components';
import '@communist-prometheus/cp-components';
import { listTickets, createTicket, type Ticket } from '../engine/github-api.js';
import { onEngineReady } from '../engine/engine-ready.js';
import { classifyEmpty } from '../engine/load-state.js';

/** Lifecycle of the create-ticket form. */
type CreatePhase = 'idle' | 'running' | 'done' | 'failed';

/** Kind options for the create form; values match the labels {@link kindOf} reads. */
const KIND_OPTIONS: readonly CpSelectOption[] = [
  { value: 'bug', label: 'Баг' },
  { value: 'story', label: 'История' },
  { value: 'other', label: 'Задача' },
];

/** Reads `event.detail.value` off a `cp-*` change event without a cast. */
const detailValue = (event: Event): unknown => {
  const detail = 'detail' in event ? Reflect.get(event, 'detail') : undefined;
  return typeof detail === 'object' && detail && 'value' in detail
    ? Reflect.get(detail, 'value')
    : undefined;
};

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

    .form {
      display: grid;
      gap: var(--spacing-md);
    }

    .foot {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-sm);
    }

    a.gh {
      color: var(--color-accent);
    }
  `;

  /** Tickets read from GitHub; empty until loaded (or if the token is absent). */
  @state() private tickets: readonly Ticket[] = [];

  /** Whether the real read has completed. */
  @state() private loaded = false;

  /** Active ticket-kind filter; `all` shows every ticket. */
  @state() private filter: TicketFilter = 'all';

  /** Whether the create-ticket sheet is open. */
  @state() private formOpen = false;

  /** Create-form fields. */
  @state() private fTitle = '';
  @state() private fKind: Ticket['kind'] = 'bug';
  @state() private fBody = '';

  /** Create-form lifecycle + result. */
  @state() private phase: CreatePhase = 'idle';
  @state() private createdNumber?: number;
  @state() private createdUrl?: string;

  /** Unsubscribes the engine-ready listener on disconnect. */
  private disposeReady: () => void = () => {};

  override connectedCallback(): void {
    super.connectedCallback();
    void this.load();
    // Re-read once the engine finishes booting (first-load race, QA #12).
    this.disposeReady = onEngineReady(() => void this.load());
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.disposeReady();
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

  private readonly openForm = (): void => {
    this.formOpen = true;
    this.phase = 'idle';
    this.fTitle = '';
    this.fKind = 'bug';
    this.fBody = '';
    this.createdNumber = undefined;
    this.createdUrl = undefined;
  };

  private readonly closeForm = (): void => {
    this.formOpen = false;
  };

  /** Reads a `cp-input`/`cp-select`/`cp-textarea` value into a string field. */
  private readonly bindText =
    (field: 'fTitle' | 'fBody') =>
    (event: Event): void => {
      const value = detailValue(event);
      if (typeof value === 'string') this[field] = value;
    };

  private readonly onKindChange = (event: Event): void => {
    const value = detailValue(event);
    if (value === 'bug' || value === 'story' || value === 'other') this.fKind = value;
  };

  /** True once the title carries content — the only required field. */
  private get canSubmit(): boolean {
    return this.fTitle.trim() !== '' && this.phase !== 'running';
  }

  private readonly submit = async (): Promise<void> => {
    if (!this.canSubmit) return;
    this.phase = 'running';
    const result = await createTicket({
      title: this.fTitle.trim(),
      body: this.fBody,
      kind: this.fKind,
    });
    if (result.ok) {
      this.phase = 'done';
      this.createdNumber = result.number;
      this.createdUrl = result.url;
      await this.load();
    } else {
      this.phase = 'failed';
    }
  };

  private visible(source: readonly Ticket[]): readonly Ticket[] {
    return this.filter === 'all'
      ? source
      : source.filter((ticket) => ticket.kind === this.filter);
  }

  private renderCreateResult(): TemplateResult | typeof nothing {
    if (this.phase === 'done') {
      const ref = this.createdNumber !== undefined ? `#${this.createdNumber}` : 'тикет';
      return html`<cp-banner tone="success" title="Тикет создан">
        Создан ${ref}.${this.createdUrl !== undefined
          ? html` <a class="gh" href=${this.createdUrl} target="_blank" rel="noopener">Открыть ↗</a>`
          : nothing}
      </cp-banner>`;
    }
    if (this.phase === 'failed') {
      return html`<cp-banner tone="danger" title="Не удалось создать тикет"
        >Проверьте вход через GitHub и доступ к репозиторию.</cp-banner
      >`;
    }
    return nothing;
  }

  private renderForm(): TemplateResult {
    return html`
      <cp-sheet ?open=${this.formOpen} heading="Новый тикет" @cp-close=${this.closeForm}>
        <div class="form">
          <cp-input
            label="Заголовок"
            required
            .value=${this.fTitle}
            @cp-input=${this.bindText('fTitle')}
            @cp-change=${this.bindText('fTitle')}
          ></cp-input>
          <cp-select
            label="Тип"
            .value=${this.fKind}
            .options=${KIND_OPTIONS}
            @cp-change=${this.onKindChange}
          ></cp-select>
          <cp-textarea
            label="Описание"
            rows="6"
            .value=${this.fBody}
            @cp-input=${this.bindText('fBody')}
            @cp-change=${this.bindText('fBody')}
          ></cp-textarea>

          ${this.renderCreateResult()}

          <div class="foot">
            <cp-button variant="secondary" @cp-click=${this.closeForm}>
              ${this.phase === 'done' ? 'Закрыть' : 'Отмена'}
            </cp-button>
            ${this.phase === 'done'
              ? nothing
              : html`<cp-button arrow ?disabled=${!this.canSubmit} @cp-click=${this.submit}>
                  ${this.phase === 'running' ? 'Создаётся…' : 'Создать тикет'}
                </cp-button>`}
          </div>
        </div>
      </cp-sheet>
    `;
  }

  override render() {
    const live = this.tickets.length > 0;
    const visible = this.visible(this.tickets);
    const rows = visible.map(toRow);
    return html`
      <header class="head">
        <p class="eyebrow">Задачи${live ? html` · ${visible.length} на экране` : nothing}</p>
        <h1 tabindex="-1">Тикеты</h1>
        <cp-button @cp-click=${this.openForm}>
          <cp-icon name="plus" size="18"></cp-icon>
          Новый тикет
        </cp-button>
      </header>

      ${this.renderForm()}

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

            <div style="max-width:100%;overflow-x:auto">
              <cp-table caption="Тикеты и баг-репорты" .columns=${COLUMNS} .rows=${rows}></cp-table>
            </div>
          `
        : html`<p class="eyebrow">
            ${classifyEmpty(this.loaded) === 'loading'
              ? 'Загружаем тикеты…'
              : classifyEmpty(this.loaded) === 'signed-out'
                ? 'Войдите через GitHub, чтобы увидеть тикеты и баг-репорты репозитория.'
                : 'Тикеты не найдены или не удалось их загрузить.'}
          </p>`}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'screen-tickets': ScreenTickets;
  }
}
