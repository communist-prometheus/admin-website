import { LitElement } from 'lit';
import '../icon/cp-icon.js';
/** The semantic tones a toast can carry. */
export type ToastTone = 'success' | 'warning' | 'info' | 'danger' | 'neutral';
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
export declare class CpToast extends LitElement {
    static styles: import("lit").CSSResult;
    /** Semantic tone; drives the tint, the redundant icon shape and politeness. */
    tone: ToastTone;
    /** The notification text. */
    message: string;
    /** Auto-dismiss delay in ms; `0` persists until the user closes it. */
    duration: number;
    private timer;
    connectedCallback(): void;
    disconnectedCallback(): void;
    /** Arms the auto-dismiss timer; a non-positive `duration` is the persist guard. */
    private startTimer;
    private clearTimer;
    /** Emits the bubbling, composed `cp-dismiss` and marks the toast leaving. */
    private dismiss;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-toast': CpToast;
    }
}
//# sourceMappingURL=cp-toast.d.ts.map