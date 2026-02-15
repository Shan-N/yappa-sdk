export class SendQueue {
  private queue: string[] = [];
  constructor(private maxSize: number) {}

  enqueue(data: string): void {
    if (this.queue.length >= this.maxSize) this.queue.shift();
    this.queue.push(data);
  }

  drain(): string[] { return this.queue.splice(0); }
  get length(): number { return this.queue.length; }
}