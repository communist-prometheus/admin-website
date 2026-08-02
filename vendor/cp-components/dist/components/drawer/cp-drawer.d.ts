import { nothing } from 'lit';
import type { TemplateResult } from 'lit';
import { CpOverlay } from '../common/cp-overlay.js';
import '../icon/cp-icon.js';
/** Edge the drawer is anchored to and slides in from. */
export type DrawerSide = 'left' | 'right';
/**
 * Off-canvas navigation/detail drawer (R4/R7, design.md §5). Slides a
 * `role="dialog"` / `aria-modal="true"` side panel (`part="panel"`) in from the
 * `side` edge over a dimmed backdrop (`part="backdrop"`), labelled by its
 * `heading` (`part="heading"`). Content is composed through the default slot.
 *
 * Emits the bubbling, composed `cp-close` from `Esc`, a backdrop click or the
 * header close button. Focus is trapped inside the panel and restored to the
 * invoking element on close (see {@link CpOverlay}).
 */
export declare class CpDrawer extends CpOverlay {
    static styles: import("lit").CSSResult;
    /** Heading text; also the drawer's accessible name via `aria-labelledby`. */
    heading: string;
    /** Edge the drawer anchors to and slides in from. */
    side: DrawerSide;
    protected get panel(): HTMLElement | undefined;
    protected emitDismiss(): void;
    private handleClose;
    render(): TemplateResult | typeof nothing;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-drawer': CpDrawer;
    }
}
//# sourceMappingURL=cp-drawer.d.ts.map