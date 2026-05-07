import { computed, ref } from 'vue'
import type { TicketAttachment } from '../templates/attachment-types'
import { emptyTemplate } from '../templates/empty'
import type { TicketTemplate, TicketTemplateKind } from '../templates/types'

const initial = () => ({
  title: ref(''),
  target: ref<'public-website' | 'admin'>('public-website'),
  kind: ref<TicketTemplateKind>('bug'),
  template: ref<TicketTemplate>(emptyTemplate('bug')),
  attachments: ref<readonly TicketAttachment[]>([]),
  uploading: ref(false),
})

/**
 * Reactive state + helpers for the ticket create form.
 *
 * Switching template kind resets the structured fields to the new
 * empty shape — title and attachments survive, since those are
 * meaningful regardless of which template the user lands on.
 *
 * @returns Reactive refs and mutators consumed by the form
 */
export const useCreateForm = () => {
  const s = initial()
  return {
    ...s,
    titleTrimmed: computed(() => s.title.value.trim()),
    labels: computed(() => [s.target.value, s.kind.value]),
    setKind: (next: TicketTemplateKind): void => {
      s.kind.value = next
      s.template.value = emptyTemplate(next)
    },
    reset: (): void => {
      s.title.value = ''
      s.template.value = emptyTemplate(s.kind.value)
      s.attachments.value = []
    },
    removeAttachment: (id: string): void => {
      s.attachments.value = s.attachments.value.filter(a => a.id !== id)
    },
  }
}
