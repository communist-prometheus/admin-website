import { type Ref, ref } from 'vue'
import type { DeployBuild, WorkflowJob } from './workflow-types'

/** Cache of workflow jobs keyed by run id. */
export type JobStore = Record<string, ReadonlyArray<WorkflowJob>>

/** Reactive state held by the useDeployBuilds composable. */
export interface DeployState {
  readonly entries: Ref<ReadonlyArray<DeployBuild>>
  readonly loading: Ref<boolean>
  readonly error: Ref<string | undefined>
  readonly store: JobStore
}

/**
 * Create reactive deploy state for the useDeployBuilds composable.
 * @returns Fresh deploy state with empty collections
 */
export const createDeployState = (): DeployState => ({
  entries: ref<ReadonlyArray<DeployBuild>>([]),
  loading: ref(true),
  error: ref<string | undefined>(),
  store: {},
})
