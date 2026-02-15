# Configuration

## Client Options

| Option            | Type      | Default   | Description                       |
|-------------------|-----------|-----------|-----------------------------------|
| url               | string    | —         | WebSocket server URL              |
| reconnect         | boolean   | true      | Enable auto-reconnect             |
| heartbeatInterval | number    | 30000     | Heartbeat interval in ms          |

## Example

```js
const client = new Client({
  url: 'wss://example.com',
  reconnect: false,
  heartbeatInterval: 60000,
});
```

