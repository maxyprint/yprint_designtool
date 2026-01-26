/**
 * ✅ CANVAS SNAPSHOT PNG GENERATOR - Clean Implementation
 * Provides canvas snapshot based PNG generation for designer.bundle.js
 * Uses full canvas export + post-processing crop for accurate results
 */

console.log('🎯 CANVAS SNAPSHOT PNG: System loading - providing clean generatePNGForDownload function');

// Canvas Snapshot PNG generation function for designer.bundle.js
window.generatePNGForDownload = async function() {
    try {
        console.log('📸 CANVAS SNAPSHOT PNG: Content-based generation started');

        const designer = window.designerInstance;
        if (!designer?.fabricCanvas) {
            console.error('❌ CANVAS SNAPSHOT PNG: No designer or canvas');
            return null;
        }

        const canvas = designer.fabricCanvas;

        // Check if current canvas has design content
        const designObjects = canvas.getObjects().filter(obj => {
            const isBackground = obj.isBackground === true || (obj.type === 'image' && obj.selectable === false);
            const isSystemObject = obj.excludeFromExport === true;
            const isPrintZoneOverlay = obj === designer.printZoneRect || obj === designer.safeZoneRect;
            const isUserContent = obj.selectable === true && obj.visible === true;
            return isUserContent && !isBackground && !isSystemObject && !isPrintZoneOverlay;
        });

        console.log(`🔍 CANVAS SNAPSHOT PNG: Current canvas has ${designObjects.length} design objects`);

        if (designObjects.length === 0) {
            console.log('⚠️ CANVAS SNAPSHOT PNG: No design content found on current canvas, skipping PNG generation');
            return null;
        }

        // Get current view data for PNG generation
        const currentViewId = designer.currentView;
        const template = designer.templates?.get(designer.activeTemplateId);
        const variation = template?.variations?.get(designer.currentVariation?.toString());
        const currentViewData = variation?.views?.get(currentViewId.toString());

        if (!currentViewData) {
            console.error('❌ CANVAS SNAPSHOT PNG: No view data found for current view:', currentViewId);
            return null;
        }

        console.log(`🎯 CANVAS SNAPSHOT PNG: Generating PNG for active view ${currentViewData.name} (${currentViewId}) with content`);

        // Generate PNG for current view only
        const designId = designer.currentDesignId || designer.activeTemplateId || 'temp';
        const pngData = await generateViewPNGWithoutSwitching(designer, currentViewId, currentViewData);

        if (!pngData) {
            console.error('❌ CANVAS SNAPSHOT PNG: Failed to generate PNG for current view');
            return null;
        }

        console.log(`✅ CANVAS SNAPSHOT PNG: Generated ${currentViewData.name} - ${pngData.length} chars`);

        // Upload the single PNG
        const uploadResult = await uploadViewPNG(pngData, currentViewId, currentViewData.name, designId);

        if (uploadResult.success) {
            console.log(`🔗 CANVAS SNAPSHOT PNG: ${uploadResult.viewName} URL:`, uploadResult.url);

            // Store upload results for designer.bundle.js integration
            if (window.designerInstance) {
                window.designerInstance._lastMultiViewPNGs = {
                    uploads: [uploadResult],
                    successful: [uploadResult],
                    timestamp: Date.now()
                };
            }

            console.log('🎯 CANVAS SNAPSHOT PNG: Content-based generation complete - SUCCESS');
            return pngData;
        } else {
            console.error('❌ CANVAS SNAPSHOT PNG: Upload failed:', uploadResult.error);
            return null;
        }

    } catch (error) {
        console.error('❌ CANVAS SNAPSHOT PNG: Content-based generation failed:', error);
        return null;
    }
};

// Helper: Get available views with complete data for parallel processing
async function getAvailableViewsWithData(designer) {
    try {
        const template = designer.templates?.get(designer.activeTemplateId);
        const variation = template?.variations?.get(designer.currentVariation?.toString());

        if (variation?.views) {
            // Convert Map to Object with enhanced view data
            const viewsObj = {};
            variation.views.forEach((viewData, viewId) => {
                viewsObj[viewId] = {
                    ...viewData,
                    // Pre-calculate print area for this view
                    printArea: getPrintAreaForView(designer, viewId, viewData)
                };
            });
            return viewsObj;
        }

        // Fallback: Use current view only
        return {
            [designer.currentView]: {
                name: 'Current View',
                printArea: getPrintAreaForView(designer, designer.currentView, null)
            }
        };
    } catch (error) {
        console.error('❌ CANVAS SNAPSHOT PNG: Failed to get views:', error);
        return {
            [designer.currentView]: {
                name: 'Current View',
                printArea: getPrintAreaForView(designer, designer.currentView, null)
            }
        };
    }
}

