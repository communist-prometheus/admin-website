import { LitElement } from 'lit';
import type { IconName } from '../../icons/registry.js';
import '../icon/cp-icon.js';
/** One selectable entry in a `cp-menu` popup. */
export interface CpMenuItem {
    readonly id: string;
    readonly label: string;
    readonly icon?: IconName;
    readonly disabled?: boolean;
}
/**
 * Overflow / kebab menu (R4/R5/R7, design.md §5/§6). The default slot is the
 * trigger — typically a kebab `cp-button` — and clicking it toggles `open`. When
 * open, an absolutely-positioned popup (`role="menu"`, `part="list"`) renders the
 * `items` as `role="menuitem"` buttons (`part="item"`, optional leading
 * `<cp-icon>`). ArrowUp/ArrowDown (plus Home/End) move focus between enabled
 * items; Enter/Space or click selects an item, emitting a bubbling+composed
 * `cp-select` `CustomEvent` with `detail: { id }` and closing. Escape or an
 * outside click closes and emits `cp-close`. Disabled items are inert. The
 * slotted trigger receives `aria-haspopup="menu"` and a reflected
 * `aria-expanded`, and focus returns to it when the popup closes via keyboard.
 */
export declare class CpMenu extends LitElement {
    static styles: import("lit").CSSResult;
    /** Whether the popup is open. */
    open: boolean;
    /** The menu entries rendered top-to-bottom. */
    items: ReadonlyArray<CpMenuItem>;
    /** Optional accessible name for the popup (`aria-label` on `role="menu"`). */
    label: string;
    /** All rendered menuitem buttons, in `items` order (disabled ones included). */
    private get itemButtons();
    /** The slotted trigger element (first assigned element of the default slot). */
    private get triggerElement();
    private toggle;
    private openMenu;
    /** Closes the popup; `emitClose` fires `cp-close` (Escape / outside click). */
    private close;
    private select;
    /** Nearest enabled index from `from` stepping by `dir`, wrapping around. */
    private nextEnabled;
    private focusIndex;
    private handleKeydown;
    private handleDocumentPointerDown;
    disconnectedCallback(): void;
    updated(changed: Map<string, unknown>): void;
    render(): import("lit").TemplateResult<1>;
}
declare global {
    interface HTMLElementTagNameMap {
        'cp-menu': CpMenu;
    }
}
//# sourceMappingURL=cp-menu.d.ts.map