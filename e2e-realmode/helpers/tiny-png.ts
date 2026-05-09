/**
 * 1×1 transparent PNG. The SW only cares about the bytes round-
 * tripping through the staging chain — using the smallest valid PNG
 * keeps the test independent of any image-processing logic.
 */
export const TINY_PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNgAAIAAAUAAen63NgAAAAASUVORK5CYII=',
  'base64'
)
