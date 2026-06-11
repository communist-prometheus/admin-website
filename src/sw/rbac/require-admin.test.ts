import { afterEach, describe, expect, it, vi } from 'vitest'
import type { SWGitConfig } from '../protocol'
import { workerState } from '../state/state'
import { handleInvite } from './handle-invite'
import { handleRevokeInvite } from './handle-revoke-invite'
import { handleSetRole } from './handle-set-role'
import { setOrgAdmins } from './org-admin-cache'
import { requireAdmin } from './require-admin'

vi.mock('./org-role-ops', () => ({
  applyRole: vi.fn().mockResolvedValue(undefined),
}))
vi.mock('./invite-post', () => ({
  runInviteFromBody: vi.fn().mockResolvedValue(new Response('{}')),
}))
// resolve-role transitively imports lightning-fs, which touches
// indexedDB at module scope — absent under jsdom.
vi.mock('../git/io/read-file', () => ({
  readRepoFile: vi.fn().mockRejectedValue(new Error('no fs in tests')),
}))

const config = (username: string): SWGitConfig => ({
  owner: 'communist-prometheus',
  repo: 'public-website-content',
  branch: 'develop',
  contentPath: '',
  corsProxy: '/api/cors',
  token: 'tok',
  username,
})

const asUser = (username: string): void => {
  workerState.config = config(username)
}

const request = (body: object): Request =>
  new Request('http://sw.local/api/github/org-role', {
    method: 'POST',
    body: JSON.stringify(body),
  })

afterEach(() => {
  workerState.config = undefined
  setOrgAdmins([])
})

describe('requireAdmin', () => {
  it('rejects when SW has no config', () => {
    expect(requireAdmin()?.status).toBe(403)
  })

  it('rejects a non-admin user', () => {
    asUser('eve')
    expect(requireAdmin()?.status).toBe(403)
  })

  it('passes an org admin through', () => {
    asUser('alice')
    setOrgAdmins(['alice'])
    expect(requireAdmin()).toBeUndefined()
  })
})

describe('privileged RBAC handlers reject non-admins', () => {
  it('handleSetRole returns 403 for a non-admin', async () => {
    asUser('eve')
    const res = await handleSetRole(request({ login: 'eve', role: 'admin' }))
    expect(res.status).toBe(403)
  })

  it('handleInvite returns 403 for a non-admin', async () => {
    asUser('eve')
    const res = await handleInvite(
      request({ login: 'accomplice', role: 'admin' })
    )
    expect(res.status).toBe(403)
  })

  it('handleRevokeInvite returns 403 for a non-admin', async () => {
    asUser('eve')
    const res = await handleRevokeInvite('42')
    expect(res.status).toBe(403)
  })

  it('handleSetRole proceeds for an admin', async () => {
    asUser('alice')
    setOrgAdmins(['alice'])
    const res = await handleSetRole(request({ login: 'bob', role: 'editor' }))
    expect(res.status).toBe(200)
  })
})
