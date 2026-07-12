import { COMMS_EN } from './comms-en'

/** English UI strings. Canonical source — every key listed here. */
export const EN = {
  nav: {
    comms: 'Newsletter',
    features: 'Features',
  },
  comms: COMMS_EN,
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
