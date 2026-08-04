import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@communist-prometheus/cp-components';
import { listArticles, type ArticleSummary } from '../engine/content.js';

/**
 * Articles screen (content-list spec). Lists the actual `blog/<slug>/index.<lang>.md`
 * groups from the cloned repo through the content engine — proving live data
 * end-to-end. There is deliberately NO sample/demo fallback: when the engine is
 * not running (signed out), the screen shows a sign-in prompt rather than
 * fabricated articles, so the editor never sees data that is not really theirs.
 */
@customElement('screen-articles')
export class ScreenArticles extends LitElement {
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

  /** Articles read from the repo; empty until the engine has loaded them. */
  @state() private articles: readonly ArticleSummary[] = [];

  /** Whether a read has completed (so we can distinguish loading from empty). */
  @state() private loaded = false;

  override connectedCallback(): void {
    super.connectedCallback();
    void this.load();
  }

  private async load(): Promise<void> {
    const articles = await listArticles();
    this.articles = articles;
    this.loaded = true;
  }

  /** Opens the editor for a specific article slug, or a new blank document. */
  private openEditor(slug?: string): void {
    location.hash = slug === undefined ? '/editor/new' : `/editor/${slug}`;
  }

  private renderCard(article: ArticleSummary) {
    return html`
      <cp-card hoverable @cp-card-click=${() => this.openEditor(article.slug)}>
        ${article.topic ? html`<cp-pill slot="pill">${article.topic}</cp-pill>` : nothing}
        <span slot="title">${article.title}</span>
        <span slot="summary">${article.languages.join(' · ')}</span>
        <div slot="meta" class="meta">
          ${article.date ? html`<span>${article.date}</span>` : nothing}
          <cp-status
            state=${article.published ? 'success' : 'warning'}
            label=${article.published ? 'опубликовано' : 'черновик'}
          ></cp-status>
        </div>
      </cp-card>
    `;
  }

  private renderEmpty() {
    return html`
      <div class="empty">
        <p>
          ${this.loaded
            ? 'Здесь появятся материалы репозитория. Войдите через GitHub, чтобы загрузить их.'
            : 'Загружаем материалы…'}
        </p>
      </div>
    `;
  }

  override render() {
    const live = this.articles.length > 0;
    return html`
      <div class="head">
        <p class="eyebrow">Контент${live ? html` · ${this.articles.length} материалов` : nothing}</p>
        <h1 tabindex="-1">Статьи</h1>
        <cp-button arrow @cp-click=${() => this.openEditor()}>Новая статья</cp-button>
      </div>
      ${live
        ? html`<div class="grid">${this.articles.map((article) => this.renderCard(article))}</div>`
        : this.renderEmpty()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'screen-articles': ScreenArticles;
  }
}
