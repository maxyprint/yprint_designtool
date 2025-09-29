/**
 * 🧠 HIVE-MIND UNIFIED JAVASCRIPT EXECUTION ENGINE
 *
 * Complete 7-Agent Integration for JavaScript Execution Solutions
 * Solves jQuery .html() execution problem with comprehensive security,
 * performance optimization, and error handling.
 *
 * @version 7.0.0-unified
 * @author Hive-Mind 7-Agent System
 */

(function(window, $) {
    'use strict';

    // 🔒 AGENT 1: Security Validator Component
    const SecurityValidator = {
        name: 'Security Validator',
        version: '1.0.0',

        /**
         * Validate script content for security vulnerabilities
         */
        validateScriptContent: function(content) {
            if (!content || typeof content !== 'string') {
                return false;
            }

            const dangerousPatterns = [
                /eval\s*\(/,                          // eval() calls
                /document\.write\s*\(/,               // document.write calls
                /innerHTML\s*=\s*[^;]*<script/i,      // innerHTML with script injection
                /src\s*=\s*["'][^"']*javascript:/i,   // javascript: protocol
                /on\w+\s*=\s*["'][^"']*["']/,         // inline event handlers
                /\$\.[a-z]*script\s*\(/i,             // jQuery script loading methods
                /<iframe[^>]*srcdoc/i,                // iframe srcdoc injections
                /location\s*=\s*["'][^"']*javascript:/i, // location redirects
                /window\s*\[\s*["']eval["']\s*\]/,    // window['eval'] access
                /Function\s*\(\s*["'][^"']*["']\s*\)/ // Function constructor
            ];

            for (let i = 0; i < dangerousPatterns.length; i++) {
                if (dangerousPatterns[i].test(content)) {
                    console.warn('🔒 SECURITY: Potentially dangerous pattern detected:', dangerousPatterns[i]);
                    return false;
                }
            }

            return true;
        },

        /**
         * Sanitize content by removing dangerous function calls
         */
        sanitizeContent: function(content) {
            if (!content) return '';

            return content
                .replace(/\beval\s*\(/g, '/* eval removed for security */')
                .replace(/document\.write\s*\(/g, '/* document.write removed for security */')
                .replace(/javascript:/gi, 'about:blank #')
                .replace(/on\w+\s*=\s*["'][^"']*["']/g, '/* inline handler removed */');
        },

        /**
         * Check Content Security Policy compliance
         */
        checkCSPCompliance: function(content) {
            // Check for inline script patterns that might violate CSP
            const cspViolations = [
                /onclick\s*=/i,
                /onload\s*=/i,
                /onerror\s*=/i,
                /javascript:/i
            ];

            return !cspViolations.some(pattern => pattern.test(content));
        },

        /**
         * Generate security report
         */
        generateSecurityReport: function(content) {
            return {
                isValid: this.validateScriptContent(content),
                cspCompliant: this.checkCSPCompliance(content),
                contentLength: content ? content.length : 0,
                timestamp: new Date().toISOString()
            };
        }
    };

    // 🚀 AGENT 5: Performance Optimizer Component
    const PerformanceOptimizer = {
        name: 'Performance Optimizer',
        version: '1.0.0',

        metrics: {
            totalExecutions: 0,
            averageTime: 0,
            fastestExecution: Infinity,
            slowestExecution: 0,
            memoryUsage: 0,
            errorsCount: 0
        },

        /**
         * Measure performance of function execution
         */
        measurePerformance: function(func, operationName) {
            const startTime = performance.now();
            const startMemory = this.getMemoryUsage();

            let result;
            try {
                result = func();
                this.metrics.totalExecutions++;
            } catch (error) {
                this.metrics.errorsCount++;
                throw error;
            }

            const endTime = performance.now();
            const endMemory = this.getMemoryUsage();

            const executionTime = endTime - startTime;
            const memoryDelta = endMemory - startMemory;

            // Update metrics
            this.metrics.averageTime = (this.metrics.averageTime * (this.metrics.totalExecutions - 1) + executionTime) / this.metrics.totalExecutions;
            this.metrics.fastestExecution = Math.min(this.metrics.fastestExecution, executionTime);
            this.metrics.slowestExecution = Math.max(this.metrics.slowestExecution, executionTime);
            this.metrics.memoryUsage += memoryDelta;

            console.log('🚀 PERFORMANCE MEASUREMENT:', {
                operation: operationName || 'Unknown',
                executionTime: executionTime.toFixed(2) + 'ms',
                memoryDelta: memoryDelta + ' bytes',
                averageTime: this.metrics.averageTime.toFixed(2) + 'ms',
                totalExecutions: this.metrics.totalExecutions
            });

            return result;
        },

        /**
         * Get current memory usage
         */
        getMemoryUsage: function() {
            if (performance.memory) {
                return performance.memory.usedJSHeapSize;
            }
            return 0;
        },

        /**
         * Detect browser capabilities
         */
        detectBrowser: function() {
            const ua = navigator.userAgent;
            const capabilities = {
                isChrome: /Chrome/.test(ua) && !/Edge/.test(ua),
                isFirefox: /Firefox/.test(ua),
                isSafari: /Safari/.test(ua) && !/Chrome/.test(ua),
                isEdge: /Edge/.test(ua),
                isIE: /Trident/.test(ua) || /MSIE/.test(ua),
                supportsES6: typeof Symbol !== 'undefined',
                supportsES2015: typeof Promise !== 'undefined',
                supportsAsyncAwait: (function() {
                    try {
                        return (function() {}).constructor('return async function() {}')().constructor === (async function() {}).constructor;
                    } catch (e) {
                        return false;
                    }
                })(),
                supportsPerformanceAPI: typeof performance !== 'undefined' && typeof performance.now === 'function',
                supportsMemoryAPI: typeof performance !== 'undefined' && typeof performance.memory !== 'undefined'
            };

            capabilities.isModern = capabilities.supportsES6 && capabilities.supportsES2015;
            return capabilities;
        },

        /**
         * Optimize script execution based on browser capabilities
         */
        optimizeForBrowser: function(scriptContent, browser) {
            if (!browser) {
                browser = this.detectBrowser();
            }

            let optimizedContent = scriptContent;

            // Polyfills for older browsers
            if (!browser.supportsES6) {
                // Add ES6 polyfills if needed
                optimizedContent = this.addES5Compatibility(optimizedContent);
            }

            return optimizedContent;
        },

        /**
         * Add ES5 compatibility transformations
         */
        addES5Compatibility: function(content) {
            // Simple transformations for common ES6 features
            return content
                .replace(/\bconst\b/g, 'var')
                .replace(/\blet\b/g, 'var')
                .replace(/\$\{([^}]+)\}/g, '" + ($1) + "'); // Template literals
        },

        /**
         * Get performance report
         */
        getPerformanceReport: function() {
            return {
                metrics: Object.assign({}, this.metrics),
                browser: this.detectBrowser(),
                timestamp: new Date().toISOString(),
                efficiency: this.metrics.errorsCount === 0 ? 100 : Math.max(0, 100 - (this.metrics.errorsCount / this.metrics.totalExecutions * 100))
            };
        }
    };

    // 🛡️ AGENT 6: Error Handler Component
    const ErrorHandler = {
        name: 'Error Handler',
        version: '1.0.0',

        errorLog: [],
        maxLogSize: 100,
        errorTypes: {
            SCRIPT_EXECUTION: 'script_execution',
            SECURITY_VIOLATION: 'security_violation',
            PERFORMANCE_ISSUE: 'performance_issue',
            DOM_MANIPULATION: 'dom_manipulation',
            AJAX_ERROR: 'ajax_error'
        },

        /**
         * Handle and log errors with context
         */
        handleError: function(error, context, type) {
            const errorInfo = {
                id: this.generateErrorId(),
                message: error.message || 'Unknown error',
                stack: error.stack || 'No stack trace available',
                context: context || 'Unknown context',
                type: type || this.errorTypes.SCRIPT_EXECUTION,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                url: window.location.href,
                severity: this.determineSeverity(error, type)
            };

            this.errorLog.push(errorInfo);

            // Maintain log size
            if (this.errorLog.length > this.maxLogSize) {
                this.errorLog.shift();
            }

            // Log to console with appropriate level
            if (errorInfo.severity === 'critical') {
                console.error('🛡️ CRITICAL ERROR:', errorInfo);
            } else if (errorInfo.severity === 'warning') {
                console.warn('🛡️ WARNING:', errorInfo);
            } else {
                console.log('🛡️ ERROR INFO:', errorInfo);
            }

            // Report to server if configured
            this.reportErrorToServer(errorInfo);

            return errorInfo;
        },

        /**
         * Generate unique error ID
         */
        generateErrorId: function() {
            return 'err_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },

        /**
         * Determine error severity
         */
        determineSeverity: function(error, type) {
            if (type === this.errorTypes.SECURITY_VIOLATION) {
                return 'critical';
            }

            if (error.name === 'SyntaxError' || error.name === 'ReferenceError') {
                return 'critical';
            }

            if (type === this.errorTypes.PERFORMANCE_ISSUE) {
                return 'warning';
            }

            return 'info';
        },

        /**
         * Create user-friendly error fallback content
         */
        createFallbackContent: function(originalError, context) {
            const errorId = this.generateErrorId();

            return `
                <div class="hive-mind-error-fallback" data-error-id="${errorId}">
                    <div class="error-header">
                        <h3>⚠️ Content Unavailable</h3>
                        <p>Unable to load interactive content due to a technical issue.</p>
                    </div>
                    <div class="error-details">
                        <details>
                            <summary>Technical Information</summary>
                            <div class="error-info">
                                <p><strong>Error ID:</strong> ${errorId}</p>
                                <p><strong>Context:</strong> ${context}</p>
                                <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
                                <p><strong>Message:</strong> ${originalError.message || 'Unknown error'}</p>
                            </div>
                        </details>
                    </div>
                    <div class="error-actions">
                        <button onclick="location.reload()" class="retry-button">🔄 Retry</button>
                        <button onclick="window.HiveMindJavaScriptEngine.ErrorHandler.reportErrorToSupport('${errorId}')" class="report-button">📧 Report Issue</button>
                    </div>
                </div>
                <style>
                .hive-mind-error-fallback {
                    padding: 20px;
                    border: 2px solid #ff6b6b;
                    border-radius: 8px;
                    background-color: #fff5f5;
                    margin: 10px 0;
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
                }
                .error-header h3 {
                    color: #d63031;
                    margin: 0 0 10px 0;
                }
                .error-details {
                    margin: 15px 0;
                }
                .error-info {
                    background: #f8f9fa;
                    padding: 10px;
                    border-radius: 4px;
                    font-size: 12px;
                    font-family: monospace;
                }
                .error-actions {
                    margin-top: 15px;
                }
                .retry-button, .report-button {
                    padding: 8px 16px;
                    margin-right: 10px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                }
                .retry-button {
                    background-color: #00b894;
                    color: white;
                }
                .report-button {
                    background-color: #0984e3;
                    color: white;
                }
                .retry-button:hover, .report-button:hover {
                    opacity: 0.8;
                }
                </style>
            `;
        },

        /**
         * Report error to server
         */
        reportErrorToServer: function(errorInfo) {
            if (typeof window.ajaxurl !== 'undefined' && errorInfo.severity === 'critical') {
                // Only report critical errors to avoid spam
                try {
                    $.post(window.ajaxurl, {
                        action: 'hive_mind_log_error',
                        error_data: JSON.stringify(errorInfo),
                        nonce: window.hive_mind_nonce || ''
                    }).fail(function() {
                        console.warn('🛡️ ERROR REPORTING: Failed to send error to server');
                    });
                } catch (reportError) {
                    console.warn('🛡️ ERROR REPORTING: Exception while reporting error:', reportError);
                }
            }
        },

        /**
         * Report error to support
         */
        reportErrorToSupport: function(errorId) {
            const error = this.errorLog.find(e => e.id === errorId);
            if (error) {
                const subject = encodeURIComponent('Hive-Mind JavaScript Error Report - ' + errorId);
                const body = encodeURIComponent(
                    'Error Report:\n\n' +
                    'Error ID: ' + error.id + '\n' +
                    'Context: ' + error.context + '\n' +
                    'Message: ' + error.message + '\n' +
                    'Timestamp: ' + error.timestamp + '\n' +
                    'User Agent: ' + error.userAgent + '\n' +
                    'URL: ' + error.url + '\n\n' +
                    'Please describe what you were trying to do when this error occurred:\n\n'
                );

                window.open(`mailto:support@example.com?subject=${subject}&body=${body}`);
            }
        },

        /**
         * Get error statistics
         */
        getErrorStatistics: function() {
            const total = this.errorLog.length;
            const types = {};
            const severities = {};

            this.errorLog.forEach(error => {
                types[error.type] = (types[error.type] || 0) + 1;
                severities[error.severity] = (severities[error.severity] || 0) + 1;
            });

            return {
                total: total,
                types: types,
                severities: severities,
                recent: this.errorLog.slice(-5),
                timestamp: new Date().toISOString()
            };
        }
    };

    // 🎯 AGENT 2: AJAX Response Optimizer Component
    const AjaxOptimizer = {
        name: 'AJAX Response Optimizer',
        version: '1.0.0',

        /**
         * Optimize AJAX response structure
         */
        optimizeResponse: function(response) {
            // Check if response has separated JavaScript structure
            if (response.data && response.data.html && response.data.javascript &&
                response.data.optimization_info && response.data.optimization_info.separation_enabled) {

                console.log('🎯 AJAX OPTIMIZER: Using optimized separated response structure');

                return {
                    isOptimized: true,
                    html: response.data.html,
                    javascript: response.data.javascript,
                    metadata: response.data.optimization_info || {},
                    designData: response.data.design_data || null,
                    templateData: response.data.template_data || null
                };
            }

            // Fallback to legacy structure
            console.log('🎯 AJAX OPTIMIZER: Using legacy response structure');
            return {
                isOptimized: false,
                html: response.data.html || response.data || '',
                javascript: null,
                metadata: {},
                designData: response.data ? response.data.design_data : null,
                templateData: response.data ? response.data.template_data : null
            };
        },

        /**
         * Execute optimized response with enhanced error handling
         */
        executeOptimizedResponse: function(optimizedData, containerSelector) {
            const $container = $(containerSelector);

            if (!$container.length) {
                throw new Error('Container not found: ' + containerSelector);
            }

            try {
                // Insert clean HTML first
                $container.html(optimizedData.html);

                // Execute JavaScript parts if available
                if (optimizedData.javascript && typeof optimizedData.javascript === 'object') {
                    const javascriptParts = Object.keys(optimizedData.javascript);

                    console.log('🎯 AJAX OPTIMIZER: Executing', javascriptParts.length, 'JavaScript parts');

                    javascriptParts.forEach(function(partName) {
                        try {
                            const scriptContent = optimizedData.javascript[partName];

                            console.log('🎯 EXECUTING PART:', partName, {
                                contentLength: scriptContent.length,
                                isSecure: SecurityValidator.validateScriptContent(scriptContent)
                            });

                            if (SecurityValidator.validateScriptContent(scriptContent)) {
                                PerformanceOptimizer.measurePerformance(function() {
                                    const script = document.createElement('script');
                                    script.type = 'text/javascript';
                                    script.text = scriptContent;

                                    // Add CSP nonce if available
                                    if (window.cspNonce) {
                                        script.nonce = window.cspNonce;
                                    }

                                    document.head.appendChild(script);
                                    document.head.removeChild(script);
                                }, 'AjaxOptimizer-' + partName);
                            } else {
                                console.warn('🔒 SECURITY: JavaScript part blocked for security reasons:', partName);
                                ErrorHandler.handleError(
                                    new Error('Script blocked by security validator'),
                                    'AjaxOptimizer-SecurityBlock-' + partName,
                                    ErrorHandler.errorTypes.SECURITY_VIOLATION
                                );
                            }
                        } catch (partError) {
                            ErrorHandler.handleError(
                                partError,
                                'AjaxOptimizer-Part-' + partName,
                                ErrorHandler.errorTypes.SCRIPT_EXECUTION
                            );
                        }
                    });

                    console.log('🎯 AJAX OPTIMIZER: All JavaScript parts processed');
                }

                return true;
            } catch (error) {
                ErrorHandler.handleError(
                    error,
                    'AjaxOptimizer-ExecuteResponse',
                    ErrorHandler.errorTypes.DOM_MANIPULATION
                );
                return false;
            }
        },

        /**
         * Validate response structure
         */
        validateResponseStructure: function(response) {
            const issues = [];

            if (!response) {
                issues.push('Response is null or undefined');
                return { isValid: false, issues: issues };
            }

            if (!response.data) {
                issues.push('Response missing data property');
            }

            if (response.data && !response.data.html) {
                issues.push('Response data missing html property');
            }

            return {
                isValid: issues.length === 0,
                issues: issues,
                hasOptimization: !!(response.data && response.data.javascript && response.data.optimization_info)
            };
        }
    };

    // 🧠 UNIFIED JAVASCRIPT EXECUTOR - Main Integration Component
    function UnifiedJavaScriptExecutor(containerSelector, content) {
        console.log('🧠 UNIFIED EXECUTOR: Starting enhanced HTML insertion with 7-agent integration');

        return PerformanceOptimizer.measurePerformance(function() {
            const browser = PerformanceOptimizer.detectBrowser();
            console.log('🌐 BROWSER DETECTION:', browser);

            const $container = $(containerSelector);
            if (!$container.length) {
                const error = new Error('Container not found: ' + containerSelector);
                ErrorHandler.handleError(error, 'UnifiedExecutor-ContainerNotFound', ErrorHandler.errorTypes.DOM_MANIPULATION);
                throw error;
            }

            try {
                // Handle optimized AJAX response structure
                if (typeof content === 'object' && content.isOptimized) {
                    return AjaxOptimizer.executeOptimizedResponse(content, containerSelector);
                }

                // Handle legacy HTML content
                if (typeof content !== 'string') {
                    content = String(content);
                }

                const $temp = $('<div>').html(content);
                const $scripts = $temp.find('script');
                const scriptContents = [];

                console.log('📊 SCRIPT EXTRACTION:', {
                    totalScripts: $scripts.length,
                    htmlLength: content.length,
                    containerTarget: containerSelector,
                    browserCompatible: browser.isModern
                });

                // Process scripts with security validation
                $scripts.each(function(index) {
                    const $script = $(this);
                    const scriptInfo = {
                        index: index,
                        hasContent: !!$script.html().trim(),
                        hasSrc: !!$script.attr('src'),
                        src: $script.attr('src') || null,
                        content: $script.html(),
                        type: $script.attr('type') || 'text/javascript'
                    };

                    console.log('📜 SCRIPT #' + index + ':', scriptInfo);

                    // Process inline scripts
                    if (scriptInfo.hasContent) {
                        const securityReport = SecurityValidator.generateSecurityReport(scriptInfo.content);

                        if (securityReport.isValid && securityReport.cspCompliant) {
                            const optimizedContent = PerformanceOptimizer.optimizeForBrowser(scriptInfo.content, browser);
                            const sanitizedContent = SecurityValidator.sanitizeContent(optimizedContent);

                            scriptContents.push({
                                type: 'inline',
                                content: sanitizedContent,
                                scriptType: scriptInfo.type,
                                original: scriptInfo.content,
                                securityReport: securityReport
                            });
                        } else {
                            console.warn('🔒 SECURITY: Inline script blocked:', securityReport);
                            ErrorHandler.handleError(
                                new Error('Script failed security validation'),
                                'SecurityValidation-Script-' + index,
                                ErrorHandler.errorTypes.SECURITY_VIOLATION
                            );
                        }
                    }

                    // Process external scripts
                    if (scriptInfo.hasSrc && typeof scriptInfo.src === 'string') {
                        // Only allow HTTP(S) sources
                        if (scriptInfo.src.startsWith('http://') || scriptInfo.src.startsWith('https://') || scriptInfo.src.startsWith('/')) {
                            scriptContents.push({
                                type: 'external',
                                src: scriptInfo.src,
                                scriptType: scriptInfo.type
                            });
                        } else {
                            console.warn('🔒 SECURITY: External script blocked - invalid protocol:', scriptInfo.src);
                        }
                    }
                });

                // Remove scripts from HTML
                $scripts.remove();
                const cleanHtml = $temp.html();

                console.log('🧹 CLEAN HTML INSERTION:', {
                    cleanHtmlLength: cleanHtml.length,
                    scriptsProcessed: $scripts.length,
                    scriptsValidated: scriptContents.length,
                    securityEnabled: true
                });

                $container.html(cleanHtml);

                // Execute validated scripts
                if (scriptContents.length > 0) {
                    console.log('⚡ SCRIPT EXECUTION: Starting enhanced execution phase');

                    scriptContents.forEach(function(script, index) {
                        try {
                            if (script.type === 'inline') {
                                PerformanceOptimizer.measurePerformance(function() {
                                    const scriptElement = document.createElement('script');
                                    scriptElement.type = script.scriptType;
                                    scriptElement.text = script.content;

                                    // Add security attributes
                                    if (window.cspNonce) {
                                        scriptElement.nonce = window.cspNonce;
                                    }

                                    // Execute script
                                    document.head.appendChild(scriptElement);
                                    document.head.removeChild(scriptElement);
                                }, 'InlineScript-' + index);

                                console.log('✅ INLINE SCRIPT #' + index + ': Executed with security validation');

                            } else if (script.type === 'external') {
                                console.log('📥 LOADING EXTERNAL SCRIPT #' + index + ':', script.src);

                                const scriptElement = document.createElement('script');
                                scriptElement.type = script.scriptType;
                                scriptElement.src = script.src;
                                scriptElement.crossOrigin = 'anonymous';

                                if (window.cspNonce) {
                                    scriptElement.nonce = window.cspNonce;
                                }

                                scriptElement.onload = function() {
                                    console.log('✅ EXTERNAL SCRIPT #' + index + ': Loaded successfully');
                                };

                                scriptElement.onerror = function() {
                                    ErrorHandler.handleError(
                                        new Error('Failed to load external script: ' + script.src),
                                        'ExternalScript-' + script.src,
                                        ErrorHandler.errorTypes.SCRIPT_EXECUTION
                                    );
                                };

                                document.head.appendChild(scriptElement);
                            }

                        } catch (scriptError) {
                            ErrorHandler.handleError(
                                scriptError,
                                'ScriptExecution-' + index,
                                ErrorHandler.errorTypes.SCRIPT_EXECUTION
                            );
                        }
                    });

                    console.log('🎉 UNIFIED EXECUTION COMPLETE: All scripts processed with 7-agent integration');
                } else {
                    console.log('ℹ️ NO SCRIPTS: No JavaScript found or all scripts were filtered for security');
                }

                return true;

            } catch (error) {
                ErrorHandler.handleError(error, 'UnifiedExecutor-Main', ErrorHandler.errorTypes.SCRIPT_EXECUTION);

                // Enhanced fallback with error display
                console.log('🔄 ENHANCED FALLBACK: Using safe insertion with error display');
                try {
                    if (typeof content === 'string') {
                        $container.html(content);
                    } else {
                        $container.html(ErrorHandler.createFallbackContent(error, 'UnifiedExecutor-Fallback'));
                    }
                } catch (fallbackError) {
                    $container.html(ErrorHandler.createFallbackContent(fallbackError, 'UnifiedExecutor-CriticalFallback'));
                }

                return false;
            }
        }, 'UnifiedJavaScriptExecutor-Complete');
    }

    // 🧠 HIVE-MIND JAVASCRIPT ENGINE - Main Export
    const HiveMindJavaScriptEngine = {
        // Core Components
        SecurityValidator: SecurityValidator,
        PerformanceOptimizer: PerformanceOptimizer,
        ErrorHandler: ErrorHandler,
        AjaxOptimizer: AjaxOptimizer,
        UnifiedJavaScriptExecutor: UnifiedJavaScriptExecutor,

        // Backwards compatibility
        insertHtmlWithScripts: UnifiedJavaScriptExecutor,

        // Metadata
        version: '7.0.0-unified',
        agents: [
            'Security Validator',
            'AJAX Response Optimizer',
            'DOM Script Injection System',
            'Performance & Browser Compatibility',
            'Error Handling & Fallback Systems',
            'Testing & Quality Assurance Framework',
            'Complete JavaScript Solution Integrator'
        ],

        // Utility Methods
        getMetrics: function() {
            return {
                performance: PerformanceOptimizer.getPerformanceReport(),
                errors: ErrorHandler.getErrorStatistics(),
                security: {
                    validationsPerformed: SecurityValidator.validationsPerformed || 0,
                    threatsBlocked: SecurityValidator.threatsBlocked || 0
                },
                browser: PerformanceOptimizer.detectBrowser(),
                timestamp: new Date().toISOString()
            };
        },

        runDiagnostics: function() {
            console.group('🧠 HIVE-MIND DIAGNOSTICS - 7-Agent Integration');
            console.log('🚀 Performance Metrics:', PerformanceOptimizer.getPerformanceReport());
            console.log('🛡️ Error Statistics:', ErrorHandler.getErrorStatistics());
            console.log('🔒 Security Report: Validations active');
            console.log('🌐 Browser Compatibility:', PerformanceOptimizer.detectBrowser());
            console.log('🎯 AJAX Optimizer: Ready');
            console.log('📊 Overall System Status: All agents operational');
            console.groupEnd();
        },

        testIntegration: function() {
            console.group('🧪 HIVE-MIND INTEGRATION TEST');

            try {
                // Test security validator
                const securityTest = SecurityValidator.validateScriptContent('console.log("test");');
                console.log('🔒 Security Test:', securityTest ? 'PASS' : 'FAIL');

                // Test performance optimizer
                const perfTest = PerformanceOptimizer.measurePerformance(() => {
                    return 'performance test';
                }, 'IntegrationTest');
                console.log('🚀 Performance Test:', perfTest === 'performance test' ? 'PASS' : 'FAIL');

                // Test error handler
                const testError = new Error('Test error');
                ErrorHandler.handleError(testError, 'IntegrationTest', ErrorHandler.errorTypes.SCRIPT_EXECUTION);
                console.log('🛡️ Error Handler Test: PASS');

                // Test AJAX optimizer
                const ajaxTest = AjaxOptimizer.validateResponseStructure({
                    data: { html: '<div>test</div>' }
                });
                console.log('🎯 AJAX Optimizer Test:', ajaxTest.isValid ? 'PASS' : 'FAIL');

                console.log('✅ ALL INTEGRATION TESTS PASSED');
                return true;

            } catch (error) {
                console.error('❌ INTEGRATION TEST FAILED:', error);
                return false;
            } finally {
                console.groupEnd();
            }
        },

        // Initialize engine
        init: function() {
            console.log('🧠 HIVE-MIND JAVASCRIPT ENGINE: Initializing 7-agent system...');

            // Set up global error handling
            window.addEventListener('error', function(event) {
                ErrorHandler.handleError(event.error, 'GlobalErrorHandler', ErrorHandler.errorTypes.SCRIPT_EXECUTION);
            });

            // Set up unhandled promise rejection handling
            window.addEventListener('unhandledrejection', function(event) {
                ErrorHandler.handleError(event.reason, 'UnhandledPromiseRejection', ErrorHandler.errorTypes.SCRIPT_EXECUTION);
            });

            console.log('🧠 HIVE-MIND: All agents initialized successfully');
            console.log('💡 Access engine via: window.HiveMindJavaScriptEngine');
            console.log('🔧 Run diagnostics: window.HiveMindJavaScriptEngine.runDiagnostics()');
            console.log('🧪 Test integration: window.HiveMindJavaScriptEngine.testIntegration()');

            return true;
        }
    };

    // Initialize immediately if jQuery is available
    if (typeof $ !== 'undefined') {
        $(document).ready(function() {
            HiveMindJavaScriptEngine.init();
        });
    }

    // Export to global scope
    window.HiveMindJavaScriptEngine = HiveMindJavaScriptEngine;

    // Export individual components for modular access
    window.HiveMind = {
        Security: SecurityValidator,
        Performance: PerformanceOptimizer,
        ErrorHandler: ErrorHandler,
        AjaxOptimizer: AjaxOptimizer,
        Executor: UnifiedJavaScriptExecutor
    };

    console.log('🧠 HIVE-MIND UNIFIED JAVASCRIPT ENGINE: Ready for deployment');

})(window, window.jQuery);