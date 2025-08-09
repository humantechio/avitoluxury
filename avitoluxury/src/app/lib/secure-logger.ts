/**
 * Secure logging utility for the application
 * Only logs in development mode, completely silent in production
 */

// Environment check
const isDevelopment = process.env.NODE_ENV !== 'production';

// Log levels
export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR'
}

/**
 * Securely logs messages only in development environment
 * In production, this is a no-op
 * 
 * @param message - The message to log
 * @param level - Log level (DEBUG, INFO, WARN, ERROR)
 * @param context - Optional context object (will be stringified)
 */
export function secureLog(
  message: string,
  level: LogLevel = LogLevel.INFO,
  context?: any
): void {
  // No logging in production
  if (!isDevelopment) {
    return;
  }
  
  // Format the log message
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [${level}]`;
  
  // Log based on level
  switch (level) {
    case LogLevel.ERROR:
      console.error(`${prefix} ${message}`, context ? context : '');
      break;
    case LogLevel.WARN:
      console.warn(`${prefix} ${message}`, context ? context : '');
      break;
    case LogLevel.DEBUG:
      console.debug(`${prefix} ${message}`, context ? context : '');
      break;
    case LogLevel.INFO:
    default:
      console.log(`${prefix} ${message}`, context ? context : '');
      break;
  }
}

/**
 * Secure error logger - only logs in development
 */
export function logError(message: string, error?: any): void {
  secureLog(message, LogLevel.ERROR, error);
}

/**
 * Secure debug logger - only logs in development
 */
export function logDebug(message: string, context?: any): void {
  secureLog(message, LogLevel.DEBUG, context);
}

/**
 * Secure info logger - only logs in development
 */
export function logInfo(message: string, context?: any): void {
  secureLog(message, LogLevel.INFO, context);
}

/**
 * Secure warning logger - only logs in development
 */
export function logWarn(message: string, context?: any): void {
  secureLog(message, LogLevel.WARN, context);
}

// Default export for convenience
export default {
  log: secureLog,
  error: logError,
  debug: logDebug,
  info: logInfo,
  warn: logWarn
}; 