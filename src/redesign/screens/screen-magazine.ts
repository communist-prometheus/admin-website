import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@communist-prometheus/cp-components';
import type { CpTab } from '@communist-prometheus/cp-components';
import { listTree, type TreeEntry } from '../engine/content.js';

/** The languages a magazine issue can carry a source for. */
type LangCode = 'ru' | 'en' | 'es' | 'it';

/** Fixed render/tab order for the four supported languages. */
const LANG_ORDER: readonly LangCode[] = ['ru', 'en', 'es', 'it'];

/** Display names for each supported language. */
const LANG_NAMES: Readonly<Record<LangCode, string>> = {
  ru: 'Русский',
  en: 'English',
  es: 'Español',
  it: 'Italiano',
};

/** The recognised roles a repo file plays for one language. */
type FileKind = 'pdf' | 'fb2' | 'cover' | 'index' | 'other';

/** Human labels for each file role, used in the source card list. */
const KIND_LABELS: Readonly<Record<FileKind, string>> = {
  pdf: 'PDF',
  fb2: 'FB2',
  cover: 'Обложка',
  index: 'Описание',
  other: 'Файл',
};

/** Readiness affix per tab — a SHAPE cue, never colour alone (NFR-5). */
const READY_MARK = '✓';
const PENDING_MARK = '—';

/** One real repo file belonging to a language, with its parsed role. */
interface SourceFile {
  readonly name: string;
  readonly path: string;
  readonly kind: FileKind;
}

/** A language row: its code, display name, and its real repo files. */
interface LangSources {
  readonly code: LangCode;
  readonly name: string;
  readonly files: readonly SourceFile[];
}

/** Narrows an `unknown` to one of the four known language codes. */
const isLangCode = (value: unknown): value is LangCode =>
  value === 'ru' || value === 'en' || value === 'es' || value === 'it';

/** Maps a file extension to the role the file plays for its language. */
const kindFromExt = (ext: string): FileKind => {
  if (ext === 'pdf') return 'pdf';
  if (ext === 'fb2') return 'fb2';
  if (ext === 'png' || ext === 'jpg' || ext === 'jpeg' || ext === 'webp') return 'cover';
  if (ext === 'md') return 'index';
  return 'other';
};

/**
 * Groups a `magazine/` directory listing into per-language file sets. A file is
 * attributed to a language by its `.<lang>.<ext>` suffix (e.g.
 * `magazine-1-mai-2026.ru.pdf`, `cover.ru.png`, `index.ru.md`); everything else
 * is ignored. The four supported languages are always returned in a stable
 * order, each with the real files that matched — or an empty list.
 */
const parseTree = (entries: readonly TreeEntry[]): readonly LangSources[] => {
  const byLang = new Map<LangCode, SourceFile[]>();
  for (const entry of entries) {
    if (entry.type !== 'file') continue;
    const match = entry.name.match(/\.([a-z]{2})\.([a-z0-9]+)$/i);
    if (match === null) continue;
    const lang = match[1].toLowerCase();
    if (!isLangCode(lang)) continue;
    const list = byLang.get(lang) ?? [];
    list.push({ name: entry.name, path: entry.path, kind: kindFromExt(match[2].toLowerCase()) });
    byLang.set(lang, list);
  }
  return LANG_ORDER.map((code) => ({
    code,
    name: LANG_NAMES[code],
    files: byLang.get(code) ?? [],
  }));
};

/**
 * A language is "ready" when it carries a readable source document (a `.pdf`
 * OR a `.fb2`) AND an extracted cover image; otherwise it is still pending.
 */
const isReady = (files: readonly SourceFile[]): boolean =>
  files.some((file) => file.kind === 'pdf' || file.kind === 'fb2') &&
  files.some((file) => file.kind === 'cover');

/** Derives the issue slug from any source document's name across all languages. */
const issueSlug = (langs: readonly LangSources[]): string | undefined => {
  for (const lang of langs) {
    const source = lang.files.find((file) => file.kind === 'pdf' || file.kind === 'fb2');
    if (source !== undefined) {
      return source.name.replace(/\.[a-z]{2}\.[a-z0-9]+$/i, '');
    }
  }
  return undefined;
};

/** Pulls a `LangCode` out of a `cp-tab-change` detail without casting. */
const readLangCode = (detail: unknown): LangCode | undefined => {
  if (typeof detail !== 'object' || detail === null || !('id' in detail)) {
    return undefined;
  }
  return isLangCode(detail.id) ? detail.id : undefined;
};

/**
 * The "Загрузка журнала" screen (content-editor (magazine), design.md R5),
 * driven by the REAL cloned content repo. On connect it lists `magazine/` via
 * the content engine and groups every `*.<lang>.<ext>` file into the four
 * supported languages ({@link parseTree}); a language's readiness is derived
 * from its actual files — it is ready only when it has a `.pdf`/`.fb2` source
 * AND an extracted cover ({@link isReady}).
 *
 * The header carries the issue title (from the real filename) and a live/demo
 * badge. A language strip (`cp-tabs`, tracked in {@link selected}) affixes a
 * ✓/— SHAPE cue per language and switches the source panel below it, which
 * shows the selected language's real files in a `cp-card` with a `cp-status`.
 * When the engine is off (empty listing) it falls back to a representative
 * {@link SAMPLE_LANGUAGES} sample so the preview still renders. All chrome
 * composes design-system primitives and inherited `:root` theme tokens — no
 * ad-hoc colours or sizes.
 */
