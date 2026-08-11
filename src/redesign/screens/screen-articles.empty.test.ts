import { describe, it, expect, beforeEach, vi } from 'vitest';

// No engine is booted in tests, so listArticles returns []. Force it explicitly
// to keep the empty-state assertions independent of jsdom's fetch behaviour.
vi.mock('../engine/content.js', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../engine/content.js')>();
  return { ...actual, listArticles: async () => [] };
});

import './screen-articles.ts';
import type { ScreenArticles } from './screen-articles.ts';
import { markEngineReady } from '../engine/engine-ready.js';

const shadowText = (el: HTMLElement): string =>
  (el.shadowRoot?.textContent ?? '').replace(/\s+/g, ' ').trim();

const settle = async (el: ScreenArticles): Promise<void> => {
  for (let i = 0; i < 4; i += 1) {
    await el.updateComplete;
    await Promise.resolve();
  }
};

describe('screen-articles empty state (QA #14)', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('prompts sign-in before the engine boots, then switches to a reload prompt', async () => {
    const el = document.createElement('screen-articles') as ScreenArticles;
    document.body.append(el);
    await settle(el);

    // Engine not ready → this is a signed-out session, not an empty repo.
    expect(shadowText(el)).toContain('Войдите через GitHub');
    expect(shadowText(el)).not.toContain('не удалось');

    // Once the engine is ready an empty list is no longer a sign-in problem.
    markEngineReady();
    await settle(el);
    const text = shadowText(el);
    expect(text).not.toContain('Войдите через GitHub');
    expect(text).toContain('не удалось');
    expect(text).toContain('Обновить');
  });
});
