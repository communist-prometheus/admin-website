import { describe, it, expect, beforeEach } from 'vitest';
import './screen-magazine.ts';
import type { ScreenMagazine } from './screen-magazine.ts';

/** Mounts the magazine screen with the "new issue" form open. */
const mountWithForm = async (): Promise<ScreenMagazine> => {
  const el = document.createElement('screen-magazine') as ScreenMagazine;
  document.body.append(el);
  await el.updateComplete;
  const priv = el as unknown as { formOpen: boolean; fSlug: string };
  priv.formOpen = true;
  return el;
};

const shadowText = (el: HTMLElement): string =>
  (el.shadowRoot?.textContent ?? '').replace(/\s+/g, ' ').trim();

const setSlug = async (el: ScreenMagazine, slug: string): Promise<void> => {
  (el as unknown as { fSlug: string }).fSlug = slug;
  el.requestUpdate();
  await el.updateComplete;
};

describe('screen-magazine slug validation (QA #17)', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('surfaces an inline error for an invalid slug', async () => {
    const el = await mountWithForm();
    await setSlug(el, 'Nomer 3');
    expect(shadowText(el)).toContain('только строчные');
  });

  it('shows no error for a valid slug', async () => {
    const el = await mountWithForm();
    await setSlug(el, 'nomer-3-2026');
    expect(shadowText(el)).not.toContain('только строчные');
  });

  it('does not shout before anything is typed', async () => {
    const el = await mountWithForm();
    await el.updateComplete;
    expect(shadowText(el)).not.toContain('Укажите слаг');
  });
});
