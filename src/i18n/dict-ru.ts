import { COMMS_RU } from './comms-ru'

/** Russian UI strings. */
export const RU = {
  nav: {
    comms: 'Рассылка',
    features: 'Фичи',
  },
  comms: COMMS_RU,
  features: {
    title: 'Флаги фич',
    lead: 'Билд-тайм переключатели публичного сайта. Каждое сохранение запускает пересборку; в финальный бандл попадают только включённые фичи.',
    save: 'Сохранить',
    saving: 'Сохраняем…',
    loading: 'Загружаем текущие флаги…',
    webring: {
      title: 'Webring «Революционные интернационалисты»',
      desc: 'Подключает webring-компонент + CDN-бандл в футере публичного сайта.',
    },
  },
} as const
