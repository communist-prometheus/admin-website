import { defineCustomElement } from 'vue'
import AppLayoutCE from './components/AppLayout.ce.vue'

const APP_LAYOUT_TAG = 'app-layout'

/**
 * Registers Vue-based Web Components for client-side hydration
 * Hydrates existing Declarative Shadow DOM created during SSR
 */
export const registerWebComponents = (): void => {
  if (typeof window === 'undefined') return

  const AppLayoutElement = defineCustomElement(AppLayoutCE)

  if (!customElements.get(APP_LAYOUT_TAG)) {
    customElements.define(APP_LAYOUT_TAG, AppLayoutElement)
  }

  requestAnimationFrame(() => {
    document.documentElement.setAttribute('hydrated', '')
  })
}
