import { beforeEach, describe, expect, it, vi } from 'vitest';

const readContentFile = vi.fn();
const publishFileViaApi = vi.fn();

vi.mock('./content.js', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('./content.ts');
  return {
    ...actual,
    readContentFile: (path: string) => readContentFile(path),
    publishFileViaApi: (path: string, content: string, message: string) =>
      publishFileViaApi(path, content, message),
  };
});

import { issueCoverImage, syncIssueCoverViaApi } from './issue-cover.ts';

/**
 * Reported 2026-11-08: issue №3's cover was uploaded through the issue's files
 * panel and showed there, yet the public site rendered the issue without one.
 * The site takes the cover ONLY from the index's `image:` field, and the panel
 * committed `cover.<lang>.png` without ever pointing `image:` at it.
 */
const INDEX =
  '---\ntitle: "№3"\nlang: ru\npublished: true\npublishDate: 2026-11-01\narticles:\n  - a\n  - b\n---\n';

const file = (name: string): { readonly name: string } => ({ name });

beforeEach(() => {
  readContentFile.mockReset();
  publishFileViaApi.mockReset();
  publishFileViaApi.mockResolvedValue({ ok: true, sha: 'c0ffee' });
});

describe('issueCoverImage — which file the index should point at', () => {
  it('prefers the per-language cover', () => {
    expect(issueCoverImage([file('cover.png'), file('cover.ru.png')], 'ru')).toBe('./assets/cover.ru.png');
  });

  it('falls back to the shared cover when the language has none', () => {
    expect(issueCoverImage([file('cover.png'), file('cover.en.png')], 'ru')).toBe('./assets/cover.png');
  });

  it('is undefined when the issue has no cover at all', () => {
    expect(issueCoverImage([file('nomer-3.ru.pdf')], 'ru')).toBeUndefined();
  });
});

describe('syncIssueCoverViaApi — keeps the index `image:` in step with the files', () => {
  it('points a cover-less index at the uploaded cover', async () => {
    readContentFile.mockResolvedValue({ kind: 'ok', text: INDEX });
    const r = await syncIssueCoverViaApi('nomer-3', 'ru', './assets/cover.ru.png');
    expect(r.ok).toBe(true);
    const [path, content] = publishFileViaApi.mock.calls[0] as [string, string, string];
    expect(path).toBe('magazine/nomer-3/index.ru.md');
    expect(content).toContain('image: ./assets/cover.ru.png');
    // Everything else in the index survives untouched.
    expect(content).toContain('articles:\n  - a\n  - b');
    expect(content).toContain('publishDate: 2026-11-01');
  });

  it('writes nothing when the index already points at that cover', async () => {
    readContentFile.mockResolvedValue({
      kind: 'ok',
      text: INDEX.replace('lang: ru', 'lang: ru\nimage: ./assets/cover.ru.png'),
    });
    const r = await syncIssueCoverViaApi('nomer-3', 'ru', './assets/cover.ru.png');
    expect(r.ok).toBe(true);
    expect(publishFileViaApi).not.toHaveBeenCalled();
  });

  it('drops `image:` once its cover is gone, so the site build cannot break on a missing file', async () => {
    readContentFile.mockResolvedValue({
      kind: 'ok',
      text: INDEX.replace('lang: ru', 'lang: ru\nimage: ./assets/cover.ru.png'),
    });
    await syncIssueCoverViaApi('nomer-3', 'ru', undefined);
    const [, content] = publishFileViaApi.mock.calls[0] as [string, string, string];
    expect(content).not.toContain('image:');
  });

  it('leaves a language without an index alone', async () => {
    readContentFile.mockResolvedValue({ kind: 'missing' });
    const r = await syncIssueCoverViaApi('nomer-3', 'en', './assets/cover.png');
    expect(r.ok).toBe(true);
    expect(publishFileViaApi).not.toHaveBeenCalled();
  });

  it('reports a failed read instead of guessing', async () => {
    readContentFile.mockResolvedValue({ kind: 'error', error: '401' });
    const r = await syncIssueCoverViaApi('nomer-3', 'ru', './assets/cover.ru.png');
    expect(r).toEqual({ ok: false, error: '401' });
    expect(publishFileViaApi).not.toHaveBeenCalled();
  });
});
