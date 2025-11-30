type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private isDev = process.env.NODE_ENV === 'development';
  private minLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

  private levels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
  };

  private shouldLog(level: LogLevel): boolean {
    return this.levels[level] >= this.levels[this.minLevel];
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const contextStr = context ? ` ${JSON.stringify(context)}` : '';
    
    if (this.isDev) {
      return `[${timestamp}] ${level.toUpperCase()}: ${message}${contextStr}`;
    }
    
    // Production format (JSON for log aggregation)
    return JSON.stringify({
      timestamp,
      level,
      message,
      ...context,
    });
  }

  debug(message: string, context?: LogContext): void {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, context));
    }
  }

  warn(message: string, context?: LogContext): void {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, context));
    }
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    if (this.shouldLog('error')) {
      const errorContext: LogContext = {
        ...context,
      };
      
      if (error instanceof Error) {
        errorContext.errorName = error.name;
        errorContext.errorMessage = error.message;
        if (this.isDev) {
          errorContext.stack = error.stack;
        }
      }
      
      console.error(this.formatMessage('error', message, errorContext));
    }
  }

  // Log API request
  request(method: string, path: string, context?: LogContext): void {
    this.info(`${method} ${path}`, {
      type: 'request',
      ...context,
    });
  }

  // Log API response
  response(method: string, path: string, status: number, duration: number, context?: LogContext): void {
    const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info';
    this[level](`${method} ${path} ${status} ${duration}ms`, {
      type: 'response',
      ...context,
    });
  }

  // Log audit event
  audit(action: string, userId?: number, context?: LogContext): void {
    this.info(`AUDIT: ${action}`, {
      type: 'audit',
      userId,
      ...context,
    });
  }
}

export const logger = new Logger();

