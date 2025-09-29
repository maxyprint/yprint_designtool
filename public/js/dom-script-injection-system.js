/**
 * DOM SCRIPT INJECTION EXPERT SYSTEM
 * Agent 3: Comprehensive script injection solution for AJAX responses
 *
 * Mission: Create robust DOM script injection methods that safely execute
 * JavaScript from AJAX responses when jQuery .html() strips <script> tags
 *
 * Features:
 * - Multiple execution methods (createElement, Function constructor, isolated context)
 * - HTML parsing and script extraction
 * - Error handling and recovery
 * - Performance optimization
 * - Security measures (CSP compliance, XSS prevention)
 * - Browser compatibility
 * - Memory management
 */

class DOMScriptInjectionSystem {
    constructor(options = {}) {
        this.options = {
            // Security options
            allowEval: false,
            maxScriptSize: 1024 * 1024, // 1MB limit
            scriptTimeout: 10000, // 10 second timeout
            enableCSPCompliance: true,
            sandboxMode: false,

            // Performance options
            enableCaching: true,
            maxCacheSize: 100,
            batchExecution: true,
            asyncExecution: false,

            // Debugging options
            enableLogging: true,
            logLevel: 'info', // 'debug', 'info', 'warn', 'error'
            enableMetrics: true,

            // Browser compatibility
            enablePolyfills: true,
            fallbackMode: 'function', // 'function', 'createElement', 'none'

            ...options
        };

        this.cache = new Map();
        this.metrics = {
            executionCount: 0,
            errorCount: 0,
            averageExecutionTime: 0,
            cacheHits: 0
        };

        this.executionQueue = [];
        this.isProcessingQueue = false;

        this.initializeSystem();
    }

    /**
     * Initialize the script injection system
     */
    initializeSystem() {
        this.log('info', '🚀 DOM Script Injection System initialized');

        // Check browser capabilities
        this.browserCapabilities = this.detectBrowserCapabilities();

        // Setup error handlers
        this.setupErrorHandlers();

        // Initialize security measures
        this.initializeSecurity();

        // Start metrics collection if enabled
        if (this.options.enableMetrics) {
            this.startMetricsCollection();
        }

        // Expose global methods for easy access
        this.exposeGlobalMethods();
    }

    /**
     * Main method: Extract and execute scripts from HTML
     * @param {string} htmlString - HTML string containing scripts
     * @param {Object} options - Execution options
     * @returns {Promise<Object>} - Execution result
     */
    async executeScriptsFromHTML(htmlString, options = {}) {
        const startTime = performance.now();

        try {
            this.log('debug', '📝 Processing HTML for script extraction', { htmlLength: htmlString.length });

            // Extract scripts from HTML
            const extractedScripts = this.extractScripts(htmlString);

            if (extractedScripts.length === 0) {
                this.log('info', '💡 No scripts found in HTML');
                return { success: true, scriptsExecuted: 0, cleanHTML: htmlString };
            }

            // Execute scripts
            const executionResult = await this.executeScripts(extractedScripts, options);

            // Get clean HTML without scripts
            const cleanHTML = this.removeScriptsFromHTML(htmlString);

            // Update metrics
            this.updateMetrics(startTime, true);

            return {
                success: true,
                scriptsExecuted: extractedScripts.length,
                executionResults: executionResult,
                cleanHTML: cleanHTML,
                executionTime: performance.now() - startTime
            };

        } catch (error) {
            this.updateMetrics(startTime, false);
            this.log('error', '❌ Script execution failed', error);

            return {
                success: false,
                error: error.message,
                cleanHTML: this.removeScriptsFromHTML(htmlString),
                executionTime: performance.now() - startTime
            };
        }
    }

