# Client API

## Client

The main entry point for interacting with Yappa SDK.

### Constructor

```
new Client(options: ClientOptions)
```

#### ClientOptions
- `url` (string): The WebSocket server URL.
- `reconnect` (boolean): Enable/disable auto-reconnect.
- `heartbeatInterval` (number): Heartbeat interval in ms.

### Methods
- `connect()`: Establishes the connection.
- `disconnect()`: Closes the connection.
- `on(event, handler)`: Listen for events.
- `send(message)`: Send a message.

### Example

```js
const client = new Client({ url: 'wss://example.com', reconnect: true });
client.connect();
```

