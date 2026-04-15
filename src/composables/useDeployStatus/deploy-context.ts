import type { InjectionKey, Ref } from 'vue'
import type { DeployBuild } from './workflow-types'

/**
 * Resume polling — called after a save commits so the freshly-
 * triggered workflow run shows up without waiting for a random tick.
 * Name preserved for existing callers; maps to `requestPoll` on the
 * unified deploy polling composable.
 */
export type TrackDeploy = () => void

/** Injection key for the resume-polling function. */
export const DEPLOY_TRACK_KEY: InjectionKey<TrackDeploy> =
  Symbol('deploy-track')

/** Shared reactive entries — single source of truth app-wide. */
export const DEPLOY_ENTRIES_KEY: InjectionKey<
  Ref<ReadonlyArray<DeployBuild>>
> = Symbol('deploy-entries')

/** Shared loading flag for the home deploy list. */
export const DEPLOY_LOADING_KEY: InjectionKey<Ref<boolean>> =
  Symbol('deploy-loading')
