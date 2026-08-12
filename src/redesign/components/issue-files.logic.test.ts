import { describe, it, expect } from 'vitest';
import { iconFor, fileLang } from './issue-files.ts';

describe('issue-files type icons', () => {
  it('maps extensions to pictograms', () => {
    expect(iconFor('cover.ru.png')).toBe('image');
    expect(iconFor('shot.JPEG')).toBe('image');
    expect(iconFor('nomer-1.ru.fb2')).toBe('book');
    expect(iconFor('book.epub')).toBe('book');
    expect(iconFor('nomer-1.ru.pdf')).toBe('file-text');
    expect(iconFor('notes.txt')).toBe('file-generic');
  });
});

describe('issue-files language detection', () => {
  const langs = new Set(['en', 'es', 'it', 'ru', 'uk']);

  it('reads a known-language suffix', () => {
    expect(fileLang('cover.ru.png', langs)).toBe('ru');
    expect(fileLang('magazine-1-mai-2026.en.fb2', langs)).toBe('en');
  });

  it('treats a no-suffix / unknown-token file as shared (undefined)', () => {
    expect(fileLang('cover.png', langs)).toBeUndefined(); // no lang segment
    expect(fileLang('Magazine1 (3).pdf', langs)).toBeUndefined();
    expect(fileLang('cover.xx.png', langs)).toBeUndefined(); // xx not a known lang
  });
});
