import { beforeEach, describe, expect, it } from 'vitest';
import './screen-editor.ts';
import type { ScreenEditor } from './screen-editor.ts';

/**
 * A material's properties are not all of one kind. The address, the rubric and
 * the date describe the MATERIAL and are the same in every language; the title,
 * the lead and the published flag describe ONE TRANSLATION. Topics exist at both
 * levels and add up: a material can be marked "editorial" while its English
 * translation is additionally marked "our translation".
 */
const RU =
  '---\ntitle: "RU"\nlang: ru\ncategory: programme\ntopics:\n  - editorial\nlanguageTopics:\n  - translation\npublished: true\n---\n\nRU body\n';

interface EditorInternals {
  slug: string;
  collection: string;
  live: boolean;
  activeLang: string;
  availableLangs: readonly string[];
  materialTopics: readonly string[];
  langTopics: readonly string[];
  rubric: string;
  readonly editedMarkdown: string;
  toggleMaterialTopic: (key: string) => void;
  toggleLangTopic: (key: string) => void;
  applyMarkdown: (markdown: string, path: string, live: boolean) => void;
}

const editor = (markdown = RU): { el: ScreenEditor; priv: EditorInternals } => {
  const el = document.createElement('screen-editor') as ScreenEditor;
  const priv = el as unknown as EditorInternals;
  priv.slug = 'x';
  priv.collection = 'blog';
  priv.live = true;
  priv.activeLang = 'ru';
  priv.availableLangs = ['ru', 'en'];
  priv.applyMarkdown(markdown, 'blog/x/index.ru.md', true);
  return { el, priv };
};

beforeEach(() => {
  document.body.replaceChildren();
});

describe('topics at two levels', () => {
  it('seeds both levels from the file', () => {
    const { priv } = editor();
    expect(priv.materialTopics).toEqual(['editorial']);
    expect(priv.langTopics).toEqual(['translation']);
  });

  it('writes a material topic as `topics`', () => {
    const { priv } = editor();
    priv.toggleMaterialTopic('primer');
    expect(priv.editedMarkdown).toContain('topics:\n  - editorial\n  - primer');
  });

  it('writes a translation topic as `languageTopics`, leaving the material list alone', () => {
    const { priv } = editor();
    priv.toggleLangTopic('primer');
    const out = priv.editedMarkdown;
    expect(out).toContain('languageTopics:\n  - translation\n  - primer');
    expect(out).toContain('topics:\n  - editorial');
  });

  it('unticks a topic', () => {
    const { priv } = editor();
    priv.toggleMaterialTopic('editorial');
    expect(priv.editedMarkdown).toContain('topics: []');
  });

  it('starts empty for an article with no topics and adds nothing on publish', () => {
    const { priv } = editor('---\ntitle: "T"\nlang: ru\ncategory: programme\n---\n\nB\n');
    expect(priv.materialTopics).toEqual([]);
    expect(priv.langTopics).toEqual([]);
    expect(priv.editedMarkdown).not.toContain('topics:');
  });
});

describe('the properties panel separates the two levels', () => {
  const text = (el: ScreenEditor): string =>
    (el.shadowRoot?.textContent ?? '').replace(/\s+/g, ' ').trim();

  it('groups material properties apart from translation properties', async () => {
    const { el } = editor();
    document.body.append(el);
    await el.updateComplete;
    expect(text(el)).toContain('Свойства материала');
    expect(text(el)).toContain('Свойства перевода');
  });

  it('puts the rubric and the address with the material', async () => {
    const { el } = editor();
    document.body.append(el);
    await el.updateComplete;
    const material = el.shadowRoot?.querySelector('.props-material');
    expect(material?.querySelector('cp-select[label="Рубрика"]')).not.toBeNull();
    expect(material?.querySelector('cp-input[label="Адрес"]')).not.toBeNull();
    // The date is the translation's: one goes out when it is ready, which is
    // rarely the day the original did.
    expect(material?.querySelector('cp-date-input')).toBeNull();
  });

  it('puts the published switch with the translation, named for the language', async () => {
    const { el } = editor();
    document.body.append(el);
    await el.updateComplete;
    const translation = el.shadowRoot?.querySelector('.props-translation');
    expect(translation?.querySelector('cp-switch')).not.toBeNull();
    expect(el.shadowRoot?.querySelector('.props-material cp-switch')).toBeNull();
  });

  /*
   * Reading order follows what the fields describe: the material comes before
   * the language tabs, because it is what the tabs are variants OF; the
   * translation's own properties come after them, next to the text they belong
   * to.
   */
  it('puts the material above the language tabs and the translation below', async () => {
    const { el } = editor();
    document.body.append(el);
    await el.updateComplete;
    const root = el.shadowRoot;
    const material = root?.querySelector('.props-material');
    const tabs = root?.querySelector('.tabs-scroll');
    const translation = root?.querySelector('.props-translation');
    expect(material).not.toBeNull();
    expect(tabs).not.toBeNull();
    expect(translation).not.toBeNull();
    // DOCUMENT_POSITION_FOLLOWING === 4: the argument comes after the node.
    expect(material?.compareDocumentPosition(tabs!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(tabs?.compareDocumentPosition(translation!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('offers topic pickers on both levels', async () => {
    const { el } = editor();
    document.body.append(el);
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('.props-material .topic-picker')).not.toBeNull();
    expect(el.shadowRoot?.querySelector('.props-translation .topic-picker')).not.toBeNull();
  });
});
