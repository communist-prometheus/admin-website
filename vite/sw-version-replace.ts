import type { OutputBundle } from 'rolldown'

/**
 * Replace __SW_VERSION__ placeholder in all chunks.
 * @param bundle - Rolldown output bundle
 */
export const replaceSWVersion = (bundle: OutputBundle): void => {
  const version = Date.now().toString(36)
  for (const chunk of Object.values(bundle)) {
    if (chunk.type === 'chunk' && chunk.code) {
      chunk.code = chunk.code.replaceAll('__SW_VERSION__', version)
    }
  }
}
