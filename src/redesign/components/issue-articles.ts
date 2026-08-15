import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@communist-prometheus/cp-components';
import {
  listArticlesViaApi,
  readFileViaApi,
  readSequenceField,
  linkIssueArticlesViaApi,
  type ArticleSummary,
} from '../engine/content.js';

/**
 * The article-linking panel of a magazine issue. Lists every blog article that
 * exists in the issue's open language, shows which are currently part of the
 * issue (its `articles:` table of contents), and lets the editor tick articles
 * in or out — the manual "reassign articles" the journal workflow needs. Saving
 * reconciles both sides of the link (the issue TOC and each article's
 * `magazine:` back-link) via the Contents API, no clone.
 *
 * Built to stay usable at a hundred-plus articles: a search box filters by
 * title, the articles already in the issue are pinned to the top, and a toggle
 * narrows the list to just those — so the editor is never scrolling a flat wall
 * of checkboxes to find what is in the issue or to add one more.
 */
@customElement('issue-articles')
export class IssueArticles extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    h2 {
      font-size: 1.1rem;
      margin: 0 0 var(--spacing-sm);
    }
    .toolbar {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
      margin-bottom: var(--spacing-xs);
    }
    .toolbar cp-input {
      flex: 1 1 12rem;
    }
    .only {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      cursor: pointer;
      white-space: nowrap;
    }
    .only input {
      accent-color: var(--color-accent);
    }
    .count {
      font-size: 0.82rem;
      color: var(--color-text-secondary);
      margin: 0 0 var(--spacing-xs);
    }
    .count b {
      color: var(--color-text-primary);
    }
    .scroll {
      max-height: 24rem;
      overflow-y: auto;
      border: 1px solid var(--color-hairline);
      border-radius: var(--radius-md, 10px);
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
    }
    li {
      display: flex;
      align-items: baseline;
      gap: var(--spacing-sm);
      padding: var(--spacing-xs) var(--spacing-sm);
      border-top: 1px solid var(--color-hairline);
    }
    li:first-child {
      border-top: none;
    }
    /* An article already in the issue reads as selected at a glance. */
    li.on {
      background: color-mix(in srgb, var(--color-accent) 10%, transparent);
    }
    label {
      display: flex;
      align-items: baseline;
      gap: var(--spacing-sm);
      cursor: pointer;
      min-width: 0;
      flex: 1;
    }
    .title {
      overflow-wrap: anywhere;
    }
    .in {
      font-size: 0.7rem;
      font-weight: 600;
      color: var(--color-accent);
      white-space: nowrap;
    }
    .date {
      font-size: 0.78rem;
      color: var(--color-text-secondary);
      font-variant-numeric: tabular-nums;
      margin-left: auto;
      white-space: nowrap;
    }
    .actions {
      display: flex;
      align-items: center;
      gap: var(--spacing-md);
      flex-wrap: wrap;
      margin-top: var(--spacing-sm);
    }
    .empty,
    .msg {
      color: var(--color-text-secondary);
      font-size: 0.88rem;
      margin: 0.2rem 0;
      padding: 0 var(--spacing-sm);
    }
    .msg.error {
      color: var(--color-danger, #c0392b);
    }
    .dirty {
      font-size: 0.82rem;
      color: var(--color-accent);
    }
  `;

  /** The issue slug whose table of contents is edited. */
  @property() issueSlug = '';

  /** The language currently open — articles and links are per-language. */
  @property() lang = '';

  @state() private articles: readonly ArticleSummary[] = [];
  @state() private selected: ReadonlySet<string> = new Set();
  @state() private linkedAtLoad: ReadonlySet<string> = new Set();
  @state() private loading = false;
  @state() private busy = false;
  @state() private message = '';
  @state() private error = '';

  /** Free-text filter over article titles / slugs. */
  @state() private query = '';

  /** When true, only the articles already in the issue are listed. */
  @state() private onlySelected = false;

  override connectedCallback(): void {
    super.connectedCallback();
    void this.load();
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has('issueSlug') || changed.has('lang')) void this.load();
  }

  private async load(): Promise<void> {
    if (this.issueSlug === '' || this.lang === '') return;
    this.loading = true;
    this.error = '';
    this.message = '';
    const [list, indexMd] = await Promise.all([
      listArticlesViaApi(),
      readFileViaApi(`magazine/${this.issueSlug}/index.${this.lang}.md`),
    ]);
    if (list.error !== undefined) {
      this.error = list.error === 'signed-out' ? 'Войдите, чтобы редактировать связи.' : list.error;
      this.loading = false;
      return;
    }
    // Only articles that actually exist in this language can be linked.
    this.articles = list.articles.filter((a) => a.languages.includes(this.lang));
    const linked = new Set(indexMd === undefined ? [] : readSequenceField(indexMd, 'articles'));
    this.linkedAtLoad = linked;
    this.selected = new Set(linked);
    this.loading = false;
  }

  private readonly toggle = (slug: string): void => {
    const next = new Set(this.selected);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    this.selected = next;
  };

  private readonly onQuery = (event: Event): void => {
    if (!(event instanceof CustomEvent)) return;
    const value: unknown = event.detail?.value;
    if (typeof value === 'string') this.query = value;
  };

  /** The visible article list: filtered by the search and the "only selected"
   *  toggle, with the ones already in the issue pinned to the top, then newest
   *  first — so both "what is in the issue" and "add another" stay one glance
   *  away however long the full catalogue grows. */
  private get view(): readonly ArticleSummary[] {
    const q = this.query.trim().toLowerCase();
    const matches = (a: ArticleSummary): boolean => {
      const inSearch = q === '' || a.title.toLowerCase().includes(q) || a.slug.toLowerCase().includes(q);
      return inSearch && (!this.onlySelected || this.selected.has(a.slug));
    };
    const rank = (a: ArticleSummary): number => (this.selected.has(a.slug) ? 0 : 1);
    return [...this.articles.filter(matches)].sort((a, b) => {
      if (rank(a) !== rank(b)) return rank(a) - rank(b);
      const da = a.date ?? '';
      const db = b.date ?? '';
      if (da !== db) return da < db ? 1 : -1; // newest first
      return (a.title || a.slug).localeCompare(b.title || b.slug);
    });
  }

  /** True once the selection differs from what was loaded — enables Save. */
  private get changed(): boolean {
    if (this.selected.size !== this.linkedAtLoad.size) return true;
    for (const s of this.selected) if (!this.linkedAtLoad.has(s)) return true;
    return false;
  }

  private readonly save = async (): Promise<void> => {
    this.busy = true;
    this.error = '';
    this.message = '';
    const result = await linkIssueArticlesViaApi(this.issueSlug, this.lang, [...this.selected]);
    this.busy = false;
    if (result.ok) {
      this.linkedAtLoad = new Set(this.selected);
      this.message = `Связи обновлены: +${result.linked}, −${result.unlinked}.`;
    } else {
      this.error = result.error ?? 'Не удалось обновить связи.';
    }
  };

  private renderArticle(a: ArticleSummary): TemplateResult {
    const on = this.selected.has(a.slug);
    return html`
      <li class=${on ? 'on' : ''}>
        <label>
          <input
            type="checkbox"
            .checked=${on}
            ?disabled=${this.busy}
            @change=${() => this.toggle(a.slug)}
          />
          <span class="title">${a.title === '' ? a.slug : a.title}</span>
          ${on ? html`<span class="in">в номере</span>` : nothing}
        </label>
        ${a.date !== undefined ? html`<span class="date">${a.date}</span>` : nothing}
      </li>
    `;
  }

  private renderList(): TemplateResult {
    const view = this.view;
    if (this.articles.length === 0) {
      return html`<p class="empty">
        Нет статей на языке «${this.lang}». Создайте статьи в разделе «Материалы».
      </p>`;
    }
    return html`
      <p class="count">
        В номере <b>${this.selected.size}</b> · показано ${view.length} из ${this.articles.length}
        ${this.changed ? html`· <span class="dirty">есть несохранённые изменения</span>` : nothing}
      </p>
      ${view.length === 0
        ? html`<p class="empty">Ничего не найдено по запросу «${this.query}».</p>`
        : html`<div class="scroll">
            <ul>
              ${view.map((a) => this.renderArticle(a))}
            </ul>
          </div>`}
    `;
  }

  override render(): TemplateResult {
    return html`
      <h2>Статьи номера</h2>
      ${this.loading
        ? html`<p class="msg">Загружаем статьи…</p>`
        : html`
            <div class="toolbar">
              <cp-input
                placeholder="Поиск статьи по названию…"
                .value=${this.query}
                @cp-input=${this.onQuery}
                @cp-change=${this.onQuery}
              ></cp-input>
              <label class="only">
                <input
                  type="checkbox"
                  .checked=${this.onlySelected}
                  @change=${() => (this.onlySelected = !this.onlySelected)}
                />
                только в номере
              </label>
            </div>
            ${this.renderList()}
          `}
      ${this.error !== '' ? html`<p class="msg error">${this.error}</p>` : nothing}
      ${this.message !== '' ? html`<p class="msg">${this.message}</p>` : nothing}
      <div class="actions">
        <cp-button
          size="sm"
          ?disabled=${this.busy || !this.changed}
          @cp-click=${() => void this.save()}
        >
          ${this.busy ? 'Сохраняем…' : 'Сохранить связи'}
        </cp-button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'issue-articles': IssueArticles;
  }
}
