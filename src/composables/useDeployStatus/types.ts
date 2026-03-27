/** Possible deployment states. */
export type DeployStage = 'idle' | 'building' | 'success' | 'not-found'

/** Deploy status data. */
export interface DeployInfo {
  readonly stage: DeployStage
  readonly version?: number
  readonly createdOn?: string
}
