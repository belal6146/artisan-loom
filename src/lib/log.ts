// Minimal structured logger
import { isDevelopment } from "./env";

type LogLevel = "debug" | "info" | "warn" | "error";

interface LogContext {
  [key: string]: unknown;
}

class Logger {
  private shouldLog(level: LogLevel): boolean {
    if (!isDevelopment && level === "debug") return false;
    return true;
  }

  private formatMessage(level: LogLevel, message: string, context?: LogContext): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] ${level.toUpperCase()}:`;
    
    if (context && Object.keys(context).length > 0) {
      return `${prefix} ${message} ${JSON.stringify(context)}`;
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