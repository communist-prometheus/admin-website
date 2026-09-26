import { describe, it, expect, beforeEach } from 'vitest';
import './cp-markdown-editor.ts';
import type { CpMarkdownEditor } from './cp-markdown-editor.ts';

/**
 * An import used to land wherever CodeMirror's selection happened to be, and
 * in a freshly opened article that is offset 0 — the very top. The writer,
 * who had scrolled to the end of a long piece and picked a file there, saw
 * the article unchanged and reported that import does nothing: the text was
 * sitting above the fold all along.
 *
 * Text now goes to the caret the writer actually placed, and to the END of
 * the article when they have placed none.
 */
const BODY = 'First paragraph.\n\nSecond paragraph.';
const ADDED = 'ADDED';

const mount = async (value: string): Promise<CpMarkdownEditor> => {
  const el: CpMarkdownEditor = document.createElement('cp-markdown-editor');
  el.value = value;
  document.body.append(el);
  await el.updateComplete;
  return el;
};

const docOf = (el: CpMarkdownEditor): string =>
  Reflect.get(el, 'view')?.state.doc.toString() ?? '';

/** Places a caret the way a writer would: focus, then click into the text. */
const putCaretAt = (el: CpMarkdownEditor, pos: number): void => {
  const view = Reflect.get(el, 'view');
  view.focus();
  view.dispatch({ selection: { anchor: pos } });
};

beforeEach(() => {
  document.body.replaceChildren();
});

describe('inserting into an article the writer has not touched', () => {
  it('appends at the end instead of dropping the text on top', async () => {
    const el = await mount(BODY);
    el.insertText(ADDED);
    expect(docOf(el).startsWith('First paragraph.')).toBe(true);
    expect(docOf(el).trimEnd().endsWith(ADDED)).toBe(true);
  });

  it('separates the addition from the text already there', async () => {
    const el = await mount(BODY);
    el.insertText(ADDED);
    expect(docOf(el)).toContain(`Second paragraph.\n\n${ADDED}`);
  });

  it('leaves the caret after the addition, so the view follows it', async () => {
    const el = await mount(BODY);
    el.insertText(ADDED);
    const view = Reflect.get(el, 'view');
    expect(view.state.selection.main.head).toBe(view.state.doc.length);
  });

  it('leaves exactly one blank line however the article was terminated', async () => {
    const el = await mount(`${BODY}


`);
    el.insertText(ADDED);
    expect(docOf(el)).toBe(`${BODY}

${ADDED}`);
  });

  it('starts an empty article with the text, with no leading blank line', async () => {
    const el = await mount('');
    el.insertText(ADDED);
    expect(docOf(el).startsWith(ADDED)).toBe(true);
  });
});

describe('inserting where the writer put the caret', () => {
  it('honours a caret they placed themselves', async () => {
    const el = await mount(BODY);
    putCaretAt(el, 'First paragraph.'.length);
    el.insertText('[HERE]');
    expect(docOf(el)).toBe('First paragraph.[HERE]\n\nSecond paragraph.');
  });

  it('replaces a selection they made', async () => {
    const el = await mount(BODY);
    const view = Reflect.get(el, 'view');
    view.focus();
    view.dispatch({ selection: { anchor: 0, head: 'First'.length } });
    el.insertText('Zeroth');
    expect(docOf(el)).toBe('Zeroth paragraph.\n\nSecond paragraph.');
  });
});
