import type { ConfirmationChrome } from './i18n-types'

/** English confirmation chrome (en). */
export const CONF_EN: ConfirmationChrome = {
  title: 'Unsubscribed — Communist Prometheus',
  confirmHeading: 'Confirm unsubscribe',
  confirmBody:
    'Click the button below to stop receiving the newsletter at this address.',
  confirmButton: 'Unsubscribe',
  unsubscribedHeading: 'You have been unsubscribed',
  unsubscribedBody:
    'You will no longer receive the Communist Prometheus newsletter at this address.',
  reSubscribeLabel: 'Re-subscribe by email',
  expiredHeading: 'This link has expired',
  expiredBody:
    'The unsubscribe link is no longer valid. If you still want to unsubscribe, contact us.',
}

/** Italian confirmation chrome (it). */
export const CONF_IT: ConfirmationChrome = {
  title: 'Disiscritto — Prometeo Comunista',
  confirmHeading: 'Conferma la disiscrizione',
  confirmBody:
    'Premi il pulsante qui sotto per non ricevere più la newsletter a questo indirizzo.',
  confirmButton: 'Disiscriviti',
  unsubscribedHeading: 'Sei stato disiscritto',
  unsubscribedBody:
    'Non riceverai più la newsletter di Prometeo Comunista a questo indirizzo.',
  reSubscribeLabel: 'Iscriviti di nuovo via email',
  expiredHeading: 'Questo link è scaduto',
  expiredBody:
    'Il link di disiscrizione non è più valido. Se vuoi ancora disiscriverti, contattaci.',
}

export { CONF_ES, CONF_PL } from './i18n-latin-more'
