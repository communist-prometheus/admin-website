import type { MockEntry } from '../all-entries'

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
  <circle cx="40" cy="40" r="36" fill="#0891b2"/>
  <text x="40" y="46" text-anchor="middle" fill="white"
    font-family="sans-serif" font-size="14">EDU</text>
</svg>`

/** Minimal valid MP4 (ftyp box only — enough for MIME detection) */
const STUB_VIDEO = 'AAAA'

/** Minimal audio stub */
const STUB_AUDIO = 'AAAA'

/** Minimal PDF stub */
const STUB_PDF = '%PDF-1.0 stub'

const BASE = 'src/content/blog/education-platform/assets'

/** Mock assets for the education-platform blog post */
export const educationAssets: readonly MockEntry[] = [
  { path: `${BASE}/logo.svg`, content: LOGO_SVG },
  { path: `${BASE}/intro.mp4`, content: STUB_VIDEO },
  { path: `${BASE}/narration.mp3`, content: STUB_AUDIO },
  { path: `${BASE}/syllabus.pdf`, content: STUB_PDF },
]
