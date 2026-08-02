import type { TemplateResult } from 'lit';
import { CpBooleanControl } from '../common/cp-boolean-control.js';
/**
 * Form-associated toggle switch (R4/R7, design.md §5/§8). A native `<button>`
 * carrying `role="switch"` + `aria-checked` (so it is focusable and Space/Enter
 * operable for free) drives a custom track/thumb, named by the adjacent visible
 * label via `aria-labelledby`. Participates in a real `<form>` through
 * ElementInternals via the shared {@link CpBooleanControl}: submits `on` under
 * `name` only while checked and emits a bubbling+composed `cp-change` carrying
 * `detail.checked`. The thumb slide honours `prefers-reduced-motion`.
 */
export declare class CpSwitch extends CpBooleanControl {
    static styles: import("lit").CSSResult;
    /** Flips the checked state and republishes the change. */
    private toggle;
    render(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-switch': CpSwitch;
    }
}
//# sourceMappingURL=cp-switch.d.ts.map