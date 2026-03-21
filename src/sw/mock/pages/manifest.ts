import type { MockEntry } from '../all-entries'
import { manifestTranslations } from './manifest-translations'

/** Mock entries for the "manifest" page */
export const manifestEntries: readonly MockEntry[] = [
  {
    path: 'pages/manifest.en.md',
    content: `---
title: Our Manifest
description: Our mission, core principles, and commitment.
lang: en
---

# Our Manifest

Our principles and values.`,
  },
  {
    path: 'pages/manifest.ru.md',
    content: `---
title: Наш манифест
description: Наша миссия, основные принципы и приверженность.
lang: ru
---

# Наш манифест

Наши принципы и ценности.`,
  },
  ...manifestTranslations,
]
