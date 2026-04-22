import type { MockEntry } from '../all-entries'
import { sovereigntyTranslations } from './digital-sovereignty-translations'

/** Mock entries for the "digital-sovereignty" position */
export const digitalSovereigntyEntries: readonly MockEntry[] = [
  {
    path: 'positions/digital-sovereignty.en.md',
    content: `---
title: Digital Sovereignty
description: Technology must serve the people, not corporations.
published: true
publishDate: 2024-01-15
lang: en
---

# Digital Sovereignty

We advocate for open-source infrastructure.`,
  },
  {
    path: 'positions/digital-sovereignty.ru.md',
    content: `---
title: Цифровой суверенитет
description: Технологии должны служить людям, а не корпорациям.
published: true
publishDate: 2024-01-15
lang: ru
---

# Цифровой суверенитет

Мы выступаем за инфраструктуру с открытым кодом.`,
  },
  ...sovereigntyTranslations,
]
