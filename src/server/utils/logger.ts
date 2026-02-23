/**
 * Logger service for application-wide logging
 * Currently uses console, will be replaced with OpenTelemetry in the future
 */

/**
 * Log an error message
 * @param message - Error message to log
 * @param error - Optional error object
 */
export const logError = (message: string, error?: unknown): void => {
  console.error(message, error)
}

/**
 * Log an info message
 * @param message - Info message to log
 */
export const logInfo = (message: string): void => {
  console.info(message)
}

/**
 * Log a warning message
 * @param message - Warning message to log
 */
export const logWarn = (message: string): void => {
  console.warn(message)
}

/**
 * Log a debug message
 * @param message - Debug message to log
 * @param data - Optional data to log
 */
export const logDebug = (message: string, data?: unknown): void => {
  console.debug(message, data)
}
