import { beforeEach, describe, expect, it, vi } from 'vitest';

/** The issue index as it was when the editor opened it. */
const LOADED =
  '---\ntitle: "No. 3"\nlang: ru\npublished: true\npublishDate: 2026-11-01\narticles:\n  - a\n---\n';

/** What the repo holds by publish time: the files and articles panels have
 *  since written the cover and a longer table of contents into the same file. */
const IN_REPO =
  '---\ntitle: "No. 3"\nlang: ru\nimage: ./assets/cover.ru.png\npublished: true\npublishDate: 2026-11-01\narticles:\n  - a\n  - b\n---\n';

const publishFileViaApi = vi.fn();
const readContentFile = vi.fn();

vi.mock('../engine/content.js', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('../engine/content.ts');
  return {
    ...actual,
    publishFileViaApi: (path: string, content: string, message: string) =>
      publishFileViaApi(path, content, message),
    readContentFile: (path: string) => readContentFile(path),
    readFileViaApi: async () => LOADED,
    articleLangsViaApi: async () => ['ru'],
    topicOptionsViaApi: async () => [],
    listSlugsViaApi: async () => [],
    listDirViaApi: async () => [],
    listArticlesViaApi: async () => ({ articles: [] }),
  };
});

vi.mock('../engine/github-api.js', () => ({ listDeployRuns: async () => [] }));

import './screen-editor.ts';
import type { ScreenEditor } from './screen-editor.ts';
import { TESTID } from '../testids.ts';

/**
 * Reported 2026-11-08: the lead typed into a journal issue's settings was
 * never saved. The publish button lives in the markdown toolbar, and an issue
 * renders its files/articles panels instead of that toolbar — so an issue had
 * no way to save its title, lead or date at all.
 */

interface EditorInternals {
  collection: string;
  description: string;
  publishError: string;
  load: () => Promise<void>;
  runRealPublish: () => Promise<void>;
}

const openIssue = async (): Promise<{ el: ScreenEditor; priv: EditorInternals }> => {
  // The route, not a field, decides the collection: the editor re-reads it on load.
  globalThis.location.hash = '#/editor/magazine/nomer-3';
  const el: ScreenEditor = document.createElement('screen-editor');
  // Private editor state, reached the same way the sibling screen-editor tests do.
  const priv = el as unknown as EditorInternals;
  await priv.load();
  document.body.append(el);
  await el.updateComplete;
  expect(priv.collection).toBe('magazine');
  return { el, priv };
};

beforeEach(() => {
  document.body.replaceChildren();
  publishFileViaApi.mockReset();
  publishFileViaApi.mockResolvedValue({ ok: true, sha: 'deadbee' });
  readContentFile.mockReset();
  readContentFile.mockResolvedValue({ kind: 'ok', text: IN_REPO });
});

describe('saving a journal issue', () => {
  it('offers the publish action on an issue, not only on an article', async () => {
    const { el } = await openIssue();
    expect(el.shadowRoot?.querySelector(`[data-testid="${TESTID.publish}"]`)).not.toBeNull();
  });

  it('writes the lead into the issue index', async () => {
    const { priv } = await openIssue();
    priv.description = 'Issue three lead.';
    await priv.runRealPublish();
    const [path, content] = publishFileViaApi.mock.calls[0] as [string, string, string];
    expect(path).toBe('magazine/nomer-3/index.ru.md');
    expect(content).toContain('description: |-\n  Issue three lead.');
    expect(priv.publishError).toBe('');
  });

  it('keeps the cover and articles the issue panels wrote after the issue was opened', async () => {
    const { priv } = await openIssue();
    priv.description = 'Lead.';
    await priv.runRealPublish();
    const [, content] = publishFileViaApi.mock.calls[0] as [string, string, string];
    expect(content).toContain('image: ./assets/cover.ru.png');
    expect(content).toContain('articles:\n  - a\n  - b');
  });
});
