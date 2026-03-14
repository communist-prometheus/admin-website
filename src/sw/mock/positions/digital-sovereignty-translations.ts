import type { MockEntry } from '../all-entries'

/** Italian and Spanish translations of the digital-sovereignty position */
export const sovereigntyTranslations: readonly MockEntry[] = [
  {
    path: 'src/content/positions/digital-sovereignty.it.md',
    content: `---
title: Sovranità Digitale
description: La tecnologia deve servire le persone, non le corporazioni.
order: 1
lang: it
---

# Sovranità Digitale

Sosteniamo l'infrastruttura open-source.`,
  },
  {
    path: 'src/content/positions/digital-sovereignty.es.md',
    content: `---
title: Soberanía Digital
description: La tecnología debe servir a las personas, no a las corporaciones.
order: 1
lang: es
---

# Soberanía Digital

Abogamos por la infraestructura de código abierto.`,
  },
]
