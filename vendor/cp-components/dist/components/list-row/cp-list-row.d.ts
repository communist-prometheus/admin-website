import { LitElement } from 'lit';
import type { IconName } from '../../icons/registry.js';
import '../icon/cp-icon.js';
/**
 * Bordered list row (R4/R5/R7, design.md §5/§6). The horizontal item used by the
 * review queue, deploy log, conflict list and link groups — a bordered container
 * (`part="row"`, `--cp-radius-md`, hairline border), NOT a table row. Layout:
 * a leading icon-circle (`part="icon"`), a content column (`part="content"`
 * holding the `title`, a default/`content` slot for free-form body, and a `meta`
 * line), and a right-aligned `actions` slot (`part="actions"`) for buttons or a
 * `cp-menu`. Purely presentational: interactivity lives in the slotted controls.
 */
export declare class CpListRow extends LitElement {
    static styles: import("lit").CSSResult;
    /** Registered `cp-icon` name for the leading icon-circle. */
    icon: IconName | '';
    /** Primary row title. */
    title: string;
    /** Secondary meta line under the title. */
    meta: string;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-list-row': CpListRow;
    }
}
//# sourceMappingURL=cp-list-row.d.ts.map