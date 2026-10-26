import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { CpTab } from '@communist-prometheus/cp-components';
import '@communist-prometheus/cp-components';
import { publishTarget } from '../engine/publish-target.js';
import { readLanguagesViaApi } from '../engine/site-settings-io.js';
import {
  missingStrings,
  stringKeys,
  stringsOf,
  withString,
  type StringsByLang,
} from '../engine/site-strings.js';
import {
  readStringsFilesViaApi,
  saveStringsViaApi,
  type StringsFiles,
  type StringsGroup,
} from '../engine/site-strings-io.js';
import { languageTabs, taxonomyStyles } from './taxonomy-shared.js';

/**
 * The site interface screen: the header menu and the shared captions
 * (`common/menu`, `common/labels`) in every language the site publishes in.
 *
 * These texts had no editor in the rebuilt admin, and a language without its
 * file does not fail anywhere — the site quietly renders the default
 * language, which is how four languages ended up with an English header. So
 * the screen leads with what each language is missing.
 */

/** One file set the screen edits. */
interface Section {
  readonly group: StringsGroup;
  readonly heading: string;
  readonly fallbackTitle: string;
}

const SECTIONS: readonly Section[] = [
  { group: 'menu', heading: 'Меню и подвал', fallbackTitle: 'Navigation' },
  { group: 'labels', heading: 'Общие подписи', fallbackTitle: 'Common Labels' },
];

/** What each known text is, for an editor who does not read the keys. */
const CAPTIONS: Readonly<Record<string, string>> = {
  home: 'Пункт меню «Главная»',
  about: 'Пункт меню «О нас»',
  blog: 'Пункт меню «Блог»',
  positions: 'Пункт меню «Позиции»',
  manifest: 'Пункт меню «Манифест»',
  magazine: 'Пункт меню «Журнал»',
  archive: 'Пункт меню «Архив»',
  links: 'Пункт меню «Ссылки»',
  menu: 'Кнопка меню на телефоне',
  copyright: 'Строка в подвале',
  readMore: 'Ссылка «Читать далее» на карточке',
  downloadPdf: 'Кнопка «Скачать PDF»',
  downloadFb2: 'Кнопка «Скачать FB2»',
  viewAll: 'Фильтр блога «Все»',
  backToList: 'Ссылка назад к списку',
  archiveTitle: 'Заголовок архива',
  viewArchive: 'Ссылка «Открыть архив»',
  archiveFiles: 'Заголовок списка файлов',
  openViewer: 'Кнопка «Открыть в просмотрщике»',
};

type Files = Readonly<Record<StringsGroup, StringsFiles>>;
type Draft = Readonly<Record<StringsGroup, StringsByLang>>;

const EMPTY_FILES: Files = { menu: {}, labels: {} };
const EMPTY_DRAFT: Draft = { menu: {}, labels: {} };

const draftOf = (files: StringsFiles): StringsByLang =>
  Object.fromEntries(Object.entries(files).map(([lang, text]) => [lang, stringsOf(text)]));

@customElement('screen-interface')
export class ScreenInterface extends LitElement {
  static override styles = [
    taxonomyStyles,
    css`
      section {
        margin-top: var(--spacing-md);
      }
      h2 {
        margin: 0 0 var(--spacing-xs);
        font-size: 1.15rem;
      }
      .key {
        font-family: var(--font-mono, monospace);
        font-size: 0.75rem;
        color: var(--color-text-secondary);
      }
      .gaps {
        margin: 0 0 var(--spacing-sm);
      }
      .row.missing {
        border-left: 3px solid var(--color-accent);
        padding-left: var(--spacing-xs);
      }
    `,
  ];

  @state() private loading = true;
  @state() private busy = false;
  @state() private error = '';
  @state() private message = '';
  @state() private langs: readonly string[] = [];
  @state() private tabs: readonly CpTab[] = [];
  @state() private activeLang = '';
  @state() private files: Files = EMPTY_FILES;
  @state() private draft: Draft = EMPTY_DRAFT;

  override connectedCallback(): void {
    super.connectedCallback();
    void this.load();
  }

  private async load(): Promise<void> {
    this.loading = true;
    this.error = '';
    try {
      const languages = await readLanguagesViaApi();
      const langs = languages.map((language) => language.code);
      const [menu, labels] = await Promise.all(
        SECTIONS.map((section) => readStringsFilesViaApi(section.group, langs)),
      );
      this.files = { menu: menu ?? {}, labels: labels ?? {} };
      this.draft = { menu: draftOf(this.files.menu), labels: draftOf(this.files.labels) };
      this.langs = langs;
      this.tabs = languageTabs(languages);
      this.activeLang = langs[0] ?? '';
    } catch (e) {
      this.error = e instanceof Error ? e.message : String(e);
    }
    this.loading = false;
  }

