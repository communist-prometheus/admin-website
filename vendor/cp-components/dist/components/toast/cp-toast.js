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
 * Transient toast notification (R4/R5, design.md §5). Renders a tinted card
 * (`part="toast"`) with a leading tone `<cp-icon>` (`part="icon"`), the
 * `message` (`part="message"`), an optional `action` slot, and a labelled close
 * icon-button (`part="close"`) that emits the bubbling, composed `cp-dismiss`
 * event. Announcement politeness follows the tone: polite `role="status"` for
 * success/info/neutral, interrupting `role="alert"` for warning/danger.
 *
 * When `duration > 0` the toast auto-emits `cp-dismiss` after the delay via a
 * timer armed in `connectedCallback` and cleared in `disconnectedCallback`;
 * `duration = 0` makes it persist. Enter/leave use a GPU-friendly
 * transform/opacity transition that is disabled under `prefers-reduced-motion`.
 */
let CpToast = class CpToast extends LitElement {
    constructor() {
        super(...arguments);
        /** Semantic tone; drives the tint, the redundant icon shape and politeness. */
        this.tone = 'info';
        /** The notification text. */
        this.message = '';
        /** Auto-dismiss delay in ms; `0` persists until the user closes it. */
        this.duration = 4000;
        /** Emits the bubbling, composed `cp-dismiss` and marks the toast leaving. */
        this.dismiss = () => {
            this.clearTimer();
            this.classList.add('leaving');
            this.dispatchEvent(new CustomEvent('cp-dismiss', { bubbles: true, composed: true }));
        };
    }
    static { this.styles = css `
    :host {
      display: block;
      animation: cp-toast-in var(--cp-transition-base, 250ms cubic-bezier(0.4, 0, 0.2, 1)) both;
    }

    :host(.leaving) {
      opacity: 0;
      transform: translateY(-0.5rem);
      transition: opacity var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1)),
        transform var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1));
    }

    .toast {
      display: flex;
      align-items: center;
      gap: var(--cp-spacing-sm, 1rem);
      padding: var(--cp-spacing-sm, 1rem) var(--cp-spacing-md, 1.5rem);
      background: var(--tone-bg);
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
      border: 1px solid var(--tone);
      border-radius: var(--cp-radius-md, 0.75rem);
      box-shadow: var(--cp-shadow-md, 0 4px 6px -1px rgb(0 0 0 / 0.1));
      font-family: inherit;
      font-size: inherit;
      line-height: 1.4;
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

    .tone-icon {
      color: var(--tone);
      flex: none;
    }

    .message {
      flex: 1 1 auto;
      min-width: 0;
    }

    ::slotted([slot='action']) {
      flex: none;
    }

    .close {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex: none;
      padding: var(--cp-spacing-xs, 0.5rem);
      margin: calc(var(--cp-spacing-xs, 0.5rem) * -1);
      background: transparent;
      border: none;
      border-radius: var(--cp-radius-sm, 0.5rem);
      color: var(--cp-color-text-secondary, hsl(0 0% 40%));
      cursor: pointer;
      transition: background var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1));
    }

    .close:hover {
      background: color-mix(in srgb, var(--tone) 12%, transparent);
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
    }

    .close:focus-visible {
      outline: 2px solid var(--cp-color-accent, hsl(12 80% 45%));
      outline-offset: 2px;
    }

    /* Slide-only enter: the toast stays fully opaque so text contrast is never
       reduced mid-animation (opacity is reserved for the leave transition). */
    @keyframes cp-toast-in {
      from {
        transform: translateY(-0.5rem);
      }
      to {
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      :host,
      :host(.leaving),
      .close {
        animation: none;
        transition: none;
      }
    }
  `; }
    connectedCallback() {
        super.connectedCallback();
        this.startTimer();
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        this.clearTimer();
    }
    /** Arms the auto-dismiss timer; a non-positive `duration` is the persist guard. */
    startTimer() {
        this.clearTimer();
        if (this.duration > 0) {
            this.timer = setTimeout(this.dismiss, this.duration);
        }
    }
    clearTimer() {
        if (this.timer !== undefined) {
            clearTimeout(this.timer);
            this.timer = undefined;
        }
    }
    render() {
        const role = assertiveTones.has(this.tone) ? 'alert' : 'status';
        const live = assertiveTones.has(this.tone) ? 'assertive' : 'polite';
        return html `
      <div
        class="toast ${this.tone}"
        part="toast"
        role=${role}
        aria-live=${live}
      >
        <cp-icon
          class="tone-icon"
          name=${toneIcons[this.tone]}
          size="20"
          part="icon"
        ></cp-icon>
        <span class="message" part="message">${this.message}</span>
        <slot name="action"></slot>
        <button
          class="close"
          part="close"
          type="button"
          aria-label="Dismiss notification"
          @click=${this.dismiss}
        >
          <cp-icon name="x" size="18"></cp-icon>
        </button>
      </div>
    `;
    }
};
__decorate([
    property({ type: String })
], CpToast.prototype, "tone", void 0);
__decorate([
    property({ type: String })
], CpToast.prototype, "message", void 0);
__decorate([
    property({ type: Number })
], CpToast.prototype, "duration", void 0);
CpToast = __decorate([
    customElement('cp-toast')
], CpToast);
export { CpToast };
//# sourceMappingURL=cp-toast.js.map