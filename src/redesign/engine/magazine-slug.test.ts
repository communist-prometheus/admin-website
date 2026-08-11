import { describe, it, expect } from 'vitest';
import { validateMagazineSlug } from './content.ts';

describe('validateMagazineSlug (QA #17)', () => {
  const existing = ['nomer-1-2026', 'nomer-2-2026'];

  it('accepts a well-formed, unique slug', () => {
    expect(validateMagazineSlug('nomer-3-2026', existing)).toBeUndefined();
  });

  it('accepts a single-segment slug', () => {
    expect(validateMagazineSlug('spring', [])).toBeUndefined();
  });

  it('trims surrounding whitespace before validating', () => {
    expect(validateMagazineSlug('  nomer-3-2026  ', existing)).toBeUndefined();
  });

  it('rejects an empty slug', () => {
    expect(validateMagazineSlug('', existing)).toBe('Укажите слаг номера.');
    expect(validateMagazineSlug('   ', existing)).toBe('Укажите слаг номера.');
  });

  it('rejects uppercase letters', () => {
    expect(validateMagazineSlug('Nomer-3', existing)).toMatch(/только строчные/);
  });

  it('rejects spaces and path separators', () => {
    expect(validateMagazineSlug('nomer 3', existing)).toMatch(/только строчные/);
    expect(validateMagazineSlug('nomer/3', existing)).toMatch(/только строчные/);
    expect(validateMagazineSlug('../etc', existing)).toMatch(/только строчные/);
  });

  it('rejects leading, trailing and doubled hyphens', () => {
    expect(validateMagazineSlug('-nomer', existing)).toMatch(/только строчные/);
    expect(validateMagazineSlug('nomer-', existing)).toMatch(/только строчные/);
    expect(validateMagazineSlug('nomer--3', existing)).toMatch(/только строчные/);
  });

  it('rejects a duplicate slug (trimmed)', () => {
    expect(validateMagazineSlug('nomer-1-2026', existing)).toBe(
      'Номер со слагом «nomer-1-2026» уже существует.',
    );
    expect(validateMagazineSlug('  nomer-2-2026 ', existing)).toMatch(/уже существует/);
  });
});
