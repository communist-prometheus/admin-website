import { cpSync } from 'node:fs'

cpSync('dist/client/sw.js', 'public/sw.js')
