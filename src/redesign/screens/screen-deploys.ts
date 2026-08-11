import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@communist-prometheus/cp-components';

/**
 * `screen-deploys` — the push/deploy status board and the visual 3-way merge for
 * the admin redesign (deploy-status/git-engine, design.md R5).
 *
 * Two capabilities live on one screen:
 *
 * 1. A **status board** of recent pushes/deploys. Each entry is a purely
 *    presentational `cp-list-row` composing a `cp-status` (semantic tone), a
 *    staged `cp-steps` tracker (коммит → пуш → деплой → индексация) and a
 *    determinate `cp-progress`. A failed entry surfaces a danger `cp-banner`
 *    carrying an explicit retry and a "детали" affordance — colour is never the
 *    sole cue (status dot + shape + word; step markers + words), per design.md
 *    R5 / WCAG 1.4.1.
 * 2. A **visual 3-way merge** (deploy-status/git-engine, design.md R5). Every
 *    conflict hunk is shown as three read-only columns — ваша версия / база /
 *    удалённая — with a per-hunk "оставить" toggle that records an explicit
 *    choice. Nothing is auto-resolved and local work is never silently
 *    discarded: the merge stays blocked until every hunk has a chosen side, and
 *    only then does "Зафиксировать объединённое" enable.
 *
 * All interactive state (chosen sides, expanded failure details, retried and
 * committed flags) lives in reactive `@state`; the theme tokens on `:root`
 * inherit into this shadow root, so the surface re-themes with light/dark.
 */

/** Lifecycle state of a single pipeline stage (mirrors `cp-steps`' `Step`). */
type StepState = 'pending' | 'running' | 'done' | 'failed';

/** One pipeline stage: a human label plus its current lifecycle state. */
interface Stage {
  readonly label: string;
  readonly state: StepState;
}

/** The lifecycle a push/deploy entry can be in. */
type DeployStatus =
  | 'queued'
  | 'pushing'
  | 'retrying'
  | 'deploying'
  | 'ok'
  | 'failed';

/** The semantic tones understood by `cp-status` / `cp-banner`. */
type Tone = 'success' | 'warning' | 'info' | 'danger' | 'neutral';

/** A registered `cp-icon` name (kept local to avoid a value import). */
type Icon = 'refresh' | 'upload' | 'check' | 'warning' | 'chevron-right';

/** One push/deploy entry on the status board. */
interface Deploy {
  readonly id: string;
  readonly title: string;
  readonly meta: string;
  readonly status: DeployStatus;
  readonly stages: readonly Stage[];
  readonly progress: number;
  readonly detail?: string;
}

/** The side of a 3-way conflict a hunk can be resolved to. */
type MergeSide = 'ours' | 'base' | 'theirs';

/** One conflicting region with its three candidate texts. */
interface Hunk {
  readonly id: string;
  readonly title: string;
  readonly ours: string;
  readonly base: string;
  readonly theirs: string;
}

/** Status → `cp-status`/`cp-banner` tone. Colour is one of several cues only. */
const statusTone: Readonly<Record<DeployStatus, Tone>> = {
  queued: 'info',
  pushing: 'info',
  retrying: 'warning',
  deploying: 'info',
  ok: 'success',
  failed: 'danger',
};

/** Status → human label rendered next to the dot + shape. */
const statusLabel: Readonly<Record<DeployStatus, string>> = {
  queued: 'в очереди',
  pushing: 'пушится',
  retrying: 'повтор',
  deploying: 'деплой',
  ok: 'опубликовано',
  failed: 'сбой',
};

/** Status → leading icon-circle shape (redundant with the tone). */
const statusIcon: Readonly<Record<DeployStatus, Icon>> = {
  queued: 'chevron-right',
  pushing: 'upload',
  retrying: 'refresh',
  deploying: 'upload',
  ok: 'check',
  failed: 'warning',
};

/** Column headers for the 3-way merge, in reading order. */
const sideLabel: Readonly<Record<MergeSide, string>> = {
  ours: 'Ваша версия',
  base: 'База · общий предок',
  theirs: 'Удалённая · chief',
};

