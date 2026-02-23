/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { Effect } from 'effect'
import { processTemplate } from '../helpers/template'

/**
 * Load HTML template
 */
export const loadTemplate = (
  dirname: string,
  isProduction: boolean,
  clientManifest?: Record<string, { file: string; css?: string[] }>
) =>
  Effect.sync(() => {
    const template = readFileSync(
      resolve(dirname, '../../index.html'),
      'utf-8'
    )
    return isProduction ? processTemplate(template, clientManifest) : template
  })
