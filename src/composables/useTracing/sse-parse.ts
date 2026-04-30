/** Single SSE record extracted from the wire format. */
export type SseRecord = {
  readonly id: string | undefined
  readonly event: string | undefined
  readonly data: string
}

const isComment = (line: string): boolean => line.startsWith(':')

const parseLine = (
  acc: { id?: string; event?: string; data: string[] },
  line: string
): typeof acc => {
  const sep = line.indexOf(':')
  const field = sep === -1 ? line : line.slice(0, sep)
  const value = sep === -1 ? '' : line.slice(sep + 1).replace(/^ /, '')
  return field === 'id'
    ? { ...acc, id: value }
    : field === 'event'
      ? { ...acc, event: value }
      : field === 'data'
        ? { ...acc, data: [...acc.data, value] }
        : acc
}

const recordFromLines = (lines: ReadonlyArray<string>): SseRecord => {
  const acc = lines
    .filter(line => line !== '' && !isComment(line))
    .reduce<{ id?: string; event?: string; data: string[] }>(parseLine, {
      data: [],
    })
  return { id: acc.id, event: acc.event, data: acc.data.join('\n') }
}

/**
 * Incrementally parse a chunk of SSE wire text against a leftover
 * buffer. Returns any complete records found and the new leftover
 * for the next chunk. A complete record ends at a blank line.
 * @param leftover Carried-over text from the previous chunk.
 * @param chunk Newly received text.
 * @returns Records emitted on this step and the next leftover.
 */
export const parseChunk = (
  leftover: string,
  chunk: string
): {
  readonly records: ReadonlyArray<SseRecord>
  readonly leftover: string
} => {
  const text = leftover + chunk
  const blocks = text.split(/\r\n\r\n|\n\n/)
  const tail = blocks[blocks.length - 1] ?? ''
  const complete = blocks.slice(0, -1)
  const records = complete
    .map(block => block.split(/\r\n|\n/))
    .map(recordFromLines)
    .filter(r => r.data !== '' || r.event !== undefined)
  return { records, leftover: tail }
}
