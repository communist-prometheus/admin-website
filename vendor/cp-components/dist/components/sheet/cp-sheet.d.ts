import { nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { CpOverlay } from '../common/cp-overlay.js';
import '../icon/cp-icon.js';
/**
 * Bottom sheet (R4/R7, design.md §5) for mobile-first surfaces. Slides a
 * `role="dialog"` / `aria-modal="true"` panel (`part="panel"`) up from the bottom
 * edge over a dimmed backdrop (`part="backdrop"`), labelled by its `heading`
 * (`part="heading"`). Content is composed through the default slot; a grab handle
 * signals the affordance without carrying meaning by shape alone.
 *
 * Emits the bubbling, composed `cp-close` from `Esc`, a backdrop click or the
 * header close button. Focus is trapped inside the panel and restored to the
 * invoking element on close (see {@link CpOverlay}).
 */
export declare class CpSheet extends CpOverlay {
    static styles: import("lit").CSSResult;
    /** Heading text; also the sheet's accessible name via `aria-labelledby`. */
    heading: string;
    protected get panel(): HTMLElement | undefined;
    protected emitDismiss(): void;
    private handleClose;
    render(): TemplateResult | typeof nothing;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-sheet': CpSheet;
    }
}
//# sourceMappingURL=cp-sheet.d.ts.map