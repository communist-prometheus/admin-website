import type { MockEntry } from '../all-entries'

/** Italian and Spanish translations of the open-source post */
export const openSourceTranslations: readonly MockEntry[] = [
  {
    path: 'blog/open-source-collaboration/index.it.md',
    content: `---
title: Il potere della collaborazione open source
description: Come le comunità open source guidano l'innovazione.
category: community
pubDate: 2024-02-05
image: ./assets/cover.jpg
lang: it
---

# Il potere della collaborazione open source

L'open source è più di un modello di sviluppo.`,
  },
  {
    path: 'blog/open-source-collaboration/index.es.md',
    content: `---
title: El poder de la colaboración open source
description: Cómo las comunidades de código abierto impulsan la innovación.
category: community
pubDate: 2024-02-05
image: ./assets/cover.jpg
lang: es
---

# El poder de la colaboración open source

El código abierto es más que un modelo de desarrollo.`,
  },
]
