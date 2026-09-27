import { beforeEach, describe, expect, it, vi } from 'vitest';

const readLanguagesViaApi = vi.fn();

vi.mock('../engine/site-settings-io.js', () => ({
  readLanguagesViaApi: () => readLanguagesViaApi(),
}));
vi.mock('../engine/github-api.js', () => ({ listDeployRuns: async () => [] }));

import './screen-editor.ts';
import type { ScreenEditor } from './screen-editor.ts';

/**
 * The settings screen writes the site's language list, and has been editable
 * and tested for a while. The editor never read it: the add-a-language dialog
 * offered a hardcoded map of seven codes, so a language added in settings
 * could not be used to create a translation — the one place the list is for.
 * Adding German was a no-op until this.
 *
 * The editor takes the configured list, and keeps its own labels only as
 * display names for codes the list does not name.
 */
const ARTICLE = '---\ntitle: "T"\nlang: ru\ncategory: programme\n---\n\nBody\n';

interface EditorInternals {
  slug: string;
  collection: string;
  live: boolean;
  activeLang: string;
  availableLangs: readonly string[];
  readonly addableLangs: readonly string[];
  applyMarkdown: (markdown: string, path: string, live: boolean) => void;
}

const inner = (el: ScreenEditor): EditorInternals => el as unknown as EditorInternals;

const mount = async (available: readonly string[]): Promise<ScreenEditor> => {
  const el: ScreenEditor = document.createElement('screen-editor');
  const priv = inner(el);
  priv.slug = 'x';
  priv.collection = 'blog';
  priv.live = true;
  priv.activeLang = 'ru';
  priv.availableLangs = available;
  document.body.append(el);
  await el.updateComplete;
  priv.applyMarkdown(ARTICLE, 'blog/x/index.ru.md', true);
  await el.updateComplete;
  // Let the language read settle.
  await Promise.resolve();
  await Promise.resolve();
  await el.updateComplete;
  return el;
};

beforeEach(() => {
  document.body.replaceChildren();
  readLanguagesViaApi.mockReset();
  readLanguagesViaApi.mockResolvedValue([
    { code: 'ru', label: 'Russian' },
    { code: 'en', label: 'English' },
    { code: 'de', label: 'Deutsch' },
  ]);
});

describe('the languages a translation can be created in', () => {
  it('comes from the configured list, not a map compiled into the screen', async () => {
    const el = await mount(['ru']);
    expect(inner(el).addableLangs).toEqual(['en', 'de']);
  });

  it('offers a language the editor added in settings', async () => {
    const el = await mount(['ru', 'en']);
    expect(inner(el).addableLangs).toContain('de');
  });

  it('never offers a language the material already has', async () => {
    const el = await mount(['ru', 'en', 'de']);
    expect(inner(el).addableLangs).toEqual([]);
  });

  it('labels the choice the way the settings screen named it', async () => {
    const el = await mount(['ru']);
    await el.updateComplete;
    const options: { value: string; label: string }[] =
      Reflect.get(
        el.shadowRoot?.querySelector('[data-testid="add-lang-dialog"] cp-select') ?? {},
        'options',
      ) ?? [];
    expect(options.find((o) => o.value === 'de')?.label).toBe('Deutsch');
  });

  it('still edits a material whose language the list no longer names', async () => {
    const el = await mount(['ru', 'it']);
    const tabs: { id: string; label: string }[] =
      Reflect.get(el.shadowRoot?.querySelector('cp-tabs') ?? {}, 'tabs') ?? [];
    expect(tabs.map((t) => t.id)).toEqual(['ru', 'it']);
    expect(tabs.find((t) => t.id === 'it')?.label).toBe('Italiano');
  });

  it('falls back to the built-in list when the settings file cannot be read', async () => {
    readLanguagesViaApi.mockRejectedValue(new Error('offline'));
    const el = await mount(['ru']);
    expect(inner(el).addableLangs).toContain('en');
    expect(inner(el).addableLangs).not.toContain('de');
  });
});
