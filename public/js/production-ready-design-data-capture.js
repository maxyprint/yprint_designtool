/**
 * PRODUCTION-READY DESIGN DATA CAPTURE SYSTEM
 * Race Condition-freie Implementierung basierend auf Test-Suite Erkenntnissen
 *
 * Löst alle identifizierten Probleme:
 * - DOMContentLoaded Race Conditions
 * - Timing-Issues zwischen Canvas Creation und Detection
 * - Polling-basierte Canvas Detection
 * - Retry-Mechanismus mit exponential backoff
 * - MutationObserver für Canvas Creation Monitoring
 */

class ProductionReadyDesignDataCapture {
    constructor() {
        this.fabricCanvases = [];
        this.mockupDesignArea = null;
        this.initialized = false;
        this.retryCount = 0;
        this.maxRetries = 20;
        this.baseRetryDelay = 100; // Start mit 100ms
        this.canvasObserver = null;

        // Status tracking
        this.status = {
            domReady: false,
            fabricLoaded: false,
            canvasDetected: false,
            systemReady: false
        };

        console.log('🎯 PRODUCTION-READY DESIGN DATA CAPTURE: Starting initialization...');
        console.log('🔧 Race Condition-freie Implementierung');

        // Nicht sofort initialisieren - verwende intelligente Detection
        this.startIntelligentInitialization();
    }

    /**
     * Intelligente Initialisierung mit mehreren Detection-Strategien
     */
    async startIntelligentInitialization() {
        // Strategie 1: Prüfe sofort ob alles bereits verfügbar ist
        if (this.attemptImmediateInitialization()) {
            console.log('✅ Immediate initialization successful');
            return;
        }

        // Strategie 2: Warte auf DOM Ready falls noch nicht ready
        if (document.readyState === 'loading') {
            console.log('⏳ Waiting for DOM Ready...');
            await this.waitForDOMReady();
        }

        // Strategie 3: Setup MutationObserver für Canvas Detection
        this.setupCanvasObserver();

        // Strategie 4: Polling-basierte Detection mit exponential backoff
        this.startPollingDetection();
    }

    /**
     * Versuche sofortige Initialisierung falls alles verfügbar
     */
    attemptImmediateInitialization() {
        // Prüfe ob Fabric.js verfügbar ist
        if (typeof window.fabric === 'undefined') {
            console.log('🔄 Fabric.js not yet available');
            return false;
        }

        // Prüfe ob Canvas-Elemente vorhanden sind
        const canvasElements = document.querySelectorAll('canvas');
        if (canvasElements.length === 0) {
            console.log('🔄 No canvas elements found yet');
            return false;
        }

        // Prüfe ob Fabric Canvas Instanzen vorhanden sind
        const fabricCanvases = Array.from(canvasElements).filter(canvas => canvas.__fabric);
        if (fabricCanvases.length === 0) {
            console.log('🔄 No fabric canvas instances found yet');
            return false;
        }

        // Alles verfügbar - initialisiere sofort
        this.performInitialization();
        return true;
    }

    /**
     * Warte auf DOM Ready
     */
    waitForDOMReady() {
        return new Promise(resolve => {
            if (document.readyState !== 'loading') {
                this.status.domReady = true;
                resolve();
                return;
            }

            document.addEventListener('DOMContentLoaded', () => {
                console.log('✅ DOM Ready event received');
                this.status.domReady = true;
                resolve();
            });
        });
    }

