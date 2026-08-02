import { LitElement } from 'lit';
import type { PropertyValues } from 'lit';
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
export declare abstract class CpOverlay extends LitElement {
    /** Whether the overlay is currently shown; reflected for `:host([open])` styling. */
    open: boolean;
    /** The element focused before the overlay opened, restored on close. */
    private previouslyFocused;
    /** The focus-trap region (the dialog/panel) queried from the subclass shadow root. */
    protected abstract get panel(): HTMLElement | undefined;
    /** Emits the subclass's concrete close event (`cp-cancel`/`cp-close`). */
    protected abstract emitDismiss(): void;
    /**
     * Whether an `Esc` keypress or backdrop click may dismiss the overlay right now.
     * Defaults to always; `cp-dialog` overrides it to block while `busy`.
     */
    protected mayDismiss(): boolean;
    updated(changed: PropertyValues): void;
    disconnectedCallback(): void;
    /** Remembers the active element and moves focus into the freshly-rendered panel. */
    private captureFocus;
    /** Returns focus to the element that held it before the overlay opened. */
    private restoreFocus;
    /** Runs a dismissal request through the {@link mayDismiss} gate. */
    private requestDismiss;
    /**
     * Overlay-root key handler: `Esc` requests dismissal, `Tab`/`Shift+Tab` are
     * confined to the panel's focusable ring.
     */
    protected handleKeydown: (event: KeyboardEvent) => void;
    /** Backdrop click handler: dismiss only when the backdrop itself was clicked. */
    protected handleBackdrop: (event: MouseEvent) => void;
    /** Wraps focus at the ends of the panel's focusable ring. */
    private cycleFocus;
}
//# sourceMappingURL=cp-overlay.d.ts.map