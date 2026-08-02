var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
/**
 * Tinted status badge (R4, design.md §5). Distinct from the solid `cp-pill`:
 * a low-emphasis, mixed-case chip whose fill/foreground come from a semantic
 * tone pair (`--cp-color-<tone>-bg` / `--cp-color-<tone>`). `neutral` falls back
 * to the surface + secondary-text tokens. The tone maps to a class so every
 * colour resolves through the theme bridge and flips with light/dark.
 */
let CpTag = class CpTag extends LitElement {
    constructor() {
        super(...arguments);
        /** Semantic tone; selects the background/foreground token pair. */
        this.tone = 'neutral';
    }
    static { this.styles = css `
    :host {
      display: inline-flex;
    }

    .tag {
      display: inline-flex;
      align-items: center;
      font-weight: 600;
      font-size: 0.8rem;
      font-family: inherit;
      line-height: 1;
      padding: var(--cp-spacing-xs, 0.5rem);
      border-radius: var(--cp-radius-sm, 0.5rem);
    }

    .neutral {
      background: var(--cp-color-surface, hsl(0 0% 98%));
      color: var(--cp-color-text-secondary, hsl(0 0% 40%));
    }

    .success {
      background: var(--cp-color-success-bg, hsl(140 60% 92%));
      color: var(--cp-color-success, hsl(140 60% 30%));
    }

    .warning {
      background: var(--cp-color-warning-bg, hsl(40 90% 92%));
      color: var(--cp-color-warning, hsl(40 90% 32%));
    }

    .info {
      background: var(--cp-color-info-bg, hsl(210 90% 94%));
      color: var(--cp-color-info, hsl(210 90% 40%));
    }

    .danger {
      background: var(--cp-color-danger-bg, hsl(0 80% 94%));
      color: var(--cp-color-danger, hsl(0 80% 42%));
    }
  `; }
    render() {
        return html `<span class="tag ${this.tone}" part="tag"><slot></slot></span>`;
    }
};
__decorate([
    property({ type: String })
], CpTag.prototype, "tone", void 0);
CpTag = __decorate([
    customElement('cp-tag')
], CpTag);
export { CpTag };
//# sourceMappingURL=cp-tag.js.map