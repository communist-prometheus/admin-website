import type { LogLevel } from '@/sw/protocol'

/** CSS color map for log levels */
const LEVEL_COLORS: Record<LogLevel, string> = {
  debug: '#888',
  info: '#4fc3f7',
  warn: '#ffb74d',
  error: '#ef5350',
}

/**
 * Get the display color for a log level.
 * @param level - The log level
 * @returns CSS color string
 */
export const logLevelColor = (level: LogLevel): string => LEVEL_COLORS[level]
