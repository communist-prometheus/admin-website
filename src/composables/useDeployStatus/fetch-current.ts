/**
 * Fetch current latest version number from CF API.
 * @returns Version number or 0 on failure
 */
export const fetchCurrentVersion = async (): Promise<number> => {
  const r = await fetch('/api/deploy')
  if (!r.ok) return 0
  const d: { version?: number } = await r.json()
  return d.version ?? 0
}
