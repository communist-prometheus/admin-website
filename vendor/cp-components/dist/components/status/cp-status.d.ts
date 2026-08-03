import { LitElement } from 'lit';
import '../icon/cp-icon.js';
/** The semantic tones a status can carry. */
export type StatusState = 'success' | 'warning' | 'info' | 'danger' | 'neutral';
/**
 * Status indicator that never encodes meaning by colour alone (R4, NFR-5,
 * design.md §5). Every status renders THREE redundant cues: a colored dot
 * (`part="dot"`), a state-specific SHAPE via `<cp-icon>` (`part="icon"`), and a
 * text `label` (`part="label"`). Removing colour still leaves the shape and the
 * words, satisfying WCAG 1.4.1 (Use of Color).
 */
export declare class CpStatus extends LitElement {
    static styles: import("lit").CSSResult;
    /** Semantic tone; drives the dot colour and the redundant icon shape. */
    state: StatusState;
    /** Human-readable status text rendered alongside the visual cues. */
    label: string;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-status': CpStatus;
    }
}
//# sourceMappingURL=cp-status.d.ts.map