import type { buildMembersState } from './members-section-state'

type S = ReturnType<typeof buildMembersState>

interface DialogControls {
  readonly openDialog: () => void
  readonly closeDialog: () => void
}

/**
 * Project the buildMembersState bag plus dialog handlers and
 * actions into the shape consumed by MembersSection.vue.
 *
 * @param s - State bag
 * @param ctl - Dialog open/close controls bundle
 * @param actions - Action handler map
 * @returns Public bundle for the section template
 */
export const projectMembersPublic = <A extends Record<string, unknown>>(
  s: S,
  ctl: DialogControls,
  actions: A
) => ({
  sorted: s.sorted,
  invitations: s.invitations,
  loading: s.loading,
  dialogOpen: s.dialogOpen,
  busy: s.busy,
  error: s.error,
  disabled: s.disabled,
  offline: s.offline,
  canEditSettings: s.canEditSettings,
  openDialog: ctl.openDialog,
  closeDialog: ctl.closeDialog,
  ...actions,
})
