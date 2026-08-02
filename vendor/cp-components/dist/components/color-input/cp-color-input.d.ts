import type { PropertyValues, TemplateResult } from 'lit';
import { CpFormControl } from '../common/cp-form-control.js';
/**
 * Form-associated hex color field (R4/R7, design.md §5/§8). Pairs a native
 * `<input type="color">` swatch with a text field for the `#rrggbb` value; editing
 * either one updates {@link value} and re-renders the other, so the two stay in
 * sync. Participates in a real `<form>` through ElementInternals (submits `value`
 * under `name`), and — when `required` or `invalid` is set — reports a custom
 * constraint error for empty or malformed hex. Extends {@link CpFormControl},
 * reusing its label/validity/form lifecycle and adding the twin-control sync.
 *
 * Bridged `--cp-*` tokens carry surface/text/accent/danger (with standalone
 * fallbacks); the resting outline uses the site `--cb` control-border token.
 *
 * @fires cp-input - Bubbling + composed, `detail.value` = live hex on each edit.
 * @fires cp-change - Bubbling + composed, `detail.value` = committed hex.
 */
export declare class CpColorInput extends CpFormControl {
    static styles: import("lit").CSSResult[];
    /** True when a non-empty value is present but not a valid `#rrggbb` hex. */
    private get hasHexFormatError();
    /** Sets the value from an edit and re-emits it as a component event. */
    private commit;
    /** Swatch drives the value directly (native color input yields valid hex). */
    private readonly onSwatchInput;
    /** Text field drives the value after normalization; the swatch mirrors it. */
    private readonly onHexInput;
    /** Re-emits the committed value on `change` from either control. */
    private readonly onChange;
    updated(changed: PropertyValues): void;
    protected renderControl(): TemplateResult;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-color-input': CpColorInput;
    }
}
//# sourceMappingURL=cp-color-input.d.ts.map