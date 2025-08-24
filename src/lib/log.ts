// Production-ready structured logger with PII redaction and network shipping
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

// Check if we can ship logs to server (respects consent and GPC)
function canShipLogs(): boolean {
  if (typeof window === 'undefined') return false;
  
  try {
    const consent = localStorage.getItem('consent');
    const consentData = consent ? JSON.parse(consent) : null;
    const gpcDenied = (navigator as any).globalPrivacyControl === true;
    
    return consentData?.analytics === true && !gpcDenied;
  } catch {
    return false;
  }
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

  private async shipLog(level: LogLevel, message: string, context?: LogContext) {
    if (!canShipLogs()) return;
    
    // Sample logs to avoid overwhelming the server (30% sampling)
    if (Math.random() > 0.3) return;
    
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          level,
          event: message,
          meta: context ? redactPII(context) : undefined
        })
      });
    } catch {
      // Silently ignore network errors for logging
    }
  }

  debug(message: string, context?: LogContext): void {
    if (!this.shouldLog("debug")) return;
    console.log(this.formatMessage("debug", message, context));
  }

  info(message: string, context?: LogContext): void {
    if (!this.shouldLog("info")) return;
    console.info(this.formatMessage("info", message, context));
    this.shipLog("info", message, context);
  }

  warn(message: string, context?: LogContext): void {
    if (!this.shouldLog("warn")) return;
    console.warn(this.formatMessage("warn", message, context));
    this.shipLog("warn", message, context);
  }

  error(message: string, context?: LogContext): void {
    if (!this.shouldLog("error")) return;
    console.error(this.formatMessage("error", message, context));
    this.shipLog("error", message, context);
  }
}

export const log = new Logger();

// Helper functions for common log patterns
export const logInfo = (event: string, meta?: Record<string, unknown>) => log.info(event, meta);
export const logWarn = (event: string, meta?: Record<string, unknown>) => log.warn(event, meta);
export const logError = (event: string, meta?: Record<string, unknown>) => log.error(event, meta);

// Helper to generate request IDs
export const generateRequestId = () => nanoid(8);