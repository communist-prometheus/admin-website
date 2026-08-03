import { LitElement } from 'lit';
import type { IconName } from '../../icons/registry.js';
import '../icon/cp-icon.js';
/**
 * Empty / placeholder state (R4, design.md §5). A centered, muted column that
 * explains why a region has no content and offers a next step. Used both full-
 * screen ("this area isn't designed yet") and inline ("the review queue is
 * empty"). Renders an optional `<cp-icon>` (`part="icon"`), a `title`
 * (`part="title"`), a secondary `hint` (`part="hint"`), then a default slot for
 * an action such as a `<cp-button>`. `role="status"` announces the state to
 * assistive tech without stealing focus.
 */
export declare class CpEmptyState extends LitElement {
    static styles: import("lit").CSSResult;
    /** Optional registered icon name shown above the title. */
    icon: IconName | '';
    /** Primary line explaining the empty state. */
    title: string;
    /** Secondary, softer supporting line. */
    hint: string;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-empty-state': CpEmptyState;
    }
}
//# sourceMappingURL=cp-empty-state.d.ts.map