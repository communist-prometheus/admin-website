import { resolve } from 'node:path'
import type { UserConfig } from 'vite'

/**
 * Add the SW entry point to the Vite build config.
 * @param config - Vite user config
 */
export const addSWEntry = (config: UserConfig): void => {
  if (config.build?.ssr) return

  const input = config.build?.rolldownOptions?.input
  const swEntry = resolve(config.root ?? process.cwd(), 'src/sw/main.ts')

  if (typeof input === 'string') {
    config.build = {
      ...config.build,
      rolldownOptions: {
        ...config.build?.rolldownOptions,
        input: { main: input, sw: swEntry },
      },
    }
  }
}
