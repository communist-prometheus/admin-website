import git from 'isomorphic-git'
import { log } from '../logging/logger'
import { recordOp } from '../logging/metrics'
import { allMockEntries } from '../mock/all-entries'
import { fs, REPO_DIR } from './fs'
import { writeAndStage } from './write-file'

/**
 * Initialize a local git repo with mock data (no network).
 * Used in E2E tests instead of cloning from GitHub.
 * @returns The initial commit SHA
 */
export const initMockRepo = async (): Promise<string> => {
  const start = Date.now()
  log('info', 'git', 'Initializing mock repository')

  await git.init({ fs, dir: REPO_DIR, defaultBranch: 'main' })

  for (const entry of allMockEntries) {
    await writeAndStage(entry.path, entry.content)
  }

  const sha = await git.commit({
    fs,
    dir: REPO_DIR,
    message: 'Initial mock commit',
    author: { name: 'Mock', email: 'mock@test.local' },
  })

  recordOp('initMock', Date.now() - start)
  log('info', 'git', 'Mock repo ready', { sha: sha.slice(0, 7) })
  return sha
}
