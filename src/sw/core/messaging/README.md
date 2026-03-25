# sw/core/messaging

Message dispatch for client-to-SW communication via `postMessage` and `MessagePort`. Uses Effect's `Match` for exhaustive message type handling.

## Key Exports

- `registerMessageListener` -- register the SW `message` event listener
- `handleMessage` -- dispatch `SWRequest` to the appropriate handler via `Match.value`
- `handleInit` -- initialize SW with git config
- `handleInitRequest` -- handle `/api/sw/init` fetch requests
- `handleFetchMessage` -- proxy fetch requests for browsers without `navigator.serviceWorker.controller`
- `handleInvalidate` -- wipe and re-sync the local repo
