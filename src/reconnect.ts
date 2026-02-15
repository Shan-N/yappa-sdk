export class ReconnectManager {
  private attempts = 0;
  private timer: any;
  private stopped = false;

  constructor(private opts: { maxAttempts: number; baseDelay: number; maxDelay: number }) {}

  async attempt(fn: (n: number) => Promise<void>, onFail: () => void) {
    this.stopped = false;
    const run = async () => {
      if (this.stopped) return;
      this.attempts++;
      if (this.attempts > this.opts.maxAttempts) return onFail();
      try { await fn(this.attempts); } 
      catch { 
        if (!this.stopped) this.timer = setTimeout(run, this.calcDelay()); 
      }
    };
    this.timer = setTimeout(run, this.opts.baseDelay);
  }

  reset() { this.attempts = 0; }
  stop() { this.stopped = true; clearTimeout(this.timer); }
  private calcDelay() {
    return Math.min(this.opts.baseDelay * Math.pow(2, this.attempts - 1), this.opts.maxDelay);
  }
}