/**
 * Fabric.js toCanvasElement() Safari Fix
 *
 * Fixes the critical bug where toCanvasElement() returns 0x0 canvas in Safari
 * This is a common Fabric.js issue in Safari with temporary canvas creation
 */

console.log('🔧 FABRIC CANVAS FIX: Initializing Safari toCanvasElement() patch...');

// Store original toCanvasElement method
let originalToCanvasElement = null;

// Apply fix when fabric is available
function applyFabricCanvasFix() {
    if (typeof fabric === 'undefined' || !fabric.Canvas) {
        console.log('🔧 FABRIC CANVAS FIX: Fabric not ready, retrying...');
        return false;
    }

    // Only patch if not already patched
    if (originalToCanvasElement) {
        console.log('🔧 FABRIC CANVAS FIX: Already patched');
        return true;
    }

    try {
        // Store original method
        originalToCanvasElement = fabric.Canvas.prototype.toCanvasElement;

        // Create patched method
        fabric.Canvas.prototype.toCanvasElement = function(multiplier, cropping) {
            console.log('[FABRIC-FIX] toCanvasElement() called with:', {
                multiplier: multiplier,
                cropping: cropping,
                canvasSize: { width: this.width, height: this.height },
                objectCount: this.getObjects().length
            });

            // Try original method first
            let result = originalToCanvasElement.call(this, multiplier, cropping);

            console.log('[FABRIC-FIX] Original result:', {
                width: result.width,
                height: result.height,
                tagName: result.tagName
            });

            // Check if we got invalid 0x0 canvas (Safari bug)
            if (result.width === 0 || result.height === 0) {
                console.warn('[FABRIC-FIX] 🚨 Detected 0x0 canvas bug - applying Safari fix...');

                // Calculate expected dimensions
                const expectedWidth = Math.floor(this.width * (multiplier || 1));
                const expectedHeight = Math.floor(this.height * (multiplier || 1));

                console.log('[FABRIC-FIX] Expected dimensions:', {
                    expectedWidth: expectedWidth,
                    expectedHeight: expectedHeight,
                    multiplier: multiplier || 1
                });

                // Create manual canvas with proper dimensions
                const manualCanvas = document.createElement('canvas');
                manualCanvas.width = expectedWidth;
                manualCanvas.height = expectedHeight;

                const ctx = manualCanvas.getContext('2d');

                // Set background if specified
                if (this.backgroundColor) {
                    ctx.fillStyle = this.backgroundColor;
                    ctx.fillRect(0, 0, expectedWidth, expectedHeight);
                }

                // Use native HTML5 Canvas API to render fabric canvas
                try {
                    // Get the lower canvas element (the actual rendered canvas)
                    const lowerCanvas = this.lowerCanvasEl;
                    if (lowerCanvas && lowerCanvas.width > 0 && lowerCanvas.height > 0) {
                        console.log('[FABRIC-FIX] Using lowerCanvasEl approach:', {
                            sourceWidth: lowerCanvas.width,
                            sourceHeight: lowerCanvas.height
                        });

                        // Scale and draw the existing canvas onto our new canvas
                        ctx.drawImage(
                            lowerCanvas,
                            0, 0, lowerCanvas.width, lowerCanvas.height,
                            0, 0, expectedWidth, expectedHeight
                        );
                    } else {
                        console.warn('[FABRIC-FIX] lowerCanvasEl not available, using manual render...');

                        // Fallback: render each object manually
                        const objects = this.getObjects();
                        console.log('[FABRIC-FIX] Manually rendering', objects.length, 'objects');

                        // Save context state
                        ctx.save();

                        // Scale context for multiplier
                        if (multiplier && multiplier !== 1) {
                            ctx.scale(multiplier, multiplier);
                        }

                        // Render each object
                        objects.forEach((obj, index) => {
                            try {
                                if (obj.type === 'image' && obj._element) {
                                    console.log(`[FABRIC-FIX] Rendering image object ${index}:`, {
                                        left: obj.left,
                                        top: obj.top,
                                        width: obj.width,
                                        height: obj.height
                                    });

                                    ctx.drawImage(
                                        obj._element,
                                        obj.left || 0,
                                        obj.top || 0,
                                        obj.width * (obj.scaleX || 1),
                                        obj.height * (obj.scaleY || 1)
                                    );
                                }
                            } catch (objError) {
                                console.error('[FABRIC-FIX] Error rendering object', index, ':', objError);
                            }
                        });

                        // Restore context state
                        ctx.restore();
                    }

                    console.log('[FABRIC-FIX] ✅ Manual canvas created successfully:', {
                        width: manualCanvas.width,
                        height: manualCanvas.height
                    });

                    return manualCanvas;

                } catch (manualError) {
                    console.error('[FABRIC-FIX] Manual canvas creation failed:', manualError);

                    // Last resort: return original result even if 0x0
                    console.warn('[FABRIC-FIX] Returning original 0x0 canvas as last resort');
                    return result;
                }
            }

            console.log('[FABRIC-FIX] ✅ Original method worked fine');
            return result;
        };

        console.log('✅ FABRIC CANVAS FIX: Safari patch applied successfully');
        return true;

    } catch (error) {
        console.error('❌ FABRIC CANVAS FIX: Patch failed:', error);
        return false;
    }
}

// Try to apply fix immediately
if (!applyFabricCanvasFix()) {
    // If fabric not ready, wait for it
    let retryCount = 0;
    const maxRetries = 20;

    const retryInterval = setInterval(() => {
        retryCount++;

        if (applyFabricCanvasFix()) {
            clearInterval(retryInterval);
            console.log('✅ FABRIC CANVAS FIX: Applied after', retryCount, 'retries');
        } else if (retryCount >= maxRetries) {
            clearInterval(retryInterval);
            console.error('❌ FABRIC CANVAS FIX: Failed to apply after', maxRetries, 'retries');
        }
    }, 100);
}

// Also listen for fabric ready events
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        applyFabricCanvasFix();
    }, 500);
});

// Export for debugging
window.fabricCanvasFix = {
    isPatched: () => originalToCanvasElement !== null,
    reapply: applyFabricCanvasFix
};

console.log('🔧 FABRIC CANVAS FIX: Initialization complete');