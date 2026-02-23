/* eslint-disable jsdoc/require-param, jsdoc/require-returns */
import fastifyCookie from '@fastify/cookie'
import { Effect } from 'effect'
import type Fastify from 'fastify'

/**
 * Register Fastify cookie plugin
 */
export const registerCookie = (fastify: ReturnType<typeof Fastify>) =>
  Effect.promise(() => fastify.register(fastifyCookie))
