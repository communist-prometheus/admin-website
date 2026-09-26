import { beforeEach, describe, expect, it, vi } from 'vitest';

const readLanguagesViaApi = vi.fn();
const saveLanguagesViaApi = vi.fn();
const readLinksViaApi = vi.fn();
const saveLinksViaApi = vi.fn();
const readFeaturesViaApi = vi.fn();
const saveFeaturesViaApi = vi.fn();
const listEntries = vi.fn();
const clearEntries = vi.fn();
const runHardReset = vi.fn();

vi.mock('../engine/features-io.js', () => ({
  readFeaturesViaApi: () => readFeaturesViaApi(),
  saveFeaturesViaApi: (f: unknown) => saveFeaturesViaApi(f),
}));
vi.mock('@/features/action-history/db', () => ({
  listEntries: () => listEntries(),
  clearEntries: () => clearEntries(),
}));
vi.mock('@/composables/useHardReset/hard-reset', () => ({
  runHardReset: (cb: unknown) => runHardReset(cb),
}));

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
  features: { webring: boolean };
  saveFeatures: () => Promise<void>;
  clearHistory: () => Promise<void>;
  openReset: () => void;
  confirmReset: () => Promise<void>;
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
  for (const m of [readFeaturesViaApi, saveFeaturesViaApi, listEntries, clearEntries, runHardReset])
    m.mockReset();
  readFeaturesViaApi.mockResolvedValue({ webring: false });
  saveFeaturesViaApi.mockResolvedValue({ ok: true });
  listEntries.mockResolvedValue([]);
  clearEntries.mockResolvedValue(undefined);
  runHardReset.mockResolvedValue(undefined);
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

/*
 * Three more surfaces that existed only in the client no longer served:
 * the site's feature flags, the local action history, and the hard reset
 * that clears everything this browser cached.
 */
describe('the site feature flags', () => {
  it('shows what the repository has enabled', async () => {
    readFeaturesViaApi.mockResolvedValue({ webring: true });
    const el = await mount();
    const box = el.shadowRoot?.querySelector<HTMLInputElement>('.feature-webring input');
    expect(box?.checked).toBe(true);
  });

  it('writes a toggled flag back', async () => {
    const el = await mount();
    const priv = inner(el);
    priv.features = { webring: true };
    await priv.saveFeatures();
    expect(saveFeaturesViaApi).toHaveBeenCalledWith({ webring: true });
  });

  it('surfaces a refusal instead of claiming it saved', async () => {
    saveFeaturesViaApi.mockResolvedValue({ ok: false, error: 'нет прав' });
    const el = await mount();
    await inner(el).saveFeatures();
    await el.updateComplete;
    expect(text(el)).toContain('нет прав');
  });
});

describe('the local action history', () => {
  it('lists what this browser recorded', async () => {
    listEntries.mockResolvedValue([
      { id: '1', ts: 1, kind: 'navigation', from: '/a', to: '/editor' },
      { id: '2', ts: 2, kind: 'auth', action: 'login' },
    ]);
    const el = await mount();
    expect(el.shadowRoot?.querySelectorAll('.history-row')).toHaveLength(2);
  });

  it('says so when nothing has been recorded yet', async () => {
    listEntries.mockResolvedValue([]);
    const el = await mount();
    expect(text(el)).toContain('Записей пока нет');
  });

  it('clears the history on request', async () => {
    const el = await mount();
    await inner(el).clearHistory();
    expect(clearEntries).toHaveBeenCalledTimes(1);
  });
});

describe('the hard reset', () => {
  it('does nothing until it is confirmed', async () => {
    const el = await mount();
    inner(el).openReset();
    await el.updateComplete;
    expect(runHardReset).not.toHaveBeenCalled();
  });

  it('runs once confirmed, reporting each step', async () => {
    const el = await mount();
    await inner(el).confirmReset();
    expect(runHardReset).toHaveBeenCalledTimes(1);
  });

  it('surfaces a failure rather than leaving a stuck progress bar', async () => {
    runHardReset.mockRejectedValue(new Error('SW не ответил'));
    const el = await mount();
    await inner(el).confirmReset();
    await el.updateComplete;
    expect(text(el)).toContain('SW не ответил');
  });
});
