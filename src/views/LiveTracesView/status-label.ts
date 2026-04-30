import type { TraceStreamStatus } from '@/composables/useTracing/remote-span'

/**
 * Human-readable label for the SSE connection state. Used by
 * the status pill on the live trace panel.
 * @param status Current `useTraceStream` status.
 * @returns Localised label string (English for now).
 */
export const statusLabel = (status: TraceStreamStatus): string =>
  status === 'connecting'
    ? 'Connecting…'
    : status === 'open'
      ? 'Connected'
      : status === 'reconnecting'
        ? 'Reconnecting…'
        : 'Closed'
