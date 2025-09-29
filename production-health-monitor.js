/**
 * 📊 PRODUCTION HEALTH MONITORING SYSTEM
 * Agent 5: Deployment Coordinator - Production Monitoring
 *
 * Real-time monitoring for JavaScript execution fix deployment
 * Tracks performance, errors, and system health
 */

class ProductionHealthMonitor {
    constructor() {
        this.metrics = {
            // JavaScript execution metrics
            javascript: {
                successRate: 100,
                totalExecutions: 0,
                errorCount: 0,
                averageExecutionTime: 0,
                executionTimes: [],
                lastExecution: null
            },

            // Security metrics
            security: {
                xssAttempts: 0,
                blockedScripts: 0,
                validationFailures: 0,
                lastSecurityEvent: null
            },

            // Performance metrics
            performance: {
                pageLoadTimes: [],
                averageLoadTime: 0,
                slowRequests: 0,
                timeouts: 0,
                lastPerformanceCheck: null
            },

            // Order 5374 specific metrics
            order5374: {
                previewGenerations: 0,
                successfulPreviews: 0,
                failedPreviews: 0,
                lastPreviewTime: null,
                lastPreviewStatus: null
            },

            // System health
            system: {
                uptime: 0,
                healthScore: 100,
                criticalErrors: 0,
                warnings: 0,
                lastHealthCheck: new Date()
            }
        };

        this.alertThresholds = {
            maxErrorRate: 5,           // 5% error rate triggers alert
            maxExecutionTime: 200,     // 200ms execution time threshold
            maxLoadTime: 3000,         // 3 second page load threshold
            minSuccessRate: 95         // 95% success rate minimum
        };

        this.startTime = Date.now();
        this.isMonitoring = true;

        console.log('📊 PRODUCTION HEALTH MONITOR INITIALIZED');
        console.log('🎯 Monitoring JavaScript execution fix deployment');

        this.initializeMonitoring();
    }

    /**
     * 🚀 Initialize monitoring systems
     */
    initializeMonitoring() {
        // Monitor JavaScript execution
        this.monitorJavaScriptExecution();

        // Monitor security events
        this.monitorSecurityEvents();

        // Monitor performance
        this.monitorPerformance();

        // Monitor Order 5374 specific functionality
        this.monitorOrder5374();

        // Start health check interval
        setInterval(() => this.performHealthCheck(), 30000); // Every 30 seconds

        console.log('✅ All monitoring systems active');
    }

    /**
     * ⚡ Monitor JavaScript execution success/failure
     */
    monitorJavaScriptExecution() {
        // Wrap console.error to catch JavaScript errors
        const originalConsoleError = console.error;
        console.error = (...args) => {
            // Check for JavaScript execution errors
            const errorMessage = args.join(' ');
            if (errorMessage.includes('script') ||
                errorMessage.includes('JavaScript') ||
                errorMessage.includes('execution')) {
                this.recordJavaScriptError(errorMessage);
            }
            originalConsoleError.apply(console, args);
        };

        // Monitor successful script insertions
        if (window.insertHtmlWithScripts) {
            const originalInsertFunction = window.insertHtmlWithScripts;
            window.insertHtmlWithScripts = (containerSelector, htmlContent) => {
                const startTime = performance.now();
                try {
                    const result = originalInsertFunction(containerSelector, htmlContent);
                    const executionTime = performance.now() - startTime;
                    this.recordJavaScriptExecution(executionTime, true);
                    return result;
                } catch (error) {
                    const executionTime = performance.now() - startTime;
                    this.recordJavaScriptExecution(executionTime, false);
                    this.recordJavaScriptError(error.message);
                    throw error;
                }
            };
        }
    }

    /**
     * 🔒 Monitor security events
     */
    monitorSecurityEvents() {
        // Monitor XSS prevention
        const originalInnerHTML = Element.prototype.innerHTML;
        Object.defineProperty(Element.prototype, 'innerHTML', {
            set: function(value) {
                // Check for potential XSS patterns
                if (this.monitorInstance &&
                    (value.includes('<script') || value.includes('javascript:'))) {
                    this.monitorInstance.recordSecurityEvent('XSS_ATTEMPT', value);
                }
                return originalInnerHTML.call(this, value);
            }.bind(this),
            get: function() {
                return originalInnerHTML.call(this);
            }
        });
    }

