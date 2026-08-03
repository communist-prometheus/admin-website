import { LitElement } from 'lit';
import '../icon/cp-icon.js';
/** The semantic tones a banner can carry. */
export type BannerTone = 'success' | 'warning' | 'info' | 'danger' | 'neutral';
/**
 * Full-width inline banner (R4/R5, design.md §5). Distinct from the transient
 * `cp-toast`: it is a persistent surface (`part="banner"`) for page- or
 * section-level messages. Renders a tinted leading icon-circle (`part="icon"`,
 * tone `-bg` fill + tone `<cp-icon>`), a `title` (`part="title"`) with a
 * default-slot description (`part="description"`), and a right-aligned `action`
 * slot (`part="action"`). Announcement politeness follows the tone: polite
 * `role="status"` for success/info/neutral, interrupting `role="alert"` for
 * warning/danger.
 */
export declare class CpBanner extends LitElement {
    static styles: import("lit").CSSResult;
    /** Semantic tone; drives the tint and the redundant icon shape. */
    tone: BannerTone;
    /** The banner heading. */
    title: string;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-banner': CpBanner;
    }
}
//# sourceMappingURL=cp-banner.d.ts.map