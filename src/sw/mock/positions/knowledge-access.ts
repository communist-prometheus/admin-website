import type { MockEntry } from '../all-entries'
import { knowledgeTranslations } from './knowledge-access-translations'

/** Mock entries for the "knowledge-access" position */
export const knowledgeAccessEntries: readonly MockEntry[] = [
  {
    path: 'positions/knowledge-access.en.md',
    content: `---
title: Universal Knowledge Access
description: Education and knowledge should be freely available to everyone.
pubDate: 2024-02-01
lang: en
---

# Universal Knowledge Access

Everyone deserves equal access to knowledge.`,
  },
  {
    path: 'positions/knowledge-access.ru.md',
    content: `---
title: Всеобщий доступ к знаниям
description: Образование и знания должны быть свободно доступны каждому.
pubDate: 2024-02-01
lang: ru
---

# Всеобщий доступ к знаниям

Каждый заслуживает равного доступа к знаниям.`,
  },
  ...knowledgeTranslations,
]
