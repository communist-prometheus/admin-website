import type { DeployRun } from './github-api.js';

/**
 * Whether the public site is currently building what the repository holds.
 *
 * The admin shows the content repository; the site shows what the deploy built
 * from it. A failing deploy silently separates the two — the article is in the
 * admin, correct and published, and simply never appears on the site. Surfacing
 * the build state next to the publish is what closes that gap.
 */
export type SiteBuildPhase = 'ok' | 'building' | 'failed' | 'unknown';

/** The site's build state, plus where to look when it is not healthy. */
export interface SiteBuildState {
  readonly phase: SiteBuildPhase;
  /** The run this state came from, when there is one. */
  readonly runUrl?: string;
  /** The newest failed run, even while a later one is still building. */
  readonly lastFailedUrl?: string;
}

/** A run that reached a verdict of its own (not cancelled by a newer deploy). */
const isDecided = (run: DeployRun): boolean =>
  run.status === 'completed' && run.conclusion !== 'cancelled' && run.conclusion !== 'skipped';

const isFailure = (run: DeployRun): boolean =>
  run.conclusion === 'failure' || run.conclusion === 'timed_out';

/**
 * Derives the site's build state from recent deploy runs, newest first.
 * @param runs - deploy runs for the branch this admin publishes to
 * @returns the current phase and the runs worth linking to
 */
export const siteBuildState = (runs: readonly DeployRun[]): SiteBuildState => {
  const inFlight = runs.find((run) => run.status !== 'completed');
  const decided = runs.find(isDecided);
  const lastFailed = decided !== undefined && isFailure(decided) ? decided : undefined;
  const failedUrl = lastFailed === undefined ? {} : { lastFailedUrl: lastFailed.url };
  if (inFlight !== undefined) return { phase: 'building', runUrl: inFlight.url, ...failedUrl };
  if (decided === undefined) return { phase: 'unknown' };
  return isFailure(decided)
    ? { phase: 'failed', runUrl: decided.url, lastFailedUrl: decided.url }
    : { phase: 'ok', runUrl: decided.url };
};
