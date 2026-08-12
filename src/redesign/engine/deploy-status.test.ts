import { describe, it, expect } from 'vitest';
import { deployPhase, matchRun, correlateDeploys } from './deploy-status.ts';
import type { DeployRun, Push } from './github-api.ts';

const run = (over: Partial<DeployRun>): DeployRun => ({
  status: 'completed',
  conclusion: 'success',
  createdAt: '2026-08-04T09:20:35Z',
  updatedAt: '2026-08-04T09:23:05Z',
  url: 'https://gh/run',
  ...over,
});

describe('deployPhase', () => {
  it('maps run status/conclusion to a coarse phase', () => {
    expect(deployPhase(undefined)).toBe('unknown');
    expect(deployPhase(run({ status: 'queued' }))).toBe('queued');
    expect(deployPhase(run({ status: 'in_progress' }))).toBe('building');
    expect(deployPhase(run({ status: 'completed', conclusion: 'success' }))).toBe('published');
    expect(deployPhase(run({ status: 'completed', conclusion: 'failure' }))).toBe('failed');
    // A concurrency-cancelled run was superseded by a newer deploy, not "no data".
    expect(deployPhase(run({ status: 'completed', conclusion: 'cancelled' }))).toBe('superseded');
    expect(deployPhase(run({ status: 'completed', conclusion: 'skipped' }))).toBe('superseded');
    expect(deployPhase(run({ status: 'completed', conclusion: 'neutral' }))).toBe('unknown');
  });
});

describe('matchRun', () => {
  const runs = [
    run({ createdAt: '2026-08-04T09:20:35Z', url: 'r1' }), // ~35s after the push
    run({ createdAt: '2026-08-05T10:00:00Z', url: 'r2' }), // a day later
  ];

  it('picks the run created just after the push', () => {
    expect(matchRun('2026-08-04T09:20:00Z', runs)?.url).toBe('r1');
  });

  it('does not attribute a run started long after the push (outside the window)', () => {
    // push at 11:00; the only later run (r2) is ~23h out — not this push's deploy.
    expect(matchRun('2026-08-04T11:00:00Z', runs)).toBeUndefined();
  });

  it('returns undefined for an unparseable date or no candidate', () => {
    expect(matchRun('not-a-date', runs)).toBeUndefined();
    expect(matchRun('2026-08-06T00:00:00Z', runs)).toBeUndefined();
  });

  it('prefers the successful run over the concurrency-cancelled duplicate', () => {
    const push = '2026-08-04T09:20:00Z';
    const overlapping = [
      run({ createdAt: '2026-08-04T09:20:10Z', conclusion: 'cancelled', url: 'cancelled' }),
      run({ createdAt: '2026-08-04T09:21:40Z', conclusion: 'success', url: 'success' }),
    ];
    expect(matchRun(push, overlapping)?.url).toBe('success');
  });
});

describe('correlateDeploys', () => {
  const push = (over: Partial<Push>): Push => ({
    sha: 'abc1234',
    title: 'content: fix',
    author: 'undeadliner',
    date: '2026-08-04T09:20:00Z',
    url: 'https://gh/commit',
    ...over,
  });

  it('enriches a push with phase, duration and run url', () => {
    const [d] = correlateDeploys(
      [push({})],
      [run({ createdAt: '2026-08-04T09:20:35Z', updatedAt: '2026-08-04T09:23:05Z', url: 'r1' })],
    );
    expect(d.phase).toBe('published');
    expect(d.durationSec).toBe(150); // 09:20:35 → 09:23:05
    expect(d.runUrl).toBe('r1');
  });

  it('reports unknown when there are no runs at all', () => {
    const [d] = correlateDeploys([push({ date: '2020-01-01T00:00:00Z' })], []);
    expect(d.phase).toBe('unknown');
    expect(d.durationSec).toBeUndefined();
  });

  it('reports pending for a fresh push newer than every known run', () => {
    // The just-committed push has not triggered its deploy yet: awaiting, not
    // missing data (QA #10 — no more grey no-data dot right after a commit).
    const [d] = correlateDeploys(
      [push({ date: '2026-08-04T12:00:00Z' })],
      [run({ createdAt: '2026-08-04T09:20:35Z', url: 'r-old' })],
    );
    expect(d.phase).toBe('pending');
    expect(d.runUrl).toBeUndefined();
  });
});
