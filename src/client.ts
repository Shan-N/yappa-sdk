import { EventEmitter } from "./events";
import { WebSocketTransport } from "./transport";
import { ReconnectManager } from "./reconnect";
import { DeduplicationCache } from "./dedup";
import { SendQueue } from "./queue";
import { HeartbeatMonitor } from "./heartbeat";
import { createLogger } from "./logger";
import { RealtimeError, ConnectionError } from "./errors";
import type * as T from "./types";

export class RealtimeClient {
  private config: Required<T.RealtimeConfig> & { refreshUrl?: string };
  private emitter = new EventEmitter<T.RealtimeEvents>();
  private transport: WebSocketTransport | null = null;
  private reconnect: ReconnectManager;
  private dedup: DeduplicationCache;
  private queue: SendQueue;
  private heartbeat: HeartbeatMonitor;
  private logger: T.Logger;
  private _state: T.ConnectionState = "disconnected";
  private joinedGroups = new Set<string>();
  private tenantId: string | null = null;
  private userId: string | null = null;
  private disposed = false;
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(config: T.RealtimeConfig & { refreshUrl?: string }) {
    this.config = {
      authMode: "header",
      reconnect: true,
      maxReconnectAttempts: Infinity,
      reconnectBaseDelay: 1000,
      reconnectMaxDelay: 30000,
      dedup: true,
      dedupTTL: 60000,
      maxQueueSize: 1000,
      logLevel: "warn",
      heartbeatTimeout: 35000,
      refreshUrl: undefined,
      ...config,
    } as Required<T.RealtimeConfig> & { refreshUrl?: string };
    
    this.logger = createLogger(this.config.logLevel);
    this.dedup = new DeduplicationCache(this.config.dedupTTL);
    this.queue = new SendQueue(this.config.maxQueueSize);
    this.heartbeat = new HeartbeatMonitor(this.config.heartbeatTimeout);
    this.reconnect = new ReconnectManager({
      maxAttempts: this.config.maxReconnectAttempts,
      baseDelay: this.config.reconnectBaseDelay,
      maxDelay: this.config.reconnectMaxDelay,
    });
    this.extractIdentity(config.token);
  }

  async connect() {
    if (this._state === "connected" || this.disposed) return;
    this._state = "connecting";
    try {
      await this.createTransport();
      this.scheduleTokenRefresh();
    } catch (e) {
      this._state = "disconnected";
      throw e;
    }
  }

  disconnect() {
    this.disposed = true;
    this.clearRefreshTimer();
    this.reconnect.stop();
    this.heartbeat.stop();
    this.transport?.close();
    this._state = "disconnected";
    this.dedup.dispose();
    this.queue.dispose();
    this.emitter.emit("disconnected", "manual");
  }

  sendDM(userId: string, content: string) {
    if (!content || content.length > 64000) {
      throw new RealtimeError("Content must be 1-64000 characters");
    }
    this.send({ channel_type: "DM", user_id: userId, content });
  }

  sendGroupMessage(groupId: string, content: string) {
    if (!content || content.length > 64000) {
      throw new RealtimeError("Content must be 1-64000 characters");
    }
    this.send({ channel_type: "GROUP", user_id: groupId, content });
  }

  joinGroup(groupId: string) {
    if (!groupId) throw new RealtimeError("groupId required");
    if (!this.tenantId || !this.userId) throw new RealtimeError("No identity found in token");
    this.sendRaw(JSON.stringify({ msg_type: "JOIN", tenant_id: this.tenantId, group_id: groupId, user_id: this.userId }));
    this.joinedGroups.add(groupId);
  }

  leaveGroup(groupId: string) {
    if (!this.tenantId || !this.userId) throw new RealtimeError("No identity found in token");
    this.sendRaw(JSON.stringify({ msg_type: "LEAVE", tenant_id: this.tenantId, group_id: groupId, user_id: this.userId }));
    this.joinedGroups.delete(groupId);
  }