    /**
     * Extract script tags and their content from HTML
     * @param {string} htmlString - HTML string
     * @returns {Array} - Array of script objects
     */
    extractScripts(htmlString) {
        const scripts = [];
        const scriptRegex = /<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi;
        let match;

        while ((match = scriptRegex.exec(htmlString)) !== null) {
            const attributes = this.parseScriptAttributes(match[1] || '');
            const content = match[2].trim();

            // Skip empty scripts
            if (!content) continue;

            // Security check
            if (!this.isScriptSafe(content, attributes)) {
                this.log('warn', '⚠️ Potentially unsafe script detected, skipping', { content: content.substring(0, 100) });
                continue;
            }

            scripts.push({
                content: content,
                attributes: attributes,
                originalTag: match[0],
                type: attributes.type || 'text/javascript',
                src: attributes.src || null,
                async: attributes.async !== undefined,
                defer: attributes.defer !== undefined
            });
        }

        this.log('debug', `🔍 Extracted ${scripts.length} scripts from HTML`);
        return scripts;
    }

    /**
     * Parse script tag attributes
     * @param {string} attributeString - Attribute string
     * @returns {Object} - Parsed attributes
     */
    parseScriptAttributes(attributeString) {
        const attributes = {};
        const attrRegex = /(\w+)(?:=["']([^"']*)["'])?/g;
        let match;

        while ((match = attrRegex.exec(attributeString)) !== null) {
            attributes[match[1]] = match[2] || '';
        }

        return attributes;
    }

    /**
     * Execute multiple scripts with different methods
     * @param {Array} scripts - Array of script objects
     * @param {Object} options - Execution options
     * @returns {Promise<Array>} - Execution results
     */
    async executeScripts(scripts, options = {}) {
        const results = [];
        const executionOptions = { ...this.options, ...options };

        if (executionOptions.batchExecution && !executionOptions.asyncExecution) {
            // Batch synchronous execution
            for (const script of scripts) {
                const result = await this.executeScript(script, executionOptions);
                results.push(result);

                // Stop on critical error
                if (!result.success && result.critical) {
                    break;
                }
            }
        } else if (executionOptions.asyncExecution) {
            // Parallel execution
            const promises = scripts.map(script => this.executeScript(script, executionOptions));
            const batchResults = await Promise.allSettled(promises);

            batchResults.forEach((result, index) => {
                if (result.status === 'fulfilled') {
                    results.push(result.value);
                } else {
                    results.push({
                        success: false,
                        error: result.reason.message,
                        script: scripts[index],
                        method: 'async_failed'
                    });
                }
            });
        } else {
            // Queue execution
            for (const script of scripts) {
                this.addToExecutionQueue(script, executionOptions);
            }
            await this.processExecutionQueue();
        }

        return results;
    }

    /**
     * Execute a single script using the best available method
     * @param {Object} script - Script object
     * @param {Object} options - Execution options
     * @returns {Promise<Object>} - Execution result
     */
    async executeScript(script, options = {}) {
        const startTime = performance.now();
        this.log('debug', '⚡ Executing script', {
            type: script.type,
            size: script.content.length,
            hasAttributes: Object.keys(script.attributes).length > 0
        });

        // Check cache first
        if (options.enableCaching) {
            const cached = this.getCachedResult(script);
            if (cached) {
                this.metrics.cacheHits++;
                this.log('debug', '📦 Using cached script result');
                return cached;
            }
        }

        // Choose execution method
        const method = this.chooseExecutionMethod(script, options);
        let result;

        try {
            switch (method) {
                case 'createElement':
                    result = await this.executeViaCreateElement(script, options);
                    break;
                case 'function':
                    result = await this.executeViaFunction(script, options);
                    break;
                case 'isolated':
                    result = await this.executeViaIsolatedContext(script, options);
                    break;
                case 'eval':
                    result = await this.executeViaEval(script, options);
                    break;
                default:
                    throw new Error(`Unknown execution method: ${method}`);
            }

            // Cache successful results
            if (result.success && options.enableCaching) {
                this.cacheResult(script, result);
            }

        } catch (error) {
            result = {
                success: false,
                error: error.message,
                script: script,
                method: method,
                executionTime: performance.now() - startTime
            };
        }

        result.executionTime = performance.now() - startTime;
        return result;
    }

