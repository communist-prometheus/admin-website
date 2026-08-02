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
    /* Flat document list — no card boxes. Items sit on the page and are
       separated by a hairline, matching the public site's restrained feel
       rather than a lighter surface panel. */
    .list {
      display: flex;
      flex-direction: column;
    }
    .item {
      display: grid;
      gap: var(--spacing-xs);
      padding: var(--spacing-lg) 0;
      border-top: 1px solid var(--color-border);
      cursor: pointer;
      transition: opacity var(--transition-fast, 150ms ease);
    }
    .item:first-child {
      border-top: none;
    }
    .item:hover {
      opacity: 0.72;
    }
    .item:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 4px;
    }
    .topic {
      justify-self: start;
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-accent);
    }
    .title {
      margin: 0;
      font-size: 1.15rem;
      font-weight: 700;
      line-height: 1.3;
      color: var(--color-text-primary);
    }
    .meta {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }
    .meta .dot {
      opacity: 0.5;
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

  private renderItem(article: ArticleSummary) {
    return html`
      <div
        class="item"
        role="button"
        tabindex="0"
        @click=${() => this.openEditor()}
        @keydown=${(event: KeyboardEvent) =>
          (event.key === 'Enter' || event.key === ' ') &&
          (event.preventDefault(), this.openEditor())}
      >
        ${article.topic ? html`<span class="topic">${article.topic}</span>` : nothing}
        <h3 class="title">${article.title}</h3>
        <div class="meta">
          <span>${article.languages.join(' · ')}</span>
          ${article.date ? html`<span class="dot">·</span><span>${article.date}</span>` : nothing}
          <span class="dot">·</span>
          <cp-status
            state=${article.published ? 'success' : 'warning'}
            label=${article.published ? 'опубликовано' : 'черновик'}
          ></cp-status>
        </div>
      </div>
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
      <div class="list">${list.map((article) => this.renderItem(article))}</div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'screen-articles': ScreenArticles;
  }
}
