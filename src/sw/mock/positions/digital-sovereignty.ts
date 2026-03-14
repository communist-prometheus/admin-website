import type { MockEntry } from '../all-entries'
import { sovereigntyTranslations } from './digital-sovereignty-translations'

/** Mock entries for the "digital-sovereignty" position */
export const digitalSovereigntyEntries: readonly MockEntry[] = [
  {
    path: 'src/content/positions/digital-sovereignty.en.md',
    content: `---
title: Digital Sovereignty
description: Technology must serve the people, not corporations.
order: 1
lang: en
---

# Digital Sovereignty

We advocate for open-source infrastructure.`,
  },
  {
    path: 'src/content/positions/digital-sovereignty.ru.md',
    content: `---
title: Цифровой суверенитет
description: Технологии должны служить людям, а не корпорациям.
order: 1
lang: ru
---

# Цифровой суверенитет

Мы выступаем за инфраструктуру с открытым кодом.`,
  },
  ...sovereigntyTranslations,
]
