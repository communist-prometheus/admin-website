import { beforeEach, describe, expect, it, vi } from 'vitest';

const importArticleFile = vi.fn();

vi.mock('../engine/import-article.js', () => ({
  importArticleFile: (file: File, collection: string, slug: string) =>
    importArticleFile(file, collection, slug),
}));
vi.mock('../engine/github-api.js', () => ({ listDeployRuns: async () => [] }));

import './screen-editor.ts';
import type { ScreenEditor } from './screen-editor.ts';

/**
 * The legacy client had "Import from Docs" in the editor toolbar: pick a
 * .docx / .html / .md, get it converted to markdown at the caret with its
 * images lifted into the material's asset folder. The rebuilt editor shipped
 * without it, so the same articles had to be pasted in by hand.
 */

const ARTICLE = '---\ntitle: "A"\nlang: ru\ncategory: programme\n---\n\nСтарый текст\n';

interface EditorInternals {
  slug: string;
  collection: string;
  live: boolean;
  activeLang: string;
  availableLangs: readonly string[];
  body: string;
  importBusy: boolean;
  importError: string;
  importNote: string;
  applyMarkdown: (markdown: string, path: string, live: boolean) => void;
  onImportPick: (event: Event) => Promise<void>;
}

const inner = (el: ScreenEditor): EditorInternals => el as unknown as EditorInternals;

const editor = (): { el: ScreenEditor; priv: EditorInternals } => {
  const el: ScreenEditor = document.createElement('screen-editor');
  const priv = inner(el);
  priv.slug = 'my-post';
  priv.collection = 'blog';
  priv.live = true;
  priv.activeLang = 'ru';
  priv.availableLangs = ['ru'];
  priv.applyMarkdown(ARTICLE, 'blog/my-post/index.ru.md', true);
  return { el, priv };
};

/** A change event from a file input carrying one picked file. */
const picked = (name: string): Event => {
  const input = document.createElement('input');
  const file = new File(['x'], name);
  Object.defineProperty(input, 'files', { value: [file], configurable: true });
  const event = new Event('change');
  Object.defineProperty(event, 'target', { value: input });
  return event;
};

beforeEach(() => {
  document.body.replaceChildren();
  importArticleFile.mockReset();
  importArticleFile.mockResolvedValue({ ok: true, markdown: '## Импортировано\n', uploaded: 0 });
});

describe('importing a document into the open material', () => {
  it('offers the import in the editor, accepting what the old one accepted', async () => {
    const { el } = editor();
    document.body.append(el);
    await el.updateComplete;
    const input = el.shadowRoot?.querySelector<HTMLInputElement>('input[type="file"].import');
    expect(input).not.toBeNull();
    for (const ext of ['.docx', '.html', '.htm', '.md']) {
      expect(input?.accept).toContain(ext);
    }
  });

  it('converts the picked file against the material it is open on', async () => {
    const { priv } = editor();
    await priv.onImportPick(picked('article.docx'));
    const [file, collection, slug] = importArticleFile.mock.calls[0] as [File, string, string];
    expect(file.name).toBe('article.docx');
    expect(collection).toBe('blog');
    expect(slug).toBe('my-post');
  });

  it('adds the converted markdown to the article rather than replacing it', async () => {
    const { priv } = editor();
    await priv.onImportPick(picked('article.docx'));
    expect(priv.body).toContain('Старый текст');
    expect(priv.body).toContain('## Импортировано');
  });

  it('says how many images came across with the text', async () => {
    importArticleFile.mockResolvedValue({ ok: true, markdown: 'x', uploaded: 3 });
    const { priv } = editor();
    await priv.onImportPick(picked('article.docx'));
    expect(priv.importNote).toContain('3');
  });

  it('surfaces a refusal instead of silently importing nothing', async () => {
    importArticleFile.mockResolvedValue({ ok: false, error: 'Unsupported file type.' });
    const { priv } = editor();
    await priv.onImportPick(picked('article.pages'));
    expect(priv.importError).toBe('Unsupported file type.');
    expect(priv.body).not.toContain('Импортировано');
  });

  it('clears the busy flag even when the import fails', async () => {
    importArticleFile.mockRejectedValue(new Error('boom'));
    const { priv } = editor();
    await priv.onImportPick(picked('article.docx'));
    expect(priv.importBusy).toBe(false);
    expect(priv.importError).toContain('boom');
  });

  it('ignores a picker that was dismissed without choosing anything', async () => {
    const { priv } = editor();
    const input = document.createElement('input');
    Object.defineProperty(input, 'files', { value: [], configurable: true });
    const event = new Event('change');
    Object.defineProperty(event, 'target', { value: input });
    await priv.onImportPick(event);
    expect(importArticleFile).not.toHaveBeenCalled();
  });
});
