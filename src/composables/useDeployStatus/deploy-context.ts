import type { InjectionKey } from 'vue'

/** Track function — starts polling for new version. */
export type TrackDeploy = () => void

/** Injection key for deploy tracking function. */
export const DEPLOY_TRACK_KEY: InjectionKey<TrackDeploy> =
  Symbol('deploy-track')
