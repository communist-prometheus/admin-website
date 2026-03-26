import type { MockEntry } from '../all-entries'

/** Russian, Italian, and Spanish translations of the media-showcase post */
export const mediaShowcaseTranslations: readonly MockEntry[] = [
  {
    path: 'blog/media-showcase/index.ru.md',
    content: `---
title: Мультимедиа в блоге
description: Демонстрация типов медиаконтента в блоге Prometheus.
category: Технологии
pubDate: 2024-02-10
image: ./assets/cover.jpg
lang: ru
---

# Мультимедиа в блоге

Блог Prometheus поддерживает широкий спектр медиаконтента.`,
  },
  {
    path: 'blog/media-showcase/index.it.md',
    content: `---
title: Contenuti multimediali nel blog
description: Una vetrina dei tipi di media supportati nel blog Prometheus.
category: Tecnologia
pubDate: 2024-02-10
image: ./assets/cover.jpg
lang: it
---

# Contenuti multimediali nel blog

Il blog Prometheus supporta un'ampia gamma di contenuti multimediali.`,
  },
  {
    path: 'blog/media-showcase/index.es.md',
    content: `---
title: Contenido multimedia en el blog
description: Muestra de tipos de medios en el blog Prometheus.
category: Tecnología
pubDate: 2024-02-10
image: ./assets/cover.jpg
lang: es
---

# Contenido multimedia en el blog

El blog de Prometheus admite una amplia gama de contenido multimedia.`,
  },
]
