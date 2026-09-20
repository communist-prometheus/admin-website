import { deleteFileViaApi, listDirViaApi } from './content.js';

/**
 * Removing a material, or one of its translations.
 *
 * The capability existed only in the previous client. Rebuilding it here is
 * what makes retiring that client a removal of dead code rather than a
 * removal of something editors use.
 *
 * Every delete is its own single-file commit, the same model the editor's
 * publish uses. A failure stops the run: a material half-deleted is worse
 * than one still present, because what remains no longer describes itself.
 */

/** What a delete did, or why it did nothing. */
export type DeleteOutcome =
  | { readonly ok: true; readonly removed: number }
  | { readonly ok: false; readonly error: string };

const indexFile = (collection: string, slug: string, lang: string): string =>
  `${collection}/${slug}/index.${lang}.md`;

/**
 * Remove a single translation. The last remaining language is refused: a
 * material with no language left is a folder of assets nothing points at,
 * which is what "delete the material" is for.
 * @param collection Repository folder the material lives in.
 * @param slug The material's address.
 * @param lang Language to drop.
 * @returns What was removed, or the reason nothing was.
 */
export const deleteLanguage = async (
  collection: string,
  slug: string,
  lang: string,
): Promise<DeleteOutcome> => {
  const files = await listDirViaApi(`${collection}/${slug}`);
  const langs = files.filter((f) => /index\.[a-z]{2}\.md$/.test(f.path));
  const target = indexFile(collection, slug, lang);
  if (!langs.some((f) => f.path === target))
    return { ok: false, error: `У материала нет перевода «${lang}».` };
  if (langs.length <= 1)
    return {
      ok: false,
      error: 'Это последний язык материала — удалите материал целиком.',
    };
  const result = await deleteFileViaApi(target, `${collection}: удалён перевод ${slug}.${lang}`);
  return result.ok
    ? { ok: true, removed: 1 }
    : { ok: false, error: result.error ?? 'Не удалось удалить перевод.' };
};

/**
 * Remove a material entirely: every language and every asset under its
 * folder.
 * @param collection Repository folder the material lives in.
 * @param slug The material's address.
 * @returns How many files were removed, or the reason none were.
 */
export const deleteMaterial = async (
  collection: string,
  slug: string,
): Promise<DeleteOutcome> => {
  const files = await listDirViaApi(`${collection}/${slug}`);
  if (files.length === 0)
    return { ok: false, error: `Материал «${slug}» не найден в репозитории.` };
  let removed = 0;
  for (const file of files) {
    const result = await deleteFileViaApi(file.path, `${collection}: удалён материал ${slug}`);
    if (!result.ok)
      return { ok: false, error: result.error ?? `Не удалось удалить ${file.path}.` };
    removed += 1;
  }
  return { ok: true, removed };
};
