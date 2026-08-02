/**
 * Focus-management primitives shared by the overlay family (R4/R7, design.md §5):
 * `cp-dialog`, `cp-drawer` and `cp-sheet`. Kept as pure helpers so the overlay
 * base stays declarative and the trap logic is unit-testable in isolation.
 */
/**
 * Selector matching sequentially-focusable elements. Elements with a negative
 * `tabindex` or that are `disabled` are excluded so the trap mirrors the
 * browser's own Tab order.
 */
const FOCUSABLE_SELECTOR = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
].join(',');
/** True when an element occupies layout (a cheap `display:none`/`hidden` filter). */
const isVisible = (el) => el.offsetWidth > 0 || el.offsetHeight > 0 || el.getClientRects().length > 0;
/**
 * The currently focused element, pierced through any number of shadow roots so
 * a control focused inside a nested `<cp-*>` shadow tree is resolved to the real
 * leaf rather than its host.
 */
export const deepActiveElement = () => {
    let node = globalThis.document.activeElement ?? undefined;
    while (node?.shadowRoot?.activeElement) {
        node = node.shadowRoot.activeElement;
    }
    return node instanceof HTMLElement ? node : undefined;
};
/**
 * Collects the tabbable elements inside `panel` in composed-tree order. Slots are
 * expanded to their assigned light-DOM elements, falling back to the slot's own
 * default content when nothing is assigned, so both consumer-slotted controls and
 * the overlay's own shadow affordances participate in a single ordered trap.
 */
export const collectFocusable = (panel) => {
    const found = [];
    const consider = (el) => {
        if (el instanceof HTMLElement &&
            el.matches(FOCUSABLE_SELECTOR) &&
            isVisible(el)) {
            found.push(el);
        }
    };
    const walk = (node) => {
        for (const child of node.children) {
            if (child instanceof HTMLSlotElement) {
                const assigned = child.assignedElements();
                const projected = assigned.length > 0 ? assigned : [...child.children];
                for (const el of projected) {
                    consider(el);
                    walk(el);
                }
            }
            else {
                consider(child);
                walk(child);
            }
        }
    };
    walk(panel);
    return found;
};
//# sourceMappingURL=overlay-focus.js.map