import { LitElement, html, css, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@communist-prometheus/cp-components';
import {
  listTree,
  listArticles,
  readFile,
  createMagazineIssue,
  validateMagazineSlug,
  type ArticleSummary,
} from '../engine/content.js';
import { onEngineReady } from '../engine/engine-ready.js';
import { classifyEmpty } from '../engine/load-state.js';

/** One existing magazine issue discovered under `magazine/`. */
interface IssueFolder {
  readonly slug: string;
  readonly title: string;
}

/** The publish pipeline state surfaced in the result dialog. */
type PublishPhase = 'idle' | 'running' | 'done' | 'failed';

/** Reads a browser File as base64 (no `data:` prefix), for the asset API. */
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

/** First File from a file input change event, or undefined. */
const firstFile = (event: Event): File | undefined => {
  const input = event.target;
  return input instanceof HTMLInputElement ? (input.files?.[0] ?? undefined) : undefined;
};

/**
 * Magazine screen (content-editor, magazine). Lists the issues already under
 * `magazine/` and — the point of this screen — publishes a NEW issue entirely
 * through the admin: a slide-over form collects the title, slug, language,
 * publish date, the issue PDF, an optional cover image and the articles it
 * contains, then {@link createMagazineIssue} stages the binaries + `index.md`,
 * back-links every selected article and commits/pushes via the git engine.
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
      margin-right: auto;
      font-size: clamp(1.9rem, 7vw, 2.6rem);
      line-height: 1.15;
      font-weight: 700;
      background: linear-gradient(135deg, var(--color-accent), var(--color-text-primary));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }
    .issues {
      display: grid;
      gap: var(--spacing-md);
      grid-template-columns: repeat(auto-fill, minmax(16rem, 1fr));
    }
    .issue-title {
      font-weight: 700;
    }
    .issue-slug {
      font-family: var(--font-mono);
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
    .empty,
    .note {
      color: var(--color-text-secondary);
    }
    .form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }
    .slug-field {
      display: grid;
      gap: 0.25rem;
    }
    .field-error {
      margin: 0;
      font-size: 0.78rem;
      color: var(--color-danger, #c0392b);
    }
    .file label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      margin-bottom: 0.35rem;
    }
    .file input[type='file'] {
      width: 100%;
      font: inherit;
      color: var(--color-text-secondary);
    }
    .file .hint {
      font-size: 0.78rem;
      color: var(--color-text-secondary);
      margin-top: 0.25rem;
    }
    .arts {
      display: grid;
      gap: 0.4rem;
      max-height: 15rem;
      overflow-y: auto;
      padding: var(--spacing-sm);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
    }
    .art {
      display: flex;
      align-items: center;
      gap: var(--spacing-sm);
      font-size: 0.9rem;
    }
    .art input {
      accent-color: var(--color-accent);
    }
    .art .badge {
      margin-left: auto;
      font-size: 0.72rem;
      color: var(--color-text-secondary);
    }
    .foot {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-sm);
    }
    cp-banner {
      margin-top: var(--spacing-sm);
    }
  `;

  /** Existing issue folders under `magazine/`; empty until loaded. */
  @state() private issues: readonly IssueFolder[] = [];

  /** Whether the initial listing has completed. */
  @state() private loaded = false;

  /** All repo articles, for the issue's table-of-contents multi-select. */
  @state() private articles: readonly ArticleSummary[] = [];

  /** Whether the new-issue slide-over is open. */
  @state() private formOpen = false;

  // --- New-issue form fields ---
  @state() private fTitle = '';
  @state() private fSlug = '';
  @state() private fLang = 'ru';
  @state() private fDate = '';
  @state() private fArticles = new Set<string>();
  private pdf?: File;
  private cover?: File;

  // --- Publish result ---
  @state() private phase: PublishPhase = 'idle';
  @state() private sha = '';
  @state() private error = '';

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
    // The tree API returns a flat, recursive file listing — derive the issue
    // folders from the second path segment (`magazine/<slug>/…`).
    const entries = await listTree('magazine');
    const slugs = [...new Set(entries.map((e) => e.path.split('/')[1]).filter(Boolean))];
    const issues = await Promise.all(
      slugs.map(async (slug) => {
        const md = (await readFile(`magazine/${slug}/index.ru.md`)) ?? '';
        const title = md.match(/^title:\s*(.+)$/m)?.[1]?.replace(/^["']|["']$/g, '') ?? slug;
        return { slug: slug as string, title };
      }),
    );
    this.issues = issues;
    this.articles = await listArticles();
    this.loaded = true;
  }

  private openForm = (): void => {
    this.fTitle = '';
    this.fSlug = '';
    this.fLang = 'ru';
    this.fDate = '';
    this.fArticles = new Set();
    this.pdf = undefined;
    this.cover = undefined;
    this.phase = 'idle';
    this.sha = '';
    this.error = '';
    this.formOpen = true;
  };

  private closeForm = (): void => {
    if (this.phase === 'running') return;
    this.formOpen = false;
  };

  private bind =
    (field: 'fTitle' | 'fSlug' | 'fLang' | 'fDate') =>
    (event: Event): void => {
      const value: unknown = (event as CustomEvent).detail?.value;
      if (typeof value === 'string') this[field] = value;
    };

  private toggleArticle = (slug: string): void => {
    const next = new Set(this.fArticles);
    next.has(slug) ? next.delete(slug) : next.add(slug);
    this.fArticles = next;
  };

  /** Slug validation error for the current input, or '' when the slug is fine. */
  private get slugError(): string {
    return validateMagazineSlug(this.fSlug, this.issues.map((i) => i.slug)) ?? '';
  }

  private get canSubmit(): boolean {
    return (
      this.fTitle.trim() !== '' &&
      this.slugError === '' &&
      this.fDate.trim() !== '' &&
      this.pdf !== undefined &&
      this.phase !== 'running'
    );
  }

  private submit = async (): Promise<void> => {
    if (!this.canSubmit || this.pdf === undefined) return;
    this.phase = 'running';
    this.error = '';
    try {
      const pdfBase64 = await fileToBase64(this.pdf);
      const coverBase64 = this.cover ? await fileToBase64(this.cover) : undefined;
      const result = await createMagazineIssue({
        slug: this.fSlug.trim(),
        lang: this.fLang,
        title: this.fTitle.trim(),
        publishDate: this.fDate.trim(),
        articles: [...this.fArticles],
        pdfBase64,
        coverBase64,
      });
      if (result.ok && result.sha !== undefined) {
        this.phase = 'done';
        this.sha = result.sha;
        await this.load();
      } else {
        this.phase = 'failed';
        this.error = result.error ?? 'Публикация номера не удалась.';
      }
    } catch (e) {
      this.phase = 'failed';
      this.error = e instanceof Error ? e.message : String(e);
    }
  };

  private renderResult(): TemplateResult | typeof nothing {
    if (this.phase === 'done') {
      return html`<cp-banner tone="success" title="Номер опубликован"
        >Коммит <code>${this.sha}</code> запушен. Номер появится на сайте после сборки.</cp-banner
      >`;
    }
    if (this.phase === 'failed') {
      return html`<cp-banner tone="danger" title="Не удалось">${this.error}</cp-banner>`;
    }
    return nothing;
  }

  private renderForm(): TemplateResult {
    return html`
      <cp-sheet ?open=${this.formOpen} heading="Новый номер журнала" @cp-close=${this.closeForm}>
        <div class="form">
          <cp-input
            label="Заголовок"
            required
            .value=${this.fTitle}
            @cp-input=${this.bind('fTitle')}
            @cp-change=${this.bind('fTitle')}
          ></cp-input>
          <div class="slug-field">
            <cp-input
              label="Слаг (папка номера)"
              required
              ?invalid=${this.fSlug.trim() !== '' && this.slugError !== ''}
              placeholder="magazine-3-sentyabr-2026"
              .value=${this.fSlug}
              @cp-input=${this.bind('fSlug')}
              @cp-change=${this.bind('fSlug')}
            ></cp-input>
            ${this.fSlug.trim() !== '' && this.slugError !== ''
              ? html`<p class="field-error" role="alert">${this.slugError}</p>`
              : nothing}
          </div>
          <cp-select
            label="Язык"
            .value=${this.fLang}
            .options=${[
              { value: 'ru', label: 'Русский' },
              { value: 'en', label: 'English' },
              { value: 'it', label: 'Italiano' },
              { value: 'es', label: 'Español' },
            ]}
            @cp-change=${this.bind('fLang')}
          ></cp-select>
          <cp-date-input
            label="Дата публикации"
            type="date"
            .value=${this.fDate}
            @cp-change=${this.bind('fDate')}
          ></cp-date-input>

          <div class="file">
            <label for="mag-pdf">PDF номера *</label>
            <input
              id="mag-pdf"
              type="file"
              accept="application/pdf,.pdf"
              @change=${(e: Event) => {
                this.pdf = firstFile(e);
                this.requestUpdate();
              }}
            />
            <p class="hint">${this.pdf ? this.pdf.name : 'Не выбран'}</p>
          </div>

          <div class="file">
            <label for="mag-cover">Обложка (PNG/JPEG)</label>
            <input
              id="mag-cover"
              type="file"
              accept="image/png,image/jpeg,.png,.jpg,.jpeg"
              @change=${(e: Event) => {
                this.cover = firstFile(e);
                this.requestUpdate();
              }}
            />
            <p class="hint">${this.cover ? this.cover.name : 'Не выбрана — можно без обложки'}</p>
          </div>

          <div>
            <label class="issue-title">Статьи номера (${this.fArticles.size})</label>
            <div class="arts">
              ${this.articles.length === 0
                ? html`<p class="note">Статьи не загружены.</p>`
                : this.articles.map(
                    (a) => html`
                      <label class="art">
                        <input
                          type="checkbox"
                          .checked=${this.fArticles.has(a.slug)}
                          @change=${() => this.toggleArticle(a.slug)}
                        />
                        <span>${a.title}</span>
                        <span class="badge">${a.published ? '' : 'черновик'}</span>
                      </label>
                    `,
                  )}
            </div>
          </div>

          ${this.renderResult()}

          <div class="foot">
            <cp-button variant="secondary" @cp-click=${this.closeForm}>
              ${this.phase === 'done' ? 'Закрыть' : 'Отмена'}
            </cp-button>
            ${this.phase === 'done'
              ? nothing
              : html`<cp-button
                  arrow
                  ?disabled=${!this.canSubmit}
                  @cp-click=${this.submit}
                >
                  ${this.phase === 'running' ? 'Публикуется…' : 'Опубликовать номер'}
                </cp-button>`}
          </div>
        </div>
      </cp-sheet>
    `;
  }

  override render(): TemplateResult {
    return html`
      <header class="head">
        <p class="eyebrow">Контент · журнал</p>
        <h1 tabindex="-1">Журнал</h1>
        <cp-button arrow @cp-click=${this.openForm}>Новый номер</cp-button>
      </header>

      ${this.issues.length > 0
        ? html`<div class="issues">
            ${this.issues.map(
              (issue) => html`
                <cp-card>
                  <span slot="title" class="issue-title">${issue.title}</span>
                  <span slot="summary" class="issue-slug">${issue.slug}</span>
                </cp-card>
              `,
            )}
          </div>`
        : html`<p class="empty">
            ${classifyEmpty(this.loaded) === 'loading'
              ? 'Загружаем номера…'
              : classifyEmpty(this.loaded) === 'signed-out'
                ? 'Войдите через GitHub, чтобы увидеть и публиковать номера.'
                : 'Номеров пока нет. Нажмите «Новый номер», чтобы загрузить первый.'}
          </p>`}
      ${this.renderForm()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'screen-magazine': ScreenMagazine;
  }
}
