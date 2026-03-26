import type { MockEntry } from '../all-entries'
import { mediaShowcaseAssets } from './media-showcase-assets'
import { mediaShowcaseTranslations } from './media-showcase-translations'

/** Mock entries for the "media-showcase" blog post */
export const mediaShowcaseEntries: readonly MockEntry[] = [
  {
    path: 'blog/media-showcase/index.en.md',
    content: `---
title: Rich Media in Blog Posts
description: A showcase of media types supported in Prometheus blog.
category: Technology
pubDate: 2024-02-10
image: ./assets/cover.jpg
lang: en
---

# Rich Media in Blog Posts

![Landscape](./assets/landscape.jpg)

![Architecture](./assets/architecture.svg)

<video controls preload="metadata" width="100%">
  <source src="./assets/demo.mp4" type="video/mp4" />
</video>

<audio controls preload="metadata">
  <source src="./assets/sample.m4a" type="audio/mp4" />
</audio>`,
  },
  ...mediaShowcaseAssets,
  ...mediaShowcaseTranslations,
]
