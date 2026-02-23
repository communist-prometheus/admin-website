/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import { Effect, pipe } from 'effect'
import { loadProdRender } from '../loaders/production'

/**
 * Prepare production render
 */
export const prepareProdRender = (template: string) =>
  pipe(
    loadProdRender(),
    Effect.map(render => ({ template, render }))
  )
