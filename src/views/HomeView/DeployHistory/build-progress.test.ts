import { describe, expect, it } from 'vitest'
import type { WorkflowJob } from '@/composables/useDeployStatus/workflow-types'
import { calcProgress, formatElapsed } from './build-progress'

const mockJob = (
  steps: ReadonlyArray<{ name: string; status: string }>
): WorkflowJob => ({
  id: 1,
  run_id: 1,
  status: 'in_progress',
  conclusion: undefined,
  started_at: '2026-04-18T00:00:00Z',
  completed_at: undefined,
  steps: steps.map((s, i) => ({
    name: s.name,
    status: s.status as 'completed' | 'in_progress' | 'queued',
    conclusion: s.status === 'completed' ? ('success' as const) : undefined,
    number: i + 1,
    started_at: '2026-04-18T00:00:00Z',
    completed_at:
      s.status === 'completed' ? '2026-04-18T00:01:00Z' : undefined,
  })),
})

describe('calcProgress', () => {
  it('returns 100 for completed run', () => {
    expect(calcProgress(undefined, 'completed')).toBe(100)
  })

  it('returns 0 for no job', () => {
    expect(calcProgress(undefined, 'in_progress')).toBe(0)
  })

  it('calculates from visible steps', () => {
    const job = mockJob([
      { name: 'Set up job', status: 'completed' },
      { name: 'Build', status: 'completed' },
      { name: 'Deploy', status: 'in_progress' },
      { name: 'Complete job', status: 'queued' },
    ])
    // Set up job and Complete job are in IGNORED_STEPS
    // Visible: Build (done), Deploy (active) → 1/2 = 50%
    expect(calcProgress(job, 'in_progress')).toBe(50)
  })

  it('returns 0 when no steps completed', () => {
    const job = mockJob([
      { name: 'Build', status: 'queued' },
      { name: 'Deploy', status: 'queued' },
    ])
    expect(calcProgress(job, 'in_progress')).toBe(0)
  })
})

describe('formatElapsed', () => {
  it('returns empty for undefined', () => {
    expect(formatElapsed(undefined, undefined)).toBe('')
  })

  it('formats completed build duration', () => {
    const start = '2026-04-18T00:00:00Z'
    const end = '2026-04-18T00:01:30Z'
    expect(formatElapsed(start, end)).toBe('1m 30s')
  })

  it('formats hours', () => {
    const start = '2026-04-18T00:00:00Z'
    const end = '2026-04-18T02:15:00Z'
    expect(formatElapsed(start, end)).toBe('2h 15m')
  })

  it('formats seconds only', () => {
    const start = '2026-04-18T00:00:00Z'
    const end = '2026-04-18T00:00:45Z'
    expect(formatElapsed(start, end)).toBe('45s')
  })
})
