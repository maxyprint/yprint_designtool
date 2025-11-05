/**
 * 🎯 CLIPMASK FIX VERIFICATION TEST
 *
 * Testet ob der clipMask Koordinaten-Bug gefixt wurde.
 * Run in browser console on https://yprint.de/designer/
 */

async function testClipMaskFixVerification() {
    console.log('🎯 TESTING: ClipMask Fix Verification...');
    console.log('');

    try {
        // Step 1: Check Designer Widget
        const designerWidget = window.designerWidgetInstance;
        if (!designerWidget) {
            console.error('❌ No designerWidgetInstance found');
            return false;
        }

        const fabricCanvas = designerWidget.fabricCanvas;
        if (!fabricCanvas) {
            console.error('❌ No fabricCanvas found');
            return false;
        }

        const clipMask = designerWidget.clipMask;
        if (!clipMask) {
            console.error('❌ No clipMask found');
            return false;
        }

        console.log('✅ Step 1: Designer components found');

        // Step 2: Analyze clipMask dimensions vs canvas
        console.log('🔍 Step 2: Analyzing clipMask dimensions...');

        const canvasWidth = fabricCanvas.width;
        const canvasHeight = fabricCanvas.height;

        console.log('📊 CANVAS DIMENSIONS:', {
            width: canvasWidth,
            height: canvasHeight
        });

        console.log('📊 CLIPMASK DIMENSIONS:', {
            left: Math.round(clipMask.left),
            top: Math.round(clipMask.top),
            width: Math.round(clipMask.width),
            height: Math.round(clipMask.height)
        });

        // Step 3: Verify fix - clipMask should be reasonable size relative to canvas
        const widthRatio = clipMask.width / canvasWidth;
        const heightRatio = clipMask.height / canvasHeight;

        console.log('📊 SIZE RATIOS:', {
            width_ratio: widthRatio.toFixed(3),
            height_ratio: heightRatio.toFixed(3)
        });

        // Check if fix worked (reasonable ratios, not tiny values)
        const fixWorked = widthRatio > 0.1 && heightRatio > 0.1; // Should be at least 10% of canvas

        if (fixWorked) {
            console.log('✅ CLIPMASK FIX VERIFICATION: SUCCESS!');
            console.log('  → ClipMask has reasonable dimensions relative to canvas');
            console.log('  → Width/Height are properly converted from percentages');
        } else {
            console.log('❌ CLIPMASK FIX VERIFICATION: FAILED!');
            console.log('  → ClipMask still has tiny dimensions');
            console.log('  → Width/Height conversion may not be working');
        }

        // Step 4: Check design elements positioning
        console.log('🔍 Step 3: Checking design elements vs clipMask...');

        const allObjects = fabricCanvas.getObjects();
        const designElements = allObjects.filter(obj =>
            !obj.isBackground &&
            !obj.isViewImage &&
            !obj.isTemplateBackground &&
            obj.type !== 'image' // Exclude background images
        );

        console.log(`📊 Found ${designElements.length} design elements out of ${allObjects.length} total objects`);

        if (designElements.length > 0) {
            let elementsInClipMask = 0;
            let elementsOutsideClipMask = 0;

            const clipMaskBounds = {
                left: clipMask.left,
                top: clipMask.top,
                right: clipMask.left + clipMask.width,
                bottom: clipMask.top + clipMask.height
            };

            designElements.forEach((obj, idx) => {
                const objBounds = obj.getBoundingRect();

                // Check if object overlaps with clipMask
                const overlaps = !(
                    objBounds.left + objBounds.width < clipMaskBounds.left ||
                    objBounds.left > clipMaskBounds.right ||
                    objBounds.top + objBounds.height < clipMaskBounds.top ||
                    objBounds.top > clipMaskBounds.bottom
                );

                if (overlaps) {
                    elementsInClipMask++;
                } else {
                    elementsOutsideClipMask++;
                }

                console.log(`  Element ${idx}: ${obj.type} at (${Math.round(objBounds.left)}, ${Math.round(objBounds.top)}) - ${overlaps ? 'INSIDE' : 'OUTSIDE'} clipMask`);
            });

            console.log('📊 DESIGN ELEMENTS vs CLIPMASK:', {
                inside_clipmask: elementsInClipMask,
                outside_clipmask: elementsOutsideClipMask,
                coverage_ratio: (elementsInClipMask / designElements.length).toFixed(2)
            });

            if (elementsInClipMask > 0) {
                console.log('✅ ELEMENT COVERAGE: Some design elements are within clipMask bounds!');
            } else {
                console.log('⚠️ ELEMENT COVERAGE: No design elements within clipMask bounds');
                console.log('   This could mean elements are positioned outside print area');
            }
        }

        // Step 5: Test PNG export with fixed clipMask
        console.log('🔍 Step 4: Testing PNG export with fixed clipMask...');

        if (window.highDPIPrintExportEngine &&
            typeof window.highDPIPrintExportEngine.exportWithTemplateMetadata === 'function') {

            try {
                console.log('📸 Generating PNG with fixed clipMask...');

                const exportResult = await window.highDPIPrintExportEngine.exportWithTemplateMetadata({
                    dpi: 300,
                    format: 'png',
                    quality: 1.0,
                    multiplier: 2.0
                });

                if (exportResult && exportResult.dataUrl) {
                    const pngSize = (exportResult.dataUrl.length / 1024 / 1024).toFixed(2);
                    console.log('✅ PNG EXPORT: Success with fixed clipMask!', {
                        size_mb: pngSize,
                        dimensions: `${exportResult.metadata?.width}x${exportResult.metadata?.height}px`
                    });

                    // Show result
                    showVerificationModal(exportResult.dataUrl, {
                        fixWorked: fixWorked,
                        clipMask: {
                            left: Math.round(clipMask.left),
                            top: Math.round(clipMask.top),
                            width: Math.round(clipMask.width),
                            height: Math.round(clipMask.height)
                        },
                        canvas: {
                            width: canvasWidth,
                            height: canvasHeight
                        },
                        ratios: {
                            width: widthRatio.toFixed(3),
                            height: heightRatio.toFixed(3)
                        },
                        elements: {
                            total: designElements.length,
                            inside: elementsInClipMask || 0,
                            outside: elementsOutsideClipMask || 0
                        }
                    });

                    return true;
                } else {
                    console.error('❌ PNG EXPORT: Failed - no dataUrl returned');
                    return false;
                }

            } catch (error) {
                console.error('❌ PNG EXPORT: Failed with error:', error.message);
                return false;
            }
        } else {
            console.warn('⚠️ PNG EXPORT: highDPIPrintExportEngine not available');
            return fixWorked; // Return based on clipMask fix verification
        }

    } catch (error) {
        console.error('❌ ClipMask fix verification failed:', error);
        return false;
    }
}

