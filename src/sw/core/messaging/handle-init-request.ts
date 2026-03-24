import type { SWGitConfig } from '../../protocol'
import { handleInit } from './handle-init'

/**
 * Handle POST /api/sw/init — initialize the SW with config.
 * Accepted even when state !== 'ready' (this is how we GET to ready).
 * @param request - Incoming init request
 * @returns JSON response
 */
export const handleInitRequest = (request: Request): Promise<Response> =>
  request.json().then(
    (config: SWGitConfig) =>
      new Promise<Response>(resolve => {
        handleInit(config, data => {
          resolve(
            new Response(JSON.stringify(data), {
              headers: { 'content-type': 'application/json' },
            })
          )
        })
      })
  )
