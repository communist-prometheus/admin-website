var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CpFormControl, fieldStyles } from '../common/cp-form-control.js';
/**
 * Single-line, form-associated text field (R4/R7, design.md §5/§8). A native
 * `<input>` wrapped in Shadow DOM with a bound `<label>`; participates in a real
 * `<form>` through ElementInternals (submits its `value` under `name`, reports a
 * custom error when `required` and empty or when `invalid` is set). Inherits the
 * shared form/validity/event lifecycle from {@link CpFormControl} and only adds
 * the `type` passthrough for the concrete input element.
 */
let CpInput = class CpInput extends CpFormControl {
    constructor() {
        super(...arguments);
        /** Native input type (text/email/url/number/tel/search/password…). */
        this.type = 'text';
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
        placeholder=${this.placeholder}
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
], CpInput.prototype, "type", void 0);
CpInput = __decorate([
    customElement('cp-input')
], CpInput);
export { CpInput };
//# sourceMappingURL=cp-input.js.map