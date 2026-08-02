var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import '../icon/cp-icon.js';
/**
 * Per-state icon: a distinct SHAPE so meaning is never carried by colour alone
 * (R4, NFR-5, design.md §5). Success reads as a check, danger as a cross, etc.,
 * which survives greyscale, colour-blindness and forced-colours modes.
 */
const stateIcons = {
    success: 'check',
    warning: 'warning',
    info: 'chevron-right',
    danger: 'x',
    neutral: 'dash',
};
/**
 * Status indicator that never encodes meaning by colour alone (R4, NFR-5,
 * design.md §5). Every status renders THREE redundant cues: a colored dot
 * (`part="dot"`), a state-specific SHAPE via `<cp-icon>` (`part="icon"`), and a
 * text `label` (`part="label"`). Removing colour still leaves the shape and the
 * words, satisfying WCAG 1.4.1 (Use of Color).
 */
let CpStatus = class CpStatus extends LitElement {
    constructor() {
        super(...arguments);
        /** Semantic tone; drives the dot colour and the redundant icon shape. */
        this.state = 'neutral';
        /** Human-readable status text rendered alongside the visual cues. */
        this.label = '';
    }
    static { this.styles = css `
    :host {
      display: inline-flex;
      align-items: center;
      gap: var(--cp-spacing-xs, 0.5rem);
      font-family: inherit;
      font-size: inherit;
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
    }

    .success {
      --tone: var(--cp-color-success, hsl(140 55% 35%));
    }

    .warning {
      --tone: var(--cp-color-warning, hsl(40 90% 40%));
    }

    .info {
      --tone: var(--cp-color-info, hsl(210 80% 45%));
    }

    .danger {
      --tone: var(--cp-color-danger, hsl(0 70% 45%));
    }

    .neutral {
      --tone: var(--cp-color-text-secondary, hsl(0 0% 40%));
    }

    .indicator {
      display: inline-flex;
      align-items: center;
      gap: var(--cp-spacing-xs, 0.5rem);
    }

    .dot {
      width: 0.625rem;
      height: 0.625rem;
      border-radius: 50%;
      background: var(--tone);
      flex: none;
    }

    cp-icon {
      color: var(--tone);
    }

    .label {
      color: inherit;
    }
  `; }
    render() {
        return html `
      <span class="indicator ${this.state}" part="indicator">
        <span class="dot" part="dot" aria-hidden="true"></span>
        <cp-icon
          name=${stateIcons[this.state]}
          size="16"
          part="icon"
        ></cp-icon>
        <span class="label" part="label">${this.label}</span>
      </span>
    `;
    }
};
__decorate([
    property({ type: String })
], CpStatus.prototype, "state", void 0);
__decorate([
    property({ type: String })
], CpStatus.prototype, "label", void 0);
CpStatus = __decorate([
    customElement('cp-status')
], CpStatus);
export { CpStatus };
//# sourceMappingURL=cp-status.js.map