var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var CpRadio_1;
import { html, css, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CpBooleanControl, BOOLEAN_CONTROL_ID } from '../common/cp-boolean-control.js';
/**
 * Form-associated radio button (R4/R7, design.md §5/§8). A visually-hidden
 * native `<input type="radio">` supplies role, focus and keyboard behaviour
 * while a custom-styled ring with a CSS dot provides the site presentation; the
 * input lives inside its `<label>` for implicit name association. Because each
 * `cp-radio` owns a separate Shadow DOM the browser cannot form a native group,
 * so selecting one deselects its same-`name` peers within the nearest `<form>`
 * (or root) explicitly. Participates in a real `<form>` through ElementInternals
 * via the shared {@link CpBooleanControl}: submits `value` under `name` only
 * while checked and emits a bubbling+composed `cp-change` carrying
 * `detail.checked`.
 */
let CpRadio = class CpRadio extends CpBooleanControl {
    constructor() {
        super(...arguments);
        /** Syncs state from the native input, exclusivity, then republishes. */
        this.handleChange = (event) => {
            const target = event.target;
            if (target instanceof HTMLInputElement) {
                this.checked = target.checked;
                this.deselectPeers();
                this.emitChange();
            }
        };
    }
    static { CpRadio_1 = this; }
    static { this.styles = css `
    :host {
      display: block;
    }

    .field {
      display: inline-flex;
      align-items: center;
      gap: var(--cp-spacing-xs, 0.5rem);
      cursor: pointer;
      font-size: 0.875rem;
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
    }

    .native {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      clip-path: inset(50%);
      white-space: nowrap;
      border: 0;
    }

    .box {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 1.25rem;
      height: 1.25rem;
      flex: 0 0 auto;
      background: var(--cp-color-surface, hsl(0 0% 98%));
      border: 1px solid var(--cb, hsl(0 0% 55%));
      border-radius: 50%;
      transition: border-color var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1));
    }

    .dot {
      width: 0.625rem;
      height: 0.625rem;
      border-radius: 50%;
      background: var(--cp-color-on-accent, #fff);
      transform: scale(0);
      transition: transform var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1));
    }

    .native:checked + .box {
      background: var(--cp-color-accent, hsl(12 80% 45%));
      border-color: var(--cp-color-accent, hsl(12 80% 45%));
    }

    .native:checked + .box .dot {
      transform: scale(1);
    }

    .native:focus-visible + .box {
      outline: 2px solid var(--cp-color-accent, hsl(12 80% 45%));
      outline-offset: 2px;
    }

    .native:disabled + .box {
      opacity: 0.5;
    }

    .native:disabled ~ .label {
      opacity: 0.5;
    }

    @media (prefers-reduced-motion: reduce) {
      .box,
      .dot {
        transition: none;
      }
    }
  `; }
    /** The nearest form (else root) scoping same-`name` peer deselection. */
    scope() {
        const form = this.closest('form');
        if (form) {
            return form;
        }
        const root = this.getRootNode();
        return root instanceof Document || root instanceof ShadowRoot ? root : undefined;
    }
    /** Unchecks same-`name` peers so only this radio stays selected. */
    deselectPeers() {
        if (this.name === '') {
            return;
        }
        this.scope()
            ?.querySelectorAll('cp-radio')
            .forEach((node) => {
            if (node !== this && node instanceof CpRadio_1 && node.name === this.name) {
                node.checked = false;
            }
        });
    }
    render() {
        return html `
      <label class="field" part="field">
        <input
          id=${BOOLEAN_CONTROL_ID}
          class="native"
          type="radio"
          part="control"
          .checked=${this.checked}
          value=${this.value}
          ?disabled=${this.disabled}
          ?required=${this.required}
          aria-describedby=${this.describedby ? this.describedby : nothing}
          @change=${this.handleChange}
        />
        <span class="box" part="box" aria-hidden="true">
          <span class="dot" part="dot"></span>
        </span>
        <span class="label" part="label">${this.label}</span>
      </label>
    `;
    }
};
CpRadio = CpRadio_1 = __decorate([
    customElement('cp-radio')
], CpRadio);
export { CpRadio };
//# sourceMappingURL=cp-radio.js.map