import { communityEntries } from './blog/community'
import { educationEntries } from './blog/education'
import { openSourceEntries } from './blog/open-source'
import { welcomeEntries } from './blog/welcome'

/** All mock blog entries combined */
export const blogEntries = [
  ...welcomeEntries,
  ...openSourceEntries,
  ...communityEntries,
  ...educationEntries,
]
