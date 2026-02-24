import type { CompilerError, SFCDescriptor } from '@vue/compiler-sfc'
import { parse } from '@vue/compiler-sfc'
import { Effect } from 'effect'
import type { ASTNode } from './ast-utils.ts'
import { getElementDepth } from './ast-utils.ts'
import { config } from './config.ts'

export const parseVueFile = (content: string, filename: string) =>
  Effect.sync(() => parse(content, { filename }))

export const validateTemplateDepth = (
  path: string,
  descriptor: SFCDescriptor
): Effect.Effect<void> =>
  Effect.sync(() => {
    if (!descriptor.template) return

    const ast = descriptor.template.ast as ASTNode
    const depth = getElementDepth(ast)

    if (depth > config.maxDepth) {
      const line = descriptor.template.loc.start.line
      process.stderr.write(
        `${path}:${line}:1 Template depth ${depth} exceeds maximum allowed depth of ${config.maxDepth}\n`
      )
      process.exitCode = 1
    }
  })

export const logParseErrors = (
  path: string,
  errors: readonly CompilerError[]
): Effect.Effect<void> =>
  Effect.sync(() => {
    process.stderr.write(`Parse errors in ${path}:\n`)
    for (const error of errors) {
      process.stderr.write(`  ${error.message}\n`)
    }
    process.exitCode = 1
  })
