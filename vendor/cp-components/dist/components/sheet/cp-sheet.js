var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { html, css, nothing } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { CpOverlay } from '../common/cp-overlay.js';
import '../icon/cp-icon.js';
/** Stable id linking the heading to the sheet's `aria-labelledby`. */
const HEADING_ID = 'cp-sheet-heading';
/**
 * Bottom sheet (R4/R7, design.md §5) for mobile-first surfaces. Slides a
 * `role="dialog"` / `aria-modal="true"` panel (`part="panel"`) up from the bottom
 * edge over a dimmed backdrop (`part="backdrop"`), labelled by its `heading`
 * (`part="heading"`). Content is composed through the default slot; a grab handle
 * signals the affordance without carrying meaning by shape alone.
 *
 * Emits the bubbling, composed `cp-close` from `Esc`, a backdrop click or the
 * header close button. Focus is trapped inside the panel and restored to the
 * invoking element on close (see {@link CpOverlay}).
 */
let CpSheet = class CpSheet extends CpOverlay {
    constructor() {
        super(...arguments);
        /** Heading text; also the sheet's accessible name via `aria-labelledby`. */
        this.heading = '';
        this.handleClose = () => {
            this.emitDismiss();
        };
    }
    static { this.styles = css `
    :host {
      display: contents;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      background: rgb(0 0 0 / 0.5);
      z-index: 1000;
      animation: cp-sheet-backdrop-in
        var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1)) both;
    }

    .panel {
      display: flex;
      flex-direction: column;
      gap: var(--cp-spacing-sm, 1rem);
      width: min(40rem, 100%);
      max-height: 85vh;
      padding: var(--cp-spacing-md, 1.5rem) var(--cp-spacing-lg, 2rem)
        var(--cp-spacing-lg, 2rem);
      background: var(--cp-color-surface-elevated, hsl(0 0% 100%));
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
      border-radius: var(--cp-radius-lg, 1rem) var(--cp-radius-lg, 1rem) 0 0;
      box-shadow: var(--cp-shadow-lg, 0 -20px 25px -5px rgb(0 0 0 / 0.2));
      overflow-y: auto;
      animation: cp-sheet-in
        var(--cp-transition-base, 250ms cubic-bezier(0.4, 0, 0.2, 1)) both;
    }

    .panel:focus-visible {
      outline: 2px solid var(--cp-color-accent, hsl(12 80% 45%));
      outline-offset: -2px;
    }

    .grab {
      align-self: center;
      width: 2.5rem;
      height: 0.25rem;
      border-radius: 999px;
      background: var(--cp-color-border, hsl(0 0% 82%));
    }

    .head {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: var(--cp-spacing-sm, 1rem);
    }

    .heading {
      margin: 0;
      font-size: var(--cp-fs-h1-section, 1.5rem);
      font-weight: 700;
      line-height: 1.2;
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
      transition: background
        var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1));
    }

    .close:hover {
      background: var(--cp-color-surface, hsl(0 0% 96%));
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
    }

    .close:focus-visible {
      outline: 2px solid var(--cp-color-accent, hsl(12 80% 45%));
      outline-offset: 2px;
    }

    .body {
      flex: 1 1 auto;
      min-height: 0;
      line-height: 1.5;
    }

    /* Dim in via the backdrop's own background alpha, never opacity: an
       opacity fade on this container would composite the panel's text through
       it and sink contrast mid-animation. */
    @keyframes cp-sheet-backdrop-in {
      from {
        background-color: rgb(0 0 0 / 0);
      }
      to {
        background-color: rgb(0 0 0 / 0.5);
      }
    }

    @keyframes cp-sheet-in {
      from {
        transform: translateY(100%);
      }
      to {
        transform: translateY(0);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .backdrop,
      .panel,
      .close {
        animation: none;
        transition: none;
      }
    }
  `; }
    get panel() {
        const found = this.renderRoot.querySelector('.panel');
        return found instanceof HTMLElement ? found : undefined;
    }
    emitDismiss() {
        this.dispatchEvent(new CustomEvent('cp-close', { bubbles: true, composed: true }));
    }
    render() {
        if (!this.open) {
            return nothing;
        }
        return html `
      <div
        class="backdrop"
        part="backdrop"
        @click=${this.handleBackdrop}
        @keydown=${this.handleKeydown}
      >
        <div
          class="panel"
          part="panel"
          role="dialog"
          aria-modal="true"
          aria-labelledby=${HEADING_ID}
          tabindex="-1"
        >
          <span class="grab" part="grab" aria-hidden="true"></span>
          <header class="head">
            <h2 id=${HEADING_ID} class="heading" part="heading">
              ${this.heading}
            </h2>
            <button
              class="close"
              part="close"
              type="button"
              aria-label="Close sheet"
              @click=${this.handleClose}
            >
              <cp-icon name="x" size="20"></cp-icon>
            </button>
          </header>
          <div class="body" part="body"><slot></slot></div>
        </div>
      </div>
    `;
    }
};
__decorate([
    property({ type: String })
], CpSheet.prototype, "heading", void 0);
CpSheet = __decorate([
    customElement('cp-sheet')
], CpSheet);
export { CpSheet };
//# sourceMappingURL=cp-sheet.js.map