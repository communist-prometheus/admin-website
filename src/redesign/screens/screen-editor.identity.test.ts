import { beforeEach, describe, expect, it } from 'vitest';
import './screen-editor.ts';
import type { ScreenEditor } from './screen-editor.ts';

/**
 * Reported 2026-09-07: an article's title and its address could not be changed
 * in the admin at all. Both are identity: the title is what every listing shows,
 * the address is the page's URL — and an address has to be URL-safe and unique,
 * because two articles sharing one folder means one overwrites the other.
 */
const ARTICLE = '---\ntitle: "Старое название"\nlang: ru\ncategory: programme\npublished: true\n---\n\nBody\n';

interface EditorInternals {
  slug: string;
  collection: string;
  live: boolean;
  activeLang: string;
  availableLangs: readonly string[];
  articleTitle: string;
  slugDraft: string;
  takenSlugs: readonly string[];
  readonly editedMarkdown: string;
  readonly slugError: string;
  onTitleInput: (event: Event) => void;
  onSlugInput: (event: Event) => void;
  applyMarkdown: (markdown: string, path: string, live: boolean) => void;
}

const editor = (): { el: ScreenEditor; priv: EditorInternals } => {
  const el = document.createElement('screen-editor') as ScreenEditor;
  const priv = el as unknown as EditorInternals;
  priv.slug = 'staroe-nazvanie';
  priv.collection = 'blog';
  priv.live = true;
  priv.activeLang = 'ru';
  priv.availableLangs = ['ru'];
  priv.applyMarkdown(ARTICLE, 'blog/staroe-nazvanie/index.ru.md', true);
  priv.takenSlugs = ['staroe-nazvanie', 'cyber-tool'];
  return { el, priv };
};

/** An input event carrying `value`, as the title/address fields emit. */
const typed = (value: string): Event => {
  const input = document.createElement('input');
  input.value = value;
  const event = new CustomEvent('cp-input', { detail: { value } });
  Object.defineProperty(event, 'target', { value: input });
  return event;
};

beforeEach(() => {
  document.body.replaceChildren();
});

describe('editing the article title', () => {
  it('writes the new title into the frontmatter', () => {
    const { priv } = editor();
    priv.onTitleInput(typed('Новое название'));
    expect(priv.articleTitle).toBe('Новое название');
    expect(priv.editedMarkdown).toContain('title: "Новое название"');
    expect(priv.editedMarkdown).not.toContain('Старое название');
  });

  it('quotes a title containing a colon so the file stays valid YAML', () => {
    const { priv } = editor();
    priv.onTitleInput(typed('Маркс: Капитал'));
    expect(priv.editedMarkdown).toContain('title: "Маркс: Капитал"');
  });

  it('escapes quotes inside the title', () => {
    const { priv } = editor();
    priv.onTitleInput(typed('Статья «о "кавычках"»'));
    expect(priv.editedMarkdown).toContain('title: "Статья «о \\"кавычках\\"»"');
  });
});

describe('editing the article address', () => {
  it('normalises what is typed: lowercase, Latin, hyphens for spaces', () => {
    const { priv } = editor();
    priv.onSlugInput(typed('Новый Адрес Статьи'));
    expect(priv.slugDraft).toBe('novyy-adres-stati');
    expect(priv.slugError).toBe('');
  });

  it('reports an address another article already uses', () => {
    const { priv } = editor();
    priv.onSlugInput(typed('cyber-tool'));
    expect(priv.slugError).toMatch(/занят/i);
  });

  it('accepts the article keeping its own address', () => {
    const { priv } = editor();
    priv.onSlugInput(typed('staroe-nazvanie'));
    expect(priv.slugError).toBe('');
  });

  it('reports an empty address', () => {
    const { priv } = editor();
    priv.onSlugInput(typed('!!!'));
    expect(priv.slugDraft).toBe('');
    expect(priv.slugError).toMatch(/адрес/i);
  });
});

describe('the identity fields are on the page', () => {
  it('renders an editable title and address', async () => {
    const { el, priv } = editor();
    document.body.append(el);
    await el.updateComplete;
    const labels = [...(el.shadowRoot?.querySelectorAll('cp-input') ?? [])].map((input) =>
      input.getAttribute('label'),
    );
    expect(labels).toContain('Заголовок');
    expect(labels).toContain('Адрес');
    expect(priv.slugDraft).toBe('staroe-nazvanie');
  });
});