/** Representative board content for the local shell preview. */
const deploys: readonly Deploy[] = [
  {
    id: 'd-deploying',
    title: 'develop · «Иллюзия социализма…» (ru)',
    meta: 'andswew · только что · шаг 3 из 4 — сборка',
    status: 'deploying',
    stages: [
      { label: 'коммит', state: 'done' },
      { label: 'пуш', state: 'done' },
      { label: 'деплой', state: 'running' },
      { label: 'индексация', state: 'pending' },
    ],
    progress: 0.58,
  },
  {
    id: 'd-pushing',
    title: 'develop · Публикация журнала №17 (обложка)',
    meta: 'andswew · только что · отправка изменений',
    status: 'pushing',
    stages: [
      { label: 'коммит', state: 'done' },
      { label: 'пуш', state: 'running' },
      { label: 'деплой', state: 'pending' },
      { label: 'индексация', state: 'pending' },
    ],
    progress: 0.32,
  },
  {
    id: 'd-retrying',
    title: 'develop · Правки «К вопросу о партии» (ru)',
    meta: 'andswew · 2 минуты назад · сеть недоступна, повтор через 0:06',
    status: 'retrying',
    stages: [
      { label: 'коммит', state: 'done' },
      { label: 'пуш', state: 'running' },
      { label: 'деплой', state: 'pending' },
      { label: 'индексация', state: 'pending' },
    ],
    progress: 0.34,
  },
  {
    id: 'd-queued',
    title: 'develop · Правки «Профсоюзы новой волны» (ru)',
    meta: 'newcomer · только что · ждёт своей очереди на пуш',
    status: 'queued',
    stages: [
      { label: 'коммит', state: 'done' },
      { label: 'пуш', state: 'pending' },
      { label: 'деплой', state: 'pending' },
      { label: 'индексация', state: 'pending' },
    ],
    progress: 0.15,
  },
  {
    id: 'd-ok',
    title: 'master · Публикация журнала №17',
    meta: 'chief · 12 минут назад · 4 из 4 · заняло 2м 41с',
    status: 'ok',
    stages: [
      { label: 'коммит', state: 'done' },
      { label: 'пуш', state: 'done' },
      { label: 'деплой', state: 'done' },
      { label: 'индексация', state: 'done' },
    ],
    progress: 1,
  },
  {
    id: 'd-failed',
    title: 'develop · Переиндексация (ru)',
    meta: 'система · 1 час назад · упал на шаге 4 — индексация',
    status: 'failed',
    stages: [
      { label: 'коммит', state: 'done' },
      { label: 'пуш', state: 'done' },
      { label: 'деплой', state: 'done' },
      { label: 'индексация', state: 'failed' },
    ],
    progress: 0.8,
    detail:
      'Reindex ru упал: Vectorize вернул getByIds → 1101. Публикация не затронута — статья уже на сайте, обновится только поиск. Деплой и переиндексация — разные статусы, поэтому красный шаг не отменяет публикацию.',
  },
];

/** The conflict opened for the visual 3-way merge (safe, explicit resolution). */
const hunks: readonly Hunk[] = [
  {
    id: 'h1',
    title: 'Конфликт 1 — абзац',
    ours: '«Накопление богатства на одном полюсе есть накопление нищеты и деградации на противоположном».',
    base: '«Накопление богатства на одном полюсе есть накопление нищеты на противоположном».',
    theirs:
      '«Накопление богатства на одном полюсе есть в то же время накопление нищеты, муки труда и рабства».',
  },
  {
    id: 'h2',
    title: 'Конфликт 2 — сноска',
    ours: '[^24]: Маркс, «Капитал», т. I, гл. XXIII.',
    base: '[^24]: Маркс, «Капитал», т. I.',
    theirs: '[^24]: К. Маркс. Капитал. Том I, глава 23.',
  },
  {
    id: 'h3',
    title: 'Конфликт 3 — заголовок',
    ours: '## Классовая динамика',
    base: '## Классы',
    theirs: '## Динамика классов',
  },
];

/** Ordered sides so a hunk's three columns render deterministically. */
const sides: readonly MergeSide[] = ['ours', 'base', 'theirs'];

