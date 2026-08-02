var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CpFormControl, fieldStyles } from '../common/cp-form-control.js';
/**
 * Multi-line, form-associated text field (R4/R7, design.md §5/§8). A native
 * `<textarea>` wrapped in Shadow DOM with a bound `<label>`; participates in a
 * real `<form>` through ElementInternals (submits its `value` under `name`,
 * reports a custom error when `required` and empty or when `invalid` is set).
 * Inherits the shared form/validity/event lifecycle from {@link CpFormControl}
 * and only adds the `rows` passthrough for the concrete textarea element.
 */
let CpTextarea = class CpTextarea extends CpFormControl {
    constructor() {
        super(...arguments);
        /** Visible row count of the inner textarea. */
        this.rows = 3;
    }
    static { this.styles = [
        fieldStyles,
        css `
      .control {
        resize: vertical;
        min-height: calc(var(--cp-spacing-lg, 2rem) * 2);
      }
    `,
    ]; }
    renderControl() {
        const bindings = this.controlBindings();
        return html `
      <textarea
        id=${bindings.id}
        class="control"
        part="control"
        rows=${this.rows}
        placeholder=${this.placeholder}
        .value=${this.value}
        ?disabled=${this.disabled}
        ?required=${this.required}
        aria-invalid=${bindings.ariaInvalid}
        aria-required=${bindings.ariaRequired}
        aria-describedby=${bindings.ariaDescribedby}
        @input=${this.handleInput}
        @change=${this.handleChange}
      ></textarea>
    `;
    }
};
__decorate([
    property({ type: Number })
], CpTextarea.prototype, "rows", void 0);
CpTextarea = __decorate([
    customElement('cp-textarea')
], CpTextarea);
export { CpTextarea };
//# sourceMappingURL=cp-textarea.js.map