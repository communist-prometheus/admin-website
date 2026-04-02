/**
 * Build-time flag set by vite.sw.config.ts.
 * When true, isomorphic-git + buffer are tree-shaken
 * from the SW bundle (~200KB savings).
 */
declare const __MOCK_MODE__: boolean

/** Git commit hash injected at build time by vite.config.ts. */
declare const __COMMIT_HASH__: string