// Helper: Generate PNG for specific view WITHOUT switching views - VISUAL CANVAS SNAPSHOT METHOD
async function generateViewPNGWithoutSwitching(designer, viewId, viewData) {
    try {
        const canvas = designer.fabricCanvas;
        console.log(`🎨 VISUAL SNAPSHOT PNG: Processing view ${viewData.name} (${viewId}) with live canvas print zone`);

        // Get design elements only (exclude background shirt and print zone overlays)
        const designObjects = canvas.getObjects().filter(obj => {
            const isBackground = obj.isBackground === true ||
                               (obj.type === 'image' && obj.selectable === false);
            const isSystemObject = obj.excludeFromExport === true;
            const isPrintZoneOverlay = obj === designer.printZoneRect || obj === designer.safeZoneRect;
            const isUserContent = obj.selectable === true && obj.visible === true;

            return isUserContent && !isBackground && !isSystemObject && !isPrintZoneOverlay;
        });

        console.log(`🎨 VISUAL SNAPSHOT PNG: Found ${designObjects.length} design objects for ${viewData.name}`);

        if (designObjects.length === 0) {
            console.log(`⚠️ VISUAL SNAPSHOT PNG: No design content in ${viewData.name}, skipping`);
            return null;
        }

        // GET LIVE PRINT ZONE from canvas instead of static data
        const livePrintZone = getCurrentPrintZoneFromCanvas(canvas, designer);
        console.log(`📐 VISUAL SNAPSHOT PNG: Live print zone for ${viewData.name}:`, livePrintZone);

        // Calculate design object bounds for comparison/debugging
        let minLeft = Infinity, minTop = Infinity, maxRight = -Infinity, maxBottom = -Infinity;

        designObjects.forEach(obj => {
            const bounds = obj.getBoundingRect();
            minLeft = Math.min(minLeft, bounds.left);
            minTop = Math.min(minTop, bounds.top);
            maxRight = Math.max(maxRight, bounds.left + bounds.width);
            maxBottom = Math.max(maxBottom, bounds.top + bounds.height);
        });

        const designBounds = {
            left: minLeft,
            top: minTop,
            width: maxRight - minLeft,
            height: maxBottom - minTop
        };

        console.log(`📊 VISUAL SNAPSHOT PNG: Design object bounds: left=${minLeft}, top=${minTop}, right=${maxRight}, bottom=${maxBottom}`);
        console.log(`🔍 VISUAL SNAPSHOT PNG: Design bounds vs LIVE print zone:`, {
            designBounds: designBounds,
            livePrintZone: livePrintZone,
            designInsideLivePrintZone: livePrintZone ? (minLeft >= livePrintZone.left &&
                                                       minTop >= livePrintZone.top &&
                                                       maxRight <= (livePrintZone.left + livePrintZone.width) &&
                                                       maxBottom <= (livePrintZone.top + livePrintZone.height)) : false
        });

        // Fallback to static print area if no live print zone found
        let printArea = livePrintZone;
        if (!printArea || printArea.width <= 0 || printArea.height <= 0) {
            console.warn(`⚠️ VISUAL SNAPSHOT PNG: No valid live print zone found, falling back to static data`);
            printArea = getPrintAreaForView(designer, viewId, viewData);
            console.log(`📐 VISUAL SNAPSHOT PNG: Using fallback print area:`, printArea);
        }

        // Validate print area is reasonable
        if (!printArea || printArea.width <= 0 || printArea.height <= 0) {
            console.error(`❌ VISUAL SNAPSHOT PNG: Invalid print area for ${viewData.name}:`, printArea);
            return null;
        }

        // Hide background objects and overlays temporarily
        const hiddenObjects = [];
        canvas.getObjects().forEach(obj => {
            const isBackground = obj.isBackground === true ||
                               (obj.type === 'image' && obj.selectable === false) ||
                               obj.excludeFromExport === true;
            const isPrintZoneOverlay = obj === designer.printZoneRect || obj === designer.safeZoneRect;

            if ((isBackground || isPrintZoneOverlay) && obj.visible) {
                obj.visible = false;
                hiddenObjects.push(obj);
            }
        });

        canvas.renderAll();

        // STEP 1: Export FULL canvas (no coordinate cropping) - VISUAL CANVAS SNAPSHOT
        console.log('📸 VISUAL SNAPSHOT PNG: Exporting full canvas snapshot (without overlays)...');
        const fullCanvasDataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 4.17 // 300 DPI
        });
        console.log(`📸 VISUAL SNAPSHOT PNG: Full canvas exported - ${fullCanvasDataURL.length} chars`);

        // STEP 2: Crop to LIVE PRINT ZONE using post-processing
        console.log(`✂️ VISUAL SNAPSHOT PNG: Cropping to live print zone (${printArea.width}x${printArea.height})...`);
        const multiplier = 4.17; // Same multiplier as canvas export
        const cropArea = {
            left: printArea.left * multiplier,
            top: printArea.top * multiplier,
            width: printArea.width * multiplier,
            height: printArea.height * multiplier
        };

        console.log(`🔍 VISUAL SNAPSHOT PNG: Crop area scaled by ${multiplier}:`, cropArea);

        const croppedDataURL = await cropImageToArea(fullCanvasDataURL, cropArea);

        // Restore hidden objects and overlays
        hiddenObjects.forEach(obj => {
            obj.visible = true;
        });
        canvas.renderAll();

        if (croppedDataURL && croppedDataURL.length > 100) {
            console.log(`✅ VISUAL SNAPSHOT PNG: Generated ${viewData.name} - ${croppedDataURL.length} chars (live print zone size)`);
            console.log(`📏 VISUAL SNAPSHOT PNG: Final PNG dimensions should be: ${Math.round(printArea.width * 4.17)}x${Math.round(printArea.height * 4.17)}px`);
            console.log(`🎯 VISUAL SNAPSHOT PNG: Used ${livePrintZone ? 'LIVE' : 'FALLBACK'} print zone data`);
            return croppedDataURL;
        } else {
            console.error(`❌ VISUAL SNAPSHOT PNG: Failed to crop ${viewData.name} - empty result`);
            console.error(`❌ VISUAL SNAPSHOT PNG: Crop area was:`, cropArea);
            console.error(`❌ VISUAL SNAPSHOT PNG: Print area was:`, printArea);
            console.error(`❌ VISUAL SNAPSHOT PNG: Live print zone was:`, livePrintZone);
            return null;
        }

    } catch (error) {
        console.error(`❌ VISUAL SNAPSHOT PNG: Failed to generate PNG for ${viewData.name}:`, error);
        return null;
    }
}

