import { EditorView } from '@codemirror/view';
import { describe, expect, it } from 'vitest';

/*
 * Seen 2026-10-27 on the production deploy: all 440 redesign tests passed and
 * the run still failed on an unhandled `textRange(...).getClientRects is not a
 * function`. An editor test scrolls the cursor into view; CodeMirror measures
 * on the next animation frame, and when that frame lands after the test, jsdom
 * — which has no layout — has no Range rects to give it. Whether the frame
 * lands in time is luck, so the deploy failed at random. A scroll request
 * followed by a measure called outright reproduces it every time — jsdom's
 * zero-size layout skips the measure unless a scroll target is pending.
 */
describe('the test DOM lets the markdown editor measure', () => {
  it('measures text after a scroll-into-view without throwing', () => {
    const parent = document.createElement('div');
    document.body.append(parent);
    const view = new EditorView({ doc: 'first line\nsecond line', parent });
    view.dispatch({ selection: { anchor: 3 }, scrollIntoView: true });
    expect(() => view.measure()).not.toThrow();
    view.destroy();
    parent.remove();
  });
});
