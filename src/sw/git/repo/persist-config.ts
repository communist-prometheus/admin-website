import { parseJsonAs } from '@/validation/decode'
import type { SWGitConfig } from '@/validation/schemas/sw-config'
import { SWGitConfigSchema } from '@/validation/schemas/sw-config'
import { fs } from '../fs'

const CONFIG_PATH = '/.sw-config.json'

/**
 * Persist SW config to IndexedDB-backed FS.
 * Survives SW termination/restart by the browser.
 * @param config - Git config to persist
 */
export const saveConfig = async (config: SWGitConfig): Promise<void> => {
  const json = JSON.stringify(config)
  await fs.promises.writeFile(CONFIG_PATH, json, 'utf8')
}

/**
 * Load persisted SW config after browser-triggered restart.
 * @returns The stored config, or undefined if none saved
 */
export const loadConfig = async (): Promise<SWGitConfig | undefined> => {
  try {
    const raw = await fs.promises.readFile(CONFIG_PATH, 'utf8')
    return parseJsonAs(SWGitConfigSchema)(raw)
  } catch {
    return undefined
  }
}