@customElement('screen-deploys')
export class ScreenDeploys extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    .head {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-lg);
    }
    .eyebrow {
      flex-basis: 100%;
      margin: 0;
      font-size: 0.8rem;
      color: var(--color-text-secondary);
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

    section {
      margin-top: var(--spacing-xl);
    }
    .section-label {
      display: flex;
      flex-wrap: wrap;
      align-items: baseline;
      gap: var(--spacing-xs) var(--spacing-sm);
      margin: 0 0 var(--spacing-sm);
    }
    .section-label h2 {
      font-size: 1.2rem;
      font-weight: 700;
      margin: 0;
    }
    .hint {
      margin: 0;
      max-width: 64ch;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: var(--spacing-sm);
    }

    .body {
      display: grid;
      gap: var(--spacing-sm);
      width: 100%;
    }
    .stage-line {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-xs) var(--spacing-sm);
    }
    cp-steps {
      flex: 1 1 18rem;
      min-width: 12rem;
    }
    .progress {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }
    cp-progress {
      flex: 1 1 auto;
    }
    .pct {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: var(--color-text-secondary);
      font-variant-numeric: tabular-nums;
      flex: none;
    }
    .actions {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-xs);
    }

    .detail {
      margin: var(--spacing-xs) 0 0;
      padding: var(--spacing-sm);
      border-radius: var(--radius-sm);
      background: var(--color-surface);
      border: 1px solid var(--color-hairline);
      font-size: 0.85rem;
      color: var(--color-text-secondary);
      line-height: 1.5;
    }

    /* ---- 3-way merge ---- */
    .merge-hint {
      margin: 0 0 var(--spacing-md);
    }
    .hunk {
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      overflow: hidden;
      background: var(--color-surface-elevated);
    }
    .hunk.resolved {
      border-color: var(--ok);
    }
    .hunk-head {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-xs) var(--spacing-sm);
      padding: var(--spacing-xs) var(--spacing-sm);
      background: var(--color-surface);
      border-bottom: 1px solid var(--color-hairline);
      font-size: 0.78rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      color: var(--color-text-secondary);
    }
    .hunk-head .grow {
      margin-inline-start: auto;
      text-transform: none;
      letter-spacing: 0;
    }
    .cols {
      display: grid;
      grid-template-columns: 1fr;
    }
    @media (min-width: 768px) {
      .cols {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }
    }
    .col {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
      padding: var(--spacing-sm);
      border-top: 1px solid var(--color-hairline);
    }
    @media (min-width: 768px) {
      .col {
        border-top: none;
      }
      .col + .col {
        border-inline-start: 1px solid var(--color-hairline);
      }
    }
    .col.ours {
      background: var(--info-bg);
    }
    .col.theirs {
      background: var(--draft-bg);
    }
    .col.chosen {
      outline: 2px solid var(--ok);
      outline-offset: -2px;
    }
    .col-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-xs);
    }
    .col-name {
      font-size: 0.74rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
      color: var(--color-text-secondary);
    }
    .col-text {
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.5;
    }
    .col.base .col-text {
      font-family: var(--font-mono);
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }
    .take {
      margin-top: auto;
    }

    .merge-bar {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-md);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--color-border);
    }
    .merge-bar .grow {
      margin-inline-start: auto;
    }
    .note {
      margin: 0;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }
  `;

  /** Per-hunk chosen side; a missing key means the hunk is still unresolved. */
  @state() private chosen: Readonly<Record<string, MergeSide>> = {};

  /** Ids of failed deploys whose detail panel is expanded. */
  @state() private openDetails: ReadonlySet<string> = new Set();

  /** Ids of deploys whose retry the operator has already triggered. */
  @state() private retried: ReadonlySet<string> = new Set();

  /** Whether the merged result has been committed. */
  @state() private committed = false;

  private choose(hunkId: string, side: MergeSide): void {
    this.chosen = { ...this.chosen, [hunkId]: side };
  }

  private toggleDetails(id: string): void {
    const next = new Set(this.openDetails);
    next.has(id) ? next.delete(id) : next.add(id);
    this.openDetails = next;
  }

  private retry(id: string): void {
    this.retried = new Set(this.retried).add(id);
  }

  private commitMerge(): void {
    this.committed = true;
  }

  private get resolvedCount(): number {
    return hunks.filter((hunk) => this.chosen[hunk.id] !== undefined).length;
  }

  private get allResolved(): boolean {
    return this.resolvedCount === hunks.length;
  }

  private renderDeploy(deploy: Deploy) {
    const tone = statusTone[deploy.status];
    const failed = deploy.status === 'failed';
    const isRetried = this.retried.has(deploy.id);
    const open = this.openDetails.has(deploy.id);
    return html`
      <li>
        <cp-list-row icon=${statusIcon[deploy.status]} title=${deploy.title} meta=${deploy.meta}>
          <div class="body" slot="content">
            <cp-steps .steps=${deploy.stages}></cp-steps>
            <div class="progress">
              <cp-progress
                .value=${deploy.progress}
                label=${`Прогресс: ${deploy.title}`}
              ></cp-progress>
              <span class="pct">${Math.round(deploy.progress * 100)}%</span>
            </div>
          </div>
          <cp-status
            slot="actions"
            state=${tone}
            label=${statusLabel[deploy.status]}
          ></cp-status>
        </cp-list-row>
        ${failed
          ? html`
              <cp-banner tone="danger" title="Индексация не обновлена" style="margin-top:var(--spacing-xs)">
                ${isRetried
                  ? 'Повтор запущен — переиндексация ru отправлена заново. Локальные правки в безопасности.'
                  : 'Публикация прошла, но поиск не переиндексирован. Правки не потеряны — можно повторить только упавший шаг.'}
                <span class="actions" slot="action">
                  <cp-button
                    variant="secondary"
                    size="sm"
                    ?disabled=${isRetried}
                    @click=${() => this.retry(deploy.id)}
                  >
                    <cp-icon name="refresh" size="16"></cp-icon>
                    ${isRetried ? 'Повтор идёт' : 'Повторить'}
                  </cp-button>
                  <cp-button
                    variant="ghost"
                    size="sm"
                    aria-expanded=${open ? 'true' : 'false'}
                    @click=${() => this.toggleDetails(deploy.id)}
                  >
                    Детали
                  </cp-button>
                </span>
              </cp-banner>
              ${open && deploy.detail !== undefined
                ? html`<p class="detail">${deploy.detail}</p>`
                : nothing}
            `
          : nothing}
      </li>
    `;
  }

  private renderColumn(hunk: Hunk, side: MergeSide) {
    const text = side === 'ours' ? hunk.ours : side === 'base' ? hunk.base : hunk.theirs;
    const isChosen = this.chosen[hunk.id] === side;
    return html`
      <article class="col ${side} ${isChosen ? 'chosen' : ''}">
        <header class="col-head">
          <span class="col-name">${sideLabel[side]}</span>
          ${isChosen ? html`<cp-tag tone="success">выбрано</cp-tag>` : nothing}
        </header>
        <p class="col-text">${text}</p>
        <cp-button
          class="take"
          variant="secondary"
          size="sm"
          ?pressed=${isChosen}
          aria-label=${`Оставить: ${sideLabel[side]} — ${hunk.title}`}
          @click=${() => this.choose(hunk.id, side)}
        >
          ${isChosen ? 'Оставлено' : 'Оставить'}
        </cp-button>
      </article>
    `;
  }

  private renderHunk(hunk: Hunk) {
    const chosenSide = this.chosen[hunk.id];
    const resolved = chosenSide !== undefined;
    return html`
      <li class="hunk ${resolved ? 'resolved' : ''}">
        <header class="hunk-head">
          <cp-icon name=${resolved ? 'check' : 'warning'} size="16"></cp-icon>
          <span>${hunk.title}</span>
          <span class="grow">
            ${resolved
              ? html`<cp-status
                  state="success"
                  label=${`оставлена: ${sideLabel[chosenSide]}`}
                ></cp-status>`
              : html`<cp-status state="warning" label="не выбрано"></cp-status>`}
          </span>
        </header>
        <div class="cols">${sides.map((side) => this.renderColumn(hunk, side))}</div>
      </li>
    `;
  }

  private renderMerge() {
    return html`
      <section aria-labelledby="merge-title">
        <div class="section-label">
          <h2 id="merge-title">Разрешение конфликта</h2>
          <span class="hint" style="font-family:var(--font-mono)">
            blog/illuziya-socializma…/index.ru.md
          </span>
        </div>
        <p class="hint merge-hint">
          chief изменил те же строки, пока правки ждали пуша. Ничего не потеряно и ничего не
          выбрано за вас — по каждому месту оставьте нужную версию. Слияние заблокировано, пока
          выбор не сделан для всех мест.
        </p>

        <ul>${hunks.map((hunk) => this.renderHunk(hunk))}</ul>

        ${this.committed
          ? html`<cp-banner tone="success" title="Объединённое зафиксировано" style="margin-top:var(--spacing-md)">
              Слияние собрано из выбранных версий и поставлено в очередь на пуш develop.
            </cp-banner>`
          : nothing}

        <div class="merge-bar">
          <cp-progress
            .value=${this.resolvedCount / hunks.length}
            label="Разрешено конфликтов"
            style="max-width:12rem"
          ></cp-progress>
          <span class="note">${this.resolvedCount} из ${hunks.length} разрешено</span>
          <span class="grow"></span>
          <span class="note">
            ${this.allResolved
              ? 'Все места выбраны — можно фиксировать.'
              : 'Выберите версию в оставшихся местах.'}
          </span>
          <cp-button
            arrow
            ?disabled=${!this.allResolved || this.committed}
            @click=${() => this.commitMerge()}
          >
            Зафиксировать объединённое
          </cp-button>
        </div>
      </section>
    `;
  }

  override render() {
    return html`
      <div class="head">
        <p class="eyebrow">Публикации · пуш, деплой и переиндексация</p>
        <h1 tabindex="-1">Деплои</h1>
      </div>

      <section aria-labelledby="board-title">
        <div class="section-label">
          <h2 id="board-title">Статус пушей и деплоев</h2>
          <p class="hint">
            Публикация ≠ индекс: статья может быть на сайте, пока поиск обновляется отдельно.
            Красный шаг индексации не отменяет успешный деплой.
          </p>
        </div>
        <ul>${deploys.map((deploy) => this.renderDeploy(deploy))}</ul>
      </section>

      ${this.renderMerge()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'screen-deploys': ScreenDeploys;
  }
}
