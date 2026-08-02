var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, css, nothing } from 'lit';
import { customElement } from 'lit/decorators.js';
import { CpBooleanControl, BOOLEAN_CONTROL_ID } from '../common/cp-boolean-control.js';
/** Id linking the `role="switch"` control to its visible label. */
const LABEL_ID = 'switch-label';
/**
 * Form-associated toggle switch (R4/R7, design.md §5/§8). A native `<button>`
 * carrying `role="switch"` + `aria-checked` (so it is focusable and Space/Enter
 * operable for free) drives a custom track/thumb, named by the adjacent visible
 * label via `aria-labelledby`. Participates in a real `<form>` through
 * ElementInternals via the shared {@link CpBooleanControl}: submits `on` under
 * `name` only while checked and emits a bubbling+composed `cp-change` carrying
 * `detail.checked`. The thumb slide honours `prefers-reduced-motion`.
 */
let CpSwitch = class CpSwitch extends CpBooleanControl {
    constructor() {
        super(...arguments);
        /** Flips the checked state and republishes the change. */
        this.toggle = () => {
            if (this.disabled) {
                return;
            }
            this.checked = !this.checked;
            this.emitChange();
        };
    }
    static { this.styles = css `
    :host {
      display: block;
    }

    .field {
      display: inline-flex;
      align-items: center;
      gap: var(--cp-spacing-sm, 1rem);
      font-size: 0.875rem;
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
    }

    .track {
      position: relative;
      display: inline-flex;
      align-items: center;
      width: 2.75rem;
      height: 1.5rem;
      flex: 0 0 auto;
      padding: 0;
      border: 1px solid var(--cb, hsl(0 0% 55%));
      border-radius: 999px;
      background: var(--cp-color-surface, hsl(0 0% 98%));
      cursor: pointer;
      transition: background var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1)),
        border-color var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1));
    }

    .track[aria-checked='true'] {
      background: var(--cp-color-accent, hsl(12 80% 45%));
      border-color: var(--cp-color-accent, hsl(12 80% 45%));
    }

    .track:focus-visible {
      outline: 2px solid var(--cp-color-accent, hsl(12 80% 45%));
      outline-offset: 2px;
    }

    .track:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .thumb {
      position: absolute;
      left: 0.1875rem;
      width: 1.125rem;
      height: 1.125rem;
      border-radius: 50%;
      background: var(--cp-color-on-accent, #fff);
      box-shadow: var(--cp-shadow-sm, 0 1px 2px hsl(0 0% 0% / 0.2));
      transition: transform var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1));
    }

    .track[aria-checked='true'] .thumb {
      transform: translateX(1.25rem);
    }

    @media (prefers-reduced-motion: reduce) {
      .track,
      .thumb {
        transition: none;
      }
    }
  `; }
    render() {
        return html `
      <span class="field" part="field">
        <button
          id=${BOOLEAN_CONTROL_ID}
          class="track"
          part="track"
          type="button"
          role="switch"
          aria-checked=${this.checked ? 'true' : 'false'}
          aria-labelledby=${LABEL_ID}
          aria-describedby=${this.describedby ? this.describedby : nothing}
          ?disabled=${this.disabled}
          @click=${this.toggle}
        >
          <span class="thumb" part="thumb"></span>
        </button>
        <span id=${LABEL_ID} class="label" part="label">${this.label}</span>
      </span>
    `;
    }
};
CpSwitch = __decorate([
    customElement('cp-switch')
], CpSwitch);
export { CpSwitch };
//# sourceMappingURL=cp-switch.js.map