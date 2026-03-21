import type { MockEntry } from '../all-entries'

/** Italian and Spanish translations of the manifest page */
export const manifestTranslations: readonly MockEntry[] = [
  {
    path: 'pages/manifest.it.md',
    content: `---
title: Il Nostro Manifesto
description: La nostra missione, i principi fondamentali e l'impegno.
lang: it
---

# Il Nostro Manifesto

I nostri principi e valori.`,
  },
  {
    path: 'pages/manifest.es.md',
    content: `---
title: Nuestro Manifiesto
description: Nuestra misión, principios fundamentales y compromiso.
lang: es
---

# Nuestro Manifiesto

Nuestros principios y valores.`,
  },
]
