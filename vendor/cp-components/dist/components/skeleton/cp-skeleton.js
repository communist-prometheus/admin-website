var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
/**
 * Loading skeleton (R5/NFR-2, design.md §5). Renders one or more shimmering
 * placeholder shapes (`part="block"`) while real content loads. The `text`
 * variant draws `lines` stacked bars (the last one shortened); the `block`
 * variant draws a single tall block. The shimmer runs on `transform`/background
 * only and is disabled under `prefers-reduced-motion: reduce`, leaving a static
 * placeholder.
 *
 * The shapes are decorative (`aria-hidden="true"`); a visually-hidden
 * `role="status"` "Loading" node carries the accessible announcement.
 */
let CpSkeleton = class CpSkeleton extends LitElement {
    constructor() {
        super(...arguments);
        /** Number of placeholder lines in the `text` variant (ignored for `block`). */
        this.lines = 1;
        /** Placeholder geometry. */
        this.variant = 'text';
    }
    static { this.styles = css `
    :host {
      display: block;
    }

    .shape {
      display: block;
      border-radius: var(--cp-radius-sm, 0.5rem);
      background: linear-gradient(
        90deg,
        var(--cp-color-border, hsl(0 0% 88%)) 25%,
        var(--cp-color-surface, hsl(0 0% 98%)) 37%,
        var(--cp-color-border, hsl(0 0% 88%)) 63%
      );
      background-size: 400% 100%;
      animation: cp-skeleton-shimmer 1.4s ease infinite;
    }

    .text {
      height: 0.85rem;
    }

    .text:not(:last-of-type) {
      margin-block-end: var(--cp-spacing-xs, 0.5rem);
    }

    .text:last-of-type {
      width: 60%;
    }

    .block {
      height: 8rem;
    }

    @keyframes cp-skeleton-shimmer {
      0% {
        background-position: 100% 0;
      }
      100% {
        background-position: 0 0;
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .shape {
        animation: none;
      }
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0 0 0 0);
      white-space: nowrap;
      border: 0;
    }
  `; }
    render() {
        const count = this.variant === 'block' ? 1 : Math.max(1, this.lines);
        return html `
      <span class="sr-only" role="status">Loading</span>
      ${Array.from({ length: count }, () => html `<span
            class="shape ${this.variant}"
            part="block"
            aria-hidden="true"
          ></span>`)}
    `;
    }
};
__decorate([
    property({ type: Number })
], CpSkeleton.prototype, "lines", void 0);
__decorate([
    property({ type: String })
], CpSkeleton.prototype, "variant", void 0);
CpSkeleton = __decorate([
    customElement('cp-skeleton')
], CpSkeleton);
export { CpSkeleton };
//# sourceMappingURL=cp-skeleton.js.map