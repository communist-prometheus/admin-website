import type { Ref } from 'vue'
import { fireAndForward } from '@/utils/fire-and-forward'
import type { LanguageEntry } from '@/validation/schemas/languages'
import { seedNewLanguages } from './seed-translations'
import { saveLanguagesFile } from './settings-api'

const newCodesIn = (
  next: readonly LanguageEntry[],
  prev: readonly LanguageEntry[]
): readonly string[] => {
  const known = new Set(prev.map(l => l.code))
  return next.map(l => l.code).filter(c => !known.has(c))
}

interface ApplyDeps {
  readonly res: Response
  readonly entries: readonly LanguageEntry[]
  readonly newLangs: readonly string[]
  readonly languages: Ref<readonly LanguageEntry[]>
  readonly fileSha: Ref<string>
}

/**
 * Commit the API response into the store and run the per-lang seeder.
 * Split out so `createUpdateLanguages` stays tiny.
 * @param d - State refs + parsed payload
 * @returns Always true (caller already decided ok)
 */
const applySaved = async (d: ApplyDeps): Promise<boolean> => {
  d.languages.value = d.entries
  const data = await d.res.json()
  d.fileSha.value = data.content?.sha ?? d.fileSha.value
  /* Best-effort fan-out — seed failures must reach the unhandled-
   * rejection handler instead of disappearing. The previous
   * `.catch(() => undefined)` swallowed the whole class of "lang
   * added in settings but new placeholder files never committed"
   * regressions. */
  fireAndForward(seedNewLanguages(d.newLangs))
  return true
}

/**
 * Create updater that saves languages to the API and, when a brand-new
 * lang was added, stages + commits empty translation files for every
 * `pages/*` and `common/*` slug under the new lang code. Without this
 * fan-out the new lang only lives in `settings/languages.json` and
 * editors can't open or save the per-slug files because the fixed-
 * structure types don't expose a "create" UI.
 *
 * @param languages - Reactive languages ref
 * @param fileSha - Reactive file SHA ref
 * @returns Async function that updates languages
 */
export const createUpdateLanguages =
  (languages: Ref<readonly LanguageEntry[]>, fileSha: Ref<string>) =>
  async (entries: readonly LanguageEntry[]): Promise<boolean> => {
    const newLangs = newCodesIn(entries, languages.value)
    const res = await saveLanguagesFile(entries, fileSha.value)
    return res.ok
      ? applySaved({ res, entries, newLangs, languages, fileSha })
      : false
  }
