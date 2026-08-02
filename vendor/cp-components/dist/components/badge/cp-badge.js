var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
/**
 * Small count badge (R4, design.md §5). Renders a numeric `count` inside a
 * filled, rounded pill; when `count <= 0` it renders nothing so callers can bind
 * a live count without conditionally templating the element away. The `tone`
 * selects the fill colour; text stays on-accent/white for contrast.
 */
let CpBadge = class CpBadge extends LitElement {
    constructor() {
        super(...arguments);
        /** The number to display; values <= 0 render nothing. */
        this.count = 0;
        /** Fill colour tone. */
        this.tone = 'danger';
    }
    static { this.styles = css `
    :host {
      display: inline-flex;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 1.25rem;
      height: 1.25rem;
      padding: 0 var(--cp-spacing-xs, 0.5rem);
      box-sizing: border-box;
      border-radius: var(--cp-radius-lg, 999px);
      font-family: inherit;
      font-size: 0.75rem;
      font-weight: 700;
      line-height: 1;
      color: var(--cp-color-on-accent, #fff);
    }

    .danger {
      background: var(--cp-color-danger, hsl(0 70% 45%));
    }

    .info {
      background: var(--cp-color-info, hsl(210 80% 45%));
    }

    .success {
      background: var(--cp-color-success, hsl(140 55% 35%));
    }

    .warning {
      background: var(--cp-color-warning, hsl(40 90% 40%));
    }

    .neutral {
      background: var(--cp-color-text-secondary, hsl(0 0% 40%));
    }
  `; }
    render() {
        if (this.count <= 0) {
            return nothing;
        }
        return html `
      <span class="badge ${this.tone}" part="badge">${this.count}</span>
    `;
    }
};
__decorate([
    property({ type: Number })
], CpBadge.prototype, "count", void 0);
__decorate([
    property({ type: String })
], CpBadge.prototype, "tone", void 0);
CpBadge = __decorate([
    customElement('cp-badge')
], CpBadge);
export { CpBadge };
//# sourceMappingURL=cp-badge.js.map