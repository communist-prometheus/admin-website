import { LitElement, nothing } from 'lit';
import { type IconName } from '../../icons/registry.js';
/**
 * Decorative inline-SVG icon (R3, design.md §6). Renders a registered 24×24
 * `currentColor` icon; unknown names render nothing and warn. `aria-hidden`
 * always — the accessible name comes from the labelling control that wraps it.
 */
export declare class CpIcon extends LitElement {
    static styles: import("lit").CSSResult;
    /** Registered icon name (see the icon registry). */
    name: IconName | '';
    /** Rendered size in px; also settable via `--cp-icon-size`. */
    size: number;
    render(): typeof nothing | import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-icon': CpIcon;
    }
}
//# sourceMappingURL=cp-icon.d.ts.map