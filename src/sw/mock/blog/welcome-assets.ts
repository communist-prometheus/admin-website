import type { MockEntry } from '../all-entries'

const HERO_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">
  <rect width="200" height="100" fill="#4f46e5" rx="8"/>
  <text x="100" y="55" text-anchor="middle" fill="white"
    font-family="sans-serif" font-size="16">Prometheus</text>
</svg>`

/** Mock asset for the welcome-to-prometheus blog post */
export const welcomeAssets: readonly MockEntry[] = [
  {
    path: 'src/content/blog/welcome-to-prometheus/assets/hero.svg',
    content: HERO_SVG,
  },
]
