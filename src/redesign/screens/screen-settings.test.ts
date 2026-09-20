import { beforeEach, describe, expect, it, vi } from 'vitest';

const readLanguagesViaApi = vi.fn();
const saveLanguagesViaApi = vi.fn();
const readLinksViaApi = vi.fn();
const saveLinksViaApi = vi.fn();

vi.mock('../engine/site-settings-io.js', () => ({
  readLanguagesViaApi: () => readLanguagesViaApi(),
  saveLanguagesViaApi: (e: unknown) => saveLanguagesViaApi(e),
  readLinksViaApi: () => readLinksViaApi(),
  saveLinksViaApi: (d: unknown) => saveLinksViaApi(d),
}));

import './screen-settings.ts';
import type { ScreenSettings } from './screen-settings.ts';

/**
 * The site's languages could only be READ here — the screen said as much in
 * a banner — and the curated links directory had no surface at all. Both
 * were editable in the client that is no longer served, so both move here
 * before that client is retired.
 */

interface SettingsInternals {
  langDraft: { code: string; label: string }[];
  linkGroups: string[];
  linkDraft: {
    url: string;
    name: string;
    category: string;
    inRing: boolean;
    descriptions: Record<string, string>;
  }[];
  langError: string;
  linkError: string;
  saveLanguages: () => Promise<void>;
  saveLinks: () => Promise<void>;
  addLanguage: () => void;
  addLink: () => void;
}

const inner = (el: ScreenSettings): SettingsInternals =>
  el as unknown as SettingsInternals;

const mount = async (): Promise<ScreenSettings> => {
  const el: ScreenSettings = document.createElement('screen-settings');
  document.body.append(el);
  await el.updateComplete;
  await Promise.resolve();
  await Promise.resolve();
  await el.updateComplete;
  return el;
};

const text = (el: HTMLElement): string =>
  (el.shadowRoot?.textContent ?? '').replace(/\s+/g, ' ').trim();

beforeEach(() => {
  document.body.replaceChildren();
  for (const m of [readLanguagesViaApi, saveLanguagesViaApi, readLinksViaApi, saveLinksViaApi])
    m.mockReset();
  readLanguagesViaApi.mockResolvedValue([
    { code: 'ru', label: 'Русский' },
    { code: 'en', label: 'English' },
  ]);
  readLinksViaApi.mockResolvedValue({
    groups: ['organizations'],
    entries: [
      {
        url: 'https://www.leftcom.org',
        name: 'ICT',
        category: 'organizations',
        inRing: true,
        descriptions: { en: 'Internationalist communist organisation.' },
      },
    ],
  });
  saveLanguagesViaApi.mockResolvedValue({ ok: true });
  saveLinksViaApi.mockResolvedValue({ ok: true });
});

describe('the site languages', () => {
  it('are editable, not merely listed', async () => {
    const el = await mount();
    expect(text(el)).not.toContain('Просмотр без редактирования');
    expect(el.shadowRoot?.querySelectorAll('.lang-row')).toHaveLength(2);
  });

  it('writes the edited list back', async () => {
    const el = await mount();
    const priv = inner(el);
    priv.langDraft = [{ code: 'ru', label: 'Русский' }];
    await priv.saveLanguages();
    expect(saveLanguagesViaApi).toHaveBeenCalledWith([{ code: 'ru', label: 'Русский' }]);
  });

  it('adds a blank row to fill in', async () => {
    const el = await mount();
    const priv = inner(el);
    const before = priv.langDraft.length;
    priv.addLanguage();
    await el.updateComplete;
    expect(inner(el).langDraft).toHaveLength(before + 1);
  });

  it('surfaces a refusal instead of claiming it saved', async () => {
    saveLanguagesViaApi.mockResolvedValue({ ok: false, error: 'Язык «en» указан дважды.' });
    const el = await mount();
    await inner(el).saveLanguages();
    await el.updateComplete;
    expect(text(el)).toContain('указан дважды');
  });

  it('surfaces why it could not read, rather than showing an empty site', async () => {
    readLanguagesViaApi.mockRejectedValue(
      new Error('Не удалось прочитать settings/languages.json.'),
    );
    const el = await mount();
    expect(text(el)).toContain('settings/languages.json');
    expect(el.shadowRoot?.querySelectorAll('.lang-row')).toHaveLength(0);
  });
});

describe('the curated links directory', () => {
  it('lists what the repository carries', async () => {
    const el = await mount();
    const rows = el.shadowRoot?.querySelectorAll('.link-row') ?? [];
    expect(rows).toHaveLength(1);
    // The name rides in a cp-input's value, not in the row's text.
    const names = [...(rows[0]?.querySelectorAll('cp-input') ?? [])].map((i) =>
      Reflect.get(i, 'value'),
    );
    expect(names).toContain('ICT');
  });

  it('writes the edited directory back whole', async () => {
    const el = await mount();
    const priv = inner(el);
    priv.linkDraft = [
      {
        url: 'https://example.org',
        name: 'Example',
        category: 'organizations',
        inRing: false,
        descriptions: {},
      },
    ];
    await priv.saveLinks();
    const [doc] = saveLinksViaApi.mock.calls[0] as [{ groups: string[]; entries: unknown[] }];
    expect(doc.groups).toEqual(['organizations']);
    expect(doc.entries).toHaveLength(1);
  });

  it('adds a blank entry to fill in', async () => {
    const el = await mount();
    const priv = inner(el);
    priv.addLink();
    await el.updateComplete;
    expect(inner(el).linkDraft.length).toBeGreaterThan(1);
  });

  it('surfaces a refusal from the engine', async () => {
    saveLinksViaApi.mockResolvedValue({ ok: false, error: 'не адрес' });
    const el = await mount();
    await inner(el).saveLinks();
    await el.updateComplete;
    expect(text(el)).toContain('не адрес');
  });
});
