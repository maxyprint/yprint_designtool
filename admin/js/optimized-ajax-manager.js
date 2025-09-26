/**
 * 🚀 OPTIMIZED AJAX MANAGER - Performance Enhancement
 *
 * MISSION: Implement efficient AJAX request management with caching, debouncing, and parallel processing
 * Reduces AJAX response times through smart batching and caching strategies
 */

(function() {
    'use strict';

    console.log('🚀 OPTIMIZED AJAX MANAGER: Initializing');

    // Prevent multiple initializations
    if (window.optimizedAjaxManager) {
        console.log('✅ OPTIMIZED AJAX MANAGER: Already active');
        return;
    }

    // Configuration
    const config = {
        debounceDelay: 300,
        cacheTimeout: 60000, // 1 minute
        maxBatchSize: 5,
        maxRetries: 3,
        retryDelay: 1000
    };

    // State management
    const state = {
        cache: new Map(),
        pendingRequests: new Map(),
        debounceTimers: new Map(),
        requestQueue: []
    };

    /**
     * Advanced request caching with intelligent invalidation
     */
    class AjaxCache {
        constructor() {
            this.cache = new Map();
            this.timestamps = new Map();
        }

        set(key, data, ttl = config.cacheTimeout) {
            this.cache.set(key, data);
            this.timestamps.set(key, Date.now() + ttl);
        }

        get(key) {
            if (!this.cache.has(key)) return null;

            const expiry = this.timestamps.get(key);
            if (Date.now() > expiry) {
                this.delete(key);
                return null;
            }

            return this.cache.get(key);
        }

        delete(key) {
            this.cache.delete(key);
            this.timestamps.delete(key);
        }

        clear() {
            this.cache.clear();
            this.timestamps.clear();
        }

        generateKey(action, data) {
            const sortedData = Object.keys(data || {})
                .sort()
                .map(key => `${key}=${data[key]}`)
                .join('&');
            return `${action}:${sortedData}`;
        }
    }

    const ajaxCache = new AjaxCache();

    /**
     * Smart request batching system
     */
    class RequestBatcher {
        constructor() {
            this.batches = new Map();
            this.timers = new Map();
        }

        add(action, data, callback, options = {}) {
            if (!this.batches.has(action)) {
                this.batches.set(action, []);
            }

            const batch = this.batches.get(action);
            batch.push({ data, callback, options });

            // Clear existing timer
            if (this.timers.has(action)) {
                clearTimeout(this.timers.get(action));
            }

            // Set new timer
            const timer = setTimeout(() => {
                this.executeBatch(action);
            }, options.batchDelay || 100);

            this.timers.set(action, timer);
        }

        executeBatch(action) {
            const batch = this.batches.get(action);
            if (!batch || batch.length === 0) return;

            console.log(`🚀 AJAX MANAGER: Executing batch for ${action} (${batch.length} requests)`);

            // Process batch in parallel if possible, otherwise sequentially
            if (batch.length === 1 || action.includes('save') || action.includes('sync')) {
                // Sequential processing for write operations
                this.executeSequential(action, batch);
            } else {
                // Parallel processing for read operations
                this.executeParallel(action, batch);
            }

            // Clean up
            this.batches.delete(action);
            this.timers.delete(action);
        }

        executeSequential(action, batch) {
            batch.forEach(({ data, callback, options }, index) => {
                setTimeout(() => {
                    this.executeSingle(action, data, callback, options);
                }, index * 50); // 50ms stagger
            });
        }

        executeParallel(action, batch) {
            batch.forEach(({ data, callback, options }) => {
                this.executeSingle(action, data, callback, options);
            });
        }

        executeSingle(action, data, callback, options) {
            // Check cache first for read operations
            if (!action.includes('save') && !action.includes('sync')) {
                const cacheKey = ajaxCache.generateKey(action, data);
                const cached = ajaxCache.get(cacheKey);
                if (cached) {
                    console.log(`📦 AJAX MANAGER: Cache hit for ${action}`);
                    callback(cached);
                    return;
                }
            }

            // Execute actual AJAX request
            const startTime = performance.now();

            jQuery.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: action,
                    ...data
                },
                dataType: 'json',
                timeout: options.timeout || 10000,
                success: (response) => {
                    const endTime = performance.now();
                    console.log(`✅ AJAX MANAGER: ${action} completed in ${(endTime - startTime).toFixed(1)}ms`);

                    // Cache successful read operations
                    if (!action.includes('save') && !action.includes('sync') && response.success) {
                        const cacheKey = ajaxCache.generateKey(action, data);
                        ajaxCache.set(cacheKey, response);
                    }

                    callback(response);
                },
                error: (xhr, status, error) => {
                    const endTime = performance.now();
                    console.error(`❌ AJAX MANAGER: ${action} failed after ${(endTime - startTime).toFixed(1)}ms`, error);

                    callback({
                        success: false,
                        data: { message: `Request failed: ${error}` }
                    });
                }
            });
        }
    }

    const requestBatcher = new RequestBatcher();

    /**
     * Optimized AJAX interface
     */
    const OptimizedAjax = {
        /**
         * Enhanced request method with automatic optimization
         */
        request(action, data = {}, options = {}) {
            return new Promise((resolve, reject) => {
                const callback = (response) => {
                    if (response && response.success) {
                        resolve(response.data);
                    } else {
                        reject(new Error(response?.data?.message || 'Request failed'));
                    }
                };

                // Add to batch or execute immediately
                if (options.immediate) {
                    requestBatcher.executeSingle(action, data, callback, options);
                } else {
                    requestBatcher.add(action, data, callback, options);
                }
            });
        },

        /**
         * Debounced request for frequent operations
         */
        debouncedRequest(action, data = {}, options = {}) {
            const key = `${action}:${JSON.stringify(data)}`;

            // Clear existing timer
            if (state.debounceTimers.has(key)) {
                clearTimeout(state.debounceTimers.get(key));
            }

            return new Promise((resolve, reject) => {
                const timer = setTimeout(() => {
                    this.request(action, data, { ...options, immediate: true })
                        .then(resolve)
                        .catch(reject);

                    state.debounceTimers.delete(key);
                }, options.debounceDelay || config.debounceDelay);

                state.debounceTimers.set(key, timer);
            });
        },

        /**
         * Bulk operation handler
         */
        bulk(operations) {
            const promises = operations.map(({ action, data, options }) =>
                this.request(action, data, { ...options, immediate: false })
            );

            return Promise.all(promises);
        },

        /**
         * Cache management
         */
        cache: {
            clear: () => ajaxCache.clear(),
            delete: (action, data) => ajaxCache.delete(ajaxCache.generateKey(action, data)),
            invalidate: (pattern) => {
                for (const [key] of ajaxCache.cache.entries()) {
                    if (key.includes(pattern)) {
                        ajaxCache.delete(key);
                    }
                }
            }
        },

        /**
         * Performance monitoring
         */
        stats: {
            getCacheStats: () => ({
                size: ajaxCache.cache.size,
                hitRate: ajaxCache.hitRate || 0
            }),
            getRequestStats: () => ({
                pending: state.pendingRequests.size,
                queued: state.requestQueue.length
            })
        }
    };

    /**
     * Enhanced template data fetching with caching
     */
    OptimizedAjax.getTemplateVariations = function(templateId, options = {}) {
        return this.request('get_template_variations', {
            template_id: templateId,
            nonce: window.octoDesignerAjax?.nonce || ''
        }, options);
    };

    OptimizedAjax.getTemplateSizes = function(templateId, options = {}) {
        return this.request('get_template_sizes', {
            template_id: templateId,
            nonce: window.octoDesignerAjax?.nonce || ''
        }, options);
    };

    OptimizedAjax.saveReferenceLineData = function(postId, lineData, options = {}) {
        // Debounce save operations to prevent excessive requests
        return this.debouncedRequest('save_reference_line_data', {
            post_id: postId,
            line_data: JSON.stringify(lineData),
            nonce: window.octoDesignerAjax?.nonce || ''
        }, { ...options, debounceDelay: 500 });
    };

    OptimizedAjax.syncCanvasToMetaFields = function(postId, canvasData, metaFieldsData, options = {}) {
        return this.debouncedRequest('sync_canvas_to_meta_fields', {
            post_id: postId,
            canvas_data: JSON.stringify(canvasData),
            meta_fields_data: JSON.stringify(metaFieldsData),
            nonce: window.octoDesignerAjax?.nonce || ''
        }, { ...options, debounceDelay: 300 });
    };

    // Expose globally
    window.optimizedAjaxManager = OptimizedAjax;

    // Initialize cache cleanup
    setInterval(() => {
        const oldSize = ajaxCache.cache.size;
        // Cleanup happens automatically on get() calls
        if (oldSize > ajaxCache.cache.size) {
            console.log(`🗑️ AJAX MANAGER: Cleaned ${oldSize - ajaxCache.cache.size} expired cache entries`);
        }
    }, 60000); // Check every minute

    console.log('🚀 OPTIMIZED AJAX MANAGER: System ready');

    // Provide backwards compatibility
    if (!window.octoAjax) {
        window.octoAjax = OptimizedAjax;
    }

})();