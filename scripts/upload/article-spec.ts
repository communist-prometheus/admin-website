/**
 * Authoritative mapping between docx files (RU + IT) and the
 * target slot in the public-website-content repo. Singletons go
 * to `pages/`; everything else goes to `blog/` with a category
 * label.
 */
export type ArticleKind = 'page' | 'blog'

export type ArticleSpec = {
  readonly kind: ArticleKind
  readonly slug: string
  /** Category key from `settings/labels.json` (blog only). */
  readonly category?: string
  readonly ru: string
  readonly it: string
}

const ROOT_RU = 'Rus'
const ROOT_IT = 'Ita'

/** RU + IT pairs the user provided. */
export const SPECS: ReadonlyArray<ArticleSpec> = [
  {
    kind: 'page',
    slug: 'about',
    ru: 'О нас.docx',
    it: 'Noi - it.docx',
  },
  {
    kind: 'page',
    slug: 'manifest',
    ru: 'Манифест_группы_“Коммунистический_Прометей”.docx',
    it: 'Manifesto del gruppo Prometeo comunista (it).docx',
  },
  {
    kind: 'blog',
    slug: 'editorial-note',
    category: 'editorial',
    ru: 'Nota della redazione.docx',
    it: 'Dalla redazione - it.docx',
  },
  {
    kind: 'blog',
    slug: 'international-review-april-2026',
    category: 'international',
    ru: 'МЕЖДУНАРОДНЫЙ ОБЗОР АПРЕЛЬ 2026.docx',
    it: 'INTERNATIONAL REVIEW ita.docx',
  },
  {
    kind: 'blog',
    slug: 'about-the-manifesto',
    category: 'programme',
    ru: 'По поводу “Манифеста”.docx',
    it: 'A proposito del Manifesto (ita).docx',
  },
  {
    kind: 'blog',
    slug: 'programme-outline',
    category: 'programme',
    ru: 'Набросок_программы_Интернационалистской_коммунистической_партии.docx',
    it: 'Il schema di Programma del Partito comunista internazionalista.docx',
  },
  {
    kind: 'blog',
    slug: 'programme-outline-intro',
    category: 'programme',
    ru: 'Введение_к_“Наброску_программы”_Интернационалистской_коммунистической.docx',
    it: 'Schema di programma intro.docx',
  },
  {
    kind: 'blog',
    slug: 'iran-imperialism-crisis',
    category: 'international',
    ru: 'Иран_как_нервный_узел_кризиса_империализма.docx',
    it: "Iran come punto nevralgico della crisi dell'imperialismo ita.docx",
  },
  {
    kind: 'blog',
    slug: 'from-manchester-to-global',
    category: 'history',
    ru: 'От_Манчестера_Энгельса_к_глобальному_Манчестеру.docx',
    it: 'Da Manchester di Engels al Manchester globale ita.docx',
  },
  {
    kind: 'blog',
    slug: 'last-battle-of-the-bolsheviks',
    category: 'history',
    ru: 'Последнее сражение большевиков.docx',
    it: 'L’ultima battaglia dei bolscevichi - it.docx',
  },
  {
    kind: 'blog',
    slug: 'in-search-of-the-way',
    category: 'history',
    ru: 'В поисках пути.docx',
    it: 'In cerca della via - it.docx',
  },
  {
    kind: 'blog',
    slug: 'productivity-apologetics',
    category: 'critique',
    ru: 'АПОЛОГЕТИЧЕСКАЯ_КОНЦЕПЦИЯ_ПРОИЗВОДИТЕЛЬНОСТИ_ВСЕХ_ПРОФЕССИЙ.docx',
    it: 'CONCETTO APOLOGETICO DI PRODUTTIVIT� DI TUTTE LE PROFESSIONI.docx',
  },
  {
    kind: 'blog',
    slug: 'appeal-to-russian-workers',
    category: 'appeal',
    ru: 'ОБРАЩЕНИЕ К РАБОЧИМ РОССИИ.docx',
    it: 'APPELLO AI LAVORATORI DELLA RUSSIA - it.docx',
  },
]

/** Source roots — passed as the first arg to the upload script. */
export const SOURCE_DIRS = { ru: ROOT_RU, it: ROOT_IT } as const

/**
 * Categories used by the new article set. Translations cover the
 * languages currently shipped on the public site.
 */
export const CATEGORIES = [
  {
    key: 'editorial',
    translations: {
      en: 'Editorial',
      ru: 'Редакционная статья',
      it: 'Editoriale',
      es: 'Editorial',
    },
  },
  {
    key: 'international',
    translations: {
      en: 'International politics',
      ru: 'Международная политика',
      it: 'Politica internazionale',
      es: 'Política internacional',
    },
  },
  {
    key: 'programme',
    translations: {
      en: 'Programme',
      ru: 'Программа',
      it: 'Programma',
      es: 'Programa',
    },
  },
  {
    key: 'history',
    translations: {
      en: 'History',
      ru: 'История',
      it: 'Storia',
      es: 'Historia',
    },
  },
  {
    key: 'critique',
    translations: {
      en: 'Critique',
      ru: 'Критика',
      it: 'Critica',
      es: 'Crítica',
    },
  },
  {
    key: 'appeal',
    translations: {
      en: 'Appeal',
      ru: 'Обращения',
      it: 'Appello',
      es: 'Llamamiento',
    },
  },
] as const
