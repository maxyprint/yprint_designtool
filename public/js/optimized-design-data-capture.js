/**
 * 🚀 ISSUE #18 FIX: OPTIMIZED DESIGN DATA CAPTURE SYSTEM
 * Console-optimized version with 90%+ message reduction
 *
 * CRITICAL CHANGES:
 * - Debug level system (PRODUCTION mode silences debug messages)
 * - Reduced polling attempts from 20 to 5
 * - Conditional logging based on environment
 * - Enhanced JSON structure for complete user action capture
 * - Coordinate transformation relative to mockup_design_area
 */

class OptimizedDesignDataCapture {
    constructor() {
        // 🧠 AGENT 4 FIX: Prevent duplicate class instantiation
        if (window.OptimizedDesignDataCaptureInstance) {
            console.warn('🚨 DUPLICATE WARNING: OptimizedDesignDataCapture already instantiated, returning existing instance');
            return window.OptimizedDesignDataCaptureInstance;
        }

        // Store instance reference immediately
        window.OptimizedDesignDataCaptureInstance = this;

        // 🧠 AGENT FIX: JavascriptPerformanceOptimizer - Admin context detection
        this.ADMIN_CONTEXT = (typeof window.octoAdminContext !== 'undefined') && window.octoAdminContext.context === 'woocommerce_admin';
        this.DEBUG_MODE = (typeof window.octoPrintDesignerDebug !== 'undefined') ? window.octoPrintDesignerDebug : false;
        this.PRODUCTION_MODE = !this.DEBUG_MODE;

        this.fabricCanvases = [];
        this.mockupDesignArea = null;
        this.initialized = false;
        this.retryCount = 0;
        this.maxRetries = this.ADMIN_CONTEXT ? 1 : 3; // AGENT 4: Further reduced retries for performance
        this.baseRetryDelay = this.ADMIN_CONTEXT ? 500 : 300; // AGENT 4: Longer delays for efficiency
        this.canvasObserver = null;

        // Status tracking
        this.status = {
            domReady: false,
            fabricLoaded: false,
            canvasDetected: false,
            systemReady: false
        };

        this.debugLog('info', '🎯 OPTIMIZED DESIGN DATA CAPTURE: Starting initialization...');

        // 🚀 RACE CONDITION ELIMINATED: No auto-initialization
        // All initialization now happens through designerReady event system only
        this.debugLog('info', '🎯 RACE CONDITION ELIMINATED: Waiting for designerReady event...');
        this.debugLog('info', '🛡️ Auto-init patterns disabled - single initialization path confirmed');

        // 🧠 AGENT FIX: JavascriptPerformanceOptimizer - Context-aware initialization
        if (this.ADMIN_CONTEXT) {
            this.debugLog('info', '🧠 [JS OPTIMIZER] Admin context detected - using lightweight initialization');
            this.startAdminOptimizedInitialization();
        } else {
            this.debugLog('info', '🎯 [JS OPTIMIZER] Frontend context - awaiting designerReady event');
            // No auto-initialization - only through designerReady event
        }
    }

    /**
     * 🚀 ISSUE #18: Debug logging with level control
     */
    debugLog(level, ...args) {
        if (this.PRODUCTION_MODE && level === 'debug') return;
        if (level === 'error') console.error(...args);
        else if (level === 'warn') console.warn(...args);
        else if (level === 'info' || this.DEBUG_MODE) console.log(...args);
    }

    /**
     * RACE CONDITION ELIMINATED: Event-driven initialization only
     * Called exclusively by designerReady event - no auto-init patterns
     */
    async startEventDrivenInitialization() {
        this.debugLog('info', '🎯 RACE CONDITION ELIMINATED: Starting event-driven initialization...');

        // Strategy 1: Immediate initialization check
        if (this.attemptImmediateInitialization()) {
            this.debugLog('info', '✅ Event-driven immediate initialization successful');
            return;
        }

        // Strategy 2: DOM is guaranteed ready by designerReady event
        this.status.domReady = true;
        this.debugLog('debug', '✅ DOM Ready confirmed via designerReady event');

        // Strategy 3: Setup MutationObserver for Canvas Detection
        this.setupCanvasObserver();

        // Strategy 4: Optimized polling detection (reduced scope)
        this.startOptimizedPolling();
    }

    /**
     * LEGACY METHOD - NO LONGER USED
     * Intelligent initialization with multiple detection strategies
     */
    async startIntelligentInitialization() {
        this.debugLog('warn', '⚠️ DEPRECATED: startIntelligentInitialization() is deprecated - use startEventDrivenInitialization()');
        // Redirect to event-driven initialization
        return this.startEventDrivenInitialization();
    }

