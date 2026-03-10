/**
 * Simple logger for SW bridge operations on the client side.
 * @param level - Log level
 * @param msg - Log message
 * @param data - Optional extra data
 */
export const log = (
  level: 'info' | 'warn' | 'error',
  msg: string,
  data?: Record<string, unknown>
): void => {
  const prefix = '[SW Bridge]'
  const method =
    level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'
  // biome-ignore lint/suspicious/noConsole: intentional SW lifecycle logging
  console[method](prefix, msg, data ?? '')
}
