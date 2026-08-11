/**
 * Thin content client for the new UI (git-engine R4): reads the cloned repo
 * through the SW's fetch-intercepted content API (`/api/github/tree|file`). Pure
 * fetch + parse — no framework coupling. Returns `undefined` on any failure so
 * screens can fall back to a placeholder rather than throw. Every SW-engine call
 * goes through {@link swFetch}, which re-inits the engine and retries once if the
 * SW reports "not ready" — otherwise content silently reads empty after an SW
 * eviction or a post-deploy SW version bump.
 */
import { swFetch } from './sw-fetch.js';
import { ensureFreshToken } from '@/composables/useAuth/ensure-fresh-token';

/** The active GitHub token for direct REST reads: the injected dev token, else
 * the signed-in session token. Mirrors github-api.ts so the API-first article
 * list works both in local dev:token and on the deployed admin. */
const freshGhToken = async (): Promise<string | undefined> => {
  const dev = import.meta.env.VITE_DEV_TOKEN;
  if (typeof dev === 'string' && dev.length > 0) return dev;
  return (await ensureFreshToken()) ?? undefined;
};

/** One entry in a repo directory listing. */
export interface TreeEntry {
  readonly type: 'file' | 'dir';
  readonly name: string;
  readonly path: string;
}

const isTreeEntry = (x: unknown): x is TreeEntry =>
  typeof x === 'object' && x !== null && 'name' in x && 'path' in x;

/*
 * Read cache: the tree + file reads are the same across every screen and a
 * navigation re-mounts screens that each re-`load()`. Cache only SUCCESSFUL,
 * non-empty reads keyed by path so a pre-engine-ready empty read never sticks
 * (those aren't cached) and screens share results between navigations. Any
 * write (stage/commit) clears the cache, so an edit is never served stale.
 */
const fileCache = new Map<string, string>();
const treeCache = new Map<string, readonly TreeEntry[]>();

/** Drops all cached reads — called on every write so edits are never stale. */
export const clearContentCache = (): void => {
  fileCache.clear();
  treeCache.clear();
};

/**
 * Maps `items` through `fn` with at most `limit` in flight — bounds the
 * `readFile` fan-out (a repo with N articles otherwise opens N parallel reads).
 * Preserves input order in the result.
 */
const mapPool = async <T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>,
): Promise<readonly R[]> => {
  const results = new Array<R>(items.length);
  const queue = items.map((item, index) => ({ item, index }));
  const worker = async (): Promise<void> => {
    for (;;) {
      const job = queue.shift();
      if (job === undefined) return;
      results[job.index] = await fn(job.item, job.index);
    }
  };
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
};

/** Lists a directory in the cloned content repo. */
export const listTree = async (path = ''): Promise<readonly TreeEntry[]> => {
  const cached = treeCache.get(path);
  if (cached !== undefined) return cached;
  try {
    const response = await swFetch(`/api/github/tree?path=${encodeURIComponent(path)}`);
    const data: unknown = await response.json();
    const tree = typeof data === 'object' && data !== null && 'tree' in data ? data.tree : undefined;
    const entries = Array.isArray(tree) ? tree.filter(isTreeEntry) : [];
    if (entries.length > 0) treeCache.set(path, entries);
    return entries;
  } catch {
    return [];
  }
};

/** Stages a file write in the local repo (no commit yet). Returns success. */
/** A local stage is fast; a network push is slower. Bound both so a hung SW git
 * op fails gracefully instead of freezing the publish dialog forever. */
const STAGE_TIMEOUT_MS = 30_000;
const PUSH_TIMEOUT_MS = 90_000;

export const stageFile = async (
  path: string,
  content: string,
): Promise<{ ok: boolean; error?: string }> => {
  clearContentCache();
  try {
    const response = await swFetch(
      '/api/github/file/stage',
      {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ path, content }),
      },
      STAGE_TIMEOUT_MS,
    );
    if (response.ok) return { ok: true };
    // Surface the SW's real reason (e.g. an unsupported lang or a schema
    // rejection) instead of a generic "could not prepare" so a failed publish
    // is diagnosable rather than opaque.
    const data: unknown = await response.json().catch(() => undefined);
    const error =
      typeof data === 'object' && data && 'error' in data
        ? String(Reflect.get(data, 'error'))
        : `stage failed (${response.status})`;
    return { ok: false, error };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
};

