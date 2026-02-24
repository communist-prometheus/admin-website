#!/usr/bin/env bun
import { join } from 'node:path'
import { Effect, pipe } from 'effect'
import { runCheck } from './check-vue-template-depth/checker.ts'

const main = pipe(
  Effect.sync(() => join(process.cwd(), 'src')),
  Effect.flatMap(runCheck)
)

Effect.runPromise(main)
