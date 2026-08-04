import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import '@communist-prometheus/cp-components';
import type { CpSelectOption, CpTab } from '@communist-prometheus/cp-components';
import '../editor/cp-markdown-editor.js';
import {
  listArticles,
  readFile,
  stageFile,
  commitAndPush,
  upsertFrontmatterField,
} from '../engine/content.js';
import { onEngineReady } from '../engine/engine-ready.js';

/** One editable article block: a stable id plus its raw markdown source line(s).
 *  The rendered typography is derived from the raw text on every render, so the
 *  in-memory markdown is the single source of truth for the publish cycle. */
interface EditorBlock {
  readonly id: string;
  readonly raw: string;
}

/** The four block shapes the live-preview recognises from leading markers. */
type ParsedKind = 'h1' | 'h2' | 'blockquote' | 'paragraph';

/** A presentational formatting affordance in the editor toolbar. */
interface FormatTool {
  readonly label: string;
  readonly glyph: string;
  readonly italic?: boolean;
}

/** The lifecycle state of one publish stage surfaced in the dialog's `cp-steps`. */
type StageState = 'pending' | 'running' | 'done' | 'failed';

/** One staged-publish step: a label plus its live lifecycle state. */
interface PublishStage {
  readonly label: string;
  readonly state: StageState;
}

/** Language variants, surfaced as `cp-tabs`. */
const LANG_TABS: readonly CpTab[] = [
  { id: 'ru', label: 'Русский' },
  { id: 'en', label: 'English' },
  { id: 'it', label: 'Italiano' },
];

/** Presentational toolbar affordances (block/inline formatting placeholders). */
const FORMAT_TOOLS: readonly FormatTool[] = [
  { label: 'Заголовок', glyph: 'H' },
  { label: 'Жирный', glyph: 'B' },
  { label: 'Курсив', glyph: 'I', italic: true },
  { label: 'Цитата', glyph: '„' },
  { label: 'Список', glyph: '•' },
];

/** Frontmatter «Тема» options; the empty value keeps the field incomplete. */
const TOPIC_OPTIONS: readonly CpSelectOption[] = [
  { value: '', label: '— выберите тему —' },
  { value: 'translation', label: 'Наш перевод' },
  { value: 'editorial', label: 'От редакции' },
  { value: 'primer', label: 'Ликбез' },
];

/** Frontmatter «Рубрика» options. */
const RUBRIC_OPTIONS: readonly CpSelectOption[] = [
  { value: 'economics', label: 'Экономика' },
  { value: 'theory', label: 'Теория' },
  { value: 'critique', label: 'Критика' },
];

/** The real publish pipeline stages, mapped to `stageFile` + `commitAndPush`. */
const REAL_STAGES: readonly string[] = ['Стейдж', 'Коммит', 'Пуш'];

