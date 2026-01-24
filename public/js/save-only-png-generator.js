/**
 * ✅ MINIMAL PNG GENERATOR - Clean Implementation
 * Provides only the essential generatePNGForDownload function for designer.bundle.js
 */

console.log('🎯 MINIMAL PNG v2: Providing clean generatePNGForDownload function - Cache Breaker');

// Multi-View PNG generation function for designer.bundle.js
window.generatePNGForDownload = async function() {
    try {
        console.log('🎯 CLEAN PNG: Multi-view generation started');

        const designer = window.designerInstance;
        if (!designer?.fabricCanvas) {
            console.error('❌ CLEAN PNG: No designer or canvas');
            return null;
        }

        // Get all available views
        const views = await getAvailableViews(designer);
        console.log('🔍 CLEAN PNG: Found views:', Object.keys(views));

        // Generate PNGs for both views and upload separately
        const results = {};
        const uploadPromises = [];

        for (const [viewId, viewData] of Object.entries(views)) {
            console.log(`🎯 CLEAN PNG: Processing view ${viewData.name} (${viewId})`);

            // Switch to view
            await switchToView(designer, viewId);

            // Generate PNG for this view (print zone cropped)
            const pngData = await generateViewPNG(designer, viewId, viewData.name);
            if (pngData) {
                results[viewId] = pngData;
                console.log(`✅ CLEAN PNG: Generated ${viewData.name} - ${pngData.length} chars`);

                // Upload this view's PNG separately
                uploadPromises.push(uploadViewPNG(pngData, viewId, viewData.name, designer.currentDesignId));
            }
        }

        // Wait for all uploads to complete
        const uploadResults = await Promise.all(uploadPromises);

        // Log all PNG URLs
        uploadResults.forEach(result => {
            if (result.success) {
                console.log(`🔗 CLEAN PNG: ${result.viewName} URL:`, result.url);
            }
        });

        // Return first successful PNG for compatibility with existing save system
        const firstPng = Object.values(results)[0];
        console.log('🎯 CLEAN PNG: Multi-view generation complete, returning:', firstPng ? 'SUCCESS' : 'FAILED');
        return firstPng || null;

    } catch (error) {
        console.error('❌ CLEAN PNG: Multi-view generation failed:', error);
        return null;
    }
};

// Helper: Get available views from template system
async function getAvailableViews(designer) {
    try {
        const template = designer.templates?.get(designer.activeTemplateId);
        const variation = template?.variations?.get(designer.currentVariation?.toString());

        if (variation?.views) {
            // Convert Map to Object
            const viewsObj = {};
            variation.views.forEach((viewData, viewId) => {
                viewsObj[viewId] = viewData;
            });
            return viewsObj;
        }

        // Fallback: Use current view only
        return { [designer.currentView]: { name: 'Current View' } };
    } catch (error) {
        console.error('❌ CLEAN PNG: Failed to get views:', error);
        return { [designer.currentView]: { name: 'Current View' } };
    }
}

// Helper: Switch to specific view
async function switchToView(designer, viewId) {
    try {
        if (designer.currentView === viewId) {
            console.log(`🔄 CLEAN PNG: Already on view ${viewId}`);
            return;
        }

        console.log(`🔄 CLEAN PNG: Switching to view ${viewId}`);

        if (typeof designer.switchView === 'function') {
            await designer.switchView(viewId);
        } else {
            designer.currentView = viewId;
        }

        // Wait for view switch to complete
        await new Promise(resolve => setTimeout(resolve, 100));

    } catch (error) {
        console.error('❌ CLEAN PNG: View switch failed:', error);
    }
}

// Helper: Generate PNG for specific view (print zone cropped)
async function generateViewPNG(designer, viewId, viewName) {
    try {
        const canvas = designer.fabricCanvas;

        // Get design elements only (exclude background shirt)
        const designObjects = canvas.getObjects().filter(obj => {
            const isBackground = obj.isBackground === true ||
                               (obj.type === 'image' && obj.selectable === false);
            const isSystemObject = obj.excludeFromExport === true;
            const isUserContent = obj.selectable === true && obj.visible === true;

            return isUserContent && !isBackground && !isSystemObject;
        });

        console.log(`🎨 CLEAN PNG: Found ${designObjects.length} design objects for ${viewName}`);

        if (designObjects.length === 0) {
            console.log(`⚠️ CLEAN PNG: No design content in ${viewName}, skipping`);
            return null;
        }

        // Get print area coordinates from view data
        const printArea = getPrintArea(designer);
        console.log(`📐 CLEAN PNG: Print area for ${viewName}:`, printArea);

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

        console.log(`✂️ CLEAN PNG: Cropped ${viewName} to print zone (${printArea.width}x${printArea.height})`);

        return dataUrl;

    } catch (error) {
        console.error(`❌ CLEAN PNG: Failed to generate PNG for ${viewName}:`, error);
        return null;
    }
}

// Helper: Get print area coordinates
function getPrintArea(designer) {
    // Try to get print zone from view data
    try {
        const template = designer.templates?.get(designer.activeTemplateId);
        const variation = template?.variations?.get(designer.currentVariation?.toString());
        const view = variation?.views?.get(designer.currentView?.toString());

        if (view?.printArea) {
            return view.printArea;
        }
    } catch (error) {
        console.warn('⚠️ CLEAN PNG: Could not get print area from view data');
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
        console.log(`📤 CLEAN PNG: Uploading ${viewName} PNG...`);

        const formData = new FormData();
        formData.append('action', 'save_design_png');
        formData.append('nonce', window.octoPrintDesigner?.nonce || '');
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
                console.log(`✅ CLEAN PNG: ${viewName} uploaded successfully!`);
                return {
                    success: true,
                    viewId: viewId,
                    viewName: viewName,
                    url: result.data.png_url
                };
            } else {
                console.error(`❌ CLEAN PNG: ${viewName} upload failed:`, result.data);
            }
        } else {
            console.error(`❌ CLEAN PNG: ${viewName} upload HTTP error:`, uploadResponse.status);
        }

        return { success: false, viewId: viewId, viewName: viewName };

    } catch (error) {
        console.error(`❌ CLEAN PNG: ${viewName} upload error:`, error);
        return { success: false, viewId: viewId, viewName: viewName };
    }
}

console.log('✅ MINIMAL PNG: Clean PNG system ready');