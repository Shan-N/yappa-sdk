import type { Logger } from "./types";
import WS from "ws";

export class WebSocketTransport {
  private ws: any;
  onOpen?: () => void;
  onMessage?: (data: string) => void;
  onClose?: (code: number, reason: string) => void;
  onError?: (err: Error) => void;

  constructor(private url: string, private headers: any, private logger: Logger) {}

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // 1. Check if we are running in Node.js
        const isNode = typeof process !== "undefined" && 
                       process.versions && 
                       !!process.versions.node;

        if (isNode) {
          this.ws = new WS(this.url, { headers: this.headers });
        } else if (typeof globalThis.WebSocket !== "undefined") {
          // Browser: Use native WebSocket (No headers supported)
          this.ws = new globalThis.WebSocket(this.url);
        } else {
          throw new Error("No WebSocket implementation found");
        }

        // 2. Set up event listeners
        this.ws.onopen = () => { 
          this.onOpen?.(); 
          resolve(); 
        };
        
        this.ws.onmessage = (e: any) => {
          // Node 'ws' gives just data; Browser gives MessageEvent object
          const data = e.data !== undefined ? e.data : e; 
          this.onMessage?.(data.toString());
        };

        this.ws.onclose = (e: any) => this.onClose?.(e.code, e.reason);
        
        this.ws.onerror = (e: any) => { 
          // Normalize error object
          const err = e instanceof Error ? e : new Error(e.message || "WebSocket error");
          this.onError?.(err); 
          reject(err); 
        };

      } catch (err) { 
        reject(err); 
      }
    });
  }

  send(data: string) { 
    this.ws?.send(data); 
  }

  close() { 
    this.ws?.close(); 
  }
}