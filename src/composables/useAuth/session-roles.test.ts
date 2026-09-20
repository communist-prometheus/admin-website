import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  notifySsoRoles,
  onSsoRoles,
  resetSsoRolesListener,
} from './session-roles'

/*
 * `mintSession` used to push the freshly-minted roles straight into the
 * Pinia auth store, which is why the rebuilt admin — a Lit app that has no
 * store — still pulled `vue` and `pinia` into its bundle through a single
 * import. The mint now announces the roles and the previous client is the
 * one that subscribes, so the dependency points the right way: the Vue
 * layer knows about auth, auth knows nothing about Vue.
 */

beforeEach(() => {
  resetSsoRolesListener()
})

describe('announcing freshly minted roles', () => {
  it('does nothing when nobody is listening', () => {
    expect(() => notifySsoRoles(['owner'])).not.toThrow()
  })

  it('hands the roles to the registered listener', () => {
    const seen = vi.fn()
    onSsoRoles(seen)
    notifySsoRoles(['owner', 'editor'])
    expect(seen).toHaveBeenCalledWith(['owner', 'editor'])
  })

  it('keeps the last listener registered, not a growing pile', () => {
    const first = vi.fn()
    const second = vi.fn()
    onSsoRoles(first)
    onSsoRoles(second)
    notifySsoRoles(['owner'])
    expect(first).not.toHaveBeenCalled()
    expect(second).toHaveBeenCalledWith(['owner'])
  })

  it('survives a listener that throws, so a mint is never lost to UI code', () => {
    onSsoRoles(() => {
      throw new Error('store not ready')
    })
    expect(() => notifySsoRoles(['owner'])).not.toThrow()
  })
})
