/** IndexedDB database name for the action history store. */
export const HISTORY_DB_NAME = 'admin_action_history'

/** Object store name. */
export const HISTORY_STORE_NAME = 'entries'

/** Schema version. */
export const HISTORY_DB_VERSION = 1

/** Maximum entries kept in the ring buffer. */
export const MAX_ENTRIES = 1000

/** Maximum age of any retained entry, in milliseconds (60 minutes). */
export const MAX_AGE_MS = 60 * 60 * 1000

/** Maximum length of any free-text reason / errorMessage field. */
export const MAX_TEXT_LENGTH = 500
