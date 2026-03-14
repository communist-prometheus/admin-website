import type { MockEntry } from '../all-entries'

/** Italian and Spanish translations of the welcome post */
export const welcomeTranslations: readonly MockEntry[] = [
  {
    path: 'src/content/blog/welcome-to-prometheus/index.it.md',
    content: `---
title: Benvenuti su Prometheus
description: Scoprite la nostra visione per una piattaforma moderna.
category: Annuncio
pubDate: 2024-01-15
image: ./assets/hero.svg
lang: it
---

# Benvenuti su Prometheus

Siamo entusiasti di presentare **Prometheus**.`,
  },
  {
    path: 'src/content/blog/welcome-to-prometheus/index.es.md',
    content: `---
title: Bienvenidos a Prometheus
description: Descubre nuestra visión para una plataforma moderna.
category: Anuncio
pubDate: 2024-01-15
image: ./assets/hero.svg
lang: es
---

# Bienvenidos a Prometheus

Estamos emocionados de presentar **Prometheus**.`,
  },
]
