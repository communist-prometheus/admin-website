import { computed } from 'vue'
import type { LocationQuery, Router } from 'vue-router'
import { useRoute, useRouter } from 'vue-router'
import type { Language } from '@/types/content'
import { extractString } from '@/validation/extract-string'

const DEFAULT_LANG: Language = 'en'

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
 * Reads `?lang=<code>` from the current route as-is. The available-
 * languages list is consulted only as a fallback default when the
 * URL is missing the param — a code that the user has explicitly
 * selected (even one with no content yet) MUST stay selected so they
 * can land on an empty list and create the first entry.
 *
 * Earlier version validated `?lang=` against the loaded-content
 * subset, which silently demoted `?lang=ru` to `en` when no Russian
 * content existed — the URL stayed at `ru` but the selector rendered
 * `en`, and the content area read "No content found for en".
 *
 * @param available - Reactive set of language codes present in the
 *   current content list. Used only as the fallback default when
 *   `?lang=` is absent.
 * @returns Computed get/set ref usable as a `v-model` target.
 */
export const useSelectedLang = (available: () => readonly Language[]) => {
  const route = useRoute()
  const router = useRouter()
  return computed<Language>({
    get: () =>
      extractString(route.query.lang) ?? available()[0] ?? DEFAULT_LANG,
    set: lang => writeLang(router, route.query, lang),
  })
}
