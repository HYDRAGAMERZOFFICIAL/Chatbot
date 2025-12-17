import { sanitizeForLog } from './sanitizer';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  debug(message: string, context?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      console.debug(`[DEBUG] ${message}`, context);
    }
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (this.isDevelopment) {
      console.info(`[INFO] ${message}`, context);
    }
  }

  warn(message: string, context?: Record<string, unknown>): void {
    const sanitizedContext = this.sanitizeContext(context);
    console.warn(`[WARN] ${message}`, sanitizedContext);
  }

  error(message: string, error?: Error | Record<string, unknown>): void {
    let sanitizedError: Record<string, unknown> | undefined;

    if (error instanceof Error) {
      sanitizedError = {
        name: error.name,
        message: sanitizeForLog(error.message),
      };

      if (this.isDevelopment) {
        sanitizedError.stack = sanitizeForLog(error.stack || '');
      }
    } else {
      sanitizedError = this.sanitizeContext(error);
    }

    console.error(`[ERROR] ${message}`, sanitizedError);
  }

  private sanitizeContext(context?: Record<string, unknown>): Record<string, unknown> {
    if (!context) return {};

    const sanitized: Record<string, unknown> = {};
    const sensitiveKeys = [
      'password',
      'apiKey',
      'api_key',
      'secret',
      'token',
      'authorization',
      'auth',
    ];

    Object.entries(context).forEach(([key, value]) => {
      if (sensitiveKeys.some((sk) => key.toLowerCase().includes(sk))) {
        sanitized[key] = '[REDACTED]';
      } else if (typeof value === 'string') {
        sanitized[key] = sanitizeForLog(value);
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeContext(value as Record<string, unknown>);
      } else {
        sanitized[key] = value;
      }
    });

    return sanitized;
  }

  createEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>
  ): LogEntry {
    return {
      level,
      message: sanitizeForLog(message),
      timestamp: new Date().toISOString(),
      context: this.sanitizeContext(context),
    };
  }
}

const logger = new Logger();

export function getLogger(): Logger {
  return logger;
}

export const logDebug = (message: string, context?: Record<string, unknown>) => {
  logger.debug(message, context);
};

export const logInfo = (message: string, context?: Record<string, unknown>) => {
  logger.info(message, context);
};

export const logWarn = (message: string, context?: Record<string, unknown>) => {
  logger.warn(message, context);
};

export const logError = (
  message: string,
  error?: Error | Record<string, unknown>
) => {
  logger.error(message, error);
};

export default logger;