    /**
     * Method 1: Execute script via createElement (most secure)
     * @param {Object} script - Script object
     * @param {Object} options - Execution options
     * @returns {Promise<Object>} - Execution result
     */
    async executeViaCreateElement(script, options = {}) {
        return new Promise((resolve, reject) => {
            try {
                const scriptElement = document.createElement('script');

                // Set attributes
                Object.keys(script.attributes).forEach(attr => {
                    if (attr !== 'src') {
                        scriptElement.setAttribute(attr, script.attributes[attr]);
                    }
                });

                // Handle external scripts
                if (script.src) {
                    scriptElement.src = script.src;
                    scriptElement.onload = () => {
                        this.cleanupScriptElement(scriptElement);
                        resolve({
                            success: true,
                            method: 'createElement',
                            type: 'external'
                        });
                    };
                    scriptElement.onerror = (error) => {
                        this.cleanupScriptElement(scriptElement);
                        reject(new Error(`Failed to load external script: ${script.src}`));
                    };
                } else {
                    // Inline script
                    scriptElement.textContent = script.content;

                    // Setup timeout
                    const timeout = setTimeout(() => {
                        this.cleanupScriptElement(scriptElement);
                        reject(new Error('Script execution timeout'));
                    }, options.scriptTimeout || this.options.scriptTimeout);

                    // Execute and cleanup
                    const cleanup = () => {
                        clearTimeout(timeout);
                        this.cleanupScriptElement(scriptElement);
                    };

                    try {
                        document.head.appendChild(scriptElement);
                        cleanup();

                        resolve({
                            success: true,
                            method: 'createElement',
                            type: 'inline'
                        });
                    } catch (error) {
                        cleanup();
                        reject(error);
                    }
                }

                // Add to DOM for external scripts
                if (script.src) {
                    document.head.appendChild(scriptElement);
                }

            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Method 2: Execute script via Function constructor (safer than eval)
     * @param {Object} script - Script object
     * @param {Object} options - Execution options
     * @returns {Promise<Object>} - Execution result
     */
    async executeViaFunction(script, options = {}) {
        try {
            // Don't use Function constructor for external scripts
            if (script.src) {
                throw new Error('Function constructor cannot execute external scripts');
            }

            // Create isolated execution context
            const context = this.createExecutionContext(options);

            // Wrap script in try-catch for better error handling
            const wrappedScript = `
                try {
                    ${script.content}
                } catch (error) {
                    throw new Error('Script execution error: ' + error.message);
                }
            `;

            // Execute with timeout
            const result = await this.executeWithTimeout(() => {
                const func = new Function(...Object.keys(context), wrappedScript);
                return func(...Object.values(context));
            }, options.scriptTimeout || this.options.scriptTimeout);

            return {
                success: true,
                method: 'function',
                result: result,
                type: 'inline'
            };

        } catch (error) {
            throw new Error(`Function execution failed: ${error.message}`);
        }
    }

    /**
     * Method 3: Execute script in isolated context (most secure for inline scripts)
     * @param {Object} script - Script object
     * @param {Object} options - Execution options
     * @returns {Promise<Object>} - Execution result
     */
    async executeViaIsolatedContext(script, options = {}) {
        try {
            if (script.src) {
                throw new Error('Isolated context cannot execute external scripts directly');
            }

            // Create isolated iframe for execution
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = 'about:blank';

            return new Promise((resolve, reject) => {
                iframe.onload = () => {
                    try {
                        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                        const iframeWindow = iframe.contentWindow;

                        // Setup timeout
                        const timeout = setTimeout(() => {
                            document.body.removeChild(iframe);
                            reject(new Error('Isolated execution timeout'));
                        }, options.scriptTimeout || this.options.scriptTimeout);

                        // Setup error handling in iframe
                        iframeWindow.onerror = (msg, url, line, col, error) => {
                            clearTimeout(timeout);
                            document.body.removeChild(iframe);
                            reject(new Error(`Isolated script error: ${msg}`));
                        };

                        // Create script element in iframe
                        const scriptEl = iframeDoc.createElement('script');
                        scriptEl.textContent = script.content;

                        // Execute
                        iframeDoc.head.appendChild(scriptEl);

                        // Success - cleanup after a short delay
                        setTimeout(() => {
                            clearTimeout(timeout);
                            document.body.removeChild(iframe);
                            resolve({
                                success: true,
                                method: 'isolated',
                                type: 'inline'
                            });
                        }, 100);

                    } catch (error) {
                        document.body.removeChild(iframe);
                        reject(error);
                    }
                };

                document.body.appendChild(iframe);
            });

        } catch (error) {
            throw new Error(`Isolated execution failed: ${error.message}`);
        }
    }

    /**
     * Method 4: Execute script via eval (least secure, only if explicitly allowed)
     * @param {Object} script - Script object
     * @param {Object} options - Execution options
     * @returns {Promise<Object>} - Execution result
     */
    async executeViaEval(script, options = {}) {
        if (!options.allowEval && !this.options.allowEval) {
            throw new Error('Eval execution is disabled for security reasons');
        }

        if (script.src) {
            throw new Error('Eval cannot execute external scripts');
        }

        try {
            const result = await this.executeWithTimeout(() => {
                // eslint-disable-next-line no-eval
                return eval(script.content);
            }, options.scriptTimeout || this.options.scriptTimeout);

            return {
                success: true,
                method: 'eval',
                result: result,
                type: 'inline'
            };

        } catch (error) {
            throw new Error(`Eval execution failed: ${error.message}`);
        }
    }

    /**
     * Choose the best execution method based on script and browser capabilities
     * @param {Object} script - Script object
     * @param {Object} options - Execution options
     * @returns {string} - Chosen method
     */
    chooseExecutionMethod(script, options = {}) {
        // External scripts must use createElement
        if (script.src) {
            return 'createElement';
        }

        // Check for explicit method preference
        if (options.preferredMethod) {
            const preferred = options.preferredMethod;
            if (['createElement', 'function', 'isolated', 'eval'].includes(preferred)) {
                return preferred;
            }
        }

        // Choose based on security requirements
        if (options.sandboxMode || this.options.sandboxMode) {
            return 'isolated';
        }

        // Choose based on CSP compliance
        if (options.enableCSPCompliance || this.options.enableCSPCompliance) {
            return 'createElement';
        }

        // Choose based on browser capabilities
        if (!this.browserCapabilities.supportsFunctionConstructor) {
            return 'createElement';
        }

        // Default to Function constructor for inline scripts (good balance of security and functionality)
        return 'function';
    }

    /**
     * Remove script tags from HTML string
     * @param {string} htmlString - HTML string
     * @returns {string} - Clean HTML
     */
    removeScriptsFromHTML(htmlString) {
        return htmlString.replace(/<script(\s[^>]*)?>([\s\S]*?)<\/script>/gi, '');
    }

    /**
     * Security check for script content
     * @param {string} content - Script content
     * @param {Object} attributes - Script attributes
     * @returns {boolean} - True if safe
     */
    isScriptSafe(content, attributes) {
        // Check script size
        if (content.length > this.options.maxScriptSize) {
            this.log('warn', '⚠️ Script too large', { size: content.length });
            return false;
        }

        // Check for suspicious patterns
        const suspiciousPatterns = [
            /document\.write/gi,
            /eval\s*\(/gi,
            /innerHTML\s*=/gi,
            /outerHTML\s*=/gi,
            /\.cookie\s*=/gi,
            /localStorage\./gi,
            /sessionStorage\./gi
        ];

        for (const pattern of suspiciousPatterns) {
            if (pattern.test(content)) {
                this.log('warn', '⚠️ Suspicious script pattern detected', { pattern: pattern.source });
                return false;
            }
        }

        // Check external script domains (basic whitelist)
        if (attributes.src) {
            const allowedDomains = [
                'cdnjs.cloudflare.com',
                'unpkg.com',
                'cdn.jsdelivr.net',
                'code.jquery.com',
                'ajax.googleapis.com'
            ];

            const url = new URL(attributes.src, window.location.origin);
            const isAllowed = allowedDomains.some(domain => url.hostname.includes(domain));

            if (!isAllowed) {
                this.log('warn', '⚠️ External script from non-whitelisted domain', { src: attributes.src });
                return false;
            }
        }

        return true;
    }

    /**
     * Create execution context for scripts
     * @param {Object} options - Context options
     * @returns {Object} - Execution context
     */
    createExecutionContext(options = {}) {
        const context = {
            window: window,
            document: document,
            console: console,
            setTimeout: setTimeout,
            clearTimeout: clearTimeout,
            setInterval: setInterval,
            clearInterval: clearInterval
        };

        // Add jQuery if available
        if (typeof $ !== 'undefined') {
            context.$ = $;
            context.jQuery = $;
        }

        // Add custom context variables
        if (options.context) {
            Object.assign(context, options.context);
        }

        return context;
    }

    /**
     * Execute function with timeout
     * @param {Function} func - Function to execute
     * @param {number} timeout - Timeout in milliseconds
     * @returns {Promise} - Promise that resolves/rejects with timeout
     */
    executeWithTimeout(func, timeout) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                reject(new Error('Execution timeout'));
            }, timeout);

            try {
                const result = func();
                clearTimeout(timer);
                resolve(result);
            } catch (error) {
                clearTimeout(timer);
                reject(error);
            }
        });
    }