  createGroup(groupId: string) {
    if (!this.tenantId || !this.userId) throw new RealtimeError("No identity found in token");
    this.sendRaw(JSON.stringify({ msg_type: "CREATE", tenant_id: this.tenantId, group_id: groupId, user_id: this.userId }));
    this.joinedGroups.add(groupId);
  }

  deleteGroup(groupId: string) {
    if (!this.tenantId || !this.userId) throw new RealtimeError("No identity found in token");
    this.sendRaw(JSON.stringify({ msg_type: "DELETE", tenant_id: this.tenantId, group_id: groupId, user_id: this.userId }));
    this.joinedGroups.delete(groupId);
  }

  on<K extends keyof T.RealtimeEvents>(event: K, fn: T.RealtimeEvents[K]) {
    this.emitter.on(event, fn);
    return () => this.emitter.off(event, fn);
  }

  get state() { return this._state; }

  private send(msg: T.WsMessage) {
    this.sendRaw(JSON.stringify(msg));
  }

  private sendRaw(data: string) {
    if (this._state !== "connected") return this.queue.enqueue(data);
    this.transport?.send(data);
  }

  private async createTransport() {
    const url = this.config.authMode === "query" 
      ? `${this.config.url}?token=${this.config.token}` 
      : this.config.url;
    const headers = this.config.authMode === "header" 
      ? { Authorization: `Bearer ${this.config.token}` } 
      : {};

    this.transport = new WebSocketTransport(url, headers, this.logger);
    
    this.transport.onOpen = () => {
      this._state = "connected";
      this.reconnect.reset();
      this.heartbeat.start(() => this.transport?.close());
      this.emitter.emit("connected");
      this.queue.drain().forEach(msg => this.transport?.send(msg));
      this.joinedGroups.forEach(g => this.joinGroup(g));
    };

    this.transport.onMessage = (data) => {
      this.heartbeat.activity();
      try {
        const msg = JSON.parse(data);
        if (this.config.dedup && msg.message_id && this.dedup.has(msg.message_id)) return;
        if (this.config.dedup && msg.message_id) this.dedup.add(msg.message_id);
        
        this.emitter.emit("message", msg);
        if (msg.channel_type === "DM") this.emitter.emit("dm", msg);
        if (msg.channel_type === "GROUP") this.emitter.emit("group_message", msg);
        if (msg.type === "group_join") this.emitter.emit("group_join", msg);
      } catch (e) { this.logger.warn("Parse error", e); }
    };

    this.transport.onClose = () => {
      this.heartbeat.stop();
      if (this._state === "disconnected" || this.disposed) return;
      this._state = "reconnecting";
      this.emitter.emit("disconnected", "transport closed");
      this.reconnect.attempt(
        async (n) => {
          this.emitter.emit("reconnecting", n);
          await this.createTransport();
          this.emitter.emit("reconnected");
        },
        () => {
          this._state = "disconnected";
          this.emitter.emit("reconnect_failed");
        }
      );
    };

    await this.transport.connect();
  }

  private extractIdentity(token: string) {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) throw new Error("Invalid JWT format");
      const payload = JSON.parse(atob(parts[1]));
      this.tenantId = payload.tenant_id;
      this.userId = payload.user_id;
      if (!this.tenantId || !this.userId) {
        throw new Error("Missing tenant_id or user_id in token");
      }
    } catch (err) {
      this.logger.warn("Failed to extract identity from token:", err);
    }
  }

  private scheduleTokenRefresh() {
    this.clearRefreshTimer();
    if (!this.config.refreshUrl || this.disposed) return;
    
    const refreshTime = 4 * 60 * 1000;
    this.refreshTimer = setTimeout(async () => {
      try {
        const res = await fetch(this.config.refreshUrl!, {
          method: "POST",
          credentials: "include",
        });
        if (!res.ok) throw new Error(`Refresh failed: ${res.status}`);
        const data = await res.json();
        this.config.token = data.access_token;
        this.extractIdentity(data.access_token);
        this.scheduleTokenRefresh();
      } catch (err) {
        this.logger.warn("Token refresh failed:", err);
        this.emitter.emit("error", new RealtimeError("Token refresh failed"));
      }
    }, refreshTime);
  }

  private clearRefreshTimer() {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }
}
