const ENTITIES: Readonly<Record<string, string>> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
}

const stripCdata = (raw: string): string => {
  const m = /^<!\[CDATA\[([\s\S]*?)\]\]>$/.exec(raw.trim())
  return m?.[1] ?? raw
}

const decodeEntity = (name: string): string =>
  ENTITIES[name] ??
  (name.startsWith('#x')
    ? String.fromCharCode(Number.parseInt(name.slice(2), 16))
    : name.startsWith('#')
      ? String.fromCharCode(Number.parseInt(name.slice(1), 10))
      : `&${name};`)

/**
 * Decode the textual content of an XML element: strip CDATA wrappers,
 * expand the common entities, trim surrounding whitespace.
 * @param raw Raw inner-text of an XML element.
 * @returns Decoded plain text.
 */
export const decodeXmlText = (raw: string): string =>
  stripCdata(raw)
    .replace(/&([a-zA-Z]+|#\d+|#x[0-9a-fA-F]+);/g, (_, name: string) =>
      decodeEntity(name)
    )
    .trim()
