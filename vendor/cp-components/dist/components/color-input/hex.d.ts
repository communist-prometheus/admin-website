/**
 * Hex-color helpers for `cp-color-input` (R4/R7, design.md §5). Kept in the
 * helpers layer so the component stays declarative: normalization and validation
 * live here, not inside the presentation template.
 */
/** True when `value` is a full 6-digit `#rrggbb` hex color (case-insensitive). */
export declare const isHexColor: (value: string) => boolean;
/**
 * Canonicalizes user hex input: trims, prefixes a missing `#`, lowercases. An
 * empty string stays empty so the field can represent "no value". Non-hex noise
 * passes through unchanged and is caught by {@link isHexColor} at validation time.
 */
export declare const normalizeHex: (raw: string) => string;
/** The swatch's native `<input type="color">` needs a valid hex; falls back to black. */
export declare const swatchValue: (value: string) => string;
//# sourceMappingURL=hex.d.ts.map