import { beforeEach, describe, expect, it, vi } from 'vitest';

const listDirViaApi = vi.fn();
const uploadBinaryViaApi = vi.fn();
const deleteFileViaApi = vi.fn();
const syncIssueCoverViaApi = vi.fn();

vi.mock('../engine/content.js', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('../engine/content.ts');
  return {
    ...actual,
    listDirViaApi: (dir: string) => listDirViaApi(dir),
    uploadBinaryViaApi: (path: string, b64: string, msg: string) => uploadBinaryViaApi(path, b64, msg),
    deleteFileViaApi: (path: string, msg: string) => deleteFileViaApi(path, msg),
  };
});

vi.mock('../engine/issue-cover.js', async () => {
  const actual = await vi.importActual<Record<string, unknown>>('../engine/issue-cover.ts');
  return {
    ...actual,
    syncIssueCoverViaApi: (slug: string, lang: string, image: string | undefined) =>
      syncIssueCoverViaApi(slug, lang, image),
  };
});

import './issue-files.ts';

/**
 * Reported 2026-11-08: a cover published from this panel showed here but never
 * on the public site, because the panel committed the image and left the
 * issue index's `image:` field — the only thing the site reads — untouched.
 */
const DIR = 'magazine/nomer-3/assets';
const repoFile = (name: string): { name: string; path: string; size: number; sha: string } => ({
  name,
  path: `${DIR}/${name}`,
  size: 10,
  sha: name,
});

interface PanelInternals {
  stagedCover?: File;
  commitCover: () => Promise<void>;
  removeFile: (file: ReturnType<typeof repoFile>) => Promise<void>;
  updateComplete: Promise<boolean>;
  error: string;
}

const mounted = async (): Promise<PanelInternals> => {
  const el = document.createElement('issue-files');
  Object.assign(el, { dir: DIR, slug: 'nomer-3', lang: 'ru', langs: ['ru'] });
  document.body.append(el);
  const priv = el as unknown as PanelInternals;
  await priv.updateComplete;
  return priv;
};

beforeEach(() => {
  document.body.replaceChildren();
  for (const fn of [listDirViaApi, uploadBinaryViaApi, deleteFileViaApi, syncIssueCoverViaApi]) fn.mockReset();
  uploadBinaryViaApi.mockResolvedValue({ ok: true });
  deleteFileViaApi.mockResolvedValue({ ok: true });
  syncIssueCoverViaApi.mockResolvedValue({ ok: true });
});

describe('the issue files panel keeps the index cover in step', () => {
  it('points the index at a cover published from the panel', async () => {
    listDirViaApi.mockResolvedValue([repoFile('nomer-3.ru.pdf')]);
    const panel = await mounted();
    listDirViaApi.mockResolvedValue([repoFile('nomer-3.ru.pdf'), repoFile('cover.ru.png')]);
    panel.stagedCover = new File([new Uint8Array([137, 80, 78, 71])], 'my-cover.png', { type: 'image/png' });
    await panel.commitCover();
    expect(uploadBinaryViaApi.mock.calls[0]?.[0]).toBe(`${DIR}/cover.ru.png`);
    expect(syncIssueCoverViaApi).toHaveBeenCalledWith('nomer-3', 'ru', './assets/cover.ru.png');
    expect(panel.error).toBe('');
  });

  it('drops the index cover when the last cover file is deleted', async () => {
    listDirViaApi.mockResolvedValue([repoFile('cover.ru.png')]);
    const panel = await mounted();
    listDirViaApi.mockResolvedValue([]);
    await panel.removeFile(repoFile('cover.ru.png'));
    expect(syncIssueCoverViaApi).toHaveBeenCalledWith('nomer-3', 'ru', undefined);
  });

  it('surfaces a failed index update instead of reporting success', async () => {
    listDirViaApi.mockResolvedValue([]);
    const panel = await mounted();
    listDirViaApi.mockResolvedValue([repoFile('cover.ru.png')]);
    syncIssueCoverViaApi.mockResolvedValue({ ok: false, error: 'conflict' });
    panel.stagedCover = new File([new Uint8Array([1])], 'c.png', { type: 'image/png' });
    await panel.commitCover();
    expect(panel.error).toContain('conflict');
  });
});