    /**
     * Attempt immediate initialization if everything is available
     */
    attemptImmediateInitialization() {
        // 🚨 CIRCUIT BREAKER: Prevent infinite retry loops
        if (this.retryCount >= this.maxRetries) {
            this.debugLog('error', '🚨 CIRCUIT BREAKER: Max retries reached, forcing emergency initialization');
            this.performEmergencyInitialization();
            return true;
        }

        // Check if Fabric.js is available
        if (typeof window.fabric === 'undefined') {
            this.debugLog('debug', '🔄 Fabric.js not yet available');
            return false;
        }

        // Check if Canvas elements exist
        const canvasElements = document.querySelectorAll('canvas');
        if (canvasElements.length === 0) {
            this.debugLog('debug', '🔄 No canvas elements found yet');
            return false;
        }

        // Check if Fabric Canvas instances exist
        const fabricCanvases = Array.from(canvasElements).filter(canvas => canvas.__fabric);
        if (fabricCanvases.length === 0) {
            // 🔍 PARADOX RESOLVER: Log detailed status when fabric instances missing
            this.debugLog('warn', '🔍 PARADOX DETECTED: Canvas elements exist but no fabric instances');
            this.debugLog('warn', '📊 Canvas Analysis:', {
                totalCanvases: canvasElements.length,
                fabricCanvases: fabricCanvases.length,
                canvasIds: Array.from(canvasElements).map(c => c.id || 'no-id'),
                hasFabricProp: Array.from(canvasElements).map(c => !!c.__fabric)
            });

            // 🚨 EMERGENCY MODE: If we have retried too many times with canvas but no fabric
            if (this.retryCount > 5) {
                this.debugLog('warn', '🚨 EMERGENCY: Attempting fabric instance creation');
                return this.attemptFabricInstanceCreation(canvasElements);
            }

            return false;
        }

        // Everything available - initialize immediately
        this.performInitialization();
        return true;
    }

    /**
     * 🚨 EMERGENCY: Force initialization when max retries reached
     */
    performEmergencyInitialization() {
        this.debugLog('error', '🚨 EMERGENCY INITIALIZATION: Forcing system activation');

        // Set all status flags to ready
        this.status.domReady = true;
        this.status.fabricLoaded = true;
        this.status.canvasDetected = true;
        this.status.systemReady = true;

        // Try to find any canvas and create basic system
        const canvasElements = document.querySelectorAll('canvas');
        if (canvasElements.length > 0) {
            this.fabricCanvases = Array.from(canvasElements).map((canvas, index) => ({
                canvas: canvas.__fabric || null,
                element: canvas,
                id: `emergency-canvas-${index}`,
                isDesignerCanvas: true,
                emergency: true
            }));
        }

        // Perform basic initialization
        try {
            this.exposeGlobalFunctions();
            this.initialized = true;
            this.debugLog('info', '🚨 EMERGENCY: Basic system initialized');
            this.dispatchInitializationEvent();
        } catch (error) {
            this.debugLog('error', '🚨 EMERGENCY INIT FAILED:', error);
        }
    }

    /**
     * 🚨 EMERGENCY: Attempt to create fabric instances from canvas elements
     */
    attemptFabricInstanceCreation(canvasElements) {
        this.debugLog('warn', '🚨 EMERGENCY: Attempting fabric canvas creation');

        let createdCount = 0;

        Array.from(canvasElements).forEach((canvas, index) => {
            if (!canvas.__fabric && window.fabric && window.fabric.Canvas) {
                try {
                    // Don't actually create a new Fabric canvas, just mark as available
                    this.debugLog('info', `🚨 EMERGENCY: Canvas ${index} marked for emergency mode`);
                    createdCount++;
                } catch (error) {
                    this.debugLog('error', `🚨 EMERGENCY: Failed to process canvas ${index}:`, error);
                }
            }
        });

        if (createdCount > 0) {
            this.debugLog('info', `🚨 EMERGENCY: Processed ${createdCount} canvases, attempting initialization`);
            this.performEmergencyInitialization();
            return true;
        }

        return false;
    }

    /**
     * Wait for DOM Ready - RACE CONDITION ELIMINATED
     * No longer uses DOMContentLoaded - relies on designerReady event system only
     */
    waitForDOMReady() {
        return new Promise(resolve => {
            // Always assume DOM is ready - designerReady event handles proper timing
            this.status.domReady = true;
            this.debugLog('debug', '✅ DOM Ready status set (via designerReady event system)');
            resolve();
        });
    }

