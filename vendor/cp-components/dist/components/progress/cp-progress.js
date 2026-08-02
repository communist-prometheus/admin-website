var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement, html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
/** Clamps a raw progress value into the inclusive 0..1 range. */
const clamp01 = (value) => Math.min(1, Math.max(0, value));
/**
 * Progress bar (R5/NFR-2, design.md §5). Two modes on one `role="progressbar"`:
 *
 * - Determinate: a `part="track"` holding a `part="bar"` whose width is
 *   `value * 100%`, exposing `aria-valuenow/min/max` (0..1).
 * - Indeterminate: an animated bar that slides across the track with NO
 *   `aria-valuenow`, so assistive tech announces an unknown-length operation.
 *
 * The bar is filled with `--cp-color-accent`. The indeterminate animation (and
 * the determinate width transition) is disabled under
 * `prefers-reduced-motion: reduce`, leaving a static bar.
 */
let CpProgress = class CpProgress extends LitElement {
    constructor() {
        super(...arguments);
        /** Completion ratio in the inclusive 0..1 range (determinate mode). */
        this.value = 0;
        /** When set, renders an animated unknown-length bar with no `aria-valuenow`. */
        this.indeterminate = false;
        /** Accessible name for the progress bar. */
        this.label = '';
    }
    static { this.styles = css `
    :host {
      display: block;
    }

    .track {
      position: relative;
      width: 100%;
      height: 0.5rem;
      background: var(--cp-color-border, hsl(0 0% 88%));
      border-radius: var(--cp-radius-lg, 999px);
      overflow: hidden;
    }

    .bar {
      height: 100%;
      background: var(--cp-color-accent, hsl(12 80% 45%));
      border-radius: inherit;
      transition: width var(--cp-transition-base, 300ms cubic-bezier(0.4, 0, 0.2, 1));
    }

    .bar.indeterminate {
      width: 40%;
      animation: cp-progress-slide 1.5s ease-in-out infinite;
    }

    @keyframes cp-progress-slide {
      0% {
        transform: translateX(-110%);
      }
      100% {
        transform: translateX(360%);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .bar {
        transition: none;
      }
      .bar.indeterminate {
        animation: none;
      }
    }
  `; }
    render() {
        const clamped = clamp01(this.value);
        return html `
      <div
        class="track"
        part="track"
        role="progressbar"
        aria-label=${this.label || nothing}
        aria-valuemin=${this.indeterminate ? nothing : 0}
        aria-valuemax=${this.indeterminate ? nothing : 1}
        aria-valuenow=${this.indeterminate ? nothing : clamped}
      >
        <div
          class="bar ${this.indeterminate ? 'indeterminate' : ''}"
          part="bar"
          style=${this.indeterminate ? nothing : `width:${clamped * 100}%`}
        ></div>
      </div>
    `;
    }
};
__decorate([
    property({ type: Number })
], CpProgress.prototype, "value", void 0);
__decorate([
    property({ type: Boolean })
], CpProgress.prototype, "indeterminate", void 0);
__decorate([
    property({ type: String })
], CpProgress.prototype, "label", void 0);
CpProgress = __decorate([
    customElement('cp-progress')
], CpProgress);
export { CpProgress };
//# sourceMappingURL=cp-progress.js.map