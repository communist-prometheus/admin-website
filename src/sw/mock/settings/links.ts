/** Mock links document mirroring content `settings/links.json`. */
export const linksJson = JSON.stringify({
  groups: ['organizations', 'resources', 'friendly'],
  entries: [
    {
      url: 'https://www.leftcom.org',
      name: 'Internationalist Communist Tendency',
      category: 'organizations',
      inRing: true,
      descriptions: {
        en: 'Internationalist communist organisation.',
        ru: 'Интернационалистская коммунистическая организация.',
      },
    },
    {
      url: 'https://www.marxists.org',
      name: 'Marxists Internet Archive',
      category: 'resources',
      inRing: false,
      descriptions: {
        en: 'Archive of Marxist writers and documents.',
        ru: 'Архив произведений марксистских авторов.',
      },
    },
    {
      url: 'https://www.anarchy.bg',
      name: 'Anarchy.bg',
      category: 'friendly',
      inRing: false,
      descriptions: {
        en: 'Friendly anarchist resource.',
      },
    },
  ],
})
