/**
 * AgentLogger - Genesis v2.0 Agent Decision Logging System
 *
 * Features:
 * - Comprehensive Agent Decision Tracking
 * - Structured Logging for Analysis
 * - Performance Metrics Collection
 * - Error Correlation and Analysis
 */

export class AgentLogger {
  private agentName: string;
  private logHistory: any[] = [];
  private startTime = Date.now();

  constructor(agentName: string) {
    this.agentName = agentName;
    console.log(`🤖 ${agentName} Agent initialized - Genesis v2.0`);
  }

  /**
   * Log agent decision with context
   */
  logAgentDecision(action: string, context: any = {}): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      agent: this.agentName,
      action,
      context,
      sessionTime: Date.now() - this.startTime
    };

    this.logHistory.push(logEntry);
    
    // Keep only last 1000 entries to prevent memory issues
    if (this.logHistory.length > 1000) {
      this.logHistory.shift();
    }

    // Console output with color coding
    const timestamp = new Date().toLocaleTimeString();
    console.log(`🤖 [${timestamp}] ${this.agentName}: ${action}`, context);
  }

  /**
   * Log error with context
   */
  logError(action: string, error: any, context: any = {}): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      agent: this.agentName,
      action,
      error: {
        message: error.message,
        name: error.name,
        stack: error.stack?.substring(0, 500) // Truncate stack trace
      },
      context,
      sessionTime: Date.now() - this.startTime,
      level: 'ERROR'
    };

    this.logHistory.push(logEntry);

    // Console output with error formatting
    const timestamp = new Date().toLocaleTimeString();
    console.error(`❌ [${timestamp}] ${this.agentName} ERROR: ${action}`, {
      error: error.message,
      context
    });
  }

  /**
   * Log warning
   */
  logWarning(action: string, context: any = {}): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      agent: this.agentName,
      action,
      context,
      sessionTime: Date.now() - this.startTime,
      level: 'WARNING'
    };

    this.logHistory.push(logEntry);

    const timestamp = new Date().toLocaleTimeString();
    console.warn(`⚠️  [${timestamp}] ${this.agentName} WARNING: ${action}`, context);
  }

  /**
   * Log success with metrics
   */
  logSuccess(action: string, metrics: any = {}): void {
    const logEntry = {
      timestamp: new Date().toISOString(),
      agent: this.agentName,
      action,
      metrics,
      sessionTime: Date.now() - this.startTime,
      level: 'SUCCESS'
    };

    this.logHistory.push(logEntry);

    const timestamp = new Date().toLocaleTimeString();
    console.log(`✅ [${timestamp}] ${this.agentName} SUCCESS: ${action}`, metrics);
  }

  /**
   * Get agent performance summary
   */
  getPerformanceSummary(): any {
    const totalActions = this.logHistory.length;
    const errors = this.logHistory.filter(entry => entry.level === 'ERROR').length;
    const warnings = this.logHistory.filter(entry => entry.level === 'WARNING').length;
    const successes = this.logHistory.filter(entry => entry.level === 'SUCCESS').length;
    
    const sessionDuration = Date.now() - this.startTime;
    const actionsPerMinute = totalActions > 0 ? (totalActions / (sessionDuration / 60000)) : 0;
    
    return {
      agent: this.agentName,
      sessionDuration,
      totalActions,
      errors,
      warnings,
      successes,
      errorRate: totalActions > 0 ? (errors / totalActions) * 100 : 0,
      successRate: totalActions > 0 ? (successes / totalActions) * 100 : 0,
      actionsPerMinute,
      lastActivity: this.logHistory.length > 0 ? this.logHistory[this.logHistory.length - 1].timestamp : null
    };
  }

  /**
   * Get recent activity
   */
  getRecentActivity(minutes: number = 5): any[] {
    const cutoff = Date.now() - (minutes * 60000);
    return this.logHistory.filter(entry => {
      return new Date(entry.timestamp).getTime() > cutoff;
    });
  }

  /**
   * Export logs for analysis
   */
  exportLogs(): any {
    return {
      agent: this.agentName,
      exportedAt: new Date().toISOString(),
      sessionStarted: new Date(this.startTime).toISOString(),
      totalEntries: this.logHistory.length,
      performanceSummary: this.getPerformanceSummary(),
      logs: this.logHistory
    };
  }

  /**
   * Clear log history
   */
  clearLogs(): void {
    const previousCount = this.logHistory.length;
    this.logHistory = [];
    this.logAgentDecision('LOGS_CLEARED', { previousLogCount: previousCount });
  }

  /**
   * Search logs by action or context
   */
  searchLogs(query: string): any[] {
    const lowercaseQuery = query.toLowerCase();
    return this.logHistory.filter(entry => {
      return entry.action.toLowerCase().includes(lowercaseQuery) ||
             JSON.stringify(entry.context).toLowerCase().includes(lowercaseQuery);
    });
  }
}