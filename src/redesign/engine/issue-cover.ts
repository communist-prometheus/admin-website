import {
  publishFileViaApi,
  readContentFile,
  readFrontmatterField,
  removeFrontmatterField,
  upsertFrontmatterField,
} from './content.js';

/**
 * The public site renders an issue's cover ONLY from its index's `image:`
 * field — a `cover.<lang>.png` sitting in `assets/` is invisible to it. This
 * module keeps that field in step with the files the issue panel manages.
 */

/** The index-relative path the issue's cover should be, for one language:
 *  the per-language cover, else the shared `cover.png`, else none. */
export const issueCoverImage = (
  files: readonly { readonly name: string }[],
  lang: string,
): string | undefined =>
  [`cover.${lang}.png`, 'cover.png']
    .filter((name) => files.some((f) => f.name === name))
    .map((name) => `./assets/${name}`)[0];

/** The index markdown with `image:` set to the cover, or removed without one. */
const withCover = (markdown: string, image: string | undefined): string =>
  image === undefined
    ? removeFrontmatterField(markdown, 'image')
    : upsertFrontmatterField(markdown, 'image', image);

/**
 * Points `magazine/<slug>/index.<lang>.md`'s `image:` at the cover (or drops
 * it when the issue no longer has one). Writes only when the field changes,
 * and leaves a language with no index alone.
 */
export const syncIssueCoverViaApi = async (
  slug: string,
  lang: string,
  image: string | undefined,
): Promise<{ readonly ok: boolean; readonly error?: string }> => {
  const path = `magazine/${slug}/index.${lang}.md`;
  const read = await readContentFile(path);
  if (read.kind === 'error') return { ok: false, error: read.error };
  if (read.kind === 'missing' || readFrontmatterField(read.text, 'image') === image) return { ok: true };
  const r = await publishFileViaApi(path, withCover(read.text, image), `magazine: cover ${slug}.${lang}`);
  return r.ok ? { ok: true } : { ok: false, error: r.error };
};