/** Reads a single frontmatter scalar (`key: value`) from a text block. */
const frontmatterValue = (text: string, key: string): string | undefined => {
  const match = text.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match ? (match.at(1) ?? '').trim().replace(/^["']|["']$/g, '') : undefined;
};

/** Splits a raw markdown document into its frontmatter block, `title` and body. */
const parseArticle = (
  markdown: string,
): { readonly frontmatter: string; readonly title: string; readonly body: string } => {
  const match = markdown.match(/^---\r?\n[\s\S]*?\r?\n---/);
  if (match) {
    const frontmatter = match[0];
    const body = markdown.slice(frontmatter.length).replace(/^\s+/, '');
    return { frontmatter, title: frontmatterValue(frontmatter, 'title') ?? '', body };
  }
  return { frontmatter: '', title: '', body: markdown };
};

/** Splits a markdown body into trimmed, non-empty blocks separated by blank lines. */
const splitBlocks = (body: string): readonly string[] =>
  body
    .split(/\r?\n\s*\r?\n/)
    .map((block) => block.trim())
    .filter((block) => block.length > 0);

/** Classifies a raw block by its leading markdown marker. */
const blockKind = (raw: string): ParsedKind => {
  if (raw.startsWith('# ')) return 'h1';
  if (raw.startsWith('## ')) return 'h2';
  if (raw.startsWith('> ')) return 'blockquote';
  return 'paragraph';
};

/** Strips the leading block marker so the rendered preview shows clean prose. */
const stripMarker = (raw: string, kind: ParsedKind): string => {
  if (kind === 'h1') return raw.replace(/^#\s+/, '');
  if (kind === 'h2') return raw.replace(/^##\s+/, '');
  if (kind === 'blockquote') return raw.replace(/^>\s?/gm, '');
  return raw;
};

/** Renders inline markdown (`**bold**`, `[^n]` footnotes) into typographic nodes. */
const renderInline = (text: string): readonly (TemplateResult | string)[] => {
  const nodes: (TemplateResult | string)[] = [];
  let last = 0;
  for (const match of text.matchAll(/\*\*(.+?)\*\*|\[\^([^\]]+)\]/g)) {
    const index = match.index ?? 0;
    if (index > last) nodes.push(text.slice(last, index));
    const bold = match.at(1);
    const footnote = match.at(2);
    if (bold !== undefined) nodes.push(html`<strong>${bold}</strong>`);
    else if (footnote !== undefined) nodes.push(html`<sup class="ref">${footnote}</sup>`);
    last = index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return nodes;
};

/**
 * Obsidian-style live-preview article editor (content-editor, design.md R6).
 *
 * The headline surface of the content-editor capability, now wired to REAL data:
 * on connect it calls `listArticles()`, picks the first real article and
 * `readFile`s its `blog/<slug>/index.<lang>.md` (ru preferred), keeping the raw
 * markdown as the single source of truth in `@state`. If the git engine is off it
 * falls back to a bundled demo document so the preview always renders; a
 * `cp-tag` marks the source as «данные из репозитория» vs «демо-данные».
 *
 * The body renders in the public site's typography (gradient frontmatter H1,
 * lede, body, subheading, blockquote) split into blocks by blank lines; the
 * single FOCUSED block reveals its raw markdown markers by becoming a
 * `--font-mono`/`--color-accent` textarea whose input updates the in-memory
 * markdown. A sticky toolbar hosts presentational formatting affordances, a
 * «Свойства» `cp-sheet` of frontmatter, the ru/en/it language `cp-tabs`, and the
 * primary «Опубликовать» action.
 *
 * «Опубликовать» opens a `cp-dialog` staging the pipeline via `cp-steps`
 * (Стейдж → Коммит → Пуш). With the engine live it runs the real cycle —
 * `stageFile(path, editedMarkdown)` then `commitAndPush('<title>: правка из
 * редактора')` — advancing the steps from the actual results, surfacing the
 * returned commit `sha` on success and the raw `error` via a `cp-banner
 * tone="danger"` on failure (auth/permission errors are shown, never swallowed).
 * With the engine off it merely simulates the staged steps — no real calls.
 *
 * Self-contained: own Shadow DOM + token-driven styles, no ad-hoc chrome.
 */
@customElement('screen-editor')
export class ScreenEditor extends LitElement {
  static override styles = css`
    :host {
      display: block;
      font-family: var(--font-sans);
      color: var(--color-text-primary);
      line-height: 1.6;
    }

    .ed {
      max-width: 44rem;
      margin-inline: auto;
    }

    .head {
      display: flex;
      align-items: center;
      flex-wrap: wrap;
      gap: var(--spacing-sm);
      margin-bottom: var(--spacing-md);
    }
    .eyebrow {
      flex-basis: 100%;
      margin: 0;
      font-size: 0.8rem;
      color: var(--color-text-secondary);
    }
    h1.title {
      margin: 0;
      flex: 1 1 auto;
      font-size: clamp(2rem, 6.5vw, 2.7rem);
      line-height: 1.12;
      font-weight: 700;
      background: linear-gradient(135deg, var(--color-accent), var(--color-text-primary));
      -webkit-background-clip: text;
      background-clip: text;
      color: transparent;
    }

    cp-tabs {
      display: block;
      margin-bottom: var(--spacing-md);
    }

    .toolbar {
      position: sticky;
      /* Stick just below the app header instead of colliding with it. */
      top: var(--app-header-h, 3.75rem);
      z-index: 5;
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.15rem;
      padding: 0.35rem;
      margin-bottom: var(--spacing-lg);
      background: var(--color-background);
      border-bottom: 1px solid var(--color-border);
    }
    .toolbar .t {
      width: 2.2rem;
      height: 2.2rem;
      flex: none;
      border: none;
      background: transparent;
      border-radius: var(--radius-sm);
      display: grid;
      place-items: center;
      color: var(--color-text-secondary);
      font: inherit;
      font-weight: 700;
      cursor: pointer;
      transition: background var(--transition-fast), color var(--transition-fast);
    }
    .toolbar .t.i {
      font-style: italic;
    }
    .toolbar .t:hover {
      background: var(--color-surface);
      color: var(--color-text-primary);
    }
    .toolbar .t:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 2px;
    }
    .toolbar .sep {
      width: 1px;
      height: 1.2rem;
      background: var(--color-border);
      margin: 0 0.3rem;
    }
    .toolbar .spacer {
      flex: 1;
    }

    .live {
      font-size: 1.14rem;
      line-height: 1.7;
    }
    .blk {
      padding: 0.15rem 0.55rem;
      margin-inline: -0.55rem;
      border-radius: var(--radius-sm);
      cursor: text;
      caret-color: var(--color-accent);
      transition: background var(--transition-fast);
    }
    .blk:hover {
      background: var(--color-surface);
    }
    .blk:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 1px;
    }
    .blk + .blk,
    .blk-edit + .blk,
    .blk + .blk-edit,
    .blk-edit + .blk-edit {
      margin-top: var(--spacing-sm);
    }
    p.blk {
      margin: 0;
    }
    h2.blk {
      margin: var(--spacing-md) 0 0;
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1.2;
    }
    h2.blk.h1 {
      font-size: 1.9rem;
    }
    p.blk.lede {
      color: var(--color-text-secondary);
      font-size: 1.22rem;
    }
    blockquote.blk {
      margin: var(--spacing-sm) 0 0;
      border-left: 3px solid var(--color-accent);
      padding-left: 0.9rem;
      color: var(--color-text-secondary);
      font-style: italic;
    }

    .blk-edit {
      display: block;
      width: calc(100% + 1.1rem);
      box-sizing: border-box;
      margin-inline: -0.55rem;
      padding: 0.35rem 0.55rem;
      border: none;
      border-radius: var(--radius-sm);
      background: var(--accent-bg);
      color: var(--color-accent);
      font-family: var(--font-mono);
      font-size: 1rem;
      line-height: 1.6;
      resize: vertical;
      caret-color: var(--color-accent);
    }
    .blk-edit:focus-visible {
      outline: 2px solid var(--color-accent);
      outline-offset: 1px;
    }

    sup.ref {
      color: var(--color-accent);
      font-weight: 700;
      font-size: 0.7em;
    }

    .hint {
      margin-top: var(--spacing-md);
      font-size: 0.88rem;
      color: var(--color-text-secondary);
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.5rem;
    }
    .kbd {
      font-family: var(--font-mono);
      font-size: 0.82rem;
      padding: 0.05rem 0.4rem;
      border: 1px solid var(--color-border);
      border-bottom-width: 2px;
      border-radius: var(--radius-sm);
      color: var(--color-text-secondary);
    }

    .save-note {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-top: var(--spacing-lg);
      padding-top: var(--spacing-md);
      border-top: 1px solid var(--color-hairline);
      font-size: 0.88rem;
      color: var(--color-text-secondary);
    }
    .save-note .draft {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: var(--draft);
      font-weight: 600;
    }
    .save-note cp-icon {
      color: var(--draft);
    }
    .save-note .path {
      font-family: var(--font-mono);
      font-size: 0.82rem;
    }

    .sheet-form {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-md);
    }

    .dialog-note {
      margin: var(--spacing-md) 0 0;
      color: var(--color-text-secondary);
      font-size: 0.9rem;
    }
    cp-banner {
      margin-top: var(--spacing-md);
    }
    .dialog-foot {
      display: flex;
      justify-content: flex-end;
      gap: var(--spacing-sm);
    }

    @media (prefers-reduced-motion: reduce) {
      .blk {
        transition: none;
      }
    }
  `;

  /** Raw markdown frontmatter block (`---…---`) preserved verbatim for staging. */
  @state() private frontmatter = '';

  /** Frontmatter `title`, shown in the gradient H1. */
  @state() private articleTitle = '';

  /** The article body markdown — the in-memory source of truth for the editor. */
  @state() private body = '';

  /** Id of the block currently revealing/editing its raw markdown; '' reveals none. */
  @state() private focusedBlock = '';

  /** Repo-relative path of the loaded article, e.g. `blog/<slug>/index.ru.md`. */
  @state() private articlePath = '';

  /** Slug of the loaded real article ('' in demo mode). */
  @state() private slug = '';

  /** Languages the real article exists in (drives which tabs load live data). */
  @state() private availableLangs: readonly string[] = [];

  /** Whether the markdown came from the real repo (vs the bundled demo). */
  @state() private live = false;

  /** Whether the initial read has completed (gates the demo `cp-tag`). */
  @state() private loaded = false;

  /** Active language variant driving the `cp-tabs`. */
  @state() private activeLang = 'ru';

  /** Frontmatter slide-over visibility. */
  @state() private propsOpen = false;

  /** Selected «Тема»; empty keeps the material incomplete. */
  @state() private topic = '';

  /** Selected «Рубрика». */
  @state() private rubric = 'theory';

  /** Publication date (ISO), seeded from frontmatter when present. */
  @state() private pubDate = '2026-07-24';

  /** «Опубликовано» frontmatter switch. */
  @state() private published = false;

  /** Publish confirmation dialog visibility. */
  @state() private publishOpen = false;

  /** Whether the publish pipeline is in flight (blocks dismissal). */
  @state() private publishBusy = false;

  /** Per-stage lifecycle states mirrored into `cp-steps`. */
  @state() private stageStates: readonly StageState[] = [];

  /** Commit sha returned by a successful real push ('' otherwise). */
  @state() private publishSha = '';

  /** Error surfaced by a failed real push ('' otherwise); never swallowed. */
  @state() private publishError = '';

  /** Set when a user click should move focus into the freshly-rendered textarea. */
  private pendingFocus = false;

  /** Slug currently loaded, to detect same-screen route changes. */
  private loadedSlug = '';

  /** Unsubscribes the engine-ready listener on disconnect. */
  private disposeReady: () => void = () => {};

  override connectedCallback(): void {
    super.connectedCallback();
    this.loadedSlug = this.routeSlug();
    void this.load();
    globalThis.addEventListener('hashchange', this.onHashChange);
    // First-load race (QA #12): if the engine was still cloning the repo, our
    // first read found no article. Re-read when it is ready — but never clobber
    // an intentional new draft or an already-loaded article.
    this.disposeReady = onEngineReady(() => {
      if (this.slug === '' && this.routeSlug() !== 'new') void this.load();
    });
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    globalThis.removeEventListener('hashchange', this.onHashChange);
    this.disposeReady();
  }

  // Re-load when the editor stays mounted but the requested slug changes
  // (back/forward, or opening another article without leaving the editor).
  private onHashChange = (): void => {
    const next = this.routeSlug();
    if (next !== this.loadedSlug && window.location.hash.startsWith('#/editor')) {
      this.loadedSlug = next;
      void this.load();
    }
  };

  /** Slug requested via the route (`#/editor/<slug>`), '' for the default. */
  private routeSlug(): string {
    return window.location.hash.split('/')[2] ?? '';
  }

  private async load(): Promise<void> {
    const articles = await listArticles();
    // Open the article the route names — clicking a card must open THAT article,
    // not always the first one. `new` starts a blank document; a missing/unknown
    // slug falls back to the first article.
    const requested = this.routeSlug();
    if (requested === 'new') {
      this.startNewArticle();
      this.loaded = true;
      return;
    }
    const target =
      (requested !== '' ? articles.find((a) => a.slug === requested) : undefined) ?? articles.at(0);
    if (target !== undefined) {
      const lang = target.languages.includes('ru') ? 'ru' : (target.languages.at(0) ?? 'ru');
      const path = `blog/${target.slug}/index.${lang}.md`;
      const markdown = await readFile(path);
      if (markdown !== undefined && markdown.trim() !== '') {
        this.slug = target.slug;
        this.availableLangs = target.languages;
        this.activeLang = lang === 'ru' || lang === 'en' || lang === 'it' ? lang : 'ru';
        this.applyMarkdown(markdown, path, true);
        this.loaded = true;
        return;
      }
    }
    // No real article (signed out or empty repo): stay empty and prompt sign-in
    // rather than loading a fabricated demo document.
    this.loaded = true;
  }

  /** Seeds a blank new-article document (real save-to-new-file is a follow-up). */
  private startNewArticle(): void {
    this.slug = '';
    this.availableLangs = ['ru'];
    this.activeLang = 'ru';
    this.applyMarkdown('---\ntitle: ""\nlang: ru\ncategory: \npublished: false\n---\n\n', '', true);
  }

  private async loadLang(lang: string): Promise<void> {
    const path = `blog/${this.slug}/index.${lang}.md`;
    const markdown = await readFile(path);
    if (markdown !== undefined && markdown.trim() !== '') {
      this.applyMarkdown(markdown, path, true);
    }
  }

  private applyMarkdown(markdown: string, path: string, live: boolean): void {
    const parsed = parseArticle(markdown);
    const fm = parsed.frontmatter;
    this.frontmatter = fm;
    this.articleTitle = parsed.title;
    this.body = parsed.body;
    this.articlePath = path;
    this.live = live;
    // Seed the Свойства fields from the real frontmatter — "Тема" maps to the
    // article's `category`. Without this seed the required-field check below
    // always fired a false "заполните Тема" warning.
    this.topic = frontmatterValue(fm, 'category') ?? frontmatterValue(fm, 'topic') ?? '';
    const date = frontmatterValue(fm, 'pubDate') ?? frontmatterValue(fm, 'date');
    if (date !== undefined) this.pubDate = date;
    const published = frontmatterValue(fm, 'published');
    this.published =
      published !== undefined ? published === 'true' : frontmatterValue(fm, 'draft') !== 'true';
  }

  /**
   * Reconstructs the full markdown from the frontmatter + edited body, writing
   * the Свойства edits (category/pubDate/published) back into the frontmatter so
   * a publish actually persists them instead of silently discarding them.
   */
  private get editedMarkdown(): string {
    let fm = this.frontmatter;
    if (fm !== '') {
      if (this.topic !== '') fm = upsertFrontmatterField(fm, 'category', this.topic);
      if (this.pubDate !== '') fm = upsertFrontmatterField(fm, 'pubDate', this.pubDate);
      fm = upsertFrontmatterField(fm, 'published', String(this.published));
    }
    const body = this.body.trimEnd();
    return fm === '' ? `${body}\n` : `${fm}\n\n${body}\n`;
  }

  /** A required frontmatter field is empty. */
  private get incomplete(): boolean {
    return this.topic === '';
  }

  private onLangChange = (event: Event): void => {
    if (event instanceof CustomEvent) {
      const id: unknown = event.detail?.id;
      if (id === 'ru' || id === 'en' || id === 'it') {
        this.activeLang = id;
        if (this.live && this.slug !== '') void this.loadLang(id);
      }
    }
  };

  private onTopicChange = (event: Event): void => {
    if (event instanceof CustomEvent) {
      const value: unknown = event.detail?.value;
      if (typeof value === 'string') {
        this.topic = value;
      }
    }
  };

  private onRubricChange = (event: Event): void => {
    if (event instanceof CustomEvent) {
      const value: unknown = event.detail?.value;
      if (typeof value === 'string') {
        this.rubric = value;
      }
    }
  };

  private onDateChange = (event: Event): void => {
    if (event instanceof CustomEvent) {
      const value: unknown = event.detail?.value;
      if (typeof value === 'string') {
        this.pubDate = value;
      }
    }
  };

  private onPublishedChange = (event: Event): void => {
    if (event instanceof CustomEvent) {
      const checked: unknown = event.detail?.checked;
      if (typeof checked === 'boolean') {
        this.published = checked;
      }
    }
  };

  private openProps = (): void => {
    this.propsOpen = true;
  };

  private closeProps = (): void => {
    this.propsOpen = false;
  };

  private startPublish = (): void => {
    this.publishOpen = true;
    this.publishSha = '';
    this.publishError = '';
    if (this.articlePath === '') {
      // New-article documents have no target file yet — saving to a new
      // blog/<slug>/index.<lang>.md is a separate flow, not a silent no-op.
      this.stageStates = ['failed', 'pending', 'pending'];
      this.publishError = 'Новый материал: сохранение в новый файл пока в разработке.';
      return;
    }
    void this.runRealPublish();
  };

  /** Runs the REAL git cycle: stage the edited markdown, then commit + push. */
  private async runRealPublish(): Promise<void> {
    this.publishBusy = true;
    this.stageStates = ['running', 'pending', 'pending'];
    const staged = await stageFile(this.articlePath, this.editedMarkdown);
    if (!staged) {
      this.stageStates = ['failed', 'pending', 'pending'];
      this.publishError = `Не удалось подготовить «${this.articlePath}» к коммиту.`;
      this.publishBusy = false;
      return;
    }
    this.stageStates = ['done', 'running', 'pending'];
    const message = `${this.articleTitle === '' ? 'Материал' : this.articleTitle}: правка из редактора`;
    const result = await commitAndPush(message);
    if (result.ok && result.sha !== undefined) {
      this.stageStates = ['done', 'done', 'done'];
      this.publishSha = result.sha;
    } else {
      this.stageStates = ['done', 'failed', 'failed'];
      this.publishError = result.error ?? 'Коммит или пуш не удался.';
    }
    this.publishBusy = false;
  }

  private closePublish = (): void => {
    if (this.publishBusy) return;
    this.publishOpen = false;
    this.stageStates = [];
    this.publishSha = '';
    this.publishError = '';
  };

  private publishStepList(): readonly PublishStage[] {
    return REAL_STAGES.map((label, index) => ({
      label,
      state: this.stageStates.at(index) ?? 'pending',
    }));
  }

  private renderToolbar(): TemplateResult {
    return html`
      <div class="toolbar" role="toolbar" aria-label="Форматирование материала">
        ${FORMAT_TOOLS.map(
          (tool) => html`
            <button
              class="t ${tool.italic ? 'i' : ''}"
              type="button"
              title=${tool.label}
              aria-label=${tool.label}
            >
              ${tool.glyph}
            </button>
          `,
        )}
        <span class="sep" aria-hidden="true"></span>
        <button class="t" type="button" title="Изображение" aria-label="Вставить изображение">
          <cp-icon name="upload" size="18"></cp-icon>
        </button>
        <span class="spacer"></span>
        <cp-button variant="ghost" size="sm" @cp-click=${this.openProps}>
          ${this.incomplete ? html`<cp-icon name="warning" size="16"></cp-icon>` : nothing}
          Свойства
        </cp-button>
        <cp-button size="sm" arrow @cp-click=${this.startPublish}>Опубликовать</cp-button>
      </div>
    `;
  }

  private renderProps(): TemplateResult {
    return html`
      <cp-sheet
        ?open=${this.propsOpen}
        heading="Свойства материала"
        @cp-close=${this.closeProps}
      >
        <div class="sheet-form">
          ${this.incomplete
            ? html`<cp-tag tone="warning">заполните обязательное поле «Тема»</cp-tag>`
            : nothing}
          <cp-select
            label="Тема"
            required
            .value=${this.topic}
            .options=${TOPIC_OPTIONS}
            @cp-change=${this.onTopicChange}
          ></cp-select>
          <cp-select
            label="Рубрика"
            .value=${this.rubric}
            .options=${RUBRIC_OPTIONS}
            @cp-change=${this.onRubricChange}
          ></cp-select>
          <cp-date-input
            label="Дата публикации"
            type="date"
            .value=${this.pubDate}
            @cp-change=${this.onDateChange}
          ></cp-date-input>
          <cp-switch
            label="Опубликовано"
            ?checked=${this.published}
            @cp-change=${this.onPublishedChange}
          ></cp-switch>
        </div>
      </cp-sheet>
    `;
  }

  private renderDialogBody(): TemplateResult {
    if (this.publishError !== '') {
      return html`<cp-banner tone="danger" title="Публикация не удалась"
        >${this.publishError}</cp-banner
      >`;
    }
    if (this.publishSha !== '') {
      return html`<cp-banner tone="success" title="Отправлено в репозиторий"
        >Коммит <code>${this.publishSha}</code> запушен в контент-репозиторий.</cp-banner
      >`;
    }
    return html`<p class="dialog-note">
      Файл <code>${this.articlePath}</code> будет застейджен, закоммичен и запушен через git-движок.
    </p>`;
  }

  private renderPublishDialog(): TemplateResult {
    return html`
      <cp-dialog
        ?open=${this.publishOpen}
        ?busy=${this.publishBusy}
        heading="Публикация материала"
        @cp-cancel=${this.closePublish}
      >
        <cp-steps .steps=${this.publishStepList()}></cp-steps>
        ${this.renderDialogBody()}
        <div slot="footer" class="dialog-foot">
          ${this.publishBusy
            ? html`<cp-button variant="secondary" disabled>Публикуется…</cp-button>`
            : html`<cp-button arrow @cp-click=${this.closePublish}
                >${this.publishError !== '' ? 'Закрыть' : 'Готово'}</cp-button
              >`}
        </div>
      </cp-dialog>
    `;
  }

  override render(): TemplateResult {
    if (!this.live) {
      return html`
        <article class="ed">
          <div class="head">
            <p class="eyebrow">Контент · редактор</p>
            <h1 class="title" tabindex="-1">Редактор</h1>
          </div>
          <p class="hint">
            ${this.loaded
              ? 'Войдите через GitHub, чтобы открыть материалы репозитория для правки.'
              : 'Загружаем материал…'}
          </p>
        </article>
      `;
    }
    return html`
      <article class="ed">
        <div class="head">
          <p class="eyebrow">Контент · ${this.slug} · черновик</p>
          <h1 class="title" tabindex="-1">
            ${this.articleTitle === '' ? 'Без названия' : this.articleTitle}
          </h1>
          <cp-tag tone="success">данные из репозитория</cp-tag>
        </div>
        <cp-tabs
          .tabs=${LANG_TABS}
          active=${this.activeLang}
          @cp-tab-change=${this.onLangChange}
        ></cp-tabs>
        ${this.renderToolbar()}
        <cp-markdown-editor
          class="live"
          .value=${this.body}
          placeholder="Текст статьи в Markdown…"
          @cp-change=${(event: CustomEvent<{ value: string }>) =>
            (this.body = event.detail.value)}
        ></cp-markdown-editor>
        <p class="hint">
          Живой предпросмотр: форматирование отрендерено сразу, а разметку
          <span class="kbd">#</span> <span class="kbd">**</span>
          <span class="kbd">&gt;</span> видно только на строке с курсором.
        </p>
        <p class="save-note">
          <cp-icon name="warning" size="16"></cp-icon>
          <span class="draft">несохранённые правки</span>
          <span aria-hidden="true">·</span>
          <span>${this.activeLang}</span>
          <span aria-hidden="true">·</span>
          <span class="path">${this.articlePath}</span>
        </p>
      </article>
      ${this.renderProps()}${this.renderPublishDialog()}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'screen-editor': ScreenEditor;
  }
}
