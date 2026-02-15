export class HeartbeatMonitor {
  private timer: any;
  constructor(private timeout: number) {}

  start(onTimeout: () => void) {
    this.stop();
    this.timer = setTimeout(onTimeout, this.timeout);
  }
  
  activity() { if (this.timer) this.timer.refresh ? this.timer.refresh() : null; }
  stop() { clearTimeout(this.timer); }
}