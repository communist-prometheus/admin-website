/**
 * Shared inline-SVG icon registry (requirement R3, design.md §6): one entry per
 * name, holding the inner markup of a 24×24 `currentColor` icon. A single source
 * prevents drift across the many composites that reuse kebab/close/chevron/
 * check/… Unicode glyphs are never used (the biggest "AI mockup" tell).
 *
 * Stroke icons inherit the `<svg>`'s `stroke="currentColor" fill="none"`;
 * filled marks (dots) opt in per-element with `fill="currentColor"
 * stroke="none"`.
 */
export const icons = {
    'arrow-right': '<path d="M5 12h14M13 6l6 6-6 6" />',
    check: '<path d="M20 6L9 17l-5-5" />',
    x: '<path d="M18 6L6 18M6 6l12 12" />',
    dash: '<path d="M5 12h14" />',
    plus: '<path d="M12 5v14M5 12h14" />',
    'chevron-down': '<path d="M6 9l6 6 6-6" />',
    'chevron-right': '<path d="M9 6l6 6-6 6" />',
    sun: '<circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />',
    moon: '<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />',
    trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" />',
    warning: '<path d="M12 3l10 18H2L12 3z" /><path d="M12 10v4" /><circle cx="12" cy="17.5" r="0.6" fill="currentColor" stroke="none" />',
    more: '<circle cx="12" cy="5" r="1.6" fill="currentColor" stroke="none" /><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" /><circle cx="12" cy="19" r="1.6" fill="currentColor" stroke="none" />',
    refresh: '<path d="M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6" />',
    upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16" />',
};
//# sourceMappingURL=registry.js.map