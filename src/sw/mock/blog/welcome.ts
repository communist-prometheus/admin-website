import type { MockEntry } from '../all-entries'
import { welcomeTranslations } from './welcome-translations'

/** Mock entries for the "welcome-to-prometheus" blog post */
export const welcomeEntries: readonly MockEntry[] = [
  {
    path: 'src/content/blog/welcome-to-prometheus/welcome-to-prometheus.en.md',
    content: `---
title: Welcome to Prometheus
description: Discover our vision for a modern knowledge sharing platform.
category: Announcement
pubDate: 2024-01-15
lang: en
---

# Welcome to Prometheus

We're excited to introduce **Prometheus** - a modern platform.`,
  },
  {
    path: 'src/content/blog/welcome-to-prometheus/welcome-to-prometheus.ru.md',
    content: `---
title: Добро пожаловать в Prometheus
description: Откройте для себя наше видение современной платформы.
category: Announcement
pubDate: 2024-01-15
lang: ru
---

# Добро пожаловать в Prometheus

Мы рады представить **Prometheus**.`,
  },
  ...welcomeTranslations,
]
