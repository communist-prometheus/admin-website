/**
 * Thin content client for the new UI (git-engine R4): reads the cloned repo
 * through the SW's fetch-intercepted content API (`/api/github/tree|file`). Pure
 * fetch + parse — no framework coupling. Returns `undefined` on any failure so
 * screens can fall back to a placeholder rather than throw.
 */

/** One entry in a repo directory listing. */
export interface TreeEntry {
  readonly type: 'file' | 'dir';
  readonly name: string;
  readonly path: string;
}

const isTreeEntry = (x: unknown): x is TreeEntry =>
  typeof x === 'object' && x !== null && 'name' in x && 'path' in x;

/** Lists a directory in the cloned content repo. */
export const listTree = async (path = ''): Promise<readonly TreeEntry[]> => {
  try {
    const response = await fetch(`/api/github/tree?path=${encodeURIComponent(path)}`);
    const data: unknown = await response.json();
    const tree = typeof data === 'object' && data !== null && 'tree' in data ? data.tree : undefined;
    return Array.isArray(tree) ? tree.filter(isTreeEntry) : [];
  } catch {
    return [];
  }
};

/** Stages a file write in the local repo (no commit yet). Returns success. */
export const stageFile = async (path: string, content: string): Promise<boolean> => {
  try {
    const response = await fetch('/api/github/file/stage', {
      method: 'PUT',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ path, content }),
    });
    return response.ok;
  } catch {
    return false;
  }
};

/** Commits all staged changes and pushes to the remote. Returns the commit sha. */
export const commitAndPush = async (message: string): Promise<{ ok: boolean; sha?: string; error?: string }> => {
  try {
    const response = await fetch('/api/github/commit', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ message }),
    });
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
  try {
    const response = await fetch('/api/github/asset', {
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

  const index = buildIssueIndexMarkdown({ ...issue, imagePath });
  const indexOk = await stageFile(`${dir}/index.${issue.lang}.md`, index);
  if (!indexOk) return { ok: false, error: 'Не удалось создать index номера (проверьте поля).' };

  for (const slug of issue.articles) {
    const path = `blog/${slug}/index.${issue.lang}.md`;
    const md = await readFile(path);
    if (md === undefined || md === '') continue;
    await stageFile(path, upsertFrontmatterField(md, 'magazine', issue.slug));
  }

  return commitAndPush(`magazine: добавлен номер ${issue.slug} (${issue.articles.length} статей)`);
};

/** Reads a file's text content from the cloned content repo. */
export const readFile = async (path: string): Promise<string | undefined> => {
  try {
    const response = await fetch(`/api/github/file?path=${encodeURIComponent(path)}`);
    const data: unknown = await response.json();
    return typeof data === 'object' && data !== null && 'content' in data
      ? String(data.content)
      : undefined;
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
  const summaries = await Promise.all(
    [...bySlug.entries()].map(([slug, langs]) => summariseArticle(slug, [...langs])),
  );
  return summaries;
};

const preferredLang = (langs: readonly string[]): string =>
  langs.find((l) => l === 'ru') ?? langs.find((l) => l === 'en') ?? (langs[0] as string);

const summariseArticle = async (
  slug: string,
  langs: readonly string[],
): Promise<ArticleSummary> => {
  const lang = preferredLang(langs);
  const markdown = (await readFile(`blog/${slug}/index.${lang}.md`)) ?? '';
  return {
    slug,
    title: frontmatterValue(markdown, 'title') ?? slug.replace(/-/g, ' '),
    topic: frontmatterValue(markdown, 'topic'),
    date: frontmatterValue(markdown, 'pubDate') ?? frontmatterValue(markdown, 'date'),
    published: frontmatterValue(markdown, 'draft') !== 'true',
    languages: [...langs].sort(),
  };
};
