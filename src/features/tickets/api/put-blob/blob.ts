import { request } from './http'

/**
 * Create a blob object on the tickets repo with base64 content.
 * @param token - GitHub token with write access to the tickets repo.
 * @param content - Base64-encoded file content.
 * @returns The new blob's SHA.
 */
export const createBlob = async (
  token: string,
  content: string
): Promise<string> => {
  const res = await request(token, 'POST', 'blobs', 'create blob', {
    content,
    encoding: 'base64',
  })
  const data = await res.json()
  return data.sha
}
