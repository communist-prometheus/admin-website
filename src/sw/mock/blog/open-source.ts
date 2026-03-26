import type { MockEntry } from '../all-entries'
import { openSourceAssets } from './open-source-assets'
import { openSourceTranslations } from './open-source-translations'

/** Mock entries for the "open-source-collaboration" blog post */
export const openSourceEntries: readonly MockEntry[] = [
  {
    path: 'blog/open-source-collaboration/index.en.md',
    content: `---
title: The Power of Open Source Collaboration
description: How open source communities drive innovation.
category: community
pubDate: 2024-02-05
image: ./assets/cover.jpg
lang: en
---

# The Power of Open Source Collaboration

Open source is more than a development model.`,
  },
  {
    path: 'blog/open-source-collaboration/index.ru.md',
    content: `---
title: Сила открытого сотрудничества
description: Как сообщества открытого кода стимулируют инновации.
category: community
pubDate: 2024-02-05
image: ./assets/cover.jpg
lang: ru
---

# Сила открытого сотрудничества

Открытый исходный код — это больше, чем модель разработки.`,
  },
  ...openSourceAssets,
  ...openSourceTranslations,
]
