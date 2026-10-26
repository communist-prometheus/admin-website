import { beforeEach, describe, expect, it, vi } from 'vitest';

const readLabelsViaApi = vi.fn();

vi.mock('../engine/settings-io.js', () => ({
  readLabelsViaApi: () => readLabelsViaApi(),
}));
vi.mock('../engine/github-api.js', () => ({ listDeployRuns: async () => [] }));

import './screen-editor.ts';
import type { ScreenEditor } from './screen-editor.ts';

/**
 * The rubrics screen writes settings/labels.json and has been editable for a
 * while. The editor never read it: the rubric picker listed a map compiled
 * into screen-editor.ts, so a rubric created there could not be put on an
 * article — the one place a rubric is for. The reporter saw exactly that: the
 * new rubric stayed in the rubrics section and was absent from the picker.
 *
 * The same hardcoded list carried `theory`, which the registry does NOT have,
 * so choosing it filed two articles under a key the site cannot translate —
 * the public blog shows the raw word `theory` among its localised filters.
 */
const ARTICLE = '---\ntitle: "T"\nlang: ru\ncategory: programme\n---\n\nBody\n';

const REGISTRY = [
  { key: 'programme', translations: { ru: 'RU-Programme', en: 'Programme' } },
  { key: 'history', translations: { ru: 'RU-History', en: 'History' } },
  { key: 'struggle', translations: { ru: 'RU-Struggle', en: 'Struggle' } },
];

interface EditorInternals {
  slug: string;
  collection: string;
  live: boolean;
  activeLang: string;
  availableLangs: readonly string[];
  rubric: string;
  readonly rubricOptions: readonly { value: string; label: string }[];
  applyMarkdown: (markdown: string, path: string, live: boolean) => void;
}

const inner = (el: ScreenEditor): EditorInternals => el as unknown as EditorInternals;

const mount = async (markdown = ARTICLE): Promise<ScreenEditor> => {
  const el: ScreenEditor = document.createElement('screen-editor');
  const priv = inner(el);
  priv.slug = 'x';
  priv.collection = 'blog';
  priv.live = true;
  priv.activeLang = 'ru';
  priv.availableLangs = ['ru'];
  document.body.append(el);
  await el.updateComplete;
  priv.applyMarkdown(markdown, 'blog/x/index.ru.md', true);
  await el.updateComplete;
  // Let the settings read settle.
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
  await el.updateComplete;
  return el;
};

const values = (el: ScreenEditor): readonly string[] =>
  inner(el).rubricOptions.map((o) => o.value);

beforeEach(() => {
  document.body.replaceChildren();
  readLabelsViaApi.mockReset();
  readLabelsViaApi.mockResolvedValue(REGISTRY);
});

describe('the rubrics an article can be filed under', () => {
  it('come from the registry the rubrics screen writes, not a compiled-in map', async () => {
    const el = await mount();
    expect(values(el)).toEqual(['', 'programme', 'history', 'struggle']);
  });

  it('offer a rubric the editor just created', async () => {
    const el = await mount();
    expect(values(el)).toContain('struggle');
  });

  it('never offer a rubric the registry does not define', async () => {
    const el = await mount();
    // `theory` was in the hardcoded list and is absent from the registry;
    // picking it is what put a raw key on the public blog.
    expect(values(el)).not.toContain('theory');
  });

  it('labels the choice the way the registry names it in the editing language', async () => {
    const el = await mount();
    const option = inner(el).rubricOptions.find((o) => o.value === 'history');
    expect(option?.label).toBe('RU-History');
  });

  it("keeps an article's own rubric even when the registry dropped it", async () => {
    const el = await mount('---\ntitle: "T"\nlang: ru\ncategory: theory\n---\n\nBody\n');
    expect(values(el)).toContain('theory');
  });

  it('falls back to the built-in list when the registry cannot be read', async () => {
    readLabelsViaApi.mockRejectedValue(new Error('offline'));
    const el = await mount();
    expect(values(el)).toContain('programme');
  });
});
