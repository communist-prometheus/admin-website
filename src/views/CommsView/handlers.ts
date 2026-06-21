import type { Lang, useCommsStore } from '@/stores/comms'
import type { useCutoffStore } from '@/stores/cutoff'
import type { useRunsStore } from '@/stores/runs'
import type { Schedule, useScheduleStore } from '@/stores/schedule'

type Stores = {
  readonly comms: ReturnType<typeof useCommsStore>
  readonly schedule: ReturnType<typeof useScheduleStore>
  readonly cutoff: ReturnType<typeof useCutoffStore>
  readonly runs: ReturnType<typeof useRunsStore>
}

const subscriberHandlers = (s: Stores) => ({
  onAdd: (email: string, langs: readonly Lang[], messageLang: Lang): void => {
    void s.comms.add(email, langs, messageLang)
  },
  onLangs: (id: number, langs: readonly Lang[]): void => {
    void s.comms.updateLangs(id, langs)
  },
  onMessageLang: (id: number, messageLang: Lang): void => {
    void s.comms.updateMessageLang(id, messageLang)
  },
  onRemove: (id: number): void => {
    void s.comms.remove(id)
  },
})

const settingsHandlers = (s: Stores) => ({
  onScheduleSave: (next: Schedule): void => {
    void s.schedule.save(next)
  },
  onCutoffSave: (next: string | null): void => {
    void s.cutoff.save(next)
  },
  onDispatched: (): void => {
    void s.runs.load()
    void s.cutoff.load()
  },
})

/**
 * Build the event-handler bundle wired into `CommsView.vue`. Pulled
 * out of the template script so the view stays under the
 * max-lines cap.
 * @param stores Active store instances captured by the view.
 * @returns Event handlers bound to those stores.
 */
export const buildHandlers = (stores: Stores) => ({
  ...subscriberHandlers(stores),
  ...settingsHandlers(stores),
})
