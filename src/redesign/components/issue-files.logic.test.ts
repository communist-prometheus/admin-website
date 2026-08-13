import { describe, it, expect } from 'vitest';
import { iconFor, fileLang, classifyUpload, plannedAssetPaths } from './issue-files.ts';

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

describe('issue-files upload classification (the ONLY accepted inputs)', () => {
  it('accepts only pdf and docx, case-insensitively', () => {
    expect(classifyUpload('nomer-2.PDF')).toBe('pdf');
    expect(classifyUpload('Газета.docx')).toBe('docx');
  });

  it('rejects every other type — including the old free-for-all uploads', () => {
    expect(classifyUpload('cover.png')).toBe('reject');
    expect(classifyUpload('nomer.fb2')).toBe('reject');
    expect(classifyUpload('notes.txt')).toBe('reject');
    expect(classifyUpload('noext')).toBe('reject');
  });
});

describe('issue-files planned asset paths', () => {
  const dir = 'magazine/nomer-2/assets';

  it('docx writes exactly one derived fb2 (the docx itself is never stored)', () => {
    expect(plannedAssetPaths(dir, 'nomer-2', 'ru', 'docx')).toEqual([
      'magazine/nomer-2/assets/nomer-2.ru.fb2',
    ]);
  });

  it('pdf writes the pdf then the derived cover, in that order', () => {
    expect(plannedAssetPaths(dir, 'nomer-2', 'it', 'pdf')).toEqual([
      'magazine/nomer-2/assets/nomer-2.it.pdf',
      'magazine/nomer-2/assets/cover.it.png',
    ]);
  });

  it('a rejected upload plans no writes', () => {
    expect(plannedAssetPaths(dir, 'nomer-2', 'ru', 'reject')).toEqual([]);
  });
});
