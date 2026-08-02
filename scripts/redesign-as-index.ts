import { copyFileSync } from 'node:fs'

/**
 * Promote the redesigned app to the site root: overwrite dist/client/index.html
 * with the redesign's HTML so `/` serves the new admin (the previous app's
 * assets remain but nothing points at them). Runs after build:redesign.
 */
copyFileSync('dist/client/redesign.html', 'dist/client/index.html')
console.log('redesign promoted to dist/client/index.html')
