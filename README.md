# @yappa-rs/yappa-sdk

A lightweight, high-performance TypeScript SDK for the **Yappa Realtime Messaging Engine**. Built with a focus on low latency and ease of use in both Node.js and Browser environments.

## Features

* ⚡ **Ultra-low latency**: Direct WebSocket communication.
* 🔒 **Secure**: Native HS256 JWT authentication.
* 📦 **Type-safe**: Built entirely in TypeScript with full ESM/CJS support.
* 🔄 **Auto-reconnect**: Intelligent backoff and reconnection logic.
* 🌐 **Cross-Platform**: Works in Chrome, Safari, Firefox, and Node.js.

## Installation

```bash
npm install @yappa-rs/yappa-sdk

```

## Quick Start

```typescript
import { RealtimeClient } from '@yappa-rs/yappa-sdk';

// 1. Initialize
const client = new RealtimeClient({
  url: 'ws://your-server.com/ws',
  token: 'YOUR_JWT_TOKEN',
  authMode: 'query' // Recommended for Browsers
});

// 2. Listen for messages
client.on('message', (msg) => {
  console.log(`New message from ${msg.sender_id}: ${msg.payload.text}`);
});

// 3. Connect
await client.connect();

// 4. Send a message
client.sendDM('bob_123', 'Hello Bob!');

```

## API Reference

### Initialization Options

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `url` | `string` | Required | The Yappa server WebSocket endpoint. |
| `token` | `string` | Required | Your HS256 JWT. |
| `authMode` | `'header' | 'query'` | `'header'` | Use `'query'` if your environment doesn't support custom WS headers. |
| `heartbeatTimeout` | `number` | `35000` | MS to wait before assuming connection is dead. |
| `reconnect` | `boolean` | `true` | Automatically attempt to reconnect on failure. |

### Methods

#### `connect(): Promise<void>`

Opens the connection. Resolves when the handshake is complete.

#### `sendDM(recipientId: string, text: string): void`

Sends a 1-to-1 message to another user.

#### `sendGroupMessage(groupId: string, text: string): void`

Sends a message to an entire group.

#### `joinGroup(groupId: string): void` / `leaveGroup(groupId: string): void`

Subscribes or unsubscribes from a group channel.

#### `disconnect(): void`

Gracefully closes the connection.

### Events

| Event | Data | Description |
| --- | --- | --- |
| `connected` | `void` | Handshake successful. |
| `disconnected` | `string` (reason) | Connection closed. |
| `message` | `ServerMessage` | Incoming data payload. |
| `error` | `Error` | Internal SDK or transport error. |

## Data Models

### `ServerMessage` Structure

```typescript
interface ServerMessage {
  id: string;
  channel_type: 'DM' | 'GROUP' | 'COMMUNITY';
  channel_id: string;
  sender_id: string;
  payload: {
    text: string;
    metadata?: Record<string, any>;
  };
  timestamp: number;
}

```

## Developing

1. Clone the repo
2. `npm install`
3. `npm run build` to generate the `/dist` folder.
4. `npm run test` to run the test suite.

## License

MIT © [Yappa-RS](https://github.com/shan-n/yappa-core.git)