/** Commits all staged changes and pushes to the remote. Returns the commit sha. */
export const commitAndPush = async (message: string): Promise<{ ok: boolean; sha?: string; error?: string }> => {
  try {
    const response = await swFetch(
      '/api/github/commit',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ message }),
      },
      PUSH_TIMEOUT_MS,
    );
    const data: unknown = await response.json();
    const sha = typeof data === 'object' && data !== null && 'sha' in data ? String(data.sha) : undefined;
    const error =
      typeof data === 'object' && data !== null && 'error' in data ? String(data.error) : undefined;
    return { ok: response.ok && sha !== undefined, sha, error };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
};

/** Stages a binary asset (base64-encoded) in the local repo (no commit yet). */
export const stageAsset = async (path: string, base64: string): Promise<boolean> => {
  clearContentCache();
  try {
    const response = await swFetch('/api/github/asset', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path, content: base64 }),
    });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Inserts or replaces a scalar `key: value` inside a markdown file's YAML
 * frontmatter, leaving the body untouched. A new key is placed right after
 * `lang:` (or at the end of the block); an existing key's line is replaced.
 * Pure — safe to unit test.
 */
export const upsertFrontmatterField = (markdown: string, key: string, value: string): string => {
  const line = `${key}: ${value}`;
  if (!markdown.startsWith('---')) return `---\n${line}\n---\n\n${markdown}`;
  const end = markdown.indexOf('\n---', 3);
  if (end < 0) return markdown;
  const prefix = `${key}:`;
  const lines = markdown.slice(4, end).split('\n');
  const at = lines.findIndex((l) => l.startsWith(prefix));
  if (at >= 0) lines[at] = line;
  else {
    const langAt = lines.findIndex((l) => l.startsWith('lang:'));
    lines.splice(langAt >= 0 ? langAt + 1 : lines.length, 0, line);
  }
  return `---\n${lines.join('\n')}${markdown.slice(end)}`;
};

/**
 * Reads a frontmatter field that may be a YAML block scalar. An inline value
 * (`key: text`) returns the unquoted text; a folded (`>` / `>-`) or literal
 * (`|` / `|-`) block returns its indented continuation lines joined — folded
 * with spaces, literal with newlines. Returns undefined when the key is absent.
 * Needed because descriptions are stored as folded blocks that a naive
 * single-line read would mangle to just the `>-` indicator.
 */
