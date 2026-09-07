import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@communist-prometheus/cp-components';
import { readLabelsViaApi, saveLabelsViaApi, type Label } from '../engine/settings-io.js';
import { publishTarget } from '../engine/publish-target.js';
import { TAXONOMY_LANGS, taxonomyStyles } from './taxonomy-shared.js';
import { emptyLabel, withKey, withText, withoutAt } from './taxonomy-draft.js';

/**
 * The categories (rubrics) screen — the taxonomy that had no editor at all, so
 * a rubric could only be created by hand-editing `settings/labels.json` on
 * GitHub. A category is the key an article's `category` frontmatter carries;
 * the site turns it into display text through this file, per language.
 *
 * Reads and writes over the GitHub API, like every other screen in this UI.
 */
@customElement('screen-categories')
export class ScreenCategories extends LitElement {
  static override styles = taxonomyStyles;

  @state() private draft: readonly Label[] = [];
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
      this.draft = await readLabelsViaApi();
    } catch (e) {
      this.error = e instanceof Error ? e.message : String(e);
    }
    this.loading = false;
  }

  private readonly add = (): void => {
    this.draft = [...this.draft, emptyLabel()];
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

  private readonly updateText = (index: number, lang: string, value: string): void => {
    this.draft = withText(this.draft, index, 'translations', lang, value);
    this.message = '';
  };

  private readonly save = async (): Promise<void> => {
    this.busy = true;
    this.error = '';
    this.message = '';
    const result = await saveLabelsViaApi(this.draft);
    this.busy = false;
    if (result.ok) this.message = `Сохранено в ${publishTarget().site}.`;
    else this.error = result.error ?? 'Не удалось сохранить.';
  };

  private renderRow(label: Label, index: number): TemplateResult {
    return html`
      <li class="row">
        <cp-input
          label="Ключ"
          .value=${label.key}
          placeholder="programme"
          @cp-input=${(e: Event) => this.onInput(e, (v) => this.updateKey(index, v))}
          @cp-change=${(e: Event) => this.onInput(e, (v) => this.updateKey(index, v))}
        ></cp-input>
        <cp-input
          label=${`Название (${this.activeLang})`}
          .value=${label.translations[this.activeLang] ?? ''}
          @cp-input=${(e: Event) => this.onInput(e, (v) => this.updateText(index, this.activeLang, v))}
          @cp-change=${(e: Event) => this.onInput(e, (v) => this.updateText(index, this.activeLang, v))}
        ></cp-input>
        <cp-button variant="ghost" size="sm" @cp-click=${() => this.removeAt(index)}>Удалить</cp-button>
      </li>
    `;
  }

  /** Reads a value out of a component's input/change event. */
  private onInput(event: Event, apply: (value: string) => void): void {
    if (!(event instanceof CustomEvent)) return;
    const value: unknown = event.detail?.value;
    if (typeof value === 'string') apply(value);
  }

  override render(): TemplateResult {
    return html`
      <p class="eyebrow">Настройки · рубрики статей</p>
      <h1>Рубрики</h1>
      <p class="lede">
        Рубрика — то, что стоит в поле «Рубрика» у материала (<code>category</code>) и что читатель
        видит на карточке и в фильтре блога. Здесь задаются ключ и название на каждом языке.
      </p>
      ${this.loading
        ? html`<p class="msg">Загружаем рубрики…</p>`
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
              ? html`<p class="msg">Рубрик пока нет — добавьте первую.</p>`
              : html`<ul class="rows">
                  ${this.draft.map((label, index) => this.renderRow(label, index))}
                </ul>`}
            <div class="actions">
              <cp-button variant="secondary" size="sm" @cp-click=${this.add}>+ рубрика</cp-button>
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
    'screen-categories': ScreenCategories;
  }
}
