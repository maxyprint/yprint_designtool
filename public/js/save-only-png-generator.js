/**
 * ✅ MINIMAL PNG GENERATOR - Clean Implementation
 * Provides only the essential generatePNGForDownload function for designer.bundle.js
 */

console.log('🎯 MINIMAL PNG v2: Providing clean generatePNGForDownload function - Cache Breaker');

// Multi-View PNG generation function for designer.bundle.js - OPTIMIZED
window.generatePNGForDownload = async function() {
    try {
        console.log('🎯 OPTIMIZED PNG: Parallel multi-view generation started');

        const designer = window.designerInstance;
        if (!designer?.fabricCanvas) {
            console.error('❌ OPTIMIZED PNG: No designer or canvas');
            return null;
        }

        // Store original view to restore later
        const originalView = designer.currentView;
        console.log(`🔄 OPTIMIZED PNG: Original view: ${originalView}`);

        // Get all available views with their complete data
        const views = await getAvailableViewsWithData(designer);
        console.log('🔍 OPTIMIZED PNG: Found views:', Object.keys(views));

        // Generate design ID once for all uploads
        const designId = designer.currentDesignId || designer.activeTemplateId || 'temp';

        // Process all views in parallel - NO VIEW SWITCHING
        const pngPromises = Object.entries(views).map(async ([viewId, viewData]) => {
            console.log(`🎯 OPTIMIZED PNG: Processing view ${viewData.name} (${viewId}) in parallel`);

            const pngData = await generateViewPNGWithoutSwitching(designer, viewId, viewData);

            if (pngData) {
                console.log(`✅ OPTIMIZED PNG: Generated ${viewData.name} - ${pngData.length} chars`);
                return {
                    viewId,
                    viewData,
                    pngData,
                    uploadPromise: uploadViewPNG(pngData, viewId, viewData.name, designId)
                };
            }
            return null;
        });

        // Wait for all PNG generations to complete
        const pngResults = await Promise.all(pngPromises);
        const validResults = pngResults.filter(result => result !== null);

        // Wait for all uploads to complete
        const uploadResults = await Promise.all(validResults.map(result => result.uploadPromise));

        // Log all PNG URLs and collect successful ones
        const successfulUploads = [];
        uploadResults.forEach(result => {
            if (result.success) {
                console.log(`🔗 OPTIMIZED PNG: ${result.viewName} URL:`, result.url);
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
            console.log(`🔄 OPTIMIZED PNG: Restoring original view: ${originalView}`);
            designer.currentView = originalView;
        }

        // Return first successful PNG for compatibility with existing save system
        const firstPng = validResults[0]?.pngData;
        console.log('🎯 OPTIMIZED PNG: Parallel multi-view generation complete, returning:', firstPng ? 'SUCCESS' : 'FAILED');
        return firstPng || null;

    } catch (error) {
        console.error('❌ OPTIMIZED PNG: Multi-view generation failed:', error);
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
        console.error('❌ OPTIMIZED PNG: Failed to get views:', error);
        return {
            [designer.currentView]: {
                name: 'Current View',
                printArea: getPrintAreaForView(designer, designer.currentView, null)
            }
        };
    }
}

// Helper: Generate PNG for specific view WITHOUT switching views
async function generateViewPNGWithoutSwitching(designer, viewId, viewData) {
    try {
        const canvas = designer.fabricCanvas;
        console.log(`🎨 OPTIMIZED PNG: Processing view ${viewData.name} (${viewId}) without switching`);

        // Get design elements only (exclude background shirt)
        const designObjects = canvas.getObjects().filter(obj => {
            const isBackground = obj.isBackground === true ||
                               (obj.type === 'image' && obj.selectable === false);
            const isSystemObject = obj.excludeFromExport === true;
            const isUserContent = obj.selectable === true && obj.visible === true;

            return isUserContent && !isBackground && !isSystemObject;
        });

        console.log(`🎨 OPTIMIZED PNG: Found ${designObjects.length} design objects for ${viewData.name}`);

        if (designObjects.length === 0) {
            console.log(`⚠️ OPTIMIZED PNG: No design content in ${viewData.name}, skipping`);
            return null;
        }

        // Use pre-calculated print area from viewData
        const printArea = viewData.printArea;
        console.log(`📐 OPTIMIZED PNG: Print area for ${viewData.name}:`, printArea);

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

        // Use fabric.js toDataURL with crop parameters - NO coordinate math!
        const dataUrl = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 4.17, // 300 DPI
            left: printArea.left,
            top: printArea.top,
            width: printArea.width,
            height: printArea.height
        });

        // Restore hidden objects
        hiddenObjects.forEach(obj => {
            obj.visible = true;
        });
        canvas.renderAll();

        console.log(`✂️ OPTIMIZED PNG: Generated ${viewData.name} print zone (${printArea.width}x${printArea.height})`);

        return dataUrl;

    } catch (error) {
        console.error(`❌ OPTIMIZED PNG: Failed to generate PNG for ${viewData.name}:`, error);
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
        console.warn(`⚠️ OPTIMIZED PNG: Could not get safeZone for view ${viewId}`);
    }

    // Fallback: Use safe zone or default area
    const canvasWidth = designer.fabricCanvas.width;
    const canvasHeight = designer.fabricCanvas.height;

    console.warn(`⚠️ Using fallback print area for ${viewId}`);
    return {
        left: canvasWidth * 0.1,
        top: canvasHeight * 0.1,
        width: canvasWidth * 0.8,
        height: canvasWidth * 0.8
    };
}


// Helper: Upload individual view PNG to server
async function uploadViewPNG(pngDataUrl, viewId, viewName, designId) {
    try {
        console.log(`📤 OPTIMIZED PNG: Uploading ${viewName} PNG...`);

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
            console.log(`🔍 OPTIMIZED PNG: Server response for ${viewName}:`, result);
            if (result.success) {
                console.log(`✅ OPTIMIZED PNG: ${viewName} uploaded successfully!`);
                console.log(`🔗 OPTIMIZED PNG: ${viewName} URL:`, result.data?.png_url || result.data?.file_url || 'URL not found');
                return {
                    success: true,
                    viewId: viewId,
                    viewName: viewName,
                    url: result.data?.png_url || result.data?.file_url || null
                };
            } else {
                console.error(`❌ OPTIMIZED PNG: ${viewName} upload failed:`, result.data);
                return {
                    success: false,
                    viewId: viewId,
                    viewName: viewName,
                    error: result.data
                };
            }
        } else {
            console.error(`❌ OPTIMIZED PNG: ${viewName} upload HTTP error:`, uploadResponse.status);
            return {
                success: false,
                viewId: viewId,
                viewName: viewName,
                error: `HTTP ${uploadResponse.status}`
            };
        }

    } catch (error) {
        console.error(`❌ OPTIMIZED PNG: ${viewName} upload error:`, error);
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

console.log('✅ OPTIMIZED PNG: Parallel multi-view PNG system ready - NO VIEW SWITCHING!');