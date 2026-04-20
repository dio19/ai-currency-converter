import type { LogContext, LoggerPort } from '../../domain/ports/logger-port';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: LogContext;
  error?: {
    name: string;
    message: string;
    stack?: string;
  };
}

class ConsoleLoggerAdapter implements LoggerPort {
  debug(message: string, context?: LogContext): void {
    if (process.env.NODE_ENV !== 'production') {
      this.write('debug', message, context);
    }
  }

  info(message: string, context?: LogContext): void {
    this.write('info', message, context);
  }

  warn(message: string, context?: LogContext, error?: Error): void {
    this.write('warn', message, context, error);
  }

  error(message: string, context?: LogContext, error?: Error): void {
    this.write('error', message, context, error);
  }

  private write(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
    const logEntry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
    };

    const serializedEntry = JSON.stringify(logEntry, null, 2);

    if (level === 'error') {
      console.error(serializedEntry);
      return;
    }

    if (level === 'warn') {
      console.warn(serializedEntry);
      return;
    }

    console.log(serializedEntry);
  }
}

export const logger = new ConsoleLoggerAdapter();
