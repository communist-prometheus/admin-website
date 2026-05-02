import { renderInline } from './render-inline'

const collectListItems = (el: Element): string[] =>
  Array.from(el.children)
    .filter(c => c.tagName.toLowerCase() === 'li')
    .map(li => Array.from(li.childNodes).map(renderInline).join(''))

const renderList = (el: Element): string =>
  collectListItems(el)
    .map(item => `<p>• ${item}</p>`)
    .join('\n')

const renderParagraph = (el: Element): string => {
  const inner = Array.from(el.childNodes).map(renderInline).join('').trim()
  return inner === '' ? '' : `<p>${inner}</p>`
}

/**
 * Render a block-level DOM element to its FB2 equivalent. <p> stays
 * as <p>; <ul>/<ol> flatten to bulleted paragraphs (FB2 has no
 * native list construct in baseline); <br> at block level becomes
 * <empty-line/>; everything else is dropped.
 *
 * @param el Block-level DOM element.
 * @returns FB2-compatible XML fragment, or empty string when nothing
 *   meaningful comes out (mammoth often emits blank paragraphs).
 */
export const renderBlock = (el: Element): string => {
  const tag = el.tagName.toLowerCase()
  return tag === 'p'
    ? renderParagraph(el)
    : tag === 'ul' || tag === 'ol'
      ? renderList(el)
      : tag === 'br'
        ? '<empty-line/>'
        : ''
}
