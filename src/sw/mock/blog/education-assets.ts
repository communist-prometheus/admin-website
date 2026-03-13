import type { MockEntry } from '../all-entries'

const LOGO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80">
  <circle cx="40" cy="40" r="36" fill="#0891b2"/>
  <text x="40" y="46" text-anchor="middle" fill="white"
    font-family="sans-serif" font-size="14">EDU</text>
</svg>`

/** Mock assets for the education-platform blog post */
export const educationAssets: readonly MockEntry[] = [
  {
    path: 'src/content/blog/education-platform/assets/logo.svg',
    content: LOGO_SVG,
  },
]
