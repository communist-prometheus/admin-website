import type { AssetState } from './state'

/**
 * Create a function that sets a named asset as cover.
 * @param state - Reactive asset state
 * @returns Function accepting asset filename
 */
export const createSetCover =
  (state: AssetState) =>
  (assetName: string): void => {
    state.coverPath.value = `./assets/${assetName}`
  }

/**
 * Create a function that removes the cover image.
 * @param state - Reactive asset state
 * @returns Function with no arguments
 */
export const createRemoveCover = (state: AssetState) => (): void => {
  state.coverPath.value = undefined
}
