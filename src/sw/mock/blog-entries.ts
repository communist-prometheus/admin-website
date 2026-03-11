/** Mock blog file entries for E2E tests */
export const blogEntries = [
  {
    path: 'src/content/blog/welcome-to-prometheus.en.md',
    content: `---
title: Welcome to Prometheus
description: Discover our vision for a modern knowledge sharing platform built with cutting-edge technologies.
category: Announcement
pubDate: 2024-01-15
lang: en
---

# Welcome to Prometheus

We're excited to introduce **Prometheus** - a modern platform.`,
  },
  {
    path: 'src/content/blog/welcome-to-prometheus.ru.md',
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
  {
    path: 'src/content/blog/welcome-to-prometheus.it.md',
    content: `---
title: Benvenuti in Prometheus
description: Scoprite la nostra visione per una piattaforma moderna.
category: Announcement
pubDate: 2024-01-15
lang: it
---

# Benvenuti in Prometheus

Siamo entusiasti di presentare **Prometheus**.`,
  },
  {
    path: 'src/content/blog/welcome-to-prometheus.es.md',
    content: `---
title: Bienvenidos a Prometheus
description: Descubre nuestra visión para una plataforma moderna.
category: Announcement
pubDate: 2024-01-15
lang: es
---

# Bienvenidos a Prometheus

Estamos emocionados de presentar **Prometheus**.`,
  },
] as const
