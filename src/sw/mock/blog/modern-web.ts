import type { MockEntry } from '../all-entries'
import { modernWebTranslations } from './modern-web-translations'

/** Mock entries for the "modern-web-development" blog post */
export const modernWebEntries: readonly MockEntry[] = [
  {
    path: 'blog/modern-web-development/index.en.md',
    content: `---
title: Modern Web Development Best Practices
description: Explore the latest best practices in web development.
category: technology
pubDate: 2024-01-20
lang: en
---

# Modern Web Development Best Practices

The web development landscape is constantly evolving.`,
  },
  {
    path: 'blog/modern-web-development/index.ru.md',
    content: `---
title: Лучшие практики современной веб-разработки
description: Изучите новейшие практики веб-разработки.
category: technology
pubDate: 2024-01-20
lang: ru
---

# Лучшие практики современной веб-разработки

Ландшафт веб-разработки постоянно развивается.`,
  },
  ...modernWebTranslations,
]
