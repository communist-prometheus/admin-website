import type { MockEntry } from '../all-entries'

const COVER_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 100">
  <rect width="200" height="100" fill="#059669" rx="8"/>
  <text x="100" y="55" text-anchor="middle" fill="white"
    font-family="sans-serif" font-size="14">Community</text>
</svg>`

/** Mock asset for the community-update blog post */
export const communityAssets: readonly MockEntry[] = [
  {
    path: 'src/content/blog/community-update/assets/cover.svg',
    content: COVER_SVG,
  },
]
