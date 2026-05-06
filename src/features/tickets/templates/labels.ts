/**
 * Canonical labels for each section, used both when serialising the
 * issue body (`## Reproduction Steps`) and when re-rendering the
 * detail view as labelled blocks. Keep them in one place so the body
 * builder, the body parser, and the UI never disagree on wording —
 * a typo on either side is what makes "parse-back" lossy.
 */
export const SECTION_LABELS = {
  reproductionSteps: 'Reproduction Steps',
  actualBehavior: 'Actual Behavior',
  expectedBehavior: 'Expected Behavior',
  iAs: 'I as',
  wantTo: 'Want to',
  soThat: 'So that',
  description: 'Description',
  attachments: 'Attachments',
} as const

/** Bug section labels in canonical order. */
export const BUG_LABELS = [
  SECTION_LABELS.reproductionSteps,
  SECTION_LABELS.actualBehavior,
  SECTION_LABELS.expectedBehavior,
  SECTION_LABELS.description,
] as const

/** User Story section labels in canonical order. */
export const USER_STORY_LABELS = [
  SECTION_LABELS.iAs,
  SECTION_LABELS.wantTo,
  SECTION_LABELS.soThat,
  SECTION_LABELS.description,
] as const
