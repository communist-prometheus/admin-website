import type { InjectionKey, Ref } from 'vue'
import type { DeployInfo } from './types'

/** Track function — starts polling for new version. */
export type TrackDeploy = () => void

/** Injection key for deploy tracking function. */
export const DEPLOY_TRACK_KEY: InjectionKey<TrackDeploy> =
  Symbol('deploy-track')

/** Injection key for reactive deploy info. */
export const DEPLOY_INFO_KEY: InjectionKey<Ref<DeployInfo>> =
  Symbol('deploy-info')
