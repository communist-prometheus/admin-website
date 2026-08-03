import { LitElement } from 'lit';
/** Supported tip placements relative to the trigger. */
export type TooltipPlacement = 'top' | 'bottom' | 'left' | 'right';
/**
 * Descriptive tooltip (R4/R7, design.md §5). Wraps a slotted trigger and reveals
 * an absolutely-positioned tip (`role="tooltip"`, `part="tip"`) on hover/focus.
 * Visibility is CSS-driven via `:host(:hover)` / `:host(:focus-within)` so there
 * is no JS timer to leak, and it works for keyboard focus out of the box. The
 * trigger is tied to the tip with `aria-describedby` for assistive tech.
 */
export declare class CpTooltip extends LitElement {
    static styles: import("lit").CSSResult;
    /** Tooltip text shown in the tip. */
    text: string;
    /** Which side of the trigger the tip appears on. */
    placement: TooltipPlacement;
    private readonly tipId;
    connectedCallback(): void;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-tooltip': CpTooltip;
    }
}
//# sourceMappingURL=cp-tooltip.d.ts.map