// Helper: Get print area coordinates for specific view
function getPrintAreaForView(designer, viewId, viewData) {
    // Use safeZone from template data - this is the real print area
    try {
        const template = designer.templates?.get(designer.activeTemplateId);
        const variation = template?.variations?.get(designer.currentVariation?.toString());
        const view = variation?.views?.get(viewId?.toString());

        if (view?.safeZone) {
            console.log(`✅ Using safeZone for ${viewId}:`, view.safeZone);
            return {
                left: view.safeZone.left,
                top: view.safeZone.top,
                width: view.safeZone.width,
                height: view.safeZone.height
            };
        }
    } catch (error) {
        console.warn(`⚠️ SNAPSHOT PNG: Could not get safeZone for view ${viewId}`);
    }

    // Fallback: Use safe zone or default area
    const canvasWidth = designer.fabricCanvas.width;
    const canvasHeight = designer.fabricCanvas.height;

    console.warn(`⚠️ Using fallback print area for ${viewId}`);
    return {
        left: canvasWidth * 0.1,
        top: canvasHeight * 0.1,
        width: canvasWidth * 0.8,
        height: canvasHeight * 0.8
    };
}

// Helper: Upload individual view PNG to server
async function uploadViewPNG(pngDataUrl, viewId, viewName, designId) {
    try {
        console.log(`📤 SNAPSHOT PNG: Uploading ${viewName} PNG...`);

        const formData = new FormData();
        formData.append('action', 'save_design_png');
        formData.append('nonce', window.octoPrintDesigner?.nonce || window.octo_print_designer_config?.nonce || '');
        formData.append('design_id', designId);
        formData.append('view_id', viewId);
        formData.append('view_name', viewName);

        // Convert data URL to blob with unique filename
        const response = await fetch(pngDataUrl);
        const blob = await response.blob();
        const uniqueFilename = `design_${designId}_${viewName.toLowerCase()}_${viewId}_${Date.now()}.png`;
        formData.append('png_file', blob, uniqueFilename);
        formData.append('custom_filename', uniqueFilename);

        // Upload to server
        const uploadResponse = await fetch(window.octoPrintDesigner?.ajaxUrl || window.octo_print_designer_config?.ajax_url, {
            method: 'POST',
            body: formData
        });

        if (uploadResponse.ok) {
            const result = await uploadResponse.json();
            console.log(`🔍 SNAPSHOT PNG: Server response for ${viewName}:`, result);
            if (result.success) {
                console.log(`✅ SNAPSHOT PNG: ${viewName} uploaded successfully!`);
                console.log(`🔗 SNAPSHOT PNG: ${viewName} URL:`, result.data?.png_url || result.data?.file_url || 'URL not found');
                return {
                    success: true,
                    viewId: viewId,
                    viewName: viewName,
                    url: result.data?.png_url || result.data?.file_url || null
                };
            } else {
                console.error(`❌ SNAPSHOT PNG: ${viewName} upload failed:`, result.data);
                return {
                    success: false,
                    viewId: viewId,
                    viewName: viewName,
                    error: result.data
                };
            }
        } else {
            console.error(`❌ SNAPSHOT PNG: ${viewName} upload HTTP error:`, uploadResponse.status);
            return {
                success: false,
                viewId: viewId,
                viewName: viewName,
                error: `HTTP ${uploadResponse.status}`
            };
        }

    } catch (error) {
        console.error(`❌ SNAPSHOT PNG: ${viewName} upload error:`, error);
        return {
            success: false,
            viewId: viewId,
            viewName: viewName,
            error: error.message
        };
    }
}

