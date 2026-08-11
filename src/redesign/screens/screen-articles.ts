import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@communist-prometheus/cp-components';
import { listArticles, type ArticleSummary } from '../engine/content.js';

/**
 * Articles screen (content-list spec). When the real content engine is running
 * (local dev:token), it groups `blog/<slug>/index.<lang>.md` from the cloned
 * repo and lists the actual articles — proving live data end-to-end; otherwise
 * it falls back to a representative sample so the preview still renders.
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
  `;

  /** Articles read from the repo; empty until loaded (or if the engine is off). */
  @state() private articles: readonly ArticleSummary[] = [];

  /** Whether the real read has completed. */
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

  private sample(): readonly ArticleSummary[] {
    return [
      {
        slug: 'crisis-of-overproduction',
        title: 'Кризис перепроизводства и его пределы',
        topic: 'Наш перевод',
        date: '12 июня 2026',
        published: true,
        languages: ['ru', 'en'],
      },
      {
        slug: 'new-wave-unions',
        title: 'Профсоюзы новой волны: цифры и тенденции',
        topic: 'Аналитика',
        date: '3 июня 2026',
        published: false,
        languages: ['ru'],
      },
      {
        slug: 'forgotten-commune',
        title: 'Коммуна, которую забыли',
        topic: 'История',
        date: '28 мая 2026',
        published: true,
        languages: ['ru', 'en', 'it'],
      },
    ];
  }

  private openEditor(): void {
    location.hash = '/editor';
  }

  private renderCard(article: ArticleSummary) {
    return html`
      <cp-card interactive @cp-click=${() => this.openEditor()}>
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
        <cp-button slot="actions" variant="ghost" size="sm" aria-label="Действия">
          <cp-icon name="more"></cp-icon>
        </cp-button>
      </cp-card>
    `;
  }

  override render() {
    const live = this.articles.length > 0;
    const list = live ? this.articles : this.sample();
    return html`
      <div class="head">
        <p class="eyebrow">Контент · ${list.length} материалов</p>
        <h1 tabindex="-1">Статьи</h1>
        <cp-button arrow @cp-click=${() => this.openEditor()}>Новая статья</cp-button>
        ${live
          ? html`<cp-tag tone="success">данные из репозитория</cp-tag>`
          : this.loaded
            ? html`<cp-tag tone="neutral">демо-данные</cp-tag>`
            : nothing}
      </div>
      <div class="grid">${list.map((article) => this.renderCard(article))}</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'screen-articles': ScreenArticles;
  }
}
