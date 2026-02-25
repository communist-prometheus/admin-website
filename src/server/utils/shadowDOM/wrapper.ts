/**
 * Wraps content with Declarative Shadow DOM template
 * @param tagName - Custom element tag name
 * @param attributes - Tag attributes string
 * @param content - Inner content to wrap
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
    ${content.trim()}
  </template>
</${tagName}>`
