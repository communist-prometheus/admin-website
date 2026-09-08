import { describe, it, expect, beforeEach } from 'vitest';

/**
 * QA #4: edits made in the "Properties" sheet (topic / date / published) were
 * silently discarded on publish because `editedMarkdown` re-emitted the raw
 * parsed frontmatter verbatim. These tests pin the write-back: the composed
 * markdown must carry the edited category/pubDate/published, and a loaded
 * article must seed `topic` from its `category` (so the required-field check
 * does not fire a false "topic is empty").
 *
 * The element is driven WITHOUT connecting it to the document so LitElement
 * never renders — the assertions observe the compose logic itself. Accessing
 * the private editor state via a cast mirrors the sibling screen-editor.lang
 * test; it is the only way to drive the internals headlessly.
 */
import './screen-editor.ts';
import type { ScreenEditor } from './screen-editor.ts';

const ARTICLE =
  '---\ntitle: "T"\ncategory: programme\npubDate: 2026-04-30\npublished: true\n---\n\nBody\n';

/** An article whose description is a folded (`>-`) multi-line block scalar. */
const ARTICLE_BLOCK_DESC =
  '---\ntitle: "T"\ndescription: >-\n  First sentence of the summary.\n  Second sentence.\ncategory: programme\npubDate: 2026-04-30\npublished: true\nlang: ru\n---\n\nBody\n';

interface EditorInternals {
  slug: string;
  live: boolean;
  activeLang: string;
  materialTopics: readonly string[];
  langTopics: readonly string[];
  rubric: string;
  description: string;
  pubDate: string;
  published: boolean;
  dirty: boolean;
  onLeadInput: (event: Event) => void;
  readonly editedMarkdown: string;
  applyMarkdown: (markdown: string, path: string, live: boolean) => void;
}

const editorFrom = (markdown: string, lang = 'en'): EditorInternals => {
  const el = document.createElement('screen-editor') as ScreenEditor;
  const priv = el as unknown as EditorInternals;
  priv.slug = 'x';
  priv.live = true;
  priv.activeLang = lang;
  priv.applyMarkdown(markdown, `blog/x/index.${lang}.md`, true);
  return priv;
};

const seededEditor = (): EditorInternals => editorFrom(ARTICLE);

describe('screen-editor properties write-back (QA #4)', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('seeds the rubric from the article category on load', () => {
    const el = seededEditor();
    expect(el.rubric).toBe('programme');
  });

  it('writes an edited rubric back as the article category', () => {
    const el = seededEditor();
    el.rubric = 'history';
    expect(el.editedMarkdown).toContain('category: history');
    expect(el.editedMarkdown).not.toContain('category: programme');
  });

  /*
   * The topic field is the OPTIONAL editorial marker (`topic`, keyed by
   * settings/topics.json), not the required `category`. Writing the topic
   * list's values into `category` is what emptied the select for every real
   * article (whose category is programme/history/international/…) and made the
   * editor believe a required field was missing.
   */
  it('keeps topics and category apart: a chosen topic never overwrites the category', () => {
    const el = seededEditor();
    el.materialTopics = ['translation'];
    const out = el.editedMarkdown;
    expect(out).toContain('topics:\n  - translation');
    expect(out).toContain('category: programme');
  });

  it('leaves missing topics empty and publishes without them', () => {
    const el = editorFrom('---\ntitle: "T"\ncategory: programme\nlang: en\n---\n\nBody\n');
    expect(el.materialTopics).toEqual([]);
    expect(el.langTopics).toEqual([]);
    expect(el.editedMarkdown).not.toContain('topics:');
  });

  it('seeds existing topics instead of inventing one from the category', () => {
    const el = editorFrom(
      '---\ntitle: "T"\ncategory: programme\ntopic: editorial\nlang: en\n---\n\nBody\n',
    );
    // The single-key form older content carries counts as a material topic.
    expect(el.materialTopics).toEqual(['editorial']);
    expect(el.rubric).toBe('programme');
  });

  /*
   * The strongest guard against the admin corrupting content: opening an
   * article and publishing it with no edits must be a no-op. The incident file
   * gained a `pubDate` of the publishing day next to its existing
   * `publishDate`, and lost part of its description, from exactly this path.
   */
  it('re-emits an untouched article byte-identically', () => {
    const original =
      '---\ntitle: "T"\nlang: ru\nmagazine: magazine-2\ncategory: programme\npublished: true\npublishDate: 2026-06-28\ndescription: >-\n  A lead.\n  Second line.\n---\n\nBody text.\n';
    const el = editorFrom(original, 'ru');
    expect(el.editedMarkdown).toBe(original);
  });

  it('writes an edited pubDate back into the published frontmatter', () => {
    const el = seededEditor();
    el.pubDate = '2026-09-09';
    expect(el.editedMarkdown).toContain('pubDate: 2026-09-09');
  });

  it('seeds pubDate from a `publishDate` article (magazine-era field)', () => {
    const el = editorFrom(
      '---\ntitle: "T"\npublishDate: 2026-07-06\npublished: true\nlang: it\n---\n\nBody\n',
      'it',
    );
    expect(el.pubDate).toBe('2026-07-06');
  });

  it('is not dirty right after loading (save note stays hidden)', () => {
    // Regression: the save note was hardcoded on, so every opened article read
    // as having "unsaved changes".
    const el = seededEditor();
    expect(el.dirty).toBe(false);
  });

  it('becomes dirty once the lead (description) is edited', () => {
    const el = seededEditor();
    const textarea = document.createElement('textarea');
    textarea.value = 'edited';
    const event = new Event('input');
    Object.defineProperty(event, 'target', { value: textarea });
    el.onLeadInput(event);
    expect(el.description).toBe('edited');
    expect(el.dirty).toBe(true);
  });

  it('writes an edited description back as a literal block scalar', () => {
    const el = seededEditor();
    el.description = 'a new summary';
    expect(el.editedMarkdown).toContain('description: |-\n  a new summary');
  });

  it('leaves an untouched folded-block description byte-identical (no orphaning)', () => {
    const el = editorFrom(ARTICLE_BLOCK_DESC, 'ru');
    // The full folded text is seeded (not just the ">-" indicator)…
    expect(el.description).toBe('First sentence of the summary. Second sentence.');
    // …and, unedited, the frontmatter block survives verbatim on compose.
    expect(el.editedMarkdown).toContain(
      'description: >-\n  First sentence of the summary.\n  Second sentence.',
    );
  });

  it('replaces a folded-block description without orphaning its old lines', () => {
    const el = editorFrom(ARTICLE_BLOCK_DESC, 'ru');
    el.description = 'brand new';
    const out = el.editedMarkdown;
    expect(out).toContain('description: |-\n  brand new');
    expect(out).not.toContain('First sentence of the summary');
  });

  it('writes the published flag back into the published frontmatter', () => {
    const el = seededEditor();
    el.published = false;
    expect(el.editedMarkdown).toContain('published: false');
    expect(el.editedMarkdown).not.toContain('published: true');
  });

  it('keeps the body intact when re-emitting frontmatter', () => {
    const el = seededEditor();
    el.rubric = 'history';
    expect(el.editedMarkdown).toContain('Body');
  });
});
