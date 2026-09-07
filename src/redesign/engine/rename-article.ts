import {
  deleteFileViaApi,
  listSlugsViaApi,
  readBinaryViaApi,
  uploadBinaryViaApi,
} from './content.js';
import { slugProblem } from './slug.js';

/**
 * Changing an article's address. The folder IS the address
 * (`blog/<slug>/index.<lang>.md` → comprom.org/<lang>/blog/<slug>/), so a
 * rename moves every file of that folder: all languages and every asset.
 *
 * Order matters. Every file is copied to the new address FIRST and only then
 * are the originals deleted, so a failure half-way leaves the article whole at
 * its old address instead of scattering it across two.
 */

/** The outcome of a rename. */
export interface RenameResult {
  readonly ok: boolean;
  readonly error?: string;
}

/**
 * Moves an article to a new slug.
 * @param collection - `blog`, `pages`, `magazine`, …
 * @param from - the article's current slug
 * @param to - the requested slug
 * @returns ok, or the reason nothing was changed
 */
export const renameArticleViaApi = async (
  collection: string,
  from: string,
  to: string,
): Promise<RenameResult> => {
  if (from === to) return { ok: true };

  const taken = await listSlugsViaApi(collection);
  const problem = slugProblem(to, taken, from);
  if (problem !== undefined) return { ok: false, error: problem };

  const files = await listSlugsViaApi(collection, from);
  if (files.length === 0) return { ok: false, error: `Не найдены файлы материала «${from}».` };

  // Copy everything first — binary-safe, so covers and PDFs survive the move.
  const copied: string[] = [];
  for (const path of files) {
    const base64 = await readBinaryViaApi(path);
    if (base64 === undefined) return { ok: false, error: `Не удалось прочитать ${path}.` };
    const target = path.replace(`${collection}/${from}/`, `${collection}/${to}/`);
    const upload = await uploadBinaryViaApi(target, base64.content, `адрес: ${from} → ${to}`);
    if (!upload.ok) return { ok: false, error: upload.error };
    copied.push(target);
  }

  // Only now remove the originals.
  for (const path of files) {
    const removed = await deleteFileViaApi(path, `адрес: ${from} → ${to} (удаление старого)`);
    if (!removed.ok) {
      return {
        ok: false,
        error: `${removed.error ?? 'Не удалось удалить старые файлы.'} Материал уже скопирован в «${to}» — удалите «${from}» вручную.`,
      };
    }
  }
  return { ok: true };
};
