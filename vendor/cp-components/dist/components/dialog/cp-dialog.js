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
/** Stable id linking the heading to the dialog's `aria-labelledby`. */
const HEADING_ID = 'cp-dialog-heading';
/**
 * Modal confirmation dialog (R4/R7, design.md §5). Renders a dimmed backdrop
 * (`part="backdrop"`) behind a centered, `role="dialog"` / `aria-modal="true"`
 * panel (`part="dialog"`) labelled by its `heading` (`part="heading"`). A default
 * body slot and a `footer` slot compose the content; the footer's fallback
 * supplies a Cancel/confirm affordance so a standalone dialog is usable.
 *
 * Emits the bubbling, composed `cp-cancel` from `Esc`, a backdrop click or the
 * header close button, and `cp-confirm` from the confirm affordance. While `busy`
 * (an action in flight) `Esc` and backdrop dismissal are suppressed. `tone`
 * `"danger"` recolours the heading and confirm accent. Focus is trapped inside
 * the panel and restored to the invoking element on close (see {@link CpOverlay}).
 */
let CpDialog = class CpDialog extends CpOverlay {
    constructor() {
        super(...arguments);
        /** Heading text; also the dialog's accessible name via `aria-labelledby`. */
        this.heading = '';
        /** Accent tone; `danger` recolours the heading and confirm action. */
        this.tone = 'default';
        /** Marks an action in flight; suppresses `Esc`/backdrop dismissal. */
        this.busy = false;
        this.handleClose = () => {
            this.emit('cp-cancel');
        };
        this.handleConfirm = () => {
            this.emit('cp-confirm');
        };
    }
    static { this.styles = css `
    :host {
      display: contents;
    }

    .backdrop {
      position: fixed;
      inset: 0;
      display: grid;
      place-items: center;
      padding: var(--cp-spacing-md, 1.5rem);
      background: rgb(0 0 0 / 0.5);
      z-index: 1000;
      animation: cp-dialog-backdrop-in
        var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1)) both;
    }

    .dialog {
      display: flex;
      flex-direction: column;
      gap: var(--cp-spacing-md, 1.5rem);
      width: min(32rem, 100%);
      max-height: min(85vh, 100%);
      padding: var(--cp-spacing-lg, 2rem);
      background: var(--cp-color-surface-elevated, hsl(0 0% 100%));
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
      border-radius: var(--cp-radius-lg, 1rem);
      box-shadow: var(--cp-shadow-lg, 0 20px 25px -5px rgb(0 0 0 / 0.2));
      animation: cp-dialog-in
        var(--cp-transition-base, 250ms cubic-bezier(0.4, 0, 0.2, 1)) both;
    }

    .dialog:focus-visible {
      outline: 2px solid var(--cp-color-accent, hsl(12 80% 45%));
      outline-offset: 2px;
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
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
    }

    .danger .heading {
      color: var(--cp-color-danger, hsl(0 72% 45%));
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

    .body {
      flex: 1 1 auto;
      min-height: 0;
      overflow-y: auto;
      line-height: 1.5;
    }

    .foot {
      display: flex;
      justify-content: flex-end;
      gap: var(--cp-spacing-sm, 1rem);
    }

    .btn {
      font-family: inherit;
      font-size: inherit;
      font-weight: 600;
      padding: var(--cp-spacing-sm, 0.75rem) var(--cp-spacing-md, 1.5rem);
      border: none;
      border-radius: var(--cp-radius-sm, 0.5rem);
      cursor: pointer;
      transition: background
        var(--cp-transition-fast, 150ms cubic-bezier(0.4, 0, 0.2, 1));
    }

    .btn.secondary {
      background: var(--cp-color-surface, hsl(0 0% 96%));
      color: var(--cp-color-text-primary, hsl(0 0% 13%));
      border: 1px solid var(--cp-color-border, hsl(0 0% 88%));
    }

    .btn.primary {
      background: var(--cp-color-accent, hsl(12 80% 45%));
      color: var(--cp-color-on-accent, #fff);
    }

    .danger .btn.primary {
      background: var(--cp-color-danger, hsl(0 72% 45%));
    }

    .btn:focus-visible,
    .close:focus-visible {
      outline: 2px solid var(--cp-color-accent, hsl(12 80% 45%));
      outline-offset: 2px;
    }

    /* Dim in via the backdrop's own background alpha, never opacity: an
       opacity fade on this container would composite the panel's text through
       it and sink contrast mid-animation. */
    @keyframes cp-dialog-backdrop-in {
      from {
        background-color: rgb(0 0 0 / 0);
      }
      to {
        background-color: rgb(0 0 0 / 0.5);
      }
    }

    /* Transform-only enter: the panel stays fully opaque so heading/label text
       contrast is never reduced mid-animation (opacity fades are reserved for the
       text-free backdrop). */
    @keyframes cp-dialog-in {
      from {
        transform: translateY(1rem) scale(0.98);
      }
      to {
        transform: translateY(0) scale(1);
      }
    }

    @media (prefers-reduced-motion: reduce) {
      .backdrop,
      .dialog,
      .close,
      .btn {
        animation: none;
        transition: none;
      }
    }
  `; }
    get panel() {
        const found = this.renderRoot.querySelector('.dialog');
        return found instanceof HTMLElement ? found : undefined;
    }
    mayDismiss() {
        return !this.busy;
    }
    emitDismiss() {
        this.emit('cp-cancel');
    }
    /** Dispatches a bubbling, composed dialog event. */
    emit(type) {
        this.dispatchEvent(new CustomEvent(type, { bubbles: true, composed: true }));
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
          class="dialog ${this.tone}"
          part="dialog"
          role="dialog"
          aria-modal="true"
          aria-labelledby=${HEADING_ID}
          aria-busy=${this.busy ? 'true' : nothing}
          tabindex="-1"
        >
          <header class="head">
            <h2 id=${HEADING_ID} class="heading" part="heading">
              ${this.heading}
            </h2>
            <button
              class="close"
              part="close"
              type="button"
              aria-label="Close dialog"
              @click=${this.handleClose}
            >
              <cp-icon name="x" size="20"></cp-icon>
            </button>
          </header>
          <div class="body" part="body"><slot></slot></div>
          <footer class="foot" part="footer">
            <slot name="footer">
              <button
                class="btn secondary"
                type="button"
                @click=${this.handleClose}
              >
                Cancel
              </button>
              <button
                class="btn primary"
                type="button"
                @click=${this.handleConfirm}
              >
                Confirm
              </button>
            </slot>
          </footer>
        </div>
      </div>
    `;
    }
};
__decorate([
    property({ type: String })
], CpDialog.prototype, "heading", void 0);
__decorate([
    property({ type: String })
], CpDialog.prototype, "tone", void 0);
__decorate([
    property({ type: Boolean })
], CpDialog.prototype, "busy", void 0);
CpDialog = __decorate([
    customElement('cp-dialog')
], CpDialog);
export { CpDialog };
//# sourceMappingURL=cp-dialog.js.map