    /**
     * Setup MutationObserver für Canvas Creation Detection
     */
    setupCanvasObserver() {
        if (typeof MutationObserver === 'undefined') {
            console.log('⚠️ MutationObserver not available');
            return;
        }

        this.canvasObserver = new MutationObserver((mutations) => {
            let canvasAdded = false;

            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Direkte Canvas-Elemente
                            if (node.tagName === 'CANVAS') {
                                console.log('🔍 Canvas element added to DOM');
                                canvasAdded = true;
                            }

                            // Canvas-Elemente in hinzugefügten Containern
                            const canvases = node.querySelectorAll && node.querySelectorAll('canvas');
                            if (canvases && canvases.length > 0) {
                                console.log(`🔍 ${canvases.length} canvas elements added to DOM`);
                                canvasAdded = true;
                            }
                        }
                    });
                }
            });

            if (canvasAdded) {
                // Kurz warten, dann Initialisierung versuchen
                setTimeout(() => {
                    if (!this.initialized) {
                        this.attemptImmediateInitialization();
                    }
                }, 50);
            }
        });

        this.canvasObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        console.log('👁️ Canvas MutationObserver setup completed');
    }

    /**
     * Polling-basierte Detection mit exponential backoff
     */
    async startPollingDetection() {
        console.log('🔄 Starting polling-based detection...');

        while (this.retryCount < this.maxRetries && !this.initialized) {
            const delay = this.calculateRetryDelay();

            console.log(`🔄 Detection attempt ${this.retryCount + 1}/${this.maxRetries} (delay: ${delay}ms)`);

            await this.sleep(delay);

            // Prüfe System-Status
            this.checkSystemStatus();

            // Versuche Initialisierung
            if (this.attemptImmediateInitialization()) {
                break;
            }

            this.retryCount++;
        }

        if (!this.initialized) {
            console.error('❌ Failed to initialize after maximum retries');
            this.handleInitializationFailure();
        }
    }

    /**
     * Berechne Retry-Delay mit exponential backoff
     */
    calculateRetryDelay() {
        // Exponential backoff: 100ms, 200ms, 400ms, 800ms, dann cap bei 2000ms
        const delay = Math.min(this.baseRetryDelay * Math.pow(2, this.retryCount), 2000);
        return delay;
    }

    /**
     * Prüfe und protokolliere System-Status
     */
    checkSystemStatus() {
        const newStatus = {
            domReady: document.readyState !== 'loading',
            fabricLoaded: typeof window.fabric !== 'undefined',
            canvasDetected: document.querySelectorAll('canvas').length > 0,
            systemReady: false
        };

        // Protokolliere Änderungen
        Object.keys(newStatus).forEach(key => {
            if (this.status[key] !== newStatus[key] && newStatus[key]) {
                console.log(`✅ Status update: ${key} = true`);
            }
        });

        this.status = newStatus;
        this.status.systemReady = this.status.domReady && this.status.fabricLoaded && this.status.canvasDetected;
    }

    /**
     * Führe die eigentliche Initialisierung durch
     */
    performInitialization() {
        console.log('🚀 Performing system initialization...');

        try {
            // Finde Fabric Canvases
            this.findFabricCanvases();

            // Finde Mockup Design Area
            this.findMockupDesignArea();

            // Registriere Button-Event-Listener
            this.attachToButtons();

            // Mache Funktionen global verfügbar
            this.exposeGlobalFunctions();

            // Cleanup Observer
            if (this.canvasObserver) {
                this.canvasObserver.disconnect();
                this.canvasObserver = null;
            }

            this.initialized = true;
            console.log('✅ PRODUCTION-READY DESIGN DATA CAPTURE: System initialized successfully');
            console.log('📝 Test with: generateDesignData() in console');

            // Triggere Event für andere Systeme
            this.dispatchInitializationEvent();

        } catch (error) {
            console.error('❌ Initialization error:', error);
            throw error;
        }
    }

    /**
     * Finde alle Fabric.js Canvas-Instanzen
     */
    findFabricCanvases() {
        this.fabricCanvases = [];

        // Methode 1: Canvas-Elemente mit Fabric-Instanz
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

        // Methode 2: Prüfe Window-Objekte für Canvas-Instanzen
        this.searchWindowForCanvases();

        console.log(`📊 Total fabric canvases discovered: ${this.fabricCanvases.length}`);

        if (this.fabricCanvases.length === 0) {
            throw new Error('No fabric canvases found');
        }
    }

    /**
     * Suche Window-Objekt nach Canvas-Instanzen
     */
    searchWindowForCanvases() {
        const canvasVarNames = ['canvas', 'fabricCanvas', 'designerCanvas', 'mainCanvas'];

        canvasVarNames.forEach(varName => {
            if (window[varName] && window[varName].getObjects) {
                console.log(`🎯 Found canvas in window.${varName}`);

                // Prüfe ob bereits hinzugefügt
                const alreadyAdded = this.fabricCanvases.some(fc => fc.canvas === window[varName]);

                if (!alreadyAdded) {
                    this.fabricCanvases.push({
                        canvas: window[varName],
                        element: window[varName].upperCanvasEl || window[varName].lowerCanvasEl,
                        id: `window-${varName}`,
                        isDesignerCanvas: true
                    });
                }
            }
        });
    }

    /**
     * Prüfe ob Canvas-Element zu Designer gehört
     */
    isDesignerCanvas(canvasElement) {
        const parent = canvasElement.closest('.octo-print-designer, .designer-canvas-container, .canvas-container, .mockup-design-area');
        return !!parent;
    }

    /**
     * Finde Mockup Design Area Container
     */
    findMockupDesignArea() {
        const selectors = [
            '.mockup-design-area',
            '.designer-canvas-container',
            '.octo-print-designer',
            '.canvas-container'
        ];

        for (const selector of selectors) {
            const element = document.querySelector(selector);
            if (element) {
                this.mockupDesignArea = element;

                const rect = element.getBoundingClientRect();
                console.log('✅ Mockup design area found:', selector);
                console.log('Dimensions:', {
                    width: element.offsetWidth || rect.width,
                    height: element.offsetHeight || rect.height,
                    rect: {
                        left: rect.left,
                        top: rect.top,
                        width: rect.width,
                        height: rect.height
                    }
                });
                break;
            }
        }

        if (!this.mockupDesignArea) {
            console.warn('⚠️ Mockup design area not found - using fallback');
            // Fallback: Verwende body als Container
            this.mockupDesignArea = document.body;
        }
    }

    /**
     * Registriere Event-Listener für Save/Cart-Buttons
     */
    attachToButtons() {
        const buttonSelectors = [
            '.designer-action-button',
            '.save-design-button',
            '.add-to-cart-button',
            '.designer-cart-button',
            '.designer-save-button',
            '.designer-modal-save',
            'button[data-action="save"]',
            'button[data-action="add-to-cart"]'
        ];

        let attachedButtons = 0;

        buttonSelectors.forEach(selector => {
            const buttons = document.querySelectorAll(selector);
            buttons.forEach(button => {
                button.addEventListener('click', () => {
                    console.log('🎯 Save/Cart button clicked - generating design data...');
                    const designData = this.generateDesignData();
                    console.log('📊 Design Data Generated:', designData);

                    // Triggere Custom Event
                    window.dispatchEvent(new CustomEvent('designDataGenerated', {
                        detail: designData
                    }));
                });
                attachedButtons++;
            });
        });

        console.log('🔗 Attaching to save/cart buttons...');
        console.log(`🔗 Total buttons attached: ${attachedButtons}`);
    }

    /**
     * Mache Funktionen global verfügbar
     */
    exposeGlobalFunctions() {
        // Hauptfunktion global verfügbar machen
        window.generateDesignData = () => this.generateDesignData();

        // Instanz global verfügbar machen (mehrere Namen für Kompatibilität)
        window.comprehensiveCapture = this;
        window.productionReadyCaptureInstance = this;
        window.designDataCapture = this;

        // Zusätzliche Debug-Funktionen
        window.debugDesignCapture = () => {
            return {
                initialized: this.initialized,
                fabricCanvases: this.fabricCanvases.length,
                mockupDesignArea: !!this.mockupDesignArea,
                status: this.status,
                retryCount: this.retryCount
            };
        };

        console.log('🌍 Global functions exposed:', {
            generateDesignData: typeof window.generateDesignData,
            comprehensiveCapture: typeof window.comprehensiveCapture,
            productionReadyCaptureInstance: typeof window.productionReadyCaptureInstance,
            debugDesignCapture: typeof window.debugDesignCapture
        });
    }

    /**
     * HAUPT-FUNKTION: Generiere Design-Daten
     */
    generateDesignData() {
        console.log('🎯 GENERATE DESIGN DATA: Starting data capture...');

        if (!this.initialized) {
            console.error('❌ System not initialized - attempting emergency initialization...');

            // Notfall-Initialisierung versuchen
            if (this.attemptImmediateInitialization()) {
                console.log('✅ Emergency initialization successful');
            } else {
                const errorData = {
                    error: 'System not initialized',
                    template_view_id: 'error',
                    designed_on_area_px: { width: 0, height: 0 },
                    elements: [],
                    timestamp: new Date().toISOString(),
                    debug: {
                        initialized: this.initialized,
                        fabricCanvases: this.fabricCanvases.length,
                        status: this.status
                    }
                };
                console.error('❌ Error data:', errorData);
                return errorData;
            }
        }

        if (this.fabricCanvases.length === 0) {
            console.error('❌ No fabric canvases available');
            return {
                error: 'No fabric canvases found',
                template_view_id: 'none',
                designed_on_area_px: { width: 0, height: 0 },
                elements: [],
                timestamp: new Date().toISOString()
            };
        }

        try {
            // Verwende primären Canvas
            const primaryCanvas = this.fabricCanvases.find(fc => fc.isDesignerCanvas) || this.fabricCanvases[0];
            console.log('🎨 Using primary canvas:', primaryCanvas.id);

            // Template View ID ermitteln
            const template_view_id = this.extractTemplateViewId();

            // Design Area Dimensionen
            const designed_on_area_px = this.getDesignAreaDimensions();

            // Alle Elemente des Canvas erfassen
            const elements = this.captureCanvasElements(primaryCanvas.canvas);

            const designData = {
                template_view_id,
                designed_on_area_px,
                elements,
                timestamp: new Date().toISOString(),
                canvas_info: {
                    id: primaryCanvas.id,
                    width: primaryCanvas.canvas.width,
                    height: primaryCanvas.canvas.height,
                    objects_count: primaryCanvas.canvas.getObjects().length
                }
            };

            // Debug-Ausgabe
            console.log('📊 DESIGN DATA CAPTURED:', designData);
            console.log('📐 Canvas dimensions:', `${designData.canvas_info.width}x${designData.canvas_info.height}`);
            console.log('🎨 Elements captured:', designData.elements.length);

            // Element-Typen analysieren
            const elementTypes = {};
            elements.forEach(el => {
                elementTypes[el.type] = (elementTypes[el.type] || 0) + 1;
            });
            console.log('🎭 Element types:', elementTypes);

            return designData;

        } catch (error) {
            console.error('❌ Error generating design data:', error);
            return {
                error: error.message,
                template_view_id: 'error',
                designed_on_area_px: { width: 0, height: 0 },
                elements: [],
                timestamp: new Date().toISOString(),
                stack: error.stack
            };
        }
    }

    /**
     * Template View ID extrahieren
     */
    extractTemplateViewId() {
        // Versuche verschiedene Quellen für Template View ID

        // 1. URL-Parameter
        if (typeof window !== 'undefined' && window.location && window.location.search) {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('template_view_id')) {
                return urlParams.get('template_view_id');
            }
        }

        // 2. Data-Attribute
        const templateElement = document.querySelector('[data-template-view-id]');
        if (templateElement) {
            return templateElement.getAttribute('data-template-view-id');
        }

        // 3. Mockup Design Area Attribute
        if (this.mockupDesignArea && this.mockupDesignArea.dataset && this.mockupDesignArea.dataset.templateViewId) {
            return this.mockupDesignArea.dataset.templateViewId;
        }

        // 4. Produkt-ID aus URL extrahieren
        let productId = 'unknown';
        if (typeof window !== 'undefined' && window.location && window.location.pathname) {
            const pathParts = window.location.pathname.split('/');
            productId = pathParts[pathParts.length - 1] || 'unknown';
        }

        // 5. Fallback mit Timestamp
        return `template-${productId}-front`;
    }

    /**
     * Design Area Dimensionen ermitteln
     */
    getDesignAreaDimensions() {
        if (this.mockupDesignArea) {
            const rect = this.mockupDesignArea.getBoundingClientRect();
            return {
                width: Math.round(this.mockupDesignArea.offsetWidth || rect.width),
                height: Math.round(this.mockupDesignArea.offsetHeight || rect.height)
            };
        }

        // Fallback: Verwende Canvas-Dimensionen
        if (this.fabricCanvases.length > 0) {
            const canvas = this.fabricCanvases[0].canvas;
            return {
                width: canvas.width,
                height: canvas.height
            };
        }

        // Letzter Fallback
        return { width: 800, height: 600 };
    }

    /**
     * Alle Canvas-Elemente erfassen
     */
    captureCanvasElements(fabricCanvas) {
        const objects = fabricCanvas.getObjects();
        const elements = [];

        objects.forEach((obj, index) => {
            const element = this.processCanvasObject(obj, index);
            if (element) {
                elements.push(element);
            }
        });

        return elements;
    }

    /**
     * Einzelnes Canvas-Objekt verarbeiten
     */
    processCanvasObject(obj, index) {
        // Koordinaten relativ zur Mockup Design Area transformieren
        const coords = this.transformCoordinates(obj.left || 0, obj.top || 0);

        // Basis-Eigenschaften
        const baseElement = {
            x: Math.round(coords.x),
            y: Math.round(coords.y),
            width: Math.round((obj.width || 0) * (obj.scaleX || 1)),
            height: Math.round((obj.height || 0) * (obj.scaleY || 1)),
            scaleX: Number((obj.scaleX || 1).toFixed(3)),
            scaleY: Number((obj.scaleY || 1).toFixed(3)),
            angle: Number((obj.angle || 0).toFixed(1))
        };

        // Typ-spezifische Verarbeitung
        switch (obj.type) {
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

            case 'image':
                return {
                    type: 'image',
                    src: obj.src || obj._element?.src || '',
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
                    x1: Math.round((obj.x1 || 0) + coords.x),
                    y1: Math.round((obj.y1 || 0) + coords.y),
                    x2: Math.round((obj.x2 || 0) + coords.x),
                    y2: Math.round((obj.y2 || 0) + coords.y),
                    stroke: obj.stroke || '#000000',
                    strokeWidth: obj.strokeWidth || 1,
                    ...baseElement
                };

            case 'polygon':
            case 'polyline':
                return {
                    type: obj.type,
                    points: obj.points ? obj.points.map(p => ({
                        x: Math.round(p.x + coords.x),
                        y: Math.round(p.y + coords.y)
                    })) : [],
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
                    objects: obj.getObjects().map((subObj, subIndex) =>
                        this.processCanvasObject(subObj, subIndex)
                    ).filter(Boolean),
                    ...baseElement
                };

            default:
                console.warn(`⚠️ Unknown object type: ${obj.type}`);
                return {
                    type: 'unknown',
                    originalType: obj.type,
                    ...baseElement
                };
        }
    }

    /**
     * Koordinaten relativ zur Mockup Design Area transformieren
     */
    transformCoordinates(canvasX, canvasY) {
        if (!this.mockupDesignArea || this.fabricCanvases.length === 0) {
            return { x: canvasX, y: canvasY };
        }

        try {
            const canvasElement = this.fabricCanvases[0].element;
            if (!canvasElement) {
                return { x: canvasX, y: canvasY };
            }

            const canvasRect = canvasElement.getBoundingClientRect();
            const containerRect = this.mockupDesignArea.getBoundingClientRect();

            const offsetX = canvasRect.left - containerRect.left;
            const offsetY = canvasRect.top - containerRect.top;

            return {
                x: canvasX + offsetX,
                y: canvasY + offsetY
            };

        } catch (error) {
            console.warn('⚠️ Coordinate transformation failed:', error.message);
            return { x: canvasX, y: canvasY };
        }
    }

    /**
     * Behandle Initialisierungs-Fehler
     */
    handleInitializationFailure() {
        console.error('❌ INITIALIZATION FAILED');
        console.error('System Status:', this.status);
        console.error('Canvas Elements:', document.querySelectorAll('canvas').length);
        console.error('Fabric Available:', typeof window.fabric !== 'undefined');

        // Erstelle Fehler-Event
        window.dispatchEvent(new CustomEvent('designCaptureInitializationFailed', {
            detail: {
                status: this.status,
                retryCount: this.retryCount,
                maxRetries: this.maxRetries
            }
        }));

        // Fallback: Mache wenigstens grundlegende Funktionen verfügbar
        window.generateDesignData = () => ({
            error: 'Initialization failed',
            template_view_id: 'failed',
            designed_on_area_px: { width: 0, height: 0 },
            elements: [],
            timestamp: new Date().toISOString()
        });
    }

    /**
     * Triggere Initialisierungs-Event
     */
    dispatchInitializationEvent() {
        window.dispatchEvent(new CustomEvent('designCaptureReady', {
            detail: {
                fabricCanvases: this.fabricCanvases.length,
                mockupDesignArea: !!this.mockupDesignArea,
                retryCount: this.retryCount
            }
        }));
    }

    /**
     * Sleep-Hilfsfunktion
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Test-Funktion für Debugging
     */
    test() {
        console.log('🧪 Running test of design data capture...');
        const data = this.generateDesignData();
        console.log('🧪 Test result:', data);
        return data;
    }
}

