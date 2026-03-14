import { astroFrameworkEntries } from './blog/astro-framework'
import { mediaShowcaseEntries } from './blog/media-showcase'
import { modernWebEntries } from './blog/modern-web'
import { openSourceEntries } from './blog/open-source'
import { welcomeEntries } from './blog/welcome'

/** All mock blog entries combined */
export const blogEntries = [
  ...welcomeEntries,
  ...astroFrameworkEntries,
  ...modernWebEntries,
  ...openSourceEntries,
  ...mediaShowcaseEntries,
]
