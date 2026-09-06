import { beforeEach, describe, expect, it } from 'vitest';
import './screen-editor.ts';
import type { ScreenEditor } from './screen-editor.ts';

/**
 * The properties of a material (rubric, topic, date, published) must be part of
 * the page, not hidden behind a modal, and the page must say whether what you
 * are looking at is published or a draft.
 *
 * The 2026-09-06 report: an editor published a translation, the breadcrumb still
 * read "draft" (it was hardcoded), the required-marked topic select showed empty
 * for an article that has a category, and the properties were only reachable
 * through a sheet. Driving the private state via a cast mirrors the sibling
 * screen-editor tests; it is the only way to seed the element headlessly.
 */
const PUBLISHED = '---\ntitle: "T"\nlang: ru\ncategory: programme\npublished: true\n---\n\nBody\n';
const DRAFT = '---\ntitle: "T"\nlang: ru\ncategory: programme\npublished: false\n---\n\nBody\n';

interface EditorInternals {
  slug: string;
  collection: string;
  live: boolean;
  activeLang: string;
  availableLangs: readonly string[];
  applyMarkdown: (markdown: string, path: string, live: boolean) => void;
}

const mounted = async (markdown: string): Promise<ScreenEditor> => {
  const el = document.createElement('screen-editor') as ScreenEditor;
  const priv = el as unknown as EditorInternals;
  priv.slug = 'x';
  priv.collection = 'blog';
  priv.live = true;
  priv.activeLang = 'ru';
  priv.availableLangs = ['ru'];
  priv.applyMarkdown(markdown, 'blog/x/index.ru.md', true);
  document.body.append(el);
  await el.updateComplete;
  return el;
};

const text = (el: ScreenEditor): string =>
  (el.shadowRoot?.textContent ?? '').replace(/\s+/g, ' ').trim();

/** Every rendered form control, including those inside the properties area. */
const controls = (el: ScreenEditor): readonly Element[] => [
  ...(el.shadowRoot?.querySelectorAll('cp-select, cp-date-input, cp-switch') ?? []),
];

beforeEach(() => {
  document.body.replaceChildren();
});

describe('screen-editor: publication status in the header', () => {
  it('says the material is published when it is', async () => {
    const el = await mounted(PUBLISHED);
    expect(text(el)).toContain('опубликовано');
    expect(text(el)).not.toContain('черновик');
  });

  it('says draft only for an unpublished material', async () => {
    const el = await mounted(DRAFT);
    expect(text(el)).toContain('черновик');
  });
});

describe('screen-editor: properties live on the page', () => {
  it('renders the property controls without opening anything', async () => {
    const el = await mounted(PUBLISHED);
    // rubric + topic + date + published switch, all inline.
    expect(controls(el).length).toBeGreaterThanOrEqual(4);
    const labels = controls(el).map((control) => control.getAttribute('label'));
    expect(labels).toContain('Рубрика');
    expect(labels).toContain('Тема');
    expect(labels).toContain('Опубликовано');
  });

  it('keeps the properties editable, seeded from the file', async () => {
    const el = await mounted(PUBLISHED);
    const rubric = el.shadowRoot?.querySelector('cp-select[label="Рубрика"]');
    expect(rubric).not.toBeNull();
    expect(Reflect.get(rubric ?? {}, 'value')).toBe('programme');
    expect(el.shadowRoot?.querySelector('cp-switch[label="Опубликовано"]')).not.toBeNull();
  });

  it('has no modal properties sheet left', async () => {
    const el = await mounted(PUBLISHED);
    expect(el.shadowRoot?.querySelector('cp-sheet')).toBeNull();
  });
});

describe('screen-editor: topic is optional', () => {
  it('never demands a topic', async () => {
    const el = await mounted('---\ntitle: "T"\nlang: ru\npublished: true\n---\n\nBody\n');
    expect(text(el)).not.toContain('обязательное');
    expect(el.shadowRoot?.querySelector('cp-select[required]')).toBeNull();
  });
});

describe('screen-editor: the state of the site build', () => {
  it('warns when the site build is failing, so a published article that never appears is explained', async () => {
    const el = await mounted(PUBLISHED);
    const priv = el as unknown as { siteBuild: { phase: string; runUrl?: string } };
    priv.siteBuild = { phase: 'failed', runUrl: 'https://run/7' };
    el.requestUpdate();
    await el.updateComplete;
    const banner = el.shadowRoot?.querySelector('cp-banner[tone="danger"]');
    expect(banner?.getAttribute('title')).toBe('Сборка сайта падает');
    expect(text(el)).toContain('не доезжают до сайта');
    expect(el.shadowRoot?.querySelector('a[href="https://run/7"]')).not.toBeNull();
  });

  it('stays quiet while the site builds fine', async () => {
    const el = await mounted(PUBLISHED);
    const priv = el as unknown as { siteBuild: { phase: string } };
    priv.siteBuild = { phase: 'ok' };
    el.requestUpdate();
    await el.updateComplete;
    expect(el.shadowRoot?.querySelector('cp-banner[tone="danger"]')).toBeNull();
  });
});
