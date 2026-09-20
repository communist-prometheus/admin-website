import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const publishFileViaApi = vi.fn();

vi.mock('../engine/content.js', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('../engine/content.ts');
  return {
    ...actual,
    publishFileViaApi: (path: string, content: string, message: string) =>
      publishFileViaApi(path, content, message),
    readFileViaApi: async () => undefined,
    articleLangsViaApi: async () => [],
    topicOptionsViaApi: async () => [],
    listSlugsViaApi: async () => [],
  };
});

vi.mock('../engine/github-api.js', () => ({ listDeployRuns: async () => [] }));

import { validateContentFile } from '@/validation/content-gate';
import './screen-editor.ts';
import type { ScreenEditor } from './screen-editor.ts';

/**
 * Reported 2026-09-20: "Создать материал" opened a blank document that could
 * never be published — the dialog answered "сохранение в новый файл пока в
 * разработке". The flow was shipped as a stub and no test ever opened it, so
 * nothing went red: every editor test starts from an article that already has
 * a file. A new material has no file yet; publishing one has to create
 * `<collection>/<slug>/index.<lang>.md`, and the address is what names it.
 */

interface EditorInternals {
  slug: string;
  collection: string;
  live: boolean;
  activeLang: string;
  availableLangs: readonly string[];
  slugDraft: string;
  takenSlugs: readonly string[];
  rubric: string;
  pubDate: string;
  articlePath: string;
  articleTitle: string;
  publishError: string;
  publishNote: string;
  publishOpen: boolean;
  dirty: boolean;
  readonly editedMarkdown: string;
  readonly isNewMaterial: boolean;
  startNewArticle: () => void;
  startPublish: () => void;
  runRealPublish: () => Promise<void>;
}

const inner = (el: ScreenEditor): EditorInternals => el as unknown as EditorInternals;

/** A blank document exactly as the "Создать материал" route seeds it. */
const blank = (): { el: ScreenEditor; priv: EditorInternals } => {
  const el: ScreenEditor = document.createElement('screen-editor');
  const priv = inner(el);
  priv.collection = 'blog';
  priv.startNewArticle();
  priv.takenSlugs = ['cyber-tool', 'programme-outline'];
  return { el, priv };
};

