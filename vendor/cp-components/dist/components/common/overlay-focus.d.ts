/**
 * Focus-management primitives shared by the overlay family (R4/R7, design.md §5):
 * `cp-dialog`, `cp-drawer` and `cp-sheet`. Kept as pure helpers so the overlay
 * base stays declarative and the trap logic is unit-testable in isolation.
 */
/**
 * The currently focused element, pierced through any number of shadow roots so
 * a control focused inside a nested `<cp-*>` shadow tree is resolved to the real
 * leaf rather than its host.
 */
export declare const deepActiveElement: () => HTMLElement | undefined;
/**
 * Collects the tabbable elements inside `panel` in composed-tree order. Slots are
 * expanded to their assigned light-DOM elements, falling back to the slot's own
 * default content when nothing is assigned, so both consumer-slotted controls and
 * the overlay's own shadow affordances participate in a single ordered trap.
 */
export declare const collectFocusable: (panel: HTMLElement) => readonly HTMLElement[];
//# sourceMappingURL=overlay-focus.d.ts.map