// Enhanced function for designer.bundle.js integration - ensures proper design ID validation
window.generatePNGForSave = async function(designId) {
    try {
        console.log('🎯 SAVE-INTEGRATED PNG: Starting content-based generation with design ID:', designId);

        const designer = window.designerInstance;
        if (!designer?.fabricCanvas) {
            console.error('❌ SAVE-INTEGRATED PNG: No designer or canvas');
            throw new Error('Designer or canvas not available');
        }

        if (!designId || designId === 'temp') {
            console.error('❌ SAVE-INTEGRATED PNG: Invalid design ID:', designId);
            throw new Error('Valid design ID required for PNG generation');
        }

        const canvas = designer.fabricCanvas;

        // Check if current canvas has design content
        const designObjects = canvas.getObjects().filter(obj => {
            const isBackground = obj.isBackground === true || (obj.type === 'image' && obj.selectable === false);
            const isSystemObject = obj.excludeFromExport === true;
            const isPrintZoneOverlay = obj === designer.printZoneRect || obj === designer.safeZoneRect;
            const isUserContent = obj.selectable === true && obj.visible === true;
            return isUserContent && !isBackground && !isSystemObject && !isPrintZoneOverlay;
        });

        console.log(`🔍 SAVE-INTEGRATED PNG: Current canvas has ${designObjects.length} design objects`);

        if (designObjects.length === 0) {
            console.log('⚠️ SAVE-INTEGRATED PNG: No design content found on current canvas, skipping PNG generation');
            return {
                success: false,
                totalGenerated: 0,
                successfulUploads: 0,
                failedUploads: 0,
                uploads: [],
                mainPNG: null,
                urls: []
            };
        }

        // Get current view data for PNG generation
        const currentViewId = designer.currentView;
        const template = designer.templates?.get(designer.activeTemplateId);
        const variation = template?.variations?.get(designer.currentVariation?.toString());
        const currentViewData = variation?.views?.get(currentViewId.toString());

        if (!currentViewData) {
            console.error('❌ SAVE-INTEGRATED PNG: No view data found for current view:', currentViewId);
            throw new Error('Current view data not available');
        }

        console.log(`🎯 SAVE-INTEGRATED PNG: Generating PNG for active view ${currentViewData.name} (${currentViewId}) with content`);

        // Generate PNG for current view only
        const pngData = await generateViewPNGWithoutSwitching(designer, currentViewId, currentViewData);

        if (!pngData) {
            throw new Error('Failed to generate PNG for current view');
        }

        console.log(`✅ SAVE-INTEGRATED PNG: Generated ${currentViewData.name} - ${pngData.length} chars`);

        // Upload the single PNG
        const uploadResult = await uploadViewPNG(pngData, currentViewId, currentViewData.name, designId);

        if (uploadResult.success) {
            console.log(`🔗 SAVE-INTEGRATED PNG: ${uploadResult.viewName} URL:`, uploadResult.url);

            // Return comprehensive results (single PNG)
            const result = {
                success: true,
                totalGenerated: 1,
                successfulUploads: 1,
                failedUploads: 0,
                uploads: [uploadResult],
                mainPNG: pngData,
                urls: [uploadResult.url]
            };

            console.log('🎯 SAVE-INTEGRATED PNG: Content-based generation complete - SUCCESS');
            return result;

        } else {
            console.error(`❌ SAVE-INTEGRATED PNG: Upload failed:`, uploadResult.error);

            const result = {
                success: false,
                totalGenerated: 1,
                successfulUploads: 0,
                failedUploads: 1,
                uploads: [uploadResult],
                mainPNG: pngData,
                urls: []
            };

            return result;
        }

    } catch (error) {
        console.error('❌ SAVE-INTEGRATED PNG: Content-based generation failed:', error);
        throw error; // Re-throw for saveDesign() error handling
    }
};

