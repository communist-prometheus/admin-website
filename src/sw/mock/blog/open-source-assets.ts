import type { MockEntry } from '../all-entries'

/** Stub JPEG (1x1 white pixel, enough for MIME detection) */
const STUB_JPG = '\xff\xd8\xff\xe0'

const BASE = 'blog/open-source-collaboration/assets'

/** Mock asset for the open-source-collaboration blog post */
export const openSourceAssets: readonly MockEntry[] = [
  { path: `${BASE}/cover.jpg`, content: STUB_JPG },
]
