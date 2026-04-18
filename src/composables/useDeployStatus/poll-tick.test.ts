import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { createDeployState } from './deploy-state'
import { allTerminal, buildEntries, fetchJobsFor, runTick } from './poll-tick'
import type {
  DeployBuild,
  WorkflowJob,
  WorkflowRun,
  WorkflowStep,
} from './workflow-types'

vi.mock('./workflow-api', () => ({
  fetchWorkflowRuns: vi.fn(),
  fetchWorkflowJobs: vi.fn(),
}))

const { fetchWorkflowRuns, fetchWorkflowJobs } = await import(
  './workflow-api'
)
const mockedRuns = vi.mocked(fetchWorkflowRuns)
const mockedJobs = vi.mocked(fetchWorkflowJobs)

const run = (
  id: number,
  status: WorkflowRun['status'],
  conclusion: WorkflowRun['conclusion'] = undefined
): WorkflowRun => ({
  id,
  name: 'Deploy',
  status,
  conclusion,
  head_branch: 'master',
  head_sha: `sha${id}`,
  created_at: '2026-04-16T00:00:00Z',
  updated_at: '2026-04-16T00:00:00Z',
  head_commit: {
    message: `commit ${id}`,
    author: { name: 'u', email: 'e' },
  },
})

const step = (
  name: string,
  status: WorkflowStep['status'] = 'completed'
): WorkflowStep => ({
  name,
  status,
  conclusion: 'success',
  number: 1,
  started_at: '2026-04-16T00:00:00Z',
  completed_at: '2026-04-16T00:00:30Z',
})

const job = (
  runId: number,
  steps: ReadonlyArray<WorkflowStep>
): WorkflowJob => ({
  id: runId * 10,
  run_id: runId,
  status: steps.every(s => s.status === 'completed')
    ? 'completed'
    : 'in_progress',
  conclusion: 'success',
  started_at: '2026-04-16T00:00:00Z',
  completed_at: '2026-04-16T00:00:30Z',
  steps,
})

const build = (
  r: WorkflowRun,
  jobs: ReadonlyArray<WorkflowJob>
): DeployBuild => ({
  run: r,
  jobs,
})

beforeEach(() => {
  mockedRuns.mockReset()
  mockedJobs.mockReset()
})

describe('buildEntries', () => {
  it('merges runs with cached jobs', () => {
    const runs = [run(1, 'completed', 'success')]
    const store = { 1: [job(1, [step('compile')])] }
    const entries = buildEntries(runs, store)
    expect(entries).toHaveLength(1)
    expect(entries[0]?.jobs).toHaveLength(1)
  })

  it('leaves jobs empty when store has no entry yet', () => {
    const entries = buildEntries([run(2, 'in_progress')], {})
    expect(entries[0]?.jobs).toEqual([])
  })
})

describe('allTerminal', () => {
  it('is false for empty list', () => {
    expect(allTerminal([])).toBe(false)
  })

  it('is true when every run is completed AND has final jobs', () => {
    const b = build(run(1, 'completed', 'success'), [job(1, [step('a')])])
    expect(allTerminal([b])).toBe(true)
  })

  it('is false when a run is still in progress', () => {
    const b = build(run(1, 'in_progress'), [
      job(1, [step('a', 'in_progress')]),
    ])
    expect(allTerminal([b])).toBe(false)
  })

  it('is false when jobs are still loading (empty jobs array)', () => {
    const b = build(run(1, 'completed', 'success'), [])
    expect(allTerminal([b])).toBe(false)
  })
})

describe('fetchJobsFor', () => {
  it('fetches only runs whose jobs are not final', async () => {
    const store: Record<number, ReadonlyArray<WorkflowJob>> = {
      1: [job(1, [step('done')])],
    }
    mockedJobs.mockResolvedValueOnce([
      job(2, [step('running', 'in_progress')]),
    ])
    await fetchJobsFor(
      [run(1, 'completed', 'success'), run(2, 'in_progress')],
      store
    )
    expect(mockedJobs).toHaveBeenCalledTimes(1)
    expect(mockedJobs).toHaveBeenCalledWith(2)
    expect(store[2]).toBeDefined()
  })

  it('does nothing when everything is final', async () => {
    const store: Record<number, ReadonlyArray<WorkflowJob>> = {
      1: [job(1, [step('done')])],
    }
    await fetchJobsFor([run(1, 'completed', 'success')], store)
    expect(mockedJobs).not.toHaveBeenCalled()
  })
})

describe('runTick', () => {
  it('pauses after the tick when all entries are terminal', async () => {
    mockedRuns.mockResolvedValueOnce([run(1, 'completed', 'success')])
    mockedJobs.mockResolvedValueOnce([job(1, [step('done')])])
    const state = createDeployState()
    const phase = ref<'idle' | 'polling' | 'paused'>('polling')
    const schedule = vi.fn()
    const setTimer = vi.fn()
    await runTick({ state, phase, schedule, setTimer, isWaitingForRun: () => false })
    expect(phase.value).toBe('paused')
    expect(schedule).not.toHaveBeenCalled()
  })

  it('keeps polling while any entry is still running', async () => {
    mockedRuns.mockResolvedValueOnce([run(1, 'in_progress')])
    mockedJobs.mockResolvedValueOnce([job(1, [step('step', 'in_progress')])])
    const state = createDeployState()
    const phase = ref<'idle' | 'polling' | 'paused'>('polling')
    const schedule = vi.fn()
    const setTimer = vi.fn()
    await runTick({ state, phase, schedule, setTimer, isWaitingForRun: () => false })
    expect(phase.value).toBe('polling')
    expect(schedule).toHaveBeenCalledOnce()
  })

  it('records errors from fetchWorkflowRuns without throwing', async () => {
    mockedRuns.mockRejectedValueOnce(new Error('network down'))
    const state = createDeployState()
    const phase = ref<'idle' | 'polling' | 'paused'>('polling')
    const schedule = vi.fn()
    await runTick({ state, phase, schedule, setTimer: vi.fn(), isWaitingForRun: () => false })
    expect(state.error.value).toBe('network down')
    // Keeps the loop alive on transient errors — we'll retry next tick.
    expect(schedule).toHaveBeenCalledOnce()
  })
})
