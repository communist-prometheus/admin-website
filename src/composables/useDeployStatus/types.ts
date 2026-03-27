/** Possible deployment states. */
export type DeployStage =
  | 'idle'
  | 'queued'
  | 'building'
  | 'deploying'
  | 'success'
  | 'failure'
  | 'not-found'

/** Deploy status data. */
export interface DeployInfo {
  readonly stage: DeployStage
  readonly url?: string
  readonly createdOn?: string
}
