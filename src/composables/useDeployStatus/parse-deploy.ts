import type { DeployInfo, DeployStage } from './types'

const STAGE_MAP: Record<string, DeployStage> = {
  idle: 'queued',
  queued: 'queued',
  active: 'building',
  build: 'building',
  deploying: 'deploying',
  success: 'success',
  failure: 'failure',
}

interface RawDeploy {
  latest_stage?: { name?: string }
  stage?: string
  url?: string
  created_on?: string
}

/**
 * Parse Cloudflare deployment JSON into DeployInfo.
 * @param data - Raw CF API deployment object
 * @returns Normalized deploy info
 */
export const parseDeploy = (data: unknown): DeployInfo => {
  const d = data as RawDeploy
  const raw = String(d.latest_stage?.name ?? d.stage ?? 'queued')
  return {
    stage: STAGE_MAP[raw] ?? 'building',
    url: d.url,
    createdOn: d.created_on,
  }
}
