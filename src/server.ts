import { Effect, pipe } from 'effect'
import { program } from './server/main'
import { logError } from './server/utils/logger'
import 'dotenv/config'

/**
 * Map Effect result to exit code with error logging
 */
const exitCode = pipe(
  program,
  Effect.match({
    onFailure: error => {
      logError('Server startup failed:', error)
      process.exit(1)
    },
    onSuccess: () => 0,
  })
)

/**
 * Run the server program and exit with appropriate code
 */
await Effect.runPromise(exitCode)
