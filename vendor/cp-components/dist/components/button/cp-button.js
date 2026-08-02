var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../icon/cp-icon.js';
/**
 * Button primitive (R4, design.md §5). Variants primary/secondary/ghost, sizes
 * sm/md/lg, with the site's primary treatment (solid accent + optional trailing
 * `→`). `loading` shows a spinner and blocks interaction; `pressed` reflects a
 * toggle state via `aria-pressed` (used by the 3-way-merge "take" controls).
 */
let CpButton = class CpButton extends LitElement {
    constructor() {
        super(...arguments);
        /** Visual variant. */
        this.variant = 'primary';
        /** Size. */
        this.size = 'md';
        /** Disables the button. */
        this.disabled = false;
        /** Shows a spinner and blocks interaction while an action is in flight. */
        this.loading = false;
        /** Renders the site's trailing `→` after the label. */
        this.arrow = false;
        /** Toggle state; reflected as `aria-pressed`. */
        this.pressed = false;
        /** Native button type. */
        this.type = 'button';
        this.handleClick = (event) => {
            if (this.disabled || this.loading) {
                event.preventDefault();
                event.stopPropagation();
                return;
            }
            this.dispatchEvent(new CustomEvent('cp-click', {
                bubbles: true,
                composed: true,
                detail: { originalEvent: event },
            }));
        };
    }
    static { this.styles = css `
    :host {
      display: inline-block;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--cp-spacing-xs, 0.5rem);
      padding: var(--cp-spacing-sm, 1rem) var(--cp-spacing-md, 1.5rem);
      border: none;
      border-radius: var(--cp-radius-sm, 0.5rem);
      font-family: inherit;
      font-size: inherit;
      font-weight: 600;
      cursor: pointer;
      transition: background var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1));
      text-decoration: none;
    }

    button:focus-visible {
      outline: 2px solid var(--cp-color-accent, hsl(12 80% 45%));
      outline-offset: 2px;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .primary {
      background: var(--cp-color-accent, hsl(12 80% 45%));
      color: var(--cp-color-on-accent, #fff);
    }

    .primary:hover:not(:disabled) {
      background: var(--cp-color-accent-hover, hsl(12 80% 38%));
    }

    .secondary {
      background: var(--cp-color-surface, hsl(0 0% 98%));
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
      border: 1px solid var(--cp-color-border, hsl(0 0% 88%));
    }

    .secondary:hover:not(:disabled),
    .ghost:hover:not(:disabled) {
      background: var(--cp-color-surface, hsl(0 0% 98%));
      filter: brightness(0.97);
    }

    .ghost {
      background: transparent;
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
    }

    button[aria-pressed='true'] {
      box-shadow: inset 0 0 0 2px var(--cp-color-accent, hsl(12 80% 45%));
    }

    .sm {
      padding: calc(var(--cp-spacing-xs, 0.5rem) * 0.75) var(--cp-spacing-sm, 1rem);
      font-size: 0.875rem;
    }

    .lg {
      padding: var(--cp-spacing-md, 1.5rem) var(--cp-spacing-lg, 2rem);
      font-size: 1.125rem;
    }

    .spinner {
      width: 1em;
      height: 1em;
      border: 2px solid currentColor;
      border-right-color: transparent;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }

    @media (prefers-reduced-motion: reduce) {
      .spinner {
        animation: none;
      }
    }

    @keyframes spin {
      to {
        transform: rotate(360deg);
      }
    }
  `; }
    render() {
        return html `
      <button
        class="${this.variant} ${this.size}"
        ?disabled=${this.disabled || this.loading}
        aria-busy=${this.loading ? 'true' : nothing}
        aria-pressed=${this.pressed ? 'true' : nothing}
        type=${this.type}
        @click=${this.handleClick}
        part="button"
      >
        ${this.loading
            ? html `<span class="spinner" part="spinner" aria-hidden="true"></span>`
            : nothing}
        <slot></slot>
        ${this.arrow
            ? html `<cp-icon name="arrow-right" size="18" part="arrow"></cp-icon>`
            : nothing}
      </button>
    `;
    }
};
__decorate([
    property({ type: String })
], CpButton.prototype, "variant", void 0);
__decorate([
    property({ type: String })
], CpButton.prototype, "size", void 0);
__decorate([
    property({ type: Boolean })
], CpButton.prototype, "disabled", void 0);
__decorate([
    property({ type: Boolean })
], CpButton.prototype, "loading", void 0);
__decorate([
    property({ type: Boolean })
], CpButton.prototype, "arrow", void 0);
__decorate([
    property({ type: Boolean })
], CpButton.prototype, "pressed", void 0);
__decorate([
    property({ type: String })
], CpButton.prototype, "type", void 0);
CpButton = __decorate([
    customElement('cp-button')
], CpButton);
export { CpButton };
//# sourceMappingURL=cp-button.js.map