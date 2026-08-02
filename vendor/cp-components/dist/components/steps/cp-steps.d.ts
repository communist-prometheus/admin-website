import { LitElement } from 'lit';
import '../icon/cp-icon.js';
/** The lifecycle state a single step can carry. */
export type StepState = 'pending' | 'running' | 'done' | 'failed';
/** One step: a human-readable label plus its current lifecycle state. */
export interface Step {
    readonly label: string;
    readonly state: StepState;
}
/**
 * Step / progress tracker (R5/NFR-2, design.md §5). Renders an ordered list
 * (`part="list"`) of segments (`part="step"`); each step shows a marker coloured
 * by state (done → `--cp-color-success`, running → `--cp-color-accent`, failed →
 * `--cp-color-danger`, pending → `--cp-color-border`), a decorative connector
 * line, and the label. The running step is flagged with `aria-current="step"`,
 * and every state is mirrored by a visually-hidden word so nothing is conveyed
 * by colour alone.
 */
export declare class CpSteps extends LitElement {
    static styles: import("lit").CSSResult;
    /** The ordered steps to render. */
    steps: readonly Step[];
    private renderStep;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-steps': CpSteps;
    }
}
//# sourceMappingURL=cp-steps.d.ts.map