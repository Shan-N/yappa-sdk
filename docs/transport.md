# Transport & Reconnection

Yappa SDK abstracts the transport layer and provides automatic reconnection.

## Transport
- Default: WebSocket
- Custom transports can be implemented via `src/transport.ts`.

## Reconnection
- Enable with `reconnect: true` in options.
- Handles exponential backoff and retries.

## Heartbeat
- Configurable via `heartbeatInterval`.

