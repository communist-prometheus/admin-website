import type { DigestChrome } from './i18n-types'

/** English digest chrome (en). */
export const CHROME_EN: DigestChrome = {
  subject: n =>
    `Communist Prometheus — ${n} new article${n === 1 ? '' : 's'}`,
  intro: 'Since your last digest:',
  readLabel: 'Read',
  unsubscribeLabel: 'Unsubscribe',
  unsubscribeNote:
    'If you no longer wish to receive these digests, click the link above.',
}

/** Italian digest chrome (it). */
export const CHROME_IT: DigestChrome = {
  subject: n => `Prometeo Comunista — ${n} nuovi articoli`,
  intro: 'Dal tuo ultimo digest:',
  readLabel: 'Leggi',
  unsubscribeLabel: 'Disiscriviti',
  unsubscribeNote:
    'Se non vuoi più ricevere questi digest, clicca il link qui sopra.',
}

/** Spanish digest chrome (es). */
export const CHROME_ES: DigestChrome = {
  subject: n => `Prometeo Comunista — ${n} nuevos artículos`,
  intro: 'Desde tu último digest:',
  readLabel: 'Leer',
  unsubscribeLabel: 'Cancelar suscripción',
  unsubscribeNote:
    'Si ya no quieres recibir estos digests, haz clic en el enlace superior.',
}

/** Polish digest chrome (pl). */
export const CHROME_PL: DigestChrome = {
  subject: n => `Komunistyczny Prometeusz — ${n} nowych artykułów`,
  intro: 'Od ostatniego skrótu:',
  readLabel: 'Czytaj',
  unsubscribeLabel: 'Wypisz się',
  unsubscribeNote:
    'Jeśli nie chcesz już otrzymywać tych wiadomości, kliknij link powyżej.',
}
