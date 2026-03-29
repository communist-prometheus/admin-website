/** A Cloudflare deployment entry. */
export interface CfDeploy {
  readonly id: string
  readonly createdOn: string
  readonly source: string
  readonly versionId: string
}

/** A GitHub commit entry. */
export interface GhCommit {
  readonly sha: string
  readonly message: string
  readonly author: string
  readonly date: string
}

/** Merged deploy entry for the client. */
export interface DeployEntry {
  readonly id: string
  readonly createdOn: string
  readonly source: string
  readonly versionId: string
  readonly commit?: GhCommit
}
