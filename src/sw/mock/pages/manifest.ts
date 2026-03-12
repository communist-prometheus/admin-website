import type { MockEntry } from '../all-entries'

/** Mock entries for the "manifest" page */
export const manifestEntries: readonly MockEntry[] = [
  {
    path: 'src/content/pages/manifest.en.md',
    content: `---
title: Our Manifest
lang: en
---

# Our Manifest

Our principles and values.`,
  },
  {
    path: 'src/content/pages/manifest.ru.md',
    content: `---
title: Наш манифест
lang: ru
---

# Наш манифест

Наши принципы и ценности.`,
  },
]
