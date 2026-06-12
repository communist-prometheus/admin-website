import { describe, expect, it } from 'vitest'
import type { TicketAttachment } from './attachment-types'
import { buildBody } from './build-body'
import { parseBody } from './parse-body'
import type { BugTemplate, UserStoryTemplate } from './types'

const bug: BugTemplate = {
  kind: 'bug',
  reproductionSteps: '1. Open\n2. Click',
  actualBehavior: 'It crashed',
  expectedBehavior: 'It should not crash',
  description: 'Extra context',
}

const userStory: UserStoryTemplate = {
  kind: 'user-story',
  iAs: 'an editor',
  wantTo: 'attach screenshots',
  soThat: 'triage is faster',
  description: '',
}

const image: TicketAttachment = {
  id: 'abc',
  name: 'screenshot.png',
  url: 'https://raw/x/screenshot.png',
  kind: 'image',
  sizeBytes: 1024,
}

describe('buildBody', () => {
  it('emits the four bug sections as ## headings', () => {
    const md = buildBody(bug)
    expect(md).toContain('## Reproduction Steps')
    expect(md).toContain('## Actual Behavior')
    expect(md).toContain('## Expected Behavior')
    expect(md).toContain('## Description')
  })

  it('emits the four user-story sections as ## headings', () => {
    const md = buildBody(userStory)
    expect(md).toContain('## I as')
    expect(md).toContain('## Want to')
    expect(md).toContain('## So that')
  })

  it('renders image attachment as a plain link (private repo, no embeds)', () => {
    const md = buildBody(bug, [image])
    expect(md).toContain('## Attachments')
    expect(md).toContain('[screenshot.png](https://raw/x/screenshot.png)')
    expect(md).not.toContain('![screenshot.png]')
  })

  it('round-trips through parseBody preserving section text', () => {
    const sections = parseBody(buildBody(bug))
    const map = new Map(sections.map(s => [s.label, s.text]))
    expect(map.get('Reproduction Steps')).toBe(bug.reproductionSteps)
    expect(map.get('Actual Behavior')).toBe(bug.actualBehavior)
    expect(map.get('Expected Behavior')).toBe(bug.expectedBehavior)
    expect(map.get('Description')).toBe(bug.description)
  })

  it('treats empty optional Description as blank on round-trip', () => {
    const sections = parseBody(buildBody(userStory))
    const desc = sections.find(s => s.label === 'Description')
    expect(desc?.text).toBe('')
  })
})

describe('parseBody (legacy bodies)', () => {
  it('returns empty array for free-form text without our headings', () => {
    expect(parseBody('Just some legacy plaintext')).toEqual([])
  })

  it('ignores unrelated headings', () => {
    expect(parseBody('## Random heading\n\nfoo')).toEqual([])
  })
})
