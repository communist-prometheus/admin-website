var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css, svg, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { unsafeSVG } from 'lit/directives/unsafe-svg.js';
import { icons } from '../../icons/registry.js';
/**
 * Decorative inline-SVG icon (R3, design.md §6). Renders a registered 24×24
 * `currentColor` icon; unknown names render nothing and warn. `aria-hidden`
 * always — the accessible name comes from the labelling control that wraps it.
 */
let CpIcon = class CpIcon extends LitElement {
    constructor() {
        super(...arguments);
        /** Registered icon name (see the icon registry). */
        this.name = '';
        /** Rendered size in px; also settable via `--cp-icon-size`. */
        this.size = 24;
    }
    static { this.styles = css `
    :host {
      display: inline-flex;
      line-height: 0;
    }
    svg {
      width: var(--cp-icon-size, 1.5rem);
      height: var(--cp-icon-size, 1.5rem);
    }
  `; }
    render() {
        const markup = this.name === '' ? undefined : icons[this.name];
        if (markup === undefined) {
            this.name === '' || console.warn(`cp-icon: unknown icon "${this.name}"`);
            return nothing;
        }
        return html `<svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      aria-hidden="true"
      focusable="false"
      style="--cp-icon-size:${this.size}px"
      part="svg"
    >
      ${svg `${unsafeSVG(markup)}`}
    </svg>`;
    }
};
__decorate([
    property({ type: String })
], CpIcon.prototype, "name", void 0);
__decorate([
    property({ type: Number })
], CpIcon.prototype, "size", void 0);
CpIcon = __decorate([
    customElement('cp-icon')
], CpIcon);
export { CpIcon };
//# sourceMappingURL=cp-icon.js.map