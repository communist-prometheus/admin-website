import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@communist-prometheus/cp-components';
import {
  listPushes,
  listDeployRuns,
  listDeployRunSteps,
  type DeployStep,
} from '../engine/github-api.js';
import { correlateDeploys, type DeployedPush, type DeployPhase } from '../engine/deploy-status.js';

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
    /* Mobile-first: the status wraps to its own line UNDER the title so the
       title always gets the full width (it used to be crushed into a 5-char
       column next to a long status label). Widens to a proper 3-column row on
       tablets and up. */
    .row {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr);
      grid-template-areas: 'icon content' '. status';
      align-items: start;
      gap: 0.4rem var(--spacing-sm);
      padding: var(--spacing-md) 0;
      border-top: 1px solid var(--color-hairline);
    }
    @media (min-width: 640px) {
      .row {
        grid-template-columns: auto minmax(0, 1fr) auto;
        grid-template-areas: 'icon content status';
      }
    }
    .row:first-child {
      border-top: none;
    }
    .ri {
      grid-area: icon;
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
      grid-area: content;
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
      grid-area: status;
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      gap: 0.5rem;
      text-align: left;
    }
    @media (min-width: 640px) {
      .ra {
        flex-direction: column;
        align-items: flex-end;
        gap: 0.25rem;
        text-align: right;
      }
    }
    .dur {
      font-size: 0.75rem;
      color: var(--color-text-secondary);
      font-variant-numeric: tabular-nums;
    }
    .empty {
      color: var(--color-text-secondary);
    }
    .steps-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      margin-top: 0.35rem;
      padding: 0.15rem 0;
      border: none;
      background: transparent;
      color: var(--color-accent);
      font: inherit;
      font-size: 0.8rem;
      cursor: pointer;
    }
    .steps-hint {
      margin: 0.3rem 0 0;
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
    .steps {
      list-style: none;
      margin: 0.4rem 0 0;
      padding: 0;
      display: grid;
      gap: 0.3rem;
    }
    .step {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.82rem;
      color: var(--color-text-secondary);
    }
    .step-dot {
      width: 0.55rem;
      height: 0.55rem;
      border-radius: 999px;
      flex: none;
      background: var(--color-border);
    }
    .step.success .step-dot {
      background: var(--color-success, #2e9e5b);
    }
    .step.failure .step-dot {
      background: var(--color-danger, #c0392b);
    }
    .step.running .step-dot {
      background: var(--color-accent);
      animation: spin 1s linear infinite;
    }
    .step.running .step-name {
      color: var(--color-text-primary);
    }
    .step-name {
      overflow-wrap: anywhere;
    }
  `;

  /** Recent pushes enriched with their deploy status; empty until loaded. */
  @state() private deploys: readonly DeployedPush[] = [];

  /** Whether the real read has completed. */
  @state() private loaded = false;

  /** Run ids whose steps are expanded in the UI. */
  @state() private expanded: ReadonlySet<number> = new Set();

  /** Fetched steps per run id (`'loading'` while in flight). */
  @state() private stepsByRun: ReadonlyMap<number, readonly DeployStep[] | 'loading'> = new Map();

  /** The auto-refresh timer while any deploy is still in flight. */
  private refreshTimer: ReturnType<typeof setTimeout> | undefined;

  override connectedCallback(): void {
    super.connectedCallback();
    void this.load();
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    if (this.refreshTimer !== undefined) clearTimeout(this.refreshTimer);
    this.refreshTimer = undefined;
  }

  private async load(): Promise<void> {
    const [pushes, runs] = await Promise.all([listPushes(), listDeployRuns()]);
    this.deploys = correlateDeploys(pushes, runs);
    this.loaded = true;
    this.scheduleRefresh();
  }

  /** Polls again while any deploy is building/queued/pending, so a status moves
   *  from building to published/failed without a manual reload. */
  private scheduleRefresh(): void {
    if (this.refreshTimer !== undefined) clearTimeout(this.refreshTimer);
    this.refreshTimer = undefined;
    const inFlight = this.deploys.some(
      (d) => d.phase === 'building' || d.phase === 'queued' || d.phase === 'pending',
    );
    if (inFlight && this.isConnected) {
      this.refreshTimer = setTimeout(() => void this.load(), 15_000);
    }
  }

  /** Toggles the per-run steps panel, fetching the run's steps on first open. */
  private async toggleSteps(runId: number): Promise<void> {
    const next = new Set(this.expanded);
    if (next.has(runId)) {
      next.delete(runId);
      this.expanded = next;
      return;
    }
    next.add(runId);
    this.expanded = next;
    if (!this.stepsByRun.has(runId)) {
      this.stepsByRun = new Map(this.stepsByRun).set(runId, 'loading');
      const steps = await listDeployRunSteps(runId);
      this.stepsByRun = new Map(this.stepsByRun).set(runId, steps);
    }
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
    if (phase === 'pending') return { state: 'info', icon: 'refresh', label: 'ожидание деплоя', spin: true };
    if (phase === 'superseded')
      return { state: 'info', icon: 'refresh', label: 'перекрыт новым деплоем', spin: false };
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
          ${item.phase === 'building' || item.phase === 'queued' || item.phase === 'pending'
            ? html`<cp-progress ?indeterminate=${true} value="0"></cp-progress>`
            : nothing}
          ${item.runId === undefined || item.runId === 0
            ? nothing
            : this.renderSteps(item.runId)}
        </div>
        <div class="ra">
          <cp-status state=${meta.state} label=${meta.label}></cp-status>
          ${dur === '' ? nothing : html`<span class="dur">${dur}</span>`}
        </div>
      </li>`;
  }

  /** The expandable deploy-steps panel for a matched run. */
  private renderSteps(runId: number): TemplateResult {
    const open = this.expanded.has(runId);
    const steps = this.stepsByRun.get(runId);
    return html`
      <button class="steps-toggle" aria-expanded=${open} @click=${() => void this.toggleSteps(runId)}>
        <cp-icon name=${open ? 'chevron-down' : 'chevron-right'} size="14"></cp-icon>
        шаги деплоя
      </button>
      ${!open
        ? nothing
        : steps === 'loading' || steps === undefined
          ? html`<p class="steps-hint">Загружаем шаги…</p>`
          : steps.length === 0
            ? html`<p class="steps-hint">Шаги недоступны.</p>`
            : html`<ol class="steps">
                ${steps.map(
                  (s) => html`<li class="step ${s.state}">
                    <span class="step-dot"></span><span class="step-name">${s.name}</span>
                  </li>`,
                )}
              </ol>`}`;
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
