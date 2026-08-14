import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@communist-prometheus/cp-components';
import { listArticlesViaApi, type ArticleSummary } from '../engine/content.js';

/**
 * A generic content-section list, driven entirely by its `collection` attribute
 * (`pages`, `positions`, `archive`, …). It lists the real
 * `<collection>/<slug>/index.<lang>.md` groups via the GitHub API and opens each
 * in the shared editor at `#/editor/<collection>/<slug>`. This is what surfaces
 * the content-repo sections beyond Articles (blog) and Magazine, so an editor
 * can actually reach and edit them. Like the articles screen, there is no
 * sample fallback — signed out shows a sign-in prompt, never fabricated data.
 */
@customElement('screen-collection')
export class ScreenCollection extends LitElement {
  static override styles = css`
    :host {
      display: block;
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
      background: linear-gradient(135deg, var(--color-accent), var(--color-text-primary));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .eyebrow {
      flex-basis: 100%;
      margin: 0;
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(18rem, 1fr));
      gap: var(--spacing-md);
    }
    .meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-sm);
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }
    .empty {
      display: grid;
      justify-items: start;
      gap: var(--spacing-sm);
      padding: var(--spacing-2xl) 0;
      color: var(--color-text-secondary);
    }
    .empty p {
      margin: 0;
      max-width: 34ch;
      line-height: 1.5;
    }
  `;

  /** The repo content folder this screen lists, e.g. `pages` or `positions`. */
  @property() collection = 'pages';

  /** The human heading shown as the page title (e.g. the "Pages" label). */
  @property() heading = '';

  @state() private items: readonly ArticleSummary[] = [];
  @state() private loaded = false;
  @state() private loading = false;
  @state() private progress: { readonly done: number; readonly total: number } = {
    done: 0,
    total: 0,
  };
  @state() private error = '';

  override connectedCallback(): void {
    super.connectedCallback();
    void this.load();
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has('collection')) void this.load();
  }

  private async load(): Promise<void> {
    this.loading = true;
    this.error = '';
    this.progress = { done: 0, total: 0 };
    const result = await listArticlesViaApi((done, total) => {
      this.progress = { done, total };
    }, this.collection);
    this.items = result.articles;
    this.error = result.error ?? '';
    this.loading = false;
    this.loaded = true;
  }

  private open(slug: string): void {
    location.hash = `/editor/${this.collection}/${slug}`;
  }

  private renderCard(item: ArticleSummary): TemplateResult {
    return html`
      <cp-card hoverable @cp-card-click=${() => this.open(item.slug)}>
        ${item.topic ? html`<cp-pill slot="pill">${item.topic}</cp-pill>` : nothing}
        <span slot="title">${item.title === '' ? item.slug : item.title}</span>
        <span slot="summary">${item.languages.join(' · ')}</span>
        <div slot="meta" class="meta">
          ${item.date ? html`<span>${item.date}</span>` : nothing}
          <cp-status
            state=${item.published ? 'success' : 'warning'}
            label=${item.published ? 'опубликовано' : 'черновик'}
          ></cp-status>
        </div>
      </cp-card>
    `;
  }

  private renderEmpty(): TemplateResult {
    if (this.loading) {
      const { done, total } = this.progress;
      const label = total > 0 ? `Загружаем заголовки: ${done} из ${total}` : 'Получаем список…';
      return html`<div class="empty">
        <cp-progress ?indeterminate=${total === 0} value=${total > 0 ? done / total : 0}></cp-progress>
        <p>${label}</p>
      </div>`;
    }
    if (this.error === 'signed-out') {
      return html`<div class="empty">
        <p>Здесь появятся материалы репозитория. Войдите через GitHub, чтобы загрузить их.</p>
      </div>`;
    }
    return html`<div class="empty">
      <p>${this.error !== '' ? `Не удалось загрузить: ${this.error}` : 'Материалов пока нет.'}</p>
      <cp-button variant="secondary" @cp-click=${() => void this.load()}>Обновить</cp-button>
    </div>`;
  }

  override render(): TemplateResult {
    const live = this.items.length > 0;
    return html`
      <div class="head">
        <p class="eyebrow">Контент${live ? html` · ${this.items.length} материалов` : nothing}</p>
        <h1 tabindex="-1">${this.heading}</h1>
      </div>
      ${live
        ? html`<div class="grid">${this.items.map((item) => this.renderCard(item))}</div>`
        : this.renderEmpty()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'screen-collection': ScreenCollection;
  }
}
