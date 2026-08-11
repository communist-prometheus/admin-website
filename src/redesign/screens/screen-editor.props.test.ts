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

interface EditorInternals {
  slug: string;
  live: boolean;
  activeLang: string;
  topic: string;
  pubDate: string;
  published: boolean;
  readonly editedMarkdown: string;
  readonly incomplete: boolean;
  applyMarkdown: (markdown: string, path: string, live: boolean) => void;
}

const seededEditor = (): EditorInternals => {
  const el = document.createElement('screen-editor') as ScreenEditor;
  const priv = el as unknown as EditorInternals;
  priv.slug = 'x';
  priv.live = true;
  priv.activeLang = 'en';
  priv.applyMarkdown(ARTICLE, 'blog/x/index.en.md', true);
  return priv;
};

describe('screen-editor properties write-back (QA #4)', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('seeds topic from the article category on load (no false incomplete)', () => {
    const el = seededEditor();
    expect(el.topic).toBe('programme');
    expect(el.incomplete).toBe(false);
  });

  it('writes an edited category back into the published frontmatter', () => {
    const el = seededEditor();
    el.topic = 'history';
    expect(el.editedMarkdown).toContain('category: history');
    expect(el.editedMarkdown).not.toContain('category: programme');
  });

  it('writes an edited pubDate back into the published frontmatter', () => {
    const el = seededEditor();
    el.pubDate = '2026-09-09';
    expect(el.editedMarkdown).toContain('pubDate: 2026-09-09');
  });

  it('writes the published flag back into the published frontmatter', () => {
    const el = seededEditor();
    el.published = false;
    expect(el.editedMarkdown).toContain('published: false');
    expect(el.editedMarkdown).not.toContain('published: true');
  });

  it('keeps the body intact when re-emitting frontmatter', () => {
    const el = seededEditor();
    el.topic = 'history';
    expect(el.editedMarkdown).toContain('Body');
  });
});
