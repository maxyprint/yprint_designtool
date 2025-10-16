/**
 * 🎯 FABRIC MASTER LOADER - DEFINITIVE SOLUTION
 *
 * ELIMINATES ALL FABRIC.JS LOADING CONFLICTS
 * - Replaces: emergency-fabric-loader.js, fabric-global-exposer.js, unified-fabric-loader.js
 * - Prevents: Race conditions, multiple loaders, timing conflicts
 * - Ensures: Single source of truth for fabric.js availability
 */

(function() {
    'use strict';

    console.log('🎯 FABRIC MASTER LOADER: Starting definitive fabric.js loading solution');

    // Prevent multiple instances
    if (window.fabricMasterLoader) {
        console.log('✅ FABRIC MASTER LOADER: Already active, skipping duplicate initialization');
        return;
    }

    class FabricMasterLoader {
        constructor() {
            this.isLoaded = false;
            this.isLoading = false;
            this.callbacks = [];
            this.loadingAttempts = 0;
            this.maxAttempts = 3;

            // Mark as active to prevent duplicates
            window.fabricMasterLoader = this;
            window.waitForFabric = (callback) => this.waitForFabric(callback);

            this.init();
        }

        async init() {
            if (this.isLoading || this.isLoaded) return;
            this.isLoading = true;

            console.log('⚡ FABRIC MASTER LOADER: Initializing fabric loading sequence');

            try {
                // Step 1: Check if fabric is already available
                if (this.checkExistingFabric()) {
                    this.markAsLoaded('pre-existing');
                    return;
                }

                // Step 2: Wait for and extract from webpack bundle
                const webpackSuccess = await this.extractFromWebpack();
                if (webpackSuccess) {
                    this.markAsLoaded('webpack');
                    return;
                }

                // Step 3: Load from CDN as fallback
                const cdnSuccess = await this.loadFromCDN();
                if (cdnSuccess) {
                    this.markAsLoaded('cdn');
                    return;
                }

                throw new Error('All fabric loading methods failed');

            } catch (error) {
                console.error('❌ FABRIC MASTER LOADER: Critical failure:', error);
                this.handleFailure(error);
            }
        }

        checkExistingFabric() {
            if (window.fabric && typeof window.fabric.Canvas === 'function') {
                console.log('✅ FABRIC MASTER LOADER: Fabric.js already available');
                return true;
            }
            return false;
        }

        async extractFromWebpack() {
            console.log('🔧 FABRIC MASTER LOADER: Attempting webpack extraction');

            // Wait for webpack chunks to be available
            const webpackReady = await this.waitForWebpack();
            if (!webpackReady) {
                console.log('⚠️ FABRIC MASTER LOADER: Webpack not available, skipping extraction');
                return false;
            }

            try {
                // Method 1: Direct webpack require
                const fabricPaths = [
                    './node_modules/fabric/dist/index.min.mjs',
                    './node_modules/fabric/dist/fabric.min.js',
                    'fabric'
                ];

                for (const path of fabricPaths) {
                    try {
                        const fabricModule = window.__webpack_require__(path);
                        if (fabricModule && typeof fabricModule.Canvas === 'function') {
                            window.fabric = fabricModule;
                            console.log('✅ FABRIC MASTER LOADER: Successfully extracted from webpack');
                            return true;
                        }
                    } catch (e) {
                        // Continue to next path
                    }
                }

                // Method 2: Search webpack cache
                if (window.__webpack_require__.cache) {
                    for (const moduleId in window.__webpack_require__.cache) {
                        const module = window.__webpack_require__.cache[moduleId];
                        if (module?.exports?.Canvas && typeof module.exports.Canvas === 'function') {
                            window.fabric = module.exports;
                            console.log('✅ FABRIC MASTER LOADER: Extracted from webpack cache');
                            return true;
                        }
                    }
                }

                console.log('⚠️ FABRIC MASTER LOADER: Webpack extraction failed');
                return false;

            } catch (error) {
                console.log('⚠️ FABRIC MASTER LOADER: Webpack extraction error:', error.message);
                return false;
            }
        }

        waitForWebpack() {
            return new Promise(resolve => {
                let attempts = 0;
                const maxWait = 50; // 5 seconds max wait

                const check = () => {
                    if (window.webpackChunkocto_print_designer && window.__webpack_require__) {
                        resolve(true);
                    } else if (attempts++ < maxWait) {
                        setTimeout(check, 100);
                    } else {
                        resolve(false);
                    }
                };

                check();
            });
        }

        async loadFromCDN() {
            console.log('🌐 FABRIC MASTER LOADER: Loading from CDN');

            const cdnSources = [
                'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js',
                'https://unpkg.com/fabric@5.3.0/dist/fabric.min.js'
            ];

            for (const url of cdnSources) {
                try {
                    const success = await this.loadScript(url);
                    if (success && this.verifyFabricIntegrity()) {
                        console.log('✅ FABRIC MASTER LOADER: Successfully loaded from CDN');
                        return true;
                    }
                } catch (error) {
                    console.log(`⚠️ FABRIC MASTER LOADER: CDN source failed: ${url}`);
                }
            }

            return false;
        }

        loadScript(url) {
            return new Promise((resolve) => {
                const script = document.createElement('script');
                script.src = url;
                script.crossOrigin = 'anonymous';

                script.onload = () => resolve(true);
                script.onerror = () => resolve(false);

                // Timeout protection
                setTimeout(() => resolve(false), 10000);

                document.head.appendChild(script);
            });
        }

        verifyFabricIntegrity() {
            if (!window.fabric || typeof window.fabric.Canvas !== 'function') {
                return false;
            }

            // Verify core classes exist
            const requiredClasses = ['Canvas', 'Object', 'Image', 'Text'];
            return requiredClasses.every(className =>
                typeof window.fabric[className] === 'function'
            );
        }

        markAsLoaded(source) {
            this.isLoaded = true;
            this.isLoading = false;

            console.log(`🎉 FABRIC MASTER LOADER: Fabric.js ready from ${source}`);

            // Set global flags for compatibility
            window.fabricReady = true;
            window.emergencyFabricLoaded = true;
            window.fabricManuallyExposed = true;

            // Execute all queued callbacks
            this.executeCallbacks();

            // Dispatch events for dependent scripts
            this.dispatchEvents(source);
        }

        executeCallbacks() {
            console.log(`🔄 FABRIC MASTER LOADER: Executing ${this.callbacks.length} queued callbacks`);
            this.callbacks.forEach(callback => {
                try {
                    callback(window.fabric);
                } catch (error) {
                    console.error('❌ FABRIC MASTER LOADER: Callback error:', error);
                }
            });
            this.callbacks = [];
        }

        dispatchEvents(source) {
            const eventDetail = {
                fabric: window.fabric,
                source: source,
                timestamp: Date.now(),
                masterLoader: true
            };

            // Dispatch all known fabric ready events for maximum compatibility
            const events = [
                'fabricReady',
                'fabricGlobalReady',
                'fabricGloballyExposed',
                'fabricready'
            ];

            events.forEach(eventName => {
                window.dispatchEvent(new CustomEvent(eventName, { detail: eventDetail }));
                document.dispatchEvent(new CustomEvent(eventName, { detail: eventDetail }));
            });

            console.log('🎯 FABRIC MASTER LOADER: All events dispatched');
        }

        waitForFabric(callback) {
            if (this.isLoaded && window.fabric) {
                callback(window.fabric);
            } else {
                this.callbacks.push(callback);
            }
        }

        handleFailure(error) {
            console.error('🚨 FABRIC MASTER LOADER: Complete failure - creating emergency mock');

            // Create minimal mock to prevent total failure
            window.fabric = {
                Canvas: function(element) {
                    console.warn('⚠️ FABRIC MOCK: Using emergency mock canvas');
                    return {
                        getObjects: () => [],
                        toDataURL: () => '',
                        clear: () => {},
                        dispose: () => {},
                        add: () => {},
                        remove: () => {},
                        renderAll: () => {}
                    };
                },
                Object: function() {},
                Image: function() {},
                Text: function() {},
                Group: function() {}
            };

            this.markAsLoaded('emergency-mock');

            // Dispatch failure event
            window.dispatchEvent(new CustomEvent('fabricLoadingFailed', {
                detail: { error: error.message, fallbackMock: true }
            }));
        }

        getStatus() {
            return {
                isLoaded: this.isLoaded,
                isLoading: this.isLoading,
                fabricAvailable: typeof window.fabric !== 'undefined',
                canvasAvailable: window.fabric && typeof window.fabric.Canvas === 'function',
                callbacksQueued: this.callbacks.length,
                loadingAttempts: this.loadingAttempts
            };
        }
    }

    // Initialize immediately
    new FabricMasterLoader();

    console.log('🚀 FABRIC MASTER LOADER: Initialized and active');

})();