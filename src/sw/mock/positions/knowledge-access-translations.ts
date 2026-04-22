import type { MockEntry } from '../all-entries'

/** Italian and Spanish translations of the knowledge-access position */
export const knowledgeTranslations: readonly MockEntry[] = [
  {
    path: 'positions/knowledge-access.it.md',
    content: `---
title: Accesso Universale alla Conoscenza
description: L'istruzione e la conoscenza dovrebbero essere liberamente disponibili.
published: true
publishDate: 2024-02-01
lang: it
---

# Accesso Universale alla Conoscenza

L'apprendimento dovrebbe essere collaborativo.`,
  },
  {
    path: 'positions/knowledge-access.es.md',
    content: `---
title: Acceso Universal al Conocimiento
description: La educación y el conocimiento deben estar disponibles libremente.
published: true
publishDate: 2024-02-01
lang: es
---

# Acceso Universal al Conocimiento

El aprendizaje debe ser colaborativo.`,
  },
]
