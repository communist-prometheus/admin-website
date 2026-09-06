import { describe, expect, it } from 'vitest';
import { parse as parseYaml } from 'yaml';
import {
  readFrontmatterField,
  upsertFrontmatterBlock,
  upsertFrontmatterField,
} from './content.ts';

/*
 * The 2026-09-06 incident on `illuziya-socializma-i-realnost-kapitala-v-sssr`:
 * the editor added an English translation of an article whose `description`
 * was a multi-line DOUBLE-QUOTED scalar with blank lines inside it (the shape
 * every magazine-era article carries). Two helpers mishandled it:
 *
 *   - the read took only the first physical line, so the editor showed a
 *     truncated lead (719 of 1797 characters);
 *   - the write removed only the indented lines that immediately followed the
 *     key and stopped at the first BLANK line, so the tail of the Russian
 *     description stayed behind under the new English one.
 *
 * The published `index.en.md` therefore carried an English lead followed by a
 * stray Russian paragraph and a literal `\n"`.
 */
const QUOTED_MULTILINE = [
  '---',
  'title: Illusion of socialism',
  'lang: ru',
  'magazine: magazine-2-avgust-2026',
  'category: programme',
  'published: true',
  'publishDate: 2026-06-28',
  'description: "First paragraph of the Russian lead.',
  '',
  '',
  '  Second paragraph, after a blank line.',
  '',
  '  \\n"',
  '---',
  '',
  'Body text.',
  '',
].join('\n');

const fence = (markdown: string): string =>
  markdown.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';

const field = (markdown: string, key: string): unknown => {
  const parsed: unknown = parseYaml(fence(markdown));
  return typeof parsed === 'object' && parsed !== null ? Reflect.get(parsed, key) : undefined;
};

describe('frontmatter helpers vs a multi-line quoted description', () => {
  it('reads the whole quoted scalar, not just its first line', () => {
    const lead = readFrontmatterField(QUOTED_MULTILINE, 'description') ?? '';
    expect(lead).toContain('First paragraph');
    expect(lead).toContain('Second paragraph');
    expect(lead).not.toContain('"');
  });

  it('replaces the whole previous value, leaving no orphaned tail', () => {
    const next = upsertFrontmatterBlock(QUOTED_MULTILINE, 'description', 'A new English lead.');
    expect(field(next, 'description')).toBe('A new English lead.');
    expect(next).not.toContain('Second paragraph');
    expect(next).not.toContain('\\n"');
    // Neighbouring keys and the body survive untouched.
    expect(field(next, 'category')).toBe('programme');
    expect(field(next, 'publishDate')).toBeDefined();
    expect(next).toContain('Body text.');
  });

  it('produces a valid, single-language file for the add-translation flow', () => {
    // The add-translation dialog seeds the new language from the open one …
    const seed = upsertFrontmatterField(
      upsertFrontmatterField(QUOTED_MULTILINE, 'lang', 'en'),
      'published',
      'false',
    );
    // … then the translator retypes the lead and publishes.
    const published = upsertFrontmatterBlock(seed, 'description', 'The English lead.');
    expect(() => parseYaml(fence(published))).not.toThrow();
    expect(field(published, 'lang')).toBe('en');
    expect(field(published, 'description')).toBe('The English lead.');
    expect(published).not.toMatch(/Second paragraph|\\n"/);
  });

  it('still handles the simple shapes it always did', () => {
    const inline = '---\ntitle: T\ndescription: One line.\nlang: ru\n---\n\nB\n';
    expect(readFrontmatterField(inline, 'description')).toBe('One line.');
    const folded = '---\ntitle: T\ndescription: >-\n  A.\n  B.\nlang: ru\n---\n\nB\n';
    expect(readFrontmatterField(folded, 'description')).toBe('A. B.');
    const literal = '---\ntitle: T\ndescription: |-\n  A.\n  B.\nlang: ru\n---\n\nB\n';
    expect(readFrontmatterField(literal, 'description')).toBe('A.\nB.');
    expect(readFrontmatterField(inline, 'missing')).toBeUndefined();
  });
});
