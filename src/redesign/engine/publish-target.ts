/**
 * Which site a publish from THIS admin actually reaches.
 *
 * The admin is deployed twice against the same content repository: the
 * production build writes the `master` branch (comprom.org), the dev build
 * writes `develop` (dev.comprom.org). Nothing used to say which one you had
 * open, so an editor published a translation on the dev admin, saw it succeed,
 * never found it on the public site, and went on to hand-edit the file on
 * GitHub — which broke the production build.
 */

/** The site a publish on the current build lands on. */
export interface PublishTarget {
  /** Content branch this build reads and writes. */
  readonly branch: string;
  /** Host of the site that branch is published to. */
  readonly site: string;
  readonly siteUrl: string;
  /** True only for the branch that feeds the public site. */
  readonly production: boolean;
}

const PRODUCTION_BRANCH = 'master';

const hostFor = (branch: string): string =>
  branch === PRODUCTION_BRANCH ? 'comprom.org' : branch === 'develop' ? 'dev.comprom.org' : `${branch}.comprom.org`;

/**
 * The publish target of the running build.
 * @returns branch, site host and whether that site is the public one
 */
export const publishTarget = (): PublishTarget => {
  const configured = import.meta.env.VITE_GITHUB_BRANCH;
  const branch = typeof configured === 'string' && configured !== '' ? configured : 'develop';
  const site = hostFor(branch);
  return { branch, site, siteUrl: `https://${site}`, production: branch === PRODUCTION_BRANCH };
};
