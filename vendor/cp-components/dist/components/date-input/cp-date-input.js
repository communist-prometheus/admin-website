var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CpFormControl, fieldStyles } from '../common/cp-form-control.js';
/**
 * Form-associated date / date-time field (R4/R7, design.md §5/§8). Wraps a native
 * `<input type="date">` or `<input type="datetime-local">` (selected via
 * {@link type}) in Shadow DOM with a bound `<label>`; participates in a real
 * `<form>` through ElementInternals (submits its ISO `value` under `name`) and
 * reports a custom error when `required` and empty or when `invalid` is set. The
 * `min`/`max` bounds pass straight through to the native control. Inherits the
 * shared form/validity/event lifecycle from {@link CpFormControl}.
 *
 * Bridged `--cp-*` tokens carry surface/text/accent/danger (with standalone
 * fallbacks); the resting outline uses the site `--cb` control-border token.
 *
 * @fires cp-input - Bubbling + composed, `detail.value` = live ISO string.
 * @fires cp-change - Bubbling + composed, `detail.value` = committed ISO string.
 */
let CpDateInput = class CpDateInput extends CpFormControl {
    constructor() {
        super(...arguments);
        /** Native input kind: calendar date or local date + time. */
        this.type = 'date';
        /** Earliest allowed ISO value; passed to the native control's `min`. */
        this.min = '';
        /** Latest allowed ISO value; passed to the native control's `max`. */
        this.max = '';
    }
    static { this.styles = [fieldStyles]; }
    renderControl() {
        const bindings = this.controlBindings();
        return html `
      <input
        id=${bindings.id}
        class="control"
        part="control"
        type=${this.type}
        .value=${this.value}
        min=${this.min || nothing}
        max=${this.max || nothing}
        ?disabled=${this.disabled}
        ?required=${this.required}
        aria-invalid=${bindings.ariaInvalid}
        aria-required=${bindings.ariaRequired}
        aria-describedby=${bindings.ariaDescribedby}
        @input=${this.handleInput}
        @change=${this.handleChange}
      />
    `;
    }
};
__decorate([
    property({ type: String })
], CpDateInput.prototype, "type", void 0);
__decorate([
    property({ type: String })
], CpDateInput.prototype, "min", void 0);
__decorate([
    property({ type: String })
], CpDateInput.prototype, "max", void 0);
CpDateInput = __decorate([
    customElement('cp-date-input')
], CpDateInput);
export { CpDateInput };
//# sourceMappingURL=cp-date-input.js.map