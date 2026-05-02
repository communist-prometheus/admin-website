import { renderBlock } from './render-block'
import { renderInline } from './render-inline'

/** A single FB2 <section>: title plus body paragraphs. */
export interface Section {
  readonly title: string
  readonly body: readonly string[]
}

interface SplitState {
  readonly sections: readonly Section[]
  readonly current: Section
}

const headingTitle = (node: Element): string =>
  Array.from(node.childNodes).map(renderInline).join('').trim()

const isHeading = (el: Element): boolean => {
  const tag = el.tagName.toLowerCase()
  return tag === 'h1' || tag === 'h2'
}

const hasContent = (s: Section): boolean =>
  s.title !== '' || s.body.length > 0

const onHeading = (state: SplitState, node: Element): SplitState => ({
  sections: hasContent(state.current)
    ? [...state.sections, state.current]
    : state.sections,
  current: { title: headingTitle(node), body: [] },
})

const onBlock = (state: SplitState, node: Element): SplitState => {
  const block = renderBlock(node)
  return {
    sections: state.sections,
    current: {
      title: state.current.title,
      body:
        block === '' ? state.current.body : [...state.current.body, block],
    },
  }
}

const advance = (state: SplitState, node: Element): SplitState =>
  isHeading(node) ? onHeading(state, node) : onBlock(state, node)

/**
 * Walk the root element's children and group them into FB2
 * sections. Every <h1>/<h2> starts a new section; everything else
 * goes into the current section's body.
 *
 * @param root Element whose children carry the converted markup.
 * @returns Sections in document order; an empty array when the
 *   document had nothing renderable.
 */
export const splitIntoSections = (root: Element): readonly Section[] => {
  const final = Array.from(root.children).reduce<SplitState>(advance, {
    sections: [],
    current: { title: '', body: [] },
  })
  return hasContent(final.current)
    ? [...final.sections, final.current]
    : final.sections
}
