/**
 * Wraps content with Declarative Shadow DOM template
 * Styles go in Shadow DOM, content stays in light DOM via slot
 * @param tagName - Custom element tag name
 * @param attributes - Tag attributes string
 * @param content - Inner content to place in light DOM
 * @param styles - CSS styles for shadow DOM
 * @returns HTML string with Declarative Shadow DOM structure
 */
export const wrapWithShadowDOM = (
  tagName: string,
  attributes: string,
  content: string,
  styles: string
): string => `<${tagName}${attributes}>
  <template shadowrootmode="open">
    <style>${styles}</style>
    <slot></slot>
  </template>
  ${content.trim()}
</${tagName}>`
