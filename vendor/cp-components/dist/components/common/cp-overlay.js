var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { LitElement } from 'lit';
import { property } from 'lit/decorators.js';
import { collectFocusable, deepActiveElement } from './overlay-focus.js';
/**
 * Abstract modal-overlay base (R4/R7, design.md §5). Owns the focus lifecycle
 * shared by `cp-dialog`, `cp-drawer` and `cp-sheet`: on open it remembers the
 * previously-focused element and moves focus to the first focusable inside the
 * panel (or the panel itself), traps Tab/Shift+Tab within the panel, and on close
 * restores focus to the remembered element. `Esc` and a backdrop click both
 * request dismissal (gated by {@link mayDismiss}), each raising the subclass's own
 * bubbling, composed `cp-*` close event.
 *
 * Subclasses stay purely declarative: they supply the shadow markup, expose the
 * `panel` region via {@link panel}, and translate a dismissal request into their
 * concrete event through {@link emitDismiss}, wiring {@link handleKeydown} onto
 * their overlay root and {@link handleBackdrop} onto their backdrop `part`.
 */
export class CpOverlay extends LitElement {
    constructor() {
        super(...arguments);
        /** Whether the overlay is currently shown; reflected for `:host([open])` styling. */
        this.open = false;
        /**
         * Overlay-root key handler: `Esc` requests dismissal, `Tab`/`Shift+Tab` are
         * confined to the panel's focusable ring.
         */
        this.handleKeydown = (event) => {
            if (event.key === 'Escape') {
                this.requestDismiss();
                return;
            }
            if (event.key === 'Tab') {
                this.cycleFocus(event);
            }
        };
        /** Backdrop click handler: dismiss only when the backdrop itself was clicked. */
        this.handleBackdrop = (event) => {
            if (event.target === event.currentTarget) {
                this.requestDismiss();
            }
        };
    }
    /**
     * Whether an `Esc` keypress or backdrop click may dismiss the overlay right now.
     * Defaults to always; `cp-dialog` overrides it to block while `busy`.
     */
    mayDismiss() {
        return true;
    }
    updated(changed) {
        if (changed.has('open')) {
            this.open ? this.captureFocus() : this.restoreFocus();
        }
        super.updated(changed);
    }
    disconnectedCallback() {
        super.disconnectedCallback();
        if (this.previouslyFocused !== undefined) {
            this.restoreFocus();
        }
    }
    /** Remembers the active element and moves focus into the freshly-rendered panel. */
    captureFocus() {
        this.previouslyFocused = deepActiveElement();
        const panel = this.panel;
        if (panel === undefined) {
            return;
        }
        const focusables = collectFocusable(panel);
        (focusables[0] ?? panel).focus();
    }
    /** Returns focus to the element that held it before the overlay opened. */
    restoreFocus() {
        const target = this.previouslyFocused;
        this.previouslyFocused = undefined;
        target?.focus();
    }
    /** Runs a dismissal request through the {@link mayDismiss} gate. */
    requestDismiss() {
        if (this.mayDismiss()) {
            this.emitDismiss();
        }
    }
    /** Wraps focus at the ends of the panel's focusable ring. */
    cycleFocus(event) {
        const panel = this.panel;
        if (panel === undefined) {
            return;
        }
        const focusables = collectFocusable(panel);
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (first === undefined || last === undefined) {
            event.preventDefault();
            panel.focus();
            return;
        }
        const active = deepActiveElement();
        if (event.shiftKey && active === first) {
            event.preventDefault();
            last.focus();
        }
        else if (!event.shiftKey && active === last) {
            event.preventDefault();
            first.focus();
        }
    }
}
__decorate([
    property({ type: Boolean, reflect: true })
], CpOverlay.prototype, "open", void 0);
//# sourceMappingURL=cp-overlay.js.map