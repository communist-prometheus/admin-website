/**
 * Recognize content markdown paths in any of the layouts admin has
 * shipped over time:
 *
 *   blog/<slug>/index.en.md                 (current)
 *   src/content/blog/<slug>/index.en.md     (legacy)
 *   <cp>/blog/<slug>/index.en.md            (custom contentPath)
 *
 * Returns `undefined` for paths the validator should leave alone
 * (assets/, settings/, .admin/, root README, etc.).
 *
 * The lang group is broad on purpose — narrowing to a hardcoded
 * `(en|ru|it|es)` enum is what hid the `lang: uk` regression. Real
 * language whitelist lives in `workerState.supportedLangs`.
 */
const CONTENT_MD_RE =
  /(?:^|\/)(blog|positions|pages|common|newspaper)\/[^/]+\/index\.([a-z]{2,8})\.md$/

/** Parsed content-md path parts. */
export interface ContentPathParts {
  readonly type: 'blog' | 'positions' | 'pages' | 'common' | 'newspaper'
  readonly lang: string
}

/**
 * Extract `<type>` and `<lang>` from a staged path. `undefined` for
 * non-content paths.
 * @param path - Repo-relative path being staged
 * @returns Parsed parts or undefined when the path is non-content
 */
export const parseContentPath = (
  path: string
): ContentPathParts | undefined => {
  const m = CONTENT_MD_RE.exec(path)
  const type = m?.[1]
  const lang = m?.[2]
  return type && lang
    ? { type: type as ContentPathParts['type'], lang }
    : undefined
}
