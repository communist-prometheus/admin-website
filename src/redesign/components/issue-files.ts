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
    h2 {
      font-size: 1.1rem;
      margin: 0 0 var(--spacing-sm);
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

  private readonly onPick = async (event: Event): Promise<void> => {
    const input = event.target;
    const file = input instanceof HTMLInputElement ? input.files?.[0] : undefined;
    if (input instanceof HTMLInputElement) input.value = '';
    if (file === undefined) return;
    this.busy = true;
    this.message = '';
    this.error = '';
    const base64 = await fileToBase64(file);
    const result = await uploadBinaryViaApi(`${this.dir}/${file.name}`, base64, `assets: add ${file.name}`);
    this.busy = false;
    if (result.ok) {
      this.message = `Загружен файл «${file.name}».`;
      await this.load();
    } else {
      this.error = result.error ?? 'Загрузка не удалась.';
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

  private renderFile(file: RepoFile): TemplateResult {
    const confirming = this.confirmingPath === file.path;
    return html`
      <li>
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
    return html`
      <h2>Файлы номера</h2>
      ${this.loading
        ? html`<p class="msg">Загружаем список файлов…</p>`
        : this.files.length === 0
          ? html`<p class="empty">Файлов пока нет.</p>`
          : html`<ul>
              ${this.files.map((f) => this.renderFile(f))}
            </ul>`}
      ${this.error !== '' ? html`<p class="msg error">${this.error}</p>` : nothing}
      ${this.message !== '' ? html`<p class="msg">${this.message}</p>` : nothing}
      <div class="upload">
        <label>
          ${this.busy ? 'Обрабатываем…' : 'Загрузить файл (pdf, fb2, любой):'}
          <input type="file" ?disabled=${this.busy} @change=${this.onPick} />
        </label>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'issue-files': IssueFiles;
  }
}
