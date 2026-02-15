import type { Logger, LogLevel } from "./types";

const LOG_LEVELS: Record<LogLevel, number> = { debug: 0, info: 1, warn: 2, error: 3, silent: 4 };

export function createLogger(level: LogLevel): Logger {
  const threshold = LOG_LEVELS[level];
  const noop = () => {};
  return {
    debug: threshold <= 0 ? console.debug.bind(console, "[SDK]") : noop,
    info: threshold <= 1 ? console.info.bind(console, "[SDK]") : noop,
    warn: threshold <= 2 ? console.warn.bind(console, "[SDK]") : noop,
    error: threshold <= 3 ? console.error.bind(console, "[SDK]") : noop,
  };
}