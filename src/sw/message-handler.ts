import { buildStatus } from './build-status'
import { handleInit } from './handle-init'
import { handleInvalidate } from './handle-invalidate'
import { getLogEntries, log } from './logging/logger'
import { getMetrics } from './logging/metrics'
import type { SWRequest } from './protocol'

type Reply = (data: unknown) => void

/**
 * Handle an incoming postMessage from the client.
 * @param msg - The message payload
 * @param reply - Callback to send response via MessagePort
 */
export const handleMessage = (msg: SWRequest, reply: Reply): void => {
  if (msg.type === 'SW_INIT') handleInit(msg.config, reply)
  else if (msg.type === 'SW_STATUS') reply(buildStatus())
  else if (msg.type === 'SW_METRICS') reply(getMetrics())
  else if (msg.type === 'SW_LOG_SUBSCRIBE')
    reply({ entries: getLogEntries() })
  else if (msg.type === 'SW_INVALIDATE') handleInvalidate(reply)
  else log('warn', 'lifecycle', 'Unknown message type')
}
