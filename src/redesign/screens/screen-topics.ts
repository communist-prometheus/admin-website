import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@communist-prometheus/cp-components';
import { readTopicsViaApi, saveTopicsViaApi, type Topic } from '../engine/settings-io.js';
import { publishTarget } from '../engine/publish-target.js';
import { TAXONOMY_LANGS, taxonomyStyles } from './taxonomy-shared.js';
import { emptyTopic, withColor, withKey, withText, withoutAt } from './taxonomy-draft.js';

/**
 * The topics screen: the coloured editorial plaque an article can carry
 * (`topic` in its frontmatter, defined in `settings/topics.json`).
 *
 * It used to read through the Service Worker git engine, which needs a full
 * repository clone, and so could sit on its loading placeholder indefinitely while
 * every other screen in this UI read happily over the GitHub API. It now reads
 * — and writes — over that same API, so topics can actually be created and
 * edited here instead of by hand on GitHub.
 */
@customElement('screen-topics')
export class ScreenTopics extends LitElement {
  static override styles = [
    taxonomyStyles,
    css`
      .preview {
        flex: 0 0 auto;
        padding: 0.15rem 0.6rem;
        border-radius: 999px;
        font-size: 0.8rem;
        font-weight: 600;
        color: #fff;
      }
    `,
  ];

  @state() private draft: readonly Topic[] = [];
  @state() private loading = true;
  @state() private busy = false;
  @state() private error = '';
  @state() private message = '';
  @state() private activeLang = 'ru';

  override connectedCallback(): void {
    super.connectedCallback();
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      this.draft = await readTopicsViaApi();
    } catch (e) {
      this.error = e instanceof Error ? e.message : String(e);
    }
    this.loading = false;
  }

  private readonly add = (): void => {
    this.draft = [...this.draft, emptyTopic()];
    this.message = '';
  };

  private readonly removeAt = (index: number): void => {
    this.draft = withoutAt(this.draft, index);
    this.message = '';
  };

  private readonly updateKey = (index: number, value: string): void => {
    this.draft = withKey(this.draft, index, value);
    this.message = '';
  };

  private readonly updateColor = (index: number, value: string): void => {
    this.draft = withColor(this.draft, index, value);
    this.message = '';
  };

  private readonly updateText = (
    index: number,
    field: 'name' | 'subtitle',
    lang: string,
    value: string,
  ): void => {
    this.draft = withText(this.draft, index, field, lang, value);
    this.message = '';
  };

  private readonly save = async (): Promise<void> => {
    this.busy = true;
    this.error = '';
    this.message = '';
    const result = await saveTopicsViaApi(this.draft);
    this.busy = false;
    if (result.ok) this.message = `Сохранено в ${publishTarget().site}.`;
    else this.error = result.error ?? 'Не удалось сохранить.';
  };

  /** Reads a value out of a component's input/change event. */
  private onInput(event: Event, apply: (value: string) => void): void {
    if (!(event instanceof CustomEvent)) return;
    const value: unknown = event.detail?.value;
    if (typeof value === 'string') apply(value);
  }

  private renderRow(topic: Topic, index: number): TemplateResult {
    const name = topic.name[this.activeLang] ?? '';
    return html`
      <li class="row">
        <input
          class="swatch"
          type="color"
          aria-label="Цвет темы"
          .value=${topic.color}
          @input=${(e: Event) => {
            const target = e.target;
            if (target instanceof HTMLInputElement) this.updateColor(index, target.value);
          }}
        />
        <cp-input
          label="Ключ"
          .value=${topic.key}
          placeholder="editorial"
          @cp-input=${(e: Event) => this.onInput(e, (v) => this.updateKey(index, v))}
          @cp-change=${(e: Event) => this.onInput(e, (v) => this.updateKey(index, v))}
        ></cp-input>
        <cp-input
          label=${`Название (${this.activeLang})`}
          .value=${name}
          @cp-input=${(e: Event) => this.onInput(e, (v) => this.updateText(index, 'name', this.activeLang, v))}
          @cp-change=${(e: Event) => this.onInput(e, (v) => this.updateText(index, 'name', this.activeLang, v))}
        ></cp-input>
        <cp-input
          label=${`Приписка (${this.activeLang})`}
          .value=${topic.subtitle?.[this.activeLang] ?? ''}
          @cp-input=${(e: Event) =>
            this.onInput(e, (v) => this.updateText(index, 'subtitle', this.activeLang, v))}
          @cp-change=${(e: Event) =>
            this.onInput(e, (v) => this.updateText(index, 'subtitle', this.activeLang, v))}
        ></cp-input>
        <span class="preview" style=${`background:${topic.color}`}>${name || topic.key || '—'}</span>
        <cp-button variant="ghost" size="sm" @cp-click=${() => this.removeAt(index)}>Удалить</cp-button>
      </li>
    `;
  }

  override render(): TemplateResult {
    return html`
      <p class="eyebrow">Настройки · оформление статей</p>
      <h1>Темы</h1>
      <p class="lede">
        Тема группирует статьи цветной плашкой на странице материала и на карточке. Ключ хранится в
        поле <code>topic</code> материала, а цвет и названия по языкам — здесь.
      </p>
      ${this.loading
        ? html`<p class="msg">Загружаем темы…</p>`
        : html`
            <cp-tabs
              .tabs=${TAXONOMY_LANGS}
              active=${this.activeLang}
              @cp-tab-change=${(e: Event) => {
                if (e instanceof CustomEvent && typeof e.detail?.id === 'string')
                  this.activeLang = e.detail.id;
              }}
            ></cp-tabs>
            ${this.draft.length === 0
              ? html`<p class="msg">Тем пока нет — добавьте первую.</p>`
              : html`<ul class="rows">
                  ${this.draft.map((topic, index) => this.renderRow(topic, index))}
                </ul>`}
            <div class="actions">
              <cp-button variant="secondary" size="sm" @cp-click=${this.add}>+ тема</cp-button>
              <cp-button size="sm" arrow ?disabled=${this.busy} @cp-click=${() => void this.save()}>
                ${this.busy ? 'Сохраняем…' : `Сохранить в ${publishTarget().site}`}
              </cp-button>
            </div>
          `}
      ${this.error !== '' ? html`<p class="msg error">${this.error}</p>` : nothing}
      ${this.message !== '' ? html`<p class="msg">${this.message}</p>` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'screen-topics': ScreenTopics;
  }
}
