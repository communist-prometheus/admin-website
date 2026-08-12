import type { Push, DeployRun } from './github-api.js';

/**
 * The publish state of a content push, derived from the site-deploy run it
 * triggered. Deliberately coarse — the site deploy exposes run status, not a
 * per-step breakdown, so the board shows real states rather than invented
 * "step 3 of 5" numbers.
 */
export type DeployPhase =
  | 'pending'
  | 'queued'
  | 'building'
  | 'published'
  | 'superseded'
  | 'failed'
  | 'unknown';

/** A push enriched with its deploy outcome for the board. */
export interface DeployedPush {
  readonly push: Push;
  readonly phase: DeployPhase;
  /** Wall-clock deploy duration in seconds (published runs only). */
  readonly durationSec?: number;
  /** Link to the deploy run on GitHub, when matched. */
  readonly runUrl?: string;
  /** The matched run's id, so the board can fetch its steps on demand. */
  readonly runId?: number;
}

/** Maps a matched deploy run (or none) to a coarse publish phase. */
export const deployPhase = (run: DeployRun | undefined): DeployPhase => {
  if (run === undefined) return 'unknown';
  if (run.status === 'queued') return 'queued';
  if (run.status === 'in_progress') return 'building';
  if (run.conclusion === 'success') return 'published';
  if (run.conclusion === 'failure' || run.conclusion === 'timed_out') return 'failed';
  // A content save fires overlapping deploys (develop + master); deploy.yml's
  // per-branch concurrency cancels the older one, so a cancelled/skipped run
  // was superseded by a newer deploy — not "no data".
  if (run.conclusion === 'cancelled' || run.conclusion === 'skipped') return 'superseded';
  return 'unknown';
};

/** Milliseconds a push may precede its deploy run (clock skew / dispatch lag). */
const SKEW_MS = 5 * 60 * 1000;

/** A push's deploy starts within this window; runs after it belong to a later push. */
const MATCH_WINDOW_MS = 20 * 60 * 1000;

/** How informative a run's outcome is — success wins over an in-progress retry,
 *  which wins over a failure, which wins over a concurrency-cancel. */
const outcomeRank = (run: DeployRun): number => {
  if (run.status !== 'completed') return 2; // queued / in_progress
  if (run.conclusion === 'success') return 3;
  if (run.conclusion === 'failure' || run.conclusion === 'timed_out') return 1;
  return 0; // cancelled / skipped / neutral
};

/**
 * Finds the deploy run a push triggered. One content save fires overlapping
 * deploys (develop + master) that the per-branch concurrency cancels down to
 * one successful run, so among the runs in the push's window we pick the most
 * informative outcome (a success over the cancelled duplicate), not merely the
 * nearest — otherwise a published push reads as "superseded".
 */
export const matchRun = (
  pushDate: string,
  runs: readonly DeployRun[],
): DeployRun | undefined => {
  const pushed = Date.parse(pushDate);
  if (Number.isNaN(pushed)) return undefined;
  const candidates = runs
    .map((run) => ({ run, created: Date.parse(run.createdAt) }))
    .filter(
      ({ created }) =>
        !Number.isNaN(created) && created >= pushed - SKEW_MS && created <= pushed + MATCH_WINDOW_MS,
    );
  if (candidates.length === 0) return undefined;
  return [...candidates].sort(
    (a, b) => outcomeRank(b.run) - outcomeRank(a.run) || a.created - b.created,
  )[0].run;
};

/** The most recent run's creation time, or -Infinity when the list is empty. */
const newestRunTime = (runs: readonly DeployRun[]): number =>
  runs.reduce((max, run) => {
    const created = Date.parse(run.createdAt);
    return Number.isNaN(created) ? max : Math.max(max, created);
  }, Number.NEGATIVE_INFINITY);

/**
 * Phase of a push with no matched run. A push newer than every known run has
 * simply not triggered its deploy yet — that is "awaiting deploy", not missing
 * data. Only a push that predates the newest run (so its run has aged out of the
 * fetched window) is genuinely unknown.
 */
const unmatchedPhase = (pushDate: string, newestRun: number): DeployPhase => {
  const pushed = Date.parse(pushDate);
  // No runs at all (fetch failure / no history) — can't tell pending from data.
  if (Number.isNaN(pushed) || !Number.isFinite(newestRun)) return 'unknown';
  return pushed >= newestRun - SKEW_MS ? 'pending' : 'unknown';
};

/** Enriches each push with the deploy status of the run it triggered. */
export const correlateDeploys = (
  pushes: readonly Push[],
  runs: readonly DeployRun[],
): readonly DeployedPush[] => {
  const newest = newestRunTime(runs);
  return pushes.map((push) => {
    const run = matchRun(push.date, runs);
    const phase = run === undefined ? unmatchedPhase(push.date, newest) : deployPhase(run);
    const durationSec =
      run !== undefined && phase === 'published'
        ? Math.max(0, Math.round((Date.parse(run.updatedAt) - Date.parse(run.createdAt)) / 1000))
        : undefined;
    return { push, phase, durationSec, runUrl: run?.url, runId: run?.id };
  });
};
