/**
 * Which repository the editor reads and writes.
 *
 * The coordinates were hard-coded here while the previous client took them
 * from the build (`VITE_GITHUB_OWNER` / `VITE_GITHUB_REPO`), which is what
 * kept every real-mode end-to-end spec pointed at the old client: the same
 * run against this editor would have committed into production content
 * instead of the sandbox. The defaults are the values that were hard-coded,
 * so an unconfigured build is unchanged.
 */

const DEFAULT_OWNER = 'communist-prometheus';
const DEFAULT_REPO = 'public-website-content';

const nonEmpty = (value: string | undefined, fallback: string): string =>
  value === undefined || value.trim() === '' ? fallback : value;

/** Repository owner the editor commits to. */
export const contentOwner = (): string =>
  nonEmpty(import.meta.env.VITE_GITHUB_OWNER, DEFAULT_OWNER);

/** Repository name the editor commits to. */
export const contentRepo = (): string =>
  nonEmpty(import.meta.env.VITE_GITHUB_REPO, DEFAULT_REPO);

/** `owner/repo`, for messages and for composing URLs. */
export const contentRepoSlug = (): string => `${contentOwner()}/${contentRepo()}`;

/** REST base for the content repository. */
export const contentRepoBase = (): string =>
  `https://api.github.com/repos/${contentRepoSlug()}`;

/** Raw-content base for the same repository. */
export const rawContentBase = (): string =>
  `https://raw.githubusercontent.com/${contentRepoSlug()}`;

/** Branch the editor reads and writes on. */
export const contentBranch = (): string =>
  nonEmpty(import.meta.env.VITE_GITHUB_BRANCH, 'develop');
