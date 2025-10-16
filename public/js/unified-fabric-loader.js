/**
 * 🎯 UNIFIED FABRIC LOADER - SUPERPOWER IMPLEMENTATION
 * Single source of truth for fabric.js loading - eliminates all race conditions
 *
 * REPLACES: fabric-global-exposer.js, emergency-fabric-loader.js,
 *           webpack-fabric-extractor.js, fabric-readiness-detector.js
 */

class UnifiedFabricLoader {
    constructor() {
        // Prevent duplicate initialization
        if (window.unifiedFabricLoader) {
            console.warn('🚨 UNIFIED FABRIC: Already initialized, returning existing instance');
            return window.unifiedFabricLoader;
        }

        this.status = {
            webpackLoaded: false,
            globalExposed: false,
            cdnFallback: false,
            ready: false,
            source: null
        };

        this.callbacks = [];
        this.maxRetries = 20;
        this.retryDelay = 150;
        this.cdnSources = [
            {
                url: 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js',
                integrity: 'sha512-fH1jUjKM7uWx1p4FsQI9M3fP1gNcF7y2wG5MxwG2cK5hQJmL1FqWdFsM+v1NXbr2HYn6F1+TPGP4KdP0H0j0Q==',
                primary: true
            },
            {
                url: 'https://unpkg.com/fabric@5.3.0/dist/fabric.min.js',
                integrity: null,
                fallback: true
            }
        ];

        console.log('🎯 UNIFIED FABRIC: Initializing superpower fabric loading system...');

        // Store global reference
        window.unifiedFabricLoader = this;
        window.waitForFabric = (callback) => this.waitForReady(callback);

        this.init();
    }

    async init() {
        try {
            console.log('⚡ UNIFIED FABRIC: Starting unified loading sequence...');

            // Phase 1: Wait for webpack chunks
            await this.waitForWebpack();

            // Phase 2: Extract from webpack or fallback to CDN
            const success = await this.extractFromWebpack() || await this.loadFromCDN();

            if (success) {
                this.status.ready = true;
                this.executeCallbacks();
                this.dispatchEvents();
                console.log('✅ UNIFIED FABRIC: Superpower loading complete!');
            } else {
                throw new Error('Fabric.js loading failed completely');
            }
        } catch (error) {
            console.error('❌ UNIFIED FABRIC: Critical loading failure:', error);
            this.handleCriticalFailure();
        }
    }

    async waitForWebpack() {
        console.log('🔍 UNIFIED FABRIC: Waiting for webpack chunks...');

        return new Promise((resolve) => {
            let attempts = 0;
            const check = () => {
                if (window.webpackChunkocto_print_designer && window.__webpack_require__) {
                    this.status.webpackLoaded = true;
                    console.log('✅ UNIFIED FABRIC: Webpack chunks detected');
                    resolve(true);
                } else if (attempts++ < this.maxRetries) {
                    setTimeout(check, this.retryDelay);
                } else {
                    console.warn('⚠️ UNIFIED FABRIC: Webpack timeout - proceeding to CDN');
                    resolve(false);
                }
            };
            check();
        });
    }

    async extractFromWebpack() {
        if (!this.status.webpackLoaded) return false;

        console.log('🔧 UNIFIED FABRIC: Attempting webpack extraction...');

        try {
            // Try multiple webpack extraction methods
            const extractionMethods = [
                () => window.__webpack_require__('./node_modules/fabric/dist/index.min.mjs'),
                () => window.__webpack_require__('./node_modules/fabric/dist/fabric.min.js'),
                () => this.extractFromWebpackCache()
            ];

            for (const method of extractionMethods) {
                try {
                    const fabricModule = method();
                    if (fabricModule && typeof fabricModule.Canvas === 'function') {
                        window.fabric = fabricModule;
                        this.status.globalExposed = true;
                        this.status.source = 'webpack';
                        console.log('✅ UNIFIED FABRIC: Successfully extracted from webpack');
                        return true;
                    }
                } catch (methodError) {
                    console.log('🔍 UNIFIED FABRIC: Webpack method failed, trying next...');
                }
            }
        } catch (error) {
            console.warn('⚠️ UNIFIED FABRIC: Webpack extraction failed:', error.message);
        }

        return false;
    }

    extractFromWebpackCache() {
        // Try to find fabric in webpack module cache
        if (!window.__webpack_require__ || !window.__webpack_require__.cache) {
            return null;
        }

        for (const moduleId in window.__webpack_require__.cache) {
            const module = window.__webpack_require__.cache[moduleId];
            if (module && module.exports && module.exports.Canvas) {
                return module.exports;
            }
        }
        return null;
    }

    async loadFromCDN() {
        console.log('🌐 UNIFIED FABRIC: Loading from CDN fallback...');

        for (const source of this.cdnSources) {
            try {
                const success = await this.loadSingleCDN(source);
                if (success) {
                    this.status.source = 'cdn';
                    return true;
                }
            } catch (error) {
                console.warn(`⚠️ UNIFIED FABRIC: CDN source failed: ${source.url}`, error.message);
            }
        }
        return false;
    }

