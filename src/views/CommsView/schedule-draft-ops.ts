import type {
  Schedule,
  ScheduleWithNext,
} from '@/validation/schemas/schedule'

/** Default schedule applied when nothing has ever been persisted (R2.3). */
export const DEFAULT_SCHEDULE: Schedule = {
  cron: '0 12 * * 6',
  timezone: 'Europe/Moscow',
}

/**
 * Build the editor draft seed from the loaded schedule, falling back
 * to the spec default when the worker has nothing persisted yet.
 * @param loaded Schedule pulled from the worker, if any.
 * @returns Pure `{cron, timezone}` pair the editor binds to.
 */
export const initialDraft = (
  loaded: ScheduleWithNext | undefined
): Schedule =>
  loaded === undefined
    ? DEFAULT_SCHEDULE
    : { cron: loaded.cron, timezone: loaded.timezone }

/**
 * True iff the draft no longer matches the persisted schedule and
 * should therefore enable the Save button.
 * @param draft Current editor state.
 * @param loaded Last value pulled from the worker.
 * @returns Whether `draft` differs from `loaded`.
 */
export const hasChanged = (
  draft: Schedule,
  loaded: ScheduleWithNext | undefined
): boolean =>
  loaded === undefined ||
  draft.cron !== loaded.cron ||
  draft.timezone !== loaded.timezone

/**
 * Shape-only gate before letting the user submit: 5 whitespace-separated
 * fields and a non-empty timezone. The worker re-validates server-side.
 * @param draft Current editor state.
 * @returns Whether the Save button is allowed to fire.
 */
export const canSubmitSchedule = (draft: Schedule): boolean =>
  draft.cron.trim().split(/\s+/).length === 5 &&
  draft.cron.trim().length > 0 &&
  draft.timezone.trim().length > 0
