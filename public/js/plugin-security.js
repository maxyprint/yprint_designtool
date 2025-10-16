/**
 * 🔒 PLUGIN SECURITY MODULE v1.0
 * Defense-in-depth security for YPrint Plugin Framework
 *
 * PURPOSE: Sandboxing, validation, and security boundaries
 * ARCHITECTURE: Multi-layered security with plugin isolation
 */

(function() {
    'use strict';

    console.log('🔒 PLUGIN SECURITY: Loading security module...');

    /**
     * Plugin Security Manager
     * Provides sandboxing and security validation for plugins
     */
    window.YPrintPluginSecurity = {
        version: '1.0.0',

        // Security configuration
        config: {
            maxPlugins: 10,
            maxEventListeners: 50,
            maxExecutionTime: 5000,
            allowedDomains: ['localhost', '127.0.0.1'],
            blockedMethods: [
                'eval', 'Function', 'setTimeout', 'setInterval',
                'XMLHttpRequest', 'fetch', 'importScripts'
            ]
        },

        // Plugin execution tracking
        executionStats: new Map(),
        activeTimers: new Map(),

        /**
         * Create secure sandbox for plugin
         */
        createPluginSandbox(plugin, pluginName) {
            console.log(`🔒 SECURITY: Creating sandbox for '${pluginName}'`);

            const startTime = Date.now();

            // Create execution context with limited access
            const sandbox = {
                // Safe globals
                console: this.createSafeConsole(pluginName),
                Date: Date,
                Math: Math,
                JSON: JSON,

                // Restricted access warnings
                eval: () => { throw new Error('eval() is not allowed in plugin sandbox'); },
                Function: () => { throw new Error('Function constructor not allowed in plugin sandbox'); },
                setTimeout: () => { throw new Error('setTimeout not allowed - use plugin event system'); },
                setInterval: () => { throw new Error('setInterval not allowed - use plugin event system'); },

                // Plugin API (will be injected)
                designerAPI: null
            };

            // Create proxy to intercept dangerous operations
            const securePlugin = new Proxy(plugin, {
                get: (target, prop) => {
                    // Track property access
                    this.logAccess(pluginName, prop);

                    // Block dangerous properties
                    if (this.config.blockedMethods.includes(prop)) {
                        throw new Error(`Security violation: ${prop} access denied for plugin ${pluginName}`);
                    }

                    // Block access to prototype pollution
                    if (prop === '__proto__' || prop === 'constructor' || prop === 'prototype') {
                        throw new Error(`Security violation: Prototype access denied for plugin ${pluginName}`);
                    }

                    return target[prop];
                },

                set: (target, prop, value) => {
                    // Prevent modification of critical properties
                    if (prop === 'name' || prop === 'version') {
                        throw new Error(`Security violation: Cannot modify ${prop} after registration`);
                    }

                    // Log modifications
                    this.logModification(pluginName, prop, value);

                    target[prop] = value;
                    return true;
                },

                has: (target, prop) => {
                    // Hide internal properties
                    if (prop.startsWith('_')) {
                        return false;
                    }
                    return prop in target;
                },

                deleteProperty: (target, prop) => {
                    throw new Error(`Security violation: Property deletion not allowed in plugin ${pluginName}`);
                }
            });

            // Track execution time
            this.executionStats.set(pluginName, {
                startTime,
                accessLog: [],
                modificationLog: [],
                violations: []
            });

            console.log(`✅ SECURITY: Sandbox created for '${pluginName}'`);
            return securePlugin;
        },

        /**
         * Create safe console for plugin
         */
        createSafeConsole(pluginName) {
            const prefix = `🔌 [${pluginName}]`;

            return {
                log: (...args) => console.log(prefix, ...args),
                info: (...args) => console.info(prefix, ...args),
                warn: (...args) => console.warn(prefix, ...args),
                error: (...args) => console.error(prefix, ...args),

                // Block dangerous console methods
                clear: () => { throw new Error('console.clear() not allowed in plugin sandbox'); },
                trace: () => { throw new Error('console.trace() not allowed in plugin sandbox'); }
            };
        },

        /**
         * Create secure Designer API
         */
        createSecureDesignerAPI(originalAPI, pluginName) {
            console.log(`🔒 SECURITY: Creating secure API for '${pluginName}'`);

            // Create read-only canvas proxy
            const secureCanvas = this.createCanvasProxy(originalAPI.getCanvas(), pluginName);

            // Create limited event bus
            const secureEventBus = this.createEventBusProxy(originalAPI.getEventBus(), pluginName);

            const secureAPI = {
                /**
                 * Get canvas with read-only access
                 */
                getCanvas: () => {
                    this.validatePluginAccess(pluginName, 'canvas');
                    return secureCanvas;
                },

                /**
                 * Get event bus with limited access
                 */
                getEventBus: () => {
                    this.validatePluginAccess(pluginName, 'eventBus');
                    return secureEventBus;
                },

                /**
                 * Add menu item with validation
                 */
                addMenuItem: (label, callback) => {
                    this.validateMenuItemRequest(pluginName, label, callback);
                    return originalAPI.addMenuItem(label, this.wrapCallback(callback, pluginName));
                },

                /**
                 * Fire events with validation
                 */
                fireEvent: (type, detail) => {
                    this.validateEventRequest(pluginName, type, detail);
                    return originalAPI.fireEvent(`plugin:${pluginName}:${type}`, detail);
                },

                /**
                 * Get safe designer info
                 */
                getDesignerInfo: () => {
                    // Return only safe, non-sensitive information
                    return {
                        hasCanvas: !!originalAPI.getCanvas(),
                        timestamp: Date.now(),
                        pluginAPIVersion: '1.0.0'
                        // NO sensitive data like internal methods, credentials, etc.
                    };
                }
            };

            // Freeze API to prevent modification
            return Object.freeze(secureAPI);
        },

        /**
         * Create read-only canvas proxy
         */
        createCanvasProxy(canvas, pluginName) {
            if (!canvas) return null;

            const allowedMethods = [
                'toDataURL', 'getObjects', 'getWidth', 'getHeight',
                'getZoom', 'getViewportTransform'
            ];

            return new Proxy(canvas, {
                get: (target, prop) => {
                    // Only allow safe, read-only methods
                    if (allowedMethods.includes(prop)) {
                        return target[prop];
                    }

                    // Block dangerous canvas methods
                    if (typeof target[prop] === 'function') {
                        throw new Error(`Security violation: Canvas method '${prop}' not allowed for plugin ${pluginName}`);
                    }

                    // Allow safe properties
                    return target[prop];
                },

                set: () => {
                    throw new Error(`Security violation: Canvas modification not allowed for plugin ${pluginName}`);
                },

                deleteProperty: () => {
                    throw new Error(`Security violation: Canvas property deletion not allowed for plugin ${pluginName}`);
                }
            });
        },

        /**
         * Create limited event bus proxy
         */
        createEventBusProxy(eventBus, pluginName) {
            if (!eventBus) return null;

            let listenerCount = 0;

            return new Proxy(eventBus, {
                get: (target, prop) => {
                    if (prop === 'addEventListener') {
                        return (type, listener, options) => {
                            // Limit number of listeners per plugin
                            if (listenerCount >= this.config.maxEventListeners) {
                                throw new Error(`Security violation: Too many event listeners for plugin ${pluginName}`);
                            }

                            // Prefix event types to prevent conflicts
                            const prefixedType = `plugin:${pluginName}:${type}`;
                            listenerCount++;

                            return target.addEventListener(prefixedType, listener, options);
                        };
                    }

                    if (prop === 'removeEventListener') {
                        return (type, listener, options) => {
                            const prefixedType = `plugin:${pluginName}:${type}`;
                            listenerCount = Math.max(0, listenerCount - 1);
                            return target.removeEventListener(prefixedType, listener, options);
                        };
                    }

                    // Block dangerous methods
                    if (prop === 'dispatchEvent') {
                        throw new Error(`Security violation: Direct event dispatch not allowed for plugin ${pluginName}`);
                    }

                    return target[prop];
                }
            });
        },

        /**
         * Validate plugin access requests
         */
        validatePluginAccess(pluginName, resource) {
            const stats = this.executionStats.get(pluginName);
            if (!stats) {
                throw new Error(`Unknown plugin attempting access: ${pluginName}`);
            }

            // Check execution time
            const executionTime = Date.now() - stats.startTime;
            if (executionTime > this.config.maxExecutionTime) {
                throw new Error(`Plugin ${pluginName} exceeded maximum execution time`);
            }

            console.log(`🔒 SECURITY: Plugin '${pluginName}' accessing ${resource}`);
        },

        /**
         * Validate menu item requests
         */
        validateMenuItemRequest(pluginName, label, callback) {
            if (!label || typeof label !== 'string') {
                throw new Error(`Invalid menu item label for plugin ${pluginName}`);
            }

            if (typeof callback !== 'function') {
                throw new Error(`Invalid menu item callback for plugin ${pluginName}`);
            }

            if (label.length > 50) {
                throw new Error(`Menu item label too long for plugin ${pluginName}`);
            }
        },

        /**
         * Validate event requests
         */
        validateEventRequest(pluginName, type, detail) {
            if (!type || typeof type !== 'string') {
                throw new Error(`Invalid event type for plugin ${pluginName}`);
            }

            // Prevent system event conflicts
            if (type.startsWith('framework:') || type.startsWith('system:')) {
                throw new Error(`Security violation: System event type not allowed for plugin ${pluginName}`);
            }
        },

        /**
         * Wrap callback with security monitoring
         */
        wrapCallback(callback, pluginName) {
            return (...args) => {
                const startTime = Date.now();
                try {
                    const result = callback.apply(null, args);
                    const executionTime = Date.now() - startTime;

                    if (executionTime > 1000) {
                        console.warn(`⚠️ SECURITY: Plugin '${pluginName}' callback took ${executionTime}ms`);
                    }

                    return result;
                } catch (error) {
                    console.error(`❌ SECURITY: Plugin '${pluginName}' callback error:`, error);
                    throw error;
                }
            };
        },

        /**
         * Log property access
         */
        logAccess(pluginName, property) {
            const stats = this.executionStats.get(pluginName);
            if (stats) {
                stats.accessLog.push({
                    property,
                    timestamp: Date.now()
                });
            }
        },

        /**
         * Log property modifications
         */
        logModification(pluginName, property, value) {
            const stats = this.executionStats.get(pluginName);
            if (stats) {
                stats.modificationLog.push({
                    property,
                    value: typeof value,
                    timestamp: Date.now()
                });
            }
        },

        /**
         * Get security stats for plugin
         */
        getPluginSecurityStats(pluginName) {
            return this.executionStats.get(pluginName) || null;
        },

        /**
         * Emergency security shutdown
         */
        emergencyShutdown(reason = 'Security violation detected') {
            console.error(`🚨 EMERGENCY SHUTDOWN: ${reason}`);

            // Clear all plugin timers
            this.activeTimers.forEach((timer, pluginName) => {
                clearTimeout(timer);
                console.log(`⚠️ SECURITY: Cleared timer for plugin '${pluginName}'`);
            });

            // Clear execution stats
            this.executionStats.clear();

            // Fire emergency event
            if (window.YPrintPlugins && window.YPrintPlugins.eventBus) {
                window.YPrintPlugins.eventBus.dispatchEvent(new CustomEvent('security:emergency-shutdown', {
                    detail: { reason, timestamp: Date.now() }
                }));
            }
        }
    };

    console.log('✅ PLUGIN SECURITY: Security module loaded successfully');

})();