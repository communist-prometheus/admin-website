import { LitElement, html, css, nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { customElement, query, state } from 'lit/decorators.js';
import '@communist-prometheus/cp-components';
import type { CpSelectOption, CpTab } from '@communist-prometheus/cp-components';
import type { CpMarkdownEditor } from '../editor/cp-markdown-editor.js';
import {
  readFileViaApi,
  articleLangsViaApi,
  publishFileViaApi,
  upsertFrontmatterField,
  readFrontmatterField,
  upsertFrontmatterBlock,
} from '../engine/content.js';

/** One editable article block: a stable id plus its raw markdown source line(s).
 *  The rendered typography is derived from the raw text on every render, so the
 *  in-memory markdown is the single source of truth for the publish cycle. */
interface EditorBlock {
  readonly id: string;
  readonly raw: string;
}

/** The four block shapes the live-preview recognises from leading markers. */
type ParsedKind = 'h1' | 'h2' | 'blockquote' | 'paragraph';

/** A formatting affordance in the editor toolbar wired to a CodeMirror command. */
interface FormatTool {
  readonly label: string;
  readonly glyph: string;
  readonly italic?: boolean;
  /** Inline wrap markers (e.g. `**`/`**` for bold); mutually exclusive with prefix. */
  readonly wrap?: readonly [string, string];
  /** Line prefix (e.g. `## ` for a heading); mutually exclusive with wrap. */
  readonly prefix?: string;
}

/** The lifecycle state of one publish stage surfaced in the dialog's `cp-steps`. */
type StageState = 'pending' | 'running' | 'done' | 'failed';

/** One staged-publish step: a label plus its live lifecycle state. */
interface PublishStage {
  readonly label: string;
  readonly state: StageState;
}

/** Display labels for known language codes; any other code falls back to its
 * uppercased code, so an article in es/uk/pl/… still gets a usable tab. */
const LANG_LABELS: Readonly<Record<string, string>> = {
  ru: 'Русский',
  en: 'English',
  it: 'Italiano',
  es: 'Español',
  uk: 'Українська',
  pl: 'Polski',
  bl: 'Беларуская',
};

/** Builds the language tabs from the codes an article actually has. */
const langTabs = (codes: readonly string[]): readonly CpTab[] =>
  codes.map((code) => ({ id: code, label: LANG_LABELS[code] ?? code.toUpperCase() }));

/** Presentational toolbar affordances (block/inline formatting placeholders). */
const FORMAT_TOOLS: readonly FormatTool[] = [
  { label: 'Заголовок', glyph: 'H', prefix: '## ' },
  { label: 'Жирный', glyph: 'B', wrap: ['**', '**'] },
  { label: 'Курсив', glyph: 'I', italic: true, wrap: ['_', '_'] },
  { label: 'Цитата', glyph: '„', prefix: '> ' },
  { label: 'Список', glyph: '•', prefix: '- ' },
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

/** Publish is now a single GitHub API commit of the one edited file. */
const REAL_STAGES: readonly string[] = ['Публикация'];

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
      /* Wide children (the language tabs) must adapt inside their own scroll
         strip, not push the column — so no clipping is needed here. */
      min-width: 0;
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

    /* The language tabs can be wider than a phone (5 native names); let them
       scroll horizontally inside their own strip instead of widening the page. */
    .tabs-scroll {
      max-width: 100%;
      overflow-x: auto;
      margin-bottom: var(--spacing-md);
    }
    cp-tabs {
      display: block;
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
      min-width: 0;
      overflow-wrap: anywhere;
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
      max-width: 100%;
    }
    /* A commit sha / long path in a monospace code span can't line-break and
       would push the dialog past a phone's viewport — force it to wrap. */
    cp-banner code,
    .dialog-note code {
      overflow-wrap: anywhere;
      word-break: break-word;
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

  /** True once the user edits the body or a property; drives the save note. */
  @state() private dirty = false;

  /** Active language variant driving the `cp-tabs`. */
  @state() private activeLang = 'ru';

  /** Frontmatter slide-over visibility. */
  @state() private propsOpen = false;

  /** Selected «Тема»; empty keeps the material incomplete. */
  @state() private topic = '';

  /** Article description frontmatter, seeded from the file + written back. */
  @state() private description = '';

  /** The description as loaded, so writeback only fires when the user changed it. */
  private descriptionSeed = '';

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

  /** Set when the single-article API load fails (shown instead of a spinner). */
  @state() private loadError = '';

  /** Set when a user click should move focus into the freshly-rendered textarea. */
  private pendingFocus = false;

  /** Slug currently loaded, to detect same-screen route changes. */
  private loadedSlug = '';

  /** Repo folder of the loaded item: `blog` (article) or `magazine` (issue). */
  private collection = 'blog';

  /**
   * In-memory edits per language for the current article. Switching the language
   * tab stashes the active language's edited markdown here so switching back
   * restores unsaved work instead of reloading the on-disk version (QA #8).
   * Cleared whenever a different article loads.
   */
  private readonly langBuffers = new Map<string, string>();

  override connectedCallback(): void {
    super.connectedCallback();
    // Lazy-load the CodeMirror editor only when the editor screen mounts, so all
    // of CM6 stays out of the initial bundle. LitElement preserves the `.value`
    // binding across the element's upgrade, so no ready-gate is needed.
    void import('../editor/cp-markdown-editor.js');
    this.loadedSlug = this.routeSlug();
    void this.load();
    globalThis.addEventListener('hashchange', this.onHashChange);
    // The article is read directly from the GitHub API, so there is no engine
    // clone to wait on — no ready-gate re-read needed.
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    globalThis.removeEventListener('hashchange', this.onHashChange);
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

  /**
   * The item the route names: `#/editor/<slug>` (a blog article, the default) or
   * `#/editor/magazine/<slug>` (a journal issue). The collection selects the repo
   * folder so the same editor edits both.
   */
  private routeTarget(): { collection: string; slug: string } {
    const parts = window.location.hash.split('/');
    if (parts[2] === 'magazine') return { collection: 'magazine', slug: parts[3] ?? '' };
    return { collection: 'blog', slug: parts[2] ?? '' };
  }

  /** Slug requested via the route ('' for the default, 'new' for a blank doc). */
  private routeSlug(): string {
    return this.routeTarget().slug;
  }

  private async load(): Promise<void> {
    // A fresh article invalidates any per-language edits from the previous one.
    this.langBuffers.clear();
    const { collection, slug: requested } = this.routeTarget();
    this.collection = collection;
    if (requested === 'new') {
      this.startNewArticle();
      this.loaded = true;
      return;
    }
    if (requested === '') {
      this.loaded = true;
      return;
    }
    // Fetch ONLY the opened item via the GitHub API — its languages (one dir
    // listing) then the preferred file — instead of cloning the whole repo. This
    // is what the loading spinner used to wait on forever. Works for a blog
    // article or a magazine issue via the collection folder.
    this.loadError = '';
    const langs = await articleLangsViaApi(requested, collection);
    if (langs.length === 0) {
      this.loadError = 'Не удалось загрузить материал (нет доступа или его нет в репозитории).';
      this.loaded = true;
      return;
    }
    const lang = langs.includes('ru') ? 'ru' : (langs[0] ?? 'ru');
    const path = `${collection}/${requested}/index.${lang}.md`;
    const markdown = await readFileViaApi(path);
    if (markdown !== undefined && markdown.trim() !== '') {
      this.slug = requested;
      this.availableLangs = langs;
      this.activeLang = lang;
      this.applyMarkdown(markdown, path, true);
    } else {
      this.loadError = `Не удалось загрузить «${path}».`;
    }
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
    const path = `${this.collection}/${this.slug}/index.${lang}.md`;
    const markdown = await readFileViaApi(path);
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
    // Block-scalar aware: descriptions are stored as folded (`>-`) blocks, so a
    // naive single-line read would seed just ">-" and a publish would overwrite
    // the real text. Seed the full text and remember it to only write on change.
    this.description = readFrontmatterField(fm, 'description') ?? '';
    this.descriptionSeed = this.description;
    // Content is inconsistent: some articles use `pubDate`, some `publishDate`
    // (magazine-era), some `date`. Read all three so every article carries a real
    // date (else half the list has no date and clumps at the end when sorted).
    const date =
      frontmatterValue(fm, 'pubDate') ??
      frontmatterValue(fm, 'publishDate') ??
      frontmatterValue(fm, 'date');
    if (date !== undefined) this.pubDate = date;
    const published = frontmatterValue(fm, 'published');
    this.published =
      published !== undefined ? published === 'true' : frontmatterValue(fm, 'draft') !== 'true';
    // Freshly loaded content is not "unsaved" — clear the dirty flag the save
    // note reads (it used to be hardcoded on, flagging every article).
    this.dirty = false;
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
      // Only rewrite the description when the user actually edited it, so an
      // untouched folded-block description is left byte-identical (no orphaned
      // continuation lines); a real edit is re-emitted as a clean literal block.
      if (this.description !== this.descriptionSeed)
        fm = upsertFrontmatterBlock(fm, 'description', this.description);
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
      if (typeof id === 'string' && this.availableLangs.includes(id) && id !== this.activeLang) {
        // Stash the outgoing language's edits before swapping the buffers in.
        if (this.slug !== '') this.langBuffers.set(this.activeLang, this.editedMarkdown);
        this.activeLang = id;
        if (this.live && this.slug !== '') void this.switchLang(id);
      }
    }
  };

  /**
   * Shows the requested language: restores an in-memory edit if one exists,
   * otherwise reads the on-disk version. Keeps unsaved work across tab switches.
   */
  private async switchLang(lang: string): Promise<void> {
    const buffered = this.langBuffers.get(lang);
    if (buffered !== undefined) {
      this.applyMarkdown(buffered, `blog/${this.slug}/index.${lang}.md`, true);
      return;
    }
    await this.loadLang(lang);
  }

  // The editor's cp-change only fires for real user edits (the component
  // suppresses the programmatic value sync), so marking dirty here is safe.
  private onBodyChange = (event: CustomEvent<{ value: string }>): void => {
    this.body = event.detail.value;
    this.dirty = true;
  };

  private onTopicChange = (event: Event): void => {
    if (event instanceof CustomEvent) {
      const value: unknown = event.detail?.value;
      if (typeof value === 'string') {
        this.topic = value;
        this.dirty = true;
      }
    }
  };

  private onRubricChange = (event: Event): void => {
    if (event instanceof CustomEvent) {
      const value: unknown = event.detail?.value;
      if (typeof value === 'string') {
        this.rubric = value;
        this.dirty = true;
      }
    }
  };

  private onDateChange = (event: Event): void => {
    if (event instanceof CustomEvent) {
      const value: unknown = event.detail?.value;
      if (typeof value === 'string') {
        this.pubDate = value;
        this.dirty = true;
      }
    }
  };

  private onDescriptionChange = (event: Event): void => {
    if (event instanceof CustomEvent) {
      const value: unknown = event.detail?.value;
      if (typeof value === 'string') {
        this.description = value;
        this.dirty = true;
      }
    }
  };

  private onPublishedChange = (event: Event): void => {
    if (event instanceof CustomEvent) {
      const checked: unknown = event.detail?.checked;
      if (typeof checked === 'boolean') {
        this.published = checked;
        this.dirty = true;
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

  /** Publishes the ONE edited file via the GitHub API — a single-file commit,
   *  no clone and no whole-repo push. */
  private async runRealPublish(): Promise<void> {
    this.publishBusy = true;
    this.stageStates = ['running'];
    const message = `${this.articleTitle === '' ? 'Материал' : this.articleTitle}: правка из редактора`;
    const result = await publishFileViaApi(this.articlePath, this.editedMarkdown, message);
    if (result.ok) {
      this.stageStates = ['done'];
      this.publishSha = result.sha ?? 'ok';
      this.dirty = false;
    } else {
      this.stageStates = ['failed'];
      this.publishError = result.error ?? 'Публикация не удалась.';
    }
    this.publishBusy = false;
  }

  private closePublish = (): void => {
    // Always allow closing — a hung publish must never trap the user in the
    // dialog. Abandoning it clears the busy flag; the timed-out SW op resolves
    // to a no-op (the file is already staged locally, so a re-publish is safe).
    this.publishBusy = false;
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

  /** The live markdown editor, so the toolbar can drive CodeMirror commands. */
  @query('cp-markdown-editor') private bodyEditor?: CpMarkdownEditor;

  /** Applies a toolbar tool (inline wrap or line prefix) to the editor selection. */
  private applyFormat = (tool: FormatTool): void => {
    const editor = this.bodyEditor;
    if (editor === undefined) return;
    if (tool.wrap !== undefined) editor.wrapSelection(tool.wrap[0], tool.wrap[1]);
    else if (tool.prefix !== undefined) editor.prefixLines(tool.prefix);
  };

  /** Inserts a markdown image placeholder at the caret. */
  private insertImage = (): void => {
    this.bodyEditor?.insertText('![](/assets/image.png)');
  };

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
              @click=${() => this.applyFormat(tool)}
            >
              ${tool.glyph}
            </button>
          `,
        )}
        <span class="sep" aria-hidden="true"></span>
        <button
          class="t"
          type="button"
          title="Изображение"
          aria-label="Вставить изображение"
          @click=${this.insertImage}
        >
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
          <cp-textarea
            label="Описание"
            rows="3"
            .value=${this.description}
            @cp-change=${this.onDescriptionChange}
          ></cp-textarea>
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
        >Коммит <code>${this.publishSha.slice(0, 7)}</code> запушен в
        контент-репозиторий.</cp-banner
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
            ${!this.loaded
              ? 'Загружаем материал…'
              : this.loadError !== ''
                ? this.loadError
                : 'Войдите через GitHub, чтобы открыть материалы репозитория для правки.'}
          </p>
          ${this.loaded && this.loadError !== ''
            ? html`<cp-button variant="secondary" @cp-click=${() => void this.load()}
                >Обновить</cp-button
              >`
            : nothing}
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
        <div class="tabs-scroll">
          <cp-tabs
            .tabs=${langTabs(this.availableLangs)}
            active=${this.activeLang}
            @cp-tab-change=${this.onLangChange}
          ></cp-tabs>
        </div>
        ${this.renderToolbar()}
        <cp-markdown-editor
          class="live"
          .value=${this.body}
          placeholder="Текст статьи в Markdown…"
          @cp-change=${this.onBodyChange}
        ></cp-markdown-editor>
        <p class="hint">
          Живой предпросмотр: форматирование отрендерено сразу, а разметку
          <span class="kbd">#</span> <span class="kbd">**</span>
          <span class="kbd">&gt;</span> видно только на строке с курсором.
        </p>
        <p class="save-note">
          ${this.dirty
            ? html`<cp-icon name="warning" size="16"></cp-icon>
                <span class="draft">несохранённые правки</span>
                <span aria-hidden="true">·</span>`
            : nothing}
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
