import { describe, expect, it } from 'vitest'
import type { RolesConfig } from '@/types/role'
import { mergeMembers } from './merge-members'

const cfg: RolesConfig = {
  roles: {
    admin: ['alice'],
    'chief-editor': ['bob'],
    editor: ['carol'],
  },
}

describe('mergeMembers', () => {
  it('tags each org member with their app role when present', () => {
    const rows = mergeMembers(
      [
        { login: 'alice', orgRole: 'admin' },
        { login: 'bob', orgRole: 'member' },
        { login: 'dave', orgRole: 'member' },
      ],
      cfg
    )
    expect(rows.map(r => `${r.login}:${r.appRole ?? '—'}`)).toEqual([
      'alice:admin',
      'bob:chief-editor',
      'dave:—',
    ])
  })

  it('matches the app role case-insensitively', () => {
    const rows = mergeMembers([{ login: 'ALICE', orgRole: 'member' }], cfg)
    expect(rows[0]?.appRole).toBe('admin')
  })

  it('sorts by app role then org role then login', () => {
    const rows = mergeMembers(
      [
        { login: 'z-editor', orgRole: 'member' },
        { login: 'a-editor', orgRole: 'admin' },
        { login: 'm-none', orgRole: 'member' },
        { login: 'alice', orgRole: 'admin' },
      ],
      {
        roles: {
          admin: ['alice'],
          'chief-editor': [],
          editor: ['z-editor', 'a-editor'],
        },
      }
    )
    expect(rows.map(r => r.login)).toEqual([
      'alice',
      'a-editor',
      'z-editor',
      'm-none',
    ])
  })

  it('returns an empty list when there are no org members', () => {
    expect(mergeMembers([], cfg)).toEqual([])
  })
})
