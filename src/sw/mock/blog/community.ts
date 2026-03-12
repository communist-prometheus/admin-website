import type { MockEntry } from '../all-entries'

/** Mock entries for the "community-update" blog post */
export const communityEntries: readonly MockEntry[] = [
  {
    path: 'src/content/blog/community-update.en.md',
    content: `---
title: Community Update — March 2024
description: A recap of our community growth and upcoming events.
category: Community
pubDate: 2024-03-01
lang: en
---

# Community Update

Our community has grown to over 500 members.`,
  },
  {
    path: 'src/content/blog/community-update.ru.md',
    content: `---
title: Новости сообщества — март 2024
description: Обзор роста нашего сообщества и предстоящих событий.
category: Community
pubDate: 2024-03-01
lang: ru
---

# Новости сообщества

Наше сообщество выросло до более чем 500 участников.`,
  },
]
