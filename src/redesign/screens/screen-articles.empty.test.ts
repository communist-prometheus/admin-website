import { describe, it, expect, beforeEach, vi } from 'vitest';

// The article list now loads via the GitHub REST API (no SW clone). Mock that
// one call so the empty/error states are asserted independently of fetch.
vi.mock('../engine/content.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../engine/content.js')>();
  return { ...actual, listArticlesViaApi: vi.fn() };
});

import './screen-articles.ts';
import type { ScreenArticles } from './screen-articles.ts';
import { listArticlesViaApi } from '../engine/content.js';

const shadowText = (el: HTMLElement): string =>
  (el.shadowRoot?.textContent ?? '').replace(/\s+/g, ' ').trim();

const mount = async (): Promise<ScreenArticles> => {
  const el = document.createElement('screen-articles');
  document.body.append(el);
  for (let i = 0; i < 5; i += 1) {
    await el.updateComplete;
    await Promise.resolve();
  }
  return el;
};

describe('screen-articles empty + error states (QA #14)', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('prompts sign-in when the session is signed out', async () => {
    vi.mocked(listArticlesViaApi).mockResolvedValue({ articles: [], error: 'signed-out' });
    const el = await mount();
    expect(shadowText(el)).toContain('Войдите через GitHub');
    expect(shadowText(el)).not.toContain('Не удалось');
  });

  it('surfaces the real load error (not a silent empty) with a reload prompt', async () => {
    vi.mocked(listArticlesViaApi).mockResolvedValue({
      articles: [],
      error: 'Не удалось получить список файлов из репозитория (502).',
    });
    const el = await mount();
    const text = shadowText(el);
    expect(text).toContain('Не удалось загрузить статьи');
    expect(text).toContain('502');
    expect(text).toContain('Обновить');
    expect(text).not.toContain('Войдите через GitHub');
  });
});
