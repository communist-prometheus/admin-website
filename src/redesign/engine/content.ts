/**
 * Thin content client for the new UI (git-engine R4): reads the cloned repo
 * through the SW's fetch-intercepted content API (`/api/github/tree|file`). Pure
 * fetch + parse — no framework coupling. Returns `undefined` on any failure so
 * screens can fall back to a placeholder rather than throw. Every SW-engine call
 * goes through {@link swFetch}, which re-inits the engine and retries once if the
 * SW reports "not ready" — otherwise content silently reads empty after an SW
 * eviction or a post-deploy SW version bump.
 */
import { fieldSpan, readFieldText } from './frontmatter-value.js';
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
  const lines = markdown.slice(4, end).split('\n');
  // Replace the key's WHOLE previous value: overwriting only its first line
  // would orphan the continuations of a multi-line one.
  const span = fieldSpan(lines, key);
  if (span !== undefined) lines.splice(span.start, span.end - span.start, line);
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
  return readFieldText(lines, key);
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
  // The span covers the WHOLE previous value — a multi-line quoted scalar with
  // blank lines inside it included. Removing less is what left the tail of a
  // Russian description sitting under a new English one.
  const span = fieldSpan(lines, key);
  if (span !== undefined) lines.splice(span.start, span.end - span.start, ...field);
  else {
    const langAt = lines.findIndex((l) => l.startsWith('lang:'));
    lines.splice(langAt >= 0 ? langAt + 1 : lines.length, 0, ...field);
  }
  return `---\n${lines.join('\n')}${markdown.slice(end)}`;
};

/**
 * Removes a scalar frontmatter field (its whole line) if present, leaving the
 * body untouched. Used to UNLINK an article from an issue — dropping its
 * `magazine:` back-link. Pure — safe to unit test.
 */
export const removeFrontmatterField = (markdown: string, key: string): string => {
  if (!markdown.startsWith('---')) return markdown;
  const end = markdown.indexOf('\n---', 3);
  if (end < 0) return markdown;
  const lines = markdown.slice(4, end).split('\n');
  const span = fieldSpan(lines, key);
  if (span === undefined) return markdown;
  // Drop the whole value, not just its first line, so a multi-line field
  // cannot leave orphaned continuation lines behind.
  lines.splice(span.start, span.end - span.start);
  return `---\n${lines.join('\n')}${markdown.slice(end)}`;
};

/**
 * Reads a YAML block sequence (`key:` followed by `  - item` lines) as a plain
 * array — the issue index's `articles:` table of contents. Returns [] when the
 * key is absent. Pure — safe to unit test.
 */
