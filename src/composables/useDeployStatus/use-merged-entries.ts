import { Option } from 'effect'
import { type ComputedRef, computed, type Ref } from 'vue'
import {
  clearPendingDeploy,
  isPendingMatched,
  type PendingDeploy,
  pendingDeploy,
  pendingToDeployBuild,
} from './pending-deploy'
import type { DeployBuild } from './workflow-types'

const PENDING_TTL_MS = 5 * 60 * 1000

const dropAndReturn = (
  list: ReadonlyArray<DeployBuild>
): ReadonlyArray<DeployBuild> => {
  clearPendingDeploy()
  return list
}

const mergeWithPending = (
  realList: ReadonlyArray<DeployBuild>,
  pending: PendingDeploy
): ReadonlyArray<DeployBuild> => {
  const expired = Date.now() - Date.parse(pending.createdAt) > PENDING_TTL_MS
  const matched = isPendingMatched(pending, realList)
  return expired || matched
    ? dropAndReturn(realList)
    : [pendingToDeployBuild(pending), ...realList]
}

/**
 * Merge the optimistic pending deploy entry with the real list so
 * the home view shows the user's most recent action instantly.
 * The pending entry is dropped once a real run with a matching
 * commit message arrives or after the TTL expires.
 * @param real Reactive ref of real polled deploy builds.
 * @returns Computed ref containing the merged list.
 */
export const useMergedEntries = (
  real: Ref<readonly DeployBuild[]>
): ComputedRef<ReadonlyArray<DeployBuild>> =>
  computed<ReadonlyArray<DeployBuild>>(() =>
    Option.match(Option.fromNullable(pendingDeploy.value), {
      onNone: () => real.value,
      onSome: pending => mergeWithPending(real.value, pending),
    })
  )
