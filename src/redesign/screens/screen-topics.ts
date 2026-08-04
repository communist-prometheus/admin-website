import { LitElement, html, css, nothing } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { CpTab } from '@communist-prometheus/cp-components';
import '@communist-prometheus/cp-components';
import { readTopics, type Topic } from '../engine/content.js';
import { onEngineReady } from '../engine/engine-ready.js';
import { classifyEmpty } from '../engine/load-state.js';

/**
 * The seven publication languages, expressed as the keys used inside a topic's
 * `name` map (`settings/topics.json`). Bulgarian is stored as `bl` and Ukrainian
 * as `uk` — the tab labels below humanise them to BG/UK.
 */
type LangCode = 'ru' | 'en' | 'it' | 'es' | 'bl' | 'pl' | 'uk';

/** Language segments for the per-topic `cp-tabs` strip (label ≠ name-map key). */
const LANGUAGES: readonly CpTab[] = [
  { id: 'ru', label: 'RU' },
  { id: 'en', label: 'EN' },
  { id: 'it', label: 'IT' },
  { id: 'es', label: 'ES' },
  { id: 'bl', label: 'BG' },
  { id: 'pl', label: 'PL' },
  { id: 'uk', label: 'UK' },
];

/** The set of valid language keys, for narrowing an arbitrary tab id. */
const LANG_CODES: ReadonlySet<string> = new Set(LANGUAGES.map((tab) => tab.id));

/** Narrows an arbitrary tab id to a known {@link LangCode}. */
const isLangCode = (value: string): value is LangCode => LANG_CODES.has(value);

/**
 * Topics screen (settings spec: the "Темы" subpanel). When the real content
 * engine is running (local `dev:token`), it reads the repo's
 * `settings/topics.json` and lists the ACTUAL topics — colour, per-language name
 * and stable key — proving live data end-to-end; a `cp-tag` badge reports
 * whether the data is live or a demo fallback. Each topic renders a colour-left
 * `article` with a swatch, the name for the currently selected language, editable
 * name/note/description fields seeded from that language, and a live `cp-pill`
 * previewing the on-site plaque in the topic's colour. A `cp-tabs` strip switches
 * the active language (tracked in local `@state`). Theme tokens inherit from
 * `:root` through the shadow boundary; no ad-hoc chrome, tokens only.
 */
