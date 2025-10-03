/**
 * CANVAS-RESIZE COORDINATE SCALING FIX
 *
 * Problem: Absolute pixel coordinates become invalid when canvas dimensions change
 * (responsive layouts, window resize, zoom changes).
 *
 * Solution: Track original canvas dimensions, apply proportional scaling when
 * dimensions change, update stored coordinates accordingly.
 */

(function() {
    'use strict';

    console.log('📐 CANVAS-RESIZE COORDINATE SCALING: Initializing...');

    class CanvasResizeCoordinateScaling {
        constructor() {
            this.originalDimensions = new Map(); // canvasId -> { width, height }
            this.resizeObserver = null;
            this.initialized = false;
        }

        /**
         * Initialize coordinate scaling system
         */
        init() {
            if (this.initialized) return;

            // Wait for designer widget
            this.waitForDesigner((widget) => {
                this.widget = widget;
                this.setupResizeTracking();
                this.initialized = true;
                console.log('✅ Canvas resize coordinate scaling initialized');
            });
        }

        /**
         * Wait for designer widget to be available
         */
        waitForDesigner(callback, maxAttempts = 20) {
            let attempts = 0;

            const check = setInterval(() => {
                attempts++;

                const widget = window.designerWidgetInstance ||
                              window.designerWidget ||
                              window.DesignerWidget?.instance;

                if (widget && widget.fabricCanvas) {
                    clearInterval(check);
                    callback(widget);
                } else if (attempts >= maxAttempts) {
                    clearInterval(check);
                    console.warn('⚠️ Designer widget not found for resize scaling');
                }
            }, 200);
        }

        /**
         * Setup resize tracking using ResizeObserver
         */
        setupResizeTracking() {
            if (!this.widget || !this.widget.fabricCanvas) return;

            const canvas = this.widget.fabricCanvas;
            const canvasElement = canvas.upperCanvasEl || canvas.lowerCanvasEl;

            if (!canvasElement) {
                console.warn('⚠️ Canvas element not found');
                return;
            }

            // Store original dimensions
            const canvasId = 'main-canvas';
            this.originalDimensions.set(canvasId, {
                width: canvas.width,
                height: canvas.height
            });

            console.log('📐 Original canvas dimensions:', {
                width: canvas.width,
                height: canvas.height
            });

            // Setup ResizeObserver if available
            if (typeof ResizeObserver !== 'undefined') {
                this.resizeObserver = new ResizeObserver((entries) => {
                    for (const entry of entries) {
                        this.handleCanvasResize(entry);
                    }
                });

                this.resizeObserver.observe(canvasElement);
                console.log('👁️ ResizeObserver monitoring canvas resize');
            }

            // Fallback: Window resize event
            window.addEventListener('resize', () => {
                setTimeout(() => this.checkCanvasResize(), 100);
            });
        }

        /**
         * Handle canvas resize event
         */
        handleCanvasResize(entry) {
            if (!this.widget || !this.widget.fabricCanvas) return;

            const canvas = this.widget.fabricCanvas;
            const canvasId = 'main-canvas';
            const original = this.originalDimensions.get(canvasId);

            if (!original) return;

            const currentWidth = canvas.width;
            const currentHeight = canvas.height;

            // Check if dimensions actually changed
            if (currentWidth === original.width && currentHeight === original.height) {
                return; // No change
            }

            console.log('📐 Canvas resize detected:', {
                original: original,
                current: { width: currentWidth, height: currentHeight }
            });

            // Calculate scaling factors
            const scaleX = currentWidth / original.width;
            const scaleY = currentHeight / original.height;

            console.log('📐 Scaling factors:', {
                scaleX: scaleX.toFixed(4),
                scaleY: scaleY.toFixed(4)
            });

            // Apply coordinate scaling to all objects
            this.scaleObjectCoordinates(canvas, scaleX, scaleY);

            // Update original dimensions
            this.originalDimensions.set(canvasId, {
                width: currentWidth,
                height: currentHeight
            });
        }

        /**
         * Check canvas resize (fallback for browsers without ResizeObserver)
         */
        checkCanvasResize() {
            if (!this.widget || !this.widget.fabricCanvas) return;

            const canvas = this.widget.fabricCanvas;
            const canvasId = 'main-canvas';
            const original = this.originalDimensions.get(canvasId);

            if (!original) return;

            const currentWidth = canvas.width;
            const currentHeight = canvas.height;

            if (currentWidth !== original.width || currentHeight !== original.height) {
                this.handleCanvasResize(null);
            }
        }

        /**
         * Scale coordinates of all canvas objects
         */
        scaleObjectCoordinates(canvas, scaleX, scaleY) {
            const objects = canvas.getObjects();

            if (objects.length === 0) {
                console.log('📐 No objects to scale');
                return;
            }

            console.log(`📐 Scaling ${objects.length} objects...`);

            let scaledCount = 0;

            objects.forEach((obj) => {
                // Skip internal/system objects
                if (obj.selectable === false || obj.evented === false) {
                    return;
                }

                // Scale position
                if (obj.left !== undefined) {
                    obj.set('left', obj.left * scaleX);
                }
                if (obj.top !== undefined) {
                    obj.set('top', obj.top * scaleY);
                }

                // Scale dimensions (if not using scaleX/scaleY already)
                if (obj.width !== undefined && !obj.scaleX) {
                    obj.set('width', obj.width * scaleX);
                }
                if (obj.height !== undefined && !obj.scaleY) {
                    obj.set('height', obj.height * scaleY);
                }

                // For text objects, scale font size
                if ((obj.type === 'i-text' || obj.type === 'text' || obj.type === 'textbox') && obj.fontSize) {
                    const avgScale = (scaleX + scaleY) / 2;
                    obj.set('fontSize', obj.fontSize * avgScale);
                }

                obj.setCoords(); // Update object coordinates
                scaledCount++;
            });

            canvas.renderAll();

            console.log(`✅ Scaled ${scaledCount} objects`);

            // Dispatch event for other systems
            window.dispatchEvent(new CustomEvent('canvasCoordinatesScaled', {
                detail: {
                    scaleX,
                    scaleY,
                    objectsScaled: scaledCount,
                    timestamp: new Date().toISOString()
                }
            }));
        }

        /**
         * Get current scaling metadata for saving
         */
        getScalingMetadata() {
            if (!this.widget || !this.widget.fabricCanvas) {
                return null;
            }

            const canvas = this.widget.fabricCanvas;
            const canvasId = 'main-canvas';
            const original = this.originalDimensions.get(canvasId);

            if (!original) return null;

            return {
                original_dimensions: original,
                current_dimensions: {
                    width: canvas.width,
                    height: canvas.height
                },
                scaling_applied: canvas.width !== original.width || canvas.height !== original.height
            };
        }
    }

    // Initialize when DOM is ready
    function init() {
        const scaling = new CanvasResizeCoordinateScaling();

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => scaling.init(), 1000);
            });
        } else {
            setTimeout(() => scaling.init(), 1000);
        }

        // Make globally available
        window.canvasResizeScaling = scaling;
    }

    init();

})();