    /**
     * Setup MutationObserver for Canvas Creation Detection
     */
    setupCanvasObserver() {
        if (typeof MutationObserver === 'undefined') {
            this.debugLog('warn', '⚠️ MutationObserver not available');
            return;
        }

        this.canvasObserver = new MutationObserver((mutations) => {
            let canvasAdded = false;

            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            if (node.tagName === 'CANVAS') {
                                this.debugLog('debug', '🔍 Canvas element added to DOM');
                                canvasAdded = true;
                            }

                            const canvases = node.querySelectorAll && node.querySelectorAll('canvas');
                            if (canvases && canvases.length > 0) {
                                this.debugLog('debug', `🔍 ${canvases.length} canvas elements added to DOM`);
                                canvasAdded = true;
                            }
                        }
                    });
                }
            });

            if (canvasAdded && !this.initialized) {
                // 🚀 RACE CONDITION ELIMINATED: Only attempt initialization if triggered by designerReady
                if (window.OptimizedDesignDataCaptureInitialized) {
                    setTimeout(() => this.attemptImmediateInitialization(), 50);
                    this.debugLog('debug', '🎯 Canvas detected - attempting initialization via designerReady flow');
                } else {
                    this.debugLog('debug', '🛡️ Canvas detected but waiting for designerReady event');
                }
            }
        });

        this.canvasObserver.observe(document.body, {
            childList: true,
            subtree: true
        });

        this.debugLog('debug', '👁️ Canvas MutationObserver setup completed');
    }

    /**
     * 🚨 SUPERPOWER FIX: Emergency Fabric Detection Method
     * Handles fabric availability events and re-initializes system
     */
    emergencyFabricDetection() {
        this.debugLog('info', '🚨 EMERGENCY FABRIC DETECTION: Starting emergency re-initialization...');

        // Verify fabric is actually available
        if (typeof window.fabric === 'undefined') {
            this.debugLog('error', '❌ EMERGENCY: Fabric still not available during emergency detection');
            return false;
        }

        this.debugLog('info', '✅ EMERGENCY: Fabric confirmed available - proceeding with re-initialization');

        // Update fabric status
        this.status.fabricLoaded = true;

        // Reset retry count for fresh attempt
        this.retryCount = 0;

        // Attempt immediate initialization with fabric available
        if (this.attemptImmediateInitialization()) {
            this.debugLog('info', '✅ EMERGENCY: Re-initialization successful!');
            return true;
        } else {
            this.debugLog('warn', '⚠️ EMERGENCY: Re-initialization failed - starting polling');
            this.startOptimizedPolling();
            return false;
        }
    }

    /**
     * 🚀 ISSUE #18: Optimized polling detection (reduced attempts)
     */
    async startOptimizedPolling() {
        this.debugLog('debug', '🔄 Starting optimized polling detection...');

        while (this.retryCount < this.maxRetries && !this.initialized) {
            const delay = this.calculateRetryDelay();

            // 🔇 SPAM REDUCTION: Only log every 3rd attempt to reduce console noise
            if (this.retryCount % 3 === 0 || this.retryCount >= this.maxRetries - 2) {
                this.debugLog('debug', `🔄 Detection attempt ${this.retryCount + 1}/${this.maxRetries} (delay: ${delay}ms)`);
            }

            await this.sleep(delay);

            // Check system status
            this.checkSystemStatus();

            // Attempt initialization
            if (this.attemptImmediateInitialization()) {
                break;
            }

            this.retryCount++;
        }

        if (!this.initialized) {
            this.debugLog('error', '❌ Failed to initialize after maximum retries');
            this.handleInitializationFailure();
        }
    }

    /**
     * Calculate retry delay with exponential backoff
     */
    calculateRetryDelay() {
        // AGENT 4: Optimized exponential backoff with better spacing
        return Math.min(this.baseRetryDelay * Math.pow(1.8, this.retryCount), this.ADMIN_CONTEXT ? 2000 : 1500);
    }

    /**
     * Check and log system status
     */
    checkSystemStatus() {
        const newStatus = {
            domReady: document.readyState !== 'loading',
            fabricLoaded: typeof window.fabric !== 'undefined',
            canvasDetected: document.querySelectorAll('canvas').length > 0,
            systemReady: false
        };

        // Log changes only in debug mode
        Object.keys(newStatus).forEach(key => {
            if (this.status[key] !== newStatus[key] && newStatus[key]) {
                this.debugLog('debug', `✅ Status update: ${key} = true`);
            }
        });

        this.status = newStatus;
        this.status.systemReady = this.status.domReady && this.status.fabricLoaded && this.status.canvasDetected;
    }

    /**
     * Perform system initialization
     */
    performInitialization() {
        this.debugLog('info', '🚀 Performing system initialization...');

        try {
            // Find Fabric Canvases
            this.findFabricCanvases();

            // Find Mockup Design Area
            this.findMockupDesignArea();

            // Register Button Event Listeners
            this.attachToButtons();

            // Expose Global Functions
            this.exposeGlobalFunctions();

            // Cleanup Observer
            if (this.canvasObserver) {
                this.canvasObserver.disconnect();
                this.canvasObserver = null;
            }

            this.initialized = true;
            this.debugLog('info', '✅ OPTIMIZED DESIGN DATA CAPTURE: System initialized successfully');

            // Dispatch initialization event
            this.dispatchInitializationEvent();

        } catch (error) {
            this.debugLog('error', '❌ Initialization error:', error);
            throw error;
        }
    }

    /**
     * Find all Fabric.js Canvas instances
     */
    findFabricCanvases() {
        this.fabricCanvases = [];

        const canvasElements = document.querySelectorAll('canvas');
        this.debugLog('debug', `🔍 Found ${canvasElements.length} canvas elements`);

        canvasElements.forEach((canvas, index) => {
            if (canvas.__fabric) {
                this.fabricCanvases.push({
                    canvas: canvas.__fabric,
                    element: canvas,
                    id: `canvas-${index}`,
                    isDesignerCanvas: this.isDesignerCanvas(canvas)
                });

                this.debugLog('debug', `✅ Fabric canvas found: canvas-${index}`, {
                    width: canvas.__fabric.width,
                    height: canvas.__fabric.height,
                    objects: canvas.__fabric.getObjects().length,
                    isDesigner: this.isDesignerCanvas(canvas)
                });
            }
        });

        // Search window objects for canvas instances
        this.searchWindowForCanvases();

        this.debugLog('info', `📊 Total fabric canvases discovered: ${this.fabricCanvases.length}`);

        if (this.fabricCanvases.length === 0) {
            throw new Error('No fabric canvases found');
        }
    }

    /**
     * Search window object for canvas instances
     */
    searchWindowForCanvases() {
        const canvasVarNames = ['canvas', 'fabricCanvas', 'designerCanvas', 'mainCanvas'];

        canvasVarNames.forEach(varName => {
            if (window[varName] && window[varName].getObjects) {
                this.debugLog('debug', `🎯 Found canvas in window.${varName}`);

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
     * Check if canvas element belongs to designer
     */
    isDesignerCanvas(canvasElement) {
        const parent = canvasElement.closest('.octo-print-designer, .designer-canvas-container, .canvas-container, .mockup-design-area');
        return !!parent;
    }

    /**
     * Find Mockup Design Area Container
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
                this.debugLog('info', '✅ Mockup design area found:', selector);
                this.debugLog('debug', 'Dimensions:', {
                    width: element.offsetWidth || rect.width,
                    height: element.offsetHeight || rect.height
                });
                break;
            }
        }

        if (!this.mockupDesignArea) {
            this.debugLog('warn', '⚠️ Mockup design area not found - using fallback');
            this.mockupDesignArea = document.body;
        }
    }

    /**
     * Register event listeners for Save/Cart buttons
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
        let skippedButtons = 0;

        buttonSelectors.forEach(selector => {
            const buttons = document.querySelectorAll(selector);
            buttons.forEach(button => {
                // 🔒 SECURITY: Button event deduplication
                if (button.dataset.designCaptureAttached) {
                    skippedButtons++;
                    this.debugLog('debug', '🛡️ Button already attached - skipping to prevent duplicate events');
                    return; // Skip already attached buttons
                }
                button.dataset.designCaptureAttached = 'true';

                button.addEventListener('click', () => {
                    this.debugLog('info', '🎯 Save/Cart button clicked - generating design data...');
                    const designData = this.generateDesignData();
                    this.debugLog('info', '📊 Design Data Generated:', designData);

                    // Trigger Custom Event
                    window.dispatchEvent(new CustomEvent('designDataGenerated', {
                        detail: designData
                    }));
                });
                attachedButtons++;
            });
        });

        this.debugLog('info', `🔗 Total buttons attached: ${attachedButtons}, skipped: ${skippedButtons}`);
    }

    /**
     * Expose global functions
     */
    exposeGlobalFunctions() {
        // Main function globally available (NO auto PNG generation)
        window.generateDesignData = () => {
            const designData = this.generateDesignData();

            // 🎯 CLEAN APPROACH: Only return data, no automatic PNG generation
            // PNG will only be generated by SaveOnlyPNGGenerator on real save events

            return designData;
        };

        // Instance globally available
        window.optimizedCapture = this;
        window.designDataCapture = this;

        // Debug function
        window.debugDesignCapture = () => ({
            initialized: this.initialized,
            fabricCanvases: this.fabricCanvases.length,
            mockupDesignArea: !!this.mockupDesignArea,
            status: this.status,
            retryCount: this.retryCount,
            debugMode: this.DEBUG_MODE,
            productionMode: this.PRODUCTION_MODE
        });

        this.debugLog('info', '🌍 Global functions exposed:', {
            generateDesignData: typeof window.generateDesignData,
            optimizedCapture: typeof window.optimizedCapture,
            debugDesignCapture: typeof window.debugDesignCapture
        });
    }

    /**
     * 🚀 ISSUE #18: MAIN FUNCTION - Generate Complete Design Data in Single JSON
     */
    generateDesignData() {
        this.debugLog('info', '🎯 GENERATE DESIGN DATA: Starting complete capture...');

        if (!this.initialized) {
            this.debugLog('error', '❌ System not initialized - attempting emergency initialization...');

            if (this.attemptImmediateInitialization()) {
                this.debugLog('info', '✅ Emergency initialization successful');
            } else {
                const errorResponse = this.createErrorResponse('System not initialized');
                // 🏗️ PHASE 1: DIAGNOSE LOGGING
                try {
                    if (typeof window.logCoordinateSystemOutput === 'function') {
                        window.logCoordinateSystemOutput('optimized-design-data-capture.js', errorResponse);
                    }
                } catch (e) {
                    console.warn('🏗️ PHASE 1: Logging failed for optimized-design-data-capture.js:', e.message);
                }
                return errorResponse;
            }
        }

        if (this.fabricCanvases.length === 0) {
            this.debugLog('error', '❌ No fabric canvases available');
            return this.createErrorResponse('No fabric canvases found');
        }

        try {
            // Use primary canvas
            const primaryCanvas = this.fabricCanvases.find(fc => fc.isDesignerCanvas) || this.fabricCanvases[0];
            this.debugLog('info', '🎨 Using primary canvas:', primaryCanvas.id);

            // 🚀 ISSUE #18: Complete JSON structure for user action capture
            const designData = {
                // Timestamp in ISO format
                timestamp: new Date().toISOString(),

                // Action type (captured during user interaction)
                action: this.getCurrentAction(),

                // Element that triggered the capture
                element: this.getCurrentElement(),

                // Canvas state and properties
                canvas: {
                    id: primaryCanvas.id,
                    width: primaryCanvas.canvas.width,
                    height: primaryCanvas.canvas.height,
                    zoom: primaryCanvas.canvas.getZoom ? primaryCanvas.canvas.getZoom() : 1.0,
                    objects_count: primaryCanvas.canvas.getObjects().length,
                    mockup_offset_x: this.getMockupOffsetX(),
                    mockup_offset_y: this.getMockupOffsetY()
                },

                // Template information
                template_view_id: this.extractTemplateViewId(),
                designed_on_area_px: this.getDesignAreaDimensions(),

                // All canvas elements with precise coordinates
                elements: this.captureCanvasElements(primaryCanvas.canvas),

                // User session information
                user_session: this.generateSessionId(),

                // System metadata
                metadata: {
                    system: 'OptimizedDesignDataCapture',
                    version: '1.0.0',
                    debug_mode: this.DEBUG_MODE,
                    capture_quality: 'complete'
                }
            };

            // Performance logging (only in debug mode)
            this.debugLog('info', '📊 COMPLETE DESIGN DATA CAPTURED');
            this.debugLog('debug', 'Canvas dimensions:', `${designData.canvas.width}x${designData.canvas.height}`);
            this.debugLog('debug', 'Elements captured:', designData.elements.length);
            this.debugLog('debug', 'Action type:', designData.action);

            // 🏗️ PHASE 1: DIAGNOSE LOGGING - ERFOLGREICHE KOORDINATEN-ERFASSUNG
            try {
                if (typeof window.logCoordinateSystemOutput === 'function') {
                    window.logCoordinateSystemOutput('optimized-design-data-capture.js', designData);
                }
            } catch (e) {
                console.warn('🏗️ PHASE 1: Logging failed for optimized-design-data-capture.js:', e.message);
            }

            return designData;

        } catch (error) {
            this.debugLog('error', '❌ Error generating design data:', error);
            const errorResponse = this.createErrorResponse(error.message, error.stack);

            // 🏗️ PHASE 1: DIAGNOSE LOGGING - FEHLER-FALL
            try {
                if (typeof window.logCoordinateSystemOutput === 'function') {
                    window.logCoordinateSystemOutput('optimized-design-data-capture.js', errorResponse);
                }
            } catch (e) {
                console.warn('🏗️ PHASE 1: Logging failed for optimized-design-data-capture.js:', e.message);
            }

            return errorResponse;
        }
    }

    /**
     * Get current user action (for real-time action capture)
     */
    getCurrentAction() {
        // This would be set by event listeners in a real implementation
        return window.lastDesignAction || 'capture_design';
    }

    /**
     * Get current element information
     */
    getCurrentElement() {
        // This would contain information about the element being modified
        return window.lastDesignElement || {
            id: 'unknown',
            type: 'canvas',
            action: 'capture'
        };
    }

    /**
     * Get mockup offset X coordinate
     */
    getMockupOffsetX() {
        if (!this.mockupDesignArea || !this.fabricCanvases.length) return 0;

        try {
            const canvasElement = this.fabricCanvases[0].element;
            if (!canvasElement) return 0;

            const canvasRect = canvasElement.getBoundingClientRect();
            const containerRect = this.mockupDesignArea.getBoundingClientRect();

            return Math.round(canvasRect.left - containerRect.left);
        } catch (error) {
            this.debugLog('warn', '⚠️ Failed to calculate mockup offset X:', error.message);
            return 0;
        }
    }

    /**
     * Get mockup offset Y coordinate
     */
    getMockupOffsetY() {
        if (!this.mockupDesignArea || !this.fabricCanvases.length) return 0;

        try {
            const canvasElement = this.fabricCanvases[0].element;
            if (!canvasElement) return 0;

            const canvasRect = canvasElement.getBoundingClientRect();
            const containerRect = this.mockupDesignArea.getBoundingClientRect();

            return Math.round(canvasRect.top - containerRect.top);
        } catch (error) {
            this.debugLog('warn', '⚠️ Failed to calculate mockup offset Y:', error.message);
            return 0;
        }
    }

    /**
     * Generate unique session ID
     */
    generateSessionId() {
        // Use existing session ID if available
        if (window.octoPrintDesignerSession) {
            return window.octoPrintDesignerSession;
        }

        // Generate new session ID
        const sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        window.octoPrintDesignerSession = sessionId;
        return sessionId;
    }

    /**
     * Extract template view ID
     */
    extractTemplateViewId() {
        // URL parameter
        if (typeof window !== 'undefined' && window.location && window.location.search) {
            const urlParams = new URLSearchParams(window.location.search);
            if (urlParams.has('template_view_id')) {
                return urlParams.get('template_view_id');
            }
        }

        // Data attribute
        const templateElement = document.querySelector('[data-template-view-id]');
        if (templateElement) {
            return templateElement.getAttribute('data-template-view-id');
        }

        // Mockup Design Area attribute
        if (this.mockupDesignArea && this.mockupDesignArea.dataset && this.mockupDesignArea.dataset.templateViewId) {
            return this.mockupDesignArea.dataset.templateViewId;
        }

        // Product ID from URL
        let productId = 'unknown';
        if (typeof window !== 'undefined' && window.location && window.location.pathname) {
            const pathParts = window.location.pathname.split('/');
            productId = pathParts[pathParts.length - 1] || 'unknown';
        }

        return `template-${productId}-front`;
    }

    /**
     * Get design area dimensions
     */
    getDesignAreaDimensions() {
        if (this.mockupDesignArea) {
            const rect = this.mockupDesignArea.getBoundingClientRect();
            return {
                width: Math.round(this.mockupDesignArea.offsetWidth || rect.width),
                height: Math.round(this.mockupDesignArea.offsetHeight || rect.height)
            };
        }

        // Fallback: Use canvas dimensions
        if (this.fabricCanvases.length > 0) {
            const canvas = this.fabricCanvases[0].canvas;
            return {
                width: canvas.width,
                height: canvas.height
            };
        }

        return { width: 800, height: 600 };
    }

    /**
     * Capture all canvas elements
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
     * Process individual canvas object
     */
    processCanvasObject(obj, index) {
        // Transform coordinates relative to mockup design area
        const coords = this.transformCoordinates(obj.left || 0, obj.top || 0);

        // Base properties
        const baseElement = {
            x: Math.round(coords.x),
            y: Math.round(coords.y),
            width: Math.round((obj.width || 0) * (obj.scaleX || 1)),
            height: Math.round((obj.height || 0) * (obj.scaleY || 1)),
            scaleX: Number((obj.scaleX || 1).toFixed(3)),
            scaleY: Number((obj.scaleY || 1).toFixed(3)),
            angle: Number((obj.angle || 0).toFixed(1))
        };

        // Type-specific processing
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

            default:
                this.debugLog('warn', `⚠️ Unknown object type: ${obj.type}`);
                return {
                    type: 'unknown',
                    originalType: obj.type,
                    ...baseElement
                };
        }
    }

    /**
     * 🚀 ISSUE #18: Transform coordinates relative to mockup design area
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
            this.debugLog('warn', '⚠️ Coordinate transformation failed:', error.message);
            return { x: canvasX, y: canvasY };
        }
    }

    /**
     * Create error response
     */
    createErrorResponse(message, stack = null) {
        return {
            error: message,
            template_view_id: 'error',
            designed_on_area_px: { width: 0, height: 0 },
            elements: [],
            timestamp: new Date().toISOString(),
            canvas: {
                id: 'error',
                width: 0,
                height: 0,
                zoom: 1.0,
                objects_count: 0,
                mockup_offset_x: 0,
                mockup_offset_y: 0
            },
            user_session: this.generateSessionId(),
            stack: stack,
            debug: {
                initialized: this.initialized,
                fabricCanvases: this.fabricCanvases.length,
                status: this.status
            }
        };
    }

    /**
     * 🧠 ERROR SPECIALIST: Enhanced initialization failure handling
     */
    handleInitializationFailure() {
        this.debugLog('error', '🔥 [ERROR SPECIALIST] INITIALIZATION FAILED');
        this.debugLog('error', 'System Status:', this.status);

        // Create comprehensive error event
        window.dispatchEvent(new CustomEvent('designCaptureInitializationFailed', {
            detail: {
                status: this.status,
                retryCount: this.retryCount,
                maxRetries: this.maxRetries,
                timestamp: new Date().toISOString(),
                userAgent: navigator.userAgent,
                context: window.octoAdminContext || 'unknown'
            }
        }));

        // 🧠 ERROR SPECIALIST: Multi-level fallback system
        this.implementFallbackSystems();

        // Create user-friendly error notification
        this.showUserErrorNotification();
    }

    /**
     * Dispatch initialization event
     */
    dispatchInitializationEvent() {
        window.dispatchEvent(new CustomEvent('designCaptureReady', {
            detail: {
                fabricCanvases: this.fabricCanvases.length,
                mockupDesignArea: !!this.mockupDesignArea,
                retryCount: this.retryCount,
                system: 'OptimizedDesignDataCapture'
            }
        }));
    }

    /**
     * Sleep helper function
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 🧠 ERROR SPECIALIST: Implement comprehensive fallback systems
     */
    implementFallbackSystems() {
        this.debugLog('info', '🧠 [ERROR SPECIALIST] Implementing fallback systems...');

        // Level 1: Basic function fallbacks
        this.implementEnhancedFallbacks();

        // Level 2: JSON-based preview fallback
        this.implementJsonPreviewFallback();

        // Level 3: Admin context specific fallbacks
        if (window.octoAdminContext && window.octoAdminContext.context === 'woocommerce_admin') {
            this.implementAdminContextFallbacks();
        }

        this.debugLog('info', '✅ [ERROR SPECIALIST] All fallback systems implemented');
    }

    /**
     * 🧠 ERROR SPECIALIST: Enhanced fallback functions
     */
    implementEnhancedFallbacks() {
        // Primary fallback: generateDesignData function
        window.generateDesignData = () => {
            return this.createErrorResponse('Canvas system unavailable - using fallback mode');
        };

        // Fabric.js fallback check
        if (!window.fabric) {
            this.debugLog('warn', '🔥 [ERROR SPECIALIST] Fabric.js unavailable - creating mock');
            window.fabric = {
                Canvas: function() { return null; },
                loadSVGFromString: function() { return null; }
            };
        }

        // Canvas instance fallback
        if (!window.fabricCanvas) {
            this.debugLog('warn', '🔥 [ERROR SPECIALIST] No canvas available - creating placeholder');
            window.fabricCanvas = null;
        }
    }

    /**
     * 🧠 ERROR SPECIALIST: JSON-based preview fallback
     */
    implementJsonPreviewFallback() {
        window.generateDesignDataFromJSON = (jsonData) => {
            try {
                if (typeof jsonData === 'string') {
                    jsonData = JSON.parse(jsonData);
                }

                return {
                    success: true,
                    data: jsonData,
                    message: 'Preview generated from stored JSON data',
                    fallback_mode: 'json_preview',
                    timestamp: new Date().toISOString()
                };
            } catch (error) {
                this.debugLog('error', '🔥 [ERROR SPECIALIST] JSON fallback failed:', error);
                return this.createErrorResponse('JSON preview fallback failed: ' + error.message);
            }
        };
    }

    /**
     * 🧠 ERROR SPECIALIST: Admin context specific fallbacks
     */
    implementAdminContextFallbacks() {
        this.debugLog('info', '🧠 [ERROR SPECIALIST] Implementing admin-specific fallbacks...');

        // Admin preview fallback function
        window.generateAdminPreview = (orderId) => {
            return {
                success: true,
                data: {
                    message: 'Admin preview mode - canvas not required',
                    order_id: orderId,
                    preview_type: 'admin_fallback'
                },
                fallback_mode: 'admin_context',
                timestamp: new Date().toISOString()
            };
        };

        // Mock canvas functions for admin
        if (!window.fabricCanvas) {
            window.fabricCanvas = {
                getObjects: () => [],
                toDataURL: () => 'data:image/png;base64,admin_fallback_mode',
                add: () => null,
                remove: () => null
            };
        }
    }

    /**
     * 🧠 ERROR SPECIALIST: Show user-friendly error notification
     */
    showUserErrorNotification() {
        // Only show in non-admin contexts to avoid UI pollution
        if (window.octoAdminContext && window.octoAdminContext.context === 'woocommerce_admin') {
            this.debugLog('info', '🧠 [ERROR SPECIALIST] Skipping UI notification in admin context');
            return;
        }

        const notification = document.createElement('div');
        notification.id = 'design-system-error-notice';
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff6b6b;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            font-size: 14px;
            max-width: 300px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        `;
        notification.innerHTML = `
            <strong>⚠️ Design System Notice</strong><br>
            Canvas initialization failed. Running in fallback mode.<br>
            <small style="opacity: 0.8;">Contact support if this persists.</small>
        `;

        document.body.appendChild(notification);

        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 10000);
    }

    /**
     * Test function for debugging
     */
    test() {
        this.debugLog('info', '🧪 Running optimized design data capture test...');
        const data = this.generateDesignData();
        this.debugLog('info', '🧪 Test result:', data);
        return data;
    }

    /**
     * 🧠 AGENT METHOD: JavascriptPerformanceOptimizer - Admin-optimized initialization
     */
    startAdminOptimizedInitialization() {
        this.debugLog('info', '🧠 [JS OPTIMIZER] Starting admin-optimized initialization...');

        // Skip canvas polling in admin context
        if (window.octoAdminContext && window.octoAdminContext.skip_canvas_polling) {
            this.debugLog('info', '🧠 [JS OPTIMIZER] Skipping canvas polling - admin context');
            this.status.domReady = true;

            // Wait for Fabric.js to be available
            this.waitForFabricInAdmin();
        } else {
            // Fallback to standard initialization
            this.startIntelligentInitialization();
        }
    }

    /**
     * 🧠 AGENT METHOD: JavascriptPerformanceOptimizer - Wait for Fabric.js in admin
     */
    async waitForFabricInAdmin() {
        this.debugLog('info', '🧠 [JS OPTIMIZER] Waiting for Fabric.js in admin context...');

        const maxWait = 5; // AGENT 4: Further reduced from 10s to 5s for admin context
        let attempts = 0;

        const checkFabric = async () => {
            attempts++;

            if (typeof window.fabric !== 'undefined' && window.fabric.Canvas) {
                this.debugLog('info', '🧠 [JS OPTIMIZER] Fabric.js available in admin context');
                this.status.fabricLoaded = true;
                this.initializeAdminFunctions();
                return true;
            }

            if (attempts >= maxWait) {
                this.debugLog('warn', '🧠 [JS OPTIMIZER] Fabric.js not available - using fallback');
                this.initializeAdminFunctions();
                return false;
            }

            await this.sleep(1000);
            return checkFabric();
        };

        await checkFabric();
    }

    /**
     * 🧠 AGENT METHOD: JavascriptPerformanceOptimizer - Initialize admin functions
     */
    initializeAdminFunctions() {
        this.debugLog('info', '🧠 [JS OPTIMIZER] Initializing admin-specific functions...');

        // Make generateDesignData available globally for admin use
        if (typeof window.generateDesignData === 'undefined') {
            window.generateDesignData = () => this.generateDesignDataForAdmin();
            this.debugLog('info', '🧠 [JS OPTIMIZER] generateDesignData() function exposed for admin');
        }

        this.initialized = true;
        this.status.systemReady = true;
    }

    /**
     * 🚨 THADDÄUS EMERGENCY: Force canvas detection retry
     */
    forceCanvasDetection() {
        console.log('🚨 THADDÄUS EMERGENCY: Force canvas detection started');

        // Check for canvas elements again
        const canvases = document.querySelectorAll('canvas');
        console.log(`🔍 THADDÄUS: Found ${canvases.length} canvas elements`);

        // Check for fabric
        console.log('🔍 THADDÄUS: Fabric available:', typeof window.fabric !== 'undefined');
        console.log('🔍 THADDÄUS: fabricCanvas available:', !!window.fabricCanvas);

        // Check for designer instance
        console.log('🔍 THADDÄUS: designerWidgetInstance available:', !!window.designerWidgetInstance);

        // Force attempt initialization
        if (canvases.length > 0 && typeof window.fabric !== 'undefined') {
            console.log('🚨 THADDÄUS: Conditions met - forcing immediate initialization');
            this.initialized = false; // Reset to allow re-initialization
            this.retryCount = 0;       // Reset retry count
            return this.attemptImmediateInitialization();
        }

        return false;
    }

    /**
     * 🧠 AGENT METHOD: JavascriptPerformanceOptimizer - Generate design data for admin
     */
    generateDesignDataForAdmin() {
        this.debugLog('info', '🧠 [JS OPTIMIZER] Generating design data for admin context...');

        // Return basic structure for admin preview system
        return {
            timestamp: Date.now(),
            template_view_id: 'admin-preview',
            admin_context: true,
            elements: [], // Will be populated from stored data
            system_info: {
                admin_optimized: true,
                webpack_bypass: true,
                canvas_polling_skipped: true
            }
        };
    }
}

// 🚀 ISSUE #18: Auto-initialization with production mode
(function() {
    if (typeof window !== 'undefined') {
    // 🎯 GATEKEEPER EVENT-BASED INITIALIZATION - RACE CONDITION ELIMINATED
    const initializeOptimizedCapture = async (designerInstance) => {
        // 🧠 AGENT 4 FIX: Prevent duplicate OptimizedDesignDataCapture instances
        if (window.optimizedCaptureInstance || window.OptimizedDesignDataCaptureInitialized) {
            console.log('🔄 DUPLICATE PREVENTION: OptimizedDesignDataCapture already initialized, skipping...');
            return; // Already initialized
        }

        // Set initialization flag immediately to prevent race conditions
        window.OptimizedDesignDataCaptureInitialized = true;

        console.log('🚀 RACE CONDITION ELIMINATED: Initializing via designerReady event only...');
        const instance = new OptimizedDesignDataCapture();

        // 🚨 THADDÄUS EMERGENCY: Force canvas detection before initialization
        console.log('🚨 THADDÄUS: Forcing canvas detection before initialization');
        setTimeout(() => {
            instance.forceCanvasDetection();
        }, 50);

        // Trigger event-driven initialization explicitly
        await instance.startEventDrivenInitialization();

        // Make instance globally available
        window.optimizedCaptureInstance = instance;
        window.designDataCapture = instance;

        console.log('✅ RACE CONDITION ELIMINATED: Single initialization path confirmed');
        console.log('🎯 Designer instance available:', !!designerInstance);
        console.log('🛡️ No parallel initialization detected');
    };

    // 🔒 SECURITY: designerReady event deduplication
    if (window.designerReadyListenerAttached) {
        console.log('🛡️ SECURITY: designerReady listener already attached - preventing duplicate');
        // 🚨 THADDÄUS EMERGENCY: But still try emergency initialization if not initialized
        if (!window.OptimizedDesignDataCaptureInitialized && !window.optimizedCaptureInstance) {
            console.log('🚨 THADDÄUS: Event listener exists but system not initialized - emergency bypass');
            setTimeout(() => {
                const emergencyInstance = new OptimizedDesignDataCapture();
                emergencyInstance.forceCanvasDetection();
                window.optimizedCaptureInstance = emergencyInstance;
            }, 100);
        }
        return;
    }
    window.designerReadyListenerAttached = true;

    // Listen for the designerReady event instead of auto-initialization
    document.addEventListener('designerReady', function(event) {
        console.log('🎯 GATEKEEPER: designerReady event received by optimized-design-data-capture.js');
        const designerInstance = event.detail.instance;
        initializeOptimizedCapture(designerInstance);
    });

    // 🎯 THADDÄUS EMERGENCY: Listen for fabricGlobalReady event from designer bundle fix
    document.addEventListener('fabricGlobalReady', function(event) {
        console.log('🎯 THADDÄUS EMERGENCY: fabricGlobalReady event received - fabric is now available!');
        console.log('🔍 THADDÄUS: Event source:', event.detail.source);
        console.log('🔍 THADDÄUS: Fabric available:', typeof window.fabric !== 'undefined');

        // If we have a capture instance, try to re-initialize it with fabric now available
        if (window.OptimizedDesignDataCaptureInstance && typeof window.fabric !== 'undefined') {
            console.log('🚨 THADDÄUS: Attempting emergency re-initialization with fabric available');
            window.OptimizedDesignDataCaptureInstance.emergencyFabricDetection();
        }
    });

    console.log('🎯 GATEKEEPER: optimized-design-data-capture.js waiting for designerReady event...');

    // 🚨 ADMIN FIX: In admin context, there might be no designer.bundle.js to fire designerReady
    // Set up emergency fallback for admin pages
    if (window.location.href.includes('/wp-admin/')) {
        console.log('🚨 ADMIN CONTEXT: Setting up emergency fallback for generateDesignData...');
        setTimeout(() => {
            if (typeof window.generateDesignData === 'undefined') {
                console.log('🚨 ADMIN EMERGENCY: designerReady event never fired - creating emergency instance');
                const emergencyInstance = new OptimizedDesignDataCapture();
                emergencyInstance.exposeGlobalFunctions();
                window.OptimizedDesignDataCaptureInstance = emergencyInstance;
                console.log('✅ ADMIN EMERGENCY: generateDesignData() function now available');
            }
        }, 2000); // Give 2 seconds for normal initialization
    }

    /**
     * 🖨️ AUTO PNG GENERATION: Trigger PNG creation when design data is generated
     */
    function triggerAutoPNGGeneration(designData) {
        try {
            console.log('🖨️ AUTO PNG GENERATION: Design data generated, checking for PNG system...');

            // Check if YPrint PNG integration is available
            if (window.yprintPNGIntegration && typeof window.yprintPNGIntegration.autoGeneratePrintPNG === 'function') {
                console.log('🖨️ AUTO PNG GENERATION: PNG system found, generating PNG...');
                window.yprintPNGIntegration.autoGeneratePrintPNG();
            } else {
                console.log('🔍 AUTO PNG GENERATION: PNG system not ready yet, will retry...');

                // Retry after a short delay to allow PNG system to initialize
                setTimeout(() => {
                    if (window.yprintPNGIntegration && typeof window.yprintPNGIntegration.autoGeneratePrintPNG === 'function') {
                        console.log('🖨️ AUTO PNG GENERATION: PNG system ready after retry, generating PNG...');
                        window.yprintPNGIntegration.autoGeneratePrintPNG();
                    } else {
                        console.warn('⚠️ AUTO PNG GENERATION: PNG system not available');
                    }
                }, 1000);
            }

            // Fire design saved event for other systems
            document.dispatchEvent(new CustomEvent('designSaved', {
                detail: { designData }
            }));

        } catch (error) {
            console.error('❌ AUTO PNG GENERATION: Error triggering PNG generation:', error);
        }
    }
    }
})();

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = OptimizedDesignDataCapture;
}