  private readonly updateString = (group: StringsGroup, key: string, value: string): void => {
    this.draft = { ...this.draft, [group]: withString(this.draft[group], this.activeLang, key, value) };
    this.message = '';
  };

  private readonly save = async (): Promise<void> => {
    if (this.langs.length === 0) return;
    this.busy = true;
    this.error = '';
    this.message = '';
    const results = await SECTIONS.reduce<Promise<readonly string[] | string>>(
      async (previous, section) => {
        const done = await previous;
        if (typeof done === 'string') return done;
        const result = await saveStringsViaApi(
          section.group,
          this.files[section.group],
          this.draft[section.group],
          this.langs,
          section.fallbackTitle,
        );
        return result.ok ? [...done, ...result.written] : (result.error ?? 'Не удалось сохранить.');
      },
      Promise.resolve([]),
    );
    this.busy = false;
    if (typeof results === 'string') this.error = results;
    else this.message = this.savedMessage(results);
    if (typeof results !== 'string' && results.length > 0) void this.load();
  };

  private savedMessage(written: readonly string[]): string {
    return written.length === 0
      ? 'Изменений нет — сохранять нечего.'
      : `Сохранено в ${publishTarget().site}: ${written.length} файл(ов).`;
  }

  /** Reads a value out of a component's input/change event. */
  private onInput(event: Event, apply: (value: string) => void): void {
    if (!(event instanceof CustomEvent)) return;
    const value: unknown = event.detail?.value;
    if (typeof value === 'string') apply(value);
  }

  private renderGaps(): TemplateResult {
    const gaps = SECTIONS.flatMap((section) => missingStrings(this.draft[section.group], this.langs));
    const byLang = gaps.reduce<Readonly<Record<string, number>>>(
      (acc, gap) => ({ ...acc, [gap.lang]: (acc[gap.lang] ?? 0) + gap.keys.length }),
      {},
    );
    const entries = Object.entries(byLang);
    return entries.length === 0
      ? html`<p class="msg gaps">Все языки сайта переведены полностью.</p>`
      : html`<p class="msg gaps">
          Не переведено (сайт покажет язык по умолчанию):
          ${entries.map(([lang, count]) => `${lang.toUpperCase()} — ${count}`).join(', ')}
        </p>`;
  }

  private renderRow(section: Section, key: string): TemplateResult {
    const value = this.draft[section.group][this.activeLang]?.[key] ?? '';
    const hint = this.draft[section.group][this.langs[0] ?? '']?.[key] ?? '';
    const apply = (v: string): void => this.updateString(section.group, key, v);
    return html`
      <li class="row ${value === '' ? 'missing' : ''}">
        <cp-input
          label=${CAPTIONS[key] ?? key}
          .value=${value}
          placeholder=${hint}
          @cp-input=${(e: Event) => this.onInput(e, apply)}
          @cp-change=${(e: Event) => this.onInput(e, apply)}
        ></cp-input>
        <span class="key">${key}</span>
      </li>
    `;
  }

  private renderSection(section: Section): TemplateResult {
    const keys = stringKeys(this.draft[section.group], this.langs);
    return html`
      <section>
        <h2>${section.heading}</h2>
        <ul class="rows">
          ${keys.map((key) => this.renderRow(section, key))}
        </ul>
      </section>
    `;
  }

  private renderEditor(): TemplateResult {
    return html`
      ${this.renderGaps()}
      <cp-tabs
        .tabs=${this.tabs}
        active=${this.activeLang}
        @cp-tab-change=${(e: Event) => {
          if (e instanceof CustomEvent && typeof e.detail?.id === 'string') this.activeLang = e.detail.id;
        }}
      ></cp-tabs>
      ${SECTIONS.map((section) => this.renderSection(section))}
      <div class="actions">
        <cp-button size="sm" arrow ?disabled=${this.busy} @cp-click=${() => void this.save()}>
          ${this.busy ? 'Сохраняем…' : `Сохранить в ${publishTarget().site}`}
        </cp-button>
      </div>
    `;
  }

  override render(): TemplateResult {
    return html`
      <p class="eyebrow">Настройки · интерфейс сайта</p>
      <h1>Интерфейс сайта</h1>
      <p class="lede">
        Тексты шапки, меню, подвала и общих кнопок сайта — на каждом языке. Если у языка нет
        перевода, сайт покажет этот текст на языке по умолчанию.
      </p>
      ${this.loading ? html`<p class="msg">Загружаем тексты…</p>` : nothing}
      ${!this.loading && this.error === '' ? this.renderEditor() : nothing}
      ${this.error !== '' ? html`<p class="msg error">${this.error}</p>` : nothing}
      ${this.message !== '' ? html`<p class="msg">${this.message}</p>` : nothing}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'screen-interface': ScreenInterface;
  }
}
