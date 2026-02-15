# Events

Yappa SDK uses an event-driven model. Listen for events using `client.on(event, handler)`.

## Common Events
- `connect`: Fired when the client connects.
- `disconnect`: Fired when the client disconnects.
- `message`: Fired when a message is received.
- `error`: Fired on error.

### Example

```js
client.on('message', (msg) => {
  console.log('Received:', msg);
});
```

