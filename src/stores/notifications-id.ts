/**
 * Build a stable identifier for a notification entry. Uses
 * `crypto.randomUUID` when available; otherwise falls back to a
 * timestamp + random base-36 fragment which is unique enough for
 * the in-memory queue lifecycle.
 * @returns Opaque unique identifier.
 */
export const generateNotificationId = (): string =>
  globalThis.crypto?.randomUUID?.() ??
  `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
