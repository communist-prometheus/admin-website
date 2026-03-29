import { describe, expect, it } from 'vitest'
import { mergeDeployData } from './merge'
import type { CfDeploy, GhCommit } from './types'

const deploy = (createdOn: string, id = '1'): CfDeploy => ({
  id,
  createdOn,
  source: 'wrangler',
  versionId: 'v1',
})

const commit = (date: string, message = 'msg'): GhCommit => ({
  sha: 'abc1234',
  message,
  author: 'user',
  date,
})

describe('mergeDeployData', () => {
  it('matches deploy to closest prior commit', () => {
    const deploys = [deploy('2026-03-28T12:00:00Z')]
    const commits = [
      commit('2026-03-28T11:55:00Z', 'closest'),
      commit('2026-03-28T10:00:00Z', 'older'),
    ]
    const result = mergeDeployData(deploys, commits)
    expect(result[0]?.commit?.message).toBe('closest')
  })

  it('returns undefined commit when no match', () => {
    const deploys = [deploy('2026-03-28T08:00:00Z')]
    const commits = [commit('2026-03-28T12:00:00Z', 'future')]
    const result = mergeDeployData(deploys, commits)
    expect(result[0]?.commit).toBeUndefined()
  })

  it('handles empty commits', () => {
    const deploys = [deploy('2026-03-28T12:00:00Z')]
    const result = mergeDeployData(deploys, [])
    expect(result[0]?.commit).toBeUndefined()
  })

  it('handles empty deploys', () => {
    const result = mergeDeployData([], [commit('2026-03-28T12:00:00Z')])
    expect(result).toHaveLength(0)
  })
})
