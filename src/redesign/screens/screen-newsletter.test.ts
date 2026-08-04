import { describe, it, expect, beforeEach } from 'vitest';
import './screen-newsletter.ts';
import type { ScreenNewsletter } from './screen-newsletter.ts';

/** Mounts the newsletter screen and waits for its first render. */
const mount = async (): Promise<ScreenNewsletter> => {
  const el = document.createElement('screen-newsletter') as ScreenNewsletter;
  document.body.append(el);
  await el.updateComplete;
  return el;
};

/** The full rendered text of the shadow root, whitespace-collapsed. */
const shadowText = (el: HTMLElement): string =>
  (el.shadowRoot?.textContent ?? '').replace(/\s+/g, ' ').trim();

describe('screen-newsletter (QA #9: no fake sends)', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  it('shows a "not connected" banner up front', async () => {
    // The banner heading lives in cp-banner's own shadow root; assert on its
    // slotted description text, which projects into this screen's shadow.
    const el = await mount();
    expect(shadowText(el)).toContain('реальная отправка не выполняется');
  });

  it('never claims delivery succeeded', async () => {
    const el = await mount();
    const text = shadowText(el);
    expect(text).not.toContain('доставлено');
    expect(text).not.toContain('Отправляется');
  });

  it('a confirmed send reports "not delivered", not success', async () => {
    const el = await mount();
    // Drive the same transition the danger button triggers, then re-render.
    (el as unknown as { confirmSend: () => void }).confirmSend();
    await el.updateComplete;
    const text = shadowText(el);
    expect(text).toContain('ни одно письмо не ушло');
    expect(text).not.toContain('успешно');
  });
});
