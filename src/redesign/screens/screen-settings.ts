import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@communist-prometheus/cp-components';
import {
  readLanguagesViaApi,
  readLinksViaApi,
  saveLanguagesViaApi,
  saveLinksViaApi,
  type LinkEntry,
  type SiteLanguageEntry,
} from '../engine/site-settings-io.js';
import { TESTID } from '../testids.js';

/**
 * Site settings: the languages the site publishes in, and the curated links
 * directory.
 *
 * Both were editable only in the client that is no longer served — this
 * screen used to show the languages behind a "просмотр без редактирования"
 * banner and offered no links surface at all. Retiring that client without
 * this would have taken two working capabilities away from editors.
 *
 * Each section is its own document and its own save: a broken links file
 * must not block fixing a language, and vice versa.
 */
@customElement('screen-settings')
export class ScreenSettings extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }

    h1 {
      font-size: clamp(1.9rem, 7vw, 2.6rem);
      line-height: 1.15;
      font-weight: 700;
      margin: 0 0 var(--spacing-xs);
      background: linear-gradient(135deg, var(--color-accent), var(--color-text-primary));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    .eyebrow {
      margin: 0 0 var(--spacing-md);
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }

    section {
      display: grid;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-xl);
    }

    h2 {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
    }

    .hint {
      margin: 0;
      font-size: 0.9rem;
      color: var(--color-text-secondary);
      max-width: 62ch;
    }

    .rows {
      display: grid;
      gap: var(--spacing-xs);
      margin: 0;
      padding: 0;
      list-style: none;
    }

    .lang-row,
    .link-row {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-xs);
      align-items: end;
      padding: var(--spacing-sm);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
    }

    .grow {
      flex: 1 1 14rem;
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
      align-items: center;
    }

    .ring {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }

    .bad {
      margin: 0;
      font-size: 0.85rem;
      color: var(--color-danger, #c0392b);
    }

    .ok {
      margin: 0;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }
  `;

  /** The languages document being edited. */
  @state() private langDraft: SiteLanguageEntry[] = [];
  @state() private langError = '';
  @state() private langNote = '';
  @state() private langBusy = false;
  @state() private langLoaded = false;

  /** The links document being edited, kept as its two parts. */
  @state() private linkGroups: string[] = [];
  @state() private linkDraft: LinkEntry[] = [];
  @state() private linkError = '';
  @state() private linkNote = '';
  @state() private linkBusy = false;
  @state() private linkLoaded = false;

  override connectedCallback(): void {
    super.connectedCallback();
    void this.loadLanguages();
    void this.loadLinks();
  }

  private async loadLanguages(): Promise<void> {
    try {
      this.langDraft = [...(await readLanguagesViaApi())];
      this.langError = '';
    } catch (e) {
      this.langError = e instanceof Error ? e.message : 'Не удалось прочитать языки.';
    }
    this.langLoaded = true;
  }

  private async loadLinks(): Promise<void> {
    try {
      const doc = await readLinksViaApi();
      this.linkGroups = [...doc.groups];
      this.linkDraft = [...doc.entries];
      this.linkError = '';
    } catch (e) {
      this.linkError = e instanceof Error ? e.message : 'Не удалось прочитать ссылки.';
    }
    this.linkLoaded = true;
  }

  private readonly addLanguage = (): void => {
    this.langDraft = [...this.langDraft, { code: '', label: '' }];
  };

  private readonly addLink = (): void => {
    this.linkDraft = [
      ...this.linkDraft,
      {
        url: '',
        name: '',
        category: this.sections[0] ?? '',
        inRing: false,
        descriptions: {},
      },
    ];
  };

  private patchLang(index: number, patch: Partial<SiteLanguageEntry>): void {
    this.langDraft = this.langDraft.map((entry, i) =>
      i === index ? { ...entry, ...patch } : entry,
    );
  }

  private patchLink(index: number, patch: Partial<LinkEntry>): void {
    this.linkDraft = this.linkDraft.map((entry, i) =>
      i === index ? { ...entry, ...patch } : entry,
    );
  }

  private readonly saveLanguages = async (): Promise<void> => {
    if (this.langBusy) return;
    this.langBusy = true;
    this.langError = '';
    this.langNote = '';
    const result = await saveLanguagesViaApi(this.langDraft);
    this.langBusy = false;
    if (result.ok) this.langNote = 'Языки сохранены.';
    else this.langError = result.error ?? 'Не удалось сохранить языки.';
  };

  /** Sections offered as suggestions: the declared ones plus any in use. */
  private get sections(): readonly string[] {
    return [
      ...new Set([...this.linkGroups, ...this.linkDraft.map((e) => e.category)].filter((g) => g !== '')),
    ];
  }

  private readonly saveLinks = async (): Promise<void> => {
    if (this.linkBusy) return;
    this.linkBusy = true;
    this.linkError = '';
    this.linkNote = '';
    const result = await saveLinksViaApi({
      groups: this.linkGroups,
      entries: this.linkDraft,
    });
    this.linkBusy = false;
    if (result.ok) this.linkNote = 'Ссылки сохранены.';
    else this.linkError = result.error ?? 'Не удалось сохранить ссылки.';
  };

  /** Reads the `value` off a `cp-input` event without assuming its shape. */
  private static value(event: Event): string {
    if (!(event instanceof CustomEvent)) return '';
    const raw: unknown = event.detail?.value;
    return typeof raw === 'string' ? raw : '';
  }

  private renderLanguageRow(entry: SiteLanguageEntry, index: number): TemplateResult {
    return html`
      <li class="lang-row">
        <cp-input
          label="Код"
          .value=${entry.code}
          placeholder="ru"
          @cp-input=${(e: Event) => this.patchLang(index, { code: ScreenSettings.value(e) })}
        ></cp-input>
        <cp-input
          class="grow"
          label="Название"
          .value=${entry.label}
          placeholder="Русский"
          @cp-input=${(e: Event) => this.patchLang(index, { label: ScreenSettings.value(e) })}
        ></cp-input>
        <cp-button
          variant="ghost"
          size="sm"
          @cp-click=${() => {
            this.langDraft = this.langDraft.filter((_, i) => i !== index);
          }}
          >Удалить</cp-button
        >
      </li>
    `;
  }

  private renderLinkRow(entry: LinkEntry, index: number): TemplateResult {
    return html`
      <li class="link-row">
        <cp-input
          class="grow"
          label="Адрес"
          .value=${entry.url}
          placeholder="https://example.org"
          @cp-input=${(e: Event) => this.patchLink(index, { url: ScreenSettings.value(e) })}
        ></cp-input>
        <cp-input
          class="grow"
          label="Название"
          .value=${entry.name}
          @cp-input=${(e: Event) => this.patchLink(index, { name: ScreenSettings.value(e) })}
        ></cp-input>
        <cp-input
          label="Раздел"
          .value=${entry.category}
          list="link-sections"
          placeholder="organizations"
          @cp-input=${(e: Event) => this.patchLink(index, { category: ScreenSettings.value(e) })}
        ></cp-input>
        <label class="ring">
          <input
            type="checkbox"
            .checked=${entry.inRing}
            @change=${(e: Event) => {
              const target = e.target;
              if (target instanceof HTMLInputElement)
                this.patchLink(index, { inRing: target.checked });
            }}
          />
          в вебринге
        </label>
        <cp-button
          variant="ghost"
          size="sm"
          @cp-click=${() => {
            this.linkDraft = this.linkDraft.filter((_, i) => i !== index);
          }}
          >Удалить</cp-button
        >
      </li>
    `;
  }

  private renderLanguages(): TemplateResult {
    return html`
      <section aria-label="Языки сайта" data-testid=${TESTID.settingsLanguages}>
        <h2>Языки сайта</h2>
        <p class="hint">
          Из чего собирается список языков на сайте и вкладки перевода в редакторе
          (settings/languages.json).
        </p>
        ${this.langLoaded
          ? html`<ul class="rows">
              ${this.langDraft.map((entry, index) => this.renderLanguageRow(entry, index))}
            </ul>`
          : html`<p class="hint">Загружаем языки…</p>`}
        ${this.langError !== '' ? html`<p class="bad" role="alert">${this.langError}</p>` : nothing}
        ${this.langNote !== '' ? html`<p class="ok" role="status">${this.langNote}</p>` : nothing}
        <div class="actions">
          <cp-button variant="secondary" size="sm" @cp-click=${this.addLanguage}>+ язык</cp-button>
          <cp-button
            size="sm"
            arrow
            data-testid=${TESTID.settingsSaveLanguages}
            ?disabled=${this.langBusy}
            @cp-click=${() => void this.saveLanguages()}
            >${this.langBusy ? 'Сохраняем…' : 'Сохранить языки'}</cp-button
          >
        </div>
      </section>
    `;
  }

  private renderLinks(): TemplateResult {
    return html`
      <section aria-label="Ссылки" data-testid=${TESTID.settingsLinks}>
        <h2>Ссылки</h2>
        <p class="hint">
          Каталог дружественных ресурсов (settings/links.json). Отмеченные «в вебринге»
          попадают в кольцо на cdn.comprom.org.
        </p>
        <datalist id="link-sections">
          ${this.sections.map((group) => html`<option value=${group}></option>`)}
        </datalist>
        ${this.linkLoaded
          ? html`<ul class="rows">
              ${this.linkDraft.map((entry, index) => this.renderLinkRow(entry, index))}
            </ul>`
          : html`<p class="hint">Загружаем ссылки…</p>`}
        ${this.linkError !== '' ? html`<p class="bad" role="alert">${this.linkError}</p>` : nothing}
        ${this.linkNote !== '' ? html`<p class="ok" role="status">${this.linkNote}</p>` : nothing}
        <div class="actions">
          <cp-button variant="secondary" size="sm" @cp-click=${this.addLink}>+ ссылка</cp-button>
          <cp-button
            size="sm"
            arrow
            data-testid=${TESTID.settingsSaveLinks}
            ?disabled=${this.linkBusy}
            @cp-click=${() => void this.saveLinks()}
            >${this.linkBusy ? 'Сохраняем…' : 'Сохранить ссылки'}</cp-button
          >
        </div>
      </section>
    `;
  }

  override render(): TemplateResult {
    return html`
      <div class="head">
        <p class="eyebrow">Администрирование · настройки сайта</p>
        <h1 tabindex="-1">Настройки</h1>
      </div>
      ${this.renderLanguages()} ${this.renderLinks()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'screen-settings': ScreenSettings;
  }
}
