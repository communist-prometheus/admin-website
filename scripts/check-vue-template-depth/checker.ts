import { Effect, pipe } from 'effect'
import { checkFile } from './file-checker.ts'
import { findVueFiles } from './file-system.ts'

const logStart = (count: number): Effect.Effect<void> =>
  Effect.sync(() => {
    process.stdout.write(`Checking ${count} Vue files...\n`)
  })

const logResult = (): Effect.Effect<void> =>
  Effect.sync(() => {
    const message =
      process.exitCode === 1
        ? '\n❌ Template depth check failed\n'
        : '✅ All Vue templates pass depth check\n'

    void (process.exitCode === 1
      ? process.stderr.write(message)
      : process.stdout.write(message))
  })

export const runCheck = (srcDir: string): Effect.Effect<void> =>
  pipe(
    findVueFiles(srcDir),
    Effect.tap(files => logStart(files.length)),
    Effect.flatMap(files =>
      Effect.all(files.map(checkFile), { concurrency: 'unbounded' })
    ),
    Effect.flatMap(logResult)
  )
