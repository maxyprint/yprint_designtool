/**
 * Reference Line System for Template Designer
 * Integrates with existing view system to provide interactive measurement tools
 */

(function($) {
    'use strict';

    class ReferenceLineSystem {
        constructor() {
            this.isActive = false;
            this.currentReferenceType = null;
            this.clickCount = 0;
            this.startPoint = null;
            this.endPoint = null;
            this.referenceLine = null;
            this.canvas = null;
            this.fabric = null;
            this.mutationObserver = null;
            this.canvasDetectionPromise = null;
            this.debugMode = false; // 🟢 LOG-SPAM CONTROL: Set to true for detailed debugging
            this.retryAttempts = 0; // Initialize retry counter
            this.init();
        }

        init() {
            // 🛡️ SINGLETON PATTERN: Prevent multiple initializations globally
            if (window.referenceLineSystemInitialized) {
                console.log('🛡️ Reference Line System already initialized - preventing duplicate');
                return;
            }
            window.referenceLineSystemInitialized = true;

            console.log('🔍 REFERENCE LINE SYSTEM: Initializing with CASCADE ELIMINATION...');
            this.bindEvents();
            this.setupModal();

            // 🚨 CASCADE ELIMINATION: Primary event-driven approach FIRST
            this.setupEventDrivenCanvasDetection();

            // 🚨 FALLBACK ONLY: Traditional detection as backup
            this.setupCanvasDetection();
        }

        setupEventDrivenCanvasDetection() {
            // 🚨 CASCADE ELIMINATION: Single unified event handler to replace duplicate listeners
            if (window.eventDrivenCanvasListenerActive) {
                console.log('🛡️ Event-driven canvas listener already active - skipping');
                return;
            }
            window.eventDrivenCanvasListenerActive = true;

            console.log('🎯 EVENT-DRIVEN: Setting up unified canvas detection listeners...');

            // Primary: fabricGlobalReady event from admin.bundle.js
            window.addEventListener('fabricGlobalReady', (event) => {
                console.log('🎯 REFERENCE LINE: Received fabricGlobalReady event!', event.detail);
                this.handleCanvasEvent(event.detail, 'fabricGlobalReady');
            });

            // Secondary: fabricCanvasReady event (existing)
            window.addEventListener('fabricCanvasReady', (event) => {
                console.log('🎯 REFERENCE LINE: Received fabricCanvasReady event!', event.detail);
                this.handleCanvasEvent(event.detail, 'fabricCanvasReady');
            });
        }

        handleCanvasEvent(eventDetail, eventType) {
            // 🛡️ GUARD: Prevent multiple processing if already found
            if (window.canvasDetectionCompleted || this.canvas) {
                console.log('🛡️ Canvas already found - ignoring additional events');
                return;
            }

            let canvas = null;

            // Extract canvas from event detail
            if (eventDetail && eventDetail.canvas) {
                canvas = eventDetail.canvas;
                console.log(`✅ REFERENCE LINE: Canvas found via ${eventType} event!`);
            } else if (eventType === 'fabricGlobalReady' && eventDetail.fabric) {
                // For fabricGlobalReady, set fabric and try to find canvas
                this.fabric = eventDetail.fabric;
                window.fabric = eventDetail.fabric;
                console.log('✅ REFERENCE LINE: Global fabric set from exposure event!');
                canvas = this.findCanvasUsingFabric();
            }

            if (canvas) {
                this.canvas = canvas;
                window.fabricCanvas = canvas;
                window.canvasDetectionCompleted = true;
                console.log('✅ REFERENCE LINE: Canvas set from event-driven detection!');
                this.stopAllDetectionMethods();

                // Handle delayed reference line creation
                if (this.isWaitingForCanvas) {
                    this.isWaitingForCanvas = false;
                    console.log('🚀 REFERENCE LINE: Continuing delayed reference line creation...');
                    setTimeout(() => this.startReferenceLineCreation(), 100);
                }

                this.onCanvasReady && this.onCanvasReady();
            }
        }

        stopAllDetectionMethods() {
            console.log('🛡️ EVENT-DRIVEN: Stopping all polling/detection methods...');

            // Clear any polling intervals
            if (this.editorCheckInterval) {
                clearInterval(this.editorCheckInterval);
            }

            // Disconnect MutationObserver
            if (this.mutationObserver) {
                this.mutationObserver.disconnect();
                window.mutationObserverActive = false;
            }

            // Mark all detection as completed
            window.canvasDetectionInitialized = true;
            window.canvasDetectionCompleted = true;
        }

        findCanvasUsingFabric() {
            if (this.fabric && this.fabric.Canvas && this.fabric.Canvas.getInstances) {
                const instances = this.fabric.Canvas.getInstances();
                if (instances && instances.length > 0) {
                    console.log('✅ REFERENCE LINE: Canvas found via fabric.Canvas.getInstances()!');
                    return instances[0];
                }
            }
            return null;
        }

        setupCanvasDetection() {
            // Enhanced Canvas Detection Strategy
            this.setupTemplateEditorHook();
            this.setupMutationObserver();
            this.setupWindowObjectWatcher();
        }

        setupTemplateEditorHook() {
            // 🚨 CASCADE ELIMINATION: Singleton guard to prevent multiple initialization
            if (window.canvasDetectionInitialized) {
                console.log('🛡️ Canvas detection already initialized - skipping');
                return;
            }
            window.canvasDetectionInitialized = true;

            const self = this;
            let detectionCompleted = false;

            // Watch for templateEditors Map creation
            const checkForEditors = () => {
                // 🛡️ GUARD: Prevent multiple executions after success
                if (detectionCompleted) return false;

                if (window.templateEditors instanceof Map && window.templateEditors.size > 0) {
                    console.log('🎯 DETECTED templateEditors Map creation! (SINGLETON MODE)');
                    detectionCompleted = true;
                    self.checkCanvasFromEditors();
                    return true;
                } else if (window.variationsManager && window.variationsManager.editors) {
                    console.log('🎯 DETECTED variationsManager creation! (SINGLETON MODE)');
                    detectionCompleted = true;
                    self.checkCanvasFromEditors();
                    return true;
                }
                return false;
            };

            // 🚨 CASCADE ELIMINATION: Store interval reference for cleanup
            this.editorCheckInterval = setInterval(() => {
                // 🛡️ GUARD: Stop if globally completed
                if (window.canvasDetectionCompleted) {
                    console.log('🛡️ Global detection completed - stopping interval');
                    clearInterval(this.editorCheckInterval);
                    return;
                }

                const found = checkForEditors();
                if (found || this.canvas || detectionCompleted) {
                    console.log('🛡️ Stopping canvas detection interval - success or completion');
                    clearInterval(this.editorCheckInterval);
                    window.canvasDetectionCompleted = true;
                }
            }, 100);

            // 🚨 FAILSAFE: Clear interval after 10 seconds (reduced from 30s)
            setTimeout(() => {
                if (this.editorCheckInterval) {
                    console.log('🚨 Canvas detection timeout - clearing interval');
                    clearInterval(this.editorCheckInterval);
                }
            }, 10000);
        }

        async checkCanvasFromEditors() {
            const foundCanvas = await this.findCanvasInstance();
            if (foundCanvas) {
                console.log('✅ Canvas found via editor detection! (CASCADE SAFE)');
                this.canvas = foundCanvas;
                // 🚨 CASCADE ELIMINATION: Mark detection as completed globally
                window.canvasDetectionCompleted = true;
                // Notify any waiting processes
                this.onCanvasReady && this.onCanvasReady();
            }
        }

        setupMutationObserver() {
            // 🚨 CASCADE ELIMINATION: Prevent multiple observers
            if (window.mutationObserverActive) {
                console.log('🛡️ MutationObserver already active - skipping setup');
                return;
            }
            window.mutationObserverActive = true;

            // Set up MutationObserver to detect when canvas is added to DOM
            this.mutationObserver = new MutationObserver((mutations) => {
                // 🛡️ GUARD: Stop if canvas already found
                if (window.canvasDetectionCompleted || this.canvas) {
                    console.log('🛡️ Canvas already found - disconnecting MutationObserver');
                    this.mutationObserver.disconnect();
                    window.mutationObserverActive = false;
                    return;
                }

                // 🛡️ CASCADE PREVENTION: Single execution flag for this observer callback
                if (this.mutationObserverProcessing) {
                    return;
                }
                this.mutationObserverProcessing = true;

                try {
                    for (let mutation of mutations) {
                        if (mutation.type === 'childList') {
                            const addedNodes = Array.from(mutation.addedNodes);
                            for (let node of addedNodes) {
                                if (node.nodeType === Node.ELEMENT_NODE) {
                                    // Check if a canvas was added
                                    if (node.tagName === 'CANVAS') {
                                        console.log('🔍 MutationObserver: Canvas element added to DOM (SINGLETON)', node);
                                        const success = this.checkCanvasForFabric(node);
                                        if (success) {
                                            console.log('✅ MutationObserver: Canvas found, disconnecting observer');
                                            this.mutationObserver.disconnect();
                                            window.mutationObserverActive = false;
                                            window.canvasDetectionCompleted = true;
                                            return;
                                        }
                                    }
                                    // Check if any child contains a canvas
                                    const canvasElements = node.querySelectorAll && node.querySelectorAll('canvas');
                                    if (canvasElements && canvasElements.length > 0) {
                                        console.log('🔍 MutationObserver: Canvas found in added element (SINGLETON)', canvasElements);
                                        for (const canvas of canvasElements) {
                                            const success = this.checkCanvasForFabric(canvas);
                                            if (success) {
                                                console.log('✅ MutationObserver: Canvas found, disconnecting observer');
                                                this.mutationObserver.disconnect();
                                                window.mutationObserverActive = false;
                                                window.canvasDetectionCompleted = true;
                                                return;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                } finally {
                    // Reset processing flag after a delay to allow for new DOM changes
                    setTimeout(() => {
                        this.mutationObserverProcessing = false;
                    }, 100);
                }
            });

            // Start observing
            this.mutationObserver.observe(document.body, {
                childList: true,
                subtree: true
            });

            console.log('🔍 MutationObserver started for canvas detection');
        }

        setupWindowObjectWatcher() {
            // Watch for window properties being set
            const watchProps = ['templateEditors', 'variationsManager', 'fabricCanvas'];
            const self = this;

            watchProps.forEach(prop => {
                let value = window[prop];
                Object.defineProperty(window, prop, {
                    get() { return value; },
                    set(newValue) {
                        value = newValue;
                        console.log(`🎯 WINDOW PROPERTY SET: ${prop}`, newValue);
                        if (newValue && !self.canvas) {
                            setTimeout(() => self.checkCanvasFromEditors(), 50);
                        }
                    },
                    configurable: true
                });
            });
        }

        checkCanvasForFabric(canvasElement) {
            // 🛡️ GUARD: Prevent processing if already found
            if (window.canvasDetectionCompleted || this.canvas) {
                return true;
            }

            // Check immediately
            if (canvasElement.__fabric) {
                console.log('✅ MutationObserver: Found Fabric.js canvas!', canvasElement.__fabric);
                window.fabricCanvas = canvasElement.__fabric;
                this.canvas = canvasElement.__fabric;
                window.canvasDetectionCompleted = true;
                // Stop all detection methods
                this.stopAllDetectionMethods();
                return true;
            }

            // Sometimes Fabric.js is attached after the element is added, so we wait a bit
            setTimeout(() => {
                if (!window.canvasDetectionCompleted && !this.canvas && canvasElement.__fabric) {
                    console.log('✅ MutationObserver: Found Fabric.js canvas (delayed)!', canvasElement.__fabric);
                    window.fabricCanvas = canvasElement.__fabric;
                    this.canvas = canvasElement.__fabric;
                    window.canvasDetectionCompleted = true;
                    // Stop all detection methods
                    this.stopAllDetectionMethods();
                }
            }, 100);

            return false;
        }

        bindEvents() {
            // Reference line mode button
            $(document).on('click', '[data-mode="referenceline"]', (e) => {
                e.preventDefault();
                this.activateReferenceLineMode();
            });

            // Modal close events
            $(document).on('click', '.octo-modal-close', () => {
                this.closeModal();
            });

            $(document).on('click', '.octo-modal', (e) => {
                if ($(e.target).hasClass('octo-modal')) {
                    this.closeModal();
                }
            });

            // Reference type selection
            $(document).on('click', '.select-reference-type', (e) => {
                const type = $(e.currentTarget).data('type');
                this.selectReferenceType(type);
            });

            // Canvas click events for coordinate selection
            $(document).on('canvas:mouse:down', (e) => {
                if (this.isActive && this.currentReferenceType) {
                    this.handleCanvasClick(e);
                }
            });

            // ESC key to cancel
            $(document).on('keyup', (e) => {
                if (e.keyCode === 27 && this.isActive) {
                    this.cancelReferenceMode();
                }
            });
        }

        setupModal() {
            // Add modal styles if not already present
            if (!$('#reference-line-styles').length) {
                const styles = `
                    <style id="reference-line-styles">
                        .octo-modal {
                            display: none;
                            position: fixed;
                            z-index: 1000;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: 100%;
                            background-color: rgba(0,0,0,0.5);
                        }

                        .octo-modal-content {
                            background-color: #fff;
                            margin: 15% auto;
                            padding: 20px;
                            border: 1px solid #ccc;
                            border-radius: 5px;
                            width: 500px;
                            max-width: 90%;
                            position: relative;
                        }

                        .octo-modal-header {
                            display: flex;
                            justify-content: space-between;
                            align-items: center;
                            margin-bottom: 20px;
                            padding-bottom: 10px;
                            border-bottom: 1px solid #eee;
                        }

                        .octo-modal-close {
                            cursor: pointer;
                            font-size: 24px;
                            font-weight: bold;
                            color: #999;
                        }

                        .octo-modal-close:hover {
                            color: #333;
                        }

                        .reference-line-options {
                            display: flex;
                            flex-direction: column;
                            gap: 15px;
                            margin-top: 20px;
                        }

                        .reference-line-options .button {
                            display: flex;
                            align-items: center;
                            gap: 10px;
                            padding: 15px;
                            text-align: left;
                            border: 2px solid #ddd;
                            border-radius: 5px;
                            background: #f9f9f9;
                            transition: all 0.3s ease;
                        }

                        .reference-line-options .button:hover {
                            border-color: #0073aa;
                            background: #f0f8ff;
                        }

                        .reference-line-options .button .description {
                            display: block;
                            font-size: 12px;
                            color: #666;
                            margin-top: 5px;
                        }

                        .canvas-overlay {
                            position: absolute;
                            top: 0;
                            left: 0;
                            pointer-events: all;
                            cursor: crosshair;
                            z-index: 999;
                        }

                        .reference-line-instruction {
                            position: fixed;
                            top: 20px;
                            left: 50%;
                            transform: translateX(-50%);
                            background: #0073aa;
                            color: white;
                            padding: 10px 20px;
                            border-radius: 5px;
                            z-index: 1001;
                            font-size: 14px;
                        }

                        .template-editor-toolbar .mode-select.active {
                            background: #0073aa;
                            color: white;
                        }
                    </style>
                `;
                $('head').append(styles);
            }
        }

        activateReferenceLineMode() {
            // Show the modal to select reference type
            $('#reference-line-modal').show();
        }

        selectReferenceType(type) {
            this.currentReferenceType = type;
            this.closeModal();

            console.log('🎯 USER SELECTED REFERENCE TYPE:', type);
            console.log('🔍 IMMEDIATE DOM CHECK:');
            console.log('- Canvas elements in DOM:', document.querySelectorAll('canvas').length);
            console.log('- Template containers:', document.querySelectorAll('.template-canvas-container').length);
            console.log('- Template editor:', document.querySelectorAll('.template-editor').length);

            // Give a small delay to ensure any initialization is complete
            setTimeout(() => {
                console.log('🚀 STARTING REFERENCE LINE CREATION...');
                this.startReferenceLineCreation();
            }, 100);
        }

        async startReferenceLineCreation() {
            this.isActive = true;
            this.clickCount = 0;

            // Highlight the active button
            $('.mode-select').removeClass('active');
            $('[data-mode="referenceline"]').addClass('active');

            // Get the canvas instance (improve detection)
            this.canvas = await this.findCanvasInstance();

            if (!this.canvas) {
                console.log('🎯 REFERENCE LINE: No canvas found, setting waiting flag...');
                this.isWaitingForCanvas = true;

                if (!this.retryAttempts || this.retryAttempts >= 5) {
                    console.error('Canvas instance not found. Available canvas elements:', document.querySelectorAll('canvas'));
                    console.error('Template editor available:', $('.template-editor').length);
                    console.error('Canvas container available:', $('.template-canvas-container').length);
                    this.showCanvasError();
                }
                return;
            }

            // Reset retry attempts on success
            this.retryAttempts = 0;
            console.log('✅ Canvas found:', this.canvas);

            // Show instruction
            this.showInstruction();

            // Add event listeners for canvas clicks
            this.addCanvasListeners();
        }

        async findCanvasInstance() {
            console.log('🚀 STARTING CANVAS DETECTION - Attempt:', this.retryAttempts || 0);

            // Method 1: Check for globally exposed canvas
            if (window.fabricCanvas) {
                console.log('✅ Found global fabricCanvas');
                return window.fabricCanvas;
            }

            // Method 2: Check templateEditors Map (VariationsManager creates this)
            if (window.templateEditors && window.templateEditors instanceof Map) {
                console.log('🔍 Checking templateEditors Map...', window.templateEditors.size, 'editors');
                for (const [key, editor] of window.templateEditors.entries()) {
                    if (editor && editor.canvas) {
                        console.log('✅ FOUND CANVAS IN TEMPLATE EDITOR:', key);
                        window.fabricCanvas = editor.canvas;
                        return editor.canvas;
                    }
                }
            }

            // Method 3: Check window.variationsManager for editor instances
            if (window.variationsManager && window.variationsManager.editors) {
                console.log('🔍 Checking variationsManager.editors...');
                for (const [key, editor] of window.variationsManager.editors.entries()) {
                    if (editor && editor.canvas) {
                        console.log('✅ FOUND CANVAS IN VARIATIONS MANAGER:', key);
                        window.fabricCanvas = editor.canvas;
                        return editor.canvas;
                    }
                }
            }

            // Method 4: Look for canvas elements with Fabric.js attached
            const canvasElements = document.querySelectorAll('canvas');
            console.log('🔍 Canvas elements found:', canvasElements.length);

            for (let i = 0; i < canvasElements.length; i++) {
                const canvasEl = canvasElements[i];
                console.log(`🔍 Canvas ${i}:`, {
                    element: canvasEl,
                    hasClass: canvasEl.className,
                    parent: canvasEl.parentElement?.className,
                    fabric: !!canvasEl.__fabric,
                    fabricType: canvasEl.__fabric?.constructor?.name
                });

                if (canvasEl.__fabric) {
                    console.log('✅ FOUND FABRIC.JS CANVAS - exposing globally');
                    window.fabricCanvas = canvasEl.__fabric;
                    return canvasEl.__fabric;
                }
            }

            // Method 3: Check if we're in retry cycle
            if (!this.retryAttempts) {
                this.retryAttempts = 0;
            }

            // Method 4: Advanced DOM inspection
            console.log('🔍 DOM State Analysis:');
            console.log('- Template editor:', document.querySelector('.template-editor'));
            console.log('- Canvas container:', document.querySelector('.template-canvas-container'));
            console.log('- Template view:', document.querySelector('.template-view'));
            console.log('- View items:', document.querySelectorAll('.view-item').length);

            // Method 5: Check for Template Editor instances in window object
            for (let prop in window) {
                if (prop.toLowerCase().includes('template') || prop.toLowerCase().includes('editor')) {
                    const obj = window[prop];
                    if (obj && typeof obj === 'object') {
                        // Check for fabricCanvas property
                        if (obj.fabricCanvas) {
                            console.log('✅ Found fabricCanvas in window.' + prop);
                            window.fabricCanvas = obj.fabricCanvas;
                            return obj.fabricCanvas;
                        }
                        // Check for canvas property
                        if (obj.canvas) {
                            console.log('✅ Found canvas in window.' + prop);
                            window.fabricCanvas = obj.canvas;
                            return obj.canvas;
                        }
                    }
                }
            }

            // Method 6: Direct Fabric.js Canvas instances
            if (window.fabric && window.fabric.Canvas && window.fabric.Canvas.getInstances) {
                const instances = window.fabric.Canvas.getInstances();
                console.log('🔍 Fabric.js instances found:', instances.length);
                if (instances.length > 0) {
                    console.log('✅ Using first Fabric.js canvas instance');
                    window.fabricCanvas = instances[0];
                    return instances[0];
                }
            } else {
                console.log('🔍 Method 6 - Fabric.js status:', {
                    fabric: !!window.fabric,
                    canvas: !!(window.fabric && window.fabric.Canvas),
                    getInstances: !!(window.fabric && window.fabric.Canvas && window.fabric.Canvas.getInstances)
                });
            }

            // Method 7: Extract Fabric from existing canvas elements (aggressive approach)
            const canvasElementsForFabric = document.querySelectorAll('canvas');
            for (const canvas of canvasElementsForFabric) {
                if (canvas.__fabric) {
                    console.log('🔍 Found canvas with __fabric property, extracting Fabric.js...');
                    const fabricInstance = canvas.__fabric;

                    // Try to get Fabric constructor from instance
                    if (fabricInstance.constructor && fabricInstance.constructor.Canvas) {
                        window.fabric = {Canvas: fabricInstance.constructor.Canvas};
                        console.log('✅ Extracted Fabric.js from canvas instance');
                        window.fabricCanvas = fabricInstance;
                        return fabricInstance;
                    }

                    // Try to get fabric from the instance itself
                    if (fabricInstance.fabric) {
                        window.fabric = fabricInstance.fabric;
                        console.log('✅ Found fabric reference in canvas instance');
                        window.fabricCanvas = fabricInstance;
                        return fabricInstance;
                    }
                }
            }

            // Method 8: Get existing canvas instance from templateEditors/variationsManager
            // 🚨 FIXED: No longer trying to create new canvas instance - integrate with existing
            try {
                const existingCanvas = await this.getExistingCanvasInstance();
                if (existingCanvas) {
                    console.log('✅ FOUND EXISTING CANVAS INSTANCE - INTEGRATING!', existingCanvas);
                    window.fabricCanvas = existingCanvas;
                    return existingCanvas;
                }
            } catch (error) {
                console.log('❌ Error in canvas detection:', error);
            }

            // Method 9: CONTROLLED retry with exponential backoff (LOG-SPAM ELIMINATED)
            if (this.retryAttempts < 3) { // Reduced from 5 to 3 attempts to prevent cascade
                this.retryAttempts++;
                const delay = Math.min(1000 * this.retryAttempts, 3000); // Linear backoff, max 3s

                // 🟢 LOG-SPAM ELIMINATION: Only log first attempt
                if (this.retryAttempts === 1) {
                    console.log(`⏳ Canvas detection retry ${this.retryAttempts}/3 (${delay}ms delay)`);
                }

                // 🔵 ROBUST WAIT STRATEGY: Promise-based with proper termination
                return new Promise((resolve) => {
                    // 🛡️ GUARD: Check if already found before retry
                    if (window.canvasDetectionCompleted || this.canvas) {
                        resolve(this.canvas);
                        return;
                    }

                    setTimeout(() => {
                        // Final guard check before retry
                        if (window.canvasDetectionCompleted || this.canvas) {
                            resolve(this.canvas);
                        } else {
                            // DO NOT CALL findCanvasInstance recursively - check immediate state only
                            const immediateCanvas = this.tryCanvasDetection();
                            resolve(immediateCanvas);
                        }
                    }, delay);
                });
            }

            console.error('❌ CANVAS DETECTION FAILED after 20 attempts');
            console.error('🔍 Final DOM state:', {
                canvasElements: canvasElements.length,
                templateEditor: !!document.querySelector('.template-editor'),
                canvasContainer: !!document.querySelector('.template-canvas-container'),
                windowProps: Object.keys(window).filter(k => k.toLowerCase().includes('template')),
                templateEditors: window.templateEditors ? window.templateEditors.size : 'not found',
                variationsManager: !!window.variationsManager
            });

            // Show user-friendly error with retry option
            this.showCanvasNotFoundError();
            return null;
        }

        // 🎯 ROBUST WAIT STRATEGY: Intelligent canvas instance detection with timing
        async getExistingCanvasInstance() {
            if (this.debugMode) {
                console.log('🔍 SEARCHING FOR EXISTING CANVAS INSTANCES (ROBUST MODE)...');
            }

            // First, try immediate detection
            const immediateCanvas = this.tryCanvasDetection();
            if (immediateCanvas) {
                return immediateCanvas;
            }

            // If immediate detection fails, use intelligent polling
            console.log('⏳ IMMEDIATE DETECTION FAILED - Starting intelligent polling...');
            return await this.waitForCanvasWithIntelligentPolling();
        }

        // Try canvas detection without waiting
        tryCanvasDetection() {
            // 🛡️ GUARD: Stop if already found
            if (window.canvasDetectionCompleted || this.canvas) {
                return this.canvas;
            }

            // Method A: Check templateEditors Map with relaxed validation
            if (window.templateEditors instanceof Map && window.templateEditors.size > 0) {
                for (const [key, editor] of window.templateEditors.entries()) {
                    if (editor && editor.canvas &&
                        typeof editor.canvas.add === 'function' &&
                        typeof editor.canvas.getObjects === 'function') {
                        // 🎯 RELAXED VALIDATION: getElement() can be null during initialization
                        console.log('✅ FOUND FUNCTIONAL CANVAS in templateEditor:', key, {
                            hasAdd: typeof editor.canvas.add === 'function',
                            hasGetObjects: typeof editor.canvas.getObjects === 'function',
                            hasGetElement: typeof editor.canvas.getElement === 'function',
                            elementExists: editor.canvas.getElement ? !!editor.canvas.getElement() : 'N/A'
                        });
                        return editor.canvas;
                    }
                }
            }

            // Method B: Check variationsManager with relaxed validation
            if (window.variationsManager && window.variationsManager.editors instanceof Map) {
                for (const [key, editor] of window.variationsManager.editors.entries()) {
                    if (editor && editor.canvas &&
                        typeof editor.canvas.add === 'function' &&
                        typeof editor.canvas.getObjects === 'function') {
                        // 🎯 RELAXED VALIDATION: getElement() can be null during initialization
                        console.log('✅ FOUND FUNCTIONAL CANVAS in variationsManager:', key, {
                            hasAdd: typeof editor.canvas.add === 'function',
                            hasGetObjects: typeof editor.canvas.getObjects === 'function',
                            hasGetElement: typeof editor.canvas.getElement === 'function',
                            elementExists: editor.canvas.getElement ? !!editor.canvas.getElement() : 'N/A'
                        });
                        return editor.canvas;
                    }
                }
            }

            // Method C: Check window.fabricCanvas with relaxed validation
            if (window.fabricCanvas &&
                typeof window.fabricCanvas.add === 'function' &&
                typeof window.fabricCanvas.getObjects === 'function') {
                // 🎯 RELAXED VALIDATION: getElement() can be null during initialization
                console.log('✅ FOUND FUNCTIONAL CANVAS in window.fabricCanvas', {
                    hasAdd: typeof window.fabricCanvas.add === 'function',
                    hasGetObjects: typeof window.fabricCanvas.getObjects === 'function',
                    hasGetElement: typeof window.fabricCanvas.getElement === 'function',
                    elementExists: window.fabricCanvas.getElement ? !!window.fabricCanvas.getElement() : 'N/A'
                });
                return window.fabricCanvas;
            }

            // Method D: Check for fabric instances with relaxed validation
            if (window.fabric && window.fabric.Canvas && window.fabric.Canvas.getInstances) {
                const instances = window.fabric.Canvas.getInstances();
                for (const instance of instances) {
                    if (instance &&
                        typeof instance.add === 'function' &&
                        typeof instance.getObjects === 'function') {
                        // 🎯 RELAXED VALIDATION: getElement() can be null during initialization
                        console.log('✅ FOUND FUNCTIONAL CANVAS in fabric instances', {
                            hasAdd: typeof instance.add === 'function',
                            hasGetObjects: typeof instance.getObjects === 'function',
                            hasGetElement: typeof instance.getElement === 'function',
                            elementExists: instance.getElement ? !!instance.getElement() : 'N/A'
                        });
                        return instance;
                    }
                }
            }

            return null;
        }

        // Intelligent polling strategy with progressive delays
        async waitForCanvasWithIntelligentPolling() {
            return new Promise((resolve, reject) => {
                // 🛡️ GUARD: Check if already completed before starting
                if (window.canvasDetectionCompleted || this.canvas) {
                    resolve(this.canvas);
                    return;
                }

                let attempts = 0;
                const maxAttempts = 40; // Increased for async initialization detection
                const baseDelay = 100; // More frequent checking for better responsiveness
                let pollInterval = null;

                const poll = () => {
                    // 🛡️ GUARD: Stop if completed by another method
                    if (window.canvasDetectionCompleted || this.canvas) {
                        if (pollInterval) clearTimeout(pollInterval);
                        resolve(this.canvas);
                        return;
                    }

                    attempts++;
                    // 🟢 LOG-SPAM ELIMINATION: Only log every 5 attempts
                    if (attempts % 5 === 1 || attempts === 1) {
                        console.log(`🔄 Canvas polling attempt ${attempts}/${maxAttempts}`);
                    }

                    const canvas = this.tryCanvasDetection();
                    if (canvas) {
                        console.log('✅ CANVAS FOUND via intelligent polling!');
                        window.canvasDetectionCompleted = true;
                        this.stopAllDetectionMethods();
                        resolve(canvas);
                        return;
                    }

                    if (attempts >= maxAttempts) {
                        console.log('❌ INTELLIGENT POLLING TIMEOUT - Canvas not found after', maxAttempts, 'attempts');
                        resolve(null);
                        return;
                    }

                    // Progressive delay: 200ms, 400ms, 600ms, ..., max 2000ms
                    const delay = Math.min(baseDelay * attempts, 2000);
                    pollInterval = setTimeout(poll, delay);
                };

                // Start polling
                poll();
            });
        }

        findCanvasElementForFabric() {
            // Look for a canvas element that could be used to create a Fabric.js instance
            const canvasElements = document.querySelectorAll('canvas');

            // Prefer canvas elements within template containers
            for (const canvas of canvasElements) {
                const container = canvas.closest('.template-canvas-container, .template-editor, .canvas-container');
                if (container && !canvas.__fabric && canvas.width > 0 && canvas.height > 0) {
                    console.log('🎯 Found potential canvas element for Fabric.js creation:', canvas);
                    return canvas;
                }
            }

            // Fallback: any canvas without Fabric that has dimensions
            for (const canvas of canvasElements) {
                if (!canvas.__fabric && canvas.width > 0 && canvas.height > 0) {
                    console.log('🎯 Found fallback canvas element:', canvas);
                    return canvas;
                }
            }

            return null;
        }

        showCanvasNotFoundError() {
            const errorMessage = $(`
                <div class="notice notice-error is-dismissible" style="margin: 20px 0;">
                    <p><strong>Canvas Detection Failed:</strong> Cannot find Fabric.js canvas instance after 20 attempts.</p>
                    <p>This usually means the Template Editor hasn't fully initialized yet.</p>
                    <div style="margin-top: 10px;">
                        <button type="button" class="button button-primary retry-canvas-detection">
                            🔄 Retry Canvas Detection
                        </button>
                        <button type="button" class="button force-refresh-page" style="margin-left: 10px;">
                            🔃 Refresh Page
                        </button>
                    </div>
                    <button type="button" class="notice-dismiss"><span class="screen-reader-text">Dismiss this notice.</span></button>
                </div>
            `);

            // Add click handlers
            errorMessage.on('click', '.retry-canvas-detection', () => {
                console.log('🔄 Manual retry triggered by user');
                this.retryAttempts = 0; // Reset retry counter
                errorMessage.remove();
                this.startReferenceLineCreation();
            });

            errorMessage.on('click', '.force-refresh-page', () => {
                window.location.reload();
            });

            $('.template-editor-toolbar').after(errorMessage);
        }

        showCanvasError() {
            const errorMessage = $(`
                <div class="notice notice-error is-dismissible" style="margin: 20px 0;">
                    <p><strong>Canvas Error:</strong> Cannot find Fabric.js canvas instance.</p>
                    <p>Please ensure the Template View is loaded properly.</p>
                    <button type="button" class="notice-dismiss"><span class="screen-reader-text">Dismiss this notice.</span></button>
                </div>
            `);
            $('.template-editor-toolbar').after(errorMessage);

            setTimeout(() => {
                errorMessage.fadeOut(() => errorMessage.remove());
            }, 8000);
        }

        addCanvasListeners() {
            if (this.canvas && this.canvas.on) {
                this.canvas.on('mouse:down', this.handleFabricCanvasClick.bind(this));
            }
        }

        removeCanvasListeners() {
            if (this.canvas && this.canvas.off) {
                this.canvas.off('mouse:down', this.handleFabricCanvasClick.bind(this));
            }
        }

        handleFabricCanvasClick(e) {
            if (!this.isActive) return;

            const pointer = this.canvas.getPointer(e.e);

            if (this.clickCount === 0) {
                // First click - set start point
                this.startPoint = pointer;
                this.clickCount = 1;
                this.updateInstruction('Click to set the end point of the reference line');
                this.addTemporaryStartMarker(pointer);

            } else if (this.clickCount === 1) {
                // Second click - set end point and complete
                this.endPoint = pointer;
                this.completeReferenceLine();
            }
        }

        handleCanvasClick(e) {
            // Fallback for non-Fabric canvas
            const rect = e.target.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            if (this.clickCount === 0) {
                this.startPoint = { x, y };
                this.clickCount = 1;
                this.updateInstruction('Click to set the end point of the reference line');

            } else if (this.clickCount === 1) {
                this.endPoint = { x, y };
                this.completeReferenceLine();
            }
        }

        addTemporaryStartMarker(point) {
            if (!this.canvas) return;

            // Remove existing marker
            this.removeTemporaryMarkers();

            // Add start point marker
            const marker = new fabric.Circle({
                left: point.x - 5,
                top: point.y - 5,
                radius: 5,
                fill: '#0073aa',
                stroke: '#ffffff',
                strokeWidth: 2,
                selectable: false,
                evented: false,
                isTemporaryMarker: true
            });

            this.canvas.add(marker);
            this.canvas.renderAll();
        }

        removeTemporaryMarkers() {
            if (!this.canvas) return;

            const markers = this.canvas.getObjects().filter(obj => obj.isTemporaryMarker);
            markers.forEach(marker => this.canvas.remove(marker));
            this.canvas.renderAll();
        }

        completeReferenceLine() {
            if (!this.startPoint || !this.endPoint) return;

            // Calculate line length in pixels
            const dx = this.endPoint.x - this.startPoint.x;
            const dy = this.endPoint.y - this.startPoint.y;
            const lengthPx = Math.sqrt(dx * dx + dy * dy);

            // Create the reference line data
            const referenceData = {
                type: this.currentReferenceType,
                start: this.startPoint,
                end: this.endPoint,
                lengthPx: Math.round(lengthPx),
                angle: Math.atan2(dy, dx) * (180 / Math.PI),
                timestamp: Date.now()
            };

            // Add visual representation
            this.addReferenceLineToCanvas(referenceData);

            // Save to post meta or view system
            this.saveReferenceLineData(referenceData);

            // Show completion message
            this.showCompletionMessage(referenceData);

            // Reset the system
            this.resetReferenceMode();
        }

        addReferenceLineToCanvas(data) {
            if (!this.canvas) return;

            // Remove temporary markers
            this.removeTemporaryMarkers();

            // Create reference line
            const line = new fabric.Line([
                data.start.x, data.start.y,
                data.end.x, data.end.y
            ], {
                stroke: '#ff6b6b',
                strokeWidth: 3,
                strokeDashArray: [5, 5],
                selectable: false,
                evented: false,
                isReferenceLine: true,
                referenceData: data
            });

            // Add start and end markers
            const startMarker = new fabric.Circle({
                left: data.start.x - 6,
                top: data.start.y - 6,
                radius: 6,
                fill: '#ff6b6b',
                stroke: '#ffffff',
                strokeWidth: 2,
                selectable: false,
                evented: false,
                isReferenceLine: true
            });

            const endMarker = new fabric.Circle({
                left: data.end.x - 6,
                top: data.end.y - 6,
                radius: 6,
                fill: '#ff6b6b',
                stroke: '#ffffff',
                strokeWidth: 2,
                selectable: false,
                evented: false,
                isReferenceLine: true
            });

            // Add label
            const labelText = `${data.type.replace('_', ' ').toUpperCase()}\n${data.lengthPx}px`;
            const label = new fabric.Text(labelText, {
                left: (data.start.x + data.end.x) / 2,
                top: (data.start.y + data.end.y) / 2 - 20,
                fontSize: 12,
                fill: '#ff6b6b',
                backgroundColor: 'rgba(255,255,255,0.8)',
                textAlign: 'center',
                selectable: false,
                evented: false,
                isReferenceLine: true
            });

            this.canvas.add(line, startMarker, endMarker, label);
            this.canvas.renderAll();
        }

        saveReferenceLineData(data) {
            const postId = this.getPostId();
            if (!postId) return;

            // Save via AJAX
            $.post(window.ajaxurl || octoPrintDesigner.ajaxUrl, {
                action: 'save_reference_line_data',
                post_id: postId,
                reference_data: JSON.stringify(data),
                nonce: window.octoPrintDesigner?.nonce || $('[name="octo_template_nonce"]').val() || $('#octo_template_nonce').val()
            })
            .done((response) => {
                console.log('Reference line data saved:', response);
            })
            .fail((xhr, status, error) => {
                console.error('Failed to save reference line data:', error);
            });
        }

        getPostId() {
            return $('[name="post_ID"]').val() || $('#post_ID').val();
        }

        showInstruction() {
            const instruction = $(`
                <div class="reference-line-instruction">
                    Click to set the start point of your ${this.currentReferenceType.replace('_', ' ')} reference line
                    <small style="display: block; margin-top: 5px;">Press ESC to cancel</small>
                </div>
            `);
            $('body').append(instruction);
        }

        updateInstruction(text) {
            $('.reference-line-instruction').html(`
                ${text}
                <small style="display: block; margin-top: 5px;">Press ESC to cancel</small>
            `);
        }

        hideInstruction() {
            $('.reference-line-instruction').remove();
        }

        showCompletionMessage(data) {
            const message = $(`
                <div class="notice notice-success is-dismissible" style="margin: 20px 0;">
                    <p><strong>Reference Line Created!</strong></p>
                    <p>Type: ${data.type.replace('_', ' ').toUpperCase()}</p>
                    <p>Length: ${data.lengthPx} pixels</p>
                    <button type="button" class="notice-dismiss"><span class="screen-reader-text">Dismiss this notice.</span></button>
                </div>
            `);

            $('.template-editor-toolbar').after(message);

            // Auto-dismiss after 5 seconds
            setTimeout(() => {
                message.fadeOut(() => message.remove());
            }, 5000);
        }

        resetReferenceMode() {
            this.isActive = false;
            this.currentReferenceType = null;
            this.clickCount = 0;
            this.startPoint = null;
            this.endPoint = null;

            $('.mode-select').removeClass('active');
            this.hideInstruction();
            this.removeCanvasListeners();
        }

        cancelReferenceMode() {
            this.removeTemporaryMarkers();
            this.resetReferenceMode();

            // Show cancellation message
            const message = $('<div class="notice notice-warning is-dismissible" style="margin: 20px 0;"><p>Reference line creation cancelled.</p></div>');
            $('.template-editor-toolbar').after(message);
            setTimeout(() => message.fadeOut(() => message.remove()), 3000);
        }

        closeModal() {
            $('#reference-line-modal').hide();
        }
    }

    // System status checker
    function checkSystemStatus() {
        console.log('🔍 SYSTEM STATUS CHECK:');
        console.log('- jQuery loaded:', typeof $ !== 'undefined');
        console.log('- Fabric.js loaded:', typeof fabric !== 'undefined');
        console.log('- Current URL:', window.location.href);
        console.log('- Page title:', document.title);
        console.log('- Canvas elements:', document.querySelectorAll('canvas').length);
        console.log('- Template elements:', document.querySelectorAll('[class*="template"]').length);
        console.log('- Admin body classes:', document.body.className);

        // Check for admin.bundle.js components
        const scripts = Array.from(document.querySelectorAll('script[src*="admin.bundle"]'));
        console.log('- Admin bundle loaded:', scripts.length > 0);

        // Check window objects that might contain canvas
        const windowProps = Object.getOwnPropertyNames(window).filter(prop =>
            prop.toLowerCase().includes('template') ||
            prop.toLowerCase().includes('editor') ||
            prop.toLowerCase().includes('canvas') ||
            prop.toLowerCase().includes('fabric')
        );
        console.log('- Relevant window properties:', windowProps);
    }

    // Initialize when DOM is ready
    $(document).ready(function() {
        console.log('🚀 REFERENCE LINE SYSTEM INITIALIZATION');
        checkSystemStatus();

        // Wait for Fabric.js to be available
        function waitForFabric(attempts = 0) {
            const maxAttempts = 20;
            const delay = 500;

            // Method 1: Check global fabric
            if (typeof fabric !== 'undefined' && window.fabric && window.fabric.Canvas) {
                console.log('✅ Fabric.js is now available, initializing reference line system');
                checkSystemStatus();
                new ReferenceLineSystem();
                return;
            }

            // Method 2: Check window.fabric directly
            if (window.fabric && window.fabric.Canvas) {
                console.log('✅ Fabric.js found via window.fabric, initializing reference line system');
                checkSystemStatus();
                new ReferenceLineSystem();
                return;
            }

            // Method 3: Check if admin bundle has initialized Template Editor with fabricCanvas
            const adminCanvasElements = document.querySelectorAll('canvas');
            let foundFabricInstance = false;

            for (const canvas of adminCanvasElements) {
                if (canvas.__fabric) {
                    console.log('✅ Found Fabric.js instance attached to canvas element');
                    window.fabric = canvas.__fabric.constructor.fabric || canvas.__fabric.fabric;
                    if (window.fabric && window.fabric.Canvas) {
                        foundFabricInstance = true;
                        break;
                    }
                }
            }

            if (foundFabricInstance) {
                console.log('✅ Fabric.js extracted from canvas instance, initializing reference line system');
                checkSystemStatus();
                new ReferenceLineSystem();
                return;
            }

            // Method 4: Check webpack chunks for Fabric.js
            if (window.webpackChunkocto_print_designer || window.__webpack_require__) {
                console.log('🔍 Checking webpack chunks for Fabric.js...');
                try {
                    // Try to access Fabric.js from webpack modules
                    if (window.__webpack_require__) {
                        const fabricModule = window.__webpack_require__('./node_modules/fabric/dist/index.min.mjs');
                        if (fabricModule && fabricModule.Canvas) {
                            window.fabric = fabricModule;
                            console.log('✅ Fabric.js found in webpack modules, initializing reference line system');
                            checkSystemStatus();
                            new ReferenceLineSystem();
                            return;
                        }
                    }
                } catch (e) {
                    console.log('🔍 Webpack module access failed:', e.message);
                }
            }

            if (attempts < maxAttempts) {
                console.log(`⏳ Waiting for Fabric.js... (attempt ${attempts + 1}/${maxAttempts})`);
                setTimeout(() => waitForFabric(attempts + 1), delay);
            } else {
                console.error('❌ Fabric.js never became available after', maxAttempts, 'attempts');
                console.error('Available window properties:', Object.keys(window).filter(k => k.toLowerCase().includes('fabric')));
                console.error('Trying fallback initialization anyway...');
                new ReferenceLineSystem();
            }
        }

        // Start waiting for Fabric.js
        waitForFabric();
    });

})(jQuery);