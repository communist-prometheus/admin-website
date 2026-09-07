/**
 * The article's address. `blog/<slug>/index.<lang>.md` is served as
 * comprom.org/<lang>/blog/<slug>/, so a slug must be typeable into a URL —
 * lowercase Latin letters, digits and single hyphens — and unique across the
 * collection: two articles sharing a slug share a folder, and one overwrites
 * the other.
 */

/** Cyrillic → Latin, the way the existing content repository transliterates. */
const CYRILLIC: Readonly<Record<string, string>> = {
  а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', е: 'e', ё: 'yo', ж: 'zh', з: 'z', и: 'i',
  й: 'y', к: 'k', л: 'l', м: 'm', н: 'n', о: 'o', п: 'p', р: 'r', с: 's', т: 't',
  у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'ch', ш: 'sh', щ: 'sch', ъ: '', ы: 'y', ь: '',
  э: 'e', ю: 'yu', я: 'ya',
  і: 'i', ї: 'yi', є: 'ye', ґ: 'g', ў: 'u',
};

/** The shape a stored slug must have. */
const VALID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const transliterate = (text: string): string =>
  [...text.toLowerCase()].map((char) => CYRILLIC[char] ?? char).join('');

/**
 * Turns anything the editor types into a usable slug: transliterated,
 * lowercased, punctuation dropped, spaces and separators collapsed into single
 * hyphens, no hyphen at either end.
 * @param input - raw text (a title, or a half-typed address)
 * @returns the normalised slug, empty when nothing usable remains
 */
export const slugify = (input: string): string =>
  transliterate(input)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

/**
 * Why a slug cannot be used, or undefined when it can.
 * @param slug - the candidate address
 * @param taken - slugs already present in the collection
 * @param current - the article's own slug, which it may keep
 * @returns the reason, in the editor's language
 */
export const slugProblem = (
  slug: string,
  taken: readonly string[],
  current?: string,
): string | undefined => {
  if (slug.trim() === '') return 'Укажите адрес материала.';
  if (!VALID.test(slug)) {
    return 'Адрес — только латиница в нижнем регистре, цифры и дефисы (например: illyuziya-socializma).';
  }
  if (slug !== current && taken.includes(slug)) return `Адрес «${slug}» уже занят другим материалом.`;
  return undefined;
};
