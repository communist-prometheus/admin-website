import { describe, expect, it } from 'vitest';
import { slugify, slugProblem } from './slug.ts';

/*
 * A slug is the article's address: `blog/<slug>/index.<lang>.md` becomes
 * comprom.org/<lang>/blog/<slug>/. It has to be typeable into a URL — Latin
 * letters, digits and hyphens — and it has to be unique, because two articles
 * sharing one slug means one silently overwrites the other's folder.
 */
describe('slugify', () => {
  it('lowercases and joins words with hyphens', () => {
    expect(slugify('The Illusion Of Socialism')).toBe('the-illusion-of-socialism');
  });

  it('transliterates Cyrillic instead of dropping it', () => {
    expect(slugify('Иллюзия социализма')).toBe('illyuziya-socializma');
    expect(slugify('Ёлка и щука')).toBe('yolka-i-schuka');
  });

  it('collapses separators and trims them from the ends', () => {
    expect(slugify('  a   b -- c  ')).toBe('a-b-c');
    expect(slugify('---edge---')).toBe('edge');
  });

  it('drops punctuation a URL should not carry', () => {
    expect(slugify('Маркс: «Капитал», т. III')).toBe('marks-kapital-t-iii');
    expect(slugify('a/b?c=d#e')).toBe('a-b-c-d-e');
  });

  it('keeps digits and an already-valid slug untouched', () => {
    expect(slugify('magazine-2-avgust-2026')).toBe('magazine-2-avgust-2026');
  });

  it('returns an empty string when there is nothing left to keep', () => {
    expect(slugify('   ')).toBe('');
    expect(slugify('!!!')).toBe('');
  });
});

describe('slugProblem', () => {
  const taken = ['programme-outline', 'cyber-tool'];

  it('accepts a fresh, well-formed slug', () => {
    expect(slugProblem('new-article', taken)).toBeUndefined();
  });

  it('rejects an empty slug', () => {
    expect(slugProblem('', taken)).toMatch(/адрес/i);
  });

  it('rejects characters that cannot go in a URL', () => {
    expect(slugProblem('Иллюзия', taken)).toMatch(/латин/i);
    expect(slugProblem('two words', taken)).toMatch(/латин/i);
    expect(slugProblem('UPPER', taken)).toMatch(/латин/i);
  });

  it('rejects a slug that another article already uses', () => {
    expect(slugProblem('cyber-tool', taken)).toMatch(/занят|существует/i);
  });

  it('lets an article keep its own slug', () => {
    expect(slugProblem('cyber-tool', taken, 'cyber-tool')).toBeUndefined();
  });
});
