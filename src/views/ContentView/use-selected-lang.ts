import { computed } from 'vue'
import type { LocationQuery, Router } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import type { Language } from '@/types/content'
import { extractString } from '@/validation/extract-string'

const DEFAULT_LANG: Language = 'en'

const pickLang = (
  raw: string | undefined,
  available: readonly Language[],
  fallback: Language
): Language =>
  raw !== undefined && available.includes(raw)
    ? raw
    : (available[0] ?? fallback)

const writeLang = (
  router: Router,
  query: LocationQuery,
  lang: Language
): void => {
  void router.replace({ query: { ...query, lang } })
}

/**
 * URL-bound selected-language ref.
 *
 * Reads `?lang=<code>` from the current route, validates it
 * against `available` (defaults to first available, then `en`),
 * and persists writes via `router.replace` so the value
 * survives back/forward navigation.
 * @param available - Reactive set of language codes present in the
 *   current content list. The first entry is the fallback when the
 *   query param is missing or invalid.
 * @returns Computed get/set ref usable as a `v-model` target.
 */
export const useSelectedLang = (available: () => readonly Language[]) => {
  const route = useRoute()
  const router = useRouter()
  return computed<Language>({
    get: () =>
      pickLang(extractString(route.query.lang), available(), DEFAULT_LANG),
    set: lang => writeLang(router, route.query, lang),
  })
}
