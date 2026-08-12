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
    'file-text': '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5M8.5 13h7M8.5 17h7" />',
    book: '<path d="M5 4a1 1 0 0 1 1-1h13v16H6a1 1 0 0 0-1 1z" /><path d="M5 20a1 1 0 0 1 1-1h13M9 7h6" />',
    hash: '<path d="M4 9h16M4 15h16M10 3L8 21M16 3l-2 18" />',
    users: '<circle cx="9" cy="8" r="3.2" /><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.7a3.2 3.2 0 0 1 0 6.2M18 14.4a6.5 6.5 0 0 1 3.5 5.6" />',
    ticket: '<path d="M4 7a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v3a2 2 0 0 0 0 4v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-3a2 2 0 0 0 0-4z" /><path d="M15 6v12" />',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3.5 7l8.5 6 8.5-6" />',
    rocket: '<path d="M12 2.5c2.4 2 3.8 4.8 3.8 7.7v3.3l-1.8 1.8h-4l-1.8-1.8V10.2C8.2 7.3 9.6 4.5 12 2.5z" /><circle cx="12" cy="9" r="1.3" /><path d="M8.2 15.3l-2.2 3.7 3.7-2.2M15.8 15.3l2.2 3.7-3.7-2.2" />',
    settings: '<path d="M4 7h9M17 7h3M4 12h3M11 12h9M4 17h13M21 17h-1" /><circle cx="15" cy="7" r="2.2" /><circle cx="9" cy="12" r="2.2" /><circle cx="19" cy="17" r="2.2" />',
    image: '<rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.6" /><path d="M21 15l-5-5L5 21" />',
    'file-generic': '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z" /><path d="M14 3v5h5" />',
};
//# sourceMappingURL=registry.js.map