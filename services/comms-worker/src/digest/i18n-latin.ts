import type { DigestChrome } from './i18n-types'

/** English digest chrome (en). */
export const CHROME_EN: DigestChrome = {
  subject: n =>
    `Communist Prometheus — ${n} new article${n === 1 ? '' : 's'}`,
  newIssueSubject: title => `Communist Prometheus — new issue: ${title}`,
  intro: 'Since your last digest:',
  readLabel: 'Read',
  newIssueLabel: 'New issue',
  currentIssueLabel: 'Current issue',
  unsubscribeLabel: 'Unsubscribe',
  unsubscribeNote:
    'If you no longer wish to receive these digests, click the link above.',
}

/** Italian digest chrome (it). */
export const CHROME_IT: DigestChrome = {
  subject: n => `Prometeo Comunista — ${n} nuovi articoli`,
  newIssueSubject: title => `Prometeo Comunista — nuovo numero: ${title}`,
  intro: 'Dal tuo ultimo digest:',
  readLabel: 'Leggi',
  newIssueLabel: 'Nuovo numero',
  currentIssueLabel: 'Numero attuale',
  unsubscribeLabel: 'Disiscriviti',
  unsubscribeNote:
    'Se non vuoi più ricevere questi digest, clicca il link qui sopra.',
}

/** Spanish digest chrome (es). */
export const CHROME_ES: DigestChrome = {
  subject: n => `Prometeo Comunista — ${n} nuevos artículos`,
  newIssueSubject: title => `Prometeo Comunista — nuevo número: ${title}`,
  intro: 'Desde tu último digest:',
  readLabel: 'Leer',
  newIssueLabel: 'Nuevo número',
  currentIssueLabel: 'Número actual',
  unsubscribeLabel: 'Cancelar suscripción',
  unsubscribeNote:
    'Si ya no quieres recibir estos digests, haz clic en el enlace superior.',
}

/** Polish digest chrome (pl). */
export const CHROME_PL: DigestChrome = {
  subject: n => `Komunistyczny Prometeusz — ${n} nowych artykułów`,
  newIssueSubject: title => `Komunistyczny Prometeusz — nowy numer: ${title}`,
  intro: 'Od ostatniego skrótu:',
  readLabel: 'Czytaj',
  newIssueLabel: 'Nowy numer',
  currentIssueLabel: 'Bieżący numer',
  unsubscribeLabel: 'Wypisz się',
  unsubscribeNote:
    'Jeśli nie chcesz już otrzymywać tych wiadomości, kliknij link powyżej.',
}
