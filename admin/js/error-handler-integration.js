/**
 * 🔗 ERROR HANDLER INTEGRATION - Enhanced System Integration
 *
 * Integrates the comprehensive error handler with existing systems
 * Provides seamless fallback and recovery mechanisms
 */

(function() {
    'use strict';

    console.log('🔗 ERROR HANDLER INTEGRATION: Initializing system integration');

    // Wait for comprehensive error handler to be available
    if (!window.comprehensiveErrorHandler) {
        console.log('⏳ ERROR HANDLER INTEGRATION: Waiting for comprehensive error handler...');

        const waitForHandler = setInterval(() => {
            if (window.comprehensiveErrorHandler) {
                clearInterval(waitForHandler);
                initializeIntegration();
            }
        }, 100);

        setTimeout(() => {
            clearInterval(waitForHandler);
            console.error('❌ ERROR HANDLER INTEGRATION: Timeout waiting for comprehensive error handler');
        }, 10000);
        return;
    }

    initializeIntegration();

    function initializeIntegration() {
        console.log('🚀 ERROR HANDLER INTEGRATION: Starting system integration');

        // Integration with AJAX Manager
        integrateWithAjaxManager();

        // Integration with Fabric.js loading
        integrateWithFabricLoading();

        // Integration with Canvas operations
        integrateWithCanvasOperations();

        // Integration with Design System
        integrateWithDesignSystem();

        // Create enhanced wrapper functions
        createEnhancedWrappers();

        console.log('✅ ERROR HANDLER INTEGRATION: All integrations complete');
    }

    /**
     * Enhanced AJAX Manager Integration
     */
    function integrateWithAjaxManager() {
        console.log('🔄 INTEGRATION: Enhancing AJAX manager with error handling');

        if (window.optimizedAjaxManager) {
            const originalRequest = window.optimizedAjaxManager.request;

            window.optimizedAjaxManager.request = async function(action, data = {}, options = {}) {
                try {
                    return await window.comprehensiveErrorHandler.handleAjaxRequest({
                        url: window.ajaxurl || '/wp-admin/admin-ajax.php',
                        type: 'POST',
                        data: { action, ...data },
                        dataType: 'json',
                        timeout: options.timeout || 10000,
                        action: action // For error tracking
                    });
                } catch (error) {
                    // Fallback to original method if available
                    if (originalRequest && options.fallbackToOriginal !== false) {
                        console.log('🔄 AJAX INTEGRATION: Falling back to original request method');
                        try {
                            return await originalRequest.call(this, action, data, options);
                        } catch (fallbackError) {
                            console.error('❌ AJAX INTEGRATION: Both enhanced and original methods failed');
                            throw fallbackError;
                        }
                    }
                    throw error;
                }
            };

            console.log('✅ INTEGRATION: AJAX manager enhanced with error handling');
        }
    }

    /**
     * Fabric.js Loading Integration
     */
    function integrateWithFabricLoading() {
        console.log('🎨 INTEGRATION: Enhancing Fabric.js loading with error handling');

        // Enhanced Fabric loading with comprehensive error handling
        window.enhancedFabricLoader = {
            async loadFabric(options = {}) {
                const scriptContent = `
                    // Enhanced Fabric.js loading with error handling
                    if (typeof window.fabric === 'undefined') {
                        console.log('🔄 ENHANCED FABRIC LOADER: Loading Fabric.js...');

                        const sources = [
                            'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js',
                            'https://unpkg.com/fabric@5.3.0/dist/fabric.min.js',
                            'https://cdn.jsdelivr.net/npm/fabric@5.3.0/dist/fabric.min.js'
                        ];

                        for (const src of sources) {
                            try {
                                await new Promise((resolve, reject) => {
                                    const script = document.createElement('script');
                                    script.src = src;
                                    script.onload = resolve;
                                    script.onerror = reject;
                                    document.head.appendChild(script);
                                });

                                if (window.fabric) {
                                    console.log('✅ ENHANCED FABRIC LOADER: Fabric.js loaded from', src);
                                    break;
                                }
                            } catch (error) {
                                console.warn('⚠️ ENHANCED FABRIC LOADER: Failed to load from', src);
                            }
                        }

                        if (!window.fabric) {
                            throw new Error('Failed to load Fabric.js from all sources');
                        }
                    }

                    return window.fabric;
                `;

                try {
                    return await window.comprehensiveErrorHandler.executeScript(scriptContent, {
                        operation: 'fabric_loading',
                        dependency: 'fabric',
                        ...options
                    });
                } catch (error) {
                    console.error('❌ ENHANCED FABRIC LOADER: Failed to load Fabric.js', error);

                    // Create minimal fallback
                    return this.createFabricFallback();
                }
            },

            createFabricFallback() {
                console.log('🆘 ENHANCED FABRIC LOADER: Creating fallback Fabric.js implementation');

                if (!window.fabric) {
                    window.fabric = {
                        Canvas: class {
                            constructor(element) {
                                this.element = element;
                                this.objects = [];
                                console.log('📦 FALLBACK: Minimal Fabric Canvas created');
                            }
                            add(obj) { this.objects.push(obj); }
                            remove(obj) {
                                const index = this.objects.indexOf(obj);
                                if (index > -1) this.objects.splice(index, 1);
                            }
                            getObjects() { return this.objects; }
                            renderAll() { console.log('🎨 FALLBACK: Canvas render (no-op)'); }
                            dispose() { this.objects = []; }
                            toJSON() { return { objects: this.objects }; }
                            loadFromJSON(json, callback) {
                                this.objects = json.objects || [];
                                if (callback) callback();
                            }
                        },
                        Image: class {
                            constructor(element, options = {}) {
                                this.src = element.src || element;
                                Object.assign(this, options);
                            }
                            static fromURL(url, callback, options) {
                                const img = new this(url, options);
                                if (callback) setTimeout(() => callback(img), 0);
                                return img;
                            }
                        },
                        IText: class {
                            constructor(text, options = {}) {
                                this.text = text;
                                Object.assign(this, { fontSize: 16, fill: '#000', ...options });
                            }
                        },
                        version: '5.3.0-enhanced-fallback'
                    };
                }

                return window.fabric;
            }
        };

        console.log('✅ INTEGRATION: Enhanced Fabric.js loader created');
    }

    /**
     * Canvas Operations Integration
     */
    function integrateWithCanvasOperations() {
        console.log('🖼️ INTEGRATION: Enhancing Canvas operations with error handling');

        window.enhancedCanvasManager = {
            async initializeCanvas(canvasId, options = {}) {
                const scriptContent = `
                    console.log('🎨 ENHANCED CANVAS: Initializing canvas ${canvasId}');

                    // Ensure Fabric.js is loaded
                    if (!window.fabric) {
                        await window.enhancedFabricLoader.loadFabric();
                    }

                    const canvasElement = document.getElementById('${canvasId}');
                    if (!canvasElement) {
                        throw new Error('Canvas element not found: ${canvasId}');
                    }

                    // Clean up existing fabric instance
                    if (canvasElement.__fabric) {
                        console.log('🧹 ENHANCED CANVAS: Disposing existing fabric instance');
                        canvasElement.__fabric.dispose();
                        canvasElement.__fabric = null;
                    }

                    // Initialize new fabric canvas
                    const canvas = new window.fabric.Canvas(canvasElement, ${JSON.stringify(options)});

                    console.log('✅ ENHANCED CANVAS: Canvas initialized successfully');
                    return canvas;
                `;

                try {
                    return await window.comprehensiveErrorHandler.executeScript(scriptContent, {
                        operation: 'canvas_initialization',
                        canvasId: canvasId,
                        dependency: 'fabric'
                    });
                } catch (error) {
                    console.error('❌ ENHANCED CANVAS: Failed to initialize canvas', canvasId, error);
                    return this.createCanvasFallback(canvasId);
                }
            },

            createCanvasFallback(canvasId) {
                console.log('🆘 ENHANCED CANVAS: Creating fallback canvas for', canvasId);

                const canvasElement = document.getElementById(canvasId);
                if (!canvasElement) {
                    console.error('❌ ENHANCED CANVAS: Canvas element not found for fallback');
                    return null;
                }

                // Create a basic canvas wrapper
                return {
                    element: canvasElement,
                    objects: [],
                    add: function(obj) {
                        this.objects.push(obj);
                        console.log('➕ FALLBACK CANVAS: Object added');
                    },
                    remove: function(obj) {
                        const index = this.objects.indexOf(obj);
                        if (index > -1) this.objects.splice(index, 1);
                    },
                    getObjects: function() { return this.objects; },
                    renderAll: function() { console.log('🎨 FALLBACK CANVAS: Render all (no-op)'); },
                    dispose: function() { this.objects = []; },
                    isFallback: true
                };
            }
        };

        console.log('✅ INTEGRATION: Enhanced Canvas manager created');
    }

    /**
     * Design System Integration
     */
    function integrateWithDesignSystem() {
        console.log('🎯 INTEGRATION: Enhancing design system with error handling');

        window.enhancedDesignSystem = {
            async saveDesign(designData, options = {}) {
                const scriptContent = `
                    console.log('💾 ENHANCED DESIGN: Saving design data');

                    const formData = new FormData();
                    formData.append('action', 'save_design_data');
                    formData.append('design_data', JSON.stringify(${JSON.stringify(designData)}));
                    formData.append('nonce', window.octoPrintDesigner?.nonce || '');

                    const response = await fetch(window.ajaxurl || '/wp-admin/admin-ajax.php', {
                        method: 'POST',
                        body: formData
                    });

                    if (!response.ok) {
                        throw new Error('Save request failed: ' + response.status);
                    }

                    const result = await response.json();

                    if (!result.success) {
                        throw new Error(result.data?.message || 'Save operation failed');
                    }

                    console.log('✅ ENHANCED DESIGN: Design saved successfully');
                    return result.data;
                `;

                try {
                    return await window.comprehensiveErrorHandler.executeScript(scriptContent, {
                        operation: 'design_save',
                        designId: designData.id || 'unknown',
                        ...options
                    });
                } catch (error) {
                    console.error('❌ ENHANCED DESIGN: Failed to save design', error);

                    // Store in local storage as fallback
                    return this.saveToLocalStorage(designData);
                }
            },

            saveToLocalStorage(designData) {
                console.log('💾 ENHANCED DESIGN: Saving to local storage as fallback');

                try {
                    const key = `design_backup_${Date.now()}`;
                    localStorage.setItem(key, JSON.stringify({
                        ...designData,
                        timestamp: Date.now(),
                        isFallback: true
                    }));

                    console.log('✅ ENHANCED DESIGN: Design saved to local storage');

                    // Show user notification
                    if (window.comprehensiveErrorHandler) {
                        // Create a notification about fallback save
                        setTimeout(() => {
                            const notification = document.createElement('div');
                            notification.innerHTML = `
                                <div style="
                                    position: fixed;
                                    bottom: 20px;
                                    right: 20px;
                                    background: #FF9800;
                                    color: white;
                                    padding: 12px 16px;
                                    border-radius: 6px;
                                    z-index: 10000;
                                    font-family: Arial, sans-serif;
                                ">
                                    💾 Design saved locally (backup mode)
                                    <button onclick="this.parentElement.remove()" style="
                                        background: none;
                                        border: none;
                                        color: white;
                                        margin-left: 8px;
                                        cursor: pointer;
                                    ">×</button>
                                </div>
                            `;
                            document.body.appendChild(notification);

                            setTimeout(() => {
                                if (notification.parentNode) {
                                    notification.parentNode.removeChild(notification);
                                }
                            }, 5000);
                        }, 500);
                    }

                    return { success: true, fallback: true, key: key };
                } catch (error) {
                    console.error('❌ ENHANCED DESIGN: Failed to save to local storage', error);
                    throw error;
                }
            }
        };

        console.log('✅ INTEGRATION: Enhanced design system created');
    }

    /**
     * Create Enhanced Wrapper Functions
     */
    function createEnhancedWrappers() {
        console.log('🔗 INTEGRATION: Creating enhanced wrapper functions');

        // Enhanced safe execution wrapper
        window.safeExecute = async function(fn, context = {}) {
            if (typeof fn === 'string') {
                return window.comprehensiveErrorHandler.executeScript(fn, context);
            }

            if (typeof fn === 'function') {
                const scriptContent = `(${fn.toString()})()`;
                return window.comprehensiveErrorHandler.executeScript(scriptContent, context);
            }

            throw new Error('safeExecute: Invalid function provided');
        };

        // Enhanced AJAX wrapper
        window.safeAjax = async function(options) {
            return window.comprehensiveErrorHandler.handleAjaxRequest(options);
        };

        // Enhanced fabric operation wrapper
        window.safeFabric = async function(operation, ...args) {
            const scriptContent = `
                if (!window.fabric) {
                    await window.enhancedFabricLoader.loadFabric();
                }

                if (typeof ${operation} === 'function') {
                    return ${operation}(...${JSON.stringify(args)});
                } else {
                    throw new Error('Invalid fabric operation: ${operation}');
                }
            `;

            return window.comprehensiveErrorHandler.executeScript(scriptContent, {
                operation: 'fabric_operation',
                dependency: 'fabric'
            });
        };

        console.log('✅ INTEGRATION: Enhanced wrapper functions created');
    }

    // Auto-integration with existing systems
    setTimeout(() => {
        console.log('🔄 INTEGRATION: Performing auto-integration checks');

        // Check for existing Fabric.js issues and provide auto-fix
        if (typeof window.fabric === 'undefined') {
            console.log('⚠️ INTEGRATION: Fabric.js not found, attempting auto-load');
            window.enhancedFabricLoader.loadFabric().catch(error => {
                console.error('❌ INTEGRATION: Auto-load failed', error);
            });
        }

        // Check for broken canvas elements
        const canvasElements = document.querySelectorAll('canvas');
        canvasElements.forEach((canvas, index) => {
            if (!canvas.__fabric && canvas.id) {
                console.log(`🔧 INTEGRATION: Found uninitialized canvas: ${canvas.id}`);
                // Could auto-initialize if needed
            }
        });

        console.log('✅ INTEGRATION: Auto-integration checks complete');
    }, 1000);

    console.log('🎉 ERROR HANDLER INTEGRATION: System integration complete');

})();