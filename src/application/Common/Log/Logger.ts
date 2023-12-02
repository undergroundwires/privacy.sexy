export interface Logger {
  info(...params: unknown[]): void;
  warn(...params: unknown[]): void;
  error(...params: unknown[]): void;
  debug(...params: unknown[]): void;
}
