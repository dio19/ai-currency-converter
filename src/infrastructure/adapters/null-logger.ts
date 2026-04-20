import type { LogContext, LoggerPort } from '../../domain/ports/logger-port';

class NullLoggerAdapter implements LoggerPort {
  debug(_message: string, _context?: LogContext): void {}

  info(_message: string, _context?: LogContext): void {}

  warn(_message: string, _context?: LogContext, _error?: Error): void {}

  error(_message: string, _context?: LogContext, _error?: Error): void {}
}

export const nullLogger = new NullLoggerAdapter();
