/**
 * 🚨 COMPREHENSIVE ERROR HANDLING & FALLBACK SYSTEMS SPECIALIST - AGENT 6
 *
 * MISSION: Design comprehensive error handling and fallback mechanisms for JavaScript execution
 *
 * This system provides hierarchical error handling, progressive enhancement,
 * and robust fallback mechanisms for all JavaScript execution scenarios.
 */

(function() {
    'use strict';

    console.log('🚨 COMPREHENSIVE ERROR HANDLER: Initializing Agent 6 system');

    // Prevent multiple initializations
    if (window.comprehensiveErrorHandler) {
        console.log('✅ COMPREHENSIVE ERROR HANDLER: Already active');
        return;
    }

    /**
     * Configuration for error handling and recovery
     */
    const CONFIG = {
        maxRetryAttempts: 3,
        retryDelayBase: 1000, // Base delay for exponential backoff
        maxRetryDelay: 10000,
        timeoutThreshold: 15000,
        fallbackTimeout: 5000,
        networkRetryDelay: 2000,
        criticalErrorThreshold: 5,
        userNotificationDelay: 3000,
        logBufferSize: 100,
        performanceThreshold: 500 // ms
    };

    /**
     * Error Categories and Classification
     */
    const ERROR_CATEGORIES = {
        SYNTAX: 'syntax_error',
        RUNTIME: 'runtime_error',
        NETWORK: 'network_error',
        SECURITY: 'security_error',
        TIMEOUT: 'timeout_error',
        RESOURCE: 'resource_error',
        PERMISSION: 'permission_error',
        BROWSER: 'browser_compatibility_error',
        DEPENDENCY: 'dependency_error',
        CRITICAL: 'critical_system_error'
    };

    /**
     * State management for error handling
     */
    const state = {
        errorCounts: new Map(),
        activeRecoveries: new Set(),
        criticalErrors: [],
        errorLog: [],
        performanceMetrics: new Map(),
        fallbackStates: new Map(),
        userNotifications: new Set()
    };

    /**
     * Advanced Error Classification System
     */
    class ErrorClassifier {
        static classify(error, context = {}) {
            const errorInfo = {
                category: ERROR_CATEGORIES.RUNTIME,
                severity: 'medium',
                recoverable: true,
                fallbackRequired: false,
                userAction: 'retry',
                context: context,
                timestamp: Date.now(),
                stackTrace: error.stack,
                message: error.message
            };

            // Syntax errors
            if (error instanceof SyntaxError || error.message.includes('Unexpected token')) {
                errorInfo.category = ERROR_CATEGORIES.SYNTAX;
                errorInfo.severity = 'high';
                errorInfo.recoverable = false;
                errorInfo.fallbackRequired = true;
                errorInfo.userAction = 'reload';
            }

            // Network errors
            if (error.message.includes('fetch') || error.message.includes('network') ||
                error.message.includes('timeout') || context.type === 'ajax') {
                errorInfo.category = ERROR_CATEGORIES.NETWORK;
                errorInfo.recoverable = true;
                errorInfo.userAction = 'retry';
            }

            // Security errors (CSP, CORS, etc.)
            if (error.message.includes('Content Security Policy') ||
                error.message.includes('blocked') || error.message.includes('CORS')) {
                errorInfo.category = ERROR_CATEGORIES.SECURITY;
                errorInfo.severity = 'high';
                errorInfo.recoverable = false;
                errorInfo.fallbackRequired = true;
                errorInfo.userAction = 'contact_support';
            }

            // Permission errors
            if (error.message.includes('Permission denied') || error.message.includes('Unauthorized')) {
                errorInfo.category = ERROR_CATEGORIES.PERMISSION;
                errorInfo.severity = 'high';
                errorInfo.recoverable = false;
                errorInfo.userAction = 'refresh_permissions';
            }

            // Browser compatibility
            if (error.message.includes('is not a function') || error.message.includes('not supported')) {
                errorInfo.category = ERROR_CATEGORIES.BROWSER;
                errorInfo.fallbackRequired = true;
                errorInfo.userAction = 'update_browser';
            }

            // Dependency errors (Fabric.js, jQuery, etc.)
            if (error.message.includes('fabric') || error.message.includes('jQuery') ||
                error.message.includes('undefined') && context.dependency) {
                errorInfo.category = ERROR_CATEGORIES.DEPENDENCY;
                errorInfo.severity = 'critical';
                errorInfo.fallbackRequired = true;
                errorInfo.userAction = 'reload';
            }

            return errorInfo;
        }
    }

    /**
     * Hierarchical Script Execution Handler
     */
    class ScriptExecutionHandler {
        constructor() {
            this.executionMethods = [
                this.directExecution.bind(this),
                this.scriptTagInjection.bind(this),
                this.functionConstructor.bind(this),
                this.iframeExecution.bind(this),
                this.workerExecution.bind(this)
            ];
        }

        async executeWithFallbacks(scriptContent, context = {}) {
            const startTime = performance.now();
            let lastError = null;

            for (let i = 0; i < this.executionMethods.length; i++) {
                const method = this.executionMethods[i];
                const methodName = method.name || `method_${i}`;

                try {
                    console.log(`🔄 SCRIPT EXECUTION: Attempting ${methodName}`);

                    const result = await this.executeWithTimeout(
                        method(scriptContent, context),
                        CONFIG.fallbackTimeout
                    );

                    const executionTime = performance.now() - startTime;
                    this.recordPerformance(methodName, executionTime, 'success');

                    console.log(`✅ SCRIPT EXECUTION: Success with ${methodName} (${executionTime.toFixed(1)}ms)`);
                    return result;

                } catch (error) {
                    lastError = error;
                    const errorInfo = ErrorClassifier.classify(error, { method: methodName, ...context });

                    console.warn(`⚠️ SCRIPT EXECUTION: ${methodName} failed:`, error.message);
                    this.logError(errorInfo);

                    // If this is a security error, skip remaining unsafe methods
                    if (errorInfo.category === ERROR_CATEGORIES.SECURITY) {
                        console.warn('🚨 SCRIPT EXECUTION: Security error detected, skipping unsafe methods');
                        break;
                    }

                    // Add delay between attempts for network-related errors
                    if (errorInfo.category === ERROR_CATEGORIES.NETWORK && i < this.executionMethods.length - 1) {
                        await this.delay(CONFIG.networkRetryDelay);
                    }
                }
            }

            // All methods failed
            const executionTime = performance.now() - startTime;
            this.recordPerformance('all_methods', executionTime, 'failure');

            return this.handleCompleteFailure(lastError, context);
        }

        async directExecution(scriptContent, context) {
            // Direct execution in current context
            return Function(scriptContent)();
        }

        async scriptTagInjection(scriptContent, context) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.textContent = scriptContent;
                script.onload = () => resolve('Script injected successfully');
                script.onerror = (error) => reject(new Error('Script injection failed'));

                // Add nonce if available for CSP compliance
                if (context.nonce || window.octoPrintDesigner?.nonce) {
                    script.nonce = context.nonce || window.octoPrintDesigner.nonce;
                }

                document.head.appendChild(script);

                // Auto-cleanup after execution
                setTimeout(() => {
                    if (script.parentNode) {
                        script.parentNode.removeChild(script);
                    }
                }, 1000);
            });
        }

        async functionConstructor(scriptContent, context) {
            // Safer than eval, but still dynamic
            const wrappedScript = `
                try {
                    ${scriptContent}
                } catch (error) {
                    throw new Error('Function constructor execution failed: ' + error.message);
                }
            `;

            const fn = new Function(wrappedScript);
            return fn();
        }

        async iframeExecution(scriptContent, context) {
            return new Promise((resolve, reject) => {
                const iframe = document.createElement('iframe');
                iframe.style.display = 'none';
                iframe.sandbox = 'allow-scripts allow-same-origin';

                iframe.onload = () => {
                    try {
                        const iframeWindow = iframe.contentWindow;
                        iframeWindow.eval(scriptContent);
                        resolve('Iframe execution completed');

                        // Cleanup
                        setTimeout(() => {
                            if (iframe.parentNode) {
                                iframe.parentNode.removeChild(iframe);
                            }
                        }, 1000);
                    } catch (error) {
                        reject(error);
                    }
                };

                iframe.onerror = () => reject(new Error('Iframe creation failed'));
                document.body.appendChild(iframe);
            });
        }

        async workerExecution(scriptContent, context) {
            if (!window.Worker) {
                throw new Error('Web Workers not supported');
            }

            return new Promise((resolve, reject) => {
                const blob = new Blob([scriptContent], { type: 'application/javascript' });
                const worker = new Worker(URL.createObjectURL(blob));

                worker.onmessage = (e) => {
                    worker.terminate();
                    resolve(e.data);
                };

                worker.onerror = (error) => {
                    worker.terminate();
                    reject(error);
                };

                // Timeout for worker execution
                setTimeout(() => {
                    worker.terminate();
                    reject(new Error('Worker execution timeout'));
                }, CONFIG.fallbackTimeout);
            });
        }

        async executeWithTimeout(promise, timeout) {
            return Promise.race([
                promise,
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Execution timeout')), timeout)
                )
            ]);
        }

        async delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        recordPerformance(method, time, status) {
            if (!state.performanceMetrics.has(method)) {
                state.performanceMetrics.set(method, { times: [], successes: 0, failures: 0 });
            }

            const metrics = state.performanceMetrics.get(method);
            metrics.times.push(time);
            metrics[status === 'success' ? 'successes' : 'failures']++;

            // Keep only last 100 measurements
            if (metrics.times.length > 100) {
                metrics.times.shift();
            }
        }

        logError(errorInfo) {
            state.errorLog.push(errorInfo);

            // Keep log size manageable
            if (state.errorLog.length > CONFIG.logBufferSize) {
                state.errorLog.shift();
            }

            // Update error counts
            const category = errorInfo.category;
            state.errorCounts.set(category, (state.errorCounts.get(category) || 0) + 1);

            // Check for critical error threshold
            if (state.errorCounts.get(category) >= CONFIG.criticalErrorThreshold) {
                this.handleCriticalError(errorInfo);
            }
        }

        handleCriticalError(errorInfo) {
            state.criticalErrors.push(errorInfo);
            console.error('🚨 CRITICAL ERROR THRESHOLD REACHED:', errorInfo.category);

            // Trigger critical error recovery
            this.initiateCriticalRecovery(errorInfo);
        }

        async initiateCriticalRecovery(errorInfo) {
            console.log('🚑 CRITICAL RECOVERY: Initiating emergency procedures');

            // Reset error counts for this category to prevent spam
            state.errorCounts.set(errorInfo.category, 0);

            // Specific recovery procedures based on error category
            switch (errorInfo.category) {
                case ERROR_CATEGORIES.DEPENDENCY:
                    await this.recoverDependencies();
                    break;
                case ERROR_CATEGORIES.NETWORK:
                    await this.recoverNetworkIssues();
                    break;
                case ERROR_CATEGORIES.SECURITY:
                    await this.recoverSecurityIssues();
                    break;
                default:
                    await this.generalRecovery();
            }
        }

        async recoverDependencies() {
            console.log('🔧 RECOVERY: Attempting dependency recovery');

            // Try to reload critical dependencies (Fabric.js, jQuery, etc.)
            const dependencies = [
                { name: 'fabric', test: () => window.fabric, sources: [
                    'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js',
                    'https://unpkg.com/fabric@5.3.0/dist/fabric.min.js'
                ]},
                { name: 'jQuery', test: () => window.jQuery, sources: [
                    'https://code.jquery.com/jquery-3.6.0.min.js'
                ]}
            ];

            for (const dep of dependencies) {
                if (!dep.test()) {
                    await this.loadDependency(dep);
                }
            }
        }

        async loadDependency(dependency) {
            for (const src of dependency.sources) {
                try {
                    await this.loadScript(src);
                    if (dependency.test()) {
                        console.log(`✅ RECOVERY: ${dependency.name} restored from ${src}`);
                        return true;
                    }
                } catch (error) {
                    console.warn(`⚠️ RECOVERY: Failed to load ${dependency.name} from ${src}`);
                }
            }
            return false;
        }

        async loadScript(src) {
            return new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = src;
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            });
        }

        async recoverNetworkIssues() {
            console.log('🌐 RECOVERY: Implementing network recovery strategies');

            // Clear any cached failed requests
            if (window.optimizedAjaxManager?.cache) {
                window.optimizedAjaxManager.cache.clear();
            }

            // Reset connection state
            if ('onLine' in navigator && !navigator.onLine) {
                console.log('📡 RECOVERY: Device appears offline, waiting for connection');
                await this.waitForOnline();
            }
        }

        async waitForOnline() {
            return new Promise((resolve) => {
                if (navigator.onLine) {
                    resolve();
                    return;
                }

                const handleOnline = () => {
                    window.removeEventListener('online', handleOnline);
                    resolve();
                };

                window.addEventListener('online', handleOnline);
            });
        }

        async recoverSecurityIssues() {
            console.log('🔒 RECOVERY: Implementing security-compliant recovery');

            // Switch to more secure execution methods only
            this.executionMethods = [
                this.scriptTagInjection.bind(this), // With nonce support
                this.iframeExecution.bind(this)     // Sandboxed execution
            ];
        }

        async generalRecovery() {
            console.log('🔄 RECOVERY: Implementing general recovery procedures');

            // Clear any corrupted state
            state.activeRecoveries.clear();

            // Force garbage collection if available
            if (window.gc) {
                window.gc();
            }
        }

        async handleCompleteFailure(lastError, context) {
            console.error('💥 SCRIPT EXECUTION: Complete failure - all methods exhausted');

            const errorInfo = ErrorClassifier.classify(lastError, context);
            this.logError(errorInfo);

            // Create user-friendly fallback
            return this.createGracefulFallback(errorInfo, context);
        }

        createGracefulFallback(errorInfo, context) {
            console.log('🆘 CREATING GRACEFUL FALLBACK');

            // Return a safe, minimal functionality object
            return {
                success: false,
                error: errorInfo,
                fallback: true,
                message: this.getUserFriendlyMessage(errorInfo),
                recovery: this.getRecoveryInstructions(errorInfo),
                context: context
            };
        }

        getUserFriendlyMessage(errorInfo) {
            const messages = {
                [ERROR_CATEGORIES.NETWORK]: 'Connection issue detected. Please check your internet connection.',
                [ERROR_CATEGORIES.SECURITY]: 'Security restrictions are preventing this action. Please contact support.',
                [ERROR_CATEGORIES.BROWSER]: 'Your browser may not support this feature. Please update your browser.',
                [ERROR_CATEGORIES.DEPENDENCY]: 'A required component failed to load. Please refresh the page.',
                [ERROR_CATEGORIES.PERMISSION]: 'You may not have permission to perform this action.',
                default: 'An unexpected error occurred. Please try again.'
            };

            return messages[errorInfo.category] || messages.default;
        }

        getRecoveryInstructions(errorInfo) {
            const instructions = {
                [ERROR_CATEGORIES.NETWORK]: ['Check internet connection', 'Try again in a moment', 'Contact IT if issue persists'],
                [ERROR_CATEGORIES.SECURITY]: ['Contact system administrator', 'Check browser security settings'],
                [ERROR_CATEGORIES.BROWSER]: ['Update your browser', 'Try a different browser', 'Enable JavaScript'],
                [ERROR_CATEGORIES.DEPENDENCY]: ['Refresh the page (F5)', 'Clear browser cache', 'Check for browser extensions'],
                [ERROR_CATEGORIES.PERMISSION]: ['Log out and log back in', 'Contact administrator for permissions'],
                default: ['Refresh the page (F5)', 'Try again later', 'Contact support if issue persists']
            };

            return instructions[errorInfo.category] || instructions.default;
        }
    }

    /**
     * User Feedback and Notification System
     */
    class UserFeedbackSystem {
        static showErrorNotification(errorInfo, options = {}) {
            if (state.userNotifications.has(errorInfo.category)) {
                return; // Avoid spam
            }

            state.userNotifications.add(errorInfo.category);

            const notification = this.createNotificationElement(errorInfo, options);
            document.body.appendChild(notification);

            // Auto-remove after delay
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
                state.userNotifications.delete(errorInfo.category);
            }, options.duration || 10000);
        }

        static createNotificationElement(errorInfo, options) {
            const notification = document.createElement('div');
            notification.className = 'error-handler-notification';
            notification.innerHTML = `
                <div style="
                    position: fixed;
                    top: 20px;
                    right: 20px;
                    background: ${this.getSeverityColor(errorInfo.severity)};
                    color: white;
                    padding: 16px 20px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                    z-index: 10000;
                    max-width: 400px;
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
                    font-size: 14px;
                    line-height: 1.4;
                ">
                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                        <div style="font-size: 20px;">${this.getSeverityIcon(errorInfo.severity)}</div>
                        <div style="flex: 1;">
                            <div style="font-weight: 600; margin-bottom: 4px;">
                                ${errorInfo.category.replace(/_/g, ' ').toUpperCase()}
                            </div>
                            <div style="margin-bottom: 8px; opacity: 0.9;">
                                ${errorInfo.message || 'An error occurred'}
                            </div>
                            ${this.createRecoveryInstructions(errorInfo)}
                        </div>
                        <button onclick="this.closest('.error-handler-notification').remove()"
                                style="
                                    background: rgba(255,255,255,0.2);
                                    border: none;
                                    color: white;
                                    width: 24px;
                                    height: 24px;
                                    border-radius: 50%;
                                    cursor: pointer;
                                    display: flex;
                                    align-items: center;
                                    justify-content: center;
                                    font-size: 16px;
                                ">×</button>
                    </div>
                </div>
            `;

            return notification;
        }

        static createRecoveryInstructions(errorInfo) {
            const handler = new ScriptExecutionHandler();
            const instructions = handler.getRecoveryInstructions(errorInfo);

            return `
                <div style="margin-top: 8px; font-size: 12px; opacity: 0.8;">
                    <strong>Recovery options:</strong>
                    <ul style="margin: 4px 0 0 16px; padding: 0;">
                        ${instructions.map(instruction => `<li>${instruction}</li>`).join('')}
                    </ul>
                </div>
            `;
        }

        static getSeverityColor(severity) {
            const colors = {
                low: '#4CAF50',
                medium: '#FF9800',
                high: '#F44336',
                critical: '#9C27B0'
            };
            return colors[severity] || colors.medium;
        }

        static getSeverityIcon(severity) {
            const icons = {
                low: 'ℹ️',
                medium: '⚠️',
                high: '❌',
                critical: '🚨'
            };
            return icons[severity] || icons.medium;
        }
    }

    /**
     * Performance and Health Monitoring
     */
    class PerformanceMonitor {
        static getHealthReport() {
            const totalErrors = Array.from(state.errorCounts.values()).reduce((sum, count) => sum + count, 0);
            const criticalErrorCount = state.criticalErrors.length;

            return {
                timestamp: Date.now(),
                totalErrors,
                criticalErrorCount,
                errorsByCategory: Object.fromEntries(state.errorCounts),
                performanceMetrics: this.getPerformanceMetrics(),
                systemHealth: this.calculateHealthScore(),
                recommendations: this.getRecommendations()
            };
        }

        static getPerformanceMetrics() {
            const metrics = {};

            for (const [method, data] of state.performanceMetrics) {
                const avgTime = data.times.reduce((sum, time) => sum + time, 0) / data.times.length;
                const successRate = data.successes / (data.successes + data.failures);

                metrics[method] = {
                    averageTime: Math.round(avgTime * 100) / 100,
                    successRate: Math.round(successRate * 100) / 100,
                    totalAttempts: data.successes + data.failures
                };
            }

            return metrics;
        }

        static calculateHealthScore() {
            const totalErrors = Array.from(state.errorCounts.values()).reduce((sum, count) => sum + count, 0);
            const criticalErrors = state.criticalErrors.length;

            let score = 100;
            score -= Math.min(totalErrors * 2, 50); // Max 50 points for total errors
            score -= Math.min(criticalErrors * 10, 30); // Max 30 points for critical errors

            return Math.max(score, 0);
        }

        static getRecommendations() {
            const recommendations = [];
            const healthScore = this.calculateHealthScore();

            if (healthScore < 70) {
                recommendations.push('System health is below optimal. Consider investigating error patterns.');
            }

            if (state.criticalErrors.length > 0) {
                recommendations.push('Critical errors detected. Immediate attention required.');
            }

            if (state.errorCounts.get(ERROR_CATEGORIES.NETWORK) > 5) {
                recommendations.push('Frequent network errors. Check connectivity and server status.');
            }

            if (state.errorCounts.get(ERROR_CATEGORIES.DEPENDENCY) > 3) {
                recommendations.push('Dependency loading issues. Consider implementing better fallbacks.');
            }

            return recommendations;
        }
    }

    /**
     * Main Comprehensive Error Handler Interface
     */
    const ComprehensiveErrorHandler = {
        // Script execution with full error handling
        executeScript: async function(scriptContent, context = {}) {
            const handler = new ScriptExecutionHandler();
            return handler.executeWithFallbacks(scriptContent, context);
        },

        // AJAX request with error handling
        handleAjaxRequest: async function(options) {
            const startTime = performance.now();
            let attempt = 0;

            while (attempt < CONFIG.maxRetryAttempts) {
                try {
                    const result = await this.performAjaxRequest(options);
                    const duration = performance.now() - startTime;

                    console.log(`✅ AJAX SUCCESS: ${options.action} (${duration.toFixed(1)}ms, attempt ${attempt + 1})`);
                    return result;

                } catch (error) {
                    attempt++;
                    const errorInfo = ErrorClassifier.classify(error, { type: 'ajax', action: options.action });

                    console.warn(`⚠️ AJAX ATTEMPT ${attempt} FAILED: ${options.action}`, error.message);

                    if (attempt >= CONFIG.maxRetryAttempts || !errorInfo.recoverable) {
                        // Show user notification for final failure
                        UserFeedbackSystem.showErrorNotification(errorInfo);
                        throw error;
                    }

                    // Exponential backoff
                    const delay = Math.min(
                        CONFIG.retryDelayBase * Math.pow(2, attempt - 1),
                        CONFIG.maxRetryDelay
                    );

                    console.log(`🔄 AJAX RETRY: Waiting ${delay}ms before attempt ${attempt + 1}`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
        },

        performAjaxRequest: function(options) {
            return new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    reject(new Error('Request timeout'));
                }, options.timeout || CONFIG.timeoutThreshold);

                jQuery.ajax({
                    ...options,
                    success: (response) => {
                        clearTimeout(timeout);
                        resolve(response);
                    },
                    error: (xhr, status, error) => {
                        clearTimeout(timeout);
                        reject(new Error(`${status}: ${error}`));
                    }
                });
            });
        },

        // Global error handler
        handleGlobalError: function(error, context = {}) {
            const errorInfo = ErrorClassifier.classify(error, context);

            console.error('🚨 GLOBAL ERROR:', errorInfo);

            // Log the error
            const handler = new ScriptExecutionHandler();
            handler.logError(errorInfo);

            // Show notification for high severity errors
            if (errorInfo.severity === 'high' || errorInfo.severity === 'critical') {
                UserFeedbackSystem.showErrorNotification(errorInfo);
            }

            return errorInfo;
        },

        // Health and monitoring
        getSystemHealth: () => PerformanceMonitor.getHealthReport(),

        // Clear error state (for testing or recovery)
        clearErrorState: function() {
            state.errorCounts.clear();
            state.criticalErrors.length = 0;
            state.errorLog.length = 0;
            state.userNotifications.clear();
            console.log('🧹 ERROR STATE: Cleared all error tracking data');
        },

        // Get error statistics
        getErrorStatistics: function() {
            return {
                errorCounts: Object.fromEntries(state.errorCounts),
                criticalErrors: state.criticalErrors.length,
                recentErrors: state.errorLog.slice(-10),
                performanceMetrics: Object.fromEntries(state.performanceMetrics)
            };
        }
    };

    // Global error event listeners
    window.addEventListener('error', (event) => {
        ComprehensiveErrorHandler.handleGlobalError(event.error, {
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno
        });
    });

    window.addEventListener('unhandledrejection', (event) => {
        ComprehensiveErrorHandler.handleGlobalError(event.reason, {
            type: 'unhandled_promise_rejection'
        });
    });

    // Expose globally
    window.comprehensiveErrorHandler = ComprehensiveErrorHandler;

    // Integration with existing systems
    if (window.optimizedAjaxManager) {
        console.log('🔗 ERROR HANDLER: Integrating with existing AJAX manager');
        // Could wrap the existing AJAX manager with error handling
    }

    console.log('✅ COMPREHENSIVE ERROR HANDLER: System ready - Agent 6 deployed');

    // Initial health check
    setTimeout(() => {
        const health = PerformanceMonitor.getHealthReport();
        console.log('📊 SYSTEM HEALTH REPORT:', health);
    }, 2000);

})();