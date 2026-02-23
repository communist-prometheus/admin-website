import { Effect, pipe } from 'effect'
import { program } from './server/main'
import 'dotenv/config'

const exitCode = pipe(
  program,
  Effect.match({
    onFailure: () => 1,
    onSuccess: () => 0,
  })
)

const code = await Effect.runPromise(exitCode)
process.exit(code)