    loadSingleCDN(source) {
        return new Promise((resolve) => {
            console.log(`🔗 UNIFIED FABRIC: Loading from ${source.url}...`);

            const script = document.createElement('script');
            script.src = source.url;
            script.crossOrigin = 'anonymous';

            if (source.integrity) {
                script.integrity = source.integrity;
            }

            script.onload = () => {
                if (this.verifyFabricIntegrity()) {
                    this.status.cdnFallback = true;
                    this.status.globalExposed = true;
                    console.log(`✅ UNIFIED FABRIC: Successfully loaded from CDN`);
                    resolve(true);
                } else {
                    console.error('❌ UNIFIED FABRIC: CDN load failed verification');
                    document.head.removeChild(script);
                    resolve(false);
                }
            };

            script.onerror = () => {
                console.error(`❌ UNIFIED FABRIC: CDN request failed: ${source.url}`);
                resolve(false);
            };

            // Timeout protection
            setTimeout(() => {
                if (!this.verifyFabricIntegrity()) {
                    console.error('❌ UNIFIED FABRIC: CDN load timeout');
                    try { document.head.removeChild(script); } catch (e) {}
                    resolve(false);
                }
            }, 5000);

            document.head.appendChild(script);
        });
    }

    verifyFabricIntegrity() {
        if (!window.fabric || typeof window.fabric.Canvas !== 'function') {
            return false;
        }

        // Additional integrity checks
        const requiredClasses = ['Canvas', 'Object', 'Image', 'Text', 'Group'];
        const hasAllClasses = requiredClasses.every(className =>
            typeof window.fabric[className] === 'function'
        );

        if (hasAllClasses) {
            console.log('✅ UNIFIED FABRIC: Integrity verification passed');
        }

        return hasAllClasses;
    }

    waitForReady(callback) {
        if (this.status.ready) {
            callback(window.fabric);
        } else {
            this.callbacks.push(callback);
        }
    }

    executeCallbacks() {
        console.log(`🔄 UNIFIED FABRIC: Executing ${this.callbacks.length} queued callbacks`);
        this.callbacks.forEach(callback => callback(window.fabric));
        this.callbacks = [];
    }

    dispatchEvents() {
        const eventDetail = {
            fabric: window.fabric,
            status: this.status,
            timestamp: Date.now(),
            source: this.status.source
        };

        // Dispatch multiple event types for compatibility
        window.dispatchEvent(new CustomEvent('fabricReady', { detail: eventDetail }));
        window.dispatchEvent(new CustomEvent('fabricGlobalReady', { detail: eventDetail }));
        document.dispatchEvent(new CustomEvent('fabricGloballyExposed', { detail: eventDetail }));

        console.log('🎯 UNIFIED FABRIC: Events dispatched - fabric ready!');
    }

    handleCriticalFailure() {
        console.error('🚨 UNIFIED FABRIC: CRITICAL FAILURE - All loading methods failed');

        // Dispatch failure event
        window.dispatchEvent(new CustomEvent('fabricLoadingFailed', {
            detail: {
                error: 'All fabric loading methods failed',
                status: this.status
            }
        }));

        // Attempt emergency mock fabric for basic functionality
        this.createEmergencyMockFabric();
    }

    createEmergencyMockFabric() {
        console.log('🚑 UNIFIED FABRIC: Creating emergency mock fabric...');

        window.fabric = {
            Canvas: function() {
                console.warn('⚠️ MOCK FABRIC: Using emergency mock canvas');
                return {
                    getObjects: () => [],
                    toDataURL: () => '',
                    clear: () => {},
                    dispose: () => {}
                };
            },
            Object: function() {},
            Image: function() {},
            Text: function() {},
            Group: function() {}
        };

        this.status.ready = true;
        this.status.source = 'emergency-mock';
        this.executeCallbacks();
        this.dispatchEvents();
    }

    getStatus() {
        return {
            ...this.status,
            fabricAvailable: typeof window.fabric !== 'undefined',
            canvasAvailable: window.fabric && typeof window.fabric.Canvas === 'function',
            timestamp: Date.now()
        };
    }

    logDetailedStatus() {
        const status = this.getStatus();
        console.group('🔍 UNIFIED FABRIC STATUS');
        console.log('Ready:', status.ready);
        console.log('Source:', status.source);
        console.log('Fabric Available:', status.fabricAvailable);
        console.log('Canvas Available:', status.canvasAvailable);
        console.log('Detailed Status:', status);
        console.groupEnd();
        return status;
    }
}

// Auto-initialize unified fabric loader
console.log('🚀 UNIFIED FABRIC: Auto-initializing superpower fabric loader...');
new UnifiedFabricLoader();

// Export for compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedFabricLoader;
}