import git from 'isomorphic-git'

/**
 * Compute the git blob SHA-1 for a string.
 * @param content - File content
 * @returns Git blob OID (40-char hex)
 */
export const computeBlobSha = async (content: string): Promise<string> => {
  const { oid } = await git.hashBlob({
    object: new TextEncoder().encode(content),
  })
  return oid
}
