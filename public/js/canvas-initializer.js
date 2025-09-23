/**
 * Canvas Initializer
 * Saubere Canvas-Initialisierung ohne Workarounds
 *
 * Wartet auf Fabric.js und initialisiert Canvas ordnungsgemäß
 */

class CanvasInitializer {
    constructor() {
        this.canvas = null;
        this.isInitialized = false;
        this.retryCount = 0;
        this.maxRetries = 10;

        console.log('Canvas Initializer: Starting clean canvas initialization');
        this.init();
    }

    init() {
        // Wait for Fabric.js to be available
        if (window.waitForFabric) {
            window.waitForFabric((fabric) => {
                if (fabric) {
                    this.initializeCanvas();
                } else {
                    console.error('Canvas Initializer: Fabric.js not available after timeout');
                    this.fallbackInitialization();
                }
            });
        } else {
            // Fallback: check periodically
            this.checkFabricAvailability();
        }
    }

    checkFabricAvailability() {
        const checkInterval = setInterval(() => {
            this.retryCount++;

            if (window.fabric && window.fabric.Canvas) {
                clearInterval(checkInterval);
                console.log('Canvas Initializer: Fabric.js detected, initializing canvas');
                this.initializeCanvas();
            } else if (this.retryCount >= this.maxRetries) {
                clearInterval(checkInterval);
                console.error('Canvas Initializer: Fabric.js not available after', this.maxRetries, 'attempts');
                this.fallbackInitialization();
            }
        }, 100);
    }

    initializeCanvas() {
        try {
            // Find canvas element
            const canvasElement = document.getElementById('octo-print-designer-canvas');
            if (!canvasElement) {
                console.warn('Canvas Initializer: Canvas element not found');
                return;
            }

            // Check if already initialized
            if (this.isInitialized) {
                console.log('Canvas Initializer: Canvas already initialized, skipping');
                return;
            }

            // Initialize Fabric Canvas
            this.canvas = new window.fabric.Canvas(canvasElement, {
                width: 800,
                height: 600,
                backgroundColor: '#ffffff'
            });

            this.isInitialized = true;

            // Configure canvas
            this.configureCanvas();

            // Trigger canvas ready event
            this.triggerCanvasReadyEvent();

            console.log('✅ Canvas Initializer: Canvas successfully initialized');

        } catch (error) {
            console.error('Canvas Initializer: Error during initialization:', error);
        }
    }

    configureCanvas() {
        if (!this.canvas) return;

        try {
            // Basic canvas configuration
            this.canvas.preserveObjectStacking = true;
            this.canvas.selection = true;
            this.canvas.skipTargetFind = false;

            // Add basic event listeners
            this.canvas.on('object:added', (e) => {
                console.log('Canvas object added:', e.target.type);
            });

            this.canvas.on('object:removed', (e) => {
                console.log('Canvas object removed:', e.target.type);
            });

            console.log('Canvas Initializer: Canvas configured');

        } catch (error) {
            console.error('Canvas Initializer: Error configuring canvas:', error);
        }
    }

    triggerCanvasReadyEvent() {
        const event = new CustomEvent('canvasReady', {
            detail: {
                canvas: this.canvas,
                initializer: this
            }
        });
        document.dispatchEvent(event);
    }

    fallbackInitialization() {
        console.warn('Canvas Initializer: Using fallback initialization without Fabric.js');

        // Trigger fallback event
        const event = new CustomEvent('canvasInitializationFailed', {
            detail: { reason: 'Fabric.js not available' }
        });
        document.dispatchEvent(event);
    }

    // Public API methods
    getCanvas() {
        return this.canvas;
    }

    isCanvasReady() {
        return this.isInitialized && this.canvas !== null;
    }

    addObject(object) {
        if (this.canvas && object) {
            this.canvas.add(object);
            this.canvas.renderAll();
            return true;
        }
        return false;
    }

    removeObject(object) {
        if (this.canvas && object) {
            this.canvas.remove(object);
            this.canvas.renderAll();
            return true;
        }
        return false;
    }

    clear() {
        if (this.canvas) {
            this.canvas.clear();
            this.canvas.backgroundColor = '#ffffff';
            this.canvas.renderAll();
            return true;
        }
        return false;
    }

    toJSON() {
        if (this.canvas) {
            return this.canvas.toJSON();
        }
        return null;
    }

    loadFromJSON(data, callback) {
        if (this.canvas && data) {
            this.canvas.loadFromJSON(data, () => {
                this.canvas.renderAll();
                if (callback) callback();
            });
            return true;
        }
        return false;
    }
}

// Global instance - only create if not already exists
if (!window.canvasInitializer) {
    window.canvasInitializer = new CanvasInitializer();
}

// Helper functions for other scripts
window.getDesignerCanvas = function() {
    return window.canvasInitializer ? window.canvasInitializer.getCanvas() : null;
};

window.isCanvasReady = function() {
    return window.canvasInitializer ? window.canvasInitializer.isCanvasReady() : false;
};

window.waitForCanvas = function(callback, timeout = 5000) {
    if (window.isCanvasReady()) {
        callback(window.getDesignerCanvas());
        return;
    }

    let timeoutId;

    const handleCanvasReady = function(event) {
        clearTimeout(timeoutId);
        document.removeEventListener('canvasReady', handleCanvasReady);
        callback(event.detail.canvas);
    };

    document.addEventListener('canvasReady', handleCanvasReady);

    // Timeout fallback
    timeoutId = setTimeout(() => {
        document.removeEventListener('canvasReady', handleCanvasReady);
        console.warn('Canvas Initializer: Timeout waiting for canvas');
        callback(null);
    }, timeout);
};