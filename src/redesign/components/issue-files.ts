import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import '@communist-prometheus/cp-components';
import {
  listDirViaApi,
  uploadBinaryViaApi,
  deleteFileViaApi,
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

/**
 * Files of one content directory (a magazine issue's `assets/`), managed
 * entirely through the GitHub Contents API — no clone. Lists what is uploaded,
 * uploads ANY file type (pdf, fb2, doc, images…) and deletes files. This is the
 * "where are the files / upload mine / delete" panel the journal workflow needs.
 */
@customElement('issue-files')
export class IssueFiles extends LitElement {
  static override styles = css`
    :host {
      display: block;
    }
    .fhead {
      display: flex;
      align-items: baseline;
      flex-wrap: wrap;
      gap: 0.5rem var(--spacing-md);
      margin: 0 0 var(--spacing-sm);
    }
    h2 {
      font-size: 1.1rem;
      margin: 0;
    }
    .link {
      border: none;
      background: transparent;
      color: var(--color-accent);
      font: inherit;
      font-size: 0.82rem;
      cursor: pointer;
      padding: 0;
    }
    .ficon {
      flex: none;
      color: var(--color-text-secondary);
    }
    ul {
      list-style: none;
      margin: 0 0 var(--spacing-md);
      padding: 0;
      display: grid;
      gap: var(--spacing-xs);
    }
    li {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: 0.5rem var(--spacing-sm);
      padding: var(--spacing-sm) 0;
      border-top: 1px solid var(--color-hairline);
    }
    li:first-child {
      border-top: none;
    }
    .name {
      font-family: var(--font-mono);
      font-size: 0.9rem;
      overflow-wrap: anywhere;
      min-width: 0;
    }
    .size {
      font-size: 0.78rem;
      color: var(--color-text-secondary);
      font-variant-numeric: tabular-nums;
    }
    .spacer {
      flex: 1;
    }
    a.dl {
      color: var(--color-accent);
      text-decoration: none;
      font-size: 0.82rem;
    }
    .empty,
    .msg {
      color: var(--color-text-secondary);
      font-size: 0.88rem;
      margin: 0.2rem 0;
    }
    .msg.error {
      color: var(--color-danger, #c0392b);
    }
    .upload {
      display: inline-flex;
      align-items: center;
      gap: var(--spacing-sm);
      margin-top: var(--spacing-sm);
    }
    input[type='file'] {
      color: var(--color-text-secondary);
      font: inherit;
      font-size: 0.85rem;
      max-width: 100%;
    }
    .confirm {
      display: inline-flex;
      gap: 0.35rem;
      align-items: center;
      font-size: 0.8rem;
    }
  `;

  /** The repo directory whose files are managed, e.g. `magazine/<slug>/assets`. */
  @property() dir = '';

  /** The language currently open in the editor — filters the list to it. */
  @property() lang = '';

  /** All languages the item exists in — used to detect a file's language suffix. */
  @property({ attribute: false }) langs: readonly string[] = [];

  /** Issue slug + title + description — baked into the derived fb2 / asset names. */
  @property() slug = '';
  @property() title = '';
  @property() desc = '';

  /** When true, show files of every language, not just the open one. */
  @state() private showAll = false;

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
   * The purpose-built issue upload: ONLY the newspaper PDF or DOCX.
   * - DOCX → converted client-side to FB2 (the docx itself is never persisted)
   *   and uploaded as `<slug>.<lang>.fb2`.
   * - PDF → uploaded as `<slug>.<lang>.pdf`, and its first page is rendered and
   *   uploaded as `cover.<lang>.png`.
   * The heavy converters (mammoth / mupdf-wasm) load lazily, only on use.
   */
  private readonly onPick = async (event: Event): Promise<void> => {
    const input = event.target;
    const file = input instanceof HTMLInputElement ? input.files?.[0] : undefined;
    if (input instanceof HTMLInputElement) input.value = '';
    if (file === undefined) return;
    const ext = file.name.split('.').pop()?.toLowerCase() ?? '';
    if (ext !== 'pdf' && ext !== 'docx') {
      this.error = 'Для номера загружается только файл газеты — PDF или DOCX.';
      return;
    }
    this.busy = true;
    this.message = '';
    this.error = '';
    try {
      if (ext === 'docx') {
        const { docxFileToFb2 } = await import('@/components/MarkdownEditor/docx-to-fb2');
        const fb2 = await docxFileToFb2(file, {
          slug: this.slug,
          issueTitle: this.title || this.slug,
          issueLang: this.lang,
          issueDescription: this.desc === '' ? undefined : this.desc,
        });
        await this.commit(
          `${this.dir}/${this.slug}.${this.lang}.fb2`,
          fb2,
          `assets: docx→fb2 ${this.slug}.${this.lang}`,
        );
        this.message = `DOCX сконвертирован в FB2 и загружен: ${this.slug}.${this.lang}.fb2`;
      } else {
        await this.commit(
          `${this.dir}/${this.slug}.${this.lang}.pdf`,
          file,
          `assets: pdf ${this.slug}.${this.lang}`,
        );
        const { extractPdfCover } = await import('@/features/magazine/extract-pdf-cover');
        const cover = await extractPdfCover(file);
        await this.commit(
          `${this.dir}/cover.${this.lang}.png`,
          cover,
          `assets: cover ${this.slug}.${this.lang}`,
        );
        this.message = `PDF загружен, обложка извлечена: cover.${this.lang}.png`;
      }
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

  /** Files shown for the open language plus the shared (no-suffix) ones. */
  private get visibleFiles(): readonly RepoFile[] {
    if (this.showAll || this.lang === '') return this.files;
    const set = new Set(this.langs);
    return this.files.filter((f) => {
      const fl = fileLang(f.name, set);
      return fl === undefined || fl === this.lang;
    });
  }

  private renderFile(file: RepoFile): TemplateResult {
    const confirming = this.confirmingPath === file.path;
    return html`
      <li>
        <cp-icon class="ficon" name=${iconFor(file.name)} size="18"></cp-icon>
        <span class="name">${file.name}</span>
        <span class="size">${humanSize(file.size)}</span>
        <span class="spacer"></span>
        <a class="dl" href="https://github.com/communist-prometheus/public-website-content/raw/HEAD/${file.path}" target="_blank" rel="noopener">открыть ↗</a>
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
      </li>
    `;
  }

  override render(): TemplateResult {
    const visible = this.visibleFiles;
    const hidden = this.files.length - visible.length;
    return html`
      <div class="fhead">
        <h2>Файлы номера</h2>
        ${!this.showAll && hidden > 0
          ? html`<button class="link" @click=${() => (this.showAll = true)}>
              показать все языки (+${hidden})
            </button>`
          : this.showAll && this.lang !== ''
            ? html`<button class="link" @click=${() => (this.showAll = false)}>
                только «${this.lang}»
              </button>`
            : nothing}
      </div>
      ${this.loading
        ? html`<p class="msg">Загружаем список файлов…</p>`
        : visible.length === 0
          ? html`<p class="empty">
              ${this.files.length === 0
                ? 'Файлов пока нет.'
                : `Для языка «${this.lang}» файлов нет (есть у других языков).`}
            </p>`
          : html`<ul>
              ${visible.map((f) => this.renderFile(f))}
            </ul>`}
      ${this.error !== '' ? html`<p class="msg error">${this.error}</p>` : nothing}
      ${this.message !== '' ? html`<p class="msg">${this.message}</p>` : nothing}
      <div class="upload">
        <label>
          ${this.busy ? 'Обрабатываем файл газеты…' : 'Загрузить файл газеты (PDF или DOCX):'}
          <input
            type="file"
            accept="application/pdf,.pdf,.docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            ?disabled=${this.busy}
            @change=${this.onPick}
          />
        </label>
      </div>
      <p class="msg">
        DOCX → автоматически конвертируется в FB2. PDF → загружается и из первой страницы
        извлекается обложка. Другие файлы не загружаются.
      </p>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'issue-files': IssueFiles;
  }
}
