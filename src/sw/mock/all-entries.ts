import { blogEntries } from './blog-entries'
import { pageEntries } from './page-entries'
import { positionEntries } from './position-entries'

/** Single mock file entry */
export interface MockEntry {
  readonly path: string
  readonly content: string
}

/** All mock entries combined */
export const allMockEntries: readonly MockEntry[] = [
  ...blogEntries,
  ...pageEntries,
  ...positionEntries,
]
