import type { SWGitConfig, SWRequest } from '../../sw/protocol/request-types.js';
import type { SWStatusResponse } from '../../sw/protocol/response-types.js';

/**
 * Typed client for the Service Worker request/response side of the git engine
 * (git-engine R2/R4): registers the SW and drives SW_INIT / SW_STATUS /
 * SW_INVALIDATE over `postMessage`, awaiting replies on a `MessageChannel`. The
 * transport is injected so it unit-tests against a fake worker.
 */

/** Sends a request to the SW and resolves with its reply (via MessageChannel). */
export type SwTransport = (message: SWRequest) => Promise<unknown>;

/** The SW client surface consumed by the app. */
export interface SwClient {
  readonly init: (config: SWGitConfig) => Promise<void>;
  readonly status: () => Promise<SWStatusResponse>;
  readonly invalidate: () => Promise<void>;
}

const isStatus = (x: unknown): x is SWStatusResponse =>
  typeof x === 'object' && x !== null && 'state' in x && 'cloned' in x;

/** Builds a client over an injected transport (default: the active SW controller). */
export const createSwClient = (transport: SwTransport): SwClient => ({
  init: async (config) => {
    await transport({ type: 'SW_INIT', config });
  },
  status: async () => {
    const reply = await transport({ type: 'SW_STATUS' });
    if (!isStatus(reply)) throw new Error('SW_STATUS: unexpected reply shape');
    return reply;
  },
  invalidate: async () => {
    await transport({ type: 'SW_INVALIDATE' });
  },
});

/** Posts a message to a specific worker and awaits its reply on a MessageChannel. */
export const postToWorker = (worker: ServiceWorker, message: SWRequest): Promise<unknown> =>
  new Promise((resolve) => {
    const channel = new MessageChannel();
    channel.port1.onmessage = (event: MessageEvent<unknown>): void => resolve(event.data);
    worker.postMessage(message, [channel.port2]);
  });

/**
 * The default transport: posts to the controlling worker if the page is already
 * controlled, else rejects. Prefer a worker-targeted transport at boot, before
 * the page is claimed (see engine-boot).
 */
export const controllerTransport: SwTransport = (message) => {
  const controller = navigator.serviceWorker.controller;
  return controller === null
    ? Promise.reject(new Error('no active Service Worker controller'))
    : postToWorker(controller, message);
};

/**
 * Registers the engine Service Worker and resolves once it is active. IO is the
 * `ServiceWorkerContainer`, injectable for tests.
 */
export const registerEngine = async (
  scriptUrl: string,
  container: ServiceWorkerContainer = navigator.serviceWorker,
): Promise<ServiceWorkerRegistration> => {
  const registration = await container.register(scriptUrl, { type: 'module' });
  await container.ready;
  return registration;
};
