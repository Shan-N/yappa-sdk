# Yappa SDK Reference

The `@yappa-rs/yappa-sdk` is the official client-side library for interacting with the Yappa Realtime Messaging server.

## Initialization

### `new RealtimeClient()`

Initialize a new client instance. This does not automatically connect to the server; you must call `.connect()` afterward.

```typescript
const client = new RealtimeClient(options);

```

**Options**
| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `url` | `string` | Yes | The WebSocket URL (e.g., `ws://localhost:8080/ws`). |
| `token` | `string` | Yes | A valid HS256 JWT containing `user_id` and `tenant_id`. |
| `authMode` | `'header' \| 'query'` | No | Defaults to `'header'`. Use `'query'` for browser environments. |
| `logLevel` | `'debug' \| 'info' \| 'warn' \| 'error'` | No | Control the verbosity of console logs. |
| `heartbeatTimeout` | `number` | No | Time in ms to wait for server ping before reconnecting. Set to `Infinity` for browsers. |
| `reconnect` | `boolean` | No | Whether to automatically reconnect on transport failure. Defaults to `true`. |

---

## Connection Management

### `.connect()`

Establishes the WebSocket connection and performs the authentication handshake.

```typescript
await client.connect();

```

* **Returns**: `Promise<void>`
* **Throws**: Error if the connection fails or authentication is rejected.

### `.disconnect()`

Gracefully closes the WebSocket connection and cleans up all internal listeners.

```typescript
client.disconnect();

```

---

## Messaging

### `.sendDM()`

Sends a direct message to a specific user.

```typescript
client.sendDM(userId, text);

```

**Arguments**
| Name | Type | Description |
| :--- | :--- | :--- |
| `userId` | `string` | The unique ID of the recipient. |
| `text` | `string` | The message content. |

### `.sendGroupMessage()`

Sends a message to a specific group channel.

```typescript
client.sendGroupMessage(groupId, text);

```

**Arguments**
| Name | Type | Description |
| :--- | :--- | :--- |
| `groupId` | `string` | The unique ID of the group. |
| `text` | `string` | The message content. |

---

## Channel Management

### `.joinGroup()`

Subscribes the current user to a group's message stream.

```typescript
client.joinGroup(groupId);

```

### `.leaveGroup()`

Unsubscribes the current user from a group's message stream.

```typescript
client.leaveGroup(groupId);

```

---

## Event Listeners

Use `.on()` to subscribe to SDK events. All callbacks receive a single data object.

### `on('connected')`

Triggered when the WebSocket successfully completes the handshake.

```typescript
client.on('connected', () => console.log('Online!'));

```

### `on('disconnected')`

Triggered when the connection is closed.

```typescript
client.on('disconnected', (reason) => console.log('Offline:', reason));

```

### `on('message')`

Triggered whenever a message (DM or Group) is received by the client.

```typescript
client.on('message', (message: ServerMessage) => {
  console.log(`From ${message.sender_id}: ${message.payload.text}`);
});

```

### `on('error')`

Triggered when an internal SDK error occurs (e.g., failed to parse a server message).

```typescript
client.on('error', (err) => console.error(err));

```

---

## Types Reference

### `ServerMessage`

The object structure received in the `message` event.

```typescript
interface ServerMessage {
  id: string;             // Unique message UUID
  channel_type: 'DM' | 'GROUP' | 'COMMUNITY';
  channel_id: string;     // The ID of the recipient or group
  sender_id: string;      // The ID of the user who sent it
  payload: {
    text: string;         // The message content
    metadata?: object;    // Optional extra data
  };
  timestamp: number;      // Unix timestamp (seconds)
}

```
