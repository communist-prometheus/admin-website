import { IGNORED_STEPS } from '@/composables/useDeployStatus/workflow-constants'
import type { WorkflowJob } from '@/composables/useDeployStatus/workflow-types'

/**
 * Calculate build progress from actual step completion (0-100).
 * @param job - First workflow job with steps
 * @param runStatus - Workflow run status
 * @returns Progress percentage
 */
export const calcProgress = (
  job: WorkflowJob | undefined,
  runStatus: string
): number => {
  if (runStatus === 'completed') return 100
  const steps = job?.steps
  if (!steps || steps.length === 0) return 0
  const visible = steps.filter(s => !IGNORED_STEPS.has(s.name))
  if (visible.length === 0) return 0
  const done = visible.filter(s => s.status === 'completed').length
  return Math.round((done / visible.length) * 100)
}

/**
 * Format build duration (start → end for completed, start → now for active).
 * @param startedAt - ISO date when build started
 * @param completedAt - ISO date when build finished (undefined if active)
 * @returns Formatted duration string
 */
export const formatElapsed = (
  startedAt: string | undefined,
  completedAt: string | undefined
): string => {
  if (!startedAt) return ''
  const end = completedAt ? new Date(completedAt).getTime() : Date.now()
  const s = Math.round((end - new Date(startedAt).getTime()) / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  const rem = s % 60
  if (m < 60) return rem > 0 ? `${m}m ${rem}s` : `${m}m`
  const h = Math.floor(m / 60)
  const rm = m % 60
  return rm > 0 ? `${h}h ${rm}m` : `${h}h`
}