export const readSequenceField = (markdown: string, key: string): readonly string[] => {
  if (!markdown.startsWith('---')) return [];
  const end = markdown.indexOf('\n---', 3);
  const block = end < 0 ? markdown.slice(4) : markdown.slice(4, end);
  const lines = block.split('\n');
  const at = lines.findIndex((l) => l.startsWith(`${key}:`));
  if (at < 0) return [];
  const items: string[] = [];
  for (let i = at + 1; i < lines.length; i += 1) {
    const m = lines[i].match(/^\s+-\s+(.+?)\s*$/);
    if (m) items.push(m[1].replace(/^["']|["']$/g, ''));
    else if (lines[i].trim() !== '') break; // next key ends the sequence
  }
  return items;
};

/**
 * Inserts or replaces a YAML block sequence field (`key:` + `  - item` lines),
 * dropping the previous items so a rewrite never orphans stale entries. Placed
 * after `lang:` (or at the block end) when new. Pure — safe to unit test.
 */
export const upsertSequenceField = (
  markdown: string,
  key: string,
  items: readonly string[],
): string => {
  // An empty set is written as an explicit `key: []` — a bare `key:` is YAML's
  // empty value, which the site's collection schema rejects (it wants a list).
  const field = items.length === 0 ? [`${key}: []`] : [`${key}:`, ...items.map((it) => `  - ${it}`)];
  if (!markdown.startsWith('---')) return `---\n${field.join('\n')}\n---\n\n${markdown}`;
  const end = markdown.indexOf('\n---', 3);
  if (end < 0) return markdown;
  const lines = markdown.slice(4, end).split('\n');
  const at = lines.findIndex((l) => l.startsWith(`${key}:`));
  if (at >= 0) {
    let removeCount = 1;
    for (let i = at + 1; i < lines.length && /^\s+-\s+/.test(lines[i]); i += 1) removeCount += 1;
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

/** One `<option>` for a topic picker: the topic key plus its Russian name. */
export interface TopicOption {
  readonly value: string;
  readonly label: string;
}

/**
 * The editorial topics as select options, read straight from the repository
 * through the API (no clone), so the editor offers the topics that actually
 * exist instead of a list hardcoded in the UI. Empty on any failure — the topic
 * is optional, so an unreadable settings file must not block editing.
 */
export const topicOptionsViaApi = async (): Promise<readonly TopicOption[]> => {
  const raw = await readFileViaApi('settings/topics.json');
  if (raw === undefined) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isTopic).map((topic) => ({
      value: topic.key,
      label: topic.name['ru'] ?? topic.name['en'] ?? topic.key,
    }));
  } catch {
    return [];
  }
};

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
  return [...summaries].sort(byDateDesc);
};

/** Groups `blog/<slug>/index.<lang>.md` paths into slug → sorted langs. */
const groupArticlePaths = (paths: readonly string[], collection = 'blog'): Map<string, string[]> => {
  const bySlug = new Map<string, string[]>();
  const pattern = new RegExp(`^${collection}/([^/]+)/index\\.([a-z]{2,3})\\.md$`);
  for (const p of paths) {
    const m = p.match(pattern);
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
  collection = 'blog',
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
    const slugs = [...groupArticlePaths(paths, collection).entries()];
    onProgress?.(0, slugs.length);
    let done = 0;
    const summaries = await mapPool(slugs, 6, async ([slug, langs]) => {
      const lang = preferredLang(langs);
      let md = '';
      try {
        const fileRes = await fetch(`${base}/contents/${collection}/${slug}/index.${lang}.md?ref=${branch}`, {
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
    return { articles: [...summaries].sort(byDateDesc) };
  } catch (e) {
    return { articles: [], error: e instanceof Error ? e.message : String(e) };
  }
};

/** Repo REST base + branch shared by the direct-API editor reads/writes. */
const REPO_BASE = 'https://api.github.com/repos/communist-prometheus/public-website-content';
const contentBranch = (): string => import.meta.env.VITE_GITHUB_BRANCH ?? 'develop';

/**
 * A browser-loadable raw URL for a content file on the current branch. The repo
 * is public, so `<img src>` / download links work without an auth header. The
 * path segments are encoded so spaces and Cyrillic filenames resolve.
 */
export const rawContentUrl = (path: string): string => {
  const encoded = path.split('/').map(encodeURIComponent).join('/');
  return `https://raw.githubusercontent.com/communist-prometheus/public-website-content/${contentBranch()}/${encoded}`;
};

/** UTF-8 → base64 (btoa is latin1-only; article bodies are Cyrillic). */
const toBase64 = (text: string): string => {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
};

/**
 * Reads ONE file straight from the GitHub API (raw body) — no Service-Worker
 * clone. This is how the editor opens the single article the user asked for
 * instead of waiting on the whole-repo clone to finish.
 */
export const readFileViaApi = async (path: string): Promise<string | undefined> => {
  const t = await freshGhToken();
  if (t === undefined) return undefined;
  try {
    // `no-store`: the same URL is fetched with a different Accept for the blob
    // sha at publish time; a cache that ignores Accept must not cross the wires.
    const res = await fetch(`${REPO_BASE}/contents/${path}?ref=${contentBranch()}`, {
      cache: 'no-store',
      headers: { authorization: `Bearer ${t}`, accept: 'application/vnd.github.raw' },
    });
    return res.ok ? await res.text() : undefined;
  } catch {
    return undefined;
  }
};

/** A content read that tells "absent" apart from "failed": a 404 means the
 *  item has no such language, anything else (401 expired token, 403 throttle,
 *  5xx) is a failure the caller must not mistake for absence. */
type ContentRead =
  | { readonly kind: 'ok'; readonly text: string }
  | { readonly kind: 'missing' }
  | { readonly kind: 'error'; readonly error: string };

const readContentFile = async (path: string): Promise<ContentRead> => {
  const t = await freshGhToken();
  if (t === undefined) return { kind: 'error', error: 'signed-out' };
  try {
    const res = await fetch(`${REPO_BASE}/contents/${path}?ref=${contentBranch()}`, {
      cache: 'no-store',
      headers: { authorization: `Bearer ${t}`, accept: 'application/vnd.github.raw' },
    });
    if (res.ok) return { kind: 'ok', text: await res.text() };
    if (res.status === 404) return { kind: 'missing' };
    return { kind: 'error', error: await apiError(res, `Чтение не удалось (${res.status}).`) };
  } catch (e) {
    return { kind: 'error', error: e instanceof Error ? e.message : String(e) };
  }
};

/** The languages one item exists in (its `index.<lang>.md` files), via API. The
 *  collection is `blog` for articles, `magazine` for journal issues. */
export const articleLangsViaApi = async (
  slug: string,
  collection = 'blog',
): Promise<readonly string[]> => {
  const t = await freshGhToken();
  if (t === undefined) return [];
  try {
    const res = await fetch(`${REPO_BASE}/contents/${collection}/${slug}?ref=${contentBranch()}`, {
      cache: 'no-store',
      headers: { authorization: `Bearer ${t}`, accept: 'application/vnd.github+json' },
    });
    if (!res.ok) return [];
    const data: unknown = await res.json();
    const names = Array.isArray(data)
      ? data.map((e) => (typeof e === 'object' && e && 'name' in e ? String(Reflect.get(e, 'name')) : ''))
      : [];
    return names
      .map((n) => n.match(/^index\.([a-z]{2,3})\.md$/)?.[1])
      .filter((l): l is string => l !== undefined)
      .sort();
  } catch {
    return [];
  }
};

/**
 * The content gate for the direct-API write path — the same YAML / lang /
 * schema rules the Service Worker applies at stage time, so a single-file
 * commit can no more push an unbuildable article than a clone+push can. The
 * gate (and the schema library behind it) loads lazily: publishing is rare,
 * the shell's first paint is not. Non-content paths pass straight through.
 */
const guardContentWrite = async (path: string, content: string): Promise<string | undefined> => {
  const { validateContentFile } = await import('@/validation/content-gate');
  const reason = validateContentFile(path, content);
  return reason === undefined ? undefined : `Файл не прошёл проверку и не сохранён: ${reason}`;
};

/**
 * Commits ONE edited file via the GitHub Contents API — a single-file commit,
 * no clone and no whole-repo push. Fetches the file's current blob sha (an
 * update needs it), then PUTs the new content. Returns the commit sha or the
 * real error. This is the "push only what was opened" path.
 */
export const publishFileViaApi = async (
  path: string,
  content: string,
  message: string,
): Promise<{ ok: boolean; sha?: string; error?: string }> => {
  const rejected = await guardContentWrite(path, content);
  if (rejected !== undefined) return { ok: false, error: rejected };
  const t = await freshGhToken();
  if (t === undefined) return { ok: false, error: 'signed-out' };
  const auth = { authorization: `Bearer ${t}` };
  const branch = contentBranch();
  try {
    let sha: string | undefined;
    const cur = await fetch(`${REPO_BASE}/contents/${path}?ref=${branch}`, {
      cache: 'no-store',
      headers: { ...auth, accept: 'application/vnd.github+json' },
    });
    if (cur.ok) {
      const d: unknown = await cur.json();
      sha = typeof d === 'object' && d && 'sha' in d ? String(Reflect.get(d, 'sha')) : undefined;
    }
    const put = await fetch(`${REPO_BASE}/contents/${path}`, {
      method: 'PUT',
      headers: { ...auth, 'content-type': 'application/json' },
      body: JSON.stringify({ message, content: toBase64(content), branch, ...(sha ? { sha } : {}) }),
    });
    if (!put.ok) {
      const e: unknown = await put.json().catch(() => undefined);
      const msg = typeof e === 'object' && e && 'message' in e ? String(Reflect.get(e, 'message')) : undefined;
      return { ok: false, error: msg ?? `Публикация не удалась (${put.status}).` };
    }
    const d: unknown = await put.json();
    const commit = typeof d === 'object' && d && 'commit' in d ? Reflect.get(d, 'commit') : undefined;
    const commitSha =
      typeof commit === 'object' && commit && 'sha' in commit ? String(Reflect.get(commit, 'sha')) : undefined;
    return { ok: true, sha: commitSha };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
};

/** The outcome of re-linking an issue's articles: what changed, or an error. */
export interface LinkResult {
  readonly ok: boolean;
  readonly linked: number;
  readonly unlinked: number;
  readonly error?: string;
}

/**
 * Reconciles a magazine issue's linked articles for one language, entirely via
 * the Contents API (no clone). Given the desired set of article slugs it:
 *  - reads the issue's current `articles:` table of contents,
 *  - adds a `magazine: <slug>` back-link to every newly-selected article,
 *  - removes that back-link from every de-selected article,
 *  - rewrites the issue index's `articles:` list to the new set.
 * Each write is its own single-file commit — the same "push only what changed"
 * model the editor uses. Articles missing the issue language are skipped (they
 * cannot carry a language-specific back-link) and excluded from the TOC.
 */
export const linkIssueArticlesViaApi = async (
  issueSlug: string,
  lang: string,
  selected: readonly string[],
): Promise<LinkResult> => {
  const indexPath = `magazine/${issueSlug}/index.${lang}.md`;
  const index = await readContentFile(indexPath);
  if (index.kind === 'missing') {
    return { ok: false, linked: 0, unlinked: 0, error: `Не найден index номера (${lang}).` };
  }
  if (index.kind === 'error') return { ok: false, linked: 0, unlinked: 0, error: index.error };
  const indexMd = index.text;
  const current = new Set(readSequenceField(indexMd, 'articles'));
  const want = new Set(selected);
  const toLink = selected.filter((s) => !current.has(s));
  const toUnlink = [...current].filter((s) => !want.has(s));

  // Add the back-link to newly-selected articles; skip any without this
  // language. A failed read (not a 404) aborts the whole save — treating it as
  // "absent" would silently drop the article from the issue.
  const linked: string[] = [];
  for (const slug of selected) {
    const path = `blog/${slug}/index.${lang}.md`;
    const read = await readContentFile(path);
    if (read.kind === 'error') return { ok: false, linked: 0, unlinked: 0, error: read.error };
    if (read.kind === 'missing' || read.text === '') continue;
    linked.push(slug);
    if (toLink.includes(slug)) {
      const next = upsertFrontmatterField(read.text, 'magazine', issueSlug);
      const r = await publishFileViaApi(path, next, `magazine: ссылка ${slug} → ${issueSlug}`);
      if (!r.ok) return { ok: false, linked: 0, unlinked: 0, error: r.error };
    }
  }

  // Drop the back-link from de-selected articles.
  let unlinked = 0;
  for (const slug of toUnlink) {
    const path = `blog/${slug}/index.${lang}.md`;
    const read = await readContentFile(path);
    if (read.kind === 'error') return { ok: false, linked: 0, unlinked: 0, error: read.error };
    if (read.kind === 'missing' || read.text === '') continue;
    const next = removeFrontmatterField(read.text, 'magazine');
    const r = await publishFileViaApi(path, next, `magazine: отвязка ${slug} от ${issueSlug}`);
    if (!r.ok) return { ok: false, linked: 0, unlinked: 0, error: r.error };
    unlinked += 1;
  }

  // Rewrite the issue TOC to exactly the linked set.
  const nextIndex = upsertSequenceField(indexMd, 'articles', linked);
  if (nextIndex !== indexMd) {
    const r = await publishFileViaApi(indexPath, nextIndex, `magazine: оглавление ${issueSlug} (${linked.length})`);
    if (!r.ok) return { ok: false, linked: 0, unlinked: 0, error: r.error };
  }
  return { ok: true, linked: toLink.length, unlinked };
};

/** One file in a repo directory (a magazine issue's asset, etc.). */
export interface RepoFile {
  readonly name: string;
  readonly path: string;
  readonly size: number;
  readonly sha: string;
}

/** Lists the files in a repo directory via the API (e.g. an issue's assets). */
export const listDirViaApi = async (dir: string): Promise<readonly RepoFile[]> => {
  const t = await freshGhToken();
  if (t === undefined) return [];
  try {
    const res = await fetch(`${REPO_BASE}/contents/${dir}?ref=${contentBranch()}`, {
      cache: 'no-store',
      headers: { authorization: `Bearer ${t}`, accept: 'application/vnd.github+json' },
    });
    if (!res.ok) return [];
    const data: unknown = await res.json();
    if (!Array.isArray(data)) return [];
    return data
      .filter((e) => typeof e === 'object' && e && Reflect.get(e, 'type') === 'file')
      .map((e) => ({
        name: String(Reflect.get(e, 'name')),
        path: String(Reflect.get(e, 'path')),
        size: typeof Reflect.get(e, 'size') === 'number' ? Number(Reflect.get(e, 'size')) : 0,
        sha: String(Reflect.get(e, 'sha')),
      }));
  } catch {
    return [];
  }
};

/** The current blob sha of a file, or undefined when it does not exist. */
const blobShaViaApi = async (
  path: string,
  auth: Record<string, string>,
  branch: string,
): Promise<string | undefined> => {
  const res = await fetch(`${REPO_BASE}/contents/${path}?ref=${branch}`, {
    cache: 'no-store',
    headers: { ...auth, accept: 'application/vnd.github+json' },
  });
  if (!res.ok) return undefined;
  const d: unknown = await res.json();
  return typeof d === 'object' && d && 'sha' in d ? String(Reflect.get(d, 'sha')) : undefined;
};

const apiError = async (res: Response, fallback: string): Promise<string> => {
  const e: unknown = await res.json().catch(() => undefined);
  return typeof e === 'object' && e && 'message' in e ? String(Reflect.get(e, 'message')) : fallback;
};

/** Uploads a file (already base64-encoded) via the Contents API — ANY type,
 *  including fb2/doc/pdf. Overwrites in place when the path already exists. */
export const uploadBinaryViaApi = async (
  path: string,
  base64: string,
  message: string,
): Promise<{ ok: boolean; error?: string }> => {
  const t = await freshGhToken();
  if (t === undefined) return { ok: false, error: 'signed-out' };
  const auth = { authorization: `Bearer ${t}` };
  const branch = contentBranch();
  try {
    const sha = await blobShaViaApi(path, auth, branch);
    const put = await fetch(`${REPO_BASE}/contents/${path}`, {
      method: 'PUT',
      headers: { ...auth, 'content-type': 'application/json' },
      body: JSON.stringify({ message, content: base64, branch, ...(sha ? { sha } : {}) }),
    });
    return put.ok
      ? { ok: true }
      : { ok: false, error: await apiError(put, `Загрузка не удалась (${put.status}).`) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
  }
};

/** Deletes a file via the Contents API (needs its current blob sha). */
export const deleteFileViaApi = async (
  path: string,
  message: string,
): Promise<{ ok: boolean; error?: string }> => {
  const t = await freshGhToken();
  if (t === undefined) return { ok: false, error: 'signed-out' };
  const auth = { authorization: `Bearer ${t}` };
  const branch = contentBranch();
  try {
    const sha = await blobShaViaApi(path, auth, branch);
    if (sha === undefined) return { ok: false, error: 'Файл не найден.' };
    const res = await fetch(`${REPO_BASE}/contents/${path}`, {
      method: 'DELETE',
      headers: { ...auth, 'content-type': 'application/json' },
      body: JSON.stringify({ message, sha, branch }),
    });
    return res.ok
      ? { ok: true }
      : { ok: false, error: await apiError(res, `Удаление не удалось (${res.status}).`) };
  } catch (e) {
    return { ok: false, error: e instanceof Error ? e.message : String(e) };
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

/** Reverse-chronological, newest → oldest; undated last. */
const byDateDesc = (a: ArticleSummary, b: ArticleSummary): number =>
  (b.date ?? '0000').localeCompare(a.date ?? '0000');

const summariseArticle = async (
  slug: string,
  langs: readonly string[],
): Promise<ArticleSummary> => {
  const lang = preferredLang(langs);
  const markdown = (await readFile(`blog/${slug}/index.${lang}.md`)) ?? '';
  return summariseFromMarkdown(slug, langs, markdown);
};
