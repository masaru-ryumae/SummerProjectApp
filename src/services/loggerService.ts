/**
 * Logger Service - Centralized logging and monitoring
 * Tracks events, errors, and performance metrics
 * Defect #22 Fix: Service logging/monitoring
 */

export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
}

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  stackTrace?: string;
}

export interface PerformanceMetric {
  name: string;
  duration: number;
  timestamp: string;
}

class LoggerService {
  private logs: LogEntry[] = [];
  private metrics: PerformanceMetric[] = [];
  private maxLogs = 500; // Keep last 500 logs
  private timers: Map<string, number> = new Map();

  log(message: string, context?: string, data?: any, level: LogLevel = LogLevel.INFO): void {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
    };

    this.logs.push(entry);

    // Keep only last N logs
    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    // Console output for development
    if (level === LogLevel.ERROR) {
      console.error(`[${context}]`, message, data);
    } else if (level === LogLevel.WARN) {
      console.warn(`[${context}]`, message, data);
    } else if (level === LogLevel.DEBUG) {
      console.debug(`[${context}]`, message, data);
    } else {
      console.log(`[${context}]`, message, data);
    }
  }

  debug(message: string, context?: string, data?: any): void {
    this.log(message, context, data, LogLevel.DEBUG);
  }

  info(message: string, context?: string, data?: any): void {
    this.log(message, context, data, LogLevel.INFO);
  }

  warn(message: string, context?: string, data?: any): void {
    this.log(message, context, data, LogLevel.WARN);
  }

  error(message: string, context?: string, error?: Error | any): void {
    let data = error;
    let stackTrace = undefined;

    if (error instanceof Error) {
      data = { message: error.message, name: error.name };
      stackTrace = error.stack;
    }

    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level: LogLevel.ERROR,
      message,
      context,
      data,
      stackTrace,
    };

    this.logs.push(entry);

    if (this.logs.length > this.maxLogs) {
      this.logs.shift();
    }

    console.error(`[${context}]`, message, error);
  }

  // Performance monitoring
  startTimer(name: string): void {
    this.timers.set(name, performance.now());
    this.debug(`Timer started: ${name}`, 'Performance');
  }

  endTimer(name: string): number {
    const startTime = this.timers.get(name);
    if (!startTime) {
      this.warn(`Timer not found: ${name}`, 'Performance');
      return 0;
    }

    const duration = performance.now() - startTime;
    this.timers.delete(name);

    const metric: PerformanceMetric = {
      name,
      duration,
      timestamp: new Date().toISOString(),
    };

    this.metrics.push(metric);

    // Keep only last 200 metrics
    if (this.metrics.length > 200) {
      this.metrics.shift();
    }

    this.debug(`Timer ended: ${name} (${duration.toFixed(2)}ms)`, 'Performance');

    // Warn if operation took too long
    if (duration > 1000) {
      this.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`, 'Performance');
    }

    return duration;
  }

  // Get logs for debugging
  getLogs(level?: LogLevel, context?: string): LogEntry[] {
    return this.logs.filter((log) => {
      if (level !== undefined && log.level < level) return false;
      if (context && log.context !== context) return false;
      return true;
    });
  }

  // Get recent errors
  getErrors(limit: number = 10): LogEntry[] {
    return this.logs
      .filter((log) => log.level === LogLevel.ERROR)
      .slice(-limit);
  }

  // Get performance metrics
  getMetrics(name?: string): PerformanceMetric[] {
    if (name) {
      return this.metrics.filter((m) => m.name === name);
    }
    return this.metrics;
  }

  // Get average performance time
  getAverageMetric(name: string): number {
    const metrics = this.getMetrics(name);
    if (metrics.length === 0) return 0;

    const total = metrics.reduce((sum, m) => sum + m.duration, 0);
    return total / metrics.length;
  }

  // Export logs for analysis
  exportLogs(): string {
    const summary = {
      exportedAt: new Date().toISOString(),
      totalLogs: this.logs.length,
      errorCount: this.logs.filter((l) => l.level === LogLevel.ERROR).length,
      warningCount: this.logs.filter((l) => l.level === LogLevel.WARN).length,
      logs: this.logs,
    };

    return JSON.stringify(summary, null, 2);
  }

  // Clear all logs
  clearLogs(): void {
    this.logs = [];
    this.metrics = [];
    this.timers.clear();
  }
}

export const loggerService = new LoggerService();

export default loggerService;
