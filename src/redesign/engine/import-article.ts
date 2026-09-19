import { importFile } from '@/components/MarkdownEditor/ImportDocs/import-file';
import { uploadBinaryViaApi } from './content.js';

/**
 * Pulling an article out of a .docx, .html or .md file, for the rebuilt editor.
 *
 * The conversion itself is the shared pipeline the legacy client already used
 * (docx → HTML → markdown, inline images lifted out, a table of contents added
 * past three headings). What this adds is the half that pipeline leaves to its
 * caller: the extracted images are written into the material's own asset
 * folder, at exactly the `./assets/<name>` path the converted markdown points
 * at, so an imported article renders instead of showing broken images.
 */

/** Outcome of an import: the markdown to insert, or why nothing was imported. */
export type ImportOutcome =
  | { readonly ok: true; readonly markdown: string; readonly uploaded: number }
  | { readonly ok: false; readonly error: string };

/** Encodes a picked file's bytes for the Contents API. */
const toBase64 = async (file: File): Promise<string> => {
  const bytes = new Uint8Array(await file.arrayBuffer());
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
};

const NO_ADDRESS =
  'У материала ещё нет адреса — задайте его и опубликуйте, тогда картинки будет куда положить.';

/**
 * Converts a picked document to markdown and uploads the images it carried.
 *
 * Each image becomes its own single-file commit under
 * `<collection>/<slug>/assets/`, and the first failure stops the run: a
 * half-uploaded import that silently drops the rest would leave the article
 * pointing at files that do not exist.
 * @param file The document the editor picked.
 * @param collection Repository folder the material lives in (blog, pages, …).
 * @param slug The material's address; empty for a material not yet created.
 * @returns The markdown to insert, or the reason nothing was imported.
 */
export const importArticleFile = async (
  file: File,
  collection: string,
  slug: string,
): Promise<ImportOutcome> => {
  const converted = await importFile(file).catch((e: unknown) => e);
  if (converted instanceof Error) return { ok: false, error: converted.message };
  if (!isResult(converted)) return { ok: false, error: 'Не удалось прочитать файл.' };
  const { markdown, images } = converted;
  if (images.length === 0) return { ok: true, markdown, uploaded: 0 };
  if (slug === '') return { ok: false, error: NO_ADDRESS };
  let uploaded = 0;
  for (const image of images) {
    const path = `${collection}/${slug}/assets/${image.name}`;
    const result = await uploadBinaryViaApi(
      path,
      await toBase64(image),
      `assets: импорт ${image.name} → ${slug}`,
    );
    if (!result.ok) return { ok: false, error: result.error ?? `Не удалось загрузить ${image.name}.` };
    uploaded += 1;
  }
  return { ok: true, markdown, uploaded };
};

/** Narrows the shared pipeline's result without casting it. */
const isResult = (x: unknown): x is { markdown: string; images: readonly File[] } =>
  typeof x === 'object' &&
  x !== undefined &&
  x !== null &&
  'markdown' in x &&
  typeof Reflect.get(x, 'markdown') === 'string' &&
  Array.isArray(Reflect.get(x, 'images'));
