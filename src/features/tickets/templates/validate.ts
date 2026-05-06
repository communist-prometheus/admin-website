import type { BugTemplate, TicketTemplate, UserStoryTemplate } from './types'

const isBlank = (s: string): boolean => s.trim().length === 0

const checkField = (label: string, value: string): readonly string[] =>
  isBlank(value) ? [label] : []

const validateBug = (t: BugTemplate): readonly string[] => [
  ...checkField('Reproduction Steps', t.reproductionSteps),
  ...checkField('Actual Behavior', t.actualBehavior),
  ...checkField('Expected Behavior', t.expectedBehavior),
]

const validateUserStory = (t: UserStoryTemplate): readonly string[] => [
  ...checkField('I as', t.iAs),
  ...checkField('Want to', t.wantTo),
  ...checkField('So that', t.soThat),
]

/**
 * Validate required fields on a ticket template.
 * @param t - Template instance
 * @returns Array of human-readable missing-field labels (empty = ok)
 */
export const validateTemplate = (t: TicketTemplate): readonly string[] =>
  t.kind === 'bug' ? validateBug(t) : validateUserStory(t)
