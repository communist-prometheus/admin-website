var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
/** Per-instance id source so each tip has a stable, unique `aria-describedby` target. */
let tooltipCounter = 0;
/**
 * Descriptive tooltip (R4/R7, design.md §5). Wraps a slotted trigger and reveals
 * an absolutely-positioned tip (`role="tooltip"`, `part="tip"`) on hover/focus.
 * Visibility is CSS-driven via `:host(:hover)` / `:host(:focus-within)` so there
 * is no JS timer to leak, and it works for keyboard focus out of the box. The
 * trigger is tied to the tip with `aria-describedby` for assistive tech.
 */
let CpTooltip = class CpTooltip extends LitElement {
    constructor() {
        super(...arguments);
        /** Tooltip text shown in the tip. */
        this.text = '';
        /** Which side of the trigger the tip appears on. */
        this.placement = 'top';
        this.tipId = `cp-tooltip-${(tooltipCounter += 1)}`;
    }
    static { this.styles = css `
    :host {
      position: relative;
      display: inline-flex;
    }

    .tip {
      position: absolute;
      z-index: 1;
      max-width: 16rem;
      width: max-content;
      padding: var(--cp-spacing-xs, 0.5rem) var(--cp-spacing-sm, 1rem);
      background: var(--cp-color-surface-elevated, hsl(0 0% 100%));
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
      border: 1px solid var(--cp-color-border, hsl(0 0% 88%));
      border-radius: var(--cp-radius-sm, 0.5rem);
      box-shadow: var(--cp-shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1));
      font-family: inherit;
      font-size: 0.875rem;
      line-height: 1.35;
      /* Hidden until hover/focus; removed from the a11y/pointer tree when hidden. */
      visibility: hidden;
      opacity: 0;
      pointer-events: none;
      transition: opacity var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1)),
        visibility var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1));
    }

    :host(:hover) .tip,
    :host(:focus-within) .tip {
      visibility: visible;
      opacity: 1;
    }

    .tip.top {
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-bottom: var(--cp-spacing-xs, 0.5rem);
    }

    .tip.bottom {
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      margin-top: var(--cp-spacing-xs, 0.5rem);
    }

    .tip.left {
      right: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-right: var(--cp-spacing-xs, 0.5rem);
    }

    .tip.right {
      left: 100%;
      top: 50%;
      transform: translateY(-50%);
      margin-left: var(--cp-spacing-xs, 0.5rem);
    }

    @media (prefers-reduced-motion: reduce) {
      .tip {
        transition: none;
      }
    }
  `; }
    connectedCallback() {
        super.connectedCallback();
        // Tie the (light-DOM) trigger to the tip for assistive tech.
        this.setAttribute('aria-describedby', this.tipId);
    }
    render() {
        return html `
      <slot></slot>
      <span id=${this.tipId} class="tip ${this.placement}" role="tooltip" part="tip">
        ${this.text}
      </span>
    `;
    }
};
__decorate([
    property({ type: String })
], CpTooltip.prototype, "text", void 0);
__decorate([
    property({ type: String })
], CpTooltip.prototype, "placement", void 0);
CpTooltip = __decorate([
    customElement('cp-tooltip')
], CpTooltip);
export { CpTooltip };
//# sourceMappingURL=cp-tooltip.js.map