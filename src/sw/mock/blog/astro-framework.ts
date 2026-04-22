import type { MockEntry } from '../all-entries'
import { astroTranslations } from './astro-framework-translations'

/** Mock entries for the "astro-framework" blog post */
export const astroFrameworkEntries: readonly MockEntry[] = [
  {
    path: 'blog/astro-framework/index.en.md',
    content: `---
title: Why Choose Astro Framework
description: Learn about Astro's unique approach to building fast websites.
category: Technology
published: true
publishDate: 2024-01-25
lang: en
---

# Why Choose Astro Framework

Astro is a modern web framework with a fresh approach.`,
  },
  {
    path: 'blog/astro-framework/index.ru.md',
    content: `---
title: Почему выбрать фреймворк Astro
description: Узнайте об уникальном подходе Astro к созданию быстрых сайтов.
category: Технологии
published: true
publishDate: 2024-01-25
lang: ru
---

# Почему выбрать фреймворк Astro

Astro — это современный веб-фреймворк с новым подходом.`,
  },
  ...astroTranslations,
]
