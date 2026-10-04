export type LogLevel = 'info' | 'warn' | 'error' | 'debug' | 'audit';

interface LogPayload {
  level: LogLevel;
  message: string;
  timestamp: string;
  meta?: Record<string, unknown>;
}

function writeLog(level: LogLevel, message: string, meta?: Record<string, unknown>): void {
  const payload: LogPayload = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...(meta ? { meta } : {}),
  };

  const formatted = JSON.stringify(payload);
  if (level === 'error') {
    console.error(formatted);
  } else if (level === 'warn') {
    console.warn(formatted);
  } else {
    console.log(formatted);
  }
}

export const logger = {
  info: (message: string, meta?: Record<string, unknown>) => writeLog('info', message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => writeLog('warn', message, meta),
  error: (message: string, meta?: Record<string, unknown>) => writeLog('error', message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => writeLog('debug', message, meta),
  audit: (message: string, meta?: Record<string, unknown>) => writeLog('audit', message, meta),
};
