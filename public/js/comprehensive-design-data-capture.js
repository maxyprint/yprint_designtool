/**
 * COMPREHENSIVE DESIGN DATA CAPTURE SYSTEM
 * Complete implementation of generateDesignData() function
 *
 * Bypasses DesignerWidget exposure issues by directly accessing fabric.js canvases
 * Implements complete canvas data capture as specified in requirements
 */

class ComprehensiveDesignDataCapture {
    constructor() {
        this.fabricCanvases = [];
        this.mockupDesignArea = null;
        this.initialized = false;

        console.log('🎯 COMPREHENSIVE DESIGN DATA CAPTURE: Starting initialization...');
        this.init();
    }

    /**
     * Initialize the capture system by finding all available fabric canvases
     */
    init() {
        this.findFabricCanvases();
        this.findMockupDesignArea();
        this.attachToButtons();

        // Make globally accessible for console testing
        window.generateDesignData = () => this.generateDesignData();
        window.comprehensiveCapture = this;

        this.initialized = true;
        console.log('✅ COMPREHENSIVE DESIGN DATA CAPTURE: System initialized successfully');
        console.log('📝 Test with: generateDesignData() in console');
    }

    /**
     * Find all fabric.js canvas instances in the DOM
     */
    findFabricCanvases() {
        // Method 1: Find canvas elements with fabric instance
        const canvasElements = document.querySelectorAll('canvas');
        console.log(`🔍 Found ${canvasElements.length} canvas elements`);

        canvasElements.forEach((canvas, index) => {
            if (canvas.__fabric) {
                this.fabricCanvases.push({
                    canvas: canvas.__fabric,
                    element: canvas,
                    id: `canvas-${index}`,
                    isDesignerCanvas: this.isDesignerCanvas(canvas)
                });
                console.log(`✅ Fabric canvas found: canvas-${index}`, {
                    width: canvas.__fabric.width,
                    height: canvas.__fabric.height,
                    objects: canvas.__fabric.getObjects().length,
                    isDesigner: this.isDesignerCanvas(canvas)
                });
            }
        });

        // Method 2: Check for global fabric canvas registry
        if (typeof fabric !== 'undefined' && fabric.Canvas) {
            console.log('🎨 Fabric.js is available globally');
        }

        // Method 3: Look for canvas in window objects
        this.searchWindowForCanvases();

        console.log(`📊 Total fabric canvases discovered: ${this.fabricCanvases.length}`);
    }

    /**
     * Search window object for canvas instances
     */
    searchWindowForCanvases() {
        // Look for common canvas variable names
        const canvasVarNames = ['canvas', 'fabricCanvas', 'designerCanvas', 'mainCanvas'];

        canvasVarNames.forEach(varName => {
            if (window[varName] && window[varName].getObjects) {
                console.log(`🎯 Found canvas in window.${varName}`);
                this.fabricCanvases.push({
                    canvas: window[varName],
                    element: window[varName].upperCanvasEl,
                    id: `window-${varName}`,
                    isDesignerCanvas: true
                });
            }
        });
    }

    /**
     * Check if a canvas element belongs to the designer
     */
    isDesignerCanvas(canvasElement) {
        const parent = canvasElement.closest('.octo-print-designer, .designer-canvas-container, .canvas-container');
        return !!parent;
    }

    /**
     * Find the mockup design area container
     */
    findMockupDesignArea() {
        const selectors = [
            '.mockup-design-area',
            '.designer-canvas-container',
            '.canvas-container',
            '.octo-print-designer .canvas-wrapper',
            '.designer-workspace'
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                this.mockupDesignArea = element;
                console.log(`✅ Mockup design area found: ${selector}`);
                console.log('Dimensions:', {
                    width: element.offsetWidth,
                    height: element.offsetHeight,
                    rect: element.getBoundingClientRect()
                });
                break;
            }
        }

