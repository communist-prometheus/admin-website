import type { Section } from './split-sections'

/**
 * Render a single Section to its `<section>...</section>` FB2 form.
 *
 * @param s Section produced by splitIntoSections.
 * @returns FB2 fragment (one section).
 */
export const renderSection = (s: Section): string => {
  const title = s.title ? `    <title><p>${s.title}</p></title>\n` : ''
  const body = s.body
    .filter(b => b !== '')
    .map(b => `    ${b}`)
    .join('\n')
  return `  <section>\n${title}${body}\n  </section>`
}

/**
 * Render an array of sections joined by newlines, with a fallback
 * stub section so the FB2 body never ends up empty.
 *
 * @param sections Output of splitIntoSections.
 * @param fallbackTitle Title to use for the stub section when input
 *   was empty.
 * @returns Concatenated FB2 sections.
 */
export const renderSections = (
  sections: readonly Section[],
  fallbackTitle: string
): string => {
  const list =
    sections.length === 0 ? [{ title: fallbackTitle, body: [] }] : sections
  return list.map(renderSection).join('\n')
}
