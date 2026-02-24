import { Effect, pipe } from 'effect'
import { isExcluded } from './config.ts'
import { readFileContent } from './file-system.ts'
import { getRelativePath } from './utils.ts'
import {
  logParseErrors,
  parseVueFile,
  validateTemplateDepth,
} from './validation.ts'

export const checkFile = (filePath: string): Effect.Effect<void> =>
  pipe(
    Effect.sync(() => getRelativePath(filePath)),
    Effect.flatMap(relativePath =>
      isExcluded(relativePath)
        ? Effect.void
        : pipe(
            readFileContent(filePath),
            Effect.flatMap(content =>
              pipe(
                parseVueFile(content, filePath),
                Effect.flatMap(({ descriptor, errors }) =>
                  errors.length > 0
                    ? logParseErrors(relativePath, errors)
                    : validateTemplateDepth(relativePath, descriptor)
                )
              )
            )
          )
    )
  )
