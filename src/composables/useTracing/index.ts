/** W3C trace-context generation + propagation helpers. */
export {
  childOf,
  newRootTraceparent,
  parse as parseTraceparent,
  serialise as serialiseTraceparent,
} from './traceparent'
export type { Traceparent } from './traceparent-types'
