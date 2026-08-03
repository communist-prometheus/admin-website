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
 * Per-tone icon: a distinct SHAPE so meaning is never carried by colour alone
 * (R4/R5, NFR-5, design.md §5). Survives greyscale, colour-blindness and
 * forced-colours modes.
 */
const toneIcons = {
    success: 'check',
    warning: 'warning',
    info: 'chevron-right',
    danger: 'x',
    neutral: 'dash',
};
/**
 * Tones that carry urgency and must interrupt assistive tech via `role="alert"`;
 * the rest announce politely via `role="status"` (R4/R5, design.md §5).
 */
const assertiveTones = new Set([
    'warning',
    'danger',
]);
/**
 * Full-width inline banner (R4/R5, design.md §5). Distinct from the transient
 * `cp-toast`: it is a persistent surface (`part="banner"`) for page- or
 * section-level messages. Renders a tinted leading icon-circle (`part="icon"`,
 * tone `-bg` fill + tone `<cp-icon>`), a `title` (`part="title"`) with a
 * default-slot description (`part="description"`), and a right-aligned `action`
 * slot (`part="action"`). Announcement politeness follows the tone: polite
 * `role="status"` for success/info/neutral, interrupting `role="alert"` for
 * warning/danger.
 */
let CpBanner = class CpBanner extends LitElement {
    constructor() {
        super(...arguments);
        /** Semantic tone; drives the tint and the redundant icon shape. */
        this.tone = 'info';
        /** The banner heading. */
        this.title = '';
    }
    static { this.styles = css `
    :host {
      display: block;
    }

    .banner {
      display: flex;
      align-items: flex-start;
      gap: var(--cp-spacing-md, 1.5rem);
      width: 100%;
      box-sizing: border-box;
      padding: var(--cp-spacing-md, 1.5rem);
      background: var(--tone-bg);
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
      border: 1px solid var(--tone);
      border-radius: var(--cp-radius-md, 0.75rem);
      font-family: inherit;
      font-size: inherit;
      line-height: 1.45;
    }

    .success {
      --tone: var(--cp-color-success, hsl(140 55% 35%));
      --tone-bg: var(--cp-color-success-bg, hsl(140 55% 95%));
    }

    .warning {
      --tone: var(--cp-color-warning, hsl(40 90% 40%));
      --tone-bg: var(--cp-color-warning-bg, hsl(40 90% 93%));
    }

    .info {
      --tone: var(--cp-color-info, hsl(210 80% 45%));
      --tone-bg: var(--cp-color-info-bg, hsl(210 80% 95%));
    }

    .danger {
      --tone: var(--cp-color-danger, hsl(0 70% 45%));
      --tone-bg: var(--cp-color-danger-bg, hsl(0 70% 95%));
    }

    .neutral {
      --tone: var(--cp-color-text-secondary, hsl(0 0% 40%));
      --tone-bg: var(--cp-color-surface, hsl(0 0% 98%));
    }

    .icon-circle {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      width: 2.5rem;
      height: 2.5rem;
      border-radius: 50%;
      background: var(--tone-bg);
      border: 1px solid var(--tone);
      color: var(--tone);
    }

    .body {
      flex: 1 1 auto;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: var(--cp-spacing-xs, 0.5rem);
    }

    .title {
      font-weight: 700;
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
    }

    .description {
      color: var(--cp-color-text-secondary, hsl(0 0% 40%));
    }

    .action {
      flex: none;
      display: inline-flex;
      align-items: center;
      gap: var(--cp-spacing-xs, 0.5rem);
      margin-left: auto;
    }
  `; }
    render() {
        const role = assertiveTones.has(this.tone) ? 'alert' : 'status';
        const live = assertiveTones.has(this.tone) ? 'assertive' : 'polite';
        return html `
      <div
        class="banner ${this.tone}"
        part="banner"
        role=${role}
        aria-live=${live}
      >
        <span class="icon-circle" part="icon">
          <cp-icon name=${toneIcons[this.tone]} size="20"></cp-icon>
        </span>
        <div class="body">
          ${this.title === ''
            ? nothing
            : html `<span class="title" part="title">${this.title}</span>`}
          <p class="description" part="description"><slot></slot></p>
        </div>
        <span class="action" part="action">
          <slot name="action"></slot>
        </span>
      </div>
    `;
    }
};
__decorate([
    property({ type: String })
], CpBanner.prototype, "tone", void 0);
__decorate([
    property({ type: String })
], CpBanner.prototype, "title", void 0);
CpBanner = __decorate([
    customElement('cp-banner')
], CpBanner);
export { CpBanner };
//# sourceMappingURL=cp-banner.js.map