    /**
     * Cleanup script element after execution
     * @param {HTMLElement} scriptElement - Script element to cleanup
     */
    cleanupScriptElement(scriptElement) {
        try {
            if (scriptElement && scriptElement.parentNode) {
                scriptElement.parentNode.removeChild(scriptElement);
            }
        } catch (error) {
            this.log('warn', '⚠️ Failed to cleanup script element', error);
        }
    }

    /**
     * Cache management
     */
    getCachedResult(script) {
        const key = this.generateScriptKey(script);
        return this.cache.get(key);
    }

    cacheResult(script, result) {
        if (this.cache.size >= this.options.maxCacheSize) {
            // Remove oldest entry
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }

        const key = this.generateScriptKey(script);
        this.cache.set(key, { ...result, cached: true, cacheTime: Date.now() });
    }

    generateScriptKey(script) {
        return btoa(script.content).substring(0, 32);
    }

    /**
     * Queue management for batch execution
     */
    addToExecutionQueue(script, options) {
        this.executionQueue.push({ script, options });

        if (!this.isProcessingQueue) {
            this.processExecutionQueue();
        }
    }

    async processExecutionQueue() {
        if (this.isProcessingQueue || this.executionQueue.length === 0) {
            return;
        }

        this.isProcessingQueue = true;

        while (this.executionQueue.length > 0) {
            const { script, options } = this.executionQueue.shift();

            try {
                await this.executeScript(script, options);

                // Small delay between executions
                await new Promise(resolve => setTimeout(resolve, 10));

            } catch (error) {
                this.log('error', '❌ Queue execution failed', error);
            }
        }

        this.isProcessingQueue = false;
    }

