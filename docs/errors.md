# Error Handling

Yappa SDK provides robust error handling. Errors are emitted as events and can be caught using `client.on('error', handler)`.

## Error Types
See `src/errors.ts` for all error types.

### Example

```js
client.on('error', (err) => {
  console.error('Error:', err);
});
```

