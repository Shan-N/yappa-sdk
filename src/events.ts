type Handler = (...args: any[]) => void;

export class EventEmitter<Events extends Record<string, Handler>> {
  private handlers = new Map<keyof Events, Set<Handler>>();

  on<K extends keyof Events>(event: K, handler: Events[K]): void {
    if (!this.handlers.has(event)) this.handlers.set(event, new Set());
    this.handlers.get(event)!.add(handler);
  }

  off<K extends keyof Events>(event: K, handler: Events[K]): void {
    this.handlers.get(event)?.delete(handler);
  }

  emit<K extends keyof Events>(event: K, ...args: Parameters<Events[K]>): void {
    const handlers = this.handlers.get(event);
    if (!handlers) return;
    for (const fn of handlers) {
      try {
        fn(...args);
      } catch (err) {
        console.error(`[SDK] Error in handler for "${String(event)}":`, err);
      }
    }
  }

  removeAllListeners(): void {
    this.handlers.clear();
  }
}
