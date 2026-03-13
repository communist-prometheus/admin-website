import type { MockEntry } from '../all-entries'

/** Mock entries for the "open-source-strategy" blog post */
export const openSourceEntries: readonly MockEntry[] = [
  {
    path: 'src/content/blog/open-source-strategy/open-source-strategy.en.md',
    content: `---
title: Our Open Source Strategy
description: How we leverage open-source tools for transparent governance.
category: Technology
pubDate: 2024-02-10
lang: en
---

# Our Open Source Strategy

Transparency begins with the tools we use.`,
  },
  {
    path: 'src/content/blog/open-source-strategy/open-source-strategy.ru.md',
    content: `---
title: Наша стратегия открытого кода
description: Как мы используем инструменты с открытым кодом.
category: Technology
pubDate: 2024-02-10
lang: ru
---

# Наша стратегия открытого кода

Прозрачность начинается с инструментов.`,
  },
]
