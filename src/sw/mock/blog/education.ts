import type { MockEntry } from '../all-entries'
import { educationAssets } from './education-assets'

/** Mock entry for the "education-platform" blog post */
export const educationEntries: readonly MockEntry[] = [
  {
    path: 'src/content/blog/education-platform/education-platform.en.md',
    content: `---
title: Launching the Education Platform
description: Free educational resources for digital literacy.
category: Education
pubDate: 2024-03-20
lang: en
---

# Launching the Education Platform

Knowledge is the foundation of informed participation.`,
  },
  ...educationAssets,
]
