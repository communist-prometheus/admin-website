import type { InjectionKey } from 'vue'
import type { DeployInfo } from './types'

/** Track function signature. */
export type TrackDeploy = (sha: string) => void

/** Injection key for deploy tracking function. */
export const DEPLOY_TRACK_KEY: InjectionKey<TrackDeploy> =
  Symbol('deploy-track')

/** Injection key for deploy info. */
export const DEPLOY_INFO_KEY: InjectionKey<{
  readonly value: DeployInfo
}> = Symbol('deploy-info')
