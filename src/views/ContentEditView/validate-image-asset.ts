const PREFIX = './assets/'

/**
 * Verify that an `image:` frontmatter reference points to an asset
 * that actually exists in the current editor asset list.
 *
 * Rules:
 * - undefined / empty → OK (optional field).
 * - non-string → rejected (malformed frontmatter).
 * - must start with `./assets/` → rejected otherwise.
 * - the filename after the prefix must be in `assetNames`.
 *
 * @param image the frontmatter `image` value as-is
 * @param assetNames filenames currently known to the asset panel
 * @returns error message or undefined when valid
 */
export const validateImageAsset = (
  image: unknown,
  assetNames: readonly string[]
): string | undefined => {
  if (image === undefined || image === '') return undefined
  if (typeof image !== 'string') {
    return 'image frontmatter must be a string path'
  }
  if (!image.startsWith(PREFIX)) {
    return `image must reference a local asset path like ${PREFIX}<file>`
  }
  const name = image.slice(PREFIX.length)
  if (!assetNames.includes(name)) {
    return `image "${name}" is not present in this article's assets`
  }
  return undefined
}
