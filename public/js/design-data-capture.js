/**
 * Design Data Capture System
 * Schritt 2: Frontend – Saubere Datenerfassung im Canvas
 *
 * Implementiert die generateDesignData() Funktion für präzise Canvas-Datenerfassung
 * mit korrekter Koordinaten-Transformation und vollständiger JSON-Struktur.
 */

class DesignDataCapture {
    constructor(designerWidget) {
        this.designer = designerWidget;
        this.fabricCanvas = designerWidget.fabricCanvas;
        this.mockupDesignAreaContainer = document.querySelector('.mockup-design-area') ||
                                       document.querySelector('.designer-canvas-container') ||
                                       document.querySelector('#octo-print-designer-canvas').parentNode;

        console.log('DesignDataCapture initialized:', {
            fabricCanvas: !!this.fabricCanvas,
            mockupContainer: !!this.mockupDesignAreaContainer
        });
    }

    /**
     * Hauptfunktion: Generiert vollständige Design-Daten im geforderten JSON-Format
     * @returns {Object} JSON-Objekt mit allen Canvas-Elementen und Metadaten
     */
    generateDesignData() {
        if (!this.fabricCanvas) {
            console.error('Fabric Canvas not available');
            return null;
        }

        // 1. Template View ID bestimmen
        const templateViewId = this.getTemplateViewId();

        // 2. Design Area Dimensionen erfassen
        const designedOnAreaPx = this.getDesignAreaDimensions();

        // 3. Alle Canvas-Objekte erfassen und transformieren
        const elements = this.extractCanvasElements();

        // 4. JSON-Struktur erstellen
        const designData = {
            template_view_id: templateViewId,
            designed_on_area_px: designedOnAreaPx,
            elements: elements
        };

        // 5. Debug-Logging (KRITISCH für Akzeptanzkriterien)
        console.log('Design Data Captured:', designData);

        return designData;
    }

    /**
     * Ermittelt die Template View ID aus aktueller Selektion
     * @returns {string} Template View ID
     */
    getTemplateViewId() {
        if (this.designer.currentView && this.designer.activeTemplateId) {
            return `${this.designer.activeTemplateId}-${this.designer.currentView}`;
        }

        // Fallback: Versuche aus DOM zu extrahieren
        const activeTemplate = document.querySelector('.template-item.active');
        const activeView = document.querySelector('.view-item.active');

        if (activeTemplate && activeView) {
            const templateId = activeTemplate.dataset.templateId || 'template-default';
            const viewId = activeView.dataset.viewId || 'view-default';
            return `${templateId}-${viewId}`;
        }

        return 'default-view';
    }

    /**
     * Erfasst die Dimensionen der Design Area relativ zum mockup_design_area Container
     * @returns {Object} Width und Height der Design Area
     */
    getDesignAreaDimensions() {
        if (!this.fabricCanvas) {
            return { width: 0, height: 0 };
        }

        return {
            width: this.fabricCanvas.width,
            height: this.fabricCanvas.height
        };
    }

    /**
     * Extrahiert alle Canvas-Objekte und transformiert sie in die geforderte JSON-Struktur
     * @returns {Array} Array von Element-Objekten
     */
    extractCanvasElements() {
        if (!this.fabricCanvas) {
            return [];
        }

        const objects = this.fabricCanvas.getObjects();
        const elements = [];

        objects.forEach(obj => {
            // Skip internal objects (safe zones, printing zones, etc.)
            if (this.isInternalObject(obj)) {
                return;
            }

            const element = this.transformObjectToElement(obj);
            if (element) {
                elements.push(element);
            }
        });

        return elements;
    }

