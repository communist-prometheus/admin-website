import { Effect } from 'effect'
import type { ContentType, GitHubFileContent } from '@/types/github-content'

/**
 * Mock GitHub content data
 */
const mockBlogFiles: GitHubFileContent[] = [
  {
    name: 'welcome-to-prometheus.en.md',
    path: 'src/content/blog/welcome-to-prometheus.en.md',
    sha: 'mock-sha-1',
    size: 1250,
    url: '',
    html_url: '',
    git_url: '',
    download_url: null,
    type: 'file',
    content: Buffer.from(`---
title: Welcome to Prometheus
description: Discover our vision for a modern knowledge sharing platform built with cutting-edge technologies.
category: Announcement
pubDate: 2024-01-15
lang: en
---

# Welcome to Prometheus

We're excited to introduce **Prometheus** - a modern platform.`).toString(
      'base64'
    ),
    encoding: 'base64',
  },
  {
    name: 'welcome-to-prometheus.ru.md',
    path: 'src/content/blog/welcome-to-prometheus.ru.md',
    sha: 'mock-sha-ru-1',
    size: 1250,
    url: '',
    html_url: '',
    git_url: '',
    download_url: null,
    type: 'file',
    content: Buffer.from(`---
title: Добро пожаловать в Prometheus
description: Откройте для себя наше видение современной платформы.
category: Announcement
pubDate: 2024-01-15
lang: ru
---

# Добро пожаловать в Prometheus

Мы рады представить **Prometheus**.`).toString('base64'),
    encoding: 'base64',
  },
]

const mockPagesFiles: GitHubFileContent[] = [
  {
    name: 'manifest.en.md',
    path: 'src/content/pages/manifest.en.md',
    sha: 'mock-sha-2',
    size: 1531,
    url: '',
    html_url: '',
    git_url: '',
    download_url: null,
    type: 'file',
    content: Buffer.from(`---
title: Our Manifest
lang: en
---

# Our Manifest

Our principles and values.`).toString('base64'),
    encoding: 'base64',
  },
]

const mockPositionsFiles: GitHubFileContent[] = [
  {
    name: 'digital-sovereignty.en.md',
    path: 'src/content/positions/digital-sovereignty.en.md',
    sha: 'mock-sha-3',
    size: 1204,
    url: '',
    html_url: '',
    git_url: '',
    download_url: null,
    type: 'file',
    content: Buffer.from(`---
title: Digital Sovereignty
description: Technology must serve the people, not corporations.
order: 1
lang: en
---

# Digital Sovereignty

We advocate for open-source infrastructure.`).toString('base64'),
    encoding: 'base64',
  },
]

const mockFiles: Record<ContentType, GitHubFileContent[]> = {
  blog: mockBlogFiles,
  pages: mockPagesFiles,
  positions: mockPositionsFiles,
}

/**
 * Mock GitHub content service
 */
export class MockContentService {
  private storage = new Map<string, { content: string; sha: string }>()

  /**
   * Initialize mock content service with sample data
   */
  constructor() {
    for (const [_type, files] of Object.entries(mockFiles)) {
      for (const file of files) {
        this.storage.set(file.path, {
          content: file.content || '',
          sha: file.sha,
        })
      }
    }
  }

  listContent = (type: ContentType) => Effect.succeed(mockFiles[type] || [])

  getFile = (path: string) => {
    const file = this.storage.get(path)
    if (!file) {
      return Effect.fail(new Error(`File not found: ${path}`))
    }

    const content = Buffer.from(file.content, 'base64').toString('utf-8')
    return Effect.succeed({
      content,
      sha: file.sha,
      path,
    })
  }

  updateFile = (
    path: string,
    content: string,
    _message: string,
    sha?: string
  ) => {
    const existing = this.storage.get(path)

    if (existing && sha && existing.sha !== sha) {
      return Effect.fail(new Error('SHA mismatch'))
    }

    const newSha = `mock-sha-${Date.now()}`
    this.storage.set(path, {
      content: Buffer.from(content).toString('base64'),
      sha: newSha,
    })

    return Effect.succeed({ commit: { sha: newSha } })
  }

  deleteFile = (path: string, _message: string, sha: string) => {
    const existing = this.storage.get(path)

    if (!existing) {
      return Effect.fail(new Error('File not found'))
    }

    if (existing.sha !== sha) {
      return Effect.fail(new Error('SHA mismatch'))
    }

    this.storage.delete(path)
    return Effect.succeed({ commit: { sha: 'deleted' } })
  }
}
