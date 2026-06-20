import { ref } from 'vue'
import type { Subscriber } from '@/validation/schemas/subscriber'
import {
  type CommsRefs,
  createAdd,
  createLoad,
  createRemove,
  createUpdateLangs,
  createUpdateMessageLang,
} from './comms-actions'

/**
 * Reactive state + actions for the comms (newsletter) admin store.
 * Talks directly to lists.comprom.org; auth is the browser CF
 * Access cookie set on `.comprom.org`.
 * @returns Store state and actions.
 */
export const createCommsState = () => {
  const r: CommsRefs = {
    subscribers: ref<readonly Subscriber[]>([]),
    loading: ref(false),
    loaded: ref(false),
    saving: ref(false),
  }
  const load = createLoad(r)
  return {
    ...r,
    load,
    add: createAdd(r, load),
    updateLangs: createUpdateLangs(load),
    updateMessageLang: createUpdateMessageLang(load),
    remove: createRemove(load),
  }
}