    /**
     * Prüft ob ein Objekt ein internes Canvas-Element ist (keine User-Daten)
     * @param {fabric.Object} obj Fabric.js Objekt
     * @returns {boolean} True wenn internes Objekt
     */
    isInternalObject(obj) {
        if (!obj) return true;

        // Interne Elemente über Eigenschaften identifizieren
        if (obj.isInternal ||
            obj.selectable === false ||
            obj.evented === false ||
            obj.type === 'rect' && obj.fill === 'rgba(0,0,0,0.1)' || // Safe zones
            obj.type === 'rect' && obj.stroke === '#ff0000') { // Printing zones
            return true;
        }

        // Interne Elemente über CSS-Klassen oder IDs
        if (obj.id && (obj.id.includes('safe-zone') ||
                      obj.id.includes('printing-zone') ||
                      obj.id.includes('template-'))) {
            return true;
        }

        return false;
    }

    /**
     * Transformiert ein Fabric.js Objekt in das geforderte JSON-Element-Format
     * @param {fabric.Object} obj Fabric.js Objekt
     * @returns {Object|null} Element-Objekt oder null
     */
    transformObjectToElement(obj) {
        if (!obj) return null;

        // Koordinaten-Transformation: Canvas → mockup_design_area
        const transformedCoords = this.transformCoordinates(obj.left, obj.top);

        // Basis-Element-Struktur
        const baseElement = {
            x: Math.round(transformedCoords.x),
            y: Math.round(transformedCoords.y),
            width: Math.round(obj.width * obj.scaleX),
            height: Math.round(obj.height * obj.scaleY),
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            angle: obj.angle
        };

        // Element-Typ spezifische Eigenschaften
        if (obj.type === 'image') {
            return {
                type: 'image',
                src: obj.src || obj._originalElement?.src || '',
                ...baseElement
            };
        } else if (obj.type === 'i-text' || obj.type === 'text') {
            return {
                type: 'text',
                text: obj.text || '',
                fontFamily: obj.fontFamily || 'Arial',
                fontSize: obj.fontSize || 24,
                fill: obj.fill || '#000000',
                ...baseElement
            };
        } else if (obj.type === 'rect') {
            return {
                type: 'rectangle',
                fill: obj.fill || '#000000',
                stroke: obj.stroke || '',
                strokeWidth: obj.strokeWidth || 0,
                ...baseElement
            };
        } else if (obj.type === 'circle') {
            return {
                type: 'circle',
                radius: obj.radius || 0,
                fill: obj.fill || '#000000',
                stroke: obj.stroke || '',
                strokeWidth: obj.strokeWidth || 0,
                ...baseElement
            };
        } else if (obj.type === 'line') {
            return {
                type: 'line',
                x1: obj.x1,
                y1: obj.y1,
                x2: obj.x2,
                y2: obj.y2,
                stroke: obj.stroke || '#000000',
                strokeWidth: obj.strokeWidth || 1,
                ...baseElement
            };
        }

        // Fallback für unbekannte Objekt-Typen
        return {
            type: obj.type || 'unknown',
            ...baseElement
        };
    }

    /**
     * KRITISCH: Koordinaten-Transformation von Canvas zu mockup_design_area
     * Transformiert Canvas-Koordinaten in relative Koordinaten zur oberen linken Ecke
     * des mockup_design_area-Containers
     *
     * @param {number} canvasX Canvas X-Koordinate
     * @param {number} canvasY Canvas Y-Koordinate
     * @returns {Object} Transformierte Koordinaten {x, y}
     */
    transformCoordinates(canvasX, canvasY) {
        if (!this.fabricCanvas || !this.mockupDesignAreaContainer) {
            return { x: canvasX, y: canvasY };
        }

        // Canvas Element Position
        const canvasElement = this.fabricCanvas.upperCanvasEl;
        const canvasRect = canvasElement.getBoundingClientRect();

        // mockup_design_area Container Position
        const containerRect = this.mockupDesignAreaContainer.getBoundingClientRect();

        // Relative Offsets berechnen
        const offsetX = canvasRect.left - containerRect.left;
        const offsetY = canvasRect.top - containerRect.top;

        // Finale Transformation: Canvas-Koordinaten + Canvas-Offset = mockup_design_area relative
        const transformedX = canvasX + offsetX;
        const transformedY = canvasY + offsetY;

        return {
            x: transformedX,
            y: transformedY
        };
    }

