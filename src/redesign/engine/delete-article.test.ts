import { beforeEach, describe, expect, it, vi } from 'vitest';

const listDirViaApi = vi.fn();
const deleteFileViaApi = vi.fn();

vi.mock('./content.js', () => ({
  listDirViaApi: (dir: string) => listDirViaApi(dir),
  deleteFileViaApi: (path: string, message: string) => deleteFileViaApi(path, message),
}));

import { deleteLanguage, deleteMaterial } from './delete-article.ts';

/**
 * Deleting a material exists only in the client that is no longer served, so
 * removing that client would take the capability with it. Two shapes, as
 * before: drop one translation, or drop the whole material with every
 * language and asset it owns.
 */

const file = (path: string) => ({ path, name: path.split('/').pop() ?? '' });

beforeEach(() => {
  listDirViaApi.mockReset();
  deleteFileViaApi.mockReset();
  deleteFileViaApi.mockResolvedValue({ ok: true });
  listDirViaApi.mockResolvedValue([
    file('blog/welcome/index.ru.md'),
    file('blog/welcome/index.en.md'),
    file('blog/welcome/assets/cover.png'),
  ]);
});

describe('dropping one translation', () => {
  it('removes only that language file', async () => {
    const result = await deleteLanguage('blog', 'welcome', 'en');
    expect(result).toEqual({ ok: true, removed: 1 });
    expect(deleteFileViaApi).toHaveBeenCalledTimes(1);
    const [path] = deleteFileViaApi.mock.calls[0] as [string];
    expect(path).toBe('blog/welcome/index.en.md');
  });

  it('refuses to drop the last remaining language', async () => {
    listDirViaApi.mockResolvedValue([file('blog/welcome/index.ru.md')]);
    const result = await deleteLanguage('blog', 'welcome', 'ru');
    expect(result.ok).toBe(false);
    expect(deleteFileViaApi).not.toHaveBeenCalled();
  });

  it('reports a language the material does not have', async () => {
    const result = await deleteLanguage('blog', 'welcome', 'es');
    expect(result.ok).toBe(false);
    expect(deleteFileViaApi).not.toHaveBeenCalled();
  });
});

describe('dropping the whole material', () => {
  it('removes every file the material owns, assets included', async () => {
    const result = await deleteMaterial('blog', 'welcome');
    expect(result).toEqual({ ok: true, removed: 3 });
    const paths = deleteFileViaApi.mock.calls.map((c) => (c as [string])[0]);
    expect(paths).toEqual([
      'blog/welcome/index.ru.md',
      'blog/welcome/index.en.md',
      'blog/welcome/assets/cover.png',
    ]);
  });

  it('stops at the first refusal rather than half-deleting a material', async () => {
    deleteFileViaApi.mockResolvedValueOnce({ ok: false, error: 'отказано' });
    const result = await deleteMaterial('blog', 'welcome');
    expect(result.ok).toBe(false);
    expect(deleteFileViaApi).toHaveBeenCalledTimes(1);
  });

  it('reports a material that has nothing to delete', async () => {
    listDirViaApi.mockResolvedValue([]);
    const result = await deleteMaterial('blog', 'gone');
    expect(result.ok).toBe(false);
    expect(deleteFileViaApi).not.toHaveBeenCalled();
  });

  it('names the material in the commit, so history says what happened', async () => {
    await deleteMaterial('blog', 'welcome');
    const [, message] = deleteFileViaApi.mock.calls[0] as [string, string];
    expect(message).toContain('welcome');
  });
});
