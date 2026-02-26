const APP_LAYOUT_TAG = 'app-layout'

/**
 * Native custom element for Declarative Shadow DOM
 * Shadow DOM is created during SSR, this just registers the tag
 * No client-side Shadow DOM manipulation - Vue hydrates inside existing Shadow DOM
 */
class AppLayoutElement extends HTMLElement {
  connectedCallback(): void {
    // Shadow DOM already exists from SSR via Declarative Shadow DOM
    // Vue will hydrate the content inside it
  }
}

/**
 * Registers native custom element for Declarative Shadow DOM
 * SSR creates Shadow DOM, client just validates the tag
 */
export const registerWebComponents = (): void => {
  if (typeof window === 'undefined') return

  if (!customElements.get(APP_LAYOUT_TAG)) {
    customElements.define(APP_LAYOUT_TAG, AppLayoutElement)
  }

  requestAnimationFrame(() => {
    document.documentElement.setAttribute('hydrated', '')
  })
}
