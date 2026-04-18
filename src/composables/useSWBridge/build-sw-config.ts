import { getGitHubConfig } from '@/config/github'
import type { SWGitConfig } from '@/sw/protocol'

const MOCK_TOKEN = 'mock-token'

/**
 * Author info for git commits.
 */
export interface SWAuthor {
  readonly name: string
  readonly username: string
}

/**
 * Build SW config from repo settings and token.
 * @param token - GitHub access token
 * @param author - Optional git commit author
 * @returns Complete SWGitConfig
 */
export const buildSWConfig = (
  token: string,
  author?: SWAuthor
): SWGitConfig => ({
  ...getGitHubConfig(),
  token,
  username: author?.username,
  authorName: author?.name ?? author?.username,
  authorEmail: author
    ? `${author.username}@users.noreply.github.com`
    : undefined,
  mock: token === MOCK_TOKEN,
})
