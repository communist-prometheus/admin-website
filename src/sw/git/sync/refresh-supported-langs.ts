import { Schema } from 'effect'
import { rethrow } from '@/utils/rethrow'
import { LanguageArraySchema } from '@/validation/schemas/languages'
import { log } from '../../logging/logger'
import { workerState } from '../../state/state'
import { readRepoFile } from '../io/read-file'

const LANGS_PATH = 'settings/languages.json'

const isFileNotFound = (e: unknown): boolean =>
  typeof e === 'object' &&
  e !== null &&
  'code' in e &&
  (e as { code: string }).code === 'ENOENT'

const tryReadLangsFile = async (): Promise<string | undefined> => {
  try {
    return await readRepoFile(LANGS_PATH)
  } catch (e) {
    return isFileNotFound(e) ? undefined : rethrow(e)
  }
}

const applyLangs = (raw: string): void => {
  const arr = Schema.decodeUnknownSync(LanguageArraySchema)(JSON.parse(raw))
  workerState.supportedLangs = new Set(arr.map(l => l.code))
  log(
    'info',
    'lifecycle',
    `supportedLangs: ${[...workerState.supportedLangs].join(',')}`
  )
}

const noteAbsent = (): void => {
  log(
    'info',
    'lifecycle',
    'supportedLangs: settings/languages.json absent — using default set'
  )
}

/**
 * Refresh `workerState.supportedLangs` from `settings/languages.json`
 * inside the freshly-synced repo. The set drives stage-time
 * validation — without it admin happily commits unbuildable repo
 * state (the `lang: uk` regression that took prod red 6h on
 * 2026-05-09).
 *
 * Failure modes:
 * - file missing (ENOENT): brand-new repo or pre-settings repo;
 *   info-log and keep the compile-time default. Admin must remain
 *   usable on a fresh sandbox.
 * - JSON parse / schema decode / IO error: real bug. Throws so the
 *   caller surfaces it rather than masking the regression with a
 *   silent fallback.
 * @returns Resolves once `workerState.supportedLangs` reflects the
 *   repo (or the file is genuinely absent).
 */
export const refreshSupportedLangs = async (): Promise<void> => {
  const raw = await tryReadLangsFile()
  return raw === undefined ? noteAbsent() : applyLangs(raw)
}
