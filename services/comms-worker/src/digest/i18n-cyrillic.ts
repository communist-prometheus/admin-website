import type { DigestChrome } from './i18n-types'

/** Russian digest chrome (ru). */
export const CHROME_RU: DigestChrome = {
  subject: n => `Коммунистический Прометей — ${n} новых статей`,
  intro: 'С момента последнего дайджеста:',
  readLabel: 'Читать',
  unsubscribeLabel: 'Отписаться',
  unsubscribeNote:
    'Если вы больше не хотите получать эти письма, перейдите по ссылке выше.',
}

/** Ukrainian digest chrome (uk). */
export const CHROME_UK: DigestChrome = {
  subject: n => `Комуністичний Прометей — ${n} нових статей`,
  intro: 'З моменту попереднього випуску:',
  readLabel: 'Читати',
  unsubscribeLabel: 'Відписатися',
  unsubscribeNote:
    'Якщо ви більше не хочете отримувати ці листи, перейдіть за посиланням вище.',
}

/** Belarusian digest chrome (bl). */
export const CHROME_BL: DigestChrome = {
  subject: n => `Камуністычны Праметэй — ${n} новых артыкулаў`,
  intro: 'З моманту папярэдняга выпуску:',
  readLabel: 'Чытаць',
  unsubscribeLabel: 'Адпісацца',
  unsubscribeNote:
    'Калі вы больш не хочаце атрымліваць гэтыя лісты, перайдзіце па спасылцы вышэй.',
}