// Helper: Crop full canvas export to specific area (from working commit b0f8939)
async function cropImageToArea(dataURL, cropArea) {
    return new Promise((resolve, reject) => {
        console.log('✂️ CROP: Starting image crop operation', {
            dataURL_exists: !!dataURL,
            dataURL_length: dataURL?.length || 0,
            cropArea: cropArea,
            cropArea_valid: !!(cropArea?.left !== undefined && cropArea?.top !== undefined && cropArea?.width > 0 && cropArea?.height > 0)
        });

        if (!dataURL) {
            console.error('❌ CROP: No dataURL provided');
            resolve(null);
            return;
        }

        if (!cropArea || cropArea.width <= 0 || cropArea.height <= 0) {
            console.error('❌ CROP: Invalid crop area:', cropArea);
            resolve(null);
            return;
        }

        const img = new Image();

        img.onerror = (error) => {
            console.error('❌ CROP: Image failed to load:', error);
            resolve(null);
        };

        img.onload = () => {
            console.log('✅ CROP: Image loaded successfully', {
                image_width: img.width,
                image_height: img.height,
                naturalWidth: img.naturalWidth,
                naturalHeight: img.naturalHeight
            });

            // Validate crop area against image bounds
            const cropValid = cropArea.left >= 0 && cropArea.top >= 0 &&
                             (cropArea.left + cropArea.width) <= img.width &&
                             (cropArea.top + cropArea.height) <= img.height;

            console.log('🔍 CROP: Crop bounds validation:', {
                crop_left: cropArea.left,
                crop_top: cropArea.top,
                crop_right: cropArea.left + cropArea.width,
                crop_bottom: cropArea.top + cropArea.height,
                image_width: img.width,
                image_height: img.height,
                crop_valid: cropValid
            });

            if (!cropValid) {
                console.warn('⚠️ CROP: WARNING - Crop area exceeds image bounds, proceeding anyway');
            }

            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

            // Set canvas to crop area size
            canvas.width = cropArea.width;
            canvas.height = cropArea.height;
            console.log('✂️ CROP: Created crop canvas:', { width: canvas.width, height: canvas.height });

            try {
                // Draw cropped section
                ctx.drawImage(
                    img,
                    cropArea.left, cropArea.top, cropArea.width, cropArea.height,
                    0, 0, cropArea.width, cropArea.height
                );

                const croppedDataURL = canvas.toDataURL('image/png', 1.0);

                console.log('✅ CROP: Image cropped successfully', {
                    output_dataURL_length: croppedDataURL?.length || 0,
                    output_starts_with_data: croppedDataURL?.startsWith('data:image') || false
                });

                if (!croppedDataURL || croppedDataURL.length < 100) {
                    console.error('❌ CROP: Cropped PNG is empty or invalid!');
                    resolve(null);
                } else {
                    resolve(croppedDataURL);
                }
            } catch (drawError) {
                console.error('❌ CROP: Error during drawImage:', drawError);
                resolve(null);
            }
        };

        console.log('✂️ CROP: Setting image source...');
        img.src = dataURL;
    });
}

