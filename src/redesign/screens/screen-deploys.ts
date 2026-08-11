import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@communist-prometheus/cp-components';
import { listPushes, listDeployRuns } from '../engine/github-api.js';
import { correlateDeploys, type DeployedPush, type DeployPhase } from '../engine/deploy-status.js';
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
      gap: var(--spacing-xs);
    }
    .row {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto;
      align-items: start;
      gap: var(--spacing-sm);
      padding: var(--spacing-md) 0;
      border-top: 1px solid var(--color-hairline);
    }
    .row:first-child {
      border-top: none;
    }
    .ri {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 2rem;
      height: 2rem;
      border-radius: 999px;
      flex: none;
    }
    .ri.success {
      color: var(--color-success, #2e9e5b);
      background: var(--color-success-bg, rgba(46, 158, 91, 0.14));
    }
    .ri.info {
      color: var(--color-info, var(--color-accent));
      background: var(--color-info-bg, rgba(224, 108, 60, 0.14));
    }
    .ri.danger {
      color: var(--color-danger, #c0392b);
      background: var(--color-danger-bg, rgba(192, 57, 43, 0.14));
    }
    .ri.neutral {
      color: var(--color-text-secondary);
      background: var(--color-surface);
    }
    .spin {
      animation: spin 1s linear infinite;
    }
    @media (prefers-reduced-motion: reduce) {
      .spin {
        animation: none;
      }
    }
    @keyframes spin {
      to {
        transform: rotate(1turn);
      }
    }
    .rc {
      min-width: 0;
      display: grid;
      gap: 0.3rem;
    }
    .rt {
      font-weight: 600;
      overflow-wrap: anywhere;
    }
    .rm {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
    .rc cp-progress {
      margin-top: 0.2rem;
    }
    a.gh {
      color: var(--color-accent);
      text-decoration: none;
    }
    a.gh:hover {
      text-decoration: underline;
    }
    .ra {
      display: inline-flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.25rem;
      text-align: right;
    }
    .dur {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      font-variant-numeric: tabular-nums;
    }
    .empty {
      color: var(--color-text-secondary);
    }
  `;

  /** Recent pushes enriched with their deploy status; empty until loaded. */
  @state() private deploys: readonly DeployedPush[] = [];

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
    const [pushes, runs] = await Promise.all([listPushes(), listDeployRuns()]);
    this.deploys = correlateDeploys(pushes, runs);
    this.loaded = true;
  }

  /** cp-status tone + icon + Russian label for a deploy phase. */
  private phaseMeta(phase: DeployPhase): {
    state: string;
    icon: string;
    label: string;
    spin: boolean;
  } {
    if (phase === 'published') return { state: 'success', icon: 'check', label: 'опубликовано', spin: false };
    if (phase === 'building') return { state: 'info', icon: 'refresh', label: 'сборка идёт', spin: true };
    if (phase === 'queued') return { state: 'info', icon: 'refresh', label: 'в очереди', spin: false };
    if (phase === 'failed') return { state: 'danger', icon: 'warning', label: 'не удалось', spin: false };
    return { state: 'neutral', icon: 'more', label: 'нет данных', spin: false };
  }

  /** Relative Russian time-ago from an ISO timestamp. */
  private ago(iso: string): string {
    const t = Date.parse(iso);
    if (Number.isNaN(t)) return '';
    const sec = Math.max(0, Math.round((Date.now() - t) / 1000));
    if (sec < 60) return 'только что';
    const min = Math.round(sec / 60);
    if (min < 60) return `${min} мин назад`;
    const hr = Math.round(min / 60);
    if (hr < 24) return `${hr} ч назад`;
    return `${Math.round(hr / 24)} дн назад`;
  }

  private renderRow(item: DeployedPush): TemplateResult {
    const meta = this.phaseMeta(item.phase);
    const dur =
      item.durationSec !== undefined
        ? `${Math.floor(item.durationSec / 60)}м ${item.durationSec % 60}с`
        : '';
    const branch = import.meta.env.VITE_GITHUB_BRANCH ?? 'develop';
    return html`
      <li class="row">
        <span class="ri ${meta.state}">
          <cp-icon name=${meta.icon} size="18" class=${meta.spin ? 'spin' : ''}></cp-icon>
        </span>
        <div class="rc">
          <div class="rt">
            <span class="branch">${branch}</span> · ${item.push.title}
          </div>
          <div class="rm">
            <span>${item.push.author}</span><span aria-hidden="true">·</span>
            <span>${this.ago(item.push.date)}</span>
            ${item.runUrl === undefined
              ? nothing
              : html`<span aria-hidden="true">·</span
                  ><a class="gh" href=${item.runUrl} target="_blank" rel="noopener">лог ↗</a>`}
          </div>
          ${item.phase === 'building' || item.phase === 'queued'
            ? html`<cp-progress ?indeterminate=${true} value="0"></cp-progress>`
            : nothing}
        </div>
        <div class="ra">
          <cp-status state=${meta.state} label=${meta.label}></cp-status>
          ${dur === '' ? nothing : html`<span class="dur">${dur}</span>`}
        </div>
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
        Недавние коммиты в контент-репозиторий (ветка <span class="branch">${branch}</span>) и статус
        их публикации на сайте. Публикация ≠ индекс: статья может быть на сайте, пока поиск
        обновляется отдельно.
      </p>
      ${this.deploys.length > 0
        ? html`<ul>${this.deploys.map((item) => this.renderRow(item))}</ul>`
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
