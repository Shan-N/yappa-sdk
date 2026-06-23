import { RealtimeError } from "./errors";

export type ChannelType = "DM" | "GROUP" | "COMMUNITY";
export type GroupMessageType = "JOIN" | "LEAVE" | "CREATE" | "DELETE";

export interface WsMessage {
  channel_type: ChannelType;
  user_id: string;
  content: string;
}

export interface GroupMessage {
  msg_type: GroupMessageType;
  tenant_id: string;
  group_id: string;
  user_id: string;
}

export interface MessagePayload {
  text: string;
  meta: Record<string, unknown>;
}

export interface ServerMessage {
  type: string;
  message_id: string;
  tenant_id: string;
  channel_type: ChannelType;
  channel_id: string;
  sender_id: string;
  timestamp: number;
  conversation_id: string;
  payload: MessagePayload;
}

export interface RealtimeConfig {
  url: string;
  token: string;
  authMode?: "header" | "query";
  reconnect?: boolean;
  maxReconnectAttempts?: number;
  reconnectBaseDelay?: number;
  reconnectMaxDelay?: number;
  dedup?: boolean;
  dedupTTL?: number;
  maxQueueSize?: number;
  logLevel?: LogLevel;
  heartbeatTimeout?: number;
  refreshUrl?: string;
}

export interface RealtimeEvents extends Record<string, (...args: any[]) => void> {
  connected: () => void;
  disconnected: (reason: string) => void;
  reconnecting: (attempt: number) => void;
  reconnected: () => void;
  reconnect_failed: () => void;
  message: (message: ServerMessage) => void;
  dm: (message: ServerMessage) => void;
  group_message: (message: ServerMessage) => void;
  community_message: (message: ServerMessage) => void;
  group_join: (message: ServerMessage) => void;
  error: (error: RealtimeError) => void;
}

export type LogLevel = "debug" | "info" | "warn" | "error" | "silent";

export interface Logger {
  debug(msg: string, ...args: unknown[]): void;
  info(msg: string, ...args: unknown[]): void;
  warn(msg: string, ...args: unknown[]): void;
  error(msg: string, ...args: unknown[]): void;
}

export type ConnectionState = "disconnected" | "connecting" | "connected" | "reconnecting";
