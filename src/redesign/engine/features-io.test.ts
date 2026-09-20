import { beforeEach, describe, expect, it, vi } from 'vitest';

const readFileViaApi = vi.fn();
const publishFileViaApi = vi.fn();

vi.mock('./content.js', () => ({
  readFileViaApi: (path: string) => readFileViaApi(path),
  publishFileViaApi: (path: string, content: string, message: string) =>
    publishFileViaApi(path, content, message),
}));

import { readFeaturesViaApi, saveFeaturesViaApi } from './features-io.ts';

/**
 * Site feature flags (`settings/features.json`) could only be toggled in the
 * client that is no longer served. One flag exists today — whether the site
 * publishes the webring — but the file is the contract, so the reader keeps
 * unknown keys rather than dropping what a future site added.
 */

beforeEach(() => {
  readFileViaApi.mockReset();
  publishFileViaApi.mockReset();
  publishFileViaApi.mockResolvedValue({ ok: true, sha: 'abc' });
});

describe('reading the feature flags', () => {
  it('reads the flags the repository carries', async () => {
    readFileViaApi.mockResolvedValue(JSON.stringify({ webring: true }));
    expect(await readFeaturesViaApi()).toEqual({ webring: true });
    expect(readFileViaApi).toHaveBeenCalledWith('settings/features.json');
  });

  it('treats a missing file as everything off, not as a failure', async () => {
    readFileViaApi.mockResolvedValue(undefined);
    expect(await readFeaturesViaApi()).toEqual({ webring: false });
  });

  it('falls back for a flag the file does not carry', async () => {
    readFileViaApi.mockResolvedValue(JSON.stringify({}));
    expect(await readFeaturesViaApi()).toEqual({ webring: false });
  });

  it('ignores a value that is not a flag', async () => {
    readFileViaApi.mockResolvedValue(JSON.stringify({ webring: 'yes' }));
    expect(await readFeaturesViaApi()).toEqual({ webring: false });
  });

  it('survives a file that is not an object', async () => {
    readFileViaApi.mockResolvedValue('[]');
    expect(await readFeaturesViaApi()).toEqual({ webring: false });
  });
});

describe('writing the feature flags', () => {
  it('writes the flags as pretty JSON', async () => {
    await saveFeaturesViaApi({ webring: true });
    const [path, content] = publishFileViaApi.mock.calls[0] as [string, string];
    expect(path).toBe('settings/features.json');
    expect(JSON.parse(content)).toEqual({ webring: true });
  });

  it('reports a refusal from the write rather than claiming success', async () => {
    publishFileViaApi.mockResolvedValue({ ok: false, error: 'отказано' });
    expect(await saveFeaturesViaApi({ webring: false })).toEqual({
      ok: false,
      error: 'отказано',
    });
  });
});
