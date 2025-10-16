/**
 * 🎯 DESIGNER WIDGET CORE - Modern Rebuild
 * Clean, race-condition-free DesignerWidget implementation
 *
 * REPLACES:
 * - designer.bundle.js (legacy webpack bundle)
 * - optimized-design-data-capture.js (paradox-prone detection)
 * - All canvas initialization controllers
 * - All coordinate capture systems
 */

class DesignerWidgetCore {
    constructor() {
        this.initialized = false;
        this.canvas = null;
        this.fabricCanvas = null;
        this.elements = new Map();
        this.currentDesign = null;

        console.log('🎯 DESIGNER WIDGET CORE: Starting modern rebuild...');
        this.initialize();
    }

    async initialize() {
        try {
            // Wait for unified fabric core to be ready
            await this.waitForUnifiedFabric();

            // Initialize the designer interface
            await this.initializeDesignerInterface();

            // Set up design data management
            this.initializeDesignDataManager();

            // Set up event system
            this.initializeEventSystem();

            // Mark as ready
            this.markReady();

            console.log('✅ DESIGNER WIDGET CORE: Modern initialization completed');

        } catch (error) {
            console.error('❌ DESIGNER WIDGET CORE: Initialization failed:', error);
            throw error;
        }
    }

    async waitForUnifiedFabric() {
        return new Promise((resolve) => {
            if (window.unifiedFabricCore && window.unifiedFabricCore.initialized) {
                resolve();
            } else {
                window.addEventListener('unifiedFabricReady', resolve, { once: true });
            }
        });
    }

    async initializeDesignerInterface() {
        console.log('🎯 DESIGNER WIDGET CORE: Initializing interface...');

        // Find or create canvas element
        let canvasElement = document.getElementById('designer-canvas');
        if (!canvasElement) {
            canvasElement = this.createCanvasElement();
        }

        // Create fabric canvas through unified core
        this.fabricCanvas = window.unifiedFabricCore.createCanvas('designer-canvas', {
            width: 800,
            height: 600,
            backgroundColor: '#ffffff',
            selection: true,
            preserveObjectStacking: true
        });

        this.canvas = canvasElement;

        console.log('✅ DESIGNER WIDGET CORE: Interface initialized');
    }

    createCanvasElement() {
        console.log('🎯 DESIGNER WIDGET CORE: Creating canvas element...');

        const canvasElement = document.createElement('canvas');
        canvasElement.id = 'designer-canvas';
        canvasElement.className = 'designer-canvas';

        // Find appropriate container
        let container = document.querySelector('.designer-container');
        if (!container) {
            container = document.querySelector('.product-designer');
        }
        if (!container) {
            container = document.body;
        }

        container.appendChild(canvasElement);
        return canvasElement;
    }

    initializeDesignDataManager() {
        console.log('🎯 DESIGNER WIDGET CORE: Initializing design data manager...');

        this.designData = {
            elements: [],
            background: null,
            dimensions: {
                width: this.fabricCanvas.width,
                height: this.fabricCanvas.height
            },
            metadata: {
                created: Date.now(),
                version: '2.0-core-rebuild'
            }
        };

        // Set up real-time design tracking
        this.fabricCanvas.on('object:added', (e) => this.onElementAdded(e));
        this.fabricCanvas.on('object:removed', (e) => this.onElementRemoved(e));
        this.fabricCanvas.on('object:modified', (e) => this.onElementModified(e));

        console.log('✅ DESIGNER WIDGET CORE: Design data manager ready');
    }

    initializeEventSystem() {
        console.log('🎯 DESIGNER WIDGET CORE: Initializing event system...');

        // Modern event-driven architecture
        this.eventHandlers = {
            elementAdded: [],
            elementRemoved: [],
            elementModified: [],
            designSaved: [],
            designLoaded: []
        };

        // Expose event subscription methods
        this.on = this.addEventListener.bind(this);
        this.off = this.removeEventListener.bind(this);
        this.emit = this.dispatchEvent.bind(this);

        console.log('✅ DESIGNER WIDGET CORE: Event system ready');
    }

    // Element Management - Clean API
    addElement(type, options = {}) {
        if (!this.fabricCanvas) {
            throw new Error('Designer not initialized');
        }

        let element;
        const elementId = 'element_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);

        switch (type) {
            case 'text':
                element = new window.fabric.Text(options.text || 'Sample Text', {
                    left: options.x || 100,
                    top: options.y || 100,
                    fontSize: options.fontSize || 20,
                    fill: options.color || '#000000',
                    ...options
                });
                break;

            case 'image':
                if (!options.src) {
                    throw new Error('Image source required');
                }
                return this.addImageElement(options.src, options);

            case 'rectangle':
                element = new window.fabric.Rect({
                    left: options.x || 100,
                    top: options.y || 100,
                    width: options.width || 100,
                    height: options.height || 100,
                    fill: options.color || '#ff0000',
                    ...options
                });
                break;

            case 'circle':
                element = new window.fabric.Circle({
                    left: options.x || 100,
                    top: options.y || 100,
                    radius: options.radius || 50,
                    fill: options.color || '#00ff00',
                    ...options
                });
                break;

            default:
                throw new Error(`Unknown element type: ${type}`);
        }

        element.id = elementId;
        this.fabricCanvas.add(element);

        console.log(`✅ DESIGNER WIDGET CORE: Added ${type} element:`, elementId);
        return element;
    }

