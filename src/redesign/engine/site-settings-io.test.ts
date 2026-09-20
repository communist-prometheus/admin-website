import { beforeEach, describe, expect, it, vi } from 'vitest';

const readFileViaApi = vi.fn();
const publishFileViaApi = vi.fn();

vi.mock('./content.js', () => ({
  readFileViaApi: (path: string) => readFileViaApi(path),
  publishFileViaApi: (path: string, content: string, message: string) =>
    publishFileViaApi(path, content, message),
}));

import {
  readLanguagesViaApi,
  readLinksViaApi,
  saveLanguagesViaApi,
  saveLinksViaApi,
} from './site-settings-io.ts';

/**
 * The site's languages and its curated links directory could be EDITED only
 * in the client that is no longer served — the rebuilt admin showed the
 * languages read-only and had no links surface at all. Retiring that client
 * would have taken both away, so they move here, onto the same Contents-API
 * pattern the taxonomies already use.
 */

const LANGS = JSON.stringify([
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
]);

const LINKS = JSON.stringify({
  groups: ['organizations', 'resources'],
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

beforeEach(() => {
  readFileViaApi.mockReset();
  publishFileViaApi.mockReset();
  publishFileViaApi.mockResolvedValue({ ok: true, sha: 'abc' });
});

describe('the site languages file', () => {
  it('reads the codes and labels the site publishes in', async () => {
    readFileViaApi.mockResolvedValue(LANGS);
    expect(await readLanguagesViaApi()).toEqual([
      { code: 'en', label: 'English' },
      { code: 'ru', label: 'Русский' },
    ]);
    expect(readFileViaApi).toHaveBeenCalledWith('settings/languages.json');
  });

  it('drops entries that carry no code, rather than rendering blanks', async () => {
    readFileViaApi.mockResolvedValue(JSON.stringify([{ label: 'Orphan' }, { code: 'it', label: 'Italiano' }]));
    expect(await readLanguagesViaApi()).toEqual([{ code: 'it', label: 'Italiano' }]);
  });

  it('says it could not read rather than reporting an empty site', async () => {
    readFileViaApi.mockResolvedValue(undefined);
    await expect(readLanguagesViaApi()).rejects.toThrow('settings/languages.json');
  });

  it('writes the list back as pretty JSON', async () => {
    await saveLanguagesViaApi([{ code: 'en', label: 'English' }]);
    const [path, content] = publishFileViaApi.mock.calls[0] as [string, string];
    expect(path).toBe('settings/languages.json');
    expect(JSON.parse(content)).toEqual([{ code: 'en', label: 'English' }]);
    expect(content, 'a hand-editable file stays readable').toContain('\n');
  });

  it('refuses a list with no languages — the site has to publish in something', async () => {
    const result = await saveLanguagesViaApi([]);
    expect(result.ok).toBe(false);
    expect(publishFileViaApi).not.toHaveBeenCalled();
  });

  it('refuses a duplicated code, which would make one entry unreachable', async () => {
    const result = await saveLanguagesViaApi([
      { code: 'en', label: 'English' },
      { code: 'en', label: 'English (US)' },
    ]);
    expect(result.ok).toBe(false);
    expect(publishFileViaApi).not.toHaveBeenCalled();
  });

  it('refuses a code that is not a language code', async () => {
    const result = await saveLanguagesViaApi([{ code: 'English', label: 'English' }]);
    expect(result.ok).toBe(false);
    expect(publishFileViaApi).not.toHaveBeenCalled();
  });

  it('refuses an entry with no label, which would render as an empty tab', async () => {
    const result = await saveLanguagesViaApi([{ code: 'en', label: '  ' }]);
    expect(result.ok).toBe(false);
    expect(publishFileViaApi).not.toHaveBeenCalled();
  });
});

describe('the curated links directory', () => {
  it('reads its groups and entries', async () => {
    readFileViaApi.mockResolvedValue(LINKS);
    const doc = await readLinksViaApi();
    expect(doc.groups).toEqual(['organizations', 'resources']);
    expect(doc.entries).toHaveLength(1);
    expect(doc.entries[0]).toMatchObject({
      url: 'https://www.leftcom.org',
      name: 'ICT',
      category: 'organizations',
      inRing: true,
    });
  });

  it('treats a missing file as an empty directory, not as a failure', async () => {
    readFileViaApi.mockResolvedValue(undefined);
    expect(await readLinksViaApi()).toEqual({ groups: [], entries: [] });
  });

  it('writes the document back whole', async () => {
    const doc = {
      groups: ['friendly'],
      entries: [
        {
          url: 'https://example.org',
          name: 'Example',
          category: 'friendly',
          inRing: false,
          descriptions: { en: 'An example.' },
        },
      ],
    };
    await saveLinksViaApi(doc);
    const [path, content] = publishFileViaApi.mock.calls[0] as [string, string];
    expect(path).toBe('settings/links.json');
    expect(JSON.parse(content)).toEqual(doc);
  });

  it('refuses an entry with no address', async () => {
    const result = await saveLinksViaApi({
      groups: ['friendly'],
      entries: [{ url: '  ', name: 'Nameless', category: 'friendly', inRing: false, descriptions: {} }],
    });
    expect(result.ok).toBe(false);
    expect(publishFileViaApi).not.toHaveBeenCalled();
  });

  it('refuses an address that is not a URL', async () => {
    const result = await saveLinksViaApi({
      groups: ['friendly'],
      entries: [{ url: 'leftcom', name: 'ICT', category: 'friendly', inRing: false, descriptions: {} }],
    });
    expect(result.ok).toBe(false);
  });

  it('refuses an entry filed under no section at all', async () => {
    const result = await saveLinksViaApi({
      groups: ['friendly'],
      entries: [
        { url: 'https://x.org', name: 'X', category: '  ', inRing: false, descriptions: {} },
      ],
    });
    expect(result.ok).toBe(false);
  });

  /*
   * A repository with no links.json has no sections, so requiring the
   * section to exist first made the very first link unaddable.
   */
  it('lets a new section be introduced by the entry that uses it', async () => {
    const result = await saveLinksViaApi({
      groups: [],
      entries: [
        { url: 'https://x.org', name: 'X', category: 'friendly', inRing: false, descriptions: {} },
      ],
    });
    expect(result.ok).toBe(true);
    const [, content] = publishFileViaApi.mock.calls[0] as [string, string];
    expect(JSON.parse(content).groups).toEqual(['friendly']);
  });

  it('keeps declared sections in order, appending only what is new', async () => {
    await saveLinksViaApi({
      groups: ['organizations', 'resources'],
      entries: [
        { url: 'https://x.org', name: 'X', category: 'friendly', inRing: false, descriptions: {} },
      ],
    });
    const [, content] = publishFileViaApi.mock.calls[0] as [string, string];
    expect(JSON.parse(content).groups).toEqual(['organizations', 'resources', 'friendly']);
  });

  it('refuses the same address twice', async () => {
    const entry = {
      url: 'https://x.org',
      name: 'X',
      category: 'friendly',
      inRing: false,
      descriptions: {},
    };
    const result = await saveLinksViaApi({ groups: ['friendly'], entries: [entry, entry] });
    expect(result.ok).toBe(false);
  });
});
