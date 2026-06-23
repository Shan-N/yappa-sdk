export class SendQueue {
  private queue: string[] = [];
  private head = 0;
  private maxSize: number;

  constructor(maxSize: number) {
    this.maxSize = maxSize;
  }

  enqueue(data: string): void {
    if (this.queue.length - this.head >= this.maxSize) {
      this.queue[this.head] = data;
      this.head = (this.head + 1) % this.maxSize;
      if (this.queue.length < this.maxSize) {
        this.queue.length = this.maxSize;
      }
    } else {
      this.queue.push(data);
    }
  }

  drain(): string[] {
    if (this.head === 0) {
      const result = this.queue;
      this.queue = [];
      return result;
    }
    const result = this.queue.slice(this.head).concat(this.queue.slice(0, this.head));
    this.queue = [];
    this.head = 0;
    return result;
  }

  get length(): number {
    return this.queue.length - this.head;
  }

  dispose() {
    this.queue = [];
    this.head = 0;
  }
}
