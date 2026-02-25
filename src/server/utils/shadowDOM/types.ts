/**
 * Configuration for a Web Component with Declarative Shadow DOM
 */
export interface ShadowDOMConfig {
  readonly tag: string
  readonly styles: string
}

/**
 * Represents a matched custom element tag in HTML
 */
export interface TagMatch {
  readonly index: number
  readonly content: string
  readonly attributes: string
}