export const readFrontmatterField = (markdown: string, key: string): string | undefined => {
  if (!markdown.startsWith('---')) return undefined;
  const end = markdown.indexOf('\n---', 3);
  const lines = (end < 0 ? markdown.slice(4) : markdown.slice(4, end)).split('\n');
  const at = lines.findIndex((l) => l.startsWith(`${key}:`));
  if (at < 0) return undefined;
  const inline = lines[at].slice(key.length + 1).trim();
  const block = inline.match(/^([|>])[+-]?$/);
  if (!block) return inline.replace(/^["']|["']$/g, '');
  const cont: string[] = [];
  for (let i = at + 1; i < lines.length && /^\s/.test(lines[i]); i += 1) {
    cont.push(lines[i].replace(/^\s+/, ''));
  }
  return block[1] === '>' ? cont.join(' ') : cont.join('\n');
};

/**
 * Inserts or replaces a frontmatter field as a literal block scalar (`key: |-`),
 * removing any prior continuation lines so replacing a block never orphans the
 * old text. Used for prose fields (description) where inline quoting is fragile;
 * pairs with {@link readFrontmatterField}. Pure — safe to unit test.
 */
export const upsertFrontmatterBlock = (markdown: string, key: string, value: string): string => {
  const field = [`${key}: |-`, ...value.split('\n').map((l) => `  ${l}`)];
  if (!markdown.startsWith('---')) return `---\n${field.join('\n')}\n---\n\n${markdown}`;
  const end = markdown.indexOf('\n---', 3);
  if (end < 0) return markdown;
  const lines = markdown.slice(4, end).split('\n');
  const at = lines.findIndex((l) => l.startsWith(`${key}:`));
  if (at >= 0) {
    let removeCount = 1;
    for (let i = at + 1; i < lines.length && /^\s/.test(lines[i]); i += 1) removeCount += 1;
    lines.splice(at, removeCount, ...field);
  } else {
    const langAt = lines.findIndex((l) => l.startsWith('lang:'));
    lines.splice(langAt >= 0 ? langAt + 1 : lines.length, 0, ...field);
  }
  return `---\n${lines.join('\n')}${markdown.slice(end)}`;
};

/** Fields needed to render a magazine issue's `index.<lang>.md`. */
export interface IssueIndexInput {
  readonly title: string;
  readonly lang: string;
  readonly publishDate: string;
  readonly articles: readonly string[];
  readonly imagePath?: string;
}

/** Builds a magazine issue `index.<lang>.md` matching the shipped issue format. */
export const buildIssueIndexMarkdown = (i: IssueIndexInput): string => {
  const arts = i.articles.map((a) => `  - ${a}`).join('\n');
  const image = i.imagePath !== undefined && i.imagePath !== '' ? `\nimage: ${i.imagePath}` : '';
  return (
    `---\n` +
    `title: ${JSON.stringify(i.title)}\n` +
    `lang: ${i.lang}\n` +
    `published: true\n` +
    `publishDate: ${i.publishDate}\n` +
    `articles:\n${arts}${image}\n` +
    `---\n`
  );
};

/**
 * A folder-safe issue slug: lowercase Latin letters, digits and single hyphens,
 * with no leading, trailing or doubled hyphen (e.g. `nomer-3-2026`).
 */
const ISSUE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Validates a proposed magazine-issue slug against the folder-naming rules and
 * the slugs that already exist, returning a human-readable Russian error, or
 * `undefined` when the slug is acceptable. Pure — the screen calls it to gate
 * the submit button and to surface an inline hint before `createMagazineIssue`
 * would write a broken or colliding `magazine/<slug>/…` path (QA #17).
 */
export const validateMagazineSlug = (
  slug: string,
  existing: readonly string[],
): string | undefined => {
  const value = slug.trim();
  if (value === '') return 'Укажите слаг номера.';
  if (!ISSUE_SLUG_PATTERN.test(value)) {
    return 'Слаг: только строчные латинские буквы, цифры и дефисы (например, nomer-3-2026).';
  }
  if (existing.includes(value)) return `Номер со слагом «${value}» уже существует.`;
  return undefined;
};

/** Everything the UI collects to publish a new magazine issue. */
export interface NewMagazineIssue {
  readonly slug: string;
  readonly lang: string;
  readonly title: string;
  readonly publishDate: string;
  readonly articles: readonly string[];
  /** The issue PDF, base64-encoded. */
  readonly pdfBase64: string;
  /** Optional cover image (PNG/JPEG), base64-encoded. */
  readonly coverBase64?: string;
}

/**
 * Publishes a new magazine issue end-to-end through the git engine: stages the
 * PDF and cover under `magazine/<slug>/assets/`, writes `index.<lang>.md` with
 * the table of contents, back-links every selected article to the issue via its
 * `magazine:` frontmatter, then commits and pushes. Returns the commit result.
 */
export const createMagazineIssue = async (
  issue: NewMagazineIssue,
): Promise<{ ok: boolean; sha?: string; error?: string }> => {
  const dir = `magazine/${issue.slug}`;
  const pdfOk = await stageAsset(`${dir}/assets/${issue.slug}.${issue.lang}.pdf`, issue.pdfBase64);
  if (!pdfOk) return { ok: false, error: 'Не удалось загрузить PDF номера.' };

  let imagePath = '';
  if (issue.coverBase64 !== undefined && issue.coverBase64 !== '') {
    const langCover = await stageAsset(`${dir}/assets/cover.${issue.lang}.png`, issue.coverBase64);
    const defCover = await stageAsset(`${dir}/assets/cover.png`, issue.coverBase64);
    if (!langCover || !defCover) return { ok: false, error: 'Не удалось загрузить обложку.' };
    imagePath = `./assets/cover.${issue.lang}.png`;
  }

  // Back-link only the articles that actually have this issue's language; an
  // article missing the language can't be linked and must not appear in the TOC
  // nor inflate the commit count (QA #17).
  const linked: string[] = [];
  for (const slug of issue.articles) {
    const path = `blog/${slug}/index.${issue.lang}.md`;
    const md = await readFile(path);
    if (md === undefined || md === '') continue;
    await stageFile(path, upsertFrontmatterField(md, 'magazine', issue.slug));
    linked.push(slug);
  }

  const index = buildIssueIndexMarkdown({ ...issue, articles: linked, imagePath });
  const indexOk = await stageFile(`${dir}/index.${issue.lang}.md`, index);
  if (!indexOk) return { ok: false, error: 'Не удалось создать index номера (проверьте поля).' };

  return commitAndPush(`magazine: добавлен номер ${issue.slug} (${linked.length} статей)`);
};

/** Reads a file's text content from the cloned content repo. */
export const readFile = async (path: string): Promise<string | undefined> => {
  const cached = fileCache.get(path);
  if (cached !== undefined) return cached;
  try {
    const response = await swFetch(`/api/github/file?path=${encodeURIComponent(path)}`);
    const data: unknown = await response.json();
    const content =
      typeof data === 'object' && data !== null && 'content' in data
        ? String(data.content)
        : undefined;
    if (content !== undefined) fileCache.set(path, content);
    return content;
  } catch {
    return undefined;
  }
};

/** A configured site language from `settings/languages.json`. */
export interface SiteLanguage {
  readonly code: string;
  readonly label: string;
}

const isLanguage = (x: unknown): x is SiteLanguage =>
  typeof x === 'object' && x !== null && 'code' in x && 'label' in x;

/** Reads the repo's configured languages (real data), or an empty list. */
export const readLanguages = async (): Promise<readonly SiteLanguage[]> => {
  const raw = await readFile('settings/languages.json');
  return parseJsonArray(raw, isLanguage);
};

/** Parses a JSON-array file's text into typed items, or an empty list. */
const parseJsonArray = <T>(raw: string | undefined, guard: (x: unknown) => x is T): readonly T[] => {
  if (raw === undefined) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter(guard) : [];
  } catch {
    return [];
  }
};

/** A per-language string map (e.g. topic names). */
export type Localized = Readonly<Record<string, string>>;

/** A content topic from `settings/topics.json`. */
export interface Topic {
  readonly key: string;
  readonly color: string;
  readonly name: Localized;
}

const isTopic = (x: unknown): x is Topic =>
  typeof x === 'object' && x !== null && 'key' in x && 'color' in x && 'name' in x;

/** Reads the repo's real topics (colour + per-language names). */
export const readTopics = async (): Promise<readonly Topic[]> =>
  parseJsonArray(await readFile('settings/topics.json'), isTopic);

/** A summary of one blog article (grouped from `blog/<slug>/index.<lang>.md`). */
export interface ArticleSummary {
  readonly slug: string;
  readonly title: string;
  readonly topic?: string;
  readonly date?: string;
  readonly published: boolean;
  readonly languages: readonly string[];
}

/** Extracts a frontmatter scalar (`key: value`) from markdown text. */
const frontmatterValue = (markdown: string, key: string): string | undefined => {
  const match = markdown.match(new RegExp(`^${key}:\\s*(.+)$`, 'm'));
  return match ? match[1].trim().replace(/^["']|["']$/g, '') : undefined;
};

/**
 * Lists real blog articles: groups `blog/<slug>/index.<lang>.md` by slug and
 * reads the preferred language's frontmatter for title/topic/date/published.
 */
export const listArticles = async (): Promise<readonly ArticleSummary[]> => {
  const entries = await listTree('blog');
  const bySlug = new Map<string, Set<string>>();
  for (const entry of entries) {
    const parts = entry.path.split('/');
    const langMatch = entry.name.match(/^index\.([a-z]{2})\.md$/);
    if (parts.length >= 3 && langMatch) {
      const slug = parts[1] as string;
      const set = bySlug.get(slug) ?? new Set<string>();
      set.add(langMatch[1] as string);
      bySlug.set(slug, set);
    }
  }
  const summaries = await mapPool([...bySlug.entries()], 6, ([slug, langs]) =>
    summariseArticle(slug, [...langs]),
  );
  return [...summaries].sort(byDateAsc);
};

/** Groups `blog/<slug>/index.<lang>.md` paths into slug → sorted langs. */
const groupArticlePaths = (paths: readonly string[]): Map<string, string[]> => {
  const bySlug = new Map<string, string[]>();
  for (const p of paths) {
    const m = p.match(/^blog\/([^/]+)\/index\.([a-z]{2,3})\.md$/);
    if (m) {
      const slug = m[1] as string;
      const langs = bySlug.get(slug) ?? [];
      langs.push(m[2] as string);
      bySlug.set(slug, langs);
    }
  }
  return bySlug;
};

/** Outcome of the API-first article load: the list plus an optional real error. */
export interface ArticleListResult {
  readonly articles: readonly ArticleSummary[];
  readonly error?: string;
}

/**
 * Lists articles straight from the GitHub REST API — the flat git tree in one
 * request for the slugs + languages, then each preferred-language file's raw
 * body (parallel, capped) for the title/date. This is the fast, reliable path
 * the list uses: it does NOT wait for the Service-Worker git clone (that heavy
 * clone is only needed to *edit*), so the list appears in seconds and surfaces
 * a real error instead of hanging on "compressing objects". `onProgress`
 * reports title-fetch progress so the UI shows "N of M", not an opaque spinner.
 */
export const listArticlesViaApi = async (
  onProgress?: (loaded: number, total: number) => void,
): Promise<ArticleListResult> => {
  const branch = import.meta.env.VITE_GITHUB_BRANCH ?? 'develop';
  const base = `https://api.github.com/repos/communist-prometheus/public-website-content`;
  const t = await freshGhToken();
  if (t === undefined) return { articles: [], error: 'signed-out' };
  const auth = { authorization: `Bearer ${t}` };
  try {
    const treeRes = await fetch(`${base}/git/trees/${branch}?recursive=1`, {
      headers: { ...auth, accept: 'application/vnd.github+json' },
    });
    if (!treeRes.ok) {
      return { articles: [], error: `Не удалось получить список файлов из репозитория (${treeRes.status}).` };
    }
    const data: unknown = await treeRes.json();
    const tree = typeof data === 'object' && data && 'tree' in data ? Reflect.get(data, 'tree') : undefined;
    const paths = Array.isArray(tree)
      ? tree.map((e) => (typeof e === 'object' && e && 'path' in e ? String(Reflect.get(e, 'path')) : '')).filter(Boolean)
      : [];
    const slugs = [...groupArticlePaths(paths).entries()];
    onProgress?.(0, slugs.length);
    let done = 0;
    const summaries = await mapPool(slugs, 6, async ([slug, langs]) => {
      const lang = preferredLang(langs);
      let md = '';
      try {
        const fileRes = await fetch(`${base}/contents/blog/${slug}/index.${lang}.md?ref=${branch}`, {
          headers: { ...auth, accept: 'application/vnd.github.raw' },
        });
        if (fileRes.ok) md = await fileRes.text();
      } catch {
        /* a single title failing must not sink the whole list */
      }
      done += 1;
      onProgress?.(done, slugs.length);
      return summariseFromMarkdown(slug, langs, md);
    });
    return { articles: [...summaries].sort(byDateAsc) };
  } catch (e) {
    return { articles: [], error: e instanceof Error ? e.message : String(e) };
  }
};

const preferredLang = (langs: readonly string[]): string =>
  langs.find((l) => l === 'ru') ?? langs.find((l) => l === 'en') ?? (langs[0] as string);

/** Builds an article summary from an already-fetched markdown body (pure). */
const summariseFromMarkdown = (
  slug: string,
  langs: readonly string[],
  markdown: string,
): ArticleSummary => ({
  slug,
  title: frontmatterValue(markdown, 'title') ?? slug.replace(/-/g, ' '),
  topic: frontmatterValue(markdown, 'topic'),
  // Articles are inconsistent: `pubDate`, `publishDate` (magazine-era) or
  // `date`. Read all three so every article has a real date to sort by,
  // otherwise the `publishDate` ones fall to '9999' and clump at the end.
  date:
    frontmatterValue(markdown, 'pubDate') ??
    frontmatterValue(markdown, 'publishDate') ??
    frontmatterValue(markdown, 'date'),
  published: frontmatterValue(markdown, 'draft') !== 'true',
  languages: [...langs].sort(),
});

/** Chronological, oldest → newest; undated last. Matches every content list. */
const byDateAsc = (a: ArticleSummary, b: ArticleSummary): number =>
  (a.date ?? '9999').localeCompare(b.date ?? '9999');

const summariseArticle = async (
  slug: string,
  langs: readonly string[],
): Promise<ArticleSummary> => {
  const lang = preferredLang(langs);
  const markdown = (await readFile(`blog/${slug}/index.${lang}.md`)) ?? '';
  return summariseFromMarkdown(slug, langs, markdown);
};
