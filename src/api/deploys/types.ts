/** A Cloudflare deployment entry. */
export interface CfDeploy {
  readonly id: string
  readonly createdOn: string
  readonly source: string
  readonly versionId: string
}
