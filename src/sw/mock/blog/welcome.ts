import type { MockEntry } from '../all-entries'
import { welcomeAssets } from './welcome-assets'
import { welcomeTranslations } from './welcome-translations'

/** Mock entries for the "welcome-to-prometheus" blog post */
export const welcomeEntries: readonly MockEntry[] = [
  {
    path: 'src/content/blog/welcome-to-prometheus/index.en.md',
    content: `---
title: Welcome to Prometheus
description: Discover our vision for a modern knowledge sharing platform.
category: Announcement
pubDate: 2024-01-15
image: ./assets/hero.svg
lang: en
---

# Welcome to Prometheus

![Prometheus hero](./assets/hero.svg)

We're excited to introduce **Prometheus** - a modern platform.`,
  },
  {
    path: 'src/content/blog/welcome-to-prometheus/index.ru.md',
    content: `---
title: Добро пожаловать в Prometheus
description: Откройте для себя наше видение современной платформы.
category: Объявление
pubDate: 2024-01-15
image: ./assets/hero.svg
lang: ru
---

# Добро пожаловать в Prometheus

![Prometheus герой](./assets/hero.svg)

Мы рады представить **Prometheus**.`,
  },
  ...welcomeAssets,
  ...welcomeTranslations,
]
