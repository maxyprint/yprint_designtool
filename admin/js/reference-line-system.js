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
            this.init();
        }

        init() {
            this.bindEvents();
            this.setupModal();
            this.setupCanvasDetection();
        }

        setupCanvasDetection() {
            // Set up MutationObserver to detect when canvas is added to DOM
            this.mutationObserver = new MutationObserver((mutations) => {
                for (let mutation of mutations) {
                    if (mutation.type === 'childList') {
                        const addedNodes = Array.from(mutation.addedNodes);
                        for (let node of addedNodes) {
                            if (node.nodeType === Node.ELEMENT_NODE) {
                                // Check if a canvas was added
                                if (node.tagName === 'CANVAS') {
                                    console.log('🔍 MutationObserver: Canvas element added to DOM', node);
                                    this.checkCanvasForFabric(node);
                                }
                                // Check if any child contains a canvas
                                const canvasElements = node.querySelectorAll && node.querySelectorAll('canvas');
                                if (canvasElements && canvasElements.length > 0) {
                                    console.log('🔍 MutationObserver: Canvas found in added element', canvasElements);
                                    canvasElements.forEach(canvas => this.checkCanvasForFabric(canvas));
                                }
                            }
                        }
                    }
                }
            });

            // Start observing
            this.mutationObserver.observe(document.body, {
                childList: true,
                subtree: true
            });

            console.log('🔍 MutationObserver started for canvas detection');
        }

        checkCanvasForFabric(canvasElement) {
            // Check immediately
            if (canvasElement.__fabric) {
                console.log('✅ MutationObserver: Found Fabric.js canvas!', canvasElement.__fabric);
                window.fabricCanvas = canvasElement.__fabric;
                this.canvas = canvasElement.__fabric;
                return true;
            }

            // Sometimes Fabric.js is attached after the element is added, so we wait a bit
            setTimeout(() => {
                if (canvasElement.__fabric) {
                    console.log('✅ MutationObserver: Found Fabric.js canvas (delayed)!', canvasElement.__fabric);
                    window.fabricCanvas = canvasElement.__fabric;
                    this.canvas = canvasElement.__fabric;
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

        startReferenceLineCreation() {
            this.isActive = true;
            this.clickCount = 0;

            // Highlight the active button
            $('.mode-select').removeClass('active');
            $('[data-mode="referenceline"]').addClass('active');

            // Get the canvas instance (improve detection)
            this.canvas = this.findCanvasInstance();

            if (!this.canvas) {
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

        findCanvasInstance() {
            console.log('🚀 STARTING CANVAS DETECTION - Attempt:', this.retryAttempts || 0);

            // Method 1: Check for globally exposed canvas
            if (window.fabricCanvas) {
                console.log('✅ Found global fabricCanvas');
                return window.fabricCanvas;
            }

            // Method 2: Look for canvas elements with Fabric.js attached
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
            }

            // Method 7: Wait and retry if we haven't exceeded attempts
            if (this.retryAttempts < 10) {
                this.retryAttempts++;
                const delay = this.retryAttempts <= 3 ? 1000 : 2000; // Longer delays after 3 attempts
                console.log(`⏳ Canvas not ready, retrying in ${delay}ms (attempt ${this.retryAttempts}/10)`);

                setTimeout(() => {
                    this.startReferenceLineCreation();
                }, delay);
                return null;
            }

            console.error('❌ CANVAS DETECTION FAILED after 10 attempts');
            console.error('🔍 Final DOM state:', {
                canvasElements: canvasElements.length,
                templateEditor: !!document.querySelector('.template-editor'),
                canvasContainer: !!document.querySelector('.template-canvas-container'),
                windowProps: Object.keys(window).filter(k => k.toLowerCase().includes('template'))
            });
            return null;
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

            if (typeof fabric !== 'undefined' && window.fabric && window.fabric.Canvas) {
                console.log('✅ Fabric.js is now available, initializing reference line system');
                checkSystemStatus();
                new ReferenceLineSystem();
                return;
            }

            // Check if vendor bundle loaded Fabric.js
            if (window.fabric && window.fabric.Canvas) {
                console.log('✅ Fabric.js found via window.fabric, initializing reference line system');
                checkSystemStatus();
                new ReferenceLineSystem();
                return;
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