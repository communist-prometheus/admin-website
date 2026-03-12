import type { MockEntry } from '../all-entries'

/** Italian and Spanish translations of the welcome post */
export const welcomeTranslations: readonly MockEntry[] = [
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
]
