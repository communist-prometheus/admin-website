import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@communist-prometheus/cp-components';
import {
  listDirViaApi,
  uploadBinaryViaApi,
  deleteFileViaApi,
  rawContentUrl,
  type RepoFile,
} from '../engine/content.js';

/** Reads a File as base64 (without the data-URL prefix) for the Contents API. */
const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (): void => {
      const result = String(reader.result);
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.onerror = (): void => reject(reader.error ?? new Error('read failed'));
    reader.readAsDataURL(file);
  });

/** Human file size. */
const humanSize = (bytes: number): string =>
  bytes < 1024
    ? `${bytes} Б`
    : bytes < 1024 * 1024
      ? `${(bytes / 1024).toFixed(0)} КБ`
      : `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;

const IMAGE_EXT = new Set(['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg', 'avif']);

/** A type pictogram for a filename by its extension. */
export const iconFor = (name: string): string => {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  if (IMAGE_EXT.has(ext)) return 'image';
  if (ext === 'fb2' || ext === 'epub') return 'book';
  if (ext === 'pdf') return 'file-text';
  return 'file-generic';
};

/** The language a file belongs to (`cover.ru.png` → `ru`), or undefined when it
 *  carries no known-language suffix (`cover.png` is shared across languages). */
export const fileLang = (name: string, langs: ReadonlySet<string>): string | undefined => {
  const parts = name.split('.');
  if (parts.length < 3) return undefined;
  const candidate = parts[parts.length - 2];
  return langs.has(candidate) ? candidate : undefined;
};

/** The only two accepted uploads, plus the rejection of everything else. */
export type UploadKind = 'docx' | 'pdf' | 'reject';

/** Classifies a picked file by extension into the issue upload it drives. */
export const classifyUpload = (name: string): UploadKind => {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  return ext === 'docx' ? 'docx' : ext === 'pdf' ? 'pdf' : 'reject';
};

/**
 * The asset path(s) an upload writes, in commit order:
 * - docx → one derived FB2;
 * - pdf → the pdf itself, then the cover rendered from its first page;
 * - reject → nothing.
 */
export const plannedAssetPaths = (
  dir: string,
  slug: string,
  lang: string,
  kind: UploadKind,
): readonly string[] =>
  kind === 'docx'
    ? [`${dir}/${slug}.${lang}.fb2`]
    : kind === 'pdf'
      ? [`${dir}/${slug}.${lang}.pdf`, `${dir}/cover.${lang}.png`]
      : [];

/** The three typed slots of a magazine issue in one language, plus stray files. */
export interface IssueAssets {
  /** The per-language cover, or the shared `cover.png` fallback. */
  readonly cover?: RepoFile;
  /** True when only the shared `cover.png` exists (no per-language cover yet). */
  readonly coverShared: boolean;
  /** The newspaper PDF for this language. */
  readonly pdf?: RepoFile;
  /** The derived FB2 ebook for this language. */
  readonly fb2?: RepoFile;
  /** Anything that fits none of the typed slots of any language — for cleanup. */
  readonly other: readonly RepoFile[];
}

/** Whether a filename is a recognised typed asset of some language (cover / pdf /
 *  fb2), so the cleanup list can show only genuinely stray files. */
const isTyped = (name: string, slug: string): boolean =>
  name === 'cover.png' ||
  /^cover\.[a-z]{2}\.png$/.test(name) ||
  (name.startsWith(`${slug}.`) && (name.endsWith('.pdf') || name.endsWith('.fb2')));

/** Sorts the flat assets directory into the issue's typed slots for one language. */
export const classifyIssueAssets = (
  files: readonly RepoFile[],
  slug: string,
  lang: string,
): IssueAssets => {
  const byName = (n: string): RepoFile | undefined => files.find((f) => f.name === n);
  const pdf = byName(`${slug}.${lang}.pdf`);
  const fb2 = byName(`${slug}.${lang}.fb2`);
  const coverLang = byName(`cover.${lang}.png`);
  const coverShared = byName('cover.png');
  const other = files.filter((f) => !isTyped(f.name, slug));
  return {
    cover: coverLang ?? coverShared,
    coverShared: coverLang === undefined && coverShared !== undefined,
    pdf,
    fb2,
    other,
  };
};

/**
 * The purpose-built assets panel for one magazine issue's `assets/`, managed
 * entirely through the GitHub Contents API — no clone. Instead of a flat file
 * dump it presents the issue's three typed slots for the open language —
 * **Обложка**, and the **Файл номера** (PDF + derived FB2) — with a single
 * upload that accepts ONLY the newspaper as PDF or DOCX:
 * - DOCX → converted client-side to FB2 (the docx is never persisted);
 * - PDF → stored, and its first page is rendered into the cover.
 * A collapsed cleanup list handles any stray leftovers.
 */
@customElement('issue-files')
export class IssueFiles extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    h2 {
      font-size: 1.1rem;
      margin: 0 0 var(--spacing-md);
    }
    .slots {
      display: grid;
      gap: var(--spacing-md);
    }
    section.slot {
      border: 1px solid var(--color-hairline);
      border-radius: var(--radius-md, 10px);
      padding: var(--spacing-md);
      display: grid;
      gap: var(--spacing-sm);
    }
    .slot-head {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
    }
    .slot-head h3 {
      font-size: 0.95rem;
      margin: 0;
    }
    .slot-head .spacer {
      flex: 1;
    }
    .cover-preview {
      display: block;
      max-width: 160px;
      width: 100%;
      height: auto;
      border-radius: var(--radius-sm, 6px);
      border: 1px solid var(--color-hairline);
      background: var(--color-surface-sunken, rgba(0, 0, 0, 0.04));
    }
    .cover-none {
      display: grid;
      place-items: center;
      width: 160px;
      height: 110px;
      border: 1px dashed var(--color-hairline);
      border-radius: var(--radius-sm, 6px);
      color: var(--color-text-secondary);
      font-size: 0.82rem;
    }
    ul.rows {
      list-style: none;
      margin: 0;
      padding: 0;
      display: grid;
      gap: var(--spacing-xs);
    }
    ul.rows li {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem var(--spacing-sm);
    }
    .kind {
      font-family: var(--font-mono);
      font-size: 0.82rem;
      color: var(--color-text-secondary);
      min-width: 2.6rem;
    }
    .name {
      font-family: var(--font-mono);
      font-size: 0.86rem;
      overflow-wrap: anywhere;
      min-width: 0;
    }
    .size {
      font-size: 0.76rem;
      color: var(--color-text-secondary);
      font-variant-numeric: tabular-nums;
    }
    .spacer {
      flex: 1;
    }
    a.open {
      color: var(--color-accent);
      text-decoration: none;
      font-size: 0.8rem;
      white-space: nowrap;
    }
    .missing {
      color: var(--color-text-secondary);
      font-size: 0.84rem;
    }
    .upload {
      display: grid;
      gap: 0.35rem;
      margin-top: var(--spacing-xs);
    }
    .upload > span {
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }
    input[type='file'] {
      color: var(--color-text-secondary);
      font: inherit;
      font-size: 0.82rem;
      max-width: 100%;
    }
    .hint {
      font-size: 0.8rem;
      color: var(--color-text-secondary);
      margin: 0;
    }
    .msg {
      color: var(--color-text-secondary);
      font-size: 0.86rem;
      margin: 0.2rem 0;
    }
    .msg.error {
      color: var(--color-danger, #c0392b);
    }
    details.cleanup {
      border-top: 1px solid var(--color-hairline);
      padding-top: var(--spacing-sm);
    }
    details.cleanup summary {
      cursor: pointer;
      font-size: 0.85rem;
      color: var(--color-text-secondary);
    }
    details.cleanup li {
      display: flex;
      align-items: center;
      gap: 0.5rem var(--spacing-sm);
      flex-wrap: wrap;
      padding: var(--spacing-xs) 0;
    }
    .confirm {
      display: inline-flex;
      gap: 0.35rem;
      align-items: center;
    }
  `;

  /** The repo directory whose files are managed, e.g. `magazine/<slug>/assets`. */
  @property() dir = '';

  /** The language currently open in the editor — the slots are per-language. */
  @property() lang = '';

  /** All languages the item exists in (reserved for cross-language hints). */
  @property({ attribute: false }) langs: readonly string[] = [];

  /** Issue slug + title + description — baked into the derived fb2 / asset names. */
  @property() slug = '';
  @property() title = '';
  @property() desc = '';

  @state() private files: readonly RepoFile[] = [];
  @state() private loading = false;
  @state() private busy = false;
  @state() private message = '';
  @state() private error = '';
  /** Path awaiting a delete confirmation (two-step, so a tap can't wipe a file). */
  @state() private confirmingPath = '';

  override connectedCallback(): void {
    super.connectedCallback();
    void this.load();
  }

  override updated(changed: Map<string, unknown>): void {
    if (changed.has('dir')) void this.load();
  }

  private async load(): Promise<void> {
    if (this.dir === '') return;
    this.loading = true;
    this.error = '';
    this.files = await listDirViaApi(this.dir);
    this.loading = false;
  }

  /** Commits one derived File to the assets dir, throwing on API failure. */
  private async commit(path: string, file: File, message: string): Promise<void> {
    const base64 = await fileToBase64(file);
    const r = await uploadBinaryViaApi(path, base64, message);
    if (!r.ok) throw new Error(r.error ?? 'upload failed');
  }

  /**
   * The primary upload: ONLY the newspaper PDF or DOCX.
   * - DOCX → converted client-side to FB2 (`docxFileToFb2`); the docx is never
   *   persisted, only `<slug>.<lang>.fb2` is committed.
   * - PDF → committed as `<slug>.<lang>.pdf`, and its first page is rendered
   *   (`extractPdfCover`) and committed as `cover.<lang>.png`.
   * Both converters load lazily so mammoth/mupdf stay out of the initial bundle.
   */
  private readonly onPick = async (event: Event): Promise<void> => {
    const input = event.target;
    const file = input instanceof HTMLInputElement ? input.files?.[0] : undefined;
    if (input instanceof HTMLInputElement) input.value = '';
    if (file === undefined) return;
    const kind = classifyUpload(file.name);
    if (kind === 'reject') {
      this.error = 'Для номера загружается только файл газеты — PDF или DOCX.';
      return;
    }
    const [primary, cover] = plannedAssetPaths(this.dir, this.slug, this.lang, kind);
    this.busy = true;
    this.message = '';
    this.error = '';
    try {
      if (kind === 'docx') {
        const { docxFileToFb2 } = await import('@/components/MarkdownEditor/docx-to-fb2');
        const fb2 = await docxFileToFb2(file, {
          slug: this.slug,
          issueTitle: this.title || this.slug,
          issueLang: this.lang,
          issueDescription: this.desc === '' ? undefined : this.desc,
        });
        await this.commit(primary, fb2, `assets: docx→fb2 ${this.slug}.${this.lang}`);
        this.message = `DOCX сконвертирован в FB2 и загружен: ${this.slug}.${this.lang}.fb2`;
      } else {
        await this.commit(primary, file, `assets: pdf ${this.slug}.${this.lang}`);
        const { extractPdfCover } = await import('@/features/magazine/extract-pdf-cover');
        const coverFile = await extractPdfCover(file);
        await this.commit(cover, coverFile, `assets: cover ${this.slug}.${this.lang}`);
        this.message = `PDF загружен, обложка извлечена: cover.${this.lang}.png`;
      }
      await this.load();
    } catch (e) {
      this.error = e instanceof Error ? e.message : String(e);
    } finally {
      this.busy = false;
    }
  };

  /** Replaces just the cover for the open language with a picked image. */
  private readonly onPickCover = async (event: Event): Promise<void> => {
    const input = event.target;
    const file = input instanceof HTMLInputElement ? input.files?.[0] : undefined;
    if (input instanceof HTMLInputElement) input.value = '';
    if (file === undefined) return;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (!IMAGE_EXT.has(ext)) {
      this.error = 'Обложка — это изображение (png, jpg, webp…).';
      return;
    }
    this.busy = true;
    this.message = '';
    this.error = '';
    try {
      await this.commit(
        `${this.dir}/cover.${this.lang}.png`,
        file,
        `assets: cover ${this.slug}.${this.lang}`,
      );
      this.message = `Обложка обновлена: cover.${this.lang}.png`;
      await this.load();
    } catch (e) {
      this.error = e instanceof Error ? e.message : String(e);
    } finally {
      this.busy = false;
    }
  };

  private readonly removeFile = async (file: RepoFile): Promise<void> => {
    this.confirmingPath = '';
    this.busy = true;
    this.message = '';
    this.error = '';
    const result = await deleteFileViaApi(file.path, `assets: remove ${file.name}`);
    this.busy = false;
    if (result.ok) {
      this.message = `Удалён файл «${file.name}».`;
      await this.load();
    } else {
      this.error = result.error ?? 'Удаление не удалось.';
    }
  };

  private renderFileRow(kind: string, file: RepoFile | undefined): TemplateResult {
    return html`
      <li>
        <span class="kind">${kind}</span>
        ${file === undefined
          ? html`<span class="missing">— не загружен</span>`
          : html`
              <cp-icon name=${iconFor(file.name)} size="16"></cp-icon>
              <span class="name">${file.name}</span>
              <span class="size">${humanSize(file.size)}</span>
              <span class="spacer"></span>
              <a class="open" href=${rawContentUrl(file.path)} target="_blank" rel="noopener"
                >открыть ↗</a
              >
            `}
      </li>
    `;
  }

  private renderCover(assets: IssueAssets): TemplateResult {
    return html`
      <section class="slot">
        <div class="slot-head">
          <h3>Обложка</h3>
          <span class="spacer"></span>
          ${assets.cover === undefined
            ? html`<cp-tag tone="warning">нет</cp-tag>`
            : assets.coverShared
              ? html`<cp-tag>общая</cp-tag>`
              : html`<cp-tag tone="success">есть</cp-tag>`}
        </div>
        ${assets.cover === undefined
          ? html`<div class="cover-none">нет обложки</div>`
          : html`<img
              class="cover-preview"
              src=${rawContentUrl(assets.cover.path)}
              alt="Обложка номера (${this.lang})"
              loading="lazy"
            />`}
        <label class="upload">
          <span>${this.busy ? 'Обрабатываем…' : 'Заменить обложку (изображение):'}</span>
          <input type="file" accept="image/*" ?disabled=${this.busy} @change=${this.onPickCover} />
        </label>
      </section>
    `;
  }

  private renderNewspaper(assets: IssueAssets): TemplateResult {
    return html`
      <section class="slot">
        <div class="slot-head">
          <h3>Файл номера</h3>
          <span class="spacer"></span>
          ${assets.pdf !== undefined || assets.fb2 !== undefined
            ? html`<cp-tag tone="success">готов</cp-tag>`
            : html`<cp-tag tone="warning">пусто</cp-tag>`}
        </div>
        <ul class="rows">
          ${this.renderFileRow('PDF', assets.pdf)}${this.renderFileRow('FB2', assets.fb2)}
        </ul>
        <label class="upload">
          <span
            >${this.busy
              ? 'Обрабатываем файл газеты…'
              : 'Загрузить файл газеты (PDF или DOCX):'}</span
          >
          <input
            type="file"
            accept="application/pdf,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ?disabled=${this.busy}
            @change=${this.onPick}
          />
        </label>
        <p class="hint">
          DOCX → автоматически конвертируется в FB2. PDF → загружается, обложка берётся из
          первой страницы. Другие файлы не принимаются.
        </p>
      </section>
    `;
  }

  private renderCleanup(other: readonly RepoFile[]): TemplateResult {
    return html`
      <details class="cleanup">
        <summary>Прочие файлы (${other.length}) — очистка</summary>
        <ul class="rows">
          ${other.map((file) => {
            const confirming = this.confirmingPath === file.path;
            return html`<li>
              <cp-icon name=${iconFor(file.name)} size="16"></cp-icon>
              <span class="name">${file.name}</span>
              <span class="size">${humanSize(file.size)}</span>
              <span class="spacer"></span>
              <a class="open" href=${rawContentUrl(file.path)} target="_blank" rel="noopener"
                >открыть ↗</a
              >
              ${confirming
                ? html`<span class="confirm">
                    <cp-button size="sm" variant="secondary" @cp-click=${() => (this.confirmingPath = '')}
                      >Отмена</cp-button
                    >
                    <cp-button size="sm" ?disabled=${this.busy} @cp-click=${() => void this.removeFile(file)}
                      >Удалить</cp-button
                    >
                  </span>`
                : html`<cp-button
                    size="sm"
                    variant="ghost"
                    ?disabled=${this.busy}
                    @cp-click=${() => (this.confirmingPath = file.path)}
                    >Удалить</cp-button
                  >`}
            </li>`;
          })}
        </ul>
      </details>
    `;
  }

  override render(): TemplateResult {
    if (this.loading) return html`<h2>Материалы номера</h2><p class="msg">Загружаем…</p>`;
    const assets = classifyIssueAssets(this.files, this.slug, this.lang);
    return html`
      <h2>Материалы номера</h2>
      ${this.error !== '' ? html`<p class="msg error">${this.error}</p>` : nothing}
      ${this.message !== '' ? html`<p class="msg">${this.message}</p>` : nothing}
      <div class="slots">
        ${this.renderCover(assets)}${this.renderNewspaper(assets)}
        ${assets.other.length > 0 ? this.renderCleanup(assets.other) : nothing}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'issue-files': IssueFiles;
  }
}
