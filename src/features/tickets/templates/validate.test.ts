import { describe, expect, it } from 'vitest'
import { emptyBug, emptyUserStory } from './empty'
import type { BugTemplate, UserStoryTemplate } from './types'
import { validateTemplate } from './validate'

const filledBug = (overrides: Partial<BugTemplate> = {}): BugTemplate => ({
  ...emptyBug(),
  reproductionSteps: '1. Click',
  actualBehavior: 'crashed',
  expectedBehavior: 'no crash',
  ...overrides,
})

const filledUserStory = (
  overrides: Partial<UserStoryTemplate> = {}
): UserStoryTemplate => ({
  ...emptyUserStory(),
  iAs: 'editor',
  wantTo: 'attach photos',
  soThat: 'triage is faster',
  ...overrides,
})

describe('validateTemplate (Bug)', () => {
  it('passes when all three required sections are filled', () => {
    expect(validateTemplate(filledBug())).toEqual([])
  })

  it('reports each blank required section by label', () => {
    expect(validateTemplate(emptyBug())).toEqual([
      'Reproduction Steps',
      'Actual Behavior',
      'Expected Behavior',
    ])
  })

  it('only blank string is treated as missing (whitespace counts as blank)', () => {
    const t = filledBug({ reproductionSteps: '   \n\t' })
    expect(validateTemplate(t)).toEqual(['Reproduction Steps'])
  })

  it('description is optional', () => {
    expect(validateTemplate(filledBug({ description: '' }))).toEqual([])
  })
})

describe('validateTemplate (User Story)', () => {
  it('passes when all three required sections are filled', () => {
    expect(validateTemplate(filledUserStory())).toEqual([])
  })

  it('reports each blank required section by label', () => {
    expect(validateTemplate(emptyUserStory())).toEqual([
      'I as',
      'Want to',
      'So that',
    ])
  })

  it('description is optional', () => {
    expect(validateTemplate(filledUserStory({ description: '' }))).toEqual([])
  })
})