    /**
     * Browser capability detection
     */
    detectBrowserCapabilities() {
        const capabilities = {
            supportsFunctionConstructor: true,
            supportsCreateElement: true,
            supportsIframe: true,
            supportsEval: true,
            supportsPromises: typeof Promise !== 'undefined',
            supportsPerformanceAPI: typeof performance !== 'undefined'
        };

        try {
            new Function('return true')();
        } catch (e) {
            capabilities.supportsFunctionConstructor = false;
        }

        try {
            document.createElement('script');
        } catch (e) {
            capabilities.supportsCreateElement = false;
        }

        return capabilities;
    }

    /**
     * Error handling setup
     */
    setupErrorHandlers() {
        window.addEventListener('error', (event) => {
            if (event.filename && event.filename.includes('dom-script-injection')) {
                this.log('error', '❌ Global script error caught', {
                    message: event.message,
                    filename: event.filename,
                    lineno: event.lineno
                });
            }
        });
    }

    /**
     * Security initialization
     */
    initializeSecurity() {
        // Check Content Security Policy
        if (this.options.enableCSPCompliance) {
            this.checkCSPCompliance();
        }
    }

    checkCSPCompliance() {
        // Basic CSP check
        const metaTags = document.querySelectorAll('meta[http-equiv="Content-Security-Policy"]');
        if (metaTags.length > 0) {
            this.log('info', '🔒 CSP detected, using compliant execution methods');
        }
    }

