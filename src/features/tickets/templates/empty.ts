import type {
  BugTemplate,
  TicketTemplateKind,
  UserStoryTemplate,
} from './types'

/**
 * Empty Bug template instance.
 * @returns A bug template with all fields blank
 */
export const emptyBug = (): BugTemplate => ({
  kind: 'bug',
  reproductionSteps: '',
  actualBehavior: '',
  expectedBehavior: '',
  description: '',
})

/**
 * Empty User Story template instance.
 * @returns A user-story template with all fields blank
 */
export const emptyUserStory = (): UserStoryTemplate => ({
  kind: 'user-story',
  iAs: '',
  wantTo: '',
  soThat: '',
  description: '',
})

/**
 * Build an empty template by kind.
 * @param kind - Template discriminator
 * @returns Empty template instance
 */
export const emptyTemplate = (kind: TicketTemplateKind) =>
  kind === 'bug' ? emptyBug() : emptyUserStory()
