/** English UI strings. Canonical source — every key listed here. */
export const EN = {
  nav: {
    comms: 'Newsletter',
  },
  comms: {
    title: 'Newsletter',
    lead: 'Subscribers receive a digest of new articles in the languages they pick. The schedule and cutoff are shared across the list.',
    schedule: {
      title: 'Schedule',
      lead: 'Cron expression + IANA timezone. Saved values drive the dispatch loop.',
    },
    cutoff: {
      title: 'Cutoff watermark',
      lead: 'Single shared "last run at" moment. Articles published after it count as new. Auto-advances on every successful tick; can be moved manually.',
    },
    subscribers: {
      title: 'Subscribers',
      lead: 'Each row receives the digest in the languages it has selected.',
    },
    testDispatch: {
      title: 'Test dispatch',
      lead: "Owner-only — fires the dispatch loop immediately for testing. Doesn't modify the saved schedule.",
    },
    runHistory: {
      title: 'Run history',
      lead: 'Last twenty dispatch attempts. Click a failed row to reveal its error message.',
    },
  },
} as const
