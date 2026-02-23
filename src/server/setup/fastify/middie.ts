/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import middie from '@fastify/middie'
import { Effect } from 'effect'
import type Fastify from 'fastify'

/**
 * Register Fastify middie plugin
 */
export const registerMiddie = (fastify: ReturnType<typeof Fastify>) =>
  Effect.promise(() => fastify.register(middie))
