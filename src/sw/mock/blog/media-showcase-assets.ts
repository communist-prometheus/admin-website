import type { MockEntry } from '../all-entries'

const ARCH_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 120">
  <rect width="200" height="120" fill="#f8fafc" rx="8"/>
  <text x="100" y="65" text-anchor="middle" fill="#334155"
    font-family="sans-serif" font-size="14">Architecture</text>
</svg>`

/** Stub JPEG (enough for MIME detection) */
const STUB_JPG = '\xff\xd8\xff\xe0'

/** Minimal valid MP4 (ftyp box only) */
const STUB_VIDEO = 'AAAA'

/** Minimal audio stub */
const STUB_AUDIO = 'AAAA'

const BASE = 'src/content/blog/media-showcase/assets'

/** Mock assets for the media-showcase blog post */
export const mediaShowcaseAssets: readonly MockEntry[] = [
  { path: `${BASE}/architecture.svg`, content: ARCH_SVG },
  { path: `${BASE}/cover.jpg`, content: STUB_JPG },
  { path: `${BASE}/demo.mp4`, content: STUB_VIDEO },
  { path: `${BASE}/landscape.jpg`, content: STUB_JPG },
  { path: `${BASE}/sample.m4a`, content: STUB_AUDIO },
]
