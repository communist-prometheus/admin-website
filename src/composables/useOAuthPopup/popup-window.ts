/**
 * Open a centered popup window for OAuth.
 * @param url - The authorize URL
 * @returns Popup window reference or null
 */
export const createPopupWindow = (url: string) => {
  const width = 600
  const height = 700
  const left = (globalThis.screen.width - width) / 2
  const top = (globalThis.screen.height - height) / 2
  return globalThis.open(
    url,
    'github-oauth',
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,location=no,status=no`
  )
}
