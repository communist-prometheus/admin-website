import { LitElement } from 'lit';
import type { Variant, Size } from '../../types/common.js';
import '../icon/cp-icon.js';
/**
 * Button primitive (R4, design.md §5). Variants primary/secondary/ghost, sizes
 * sm/md/lg, with the site's primary treatment (solid accent + optional trailing
 * `→`). `loading` shows a spinner and blocks interaction; `pressed` reflects a
 * toggle state via `aria-pressed` (used by the 3-way-merge "take" controls).
 */
export declare class CpButton extends LitElement {
    static styles: import("lit").CSSResult;
    /** Visual variant. */
    variant: Variant;
    /** Size. */
    size: Size;
    /** Disables the button. */
    disabled: boolean;
    /** Shows a spinner and blocks interaction while an action is in flight. */
    loading: boolean;
    /** Renders the site's trailing `→` after the label. */
    arrow: boolean;
    /** Toggle state; reflected as `aria-pressed`. */
    pressed: boolean;
    /** Native button type. */
    type: 'button' | 'submit' | 'reset';
    private handleClick;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-button': CpButton;
    }
}
//# sourceMappingURL=cp-button.d.ts.map