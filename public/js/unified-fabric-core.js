/**
 * 🚀 UNIFIED FABRIC CORE - Core Rebuild Solution
 * Replaces 35+ conflicting scripts with clean, modern architecture
 *
 * ELIMINATES:
 * - fabric-readiness-detector.js
 * - webpack-fabric-extractor.js
 * - fabric-master-loader.js
 * - emergency-fabric-loader.js
 * - optimized-design-data-capture.js (legacy paradox detection)
 * - All other fabric loading/detection scripts
 */

class UnifiedFabricCore {
    constructor() {
        this.initialized = false;
        this.fabricReady = false;
        this.canvasInstances = new Map();
        this.readyCallbacks = [];

        console.log('🚀 UNIFIED FABRIC CORE: Starting clean initialization...');
        this.initialize();
    }

    async initialize() {
        try {
            // Step 1: Ensure DOM is ready
            await this.waitForDOM();

            // Step 2: Load fabric.js (single source of truth)
            await this.loadFabricJS();

            // Step 3: Initialize canvas management
            this.initializeCanvasManager();

            // Step 4: Mark system as ready
            this.markSystemReady();

            console.log('✅ UNIFIED FABRIC CORE: Clean initialization completed');

        } catch (error) {
            console.error('❌ UNIFIED FABRIC CORE: Initialization failed:', error);
            throw error;
        }
    }

    async waitForDOM() {
        return new Promise((resolve) => {
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', resolve);
            } else {
                resolve();
            }
        });
    }

    async loadFabricJS() {
        console.log('🎯 UNIFIED FABRIC CORE: Loading fabric.js...');

        // Check if fabric is already available (from webpack or previous load)
        if (window.fabric && typeof window.fabric.Canvas === 'function') {
            console.log('✅ UNIFIED FABRIC CORE: Fabric.js already available');
            this.fabricReady = true;
            return;
        }

        // Load fabric.js from CDN with proper error handling
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js';
            script.crossOrigin = 'anonymous';

            script.onload = () => {
                if (window.fabric && typeof window.fabric.Canvas === 'function') {
                    console.log('✅ UNIFIED FABRIC CORE: Fabric.js loaded from CDN');
                    this.fabricReady = true;
                    resolve();
                } else {
                    reject(new Error('Fabric.js loaded but not properly exposed'));
                }
            };

            script.onerror = () => {
                reject(new Error('Failed to load fabric.js from CDN'));
            };

            document.head.appendChild(script);
        });
    }

    initializeCanvasManager() {
        console.log('🎯 UNIFIED FABRIC CORE: Initializing canvas manager...');

        // Create unified canvas creation method
        this.createCanvas = this.createCanvas.bind(this);
        this.getCanvas = this.getCanvas.bind(this);
        this.getAllCanvases = this.getAllCanvases.bind(this);

        // Expose globally for compatibility
        window.unifiedFabricCore = this;
        window.createUnifiedCanvas = this.createCanvas;
        window.getUnifiedCanvas = this.getCanvas;

        console.log('✅ UNIFIED FABRIC CORE: Canvas manager ready');
    }

    createCanvas(elementId, options = {}) {
        if (!this.fabricReady) {
            throw new Error('Fabric.js not ready - wait for fabricReady event');
        }

        try {
            const element = document.getElementById(elementId);
            if (!element) {
                throw new Error(`Canvas element with ID '${elementId}' not found`);
            }

            // Create fabric canvas with proper configuration
            const fabricCanvas = new window.fabric.Canvas(elementId, {
                width: options.width || 800,
                height: options.height || 600,
                backgroundColor: options.backgroundColor || '#ffffff',
                ...options
            });

            // Store in unified registry
            this.canvasInstances.set(elementId, {
                element: element,
                fabricCanvas: fabricCanvas,
                created: Date.now(),
                options: options
            });

            console.log(`✅ UNIFIED FABRIC CORE: Canvas '${elementId}' created successfully`);

            // Dispatch canvas ready event
            window.dispatchEvent(new CustomEvent('unifiedCanvasCreated', {
                detail: { elementId, fabricCanvas, instance: this.canvasInstances.get(elementId) }
            }));

            return fabricCanvas;

        } catch (error) {
            console.error(`❌ UNIFIED FABRIC CORE: Failed to create canvas '${elementId}':`, error);
            throw error;
        }
    }

    getCanvas(elementId) {
        const instance = this.canvasInstances.get(elementId);
        return instance ? instance.fabricCanvas : null;
    }

    getAllCanvases() {
        const canvases = {};
        this.canvasInstances.forEach((instance, elementId) => {
            canvases[elementId] = instance.fabricCanvas;
        });
        return canvases;
    }

    markSystemReady() {
        this.initialized = true;

        // Execute any queued ready callbacks
        this.readyCallbacks.forEach(callback => {
            try {
                callback(this);
            } catch (error) {
                console.error('❌ UNIFIED FABRIC CORE: Ready callback error:', error);
            }
        });
        this.readyCallbacks = [];

        // Dispatch system ready events
        window.dispatchEvent(new CustomEvent('unifiedFabricReady', {
            detail: {
                fabricCore: this,
                fabricAvailable: this.fabricReady,
                canvasManager: true,
                timestamp: Date.now()
            }
        }));

        // Legacy compatibility event
        window.dispatchEvent(new CustomEvent('designerSuperpowerReady', {
            detail: {
                instance: this,
                unified: true,
                legacy: false
            }
        }));

        console.log('🎉 UNIFIED FABRIC CORE: System fully ready - all legacy systems replaced');
    }

    onReady(callback) {
        if (this.initialized) {
            callback(this);
        } else {
            this.readyCallbacks.push(callback);
        }
    }

    // System status for debugging
    getStatus() {
        return {
            initialized: this.initialized,
            fabricReady: this.fabricReady,
            canvasCount: this.canvasInstances.size,
            canvases: Array.from(this.canvasInstances.keys()),
            fabricVersion: window.fabric ? window.fabric.version : 'Not loaded',
            timestamp: Date.now()
        };
    }

    // Cleanup method for proper disposal
    dispose() {
        console.log('🧹 UNIFIED FABRIC CORE: Disposing system...');

        // Dispose all canvas instances
        this.canvasInstances.forEach((instance, elementId) => {
            try {
                instance.fabricCanvas.dispose();
                console.log(`✅ Disposed canvas: ${elementId}`);
            } catch (error) {
                console.error(`❌ Error disposing canvas ${elementId}:`, error);
            }
        });

        this.canvasInstances.clear();
        this.initialized = false;
        this.fabricReady = false;

        // Clean up global references
        delete window.unifiedFabricCore;
        delete window.createUnifiedCanvas;
        delete window.getUnifiedCanvas;

        console.log('✅ UNIFIED FABRIC CORE: System disposed');
    }
}

// Auto-initialize when script loads
console.log('🚀 UNIFIED FABRIC CORE: Auto-initializing...');
window.unifiedFabricCore = new UnifiedFabricCore();

// Global convenience methods
window.waitForUnifiedFabric = function(callback) {
    if (window.unifiedFabricCore) {
        window.unifiedFabricCore.onReady(callback);
    } else {
        window.addEventListener('unifiedFabricReady', () => callback(window.unifiedFabricCore));
    }
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UnifiedFabricCore;
}