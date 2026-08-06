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
    expect(deployPhase(run({ status: 'completed', conclusion: 'cancelled' }))).toBe('unknown');
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

  it('ignores runs long before the push (beyond skew)', () => {
    // push is after r1 by an hour, before r2 → r2 is the nearest at/after
    expect(matchRun('2026-08-04T11:00:00Z', runs)?.url).toBe('r2');
  });

  it('returns undefined for an unparseable date or no candidate', () => {
    expect(matchRun('not-a-date', runs)).toBeUndefined();
    expect(matchRun('2026-08-06T00:00:00Z', runs)).toBeUndefined();
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

  it('reports unknown when no run matches', () => {
    const [d] = correlateDeploys([push({ date: '2020-01-01T00:00:00Z' })], []);
    expect(d.phase).toBe('unknown');
    expect(d.durationSec).toBeUndefined();
  });
});