        if (!this.mockupDesignArea) {
            console.warn('⚠️ Mockup design area not found, using fallback');
            // Fallback: use the first designer canvas parent
            if (this.fabricCanvases.length > 0) {
                this.mockupDesignArea = this.fabricCanvases[0].element.parentElement;
            }
        }
    }

    /**
     * MAIN FUNCTION: Generate complete design data as specified in requirements
     * @returns {Object} Complete design data JSON object
     */
    generateDesignData() {
        console.log('🎯 GENERATE DESIGN DATA: Starting data capture...');

        if (this.fabricCanvases.length === 0) {
            console.error('❌ No fabric canvases available');
            return {
                error: 'No fabric canvases found',
                template_view_id: 'none',
                designed_on_area_px: { width: 0, height: 0 },
                elements: []
            };
        }

        // Use the primary designer canvas (first available or explicitly marked)
        const primaryCanvas = this.fabricCanvases.find(c => c.isDesignerCanvas) || this.fabricCanvases[0];

        console.log('🎨 Using primary canvas:', primaryCanvas.id);

        // Generate the required JSON structure
        const designData = {
            template_view_id: this.getTemplateViewId(),
            designed_on_area_px: this.getDesignAreaDimensions(primaryCanvas),
            elements: this.extractCanvasElements(primaryCanvas.canvas)
        };

        // CRITICAL: Debug logging as specified in requirements
        console.log('📊 DESIGN DATA CAPTURED:', designData);
        console.log(`📐 Canvas dimensions: ${designData.designed_on_area_px.width}x${designData.designed_on_area_px.height}`);
        console.log(`🎨 Elements captured: ${designData.elements.length}`);

        // Log each element type for verification
        const elementTypes = {};
        designData.elements.forEach(el => {
            elementTypes[el.type] = (elementTypes[el.type] || 0) + 1;
        });
        console.log('🎭 Element types:', elementTypes);

        return designData;
    }

    /**
     * Get template view ID from current context
     */
    getTemplateViewId() {
        // Try to extract from active elements
        const activeTemplate = document.querySelector('.template-item.active, [data-template-id].active');
        const activeView = document.querySelector('.view-item.active, [data-view-id].active');

        let templateId = 'default';
        let viewId = 'front';

        if (activeTemplate) {
            templateId = activeTemplate.dataset.templateId ||
                       activeTemplate.getAttribute('data-template') ||
                       activeTemplate.id || 'template-1';
        }

        if (activeView) {
            viewId = activeView.dataset.viewId ||
                    activeView.getAttribute('data-view') ||
                    activeView.textContent?.toLowerCase() || 'view-1';
        }

        // Fallback: extract from URL or page title
        if (templateId === 'default') {
            const urlParams = new URLSearchParams(window.location.search);
            templateId = urlParams.get('template_id') ||
                        urlParams.get('post') ||
                        'template-unknown';
        }

        const templateViewId = `${templateId}-${viewId}`;
        console.log(`🆔 Template View ID: ${templateViewId}`);
        return templateViewId;
    }

    /**
     * Get design area dimensions
     */
    getDesignAreaDimensions(canvasInfo) {
        const canvas = canvasInfo.canvas;

        const dimensions = {
            width: canvas.width || 400,
            height: canvas.height || 400
        };

        console.log(`📐 Design area dimensions: ${dimensions.width}x${dimensions.height}`);
        return dimensions;
    }

    /**
     * Extract all canvas elements and convert to required JSON format
     */
    extractCanvasElements(fabricCanvas) {
        if (!fabricCanvas || !fabricCanvas.getObjects) {
            console.warn('⚠️ Invalid fabric canvas for element extraction');
            return [];
        }

        const objects = fabricCanvas.getObjects();
        const elements = [];

        console.log(`🔍 Processing ${objects.length} canvas objects...`);

        objects.forEach((obj, index) => {
            // Skip internal/system objects
            if (this.isSystemObject(obj)) {
                console.log(`⏭️ Skipping system object ${index}: ${obj.type}`);
                return;
            }

            const element = this.transformObjectToElement(obj, index);
            if (element) {
                elements.push(element);
                console.log(`✅ Element ${index} captured:`, element.type, `at (${element.x}, ${element.y})`);
            }
        });

        console.log(`📦 Total elements captured: ${elements.length}`);
        return elements;
    }

    /**
     * Check if object is a system/internal object that should be skipped
     */
    isSystemObject(obj) {
        if (!obj) return true;

        // Skip non-selectable or non-interactive objects
        if (obj.selectable === false || obj.evented === false) {
            return true;
        }

        // Skip objects marked as internal
        if (obj.isInternal || obj.isSystemObject) {
            return true;
        }

        // Skip by object properties that indicate system objects
        if (obj.type === 'rect' &&
            (obj.fill === 'rgba(0,0,0,0.1)' || // Safe zones
             obj.stroke === '#ff0000' || // Print zones
             obj.fill === 'transparent')) {
            return true;
        }

        // Skip by ID patterns
        if (obj.id && (
            obj.id.includes('safe-zone') ||
            obj.id.includes('print-zone') ||
            obj.id.includes('bleed-') ||
            obj.id.includes('template-bg') ||
            obj.id.includes('system-')
        )) {
            return true;
        }

        return false;
    }

    /**
     * Transform fabric.js object to required JSON element format
     */
    transformObjectToElement(obj, index) {
        if (!obj) return null;

        // Get transformed coordinates relative to mockup_design_area
        const coords = this.transformCoordinates(obj.left || 0, obj.top || 0);

        // Base element properties
        const baseElement = {
            x: Math.round(coords.x),
            y: Math.round(coords.y),
            width: Math.round((obj.width || 0) * (obj.scaleX || 1)),
            height: Math.round((obj.height || 0) * (obj.scaleY || 1)),
            scaleX: obj.scaleX || 1,
            scaleY: obj.scaleY || 1,
            angle: obj.angle || 0
        };

        // Element type specific properties
        switch (obj.type) {
            case 'image':
                return {
                    type: 'image',
                    src: obj.src || obj._originalElement?.src || obj.getSrc?.() || '',
                    ...baseElement
                };

            case 'i-text':
            case 'text':
            case 'textbox':
                return {
                    type: 'text',
                    text: obj.text || '',
                    fontFamily: obj.fontFamily || 'Arial',
                    fontSize: Math.round(obj.fontSize || 16),
                    fill: obj.fill || '#000000',
                    fontWeight: obj.fontWeight || 'normal',
                    fontStyle: obj.fontStyle || 'normal',
                    textAlign: obj.textAlign || 'left',
                    ...baseElement
                };

            case 'rect':
                return {
                    type: 'rectangle',
                    fill: obj.fill || '#000000',
                    stroke: obj.stroke || '',
                    strokeWidth: obj.strokeWidth || 0,
                    rx: obj.rx || 0,
                    ry: obj.ry || 0,
                    ...baseElement
                };

            case 'circle':
                return {
                    type: 'circle',
                    radius: Math.round(obj.radius || 0),
                    fill: obj.fill || '#000000',
                    stroke: obj.stroke || '',
                    strokeWidth: obj.strokeWidth || 0,
                    ...baseElement
                };

            case 'ellipse':
                return {
                    type: 'ellipse',
                    rx: Math.round(obj.rx || 0),
                    ry: Math.round(obj.ry || 0),
                    fill: obj.fill || '#000000',
                    stroke: obj.stroke || '',
                    strokeWidth: obj.strokeWidth || 0,
                    ...baseElement
                };

            case 'line':
                return {
                    type: 'line',
                    x1: Math.round(obj.x1 || 0),
                    y1: Math.round(obj.y1 || 0),
                    x2: Math.round(obj.x2 || 0),
                    y2: Math.round(obj.y2 || 0),
                    stroke: obj.stroke || '#000000',
                    strokeWidth: obj.strokeWidth || 1,
                    ...baseElement
                };

            case 'polygon':
            case 'polyline':
                return {
                    type: obj.type,
                    points: obj.points || [],
                    fill: obj.fill || '#000000',
                    stroke: obj.stroke || '',
                    strokeWidth: obj.strokeWidth || 0,
                    ...baseElement
                };

            case 'path':
                return {
                    type: 'path',
                    path: obj.path || '',
                    fill: obj.fill || '#000000',
                    stroke: obj.stroke || '',
                    strokeWidth: obj.strokeWidth || 0,
                    ...baseElement
                };

            case 'group':
                return {
                    type: 'group',
                    objects: obj.getObjects ? obj.getObjects().map(o => this.transformObjectToElement(o, 0)) : [],
                    ...baseElement
                };

            default:
                // Handle unknown object types
                console.log(`🔍 Unknown object type: ${obj.type}`, obj);
                return {
                    type: obj.type || 'unknown',
                    ...baseElement,
                    _originalObject: {
                        type: obj.type,
                        className: obj.constructor?.name
                    }
                };
        }
    }

    /**
     * Transform canvas coordinates to mockup_design_area relative coordinates
     * As specified in requirements: coordinates relative to upper-left corner of mockup_design_area
     */
    transformCoordinates(canvasX, canvasY) {
        if (!this.mockupDesignArea) {
            // Fallback: return canvas coordinates as-is
            return { x: canvasX, y: canvasY };
        }

        // Get the canvas element position
        const canvasElement = this.fabricCanvases.length > 0 ?
                             this.fabricCanvases[0].element :
                             document.querySelector('canvas');

        if (!canvasElement) {
            return { x: canvasX, y: canvasY };
        }

        const canvasRect = canvasElement.getBoundingClientRect();
        const containerRect = this.mockupDesignArea.getBoundingClientRect();

        // Calculate offset from canvas to container
        const offsetX = canvasRect.left - containerRect.left;
        const offsetY = canvasRect.top - containerRect.top;

        // Transform coordinates
        const transformedX = canvasX + offsetX;
        const transformedY = canvasY + offsetY;

        return {
            x: transformedX,
            y: transformedY
        };
    }

    /**
     * Attach to save and add-to-cart buttons as specified in requirements
     */
    attachToButtons() {
        console.log('🔗 Attaching to save/cart buttons...');

        // Find all possible button selectors
        const buttonSelectors = [
            '.designer-action-button',
            '.save-design-button',
            '.add-to-cart-button',
            '.designer-cart-button',
            '.designer-save-button',
            '.designer-modal-save',
            'button[data-action="save"]',
            'button[data-action="add-to-cart"]',
            '.btn-primary.save',
            '.btn-success.cart'
        ];

        let attachedCount = 0;

        buttonSelectors.forEach(selector => {
            const buttons = document.querySelectorAll(selector);
            buttons.forEach(button => {
                if (!button.hasAttribute('data-capture-attached')) {
                    button.addEventListener('click', (event) => {
                        console.log(`🖱️ Button clicked: ${selector}`);
                        const designData = this.generateDesignData();
                        console.log('💾 Design data on button click:', designData);

                        // Store in button for potential form submission
                        button.designData = designData;

                        // Trigger custom event
                        window.dispatchEvent(new CustomEvent('designDataGenerated', {
                            detail: { designData, trigger: selector, button }
                        }));
                    });
                    button.setAttribute('data-capture-attached', 'true');
                    attachedCount++;
                    console.log(`✅ Attached to button: ${selector}`);
                }
            });
        });

        console.log(`🔗 Total buttons attached: ${attachedCount}`);

        // Also attach to form submissions
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            if (!form.hasAttribute('data-capture-attached')) {
                form.addEventListener('submit', () => {
                    console.log('📝 Form submission detected');
                    const designData = this.generateDesignData();
                    console.log('💾 Design data on form submit:', designData);
                });
                form.setAttribute('data-capture-attached', 'true');
            }
        });
    }

    /**
     * Manual trigger function for testing
     */
    test() {
        console.log('🧪 MANUAL TEST: Generating design data...');
        const data = this.generateDesignData();
        console.log('🧪 TEST RESULT:', data);
        return data;
    }
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 COMPREHENSIVE DESIGN DATA CAPTURE: DOM loaded');

    // Wait a bit for other scripts to load
    setTimeout(() => {
        window.comprehensiveCapture = new ComprehensiveDesignDataCapture();
    }, 1000);
});

// Also initialize if DOM is already loaded
if (document.readyState === 'loading') {
    // DOM still loading, wait for event
} else {
    // DOM already loaded
    setTimeout(() => {
        if (!window.comprehensiveCapture) {
            window.comprehensiveCapture = new ComprehensiveDesignDataCapture();
        }
    }, 1000);
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComprehensiveDesignDataCapture;
}