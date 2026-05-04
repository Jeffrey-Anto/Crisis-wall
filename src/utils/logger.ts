type LogLevel = 'info' | 'warn' | 'error';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: 'auth' | 'api' | 'activity' | 'system';
  message: string;
  details?: any;
}

class Logger {
  private log(entry: LogEntry) {
    // In production, this could send data to Datadog, Sentry, or a custom logging endpoint
    // For now, we log securely to the console in a structured format
    if (import.meta.env.DEV) {
      const formatted = `[${entry.category.toUpperCase()}] ${entry.message}`;
      switch (entry.level) {
        case 'info': console.log(formatted, entry.details || ''); break;
        case 'warn': console.warn(formatted, entry.details || ''); break;
        case 'error': console.error(formatted, entry.details || ''); break;
      }
    } else {
      // Production format (structured JSON for easy ingestion by log forwarders)
      console.log(JSON.stringify(entry));
    }
  }

  activity(message: string, details?: any) {
    this.log({ timestamp: new Date().toISOString(), level: 'info', category: 'activity', message, details });
  }

  error(message: string, error: any) {
    this.log({ timestamp: new Date().toISOString(), level: 'error', category: 'system', message, details: error?.message || error });
  }

  apiError(endpoint: string, error: any) {
    this.log({ timestamp: new Date().toISOString(), level: 'error', category: 'api', message: `API Failure: ${endpoint}`, details: error?.message || error });
  }

  authFailure(reason: string, details?: any) {
    this.log({ timestamp: new Date().toISOString(), level: 'warn', category: 'auth', message: `Auth Failure: ${reason}`, details });
  }
}

export const logger = new Logger();