    /**
     * 📈 Monitor performance metrics
     */
    monitorPerformance() {
        // Monitor page load times
        window.addEventListener('load', () => {
            const loadTime = performance.now();
            this.recordPageLoad(loadTime);
        });

        // Monitor AJAX performance
        const originalXHROpen = XMLHttpRequest.prototype.open;
        XMLHttpRequest.prototype.open = function(...args) {
            this._startTime = performance.now();
            return originalXHROpen.apply(this, args);
        };

        const originalXHRSend = XMLHttpRequest.prototype.send;
        XMLHttpRequest.prototype.send = function(...args) {
            this.addEventListener('loadend', () => {
                if (this._startTime) {
                    const requestTime = performance.now() - this._startTime;
                    window.productionHealthMonitor?.recordAjaxPerformance(requestTime);
                }
            });
            return originalXHRSend.apply(this, args);
        };
    }

    /**
     * 🎯 Monitor Order 5374 specific functionality
     */
    monitorOrder5374() {
        // Monitor preview button clicks
        document.addEventListener('click', (event) => {
            if (event.target.id === 'generate-design-preview' ||
                event.target.classList.contains('design-preview-btn')) {
                this.recordOrder5374PreviewAttempt();
            }
        });

        // Monitor preview generation success/failure
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const url = args[0];
            if (typeof url === 'string' && url.includes('order') && url.includes('5374')) {
                const startTime = performance.now();
                try {
                    const response = await originalFetch(...args);
                    const responseTime = performance.now() - startTime;

                    if (response.ok) {
                        this.recordOrder5374Success(responseTime);
                    } else {
                        this.recordOrder5374Failure(responseTime, response.status);
                    }

                    return response;
                } catch (error) {
                    const responseTime = performance.now() - startTime;
                    this.recordOrder5374Failure(responseTime, error.message);
                    throw error;
                }
            }
            return originalFetch(...args);
        };
    }

    /**
     * 📊 Record JavaScript execution metrics
     */
    recordJavaScriptExecution(executionTime, success) {
        this.metrics.javascript.totalExecutions++;
        this.metrics.javascript.executionTimes.push(executionTime);
        this.metrics.javascript.lastExecution = new Date();

        if (success) {
            const successCount = this.metrics.javascript.totalExecutions - this.metrics.javascript.errorCount;
            this.metrics.javascript.successRate = (successCount / this.metrics.javascript.totalExecutions) * 100;
        } else {
            this.metrics.javascript.errorCount++;
            this.recordCriticalError('JavaScript execution failed');
        }

        // Calculate average execution time
        this.metrics.javascript.averageExecutionTime =
            this.metrics.javascript.executionTimes.reduce((a, b) => a + b, 0) /
            this.metrics.javascript.executionTimes.length;

        // Keep only last 100 measurements
        if (this.metrics.javascript.executionTimes.length > 100) {
            this.metrics.javascript.executionTimes =
                this.metrics.javascript.executionTimes.slice(-100);
        }

        this.checkPerformanceThresholds();
    }

    /**
     * ❌ Record JavaScript errors
     */
    recordJavaScriptError(errorMessage) {
        this.metrics.javascript.errorCount++;
        this.recordCriticalError(`JavaScript Error: ${errorMessage}`);

        console.error('📊 PRODUCTION MONITOR: JavaScript error recorded', {
            error: errorMessage,
            totalErrors: this.metrics.javascript.errorCount,
            successRate: this.metrics.javascript.successRate.toFixed(2) + '%'
        });
    }

    /**
     * 🔒 Record security events
     */
    recordSecurityEvent(eventType, details) {
        this.metrics.security.lastSecurityEvent = new Date();

        switch(eventType) {
            case 'XSS_ATTEMPT':
                this.metrics.security.xssAttempts++;
                break;
            case 'BLOCKED_SCRIPT':
                this.metrics.security.blockedScripts++;
                break;
            case 'VALIDATION_FAILURE':
                this.metrics.security.validationFailures++;
                break;
        }

        this.recordCriticalError(`Security Event: ${eventType}`);

        console.warn('🔒 SECURITY EVENT DETECTED:', {
            type: eventType,
            details: details,
            timestamp: new Date()
        });
    }

    /**
     * 🎯 Record Order 5374 specific metrics
     */
    recordOrder5374PreviewAttempt() {
        this.metrics.order5374.previewGenerations++;
        this.metrics.order5374.lastPreviewTime = new Date();
    }

    recordOrder5374Success(responseTime) {
        this.metrics.order5374.successfulPreviews++;
        this.metrics.order5374.lastPreviewStatus = 'success';
        this.recordAjaxPerformance(responseTime);
    }

    recordOrder5374Failure(responseTime, error) {
        this.metrics.order5374.failedPreviews++;
        this.metrics.order5374.lastPreviewStatus = 'failed';
        this.recordCriticalError(`Order 5374 preview failed: ${error}`);
    }

    /**
     * 📈 Record performance metrics
     */
    recordPageLoad(loadTime) {
        this.metrics.performance.pageLoadTimes.push(loadTime);
        this.metrics.performance.averageLoadTime =
            this.metrics.performance.pageLoadTimes.reduce((a, b) => a + b, 0) /
            this.metrics.performance.pageLoadTimes.length;

        if (loadTime > this.alertThresholds.maxLoadTime) {
            this.metrics.performance.slowRequests++;
            this.recordWarning(`Slow page load: ${loadTime.toFixed(2)}ms`);
        }

        // Keep only last 100 measurements
        if (this.metrics.performance.pageLoadTimes.length > 100) {
            this.metrics.performance.pageLoadTimes =
                this.metrics.performance.pageLoadTimes.slice(-100);
        }
    }

    recordAjaxPerformance(requestTime) {
        this.metrics.performance.lastPerformanceCheck = new Date();

        if (requestTime > this.alertThresholds.maxExecutionTime) {
            this.recordWarning(`Slow AJAX request: ${requestTime.toFixed(2)}ms`);
        }
    }

    /**
     * 🏥 Perform comprehensive health check
     */
    performHealthCheck() {
        this.metrics.system.uptime = Date.now() - this.startTime;
        this.metrics.system.lastHealthCheck = new Date();

        // Calculate overall health score
        let healthScore = 100;

        // JavaScript execution health (40% weight)
        if (this.metrics.javascript.successRate < this.alertThresholds.minSuccessRate) {
            healthScore -= (100 - this.metrics.javascript.successRate) * 0.4;
        }

        // Performance health (30% weight)
        if (this.metrics.javascript.averageExecutionTime > this.alertThresholds.maxExecutionTime) {
            const performancePenalty = Math.min(30,
                (this.metrics.javascript.averageExecutionTime - this.alertThresholds.maxExecutionTime) / 10
            );
            healthScore -= performancePenalty;
        }

        // Security health (20% weight)
        if (this.metrics.security.xssAttempts > 0 || this.metrics.security.validationFailures > 0) {
            healthScore -= Math.min(20, (this.metrics.security.xssAttempts + this.metrics.security.validationFailures) * 2);
        }

        // Order 5374 specific health (10% weight)
        if (this.metrics.order5374.previewGenerations > 0) {
            const order5374SuccessRate = (this.metrics.order5374.successfulPreviews / this.metrics.order5374.previewGenerations) * 100;
            if (order5374SuccessRate < 95) {
                healthScore -= (100 - order5374SuccessRate) * 0.1;
            }
        }

        this.metrics.system.healthScore = Math.max(0, healthScore);

        // Log health status
        this.logHealthStatus();

        // Trigger alerts if necessary
        this.checkAlertConditions();
    }

    /**
     * 🚨 Check for alert conditions
     */
    checkAlertConditions() {
        const alerts = [];

        // JavaScript error rate too high
        if (this.metrics.javascript.successRate < this.alertThresholds.minSuccessRate) {
            alerts.push(`JavaScript success rate below threshold: ${this.metrics.javascript.successRate.toFixed(2)}%`);
        }

        // Execution time too slow
        if (this.metrics.javascript.averageExecutionTime > this.alertThresholds.maxExecutionTime) {
            alerts.push(`JavaScript execution too slow: ${this.metrics.javascript.averageExecutionTime.toFixed(2)}ms`);
        }

        // Security events detected
        if (this.metrics.security.xssAttempts > 0) {
            alerts.push(`XSS attempts detected: ${this.metrics.security.xssAttempts}`);
        }

        // Order 5374 failures
        if (this.metrics.order5374.failedPreviews > 0) {
            alerts.push(`Order 5374 preview failures: ${this.metrics.order5374.failedPreviews}`);
        }

        // Health score critical
        if (this.metrics.system.healthScore < 70) {
            alerts.push(`System health critical: ${this.metrics.system.healthScore.toFixed(1)}%`);
        }

        if (alerts.length > 0) {
            this.triggerAlert(alerts);
        }
    }

    /**
     * 🚨 Trigger production alert
     */
    triggerAlert(alerts) {
        console.error('🚨 PRODUCTION ALERT TRIGGERED');
        console.error('⚠️  Critical issues detected:', alerts);

        // Send alert to monitoring system (would integrate with external monitoring)
        const alertData = {
            timestamp: new Date(),
            severity: 'CRITICAL',
            component: 'JavaScript Execution Fix',
            alerts: alerts,
            healthScore: this.metrics.system.healthScore,
            metrics: this.getStatusSummary()
        };

        console.error('📊 ALERT DATA:', alertData);
    }

    /**
     * 📝 Log health status
     */
    logHealthStatus() {
        if (Math.random() < 0.1) { // Log every ~10 health checks to avoid spam
            console.log('📊 PRODUCTION HEALTH STATUS:', this.getStatusSummary());
        }
    }

    /**
     * ⚠️  Record system warnings
     */
    recordWarning(message) {
        this.metrics.system.warnings++;
        console.warn('⚠️  PRODUCTION WARNING:', message);
    }

    /**
     * ❌ Record critical errors
     */
    recordCriticalError(message) {
        this.metrics.system.criticalErrors++;
        console.error('❌ CRITICAL ERROR:', message);
    }

    /**
     * 📊 Get comprehensive status summary
     */
    getStatusSummary() {
        return {
            healthScore: this.metrics.system.healthScore.toFixed(1) + '%',
            uptime: Math.round(this.metrics.system.uptime / 1000) + ' seconds',
            javascript: {
                successRate: this.metrics.javascript.successRate.toFixed(2) + '%',
                totalExecutions: this.metrics.javascript.totalExecutions,
                averageExecutionTime: this.metrics.javascript.averageExecutionTime.toFixed(2) + 'ms',
                errorCount: this.metrics.javascript.errorCount
            },
            security: {
                xssAttempts: this.metrics.security.xssAttempts,
                blockedScripts: this.metrics.security.blockedScripts,
                validationFailures: this.metrics.security.validationFailures
            },
            order5374: {
                totalPreviews: this.metrics.order5374.previewGenerations,
                successfulPreviews: this.metrics.order5374.successfulPreviews,
                failedPreviews: this.metrics.order5374.failedPreviews,
                lastStatus: this.metrics.order5374.lastPreviewStatus
            },
            system: {
                criticalErrors: this.metrics.system.criticalErrors,
                warnings: this.metrics.system.warnings,
                lastHealthCheck: this.metrics.system.lastHealthCheck
            }
        };
    }

    /**
     * 🔧 Manual health check trigger
     */
    runHealthCheck() {
        console.log('🔧 MANUAL HEALTH CHECK TRIGGERED');
        this.performHealthCheck();
        return this.getStatusSummary();
    }

    /**
     * 📈 Get detailed metrics
     */
    getDetailedMetrics() {
        return JSON.parse(JSON.stringify(this.metrics));
    }
}

// Initialize production monitoring
if (typeof window !== 'undefined') {
    window.productionHealthMonitor = new ProductionHealthMonitor();

    // Make status check available globally
    window.checkProductionHealth = () => window.productionHealthMonitor.runHealthCheck();
    window.getProductionMetrics = () => window.productionHealthMonitor.getDetailedMetrics();

    console.log('📊 PRODUCTION HEALTH MONITORING ACTIVE');
    console.log('🔧 Use window.checkProductionHealth() for manual health check');
    console.log('📈 Use window.getProductionMetrics() for detailed metrics');
}