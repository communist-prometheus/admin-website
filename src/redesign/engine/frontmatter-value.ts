/**
 * Where a frontmatter field's value starts and ends, and how to read it back.
 *
 * A frontmatter value is not always one line. It can be a block scalar
 * (`key: |-` / `key: >-` plus indented lines), a quoted scalar that runs over
 * several lines with blank lines inside it, or a plain scalar with indented
 * continuations. Editing a field means replacing exactly that span — the bug
 * this module exists to prevent stopped at the first BLANK line and left the
 * tail of the previous value orphaned under the new one, mixing two languages
 * into one description.
 *
 * Everything here is pure line arithmetic over the frontmatter block, so it
 * stays cheap enough for the editor's hot path and is fully unit-testable.
 */

/** A top-level `key:` line — what ends the previous field's value. */
const KEY_LINE = /^[A-Za-z_][\w.-]*:(\s|$)/;

const isBlockIndicator = (inline: string): '|' | '>' | undefined => {
  const match = inline.match(/^([|>])[+-]?\d*$/);
  return match?.[1] === '|' ? '|' : match?.[1] === '>' ? '>' : undefined;
};

/** The quote a scalar opens with, when it opens with one. */
const openingQuote = (inline: string): '"' | "'" | undefined =>
  inline.startsWith('"') ? '"' : inline.startsWith("'") ? "'" : undefined;

/**
 * Whether a quoted scalar that starts on this text is already closed by it.
 * A double-quoted scalar may contain escaped quotes (`\"`), which do not close.
 */
const closesQuote = (text: string, quote: '"' | "'"): boolean => {
  const body = text.slice(1);
  const unescaped = quote === '"' ? body.replace(/\\./g, '') : body.replace(/''/g, '');
  return unescaped.includes(quote);
};

/** The line index (exclusive) where the value that starts at `at` ends. */
const endOfQuoted = (lines: readonly string[], at: number, quote: '"' | "'", inline: string): number => {
  if (closesQuote(inline, quote)) return at + 1;
  for (let i = at + 1; i < lines.length; i += 1) {
    const line = lines[i] ?? '';
    // A new top-level key means the quote was never closed (a malformed file):
    // stop rather than swallow the rest of the frontmatter.
    if (KEY_LINE.test(line)) return i;
    const unescaped = quote === '"' ? line.replace(/\\./g, '') : line.replace(/''/g, '');
    if (unescaped.includes(quote)) return i + 1;
  }
  return lines.length;
};

/** The line index (exclusive) where an indented block or plain continuation ends. */
const endOfIndented = (lines: readonly string[], at: number): number => {
  let end = at + 1;
  let lastNonBlank = at + 1;
  for (let i = at + 1; i < lines.length; i += 1) {
    const line = lines[i] ?? '';
    if (KEY_LINE.test(line)) break;
    // Blank lines belong to the value only when indented content follows them.
    if (line.trim() !== '') lastNonBlank = i + 1;
    end = i + 1;
  }
  return Math.max(lastNonBlank, at + 1) === at + 1 ? at + 1 : lastNonBlank;
};

/** One field's span inside the frontmatter lines: `[start, end)`. */
export interface FieldSpan {
  readonly start: number;
  readonly end: number;
}

/**
 * The span of `key`'s whole value inside the frontmatter lines, or undefined
 * when the key is absent.
 * @param lines - frontmatter block split into lines (no `---` fences)
 * @param key - frontmatter key to locate
 * @returns the `[start, end)` line span of the key and its value
 */
export const fieldSpan = (lines: readonly string[], key: string): FieldSpan | undefined => {
  const start = lines.findIndex((l) => l.startsWith(`${key}:`));
  if (start < 0) return undefined;
  const inline = (lines[start] ?? '').slice(key.length + 1).trim();
  const quote = openingQuote(inline);
  if (quote !== undefined) return { start, end: endOfQuoted(lines, start, quote, inline) };
  if (isBlockIndicator(inline) !== undefined) return { start, end: endOfIndented(lines, start) };
  if (inline !== '') return { start, end: endOfIndented(lines, start) };
  // A bare `key:` owns nothing but its own line (an empty value).
  return { start, end: start + 1 };
};

/** Strips YAML escapes from a double-quoted scalar's text. */
const unescapeDouble = (text: string): string =>
  text.replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"').replace(/\\\\/g, '\\');

/**
 * Joins a scalar's physical lines the way YAML folds them: a blank line is a
 * paragraph break, everything else joins with a single space.
 */
const fold = (parts: readonly string[]): string =>
  parts
    .reduce<string[]>((acc, part) => {
      const trimmed = part.trim();
      if (trimmed === '') return acc.at(-1) === '' ? acc : [...acc, ''];
      const last = acc.at(-1);
      return last === undefined || last === ''
        ? [...acc, trimmed]
        : [...acc.slice(0, -1), `${last} ${trimmed}`];
    }, [])
    .filter((part) => part !== '')
    .join('\n');

/**
 * Reads the value of `key` from frontmatter lines, whatever YAML shape it uses:
 * inline, single- or multi-line quoted, folded (`>`) or literal (`|`) block.
 * @param lines - frontmatter block split into lines (no `---` fences)
 * @param key - frontmatter key to read
 * @returns the value's text, or undefined when the key is absent
 */
export const readFieldText = (lines: readonly string[], key: string): string | undefined => {
  const span = fieldSpan(lines, key);
  if (span === undefined) return undefined;
  const inline = (lines[span.start] ?? '').slice(key.length + 1).trim();
  const quote = openingQuote(inline);
  if (quote !== undefined) {
    const parts = [inline.slice(1), ...lines.slice(span.start + 1, span.end)];
    const joined = fold(parts).replace(new RegExp(`${quote}\\s*$`), '');
    return quote === '"' ? unescapeDouble(joined).trim() : joined.replace(/''/g, "'").trim();
  }
  const block = isBlockIndicator(inline);
  const continuation = lines.slice(span.start + 1, span.end).map((l) => l.replace(/^\s+/, ''));
  if (block === '|') return continuation.join('\n').replace(/\n+$/, '');
  if (block === '>') return fold(continuation);
  return fold([inline, ...continuation]);
};
