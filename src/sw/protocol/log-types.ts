/** Log levels for structured logging */
export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

/** Log categories */
export type LogCategory =
  | 'git'
  | 'fs'
  | 'auth'
  | 'cache'
  | 'lifecycle'
  | 'rbac'

/** Structured log entry */
export interface LogEntry {
  readonly ts: number
  readonly level: LogLevel
  readonly cat: LogCategory
  readonly msg: string
  readonly data?: Record<string, unknown>
  readonly spanId?: string
}
