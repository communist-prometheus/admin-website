import { describe, expect, it } from 'vitest';
import { parseFrontmatterStrict } from '@/sw/handlers/shared/frontmatter';
import {
  missingStrings,
  renderStringsFile,
  stringKeys,
  stringsOf,
  withString,
} from './site-strings.ts';

const MENU_RU = '---\ntitle: Навигация\nhome: Главная\nblog: Блог\nlang: ru\n---\n';
const MENU_EN = '---\ntitle: Navigation\nhome: Home\nblog: Blog\nmenu: Menu\nlang: en\n---\n';

describe('the site interface strings of one language file', () => {
  it('are its frontmatter texts, without the file title and language', () => {
    expect(stringsOf(MENU_RU)).toEqual({ home: 'Главная', blog: 'Блог' });
  });

  it('are empty for a language that has no file yet', () => {
    expect(stringsOf(undefined)).toEqual({});
  });
});

describe('the keys an interface table shows', () => {
  it('follow the default language file and add what only other languages carry', () => {
    const byLang = { en: stringsOf(MENU_EN), ru: stringsOf(MENU_RU), uk: { extra: 'x' } };
    expect(stringKeys(byLang, ['en', 'ru', 'uk'])).toEqual(['home', 'blog', 'menu', 'extra']);
  });
});

describe('what a language is missing', () => {
  it('lists every key it has no text for, per language, in key order', () => {
    const byLang = { en: stringsOf(MENU_EN), ru: stringsOf(MENU_RU), de: {} };
    expect(missingStrings(byLang, ['en', 'ru', 'de'])).toEqual([
      { lang: 'ru', keys: ['menu'] },
      { lang: 'de', keys: ['home', 'blog', 'menu'] },
    ]);
  });
});

describe('editing one text', () => {
  it('sets the text for the language and key without touching the rest', () => {
    const byLang = { ru: { home: 'Главная' }, en: { home: 'Home' } };
    expect(withString(byLang, 'ru', 'blog', 'Блог')).toEqual({
      ru: { home: 'Главная', blog: 'Блог' },
      en: { home: 'Home' },
    });
  });

  it('drops an emptied text, so the site falls back instead of rendering a blank', () => {
    expect(withString({ ru: { home: 'Главная' } }, 'ru', 'home', '  ')).toEqual({ ru: {} });
  });
});

describe('writing a language file back', () => {
  it('keeps the file title and states its language', () => {
    const text = renderStringsFile(MENU_RU, 'ru', { home: 'Домой', blog: 'Блог' }, 'Navigation');
    expect(parseFrontmatterStrict(text)).toEqual({
      title: 'Навигация',
      home: 'Домой',
      blog: 'Блог',
      lang: 'ru',
    });
  });

  it('creates a new language file with the fallback title', () => {
    const text = renderStringsFile(undefined, 'de', { home: 'Startseite' }, 'Navigation');
    expect(parseFrontmatterStrict(text)).toEqual({ title: 'Navigation', home: 'Startseite', lang: 'de' });
  });

  it('quotes a text YAML would otherwise misread', () => {
    const text = renderStringsFile(undefined, 'ru', { backToList: '← К списку: все' }, 'Labels');
    expect(parseFrontmatterStrict(text)['backToList']).toBe('← К списку: все');
  });

  it('reproduces an unchanged file byte for byte, so saving it commits nothing', () => {
    expect(renderStringsFile(MENU_RU, 'ru', stringsOf(MENU_RU), 'Navigation')).toBe(MENU_RU);
  });
});