// Helper: Get live print zone from canvas (visual borders displayed to customer)
function getCurrentPrintZoneFromCanvas(canvas, designer) {
    console.log('🔍 LIVE PRINT ZONE: Searching for live print zone rect...');

    // Check designer for printZoneRect object (primary method)
    if (designer.printZoneRect && designer.printZoneRect.visible) {
        const rect = designer.printZoneRect;
        const bounds = rect.getBoundingRect();

        console.log('✅ LIVE PRINT ZONE: Found designer.printZoneRect:', {
            left: bounds.left,
            top: bounds.top,
            width: bounds.width,
            height: bounds.height,
            visible: rect.visible,
            type: rect.type
        });

        return {
            left: bounds.left,
            top: bounds.top,
            width: bounds.width,
            height: bounds.height
        };
    }

    // Search canvas objects for print zone overlay objects
    console.log('🔍 LIVE PRINT ZONE: Searching canvas objects for print zone...');
    const canvasObjects = canvas.getObjects();

    for (let obj of canvasObjects) {
        // Enhanced print zone detection including excludeFromExport rectangles
        const isPrintZone = obj.isPrintZone === true ||
                           obj.className === 'PrintZone' ||
                           obj.type === 'printZone' ||
                           (obj.type === 'rect' && obj.excludeFromExport === true) ||
                           (obj.selectable === false && obj.stroke && (obj.fill === '' || obj.fill === 'transparent' || !obj.fill));

        if (isPrintZone && obj.visible) {
            const bounds = obj.getBoundingRect();

            console.log('✅ LIVE PRINT ZONE: Found canvas print zone object:', {
                left: bounds.left,
                top: bounds.top,
                width: bounds.width,
                height: bounds.height,
                type: obj.type,
                className: obj.className,
                isPrintZone: obj.isPrintZone,
                excludeFromExport: obj.excludeFromExport,
                selectable: obj.selectable,
                stroke: obj.stroke,
                fill: obj.fill
            });

            return {
                left: bounds.left,
                top: bounds.top,
                width: bounds.width,
                height: bounds.height
            };
        }
    }

    // Check for safeZoneRect as backup
    if (designer.safeZoneRect && designer.safeZoneRect.visible) {
        const rect = designer.safeZoneRect;
        const bounds = rect.getBoundingRect();

        console.log('⚠️ LIVE PRINT ZONE: Using safeZoneRect as fallback:', {
            left: bounds.left,
            top: bounds.top,
            width: bounds.width,
            height: bounds.height,
            visible: rect.visible,
            type: rect.type
        });

        return {
            left: bounds.left,
            top: bounds.top,
            width: bounds.width,
            height: bounds.height
        };
    }

    // Search for any rectangular objects with print zone characteristics (broader search)
    console.log('🔍 LIVE PRINT ZONE: Searching for rect-like print zone objects...');
    for (let obj of canvasObjects) {
        if (obj.type === 'rect' && obj.selectable === false && obj.visible === true) {
            const bounds = obj.getBoundingRect();

            // Check if it covers a significant portion of canvas (likely print zone)
            const coverageX = bounds.width / canvas.width;
            const coverageY = bounds.height / canvas.height;

            // More lenient coverage check
            if (coverageX > 0.3 && coverageY > 0.3 && coverageX < 0.98 && coverageY < 0.98) {
                console.log('✅ LIVE PRINT ZONE: Found likely print zone rectangle:', {
                    left: bounds.left,
                    top: bounds.top,
                    width: bounds.width,
                    height: bounds.height,
                    coverage: { x: coverageX, y: coverageY },
                    stroke: obj.stroke,
                    fill: obj.fill,
                    excludeFromExport: obj.excludeFromExport
                });

                return {
                    left: bounds.left,
                    top: bounds.top,
                    width: bounds.width,
                    height: bounds.height
                };
            }
        }
    }

    console.log('❌ LIVE PRINT ZONE: No live print zone found on canvas');
    return null;
}

console.log('✅ CANVAS SNAPSHOT PNG: System ready - Full canvas export + post-processing crop method!');