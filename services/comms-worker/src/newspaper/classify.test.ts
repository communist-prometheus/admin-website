import { describe, expect, it } from 'vitest'
import type { Article } from '../rss/types'
import type { Subscriber } from '../subscribers/types'
import { classifyNewspapers } from './classify'
import type { IssuesByLang } from './fetch'

const SUB: Subscriber = {
  id: 1,
  email: 'r@e.test',
  langs: ['ru', 'en'],
  status: 'active',
  createdAt: '2026-05-01T00:00:00.000Z',
  lastSentAt: undefined,
  unsubscribedAt: undefined,
}

const issue = (overrides: Partial<Article>): Article => ({
  guid: 'g',
  title: 'Issue #1',
  link: 'https://comprom.org/ru/newspaper/issue-1',
  lang: 'ru',
  pubDate: '2026-06-10T00:00:00.000Z',
  ...overrides,
})

const CUTOFF = Date.parse('2026-06-05T00:00:00.000Z')

describe('classifyNewspapers', () => {
  it('routes an issue published after the cutoff into announcements', () => {
    const byLang: IssuesByLang = {
      ru: issue({ guid: 'ru-2', pubDate: '2026-06-08T00:00:00.000Z' }),
    }
    const sel = classifyNewspapers({ ...SUB, langs: ['ru'] }, byLang, CUTOFF)
    expect(sel.announcements.map(a => a.guid)).toEqual(['ru-2'])
    expect(sel.current).toEqual([])
  })

  it('routes an issue predating the cutoff into current', () => {
    const byLang: IssuesByLang = {
      ru: issue({ guid: 'ru-1', pubDate: '2026-06-01T00:00:00.000Z' }),
    }
    const sel = classifyNewspapers({ ...SUB, langs: ['ru'] }, byLang, CUTOFF)
    expect(sel.announcements).toEqual([])
    expect(sel.current.map(a => a.guid)).toEqual(['ru-1'])
  })

  it('treats every issue as new when there is no cutoff yet', () => {
    const byLang: IssuesByLang = {
      ru: issue({ guid: 'ru-1', pubDate: '2020-01-01T00:00:00.000Z' }),
    }
    const sel = classifyNewspapers(
      { ...SUB, langs: ['ru'] },
      byLang,
      undefined
    )
    expect(sel.announcements.map(a => a.guid)).toEqual(['ru-1'])
  })

  it('de-duplicates the same issue shared across languages by guid', () => {
    const shared = issue({
      guid: 'shared',
      pubDate: '2026-06-09T00:00:00.000Z',
    })
    const byLang: IssuesByLang = { ru: shared, en: shared }
    const sel = classifyNewspapers(SUB, byLang, CUTOFF)
    expect(sel.announcements).toHaveLength(1)
    expect(sel.announcements[0]?.guid).toBe('shared')
  })

  it('drops an issue with an unparseable date (never announced)', () => {
    const byLang: IssuesByLang = {
      ru: issue({ guid: 'bad', pubDate: 'not-a-date' }),
    }
    const sel = classifyNewspapers({ ...SUB, langs: ['ru'] }, byLang, CUTOFF)
    expect(sel.announcements).toEqual([])
    expect(sel.current.map(a => a.guid)).toEqual(['bad'])
  })
})
