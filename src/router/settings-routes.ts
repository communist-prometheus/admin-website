import type { RouteRecordRaw } from 'vue-router'

/**
 * Settings is split into sub-routes so a Chief Editor doesn't have to
 * scroll past Languages/Links/Labels just to reach Members. Each sub-
 * page mounts inside SettingsLayout with a sidebar (desktop) or
 * horizontal tab strip (mobile). The root path redirects to the first
 * section so an old `/settings` bookmark still lands somewhere.
 */
export const settingsRoute: RouteRecordRaw = {
  path: '/settings',
  meta: { requiresAuth: true },
  component: () => import('../views/SettingsView/SettingsLayout.vue'),
  redirect: '/settings/languages',
  children: [
    {
      path: 'languages',
      name: 'settings-languages',
      component: () =>
        import('../views/SettingsView/pages/LanguagesPage.vue'),
    },
    {
      path: 'links',
      name: 'settings-links',
      component: () => import('../views/SettingsView/pages/LinksPage.vue'),
    },
    {
      path: 'members',
      name: 'settings-members',
      component: () => import('../views/SettingsView/pages/MembersPage.vue'),
    },
    {
      path: 'history',
      name: 'settings-history',
      component: () => import('../views/SettingsView/pages/HistoryPage.vue'),
    },
    {
      path: 'reset',
      name: 'settings-reset',
      component: () => import('../views/SettingsView/pages/ResetPage.vue'),
    },
  ],
}
