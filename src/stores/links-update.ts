import type { Ref } from 'vue'
import type { LinkEntry } from '@/validation/schemas/links'
import { saveLinksFile } from './links-api'

/**
 * Create the updater that writes the links document back via the SW.
 * @param entries - Reactive entries ref.
 * @param groups - Reactive group-order ref.
 * @param fileSha - Reactive file SHA ref.
 * @returns Async function that saves entries; resolves to success.
 */
export const createUpdateLinks =
  (
    entries: Ref<readonly LinkEntry[]>,
    groups: Ref<readonly string[]>,
    fileSha: Ref<string>
  ) =>
  async (next: readonly LinkEntry[]): Promise<boolean> => {
    const res = await saveLinksFile(
      { groups: groups.value, entries: next },
      fileSha.value
    )
    const data = res.ok ? await res.json() : undefined
    entries.value = res.ok ? next : entries.value
    fileSha.value = data?.content?.sha ?? fileSha.value
    return res.ok
  }
