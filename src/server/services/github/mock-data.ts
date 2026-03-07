import type { ContentType } from '@/types/github-content'

/** Raw mock file entry */
export interface MockFileEntry {
  readonly path: string
  readonly name: string
  readonly content: string
  readonly sha: string
}

const blogEntries: readonly MockFileEntry[] = [
  {
    path: 'src/content/blog/welcome-to-prometheus.en.md',
    name: 'welcome-to-prometheus.en.md',
    sha: 'mock-sha-blog-en-1',
    content: `---
title: Welcome to Prometheus
description: Discover our vision for a modern knowledge sharing platform built with cutting-edge technologies.
category: Announcement
pubDate: 2024-01-15
lang: en
---

# Welcome to Prometheus

We're excited to introduce **Prometheus** - a modern platform.`,
  },
  {
    path: 'src/content/blog/welcome-to-prometheus.ru.md',
    name: 'welcome-to-prometheus.ru.md',
    sha: 'mock-sha-blog-ru-1',
    content: `---
title: Добро пожаловать в Prometheus
description: Откройте для себя наше видение современной платформы.
category: Announcement
pubDate: 2024-01-15
lang: ru
---

# Добро пожаловать в Prometheus

Мы рады представить **Prometheus**.`,
  },
  {
    path: 'src/content/blog/welcome-to-prometheus.it.md',
    name: 'welcome-to-prometheus.it.md',
    sha: 'mock-sha-blog-it-1',
    content: `---
title: Benvenuti in Prometheus
description: Scoprite la nostra visione per una piattaforma moderna.
category: Announcement
pubDate: 2024-01-15
lang: it
---

# Benvenuti in Prometheus

Siamo entusiasti di presentare **Prometheus**.`,
  },
  {
    path: 'src/content/blog/welcome-to-prometheus.es.md',
    name: 'welcome-to-prometheus.es.md',
    sha: 'mock-sha-blog-es-1',
    content: `---
title: Bienvenidos a Prometheus
description: Descubre nuestra visión para una plataforma moderna.
category: Announcement
pubDate: 2024-01-15
lang: es
---

# Bienvenidos a Prometheus

Estamos emocionados de presentar **Prometheus**.`,
  },
]

const pagesEntries: readonly MockFileEntry[] = [
  {
    path: 'src/content/pages/manifest.en.md',
    name: 'manifest.en.md',
    sha: 'mock-sha-pages-en-1',
    content: `---
title: Our Manifest
lang: en
---

# Our Manifest

Our principles and values.`,
  },
]

const positionsEntries: readonly MockFileEntry[] = [
  {
    path: 'src/content/positions/digital-sovereignty.en.md',
    name: 'digital-sovereignty.en.md',
    sha: 'mock-sha-pos-en-1',
    content: `---
title: Digital Sovereignty
description: Technology must serve the people, not corporations.
order: 1
lang: en
---

# Digital Sovereignty

We advocate for open-source infrastructure.`,
  },
]

/** Mock entries grouped by content type */
export const mockEntriesByType: Record<
  ContentType,
  readonly MockFileEntry[]
> = {
  blog: blogEntries,
  pages: pagesEntries,
  positions: positionsEntries,
}

/** All mock entries as flat array */
export const allMockEntries: readonly MockFileEntry[] = [
  ...blogEntries,
  ...pagesEntries,
  ...positionsEntries,
]

/**
 * Create mutable storage map from mock entries
 * @returns Map of path to content/sha pairs
 */
export const createMockStorage = () => {
  const storage = new Map<string, { content: string; sha: string }>()
  for (const entry of allMockEntries) {
    storage.set(entry.path, {
      content: entry.content,
      sha: entry.sha,
    })
  }
  return storage
}
