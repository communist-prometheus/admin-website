/**
 * Creates interval monitor to detect popup window close.
 * @param popup - Popup window instance to monitor
 * @param onClose - Callback when popup closes
 * @returns Interval ID for the monitor
 */
export const createPopupMonitor = (
  popup: Window | null,
  onClose: () => void
) => {
  const checkPopup = setInterval(() => {
    if (popup?.closed) {
      clearInterval(checkPopup)
      onClose()
    }
  }, 500)
  return checkPopup
}
