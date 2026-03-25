# sw/protocol

Communication protocol types shared between the Service Worker and client composables. Defines the message contract for postMessage and BroadcastChannel communication.

## Key Exports

- `SWRequest` -- discriminated union of all client-to-SW messages
- `SWGitConfig` -- git repository configuration sent during init
- `SWFetchRequest` / `SWFetchResponse` -- proxied fetch for browsers without SW controller
- `SWStatusResponse` / `SWMetricsResponse` -- status and metrics query responses
- `SWProgressEvent` -- clone/pull progress events via BroadcastChannel
- `SWState` -- worker readiness state (`idle | cloning | ready | syncing | error`)
- `SW_LOG_CHANNEL` / `SW_PROGRESS_CHANNEL` / `SW_STATE_CHANNEL` -- channel names
- `SW_VERSION` -- build-time version stamp