@customElement('screen-topics')
export class ScreenTopics extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--font-sans);
      color: var(--color-text-primary);
      line-height: 1.6;
    }

    .head {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
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

    .eyebrow {
      flex-basis: 100%;
      margin: 0;
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }

    .intro {
      max-width: 64ch;
      margin: 0 0 var(--spacing-lg);
      color: var(--color-text-secondary);
    }

    .tabs-scroll {
      overflow-x: auto;
      max-width: 100%;
      margin-bottom: var(--spacing-lg);
    }

    .list {
      display: grid;
      gap: var(--spacing-lg);
    }

    .topic {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
      padding: var(--spacing-lg);
      background: var(--color-surface);
      border: 1px solid var(--color-hairline);
      border-inline-start: 4px solid var(--tc, var(--color-accent));
      border-radius: var(--radius-md);
    }

    .thead {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }

    .swatch {
      inline-size: 1.5rem;
      block-size: 1.5rem;
      flex: none;
      background: var(--tc, var(--color-accent));
      border: 1px solid var(--color-hairline);
      border-radius: var(--radius-sm);
    }

    .name {
      margin: 0;
      margin-right: auto;
      font-size: 1.1rem;
      font-weight: 700;
    }

    .key {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }

    .fields {
      margin: 0;
      display: grid;
      gap: var(--spacing-sm);
    }

    .field {
      display: grid;
      gap: 0.15rem;
    }

    .field dt {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--color-text-secondary);
    }

    .field dd {
      margin: 0;
      font-size: 1rem;
    }

    .missing {
      color: var(--color-text-secondary);
      font-style: italic;
    }

    cp-banner {
      display: block;
      margin-bottom: var(--spacing-lg);
    }

    .preview {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      flex-wrap: wrap;
      padding-top: var(--spacing-xs);
      border-top: 1px dashed var(--color-hairline);
    }

    .preview-label {
      font-size: 0.8rem;
      font-weight: 600;
      color: var(--color-text-secondary);
    }

    .note {
      margin: var(--spacing-md) 0 0;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }
  `;

  /** Topics read from the repo; empty until loaded (or if the engine is off). */
  @state() private topics: readonly Topic[] = [];

  /** Whether the real read has completed. */
  @state() private loaded = false;

  /** Currently edited language; drives which localised name the fields show. */
  @state() private activeLang: LangCode = 'ru';

  /** Unsubscribes the engine-ready listener on disconnect. */
  private disposeReady: () => void = () => {};

  override connectedCallback(): void {
    super.connectedCallback();
    void this.load();
    // Re-read when the engine finishes booting (first-load race, QA #12).
    this.disposeReady = onEngineReady(() => void this.load());
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    this.disposeReady();
  }

  private async load(): Promise<void> {
    const topics = await readTopics();
    this.topics = topics;
    this.loaded = true;
  }

  private readonly onLangChange = (event: CustomEvent<{ readonly id: string }>): void => {
    if (isLangCode(event.detail.id)) {
      this.activeLang = event.detail.id;
    }
  };

  private renderTopic(topic: Topic) {
    const lang = this.activeLang;
    const name = topic.name[lang] ?? '';
    const hasName = name !== '';
    return html`
      <article class="topic" style="--tc:${topic.color}">
        <div class="thead">
          <span class="swatch" aria-hidden="true"></span>
          <h2 class="name">${hasName ? name : topic.key}</h2>
          <span class="key">${topic.key}</span>
          <span class="key" aria-hidden="true">${topic.color}</span>
        </div>

        <dl class="fields">
          <div class="field">
            <dt>Название · ${lang}</dt>
            <dd>${hasName ? name : html`<span class="missing">нет перевода</span>`}</dd>
          </div>
        </dl>

        <div class="preview">
          <span class="preview-label">Плашка на сайте:</span>
          <cp-pill style="--tc:${topic.color}">${hasName ? name : topic.key}</cp-pill>
        </div>
      </article>
    `;
  }

  override render() {
    const live = this.topics.length > 0;
    return html`
      <header class="head">
        <p class="eyebrow">Настройки · оформление статей</p>
        <h1 tabindex="-1">Темы</h1>
      </header>
      <p class="intro">
        Темы группируют статьи цветной плашкой. Название задаётся для каждого из 7 языков в
        settings/topics.json.
      </p>

      ${live
        ? html`
            <cp-banner tone="info" title="Просмотр без редактирования">
              Темы пока правятся в settings/topics.json. Здесь — что сейчас в репозитории:
              ключ, цвет и название на выбранном языке.
            </cp-banner>

            <div class="tabs-scroll">
              <cp-tabs
                .tabs=${LANGUAGES}
                active=${this.activeLang}
                @cp-tab-change=${this.onLangChange}
              ></cp-tabs>
            </div>

            <div class="list">${this.topics.map((topic) => this.renderTopic(topic))}</div>

            <p class="note">
              Прочитано из settings/topics.json — ${this.topics.length}
              ${this.topics.length === 1 ? 'тема' : 'тем'} реального репозитория.
            </p>
          `
        : html`<p class="note">
            ${classifyEmpty(this.loaded) === 'loading'
              ? 'Загружаем темы…'
              : classifyEmpty(this.loaded) === 'signed-out'
                ? 'Войдите через GitHub, чтобы увидеть темы из settings/topics.json.'
                : 'Тем пока нет или не удалось их загрузить.'}
          </p>`}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'screen-topics': ScreenTopics;
  }
}