function showVerificationModal(dataUrl, metadata) {
    // Remove existing modal
    const existingModal = document.getElementById('clipmask-fix-verification-modal');
    if (existingModal) existingModal.remove();

    // Create modal
    const modal = document.createElement('div');
    modal.id = 'clipmask-fix-verification-modal';
    modal.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(0,0,0,0.9); z-index: 10000;
        display: flex; justify-content: center; align-items: center;
        padding: 20px; box-sizing: border-box;
    `;

    const content = document.createElement('div');
    content.style.cssText = `
        background: #2d2d2d; color: white; padding: 20px; border-radius: 10px;
        max-width: 90%; max-height: 90%; overflow: auto; position: relative;
        font-family: monospace;
    `;

    const statusColor = metadata.fixWorked ? '#4CAF50' : '#ff4444';
    const statusText = metadata.fixWorked ? 'FIXED ✅' : 'STILL BROKEN ❌';

    content.innerHTML = `
        <button onclick="this.parentElement.parentElement.remove()" style="
            position: absolute; top: 10px; right: 10px; background: #ff4444;
            color: white; border: none; border-radius: 4px; padding: 5px 10px; cursor: pointer;
        ">✕ Close</button>

        <h3>🎯 ClipMask Fix Verification Results</h3>

        <div style="background: ${statusColor}; color: white; padding: 15px; border-radius: 5px; margin: 15px 0; text-align: center;">
            <h2 style="margin: 0;">ClipMask Coordinate Bug: ${statusText}</h2>
        </div>

        <div style="margin: 20px 0;">
            <img src="${dataUrl}" style="max-width: 600px; max-height: 400px; border: 2px solid ${statusColor}; border-radius: 5px;">
        </div>

        <div style="background: #1a1a1a; padding: 15px; border-radius: 5px; font-size: 12px;">
            <h4>📊 ClipMask Analysis:</h4>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                <div>
                    <p><strong>Canvas Dimensions:</strong><br>
                       ${metadata.canvas.width} × ${metadata.canvas.height} px</p>
                    <p><strong>ClipMask Position:</strong><br>
                       (${metadata.clipMask.left}, ${metadata.clipMask.top})</p>
                    <p><strong>ClipMask Size:</strong><br>
                       ${metadata.clipMask.width} × ${metadata.clipMask.height} px</p>
                </div>
                <div>
                    <p><strong>Size Ratios:</strong><br>
                       Width: ${metadata.ratios.width} (${(metadata.ratios.width * 100).toFixed(1)}%)<br>
                       Height: ${metadata.ratios.height} (${(metadata.ratios.height * 100).toFixed(1)}%)</p>
                    <p><strong>Design Elements:</strong><br>
                       Total: ${metadata.elements.total}<br>
                       Inside ClipMask: ${metadata.elements.inside}<br>
                       Outside ClipMask: ${metadata.elements.outside}</p>
                </div>
            </div>

            <h4 style="margin-top: 15px;">🔧 Fix Details:</h4>
            <p><strong>Problem:</strong> ClipMask width/height were using percentage values as pixels</p>
            <p><strong>Solution:</strong> Convert percentages to pixels: <code>width * canvas.width / 100</code></p>
            <p><strong>File:</strong> public/js/dist/designer.bundle.js lines 784-785</p>

            ${metadata.fixWorked ?
                '<p style="color: #4CAF50;"><strong>✅ Fix successful! ClipMask now has reasonable dimensions.</strong></p>' :
                '<p style="color: #ff4444;"><strong>❌ Fix failed. ClipMask still has wrong dimensions.</strong></p>'
            }

            <h4 style="margin-top: 15px;">📝 Next Steps:</h4>
            ${metadata.fixWorked ?
                '<p>✅ ClipMask fix worked! PNG export should now show design elements within print area.</p>' :
                '<p>❌ ClipMask fix didn\'t work. Check if designer.bundle.js was properly updated.</p>'
            }
        </div>
    `;

    modal.appendChild(content);
    document.body.appendChild(modal);

    // Close on backdrop click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

// Auto-setup
if (typeof window !== 'undefined') {
    window.testClipMaskFixVerification = testClipMaskFixVerification;
    console.log('🚀 CLIPMASK FIX VERIFICATION TEST READY');
    console.log('');
    console.log('📋 INSTRUCTIONS:');
    console.log('1. Open https://yprint.de/designer/ with a template');
    console.log('2. Add some design elements');
    console.log('3. Run: testClipMaskFixVerification()');
    console.log('4. Check if clipMask now has reasonable dimensions');
    console.log('');
}