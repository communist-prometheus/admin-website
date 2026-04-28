import type { Ref } from 'vue'
import { sanitizeSlug } from '@/utils/sanitize-slug'

const inputs = (target: EventTarget | null): readonly HTMLInputElement[] =>
  target instanceof HTMLInputElement ? [target] : []

const applyClean =
  (slug: Ref<string>) =>
  (target: HTMLInputElement): void => {
    const cleaned = sanitizeSlug(target.value)
    slug.value = cleaned
    target.value = cleaned
  }

/**
 * Build an input handler that keeps a slug ref synced with a
 * sanitized version of what the user typed. Mutates the input
 * element's value too, so visually-rejected characters never
 * appear in the field.
 *
 * @param slug - Reactive ref backing the slug field
 * @returns Vue @input handler
 */
export const createSlugInputHandler =
  (slug: Ref<string>) =>
  (event: Event): void => {
    inputs(event.target).forEach(applyClean(slug))
  }
