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
    ul {
      list-style: none;
      margin: 0 0 var(--spacing-md);
      padding: 0;
      display: grid;
      gap: var(--spacing-xs);
    }
    li {
      display: flex;
      align-items: baseline;
      gap: var(--spacing-sm);
      padding: var(--spacing-xs) 0;
      border-top: 1px solid var(--color-hairline);
    }
    li:first-child {
      border-top: none;
    }
    label {
      display: flex;
      align-items: baseline;
      gap: var(--spacing-sm);
      cursor: pointer;
      min-width: 0;
    }
    .title {
      overflow-wrap: anywhere;
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
    }
    .empty,
    .msg {
      color: var(--color-text-secondary);
      font-size: 0.88rem;
      margin: 0.2rem 0;
    }
    .msg.error {
      color: var(--color-danger, #c0392b);
    }
    .count {
      font-size: 0.82rem;
      color: var(--color-text-secondary);
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
    return html`
      <li>
        <label>
          <input
            type="checkbox"
            .checked=${this.selected.has(a.slug)}
            ?disabled=${this.busy}
            @change=${() => this.toggle(a.slug)}
          />
          <span class="title">${a.title === '' ? a.slug : a.title}</span>
        </label>
        ${a.date !== undefined ? html`<span class="date">${a.date}</span>` : nothing}
      </li>
    `;
  }

  override render(): TemplateResult {
    return html`
      <h2>Статьи номера</h2>
      ${this.loading
        ? html`<p class="msg">Загружаем статьи…</p>`
        : this.articles.length === 0
          ? html`<p class="empty">
              Нет статей на языке «${this.lang}». Создайте статьи в разделе «Материалы».
            </p>`
          : html`
              <p class="count">Отмечено ${this.selected.size} из ${this.articles.length}.</p>
              <ul>
                ${this.articles.map((a) => this.renderArticle(a))}
              </ul>
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
