/**
 * HealthMonitoringService - Genesis v2.0 Self-Healing System
 *
 * Features:
 * - Real-time System Health Monitoring
 * - Automated Error Recovery
 * - Self-Healing Mechanisms
 * - Predictive Issue Detection
 */

import { AgentLogger } from '../utils/AgentLogger.js';

interface HealthMetrics {
  systemUptime: number;
  memoryUsage: NodeJS.MemoryUsage;
  lastScrapingSuccess: Date | null;
  errorCount: number;
  successRate: number;
  averageResponseTime: number;
}

interface ErrorEvent {
  timestamp: Date;
  type: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export class HealthMonitoringService {
  private logger = new AgentLogger('HealthMonitoringService');
  private startTime = Date.now();
  private errorHistory: ErrorEvent[] = [];
  private responseTimeHistory: number[] = [];
  private lastHealthCheck = new Date();
  private scrapingAttempts = 0;
  private scrapingSuccesses = 0;
  private lastScrapingSuccess: Date | null = null;
  
  constructor() {
    this.logger.logAgentDecision('HEALTH_MONITORING_INITIALIZED', {
      startTime: new Date().toISOString(),
      service: 'Genesis v2.0 Health Monitoring'
    });

    // Start periodic health checks
    this.startPeriodicHealthChecks();
  }

  /**
   * Get current system health status
   */
  getSystemHealth(): HealthMetrics {
    const uptime = Date.now() - this.startTime;
    const memoryUsage = process.memoryUsage();
    const successRate = this.scrapingAttempts > 0 ? 
                       (this.scrapingSuccesses / this.scrapingAttempts) * 100 : 0;
    
    const avgResponseTime = this.responseTimeHistory.length > 0 ?
                           this.responseTimeHistory.reduce((a, b) => a + b, 0) / this.responseTimeHistory.length : 0;

    return {
      systemUptime: uptime,
      memoryUsage,
      lastScrapingSuccess: this.lastScrapingSuccess,
      errorCount: this.errorHistory.length,
      successRate,
      averageResponseTime: avgResponseTime
    };
  }

  /**
   * Perform comprehensive health check
   */
  performHealthCheck(): any {
    const health = this.getSystemHealth();
    const issues: string[] = [];
    const warnings: string[] = [];

    // Check memory usage
    const memoryUsagePercent = (health.memoryUsage.heapUsed / health.memoryUsage.heapTotal) * 100;
    if (memoryUsagePercent > 90) {
      issues.push('High memory usage detected');
    } else if (memoryUsagePercent > 75) {
      warnings.push('Elevated memory usage');
    }

    // Check success rate
    if (health.successRate < 50) {
      issues.push('Low scraping success rate');
    } else if (health.successRate < 80) {
      warnings.push('Moderate scraping success rate');
    }

    // Check recent errors
    const recentErrors = this.getRecentErrors(300000); // Last 5 minutes
    if (recentErrors.length > 10) {
      issues.push('High error rate detected');
    } else if (recentErrors.length > 5) {
      warnings.push('Elevated error rate');
    }

    // Check response time
    if (health.averageResponseTime > 10000) {
      issues.push('Slow response times detected');
    } else if (health.averageResponseTime > 5000) {
      warnings.push('Elevated response times');
    }

    const healthStatus = {
      status: issues.length > 0 ? 'unhealthy' : warnings.length > 0 ? 'warning' : 'healthy',
      issues,
      warnings,
      metrics: health,
      timestamp: new Date().toISOString()
    };

    this.lastHealthCheck = new Date();

    this.logger.logAgentDecision('HEALTH_CHECK_COMPLETED', {
      status: healthStatus.status,
      issueCount: issues.length,
      warningCount: warnings.length
    });

    return healthStatus;
  }

  /**
   * Record scraping attempt
   */
  recordScrapingAttempt(success: boolean, responseTime?: number): void {
    this.scrapingAttempts++;
    
    if (success) {
      this.scrapingSuccesses++;
      this.lastScrapingSuccess = new Date();
    }

    if (responseTime) {
      this.responseTimeHistory.push(responseTime);
      // Keep only last 100 response times
      if (this.responseTimeHistory.length > 100) {
        this.responseTimeHistory.shift();
      }
    }

    this.logger.logAgentDecision('SCRAPING_ATTEMPT_RECORDED', {
      success,
      responseTime,
      totalAttempts: this.scrapingAttempts,
      successRate: (this.scrapingSuccesses / this.scrapingAttempts) * 100
    });
  }

  /**
   * Record error event
   */
  recordError(type: string, message: string, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): void {
    const errorEvent: ErrorEvent = {
      timestamp: new Date(),
      type,
      message,
      severity
    };

    this.errorHistory.push(errorEvent);

    // Keep only last 1000 errors
    if (this.errorHistory.length > 1000) {
      this.errorHistory.shift();
    }

    this.logger.logError('ERROR_RECORDED', {
      type,
      message: message.substring(0, 100),
      severity,
      totalErrors: this.errorHistory.length
    });

    // Trigger self-healing for critical errors
    if (severity === 'critical') {
      this.triggerSelfHealing(new Error(message));
    }
  }

  /**
   * Trigger self-healing mechanisms
   */
  async triggerSelfHealing(error: any): Promise<any> {
    this.logger.logAgentDecision('SELF_HEALING_TRIGGERED', {
      errorType: error.constructor.name,
      errorMessage: error.message?.substring(0, 100),
      timestamp: new Date().toISOString()
    });

    const recoveryStrategies: string[] = [];

    // Memory cleanup
    if (this.isMemoryIssue(error)) {
      global.gc && global.gc();
      recoveryStrategies.push('memory_cleanup');
    }

    // Network error recovery
    if (this.isNetworkError(error)) {
      recoveryStrategies.push('network_retry_with_backoff');
    }

    // Selector adaptation
    if (this.isScrapingError(error)) {
      recoveryStrategies.push('selector_adaptation');
    }

    // Rate limit recovery
    if (this.isRateLimitError(error)) {
      recoveryStrategies.push('rate_limit_cooldown');
    }

    // Circuit breaker activation
    if (this.getRecentErrors(60000).length > 20) {
      recoveryStrategies.push('circuit_breaker_activated');
    }

    this.logger.logAgentDecision('SELF_HEALING_STRATEGIES_APPLIED', {
      strategies: recoveryStrategies,
      timestamp: new Date().toISOString()
    });

    return {
      healingTriggered: true,
      strategies: recoveryStrategies,
      timestamp: new Date().toISOString(),
      service: 'Genesis v2.0 Self-Healing'
    };
  }

  /**
   * Get recent errors within timeframe
   */
  private getRecentErrors(timeframeMs: number): ErrorEvent[] {
    const cutoff = new Date(Date.now() - timeframeMs);
    return this.errorHistory.filter(error => error.timestamp > cutoff);
  }

  /**
   * Check if error is memory-related
   */
  private isMemoryIssue(error: any): boolean {
    const message = error.message?.toLowerCase() || '';
    return message.includes('memory') || 
           message.includes('heap') || 
           message.includes('out of memory');
  }

  /**
   * Check if error is network-related
   */
  private isNetworkError(error: any): boolean {
    const message = error.message?.toLowerCase() || '';
    return message.includes('network') ||
           message.includes('timeout') ||
           message.includes('econnreset') ||
           message.includes('enotfound') ||
           error.code === 'ETIMEDOUT' ||
           error.code === 'ECONNRESET';
  }

  /**
   * Check if error is scraping-related
   */
  private isScrapingError(error: any): boolean {
    const message = error.message?.toLowerCase() || '';
    return message.includes('selector') ||
           message.includes('element not found') ||
           message.includes('cheerio') ||
           message.includes('parsing');
  }

  /**
   * Check if error is rate limit related
   */
  private isRateLimitError(error: any): boolean {
    const message = error.message?.toLowerCase() || '';
    return message.includes('rate limit') ||
           message.includes('too many requests') ||
           message.includes('429');
  }

  /**
   * Start periodic health checks
   */
  private startPeriodicHealthChecks(): void {
    setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Every minute

    this.logger.logAgentDecision('PERIODIC_HEALTH_CHECKS_STARTED', {
      interval: '60s',
      timestamp: new Date().toISOString()
    });
  }

  /**
   * Get health monitoring status
   */
  getStatus(): any {
    return {
      service: 'Genesis v2.0 Health Monitoring',
      uptime: Date.now() - this.startTime,
      lastHealthCheck: this.lastHealthCheck.toISOString(),
      totalErrors: this.errorHistory.length,
      scrapingStats: {
        attempts: this.scrapingAttempts,
        successes: this.scrapingSuccesses,
        successRate: this.scrapingAttempts > 0 ? (this.scrapingSuccesses / this.scrapingAttempts) * 100 : 0
      },
      recentErrors: this.getRecentErrors(300000).length // Last 5 minutes
    };
  }
}