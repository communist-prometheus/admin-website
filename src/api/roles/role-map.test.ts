import { describe, expect, it } from 'vitest'
import { EMPTY_ROLE_MAP, type RoleMap, resolveFromMap } from './role-map'
import { applyRole } from './role-mutate'

const MAP: RoleMap = {
  editor: ['ed'],
  'chief-editor': ['chief'],
  admin: ['boss'],
}

describe('resolveFromMap', () => {
  it('returns the role a login is granted', () => {
    expect(resolveFromMap(MAP, 'ed')).toBe('editor')
    expect(resolveFromMap(MAP, 'chief')).toBe('chief-editor')
    expect(resolveFromMap(MAP, 'boss')).toBe('admin')
  })

  it('is case-insensitive', () => {
    expect(resolveFromMap(MAP, 'ED')).toBe('editor')
  })

  it('returns undefined for an ungranted login', () => {
    expect(resolveFromMap(MAP, 'nobody')).toBeUndefined()
  })

  it('returns the highest role when listed in several', () => {
    const multi: RoleMap = { editor: ['x'], 'chief-editor': [], admin: ['x'] }
    expect(resolveFromMap(multi, 'x')).toBe('admin')
  })
})

describe('applyRole', () => {
  it('adds a login to the target role', () => {
    const next = applyRole(EMPTY_ROLE_MAP, 'neo', 'chief-editor')
    expect(next['chief-editor']).toEqual(['neo'])
  })

  it('moves a login between roles (no duplicate)', () => {
    const next = applyRole(MAP, 'ed', 'admin')
    expect(next.editor).toEqual([])
    expect(next.admin).toContain('ed')
    expect(resolveFromMap(next, 'ed')).toBe('admin')
  })

  it('clears a login with `none`', () => {
    const next = applyRole(MAP, 'boss', 'none')
    expect(resolveFromMap(next, 'boss')).toBeUndefined()
  })

  it('does not mutate the input map', () => {
    applyRole(MAP, 'ed', 'none')
    expect(MAP.editor).toEqual(['ed'])
  })
})
