import { describe, expect, it } from 'vitest';
import { siteBuildState } from './site-build-state.ts';
import type { DeployRun } from './github-api.ts';

/*
 * The admin reads the content repository; the public site is what the deploy
 * BUILDS from it. When that build fails, the two diverge: the editor opens the
 * admin, sees the article sitting there, and cannot find it on the site — with
 * nothing anywhere in the editor to explain why. That is what happened on
 * 2026-09-06: production deploys failed from 13:49 until 22:08 UTC on one
 * unbuildable file, so nothing published at all in between.
 */
const run = (
  status: DeployRun['status'],
  conclusion: string,
  id = 1,
): DeployRun => ({ id, status, conclusion, url: `https://run/${id}`, createdAt: '2026-09-06T13:49:32Z' });

describe('siteBuildState', () => {
  it('reports a failing site build with the run to look at', () => {
    const state = siteBuildState([run('completed', 'failure', 7)]);
    expect(state.phase).toBe('failed');
    expect(state.runUrl).toBe('https://run/7');
  });

  it('is healthy when the newest finished run succeeded', () => {
    const state = siteBuildState([run('completed', 'success', 9)]);
    expect(state.phase).toBe('ok');
  });

  it('reports a build in flight', () => {
    const state = siteBuildState([run('in_progress', '', 3)]);
    expect(state.phase).toBe('building');
  });

  /*
   * A run still building tells nothing about the last published state, so the
   * newest FINISHED run decides whether the site is currently broken.
   */
  it('looks past an in-flight run to the last finished one', () => {
    const state = siteBuildState([run('in_progress', '', 4), run('completed', 'failure', 3)]);
    expect(state.phase).toBe('building');
    expect(state.lastFailedUrl).toBe('https://run/3');
  });

  it('says nothing when there is no run history to judge by', () => {
    expect(siteBuildState([]).phase).toBe('unknown');
  });

  it('ignores runs that were cancelled by a newer deploy', () => {
    const state = siteBuildState([run('completed', 'cancelled', 5), run('completed', 'success', 4)]);
    expect(state.phase).toBe('ok');
  });
});
