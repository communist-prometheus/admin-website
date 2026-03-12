type Git = typeof import('isomorphic-git').default

let _git: Git | undefined

/**
 * Lazily load isomorphic-git with Buffer polyfill.
 * Deferred to enable code-splitting — the heavy git+buffer
 * bundle (~150KB) is only downloaded when real git ops run.
 * @returns isomorphic-git default export
 */
export const loadGit = async (): Promise<Git> => {
  if (_git) return _git
  // biome-ignore lint/style/useNodejsImportProtocol: npm buffer polyfill, not Node built-in
  const { Buffer } = await import('buffer')
  if (!('Buffer' in globalThis)) {
    Object.defineProperty(globalThis, 'Buffer', {
      value: Buffer,
      writable: true,
      configurable: true,
    })
  }
  const mod = await import('isomorphic-git')
  _git = mod.default
  return _git
}
