import type { DigestChrome } from './i18n-types'

/** Russian digest chrome (ru). */
export const CHROME_RU: DigestChrome = {
  subject: n => `Коммунистический Прометей — ${n} новых статей`,
  newIssueSubject: title =>
    `Коммунистический Прометей — новый выпуск: ${title}`,
  intro: 'С момента последнего дайджеста:',
  readLabel: 'Читать',
  newIssueLabel: 'Новый выпуск',
  currentIssueLabel: 'Текущий выпуск',
  unsubscribeLabel: 'Отписаться',
  unsubscribeNote:
    'Если вы больше не хотите получать эти письма, перейдите по ссылке выше.',
}

/** Ukrainian digest chrome (uk). */
export const CHROME_UK: DigestChrome = {
  subject: n => `Комуністичний Прометей — ${n} нових статей`,
  newIssueSubject: title => `Комуністичний Прометей — новий випуск: ${title}`,
  intro: 'З моменту попереднього випуску:',
  readLabel: 'Читати',
  newIssueLabel: 'Новий випуск',
  currentIssueLabel: 'Поточний випуск',
  unsubscribeLabel: 'Відписатися',
  unsubscribeNote:
    'Якщо ви більше не хочете отримувати ці листи, перейдіть за посиланням вище.',
}

/** Belarusian digest chrome (bl). */
export const CHROME_BL: DigestChrome = {
  subject: n => `Камуністычны Праметэй — ${n} новых артыкулаў`,
  newIssueSubject: title => `Камуністычны Праметэй — новы нумар: ${title}`,
  intro: 'З моманту папярэдняга выпуску:',
  readLabel: 'Чытаць',
  newIssueLabel: 'Новы нумар',
  currentIssueLabel: 'Бягучы нумар',
  unsubscribeLabel: 'Адпісацца',
  unsubscribeNote:
    'Калі вы больш не хочаце атрымліваць гэтыя лісты, перайдзіце па спасылцы вышэй.',
}
