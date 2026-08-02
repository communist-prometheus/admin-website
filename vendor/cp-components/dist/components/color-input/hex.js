/**
 * Hex-color helpers for `cp-color-input` (R4/R7, design.md §5). Kept in the
 * helpers layer so the component stays declarative: normalization and validation
 * live here, not inside the presentation template.
 */
/** True when `value` is a full 6-digit `#rrggbb` hex color (case-insensitive). */
export const isHexColor = (value) => /^#[0-9a-f]{6}$/i.test(value);
/**
 * Canonicalizes user hex input: trims, prefixes a missing `#`, lowercases. An
 * empty string stays empty so the field can represent "no value". Non-hex noise
 * passes through unchanged and is caught by {@link isHexColor} at validation time.
 */
export const normalizeHex = (raw) => {
    const trimmed = raw.trim();
    if (trimmed === '') {
        return '';
    }
    const withHash = trimmed.startsWith('#') ? trimmed : `#${trimmed}`;
    return withHash.toLowerCase();
};
/** The swatch's native `<input type="color">` needs a valid hex; falls back to black. */
export const swatchValue = (value) => (isHexColor(value) ? value : '#000000');
//# sourceMappingURL=hex.js.map