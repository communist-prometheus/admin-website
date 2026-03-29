import type { CfDeploy } from './types'

const CF_API = 'https://api.cloudflare.com/client/v4'

interface CfDeploymentRaw {
  readonly id: string
  readonly created_on: string
  readonly source: string
  readonly versions: readonly { readonly version_id: string }[]
}

/**
 * Fetch recent deployments from CF Workers API.
 * @param token - Cloudflare API token
 * @param accountId - Cloudflare account ID
 * @param scriptName - Workers script name
 * @returns Array of deployment entries
 */
export const fetchCfDeployments = async (
  token: string,
  accountId: string,
  scriptName: string
): Promise<readonly CfDeploy[]> => {
  const url = `${CF_API}/accounts/${accountId}/workers/scripts/${scriptName}/deployments`
  const r = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  })
  if (!r.ok) return []
  const data: {
    result?: { deployments?: readonly CfDeploymentRaw[] }
  } = await r.json()
  return (data.result?.deployments ?? []).map(d => ({
    id: d.id,
    createdOn: d.created_on,
    source: d.source,
    versionId: d.versions[0]?.version_id ?? '',
  }))
}
