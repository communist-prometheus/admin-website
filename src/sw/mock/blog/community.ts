import type { MockEntry } from '../all-entries'
import { communityAssets } from './community-assets'

/** Mock entries for the "community-update" blog post */
export const communityEntries: readonly MockEntry[] = [
  {
    path: 'src/content/blog/community-update/community-update.en.md',
    content: `---
title: Community Update — March 2024
description: A recap of our community growth and upcoming events.
category: Community
pubDate: 2024-03-01
image: ./assets/cover.svg
lang: en
---

# Community Update

![Community cover](./assets/cover.svg)

Our community has grown to over 500 members.`,
  },
  {
    path: 'src/content/blog/community-update/community-update.ru.md',
    content: `---
title: Новости сообщества — март 2024
description: Обзор роста нашего сообщества и предстоящих событий.
category: Community
pubDate: 2024-03-01
image: ./assets/cover.svg
lang: ru
---

# Новости сообщества

![Обложка сообщества](./assets/cover.svg)

Наше сообщество выросло до более чем 500 участников.`,
  },
  ...communityAssets,
]
