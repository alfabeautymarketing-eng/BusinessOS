// ===== LOG AGGREGATOR - СИСТЕМА ОБЪЕДИНЕНИЯ ЛОГОВ ИЗ 3 ИСТОЧНИКОВ =====

import loggingConfig from '../config/logging.config.json';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// ===== TYPES =====

export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';
export type LogSourceType = 'google-sheets' | 'server-files' | 'websocket';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  function?: string;
  details?: string;
  emoji: string;
  source: LogSourceType;
}

export type LogCallback = (logs: LogEntry[]) => void;

// ===== BASE LOG SOURCE =====

abstract class LogSource {
  protected callback: LogCallback | null = null;
  protected isActive: boolean = false;

  abstract start(): void;
  abstract stop(): void;
  abstract getSourceType(): LogSourceType;

  subscribe(callback: LogCallback) {
    this.callback = callback;
  }

  protected emitLogs(logs: LogEntry[]) {
    if (this.callback) {
      this.callback(logs);
    }
  }
}

// ===== GOOGLE SHEETS LOG SOURCE =====

export class GoogleSheetsLogSource extends LogSource {
  private intervalId: NodeJS.Timeout | null = null;
  private spreadsheetId: string;
  private sheetName: string;
  private pollingInterval: number;

  constructor(spreadsheetId: string, sheetName: string = 'Журнал синхро', pollingInterval: number = 5000) {
    super();
    this.spreadsheetId = spreadsheetId;
    this.sheetName = sheetName;
    this.pollingInterval = pollingInterval;
  }

  getSourceType(): LogSourceType {
    return 'google-sheets';
  }

  start() {
    if (this.isActive) return;

    this.isActive = true;
    this.fetchLogs(); // Fetch immediately
    this.intervalId = setInterval(() => this.fetchLogs(), this.pollingInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isActive = false;
  }

  private async fetchLogs() {
    try {
      const response = await fetch(
        `${API_BASE_URL}/api/logs/sheets/${this.spreadsheetId}?sheet=${encodeURIComponent(this.sheetName)}&tail=100`
      );

      if (!response.ok) {
        console.error('Failed to fetch Google Sheets logs:', response.status);
        return;
      }

      const data = await response.json();
      const logs: LogEntry[] = data.logs || [];

      // Enrich with emoji if not present
      const enrichedLogs = logs.map(log => ({
        ...log,
        emoji: log.emoji || this.getEmojiForLog(log)
      }));

      this.emitLogs(enrichedLogs);
    } catch (error) {
      console.error('Error fetching Google Sheets logs:', error);
    }
  }

  private getEmojiForLog(log: LogEntry): string {
    // Use config to map emojis
    const config = loggingConfig.sources.find(s => s.id === 'google-sheets');
    const emojiMap = config?.emojiMapping || {};

    // Try to match by level
    if (log.level in emojiMap) {
      return emojiMap[log.level as keyof typeof emojiMap];
    }

    // Default emojis
    const defaults: Record<LogLevel, string> = {
      DEBUG: '🐛',
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌'
    };

    return defaults[log.level] || 'ℹ️';
  }
}

// ===== SERVER FILES LOG SOURCE =====

export class FileLogSource extends LogSource {
  private intervalId: NodeJS.Timeout | null = null;
  private pollingInterval: number;

  constructor(pollingInterval: number = 3000) {
    super();
    this.pollingInterval = pollingInterval;
  }

  getSourceType(): LogSourceType {
    return 'server-files';
  }

  start() {
    if (this.isActive) return;

    this.isActive = true;
    this.fetchLogs(); // Fetch immediately
    this.intervalId = setInterval(() => this.fetchLogs(), this.pollingInterval);
  }

  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isActive = false;
  }