    /**
     * Integration in bestehende saveDesign-Funktion
     * Hook-Funktion für automatische Datenerfassung bei Save-Events
     */
    hookIntoSaveDesign() {
        if (!window.DesignerWidget || !this.designer) {
            console.warn('Designer Widget not available for hooking');
            return;
        }

        // Original saveDesign Funktion erweitern
        const originalCollectDesignState = this.designer.collectDesignState;
        const self = this;

        this.designer.collectDesignState = function() {
            // Originale Daten sammeln
            const originalData = originalCollectDesignState.call(this);

            // Neue generateDesignData hinzufügen
            const capturedDesignData = self.generateDesignData();

            // Kombiniere beide Datenstrukturen
            return {
                ...originalData,
                capturedCanvasData: capturedDesignData
            };
        };

        console.log('Design Data Capture successfully hooked into saveDesign');
    }

    /**
     * Event Listener für "Speichern" und "In den Warenkorb" Buttons
     * Erfüllt Akzeptanzkriterium: JSON wird bei Button-Klicks generiert
     */
    attachSaveButtonListeners() {
        // Speichern Button
        const saveButton = document.querySelector('.designer-action-button');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                const designData = this.generateDesignData();
                console.log('Save Button clicked - Design Data Generated:', designData);
            });
        }

        // In den Warenkorb Button (falls vorhanden)
        const cartButton = document.querySelector('.add-to-cart-button, .designer-cart-button');
        if (cartButton) {
            cartButton.addEventListener('click', () => {
                const designData = this.generateDesignData();
                console.log('Add to Cart clicked - Design Data Generated:', designData);
            });
        }

        // Modal Save Button (im Save Dialog)
        const modalSaveButton = document.querySelector('.designer-modal-save');
        if (modalSaveButton) {
            modalSaveButton.addEventListener('click', () => {
                const designData = this.generateDesignData();
                console.log('Modal Save clicked - Design Data Generated:', designData);
            });
        }
    }
}

// Auto-Initialisierung wenn Designer Widget verfügbar ist
document.addEventListener('DOMContentLoaded', function() {
    console.log('🎯 DESIGN DATA CAPTURE: DOM loaded, waiting for designer widget...');

    // Warte auf Designer Widget Initialisierung
    const initializeCapture = () => {
        const designerContainer = document.querySelector('.octo-print-designer');
        if (designerContainer && window.designerWidgetInstance) {
            console.log('🎯 DESIGN DATA CAPTURE: Designer container and widget instance found');
            const capture = new DesignDataCapture(window.designerWidgetInstance);
            capture.hookIntoSaveDesign();
            capture.attachSaveButtonListeners();

            // Globaler Zugriff für Tests
            window.designDataCapture = capture;

            console.log('✅ DESIGN DATA CAPTURE: System initialized successfully');
            return true;
        }
        return false;
    };

    // Try immediate initialization
    if (initializeCapture()) {
        return;
    }

    // Listen for designerWidgetExposed event
    window.addEventListener('designerWidgetExposed', function(event) {
        console.log('🎯 DESIGN DATA CAPTURE: Received designerWidgetExposed event');
        setTimeout(initializeCapture, 100); // Small delay to ensure instance is created
    });

    // Fallback: Retry periodically
    let attempts = 0;
    const maxAttempts = 20;
    const retryCapture = setInterval(() => {
        attempts++;
        console.log('🔄 DESIGN DATA CAPTURE: Initialization attempt', attempts);

        if (initializeCapture()) {
            clearInterval(retryCapture);
        } else if (attempts >= maxAttempts) {
            console.error('❌ DESIGN DATA CAPTURE: Failed to initialize after', maxAttempts, 'attempts');
            console.error('Debug info:', {
                designerContainer: !!document.querySelector('.octo-print-designer'),
                designerWidgetInstance: !!window.designerWidgetInstance,
                DesignerWidget: !!window.DesignerWidget
            });
            clearInterval(retryCapture);
        }
    }, 500);
});

// Export für Modulnutzung
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DesignDataCapture;
}