import { describe, it, expect } from 'vitest';
import {
  iconFor,
  fileLang,
  classifyUpload,
  plannedAssetPaths,
  classifyIssueAssets,
} from './issue-files.ts';

const file = (name: string, size = 100): { name: string; path: string; size: number; sha: string } => ({
  name,
  path: `magazine/nomer-2/assets/${name}`,
  size,
  sha: name,
});

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

describe('issue-files typed asset slots (structured, not a flat dump)', () => {
  const slug = 'nomer-2';
  const full = [
    file('nomer-2.ru.pdf'),
    file('nomer-2.ru.fb2'),
    file('cover.ru.png'),
    file('cover.png'),
    file('nomer-2.en.pdf'),
    file('cover.en.png'),
    file('Magazine1 (3).pdf'), // stray leftover
  ];

  it('sorts the flat directory into the open language\'s typed slots', () => {
    const a = classifyIssueAssets(full, slug, 'ru');
    expect(a.pdf?.name).toBe('nomer-2.ru.pdf');
    expect(a.fb2?.name).toBe('nomer-2.ru.fb2');
    expect(a.cover?.name).toBe('cover.ru.png');
    expect(a.coverShared).toBe(false);
  });

  it('falls back to the shared cover.png when a language has none', () => {
    const a = classifyIssueAssets([file('cover.png'), file('nomer-2.es.fb2')], slug, 'es');
    expect(a.cover?.name).toBe('cover.png');
    expect(a.coverShared).toBe(true);
    expect(a.pdf).toBeUndefined();
    expect(a.fb2?.name).toBe('nomer-2.es.fb2');
  });

  it('reports empty slots when the language has no assets yet', () => {
    const a = classifyIssueAssets([file('cover.en.png')], slug, 'ru');
    expect(a.pdf).toBeUndefined();
    expect(a.fb2).toBeUndefined();
    expect(a.cover).toBeUndefined();
  });

  it('lists only genuinely stray files for cleanup (typed assets of any lang are not stray)', () => {
    const names = classifyIssueAssets(full, slug, 'ru').other.map((f) => f.name);
    expect(names).toEqual(['Magazine1 (3).pdf']);
  });
});