beforeEach(() => {
  document.body.replaceChildren();
  publishFileViaApi.mockReset();
  publishFileViaApi.mockResolvedValue({ ok: true, sha: 'deadbee' });
  globalThis.location.hash = '#/editor/new';
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe('a material that has no file yet', () => {
  it('is recognised as new rather than as an article with an empty path', () => {
    const { priv } = blank();
    expect(priv.articlePath).toBe('');
    expect(priv.isNewMaterial).toBe(true);
  });

  it('refuses to publish without an address, and says so', async () => {
    const { priv } = blank();
    priv.slugDraft = '';
    priv.startPublish();
    await Promise.resolve();
    expect(publishFileViaApi).not.toHaveBeenCalled();
    expect(priv.publishError).toContain('Адрес');
  });

  it('refuses an address that another material already occupies', async () => {
    const { priv } = blank();
    priv.slugDraft = 'cyber-tool';
    priv.startPublish();
    await Promise.resolve();
    expect(publishFileViaApi).not.toHaveBeenCalled();
    expect(priv.publishError).not.toBe('');
  });

  it('names the missing rubric itself, rather than letting the gate answer', async () => {
    const { priv } = blank();
    priv.slugDraft = 'novyj-material';
    priv.rubric = '';
    priv.startPublish();
    await Promise.resolve();
    expect(publishFileViaApi).not.toHaveBeenCalled();
    expect(priv.publishError).toContain('рубрику');
  });

  it('never claims the flow is unfinished', async () => {
    const { priv } = blank();
    priv.slugDraft = 'novyj-material';
    priv.rubric = 'programme';
    priv.startPublish();
    await Promise.resolve();
    await Promise.resolve();
    expect(priv.publishError).not.toContain('разработке');
  });
});

describe('publishing a new material', () => {
  it('creates the file the address names, in the language being written', async () => {
    const { priv } = blank();
    priv.slugDraft = 'novyj-material';
    priv.rubric = 'programme';
    priv.activeLang = 'ru';
    await priv.runRealPublish();
    const [path, content] = publishFileViaApi.mock.calls[0] as [string, string, string];
    expect(path).toBe('blog/novyj-material/index.ru.md');
    expect(content).toContain('lang: ru');
  });

  it('adopts the address so the next publish edits the file it just created', async () => {
    const { priv } = blank();
    priv.slugDraft = 'novyj-material';
    await priv.runRealPublish();
    expect(priv.slug).toBe('novyj-material');
    expect(priv.articlePath).toBe('blog/novyj-material/index.ru.md');
    expect(priv.dirty).toBe(false);
  });

  it('takes the editor to the material it just created', async () => {
    const { priv } = blank();
    priv.slugDraft = 'novyj-material';
    await priv.runRealPublish();
    expect(globalThis.location.hash).toBe('#/editor/novyj-material');
  });

  it('marks the new address as taken, so a second material cannot reuse it', async () => {
    const { priv } = blank();
    priv.slugDraft = 'novyj-material';
    await priv.runRealPublish();
    expect(priv.takenSlugs).toContain('novyj-material');
  });

  it('keeps the document new when the write fails', async () => {
    publishFileViaApi.mockResolvedValue({ ok: false, error: 'отказано' });
    const { priv } = blank();
    priv.slugDraft = 'novyj-material';
    await priv.runRealPublish();
    expect(priv.articlePath).toBe('');
    expect(priv.publishError).toBe('отказано');
  });

  it('writes a non-blog collection under its own folder', async () => {
    const { priv } = blank();
    priv.collection = 'pages';
    priv.slugDraft = 'o-nas';
    await priv.runRealPublish();
    const [path] = publishFileViaApi.mock.calls[0] as [string];
    expect(path).toBe('pages/o-nas/index.ru.md');
    expect(globalThis.location.hash).toBe('#/editor/pages/o-nas');
  });
});

describe('the address field of a new material', () => {
  it('offers no "перенести материал" — there is nothing to move yet', async () => {
    const { el, priv } = blank();
    priv.slugDraft = 'novyj-material';
    document.body.append(el);
    await el.updateComplete;
    const text = (el.shadowRoot?.textContent ?? '').replace(/\s+/g, ' ');
    expect(text).not.toContain('Перенести материал');
  });
});

/*
 * The same gate that guards an edit guards a creation, so the seeded document
 * has to be able to satisfy it once the editor has filled in the fields the
 * screen actually offers. A seed that cannot — a bare `category:` resolving to
 * null is the shape that broke the public build once — makes "Создать материал"
 * a dead end no matter how good the publish path is.
 */
describe('what the seed produces has to pass the content gate', () => {
  const PATH = 'blog/novyj-material/index.ru.md';

  it('is refused while it is still blank, naming the field', () => {
    const { priv } = blank();
    const problem = validateContentFile(PATH, priv.editedMarkdown);
    expect(problem).toBeDefined();
  });

  it('passes once the editor has filled in title and rubric', () => {
    const { priv } = blank();
    priv.articleTitle = 'Новый материал';
    priv.rubric = 'programme';
    expect(validateContentFile(PATH, priv.editedMarkdown)).toBeUndefined();
  });

  it('never seeds a key with no value', () => {
    const { priv } = blank();
    for (const line of priv.editedMarkdown.split('\n')) {
      expect(line).not.toMatch(/^[a-zA-Z]+:\s*$/);
    }
  });
});

/*
 * Publishing an article nobody edited used to write it back byte-identical.
 * GitHub records that as an EMPTY commit — zero files changed — and the
 * content sync then rebuilds the public site for nothing. Opening a material
 * to read it must cost the repository nothing.
 */
describe('publishing a material nobody changed', () => {
  const ARTICLE =
    '---\ntitle: "A"\nlang: ru\ncategory: programme\npublished: true\n---\n\nBody\n';

  const opened = (): EditorInternals => {
    const el: ScreenEditor = document.createElement('screen-editor');
    const priv = inner(el);
    priv.collection = 'blog';
    priv.slug = 'a';
    priv.activeLang = 'ru';
    priv.availableLangs = ['ru'];
    priv.applyMarkdown(ARTICLE, 'blog/a/index.ru.md', true);
    priv.slugDraft = 'a';
    return priv;
  };

  it('writes nothing when the document is byte-identical to the file', async () => {
    const priv = opened();
    await priv.runRealPublish();
    expect(publishFileViaApi).not.toHaveBeenCalled();
  });

  it('says so rather than reporting a publish that never happened', async () => {
    const priv = opened();
    await priv.runRealPublish();
    expect(priv.publishError).toBe('');
    expect(priv.publishNote).toContain('без изменений');
  });

  it('publishes as soon as something actually differs', async () => {
    const priv = opened();
    priv.articleTitle = 'B';
    await priv.runRealPublish();
    expect(publishFileViaApi).toHaveBeenCalledTimes(1);
  });

  it('always writes a material that has no file yet', async () => {
    const { priv } = blank();
    priv.slugDraft = 'novyj-material';
    priv.rubric = 'programme';
    await priv.runRealPublish();
    expect(publishFileViaApi).toHaveBeenCalledTimes(1);
  });
});

/*
 * Lit's `@query` yields null, not undefined, until the element has rendered,
 * so `!== undefined` guards let a null through. In the real app that threw
 * "Cannot read properties of null (reading 'style')" on every update of a
 * document with no lead field — a flood of page errors behind a UI that
 * looked fine.
 */
describe('the editor updating before its parts have rendered', () => {
  it('does not throw when nothing is on screen yet', async () => {
    const el: ScreenEditor = document.createElement('screen-editor');
    document.body.append(el);
    await el.updateComplete;
    expect(() => el.requestUpdate()).not.toThrow();
    await expect(el.updateComplete).resolves.toBeTruthy();
  });

  it('survives a repeated update of a freshly seeded material', async () => {
    const { el, priv } = blank();
    document.body.append(el);
    await el.updateComplete;
    priv.articleTitle = 'Заголовок';
    el.requestUpdate();
    await el.updateComplete;
    el.requestUpdate();
    await expect(el.updateComplete).resolves.toBeTruthy();
  });
});