  private async fetchLogs() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/logs/server?tail=100`);

      if (!response.ok) {
        console.error('Failed to fetch server logs:', response.status);
        return;
      }

      const data = await response.json();
      const logs: LogEntry[] = data.logs || [];

      // Enrich with emoji if not present
      const enrichedLogs = logs.map(log => ({
        ...log,
        emoji: log.emoji || this.getEmojiForLog(log)
      }));

      this.emitLogs(enrichedLogs);
    } catch (error) {
      console.error('Error fetching server logs:', error);
    }
  }

  private getEmojiForLog(log: LogEntry): string {
    const config = loggingConfig.sources.find(s => s.id === 'server-files');
    const emojiMap = config?.emojiMapping || {};

    if (log.level in emojiMap) {
      return emojiMap[log.level as keyof typeof emojiMap];
    }

    const defaults: Record<LogLevel, string> = {
      DEBUG: '🐛',
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌'
    };

    return defaults[log.level] || 'ℹ️';
  }
}

// ===== WEBSOCKET LOG SOURCE =====

export class WebSocketLogSource extends LogSource {
  private ws: WebSocket | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 5;
  private reconnectDelay: number = 1000;
  private wsUrl: string;
  private logs: LogEntry[] = [];

  constructor() {
    super();
    // Replace http with ws protocol
    this.wsUrl = API_BASE_URL.replace(/^http/, 'ws') + '/ws/logs';
  }

  getSourceType(): LogSourceType {
    return 'websocket';
  }

  start() {
    if (this.isActive) return;

    this.isActive = true;
    this.connect();
  }

  stop() {
    this.isActive = false;
    this.reconnectAttempts = 0;

    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private connect() {
    try {
      this.ws = new WebSocket(this.wsUrl);

      this.ws.onopen = () => {
        console.log('✅ WebSocket connected for real-time logs');
        this.reconnectAttempts = 0;
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Handle connection message
          if (data.type === 'connected') {
            console.log('WebSocket:', data.message);
            return;
          }

          // Handle log entry
          const logEntry: LogEntry = {
            timestamp: data.timestamp || new Date().toISOString(),
            level: data.level || 'INFO',
            message: data.message || '',
            function: data.function,
            details: data.details,
            emoji: data.emoji || this.getEmojiForLog(data),
            source: 'websocket'
          };

          // Add to buffer
          this.logs.push(logEntry);

          // Keep only last 100 logs
          if (this.logs.length > 100) {
            this.logs = this.logs.slice(-100);
          }

          // Emit updated logs
          this.emitLogs([...this.logs]);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');

        if (this.isActive && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnectAttempts++;
          const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff
          console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

          setTimeout(() => {
            if (this.isActive) {
              this.connect();
            }
          }, delay);
        }
      };
    } catch (error) {
      console.error('Error creating WebSocket:', error);
    }
  }

  private getEmojiForLog(log: Partial<LogEntry>): string {
    const config = loggingConfig.sources.find(s => s.id === 'websocket');
    const emojiMap = config?.emojiMapping || {};

    if (log.level && log.level in emojiMap) {
      return emojiMap[log.level as keyof typeof emojiMap];
    }

    const defaults: Record<string, string> = {
      DEBUG: '🐛',
      INFO: 'ℹ️',
      WARN: '⚠️',
      ERROR: '❌'
    };

    return defaults[log.level || 'INFO'] || 'ℹ️';
  }
}

// ===== LOG AGGREGATOR =====

export class LogAggregator {
  private sources: Map<LogSourceType, LogSource> = new Map();
  private activeSource: LogSourceType | null = null;
  private globalCallback: LogCallback | null = null;

  constructor() {
    // Initialize all sources (but don't start them)
  }

  /**
   * Register a log source
   */
  registerSource(source: LogSource) {
    this.sources.set(source.getSourceType(), source);
  }

  /**
   * Subscribe to logs from a specific source
   */
  subscribe(sourceType: LogSourceType, callback: LogCallback) {
    this.globalCallback = callback;

    // Stop current active source
    if (this.activeSource && this.sources.has(this.activeSource)) {
      this.sources.get(this.activeSource)!.stop();
    }

    // Start new source
    const source = this.sources.get(sourceType);
    if (source) {
      source.subscribe(callback);
      source.start();
      this.activeSource = sourceType;
    } else {
      console.error(`Log source '${sourceType}' not registered`);
    }
  }

  /**
   * Stop all sources
   */
  stopAll() {
    this.sources.forEach(source => source.stop());
    this.activeSource = null;
  }

  /**
   * Get currently active source type
   */
  getActiveSource(): LogSourceType | null {
    return this.activeSource;
  }
}

// ===== SINGLETON EXPORT =====

let aggregatorInstance: LogAggregator | null = null;

export function getLogAggregator(): LogAggregator {
  if (!aggregatorInstance) {
    aggregatorInstance = new LogAggregator();
  }
  return aggregatorInstance;
}
