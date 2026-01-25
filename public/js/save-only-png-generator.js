/**
 * ✅ CANVAS SNAPSHOT PNG GENERATOR - Clean Implementation
 * Provides canvas snapshot based PNG generation for designer.bundle.js
 * Uses full canvas export + post-processing crop for accurate results
 */

console.log('🎯 CANVAS SNAPSHOT PNG: System loading - providing clean generatePNGForDownload function');

// Canvas Snapshot PNG generation function for designer.bundle.js
window.generatePNGForDownload = async function() {
    try {
        console.log('📸 CANVAS SNAPSHOT PNG: Multi-view generation started');

        const designer = window.designerInstance;
        if (!designer?.fabricCanvas) {
            console.error('❌ CANVAS SNAPSHOT PNG: No designer or canvas');
            return null;
        }

        // Store original view to restore later
        const originalView = designer.currentView;
        console.log(`🔄 CANVAS SNAPSHOT PNG: Original view: ${originalView}`);

        // Get all available views with their complete data
        const views = await getAvailableViewsWithData(designer);
        console.log('🔍 CANVAS SNAPSHOT PNG: Found views:', Object.keys(views));

        // Generate design ID once for all uploads
        const designId = designer.currentDesignId || designer.activeTemplateId || 'temp';

        // Generate all PNGs first (parallel)
        const pngPromises = Object.entries(views).map(async ([viewId, viewData]) => {
            console.log(`🎯 CANVAS SNAPSHOT PNG: Processing view ${viewData.name} (${viewId}) in parallel`);

            const pngData = await generateViewPNGWithoutSwitching(designer, viewId, viewData);

            if (pngData) {
                console.log(`✅ CANVAS SNAPSHOT PNG: Generated ${viewData.name} - ${pngData.length} chars`);
                return {
                    viewId,
                    viewData,
                    pngData
                };
            }
            return null;
        });

        // Wait for all PNG generations to complete
        const pngResults = await Promise.all(pngPromises);
        const validResults = pngResults.filter(result => result !== null);

        if (validResults.length === 0) {
            console.error('❌ CANVAS SNAPSHOT PNG: No PNGs could be generated');
            return null;
        }

        // Upload sequentially with 2 second delay to ensure unique timestamps
        const uploadResults = [];
        for (let i = 0; i < validResults.length; i++) {
            const result = validResults[i];
            if (i > 0) {
                console.log(`⏱️ CANVAS SNAPSHOT PNG: Waiting 2s before uploading ${result.viewData.name}...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            const uploadResult = await uploadViewPNG(result.pngData, result.viewId, result.viewData.name, designId);
            uploadResults.push(uploadResult);
        }

        // Log all PNG URLs and collect successful ones
        const successfulUploads = [];
        uploadResults.forEach(result => {
            if (result.success) {
                console.log(`🔗 CANVAS SNAPSHOT PNG: ${result.viewName} URL:`, result.url);
                successfulUploads.push(result);
            }
        });

        // Store upload results for designer.bundle.js integration
        if (window.designerInstance) {
            window.designerInstance._lastMultiViewPNGs = {
                uploads: uploadResults,
                successful: successfulUploads,
                timestamp: Date.now()
            };
        }

        // Restore original view (should be unchanged anyway)
        if (designer.currentView !== originalView) {
            console.log(`🔄 CANVAS SNAPSHOT PNG: Restoring original view: ${originalView}`);
            designer.currentView = originalView;
        }

        // Return first successful PNG for compatibility with existing save system
        const firstPng = validResults[0]?.pngData;
        console.log('🎯 CANVAS SNAPSHOT PNG: Multi-view generation complete, returning:', firstPng ? 'SUCCESS' : 'FAILED');
        return firstPng || null;

    } catch (error) {
        console.error('❌ CANVAS SNAPSHOT PNG: Multi-view generation failed:', error);
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

// Helper: Generate PNG for specific view WITHOUT switching views - CANVAS SNAPSHOT METHOD
async function generateViewPNGWithoutSwitching(designer, viewId, viewData) {
    try {
        const canvas = designer.fabricCanvas;
        console.log(`🎨 SNAPSHOT PNG: Processing view ${viewData.name} (${viewId}) with dynamic bounds detection`);

        // Get design elements only (exclude background shirt)
        const designObjects = canvas.getObjects().filter(obj => {
            const isBackground = obj.isBackground === true ||
                               (obj.type === 'image' && obj.selectable === false);
            const isSystemObject = obj.excludeFromExport === true;
            const isUserContent = obj.selectable === true && obj.visible === true;

            return isUserContent && !isBackground && !isSystemObject;
        });

        console.log(`🎨 SNAPSHOT PNG: Found ${designObjects.length} design objects for ${viewData.name}`);

        if (designObjects.length === 0) {
            console.log(`⚠️ SNAPSHOT PNG: No design content in ${viewData.name}, skipping`);
            return null;
        }

        // DYNAMIC BOUNDS DETECTION: Calculate actual bounding box of design objects
        let minLeft = Infinity, minTop = Infinity, maxRight = -Infinity, maxBottom = -Infinity;

        designObjects.forEach(obj => {
            const bounds = obj.getBoundingRect();
            minLeft = Math.min(minLeft, bounds.left);
            minTop = Math.min(minTop, bounds.top);
            maxRight = Math.max(maxRight, bounds.left + bounds.width);
            maxBottom = Math.max(maxBottom, bounds.top + bounds.height);
        });

        // Add smart padding around design content
        const padding = 50; // Generous padding for design elements
        const designBounds = {
            left: Math.max(0, minLeft - padding),
            top: Math.max(0, minTop - padding),
            width: Math.min(canvas.width, maxRight + padding) - Math.max(0, minLeft - padding),
            height: Math.min(canvas.height, maxBottom + padding) - Math.max(0, minTop - padding)
        };

        console.log(`📐 SNAPSHOT PNG: Dynamic design bounds for ${viewData.name}:`, designBounds);
        console.log(`📊 SNAPSHOT PNG: Original objects bounds: left=${minLeft}, top=${minTop}, right=${maxRight}, bottom=${maxBottom}`);

        // Validate bounds are reasonable
        if (designBounds.width <= 0 || designBounds.height <= 0) {
            console.error(`❌ SNAPSHOT PNG: Invalid design bounds for ${viewData.name}:`, designBounds);
            return null;
        }

        // Hide background objects temporarily
        const hiddenObjects = [];
        canvas.getObjects().forEach(obj => {
            const isBackground = obj.isBackground === true ||
                               (obj.type === 'image' && obj.selectable === false) ||
                               obj.excludeFromExport === true;
            if (isBackground && obj.visible) {
                obj.visible = false;
                hiddenObjects.push(obj);
            }
        });

        canvas.renderAll();

        // STEP 1: Export FULL canvas (no coordinate cropping) - CANVAS SNAPSHOT
        console.log('📸 SNAPSHOT PNG: Exporting full canvas snapshot...');
        const fullCanvasDataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 4.17 // 300 DPI
        });
        console.log(`📸 SNAPSHOT PNG: Full canvas exported - ${fullCanvasDataURL.length} chars`);

        // STEP 2: Crop to DYNAMIC design bounds using post-processing
        console.log(`✂️ SNAPSHOT PNG: Cropping to design bounds (${designBounds.width}x${designBounds.height})...`);
        const multiplier = 4.17; // Same multiplier as canvas export
        const cropArea = {
            left: designBounds.left * multiplier,
            top: designBounds.top * multiplier,
            width: designBounds.width * multiplier,
            height: designBounds.height * multiplier
        };

        console.log(`🔍 SNAPSHOT PNG: Crop area scaled by ${multiplier}:`, cropArea);

        const croppedDataURL = await cropImageToArea(fullCanvasDataURL, cropArea);

        // Restore hidden objects
        hiddenObjects.forEach(obj => {
            obj.visible = true;
        });
        canvas.renderAll();

        if (croppedDataURL && croppedDataURL.length > 100) {
            console.log(`✅ SNAPSHOT PNG: Generated ${viewData.name} - ${croppedDataURL.length} chars (design bounds only)`);
            return croppedDataURL;
        } else {
            console.error(`❌ SNAPSHOT PNG: Failed to crop ${viewData.name} - empty result`);
            console.error(`❌ SNAPSHOT PNG: Crop area was:`, cropArea);
            console.error(`❌ SNAPSHOT PNG: Design bounds were:`, designBounds);
            return null;
        }

    } catch (error) {
        console.error(`❌ SNAPSHOT PNG: Failed to generate PNG for ${viewData.name}:`, error);
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
        console.log('🎯 SAVE-INTEGRATED PNG: Starting generation with validated design ID:', designId);

        const designer = window.designerInstance;
        if (!designer?.fabricCanvas) {
            console.error('❌ SAVE-INTEGRATED PNG: No designer or canvas');
            throw new Error('Designer or canvas not available');
        }

        if (!designId || designId === 'temp') {
            console.error('❌ SAVE-INTEGRATED PNG: Invalid design ID:', designId);
            throw new Error('Valid design ID required for PNG generation');
        }

        // Store original view to restore later
        const originalView = designer.currentView;
        console.log(`🔄 SAVE-INTEGRATED PNG: Original view: ${originalView}`);

        // Get all available views with their complete data
        const views = await getAvailableViewsWithData(designer);
        console.log('🔍 SAVE-INTEGRATED PNG: Found views:', Object.keys(views));

        // Generate all PNGs first (parallel)
        const pngPromises = Object.entries(views).map(async ([viewId, viewData]) => {
            console.log(`🎯 SAVE-INTEGRATED PNG: Processing view ${viewData.name} (${viewId}) in parallel`);

            const pngData = await generateViewPNGWithoutSwitching(designer, viewId, viewData);

            if (pngData) {
                console.log(`✅ SAVE-INTEGRATED PNG: Generated ${viewData.name} - ${pngData.length} chars`);
                return {
                    viewId,
                    viewData,
                    pngData
                };
            }
            return null;
        });

        // Wait for all PNG generations to complete
        const pngResults = await Promise.all(pngPromises);
        const validResults = pngResults.filter(result => result !== null);

        if (validResults.length === 0) {
            throw new Error('No PNGs could be generated');
        }

        // Upload sequentially with 2 second delay to ensure unique timestamps
        const uploadResults = [];
        for (let i = 0; i < validResults.length; i++) {
            const result = validResults[i];
            if (i > 0) {
                console.log(`⏱️ SAVE-INTEGRATED PNG: Waiting 2s before uploading ${result.viewData.name}...`);
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
            const uploadResult = await uploadViewPNG(result.pngData, result.viewId, result.viewData.name, designId);
            uploadResults.push(uploadResult);
        }

        // Log all PNG URLs and collect results
        const successfulUploads = [];
        const failedUploads = [];

        uploadResults.forEach(result => {
            if (result.success) {
                console.log(`🔗 SAVE-INTEGRATED PNG: ${result.viewName} URL:`, result.url);
                successfulUploads.push(result);
            } else {
                console.error(`❌ SAVE-INTEGRATED PNG: ${result.viewName} upload failed:`, result.error);
                failedUploads.push(result);
            }
        });

        // Restore original view (should be unchanged anyway)
        if (designer.currentView !== originalView) {
            console.log(`🔄 SAVE-INTEGRATED PNG: Restoring original view: ${originalView}`);
            designer.currentView = originalView;
        }

        // Return comprehensive results
        const result = {
            success: successfulUploads.length > 0,
            totalGenerated: validResults.length,
            successfulUploads: successfulUploads.length,
            failedUploads: failedUploads.length,
            uploads: uploadResults,
            mainPNG: validResults[0]?.pngData, // For backward compatibility
            urls: successfulUploads.map(upload => upload.url)
        };

        console.log(`🎯 SAVE-INTEGRATED PNG: Complete - ${result.successfulUploads}/${result.totalGenerated} uploads successful`);

        return result;

    } catch (error) {
        console.error('❌ SAVE-INTEGRATED PNG: Generation failed:', error);
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

console.log('✅ CANVAS SNAPSHOT PNG: System ready - Full canvas export + post-processing crop method!');