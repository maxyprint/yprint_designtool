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

        // Log all PNG URLs
        uploadResults.forEach(result => {
            if (result.success) {
                console.log(`🔗 OPTIMIZED PNG: ${result.viewName} URL:`, result.url);
            }
        });

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
    // Try to get print zone from specific view data
    try {
        const template = designer.templates?.get(designer.activeTemplateId);
        const variation = template?.variations?.get(designer.currentVariation?.toString());
        const view = variation?.views?.get(viewId?.toString());

        if (view?.printArea) {
            return view.printArea;
        }

        // Try from passed viewData
        if (viewData?.printArea) {
            return viewData.printArea;
        }
    } catch (error) {
        console.warn(`⚠️ OPTIMIZED PNG: Could not get print area for view ${viewId}`);
    }

    // Fallback: Use safe zone or default area
    const canvasWidth = designer.fabricCanvas.width;
    const canvasHeight = designer.fabricCanvas.height;

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
        console.log(`📤 OPTIMIZED PNG: Uploading ${viewName} PNG...`);

        const formData = new FormData();
        formData.append('action', 'save_design_png');
        formData.append('nonce', window.octoPrintDesigner?.nonce || window.octo_print_designer_config?.nonce || '');
        formData.append('design_id', designId);
        formData.append('view_id', viewId);
        formData.append('view_name', viewName);

        // Convert data URL to blob
        const response = await fetch(pngDataUrl);
        const blob = await response.blob();
        formData.append('png_file', blob, `design_${designId}_${viewName.toLowerCase()}_${viewId}.png`);

        // Upload to server
        const uploadResponse = await fetch(window.octoPrintDesigner?.ajaxUrl || window.octo_print_designer_config?.ajax_url, {
            method: 'POST',
            body: formData
        });

        if (uploadResponse.ok) {
            const result = await uploadResponse.json();
            if (result.success) {
                console.log(`✅ OPTIMIZED PNG: ${viewName} uploaded successfully!`);
                return {
                    success: true,
                    viewId: viewId,
                    viewName: viewName,
                    url: result.data.png_url
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

console.log('✅ OPTIMIZED PNG: Parallel multi-view PNG system ready - NO VIEW SWITCHING!');