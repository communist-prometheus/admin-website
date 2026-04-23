import { describe, expect, it } from 'vitest'
import type { RolesConfig } from '@/types/role'
import { applyRoleChange } from './apply-role-change'

const base: RolesConfig = {
  roles: {
    admin: ['alice'],
    'chief-editor': ['bob'],
    editor: ['carol'],
  },
}

describe('applyRoleChange', () => {
  it('promotes an editor to chief-editor', () => {
    const r = applyRoleChange(base, 'carol', 'chief-editor')
    expect(r.roles.editor).not.toContain('carol')
    expect(r.roles['chief-editor']).toContain('carol')
    expect(r.roles.admin).toEqual(['alice'])
  })

  it('removes the user from all roles when role is undefined', () => {
    const r = applyRoleChange(base, 'alice', undefined)
    expect(r.roles.admin).toEqual([])
    expect(r.roles['chief-editor']).toEqual(['bob'])
    expect(r.roles.editor).toEqual(['carol'])
  })

  it('assigns a role to a previously unassigned user', () => {
    const r = applyRoleChange(base, 'dave', 'editor')
    expect(r.roles.editor).toEqual(['carol', 'dave'])
  })

  it('is case-insensitive when removing the prior entry', () => {
    const r = applyRoleChange(base, 'ALICE', 'editor')
    expect(r.roles.admin).toEqual([])
    expect(r.roles.editor).toEqual(['carol', 'ALICE'])
  })

  it('is idempotent when setting the same role twice', () => {
    const once = applyRoleChange(base, 'alice', 'admin')
    const twice = applyRoleChange(once, 'alice', 'admin')
    expect(twice.roles.admin).toEqual(['alice'])
  })
})
