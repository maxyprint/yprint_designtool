/**
 * VIEW-SWITCH RACE CONDITION FIX
 *
 * Problem: Async image loading in loadViewImage() lacks view context validation.
 * Images loaded after view switch get added to wrong canvas.
 *
 * Solution: Capture current view context before async operation,
 * validate context hasn't changed before applying image to canvas.
 */

(function() {
    'use strict';

    console.log('🔧 VIEW-SWITCH RACE CONDITION FIX: Initializing...');

    /**
     * Wait for designer widget to be available
     */
    function waitForDesignerWidget(callback, maxAttempts = 20) {
        let attempts = 0;

        const checkWidget = setInterval(() => {
            attempts++;

            // Check multiple possible widget instances
            const widget = window.designerWidgetInstance ||
                          window.designerWidget ||
                          window.DesignerWidget?.instance;

            if (widget && widget.loadViewImage) {
                clearInterval(checkWidget);
                console.log('✅ Designer widget found - applying race condition fix');
                callback(widget);
            } else if (attempts >= maxAttempts) {
                clearInterval(checkWidget);
                console.warn('⚠️ Designer widget not found after', maxAttempts, 'attempts');
            }
        }, 200);
    }

    /**
     * Apply race condition fix to designer widget
     */
    function applyRaceConditionFix(widget) {
        // Store original loadViewImage function
        const originalLoadViewImage = widget.loadViewImage;

        if (!originalLoadViewImage) {
            console.error('❌ loadViewImage function not found on widget');
            return;
        }

        // Replace with patched version
        widget.loadViewImage = function(viewKey, variationId) {
            // CRITICAL: Capture current view context BEFORE async operation
            const contextView = this.currentView;
            const contextVariation = this.currentVariation || variationId;

            console.log('🔍 Loading view image:', {
                viewKey,
                variationId,
                capturedContext: {
                    view: contextView,
                    variation: contextVariation
                }
            });

            // Get image data
            const imageData = this.getViewImage ? this.getViewImage(viewKey, variationId) : null;

            if (!imageData || !imageData.url) {
                console.warn('⚠️ No image data for view:', viewKey);
                return;
            }

            // Async image loading with context validation
            const _this = this;

            if (typeof fabric !== 'undefined' && fabric.Image && fabric.Image.fromURL) {
                fabric.Image.fromURL(imageData.url, function(img) {
                    // RACE CONDITION FIX: Validate view context before applying
                    if (contextView !== _this.currentView) {
                        console.warn('🚫 View switched during image load - aborting:', {
                            expected: contextView,
                            actual: _this.currentView,
                            imageUrl: imageData.url
                        });
                        return; // ABORT - context has changed
                    }

                    // Context is still valid - safe to apply image
                    if (img && imageData.transform) {
                        img.set(imageData.transform);
                    }

                    if (_this.fabricCanvas && img) {
                        _this.fabricCanvas.add(img);
                        _this.fabricCanvas.renderAll();

                        console.log('✅ Image loaded and added to canvas:', {
                            view: contextView,
                            imageUrl: imageData.url
                        });
                    }
                }, {
                    crossOrigin: 'anonymous'
                });
            } else {
                console.error('❌ Fabric.js not available for image loading');
            }
        };

        console.log('✅ Race condition fix applied to loadViewImage()');

        // Dispatch event for other systems
        window.dispatchEvent(new CustomEvent('viewSwitchRaceConditionFixed', {
            detail: {
                widget: widget,
                timestamp: new Date().toISOString()
            }
        }));
    }

    /**
     * Initialize fix when DOM is ready
     */
    function init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                setTimeout(() => waitForDesignerWidget(applyRaceConditionFix), 500);
            });
        } else {
            setTimeout(() => waitForDesignerWidget(applyRaceConditionFix), 500);
        }
    }

    init();

})();