    async addImageElement(src, options = {}) {
        return new Promise((resolve, reject) => {
            window.fabric.Image.fromURL(src, (img) => {
                if (!img) {
                    reject(new Error('Failed to load image'));
                    return;
                }

                img.set({
                    left: options.x || 100,
                    top: options.y || 100,
                    scaleX: options.scaleX || 1,
                    scaleY: options.scaleY || 1,
                    ...options
                });

                img.id = 'element_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
                this.fabricCanvas.add(img);

                console.log('✅ DESIGNER WIDGET CORE: Added image element:', img.id);
                resolve(img);
            });
        });
    }

    removeElement(elementId) {
        const objects = this.fabricCanvas.getObjects();
        const element = objects.find(obj => obj.id === elementId);

        if (element) {
            this.fabricCanvas.remove(element);
            console.log('✅ DESIGNER WIDGET CORE: Removed element:', elementId);
            return true;
        }

        return false;
    }

    // Design Data Management - Clean API
    getDesignData() {
        const objects = this.fabricCanvas.getObjects();

        this.designData.elements = objects.map(obj => ({
            id: obj.id,
            type: obj.type,
            properties: obj.toObject(['id']),
            coordinates: {
                x: obj.left,
                y: obj.top,
                width: obj.width * (obj.scaleX || 1),
                height: obj.height * (obj.scaleY || 1)
            }
        }));

        this.designData.metadata.lastModified = Date.now();

        return {
            ...this.designData,
            canvasData: this.fabricCanvas.toJSON(['id'])
        };
    }

    loadDesignData(designData) {
        if (!designData || !designData.canvasData) {
            throw new Error('Invalid design data');
        }

        this.fabricCanvas.loadFromJSON(designData.canvasData, () => {
            this.fabricCanvas.renderAll();
            this.currentDesign = designData;

            console.log('✅ DESIGNER WIDGET CORE: Design loaded successfully');
            this.emit('designLoaded', { designData });
        });
    }

    saveDesign() {
        const designData = this.getDesignData();

        // Emit save event for external handling
        this.emit('designSaved', { designData });

        console.log('✅ DESIGNER WIDGET CORE: Design saved');
        return designData;
    }

    // Event System - Modern API
    addEventListener(eventType, handler) {
        if (!this.eventHandlers[eventType]) {
            this.eventHandlers[eventType] = [];
        }
        this.eventHandlers[eventType].push(handler);
    }

    removeEventListener(eventType, handler) {
        if (!this.eventHandlers[eventType]) return;

        const index = this.eventHandlers[eventType].indexOf(handler);
        if (index > -1) {
            this.eventHandlers[eventType].splice(index, 1);
        }
    }

    dispatchEvent(eventType, data) {
        if (!this.eventHandlers[eventType]) return;

        this.eventHandlers[eventType].forEach(handler => {
            try {
                handler(data);
            } catch (error) {
                console.error(`❌ DESIGNER WIDGET CORE: Event handler error (${eventType}):`, error);
            }
        });
    }

    // Internal event handlers
    onElementAdded(e) {
        const element = e.target;
        console.log('📝 DESIGNER WIDGET CORE: Element added:', element.id || element.type);
        this.emit('elementAdded', { element });
    }

    onElementRemoved(e) {
        const element = e.target;
        console.log('🗑️ DESIGNER WIDGET CORE: Element removed:', element.id || element.type);
        this.emit('elementRemoved', { element });
    }

    onElementModified(e) {
        const element = e.target;
        console.log('✏️ DESIGNER WIDGET CORE: Element modified:', element.id || element.type);
        this.emit('elementModified', { element });
    }

    markReady() {
        this.initialized = true;

        // Expose globally for compatibility
        window.designerWidgetCore = this;
        window.designerWidgetInstance = this; // Legacy compatibility

        // Dispatch ready events
        window.dispatchEvent(new CustomEvent('designerWidgetReady', {
            detail: {
                instance: this,
                canvas: this.fabricCanvas,
                element: this.canvas,
                coreRebuild: true
            }
        }));

        // Legacy compatibility event
        window.dispatchEvent(new CustomEvent('designerSuperpowerReady', {
            detail: {
                instance: this,
                canvas: this.fabricCanvas,
                modern: true
            }
        }));

        console.log('🎉 DESIGNER WIDGET CORE: System ready - modern architecture active');
    }

    // Status and debugging
    getStatus() {
        return {
            initialized: this.initialized,
            canvasReady: !!this.fabricCanvas,
            elementCount: this.fabricCanvas ? this.fabricCanvas.getObjects().length : 0,
            canvasDimensions: this.fabricCanvas ? {
                width: this.fabricCanvas.width,
                height: this.fabricCanvas.height
            } : null,
            designDataVersion: this.designData?.metadata?.version,
            timestamp: Date.now()
        };
    }

    // Cleanup
    dispose() {
        console.log('🧹 DESIGNER WIDGET CORE: Disposing...');

        if (this.fabricCanvas) {
            this.fabricCanvas.dispose();
        }

        this.initialized = false;
        this.canvas = null;
        this.fabricCanvas = null;
        this.elements.clear();

        // Clean up global references
        delete window.designerWidgetCore;
        delete window.designerWidgetInstance;

        console.log('✅ DESIGNER WIDGET CORE: Disposed');
    }
}

// Auto-initialize when script loads (after unified fabric is ready)
console.log('🎯 DESIGNER WIDGET CORE: Auto-initializing...');

if (window.unifiedFabricCore && window.unifiedFabricCore.initialized) {
    window.designerWidgetCore = new DesignerWidgetCore();
} else {
    window.addEventListener('unifiedFabricReady', () => {
        window.designerWidgetCore = new DesignerWidgetCore();
    });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DesignerWidgetCore;
}