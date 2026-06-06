import process from 'node:process'
import { findOrphans } from './comms-spec-coverage/scanner.ts'

const cwd = process.cwd()
const orphans = findOrphans(cwd)

if (orphans.length === 0) {
  process.stdout.write('✅ All EARS ids covered by tasks or tests.\n')
  process.exit(0)
}

process.stderr.write(
  `❌ Orphan EARS ids (declared but not referenced by tasks/tests):\n${orphans
    .map(id => `  - ${id}`)
    .join('\n')}\n`
)
process.exit(1)
