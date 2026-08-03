import { nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { CpOverlay } from '../common/cp-overlay.js';
import '../icon/cp-icon.js';
/** Visual accent of the dialog; `danger` tints the heading and confirm action. */
export type DialogTone = 'default' | 'danger';
/**
 * Modal confirmation dialog (R4/R7, design.md §5). Renders a dimmed backdrop
 * (`part="backdrop"`) behind a centered, `role="dialog"` / `aria-modal="true"`
 * panel (`part="dialog"`) labelled by its `heading` (`part="heading"`). A default
 * body slot and a `footer` slot compose the content; the footer's fallback
 * supplies a Cancel/confirm affordance so a standalone dialog is usable.
 *
 * Emits the bubbling, composed `cp-cancel` from `Esc`, a backdrop click or the
 * header close button, and `cp-confirm` from the confirm affordance. While `busy`
 * (an action in flight) `Esc` and backdrop dismissal are suppressed. `tone`
 * `"danger"` recolours the heading and confirm accent. Focus is trapped inside
 * the panel and restored to the invoking element on close (see {@link CpOverlay}).
 */
export declare class CpDialog extends CpOverlay {
    static styles: import("lit").CSSResult;
    /** Heading text; also the dialog's accessible name via `aria-labelledby`. */
    heading: string;
    /** Accent tone; `danger` recolours the heading and confirm action. */
    tone: DialogTone;
    /** Marks an action in flight; suppresses `Esc`/backdrop dismissal. */
    busy: boolean;
    protected get panel(): HTMLElement | undefined;
    protected mayDismiss(): boolean;
    protected emitDismiss(): void;
    /** Dispatches a bubbling, composed dialog event. */
    private emit;
    private handleClose;
    private handleConfirm;
    render(): TemplateResult | typeof nothing;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-dialog': CpDialog;
    }
}
//# sourceMappingURL=cp-dialog.d.ts.map