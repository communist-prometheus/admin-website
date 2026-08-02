import { LitElement } from 'lit';
/**
 * Progress bar (R5/NFR-2, design.md §5). Two modes on one `role="progressbar"`:
 *
 * - Determinate: a `part="track"` holding a `part="bar"` whose width is
 *   `value * 100%`, exposing `aria-valuenow/min/max` (0..1).
 * - Indeterminate: an animated bar that slides across the track with NO
 *   `aria-valuenow`, so assistive tech announces an unknown-length operation.
 *
 * The bar is filled with `--cp-color-accent`. The indeterminate animation (and
 * the determinate width transition) is disabled under
 * `prefers-reduced-motion: reduce`, leaving a static bar.
 */
export declare class CpProgress extends LitElement {
    static styles: import("lit").CSSResult;
    /** Completion ratio in the inclusive 0..1 range (determinate mode). */
    value: number;
    /** When set, renders an animated unknown-length bar with no `aria-valuenow`. */
    indeterminate: boolean;
    /** Accessible name for the progress bar. */
    label: string;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-progress': CpProgress;
    }
}
//# sourceMappingURL=cp-progress.d.ts.map