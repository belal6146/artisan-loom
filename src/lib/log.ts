// Production-ready structured logger with PII redaction
import { isDevelopment } from "./env";
import { nanoid } from "nanoid";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
  requestId?: string;
  route?: string;
  status?: number;
  durationMs?: number;
}

const PII_FIELDS = ['password', 'token', 'email', 'ip', 'authorization'] as const;

function redactPII(obj: any): any {
  if (typeof obj !== 'object' || obj === null) return obj;
  
  const redacted = { ...obj };
  for (const field of PII_FIELDS) {
    if (field in redacted) {
      redacted[field] = '[REDACTED]';
    }
  }
  
  // Recursively redact nested objects
  for (const key in redacted) {
    if (typeof redacted[key] === 'object') {
      redacted[key] = redactPII(redacted[key]);
    }
  }
  
  return redacted;
}

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (!isDevelopment && level === "debug") return false;
    return true;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const requestId = context?.requestId || nanoid(8);
    const prefix = `[${timestamp}] [${requestId}] ${level.toUpperCase()}:`;
    
    if (context && Object.keys(context).length > 0) {
      const sanitized = redactPII(context);
      return `${prefix} ${message} ${JSON.stringify(sanitized)}`;
    }
    
    return `${prefix} ${message}`;
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog("debug")) return;
    console.log(this.formatMessage("debug", message, context));
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog("info")) return;
    console.info(this.formatMessage("info", message, context));
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog("warn")) return;
    console.warn(this.formatMessage("warn", message, context));
  }

  error(message: string, context?: LogContext): void {
    if (!this.shouldLog("error")) return;
    console.error(this.formatMessage("error", message, context));
  }
}

export const log = new Logger();

// Helper to generate request IDs
export const generateRequestId = () => nanoid(8);