@customElement('screen-magazine')
export class ScreenMagazine extends LitElement {
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
    .eyebrow {
      flex-basis: 100%;
      margin: 0;
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
    h1 {
      margin: 0;
      font-size: clamp(1.9rem, 7vw, 2.6rem);
      line-height: 1.15;
      font-weight: 700;
      background: linear-gradient(135deg, var(--color-accent), var(--color-text-primary));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    h1:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 4px;
    }

    .section-label {
      margin: var(--spacing-lg) 0 var(--spacing-sm);
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--color-text-secondary);
    }

    cp-tabs {
      display: block;
      margin-bottom: var(--spacing-md);
      overflow-x: auto;
    }

    .file-name {
      font-family: var(--font-mono);
    }

    .files {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: 0.5rem;
    }
    .files li {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--spacing-sm);
      padding: 0.55rem var(--spacing-md);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      background: var(--color-surface);
    }
    .files .name {
      font-family: var(--font-mono);
      font-size: 0.85rem;
      overflow-wrap: anywhere;
    }
    .files .kind {
      flex: none;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.06em;
      text-transform: uppercase;
      color: var(--color-text-secondary);
    }

    .empty {
      margin: 0;
      font-size: 0.9rem;
      color: var(--color-text-secondary);
    }

    .status-line {
      margin: 0;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }

    .actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-lg);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--color-hairline);
    }
    .actions .spacer {
      flex: 1;
    }
  `;

  /** Per-language file sets grouped from the real repo; empty until loaded. */
  @state() private languages: readonly LangSources[] = [];

  /** Whether the real listing has completed (drives the demo badge). */
  @state() private loaded = false;

  /** The language whose source panel is currently shown. */
  @state() private selected: LangCode = 'ru';

  override connectedCallback(): void {
    super.connectedCallback();
    void this.load();
  }

  private async load(): Promise<void> {
    const parsed = parseTree(await listTree('magazine'));
    this.languages = parsed.some((lang) => lang.files.length > 0) ? parsed : [];
    this.loaded = true;
  }

  /** True when the panel reflects real repo files. */
  private get live(): boolean {
    return this.languages.length > 0;
  }

  /** The real repo data (empty until the engine has loaded the listing). */
  private get list(): readonly LangSources[] {
    return this.languages;
  }

  /** The currently selected language row (falls back to the first). */
  private get current(): LangSources {
    return this.list.find((lang) => lang.code === this.selected) ?? this.list[0];
  }

  /** Tab strip descriptors, each affixed with its readiness SHAPE cue. */
  private get tabs(): readonly CpTab[] {
    return this.list.map((lang) => ({
      id: lang.code,
      label: `${lang.code} ${isReady(lang.files) ? READY_MARK : PENDING_MARK}`,
    }));
  }

  /** One-line summary of every language's readiness. */
  private get statusLine(): string {
    return this.list
      .map((lang) => `${lang.name} ${isReady(lang.files) ? 'готов' : 'ожидает'}`)
      .join(' · ');
  }

  private onTabChange = (event: Event): void => {
    if (!(event instanceof CustomEvent)) {
      return;
    }
    const code = readLangCode(event.detail);
    code === undefined || (this.selected = code);
  };

  private renderFiles(lang: LangSources): TemplateResult {
    return html`
      <ul class="files">
        ${lang.files.map(
          (file) => html`
            <li>
              <span class="name">${file.name}</span>
              <span class="kind">${KIND_LABELS[file.kind]}</span>
            </li>
          `,
        )}
      </ul>
    `;
  }

  private renderSource(lang: LangSources): TemplateResult {
    const ready = isReady(lang.files);
    const count = lang.files.length;
    return html`
      <cp-card>
        <span slot="title" class="file-name">${issueSlug(this.list) ?? lang.name}</span>
        <span slot="summary">
          ${count === 0
            ? `${lang.name} — файлы не загружены`
            : `${lang.name} · ${count} ${count === 1 ? 'файл' : 'файлов'} в репозитории`}
        </span>
        <cp-status
          slot="meta"
          state=${ready ? 'success' : 'neutral'}
          label=${ready ? 'Готово к публикации' : 'Ожидает источник и обложку'}
        ></cp-status>
        ${count === 0
          ? html`<p class="empty">Загрузите PDF/FB2 выпуска и обложку для языка «${lang.name}».</p>`
          : this.renderFiles(lang)}
      </cp-card>
    `;
  }

  override render(): TemplateResult {
    const slug = issueSlug(this.list);
    return html`
      <header class="head">
        <p class="eyebrow">magazine · ${this.live ? (slug ?? 'новый выпуск') : ''}</p>
        <h1 tabindex="-1">Загрузка журнала</h1>
      </header>

      ${this.live
        ? html`
            <h2 class="section-label">Источники по языкам</h2>
            <cp-tabs
              .tabs=${this.tabs}
              active=${this.selected}
              aria-label="Язык источника"
              @cp-tab-change=${this.onTabChange}
            ></cp-tabs>

            ${this.renderSource(this.current)}

            <div class="actions">
              <p class="status-line">${this.statusLine}</p>
              <span class="spacer"></span>
              <cp-button variant="secondary">Сохранить черновик</cp-button>
              <cp-button arrow>Опубликовать готовые</cp-button>
            </div>
          `
        : html`<p class="empty">
            ${this.loaded
              ? 'Войдите через GitHub, чтобы загрузить файлы выпусков из репозитория.'
              : 'Загружаем выпуски…'}
          </p>`}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'screen-magazine': ScreenMagazine;
  }
}
