import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@communist-prometheus/cp-components';
import { listPushes, type Push } from '../engine/github-api.js';
import { onEngineReady } from '../engine/engine-ready.js';

/**
 * `screen-deploys` — a real activity board of recent pushes to the content repo
 * (the branch this admin is wired to). Each row is one commit with its author,
 * short sha, message and a link to GitHub. No fabricated data and no mock
 * conflict UI: it reads {@link listPushes} through the signed-in token and shows
 * an honest empty/loading state otherwise.
 */
@customElement('screen-deploys')
export class ScreenDeploys extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    .head {
      margin-bottom: var(--spacing-lg);
    }
    .eyebrow {
      margin: 0;
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
    h1 {
      font-size: clamp(1.9rem, 7vw, 2.6rem);
      line-height: 1.15;
      font-weight: 700;
      margin: 0.2rem 0 0;
      background: linear-gradient(135deg, var(--color-accent), var(--color-text-primary));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    h1:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 4px;
    }
    .hint {
      margin: var(--spacing-sm) 0 var(--spacing-lg);
      max-width: 60ch;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }
    .branch {
      font-family: var(--font-mono);
      color: var(--color-accent);
    }
    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: var(--spacing-sm);
    }
    li {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: baseline;
      gap: var(--spacing-xs) var(--spacing-sm);
      padding: var(--spacing-sm) 0;
      border-top: 1px solid var(--color-hairline);
    }
    li:first-child {
      border-top: none;
    }
    .sha {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
    .title {
      min-width: 0;
      overflow-wrap: anywhere;
      font-weight: 600;
    }
    .meta {
      grid-column: 2 / -1;
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
    a.gh {
      justify-self: end;
      font-size: 0.8rem;
      color: var(--color-accent);
      text-decoration: none;
    }
    a.gh:hover {
      text-decoration: underline;
    }
    .empty {
      color: var(--color-text-secondary);
    }
  `;

  /** Recent pushes read from the content repo; empty until loaded. */
  @state() private pushes: readonly Push[] = [];

  /** Whether the real read has completed. */
  @state() private loaded = false;

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
    this.pushes = await listPushes();
    this.loaded = true;
  }

  private renderRow(push: Push): TemplateResult {
    return html`
      <li>
        <span class="sha">${push.sha}</span>
        <span class="title">${push.title}</span>
        ${push.url === ''
          ? nothing
          : html`<a class="gh" href=${push.url} target="_blank" rel="noopener">GitHub ↗</a>`}
        <span class="meta">${push.author} · ${push.date.slice(0, 10)}</span>
      </li>
    `;
  }

  override render(): TemplateResult {
    const branch = import.meta.env.VITE_GITHUB_BRANCH ?? 'develop';
    return html`
      <div class="head">
        <p class="eyebrow">Публикации · недавние пуши</p>
        <h1 tabindex="-1">Деплои</h1>
      </div>
      <p class="hint">
        Недавние коммиты в контент-репозиторий (ветка <span class="branch">${branch}</span>). Каждый
        пуш запускает сборку и деплой сайта. Публикация ≠ индекс: статья может быть на сайте, пока
        поиск обновляется отдельно.
      </p>
      ${this.pushes.length > 0
        ? html`<ul>${this.pushes.map((push) => this.renderRow(push))}</ul>`
        : html`<p class="empty">
            ${this.loaded ? 'Пушей не найдено (или нет доступа по токену).' : 'Загружаем историю…'}
          </p>`}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'screen-deploys': ScreenDeploys;
  }
}
