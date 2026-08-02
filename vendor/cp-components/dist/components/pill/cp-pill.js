var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement } from 'lit/decorators.js';
/**
 * Solid-fill category/topic pill (R4, design.md §5). The site's filled uppercase
 * pill: a solid accent block whose slotted content is the label. Purely
 * presentational and non-interactive. Consumers recolour a single instance by
 * setting the local `--tc` (fill) and `--tc-fg` (foreground) properties inline —
 * the fill falls back to the accent bridge token, so an un-overridden pill still
 * themes and flips with light/dark.
 */
let CpPill = class CpPill extends LitElement {
    static { this.styles = css `
    :host {
      display: inline-flex;
    }

    .pill {
      display: inline-flex;
      align-items: center;
      background: var(--tc, var(--cp-color-accent, hsl(12 80% 45%)));
      color: var(--tc-fg, var(--cp-color-on-accent, #fff));
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.02em;
      padding: var(--cp-spacing-xs, 0.5rem) var(--cp-spacing-sm, 1rem);
      border-radius: var(--cp-radius-sm, 0.5rem);
      font-family: inherit;
      font-size: inherit;
      line-height: 1;
    }
  `; }
    render() {
        return html `<span class="pill" part="pill"><slot></slot></span>`;
    }
};
CpPill = __decorate([
    customElement('cp-pill')
], CpPill);
export { CpPill };
//# sourceMappingURL=cp-pill.js.map