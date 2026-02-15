export class RealtimeError extends Error {
  constructor(message: string) { super(message); this.name = "RealtimeError"; }
}
export class ConnectionError extends RealtimeError {
  constructor(message: string, public cause?: unknown) { super(message); this.name = "ConnectionError"; }
}