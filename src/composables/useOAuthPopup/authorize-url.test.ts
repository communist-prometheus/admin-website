import { beforeEach, describe, expect, it } from 'vitest'
import {
  loadAndClearState,
  loadAndClearVerifier,
} from '../useAuth/pkce-storage'
import { buildAuthorizeUrl } from './authorize-url'

describe('buildAuthorizeUrl', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('includes a state parameter and persists it for the callback', async () => {
    const url = new URL(await buildAuthorizeUrl())
    const state = url.searchParams.get('state')
    expect(state).toBeTruthy()
    expect(loadAndClearState()).toBe(state)
  })

  it('generates a fresh state per flow', async () => {
    const first = new URL(await buildAuthorizeUrl()).searchParams.get('state')
    const second = new URL(await buildAuthorizeUrl()).searchParams.get(
      'state'
    )
    expect(first).not.toBe(second)
  })

  it('keeps the PKCE pair intact alongside state', async () => {
    const url = new URL(await buildAuthorizeUrl())
    expect(url.searchParams.get('code_challenge')).toBeTruthy()
    expect(url.searchParams.get('code_challenge_method')).toBe('S256')
    expect(loadAndClearVerifier()).toBeTruthy()
  })

  it('state is single-use', async () => {
    await buildAuthorizeUrl()
    loadAndClearState()
    expect(loadAndClearState()).toBeUndefined()
  })
})
