export class DeduplicationCache {
  private seen = new Map<string, number>();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;
  private ttl: number;

  constructor(ttl: number) {
    this.ttl = ttl;
    this.cleanupTimer = setInterval(() => this.cleanup(), 30000);
  }

  has(id: string): boolean { return this.seen.has(id); }
  add(id: string): void { this.seen.set(id, Date.now()); }

  private cleanup() {
    const cutoff = Date.now() - this.ttl;
    for (const [id, ts] of this.seen) {
      if (ts < cutoff) this.seen.delete(id);
    }
  }

  dispose() {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = null;
    }
    this.seen.clear();
  }
}