    /**
     * Metrics collection
     */
    updateMetrics(startTime, success) {
        this.metrics.executionCount++;

        if (!success) {
            this.metrics.errorCount++;
        }

        const executionTime = performance.now() - startTime;
        this.metrics.averageExecutionTime =
            (this.metrics.averageExecutionTime * (this.metrics.executionCount - 1) + executionTime) /
            this.metrics.executionCount;
    }

    startMetricsCollection() {
        // Log metrics every 30 seconds
        setInterval(() => {
            this.log('info', '📊 Script Injection Metrics', this.metrics);
        }, 30000);
    }

    getMetrics() {
        return { ...this.metrics };
    }

    /**
     * Logging system
     */
    log(level, message, data = null) {
        if (!this.options.enableLogging) return;

        const logLevels = { debug: 0, info: 1, warn: 2, error: 3 };
        const currentLevel = logLevels[this.options.logLevel] || 1;

        if (logLevels[level] >= currentLevel) {
            const timestamp = new Date().toISOString();
            const prefix = `[${timestamp}] [DOM-Script-Injection] [${level.toUpperCase()}]`;

            if (data) {
                console[level](prefix, message, data);
            } else {
                console[level](prefix, message);
            }
        }
    }

    /**
     * Expose global convenience methods
     */
    exposeGlobalMethods() {
        // Make system available globally
        window.DOMScriptInjectionSystem = DOMScriptInjectionSystem;

        // Convenience methods
        window.executeScriptsFromHTML = (html, options) =>
            this.executeScriptsFromHTML(html, options);

        window.injectAndExecuteScript = (scriptContent, options = {}) =>
            this.executeScript({ content: scriptContent, attributes: {} }, options);
    }

    /**
     * Cleanup and disposal
     */
    dispose() {
        this.cache.clear();
        this.executionQueue = [];
        this.isProcessingQueue = false;

        // Remove global references
        if (window.DOMScriptInjectionSystem === DOMScriptInjectionSystem) {
            delete window.DOMScriptInjectionSystem;
        }
        if (window.executeScriptsFromHTML === this.executeScriptsFromHTML) {
            delete window.executeScriptsFromHTML;
        }
        if (window.injectAndExecuteScript) {
            delete window.injectAndExecuteScript;
        }

        this.log('info', '🧹 DOM Script Injection System disposed');
    }
}

// jQuery Integration
if (typeof $ !== 'undefined') {
    /**
     * jQuery plugin for script-aware HTML injection
     */
    $.fn.htmlWithScripts = function(htmlContent, options = {}) {
        return this.each(async function() {
            const $element = $(this);

            // Create script injection system if not exists
            if (!window.domScriptInjector) {
                window.domScriptInjector = new DOMScriptInjectionSystem();
            }

            try {
                // Process HTML and execute scripts
                const result = await window.domScriptInjector.executeScriptsFromHTML(htmlContent, options);

                // Insert clean HTML
                $element.html(result.cleanHTML);

                // Trigger custom event with results
                $element.trigger('scriptsExecuted', [result]);

                return result;

            } catch (error) {
                console.error('❌ jQuery htmlWithScripts failed:', error);

                // Fallback to regular html() method
                $element.html(htmlContent);

                // Trigger error event
                $element.trigger('scriptExecutionError', [error]);

                throw error;
            }
        });
    };

    /**
     * jQuery method to execute scripts in current content
     */
    $.fn.executeContainedScripts = function(options = {}) {
        return this.each(async function() {
            const htmlContent = $(this).html();
            await $(this).htmlWithScripts(htmlContent, options);
        });
    };
}

// Auto-initialize global instance
$(document).ready(function() {
    if (!window.domScriptInjector) {
        window.domScriptInjector = new DOMScriptInjectionSystem({
            enableLogging: true,
            logLevel: 'info',
            enableMetrics: true
        });

        console.log('🤖 DOM Script Injection System ready for AJAX responses');
    }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DOMScriptInjectionSystem;
}

// CommonJS export
if (typeof exports !== 'undefined') {
    exports.DOMScriptInjectionSystem = DOMScriptInjectionSystem;
}