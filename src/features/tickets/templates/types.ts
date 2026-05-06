/** Ticket template kind. */
export type TicketTemplateKind = 'bug' | 'user-story'

/** Bug template fields. */
export interface BugTemplate {
  readonly kind: 'bug'
  readonly reproductionSteps: string
  readonly actualBehavior: string
  readonly expectedBehavior: string
  readonly description: string
}

/** User Story template fields. */
export interface UserStoryTemplate {
  readonly kind: 'user-story'
  readonly iAs: string
  readonly wantTo: string
  readonly soThat: string
  readonly description: string
}

/** Discriminated union of all ticket templates. */
export type TicketTemplate = BugTemplate | UserStoryTemplate

/** A parsed-back, labelled section ready for display. */
export interface TicketSection {
  readonly label: string
  readonly text: string
}
