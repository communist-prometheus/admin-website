import { escapeXml } from './escape-xml'

const inlineFor = (tag: string): string | undefined =>
  tag === 'strong' || tag === 'b'
    ? 'strong'
    : tag === 'em' || tag === 'i'
      ? 'emphasis'
      : undefined

const renderAnchor = (el: Element, inner: string): string => {
  const href = el.getAttribute('href') ?? ''
  return `<a l:href="${escapeXml(href)}">${inner}</a>`
}

const renderElement = (el: Element): string => {
  const tag = el.tagName.toLowerCase()
  const inner = Array.from(el.childNodes).map(renderInline).join('')
  const fb2Tag = inlineFor(tag)
  return tag === 'br'
    ? '<empty-line/>'
    : fb2Tag !== undefined
      ? `<${fb2Tag}>${inner}</${fb2Tag}>`
      : tag === 'a'
        ? renderAnchor(el, inner)
        : inner
}

/**
 * Render an inline DOM node to its FB2 equivalent. Plain text gets
 * XML-escaped; <strong>/<b> map to <strong>; <em>/<i> map to
 * <emphasis>; <a> maps to <a l:href> (XLink namespace required by
 * FB2). Unknown tags collapse to their text content.
 *
 * @param node DOM node to render.
 * @returns FB2-compatible XML fragment.
 */
export const renderInline = (node: Node): string =>
  node.nodeType === Node.TEXT_NODE
    ? escapeXml(node.textContent ?? '')
    : node.nodeType === Node.ELEMENT_NODE
      ? renderElement(node as Element)
      : ''
