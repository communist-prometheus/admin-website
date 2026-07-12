/** English UI strings. Canonical source — every key listed here. */
export const EN = {
  nav: {
    comms: 'Newsletter',
    features: 'Features',
  },
  comms: {
    tabs: {
      settings: 'Settings',
      subscribers: 'Emails',
      log: 'Log',
    },
    title: 'Newsletter',
    lead: 'Subscribers receive a digest of new articles in the languages they pick. The schedule and cutoff are shared across the list.',
    schedule: {
      title: 'Schedule',
      lead: 'Cron expression + IANA timezone. Saved values drive the dispatch loop.',
    },
    cutoff: {
      title: 'Cutoff watermark',
      lead: 'Seed for new addresses, and the fallback for any that has never been mailed. What each subscriber actually gets is measured against their OWN Last sent stamp — edit that on the Emails tab to replay or skip a digest for one address.',
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
      title: 'Send log',
      lead: 'One row per recipient per run. Click a failed row to reveal its error. For a single address, open its Last sent cell on the Emails tab.',
      more: 'Load older',
      loading: 'Loading…',
    },
  },
  features: {
    title: 'Feature flags',
    lead: 'Build-time switches for the public site. Each commit triggers a rebuild; the new bundle ships with the chosen subset of features.',
    save: 'Save',
    saving: 'Saving…',
    loading: 'Loading current flags…',
    webring: {
      title: 'Revolutionary Internationalists webring',
      desc: 'Includes the webring web component + CDN bundle in the public-site footer.',
    },
  },
} as const
