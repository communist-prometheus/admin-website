import type { Push, DeployRun } from './github-api.js';

/**
 * The publish state of a content push, derived from the site-deploy run it
 * triggered. Deliberately coarse — the site deploy exposes run status, not a
 * per-step breakdown, so the board shows real states rather than invented
 * "step 3 of 5" numbers.
 */
export type DeployPhase = 'queued' | 'building' | 'published' | 'failed' | 'unknown';

/** A push enriched with its deploy outcome for the board. */
export interface DeployedPush {
  readonly push: Push;
  readonly phase: DeployPhase;
  /** Wall-clock deploy duration in seconds (published runs only). */
  readonly durationSec?: number;
  /** Link to the deploy run on GitHub, when matched. */
  readonly runUrl?: string;
}

/** Maps a matched deploy run (or none) to a coarse publish phase. */
export const deployPhase = (run: DeployRun | undefined): DeployPhase => {
  if (run === undefined) return 'unknown';
  if (run.status === 'queued') return 'queued';
  if (run.status === 'in_progress') return 'building';
  if (run.conclusion === 'success') return 'published';
  if (run.conclusion === 'failure' || run.conclusion === 'timed_out') return 'failed';
  return 'unknown';
};

/** Milliseconds a push may precede its deploy run (clock skew / dispatch lag). */
const SKEW_MS = 5 * 60 * 1000;

/**
 * Finds the deploy run a push triggered: the run created nearest at/after the
 * push time (a small negative skew is tolerated). A content push kicks off the
 * site deploy shortly after the commit, so the closest later run is its deploy.
 */
export const matchRun = (
  pushDate: string,
  runs: readonly DeployRun[],
): DeployRun | undefined => {
  const pushed = Date.parse(pushDate);
  if (Number.isNaN(pushed)) return undefined;
  let best: DeployRun | undefined;
  let bestDelta = Number.POSITIVE_INFINITY;
  for (const run of runs) {
    const created = Date.parse(run.createdAt);
    if (Number.isNaN(created)) continue;
    const delta = created - pushed;
    if (delta >= -SKEW_MS && delta < bestDelta) {
      bestDelta = delta;
      best = run;
    }
  }
  return best;
};

/** Enriches each push with the deploy status of the run it triggered. */
export const correlateDeploys = (
  pushes: readonly Push[],
  runs: readonly DeployRun[],
): readonly DeployedPush[] =>
  pushes.map((push) => {
    const run = matchRun(push.date, runs);
    const phase = deployPhase(run);
    const durationSec =
      run !== undefined && phase === 'published'
        ? Math.max(0, Math.round((Date.parse(run.updatedAt) - Date.parse(run.createdAt)) / 1000))
        : undefined;
    return { push, phase, durationSec, runUrl: run?.url };
  });