// Auto-Initialisierung nur wenn DOM bereits geladen oder Browser-Umgebung
if (typeof window !== 'undefined') {
    // Verwende verschiedene Initialisierungs-Strategien
    if (document.readyState === 'loading') {
        // DOM lädt noch - warte auf DOMContentLoaded
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(() => {
                console.log('🚀 Auto-initializing Production-Ready Design Data Capture...');
                const instance = new ProductionReadyDesignDataCapture();

                // Stelle sicher, dass die Instanz global verfügbar ist
                window.productionReadyCaptureInstance = instance;
                window.comprehensiveCapture = instance;
                window.designDataCapture = instance;

                console.log('✅ Auto-initialization complete - instance available globally');
            }, 100); // Kurze Verzögerung für andere Scripts
        });
    } else {
        // DOM bereits geladen - initialisiere sofort
        setTimeout(() => {
            console.log('🚀 Auto-initializing Production-Ready Design Data Capture (DOM ready)...');
            const instance = new ProductionReadyDesignDataCapture();

            // Stelle sicher, dass die Instanz global verfügbar ist
            window.productionReadyCaptureInstance = instance;
            window.comprehensiveCapture = instance;
            window.designDataCapture = instance;

            console.log('✅ Auto-initialization complete - instance available globally');
        }, 100);
    }
}

// Export für Node.js Testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProductionReadyDesignDataCapture;
}

// Mache für Node.js global verfügbar
if (typeof global !== 'undefined' && typeof window === 'undefined') {
    global.ProductionReadyDesignDataCapture = ProductionReadyDesignDataCapture;
}