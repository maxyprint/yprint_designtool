/**
 * ✅ VISUAL CANVAS SNAPSHOT PNG GENERATOR - Complete Clean Implementation
 * Replaces all legacy coordinate-based systems with visual canvas snapshot approach
 * Uses Fabric.js ClipPath for coordinate-free, accurate PNG generation
 *
 * VOLLSTÄNDIGE IMPLEMENTIERUNG - No legacy code, no dead code, clean initialization
 */

console.log('🎯 VISUAL PNG SYSTEM: Loading complete visual canvas snapshot implementation');

/**
 * ===== CORE VISUAL PNG SYSTEM =====
 * Clean implementation of coordinate-free PNG generation
 */

/**
 * Detects all print zones on canvas using live visual detection
 * No static coordinates - only live canvas state
 */
function detectCanvasPrintZones(canvas, designer) {
    console.log('🔍 PRINT ZONE DETECTION: Scanning for template views');

    if (!canvas || !designer) {
        console.error('❌ PRINT ZONE DETECTION: Missing canvas or designer');
        return [];
    }

    const printZones = [];

    // Get template view data
    const template = designer.templates?.get(designer.activeTemplateId);
    const variation = template?.variations?.get(designer.currentVariation?.toString());

    if (variation?.views) {
        console.log('📋 TEMPLATE VIEWS: Processing template-based print zones');

        variation.views.forEach((viewData, viewId) => {
            // Use canvas print zone for current view, template data for others
            if (viewId === designer.currentView && designer.printZoneRect?.visible) {
                // Current view: use live canvas print zone
                const bounds = designer.printZoneRect.getBoundingRect();
                printZones.push({
                    source: 'live_canvas_current_view',
                    rect: designer.printZoneRect,
                    bounds: bounds,
                    viewId: viewId,
                    viewName: viewData.name
                });
                console.log(`✅ TEMPLATE VIEW: ${viewData.name} (${viewId}) - live canvas`, bounds);
            } else if (viewData.printArea) {
                // Other views: use template print area data
                printZones.push({
                    source: 'template_print_area',
                    rect: null, // No live rect for non-current views
                    bounds: viewData.printArea,
                    viewId: viewId,
                    viewName: viewData.name
                });
                console.log(`✅ TEMPLATE VIEW: ${viewData.name} (${viewId}) - template data`, viewData.printArea);
            }
        });
    } else {
        console.warn('⚠️ TEMPLATE VIEWS: No template views found, falling back to canvas detection');

        // Fallback: canvas-based detection for systems without template views
        if (designer.printZoneRect?.visible) {
            const bounds = designer.printZoneRect.getBoundingRect();
            printZones.push({
                source: 'canvas_fallback',
                rect: designer.printZoneRect,
                bounds: bounds,
                viewId: 'current',
                viewName: 'Current View'
            });
            console.log('✅ FALLBACK: Found canvas print zone', bounds);
        }
    }

    console.log(`🎯 PRINT ZONE DETECTION: Found ${printZones.length} template views`);
    return printZones;
}

/**
 * Generates PNG using visual canvas snapshot with Fabric.js ClipPath
 * Completely coordinate-free approach
 */
async function generateVisualCanvasSnapshot(canvas, printZone, designId, viewId) {
    console.log('📸 VISUAL SNAPSHOT: Starting coordinate-free generation', {
        viewId: viewId,
        printZone: printZone.bounds
    });

    let originalClipPath = null;
    let originalBackgroundColor = null;

    try {
        // Save original canvas state
        originalClipPath = canvas.clipPath;
        originalBackgroundColor = canvas.backgroundColor;

        // Create clipping path from detected print zone
        const clipPath = new fabric.Rect({
            left: printZone.bounds.left,
            top: printZone.bounds.top,
            width: printZone.bounds.width,
            height: printZone.bounds.height,
            fill: 'transparent',
            stroke: null,
            excludeFromExport: true
        });

        console.log('✂️ VISUAL SNAPSHOT: Created clip path', clipPath.getBoundingRect());

        // Apply visual clipping to canvas
        canvas.clipPath = clipPath;
        canvas.backgroundColor = 'transparent';
        canvas.renderAll();

        console.log('🎨 VISUAL SNAPSHOT: Applied clipping, generating PNG...');

        // Generate high-quality snapshot
        const dataURL = canvas.toDataURL({
            format: 'png',
            quality: 1,
            multiplier: 2, // High resolution for print quality
            enableRetinaScaling: false
        });

        console.log('📸 VISUAL SNAPSHOT: Generated snapshot', {
            length: dataURL?.length || 0,
            validPNG: dataURL?.startsWith('data:image/png') || false
        });

        // Validate PNG content
        if (!dataURL || dataURL.length < 1000) {
            console.error('❌ VISUAL SNAPSHOT: Generated PNG is empty or too small');
            return null;
        }

        console.log('✅ VISUAL SNAPSHOT: Successfully generated visual PNG');
        return dataURL;

    } catch (error) {
        console.error('❌ VISUAL SNAPSHOT: Generation failed:', error);
        return null;
    } finally {
        // Always restore canvas state
        try {
            canvas.clipPath = originalClipPath;
            canvas.backgroundColor = originalBackgroundColor;
            canvas.renderAll();
            console.log('🔄 VISUAL SNAPSHOT: Canvas state restored');
        } catch (restoreError) {
            console.error('❌ VISUAL SNAPSHOT: Failed to restore canvas state:', restoreError);
        }
    }
}

/**
 * Multi-view PNG generation without view switching
 * Processes all detected print zones automatically
 */
async function generateMultiViewVisualPNGs(designId) {
    console.log('🌟 MULTI-VIEW: Starting multi-view visual generation', { designId });

    const designer = window.designerInstance;
    if (!designer?.fabricCanvas) {
        console.error('❌ MULTI-VIEW: No designer or canvas available');
        return null;
    }

    const canvas = designer.fabricCanvas;
    const printZones = detectCanvasPrintZones(canvas, designer);

    if (printZones.length === 0) {
        console.error('❌ MULTI-VIEW: No print zones detected on canvas');
        return null;
    }

    console.log(`🎯 MULTI-VIEW: Processing ${printZones.length} print zones`);

    const results = [];

    for (const printZone of printZones) {
        console.log(`📸 MULTI-VIEW: Generating PNG for ${printZone.viewName}`);

        const pngData = await generateVisualCanvasSnapshot(
            canvas,
            printZone,
            designId,
            printZone.viewId
        );

        if (pngData) {
            results.push({
                viewId: printZone.viewId,
                viewName: printZone.viewName,
                pngData: pngData,
                printZone: printZone.bounds,
                source: printZone.source
            });
            console.log(`✅ MULTI-VIEW: Generated ${printZone.viewName} PNG successfully`);
        } else {
            console.warn(`⚠️ MULTI-VIEW: Failed to generate ${printZone.viewName} PNG`);
        }
    }

    console.log(`🎉 MULTI-VIEW: Generated ${results.length}/${printZones.length} PNGs`);
    return results;
}

/**
 * ===== PUBLIC API FUNCTIONS =====
 * Clean, consistent API for PNG generation
 */

/**
 * Generate PNG for download - Primary function for user downloads
 */
window.generatePNGForDownload = async function() {
    console.log('📥 PNG DOWNLOAD: Starting visual canvas snapshot download');

    try {
        const designer = window.designerInstance;
        if (!designer?.fabricCanvas) {
            console.error('❌ PNG DOWNLOAD: No designer instance or canvas');
            return null;
        }

        const designId = designer.currentDesignId || designer.activeTemplateId || 'download';
        const visualResults = await generateMultiViewVisualPNGs(designId);

        if (!visualResults || visualResults.length === 0) {
            console.error('❌ PNG DOWNLOAD: No visual PNGs could be generated');
            return null;
        }

        // For download, return the primary/first result
        const primaryResult = visualResults[0];
        console.log(`✅ PNG DOWNLOAD: Using ${primaryResult.viewName} for download`);

        return {
            success: true,
            pngData: primaryResult.pngData,
            viewName: primaryResult.viewName,
            allViews: visualResults,
            method: 'visual_canvas_snapshot'
        };

    } catch (error) {
        console.error('❌ PNG DOWNLOAD: Error during generation:', error);
        return null;
    }
};

/**
 * Generate and save PNG to server - Multi-view with server upload
 */
window.generatePNGForSave = async function(designId) {
    console.log('💾 PNG SAVE: Starting multi-view save to server', { designId });

    if (!designId) {
        console.error('❌ PNG SAVE: No design ID provided');
        return { success: false, error: 'Missing design ID' };
    }

    try {
        const visualResults = await generateMultiViewVisualPNGs(designId);

        if (!visualResults || visualResults.length === 0) {
            console.error('❌ PNG SAVE: No visual PNGs generated for saving');
            return { success: false, error: 'No PNGs generated' };
        }

        console.log(`💾 PNG SAVE: Saving ${visualResults.length} views to server`);

        // Save all views to server
        const savePromises = visualResults.map(async (result) => {
            console.log(`💾 PNG SAVE: Uploading ${result.viewName} to server`);

            try {
                // Convert DataURL to Blob for proper file upload
                const response = await fetch(result.pngData);
                const blob = await response.blob();

                const formData = new FormData();
                formData.append('action', 'save_design_png');
                formData.append('design_id', designId);
                formData.append('png_file', blob, `design_${designId}_${result.viewId}.png`);
                formData.append('nonce', window.octoPrintDesigner?.nonce || window.wp_ajax_object?.nonce || '');

                console.log(`📦 PNG SAVE: Prepared file upload for ${result.viewName}`, {
                    blobSize: blob.size,
                    fileName: `design_${designId}_${result.viewId}.png`,
                    hasNonce: !!(window.octoPrintDesigner?.nonce || window.wp_ajax_object?.nonce)
                });

                const uploadResponse = await fetch(
                    window.wp_ajax_object?.ajax_url || '/wp-admin/admin-ajax.php',
                    {
                        method: 'POST',
                        body: formData
                    }
                );

                const responseData = await uploadResponse.json();

                if (responseData.success) {
                    console.log(`✅ PNG SAVE: ${result.viewName} saved successfully`, responseData.data);
                    return {
                        success: true,
                        viewName: result.viewName,
                        data: responseData,
                        url: responseData.data?.file_url,
                        filepath: responseData.data?.file_path
                    };
                } else {
                    console.error(`❌ PNG SAVE: ${result.viewName} save failed:`, responseData);
                    return { success: false, viewName: result.viewName, error: responseData };
                }
            } catch (saveError) {
                console.error(`❌ PNG SAVE: ${result.viewName} error:`, saveError);
                return { success: false, viewName: result.viewName, error: saveError };
            }
        });

        const saveResults = await Promise.all(savePromises);
        const successCount = saveResults.filter(r => r.success).length;

        console.log(`🎉 PNG SAVE: Saved ${successCount}/${visualResults.length} PNGs successfully`);

        // Extract Front View URL for direct access
        const frontResult = saveResults.find(result =>
            result.success && (result.viewName === 'Front' || result.viewName?.includes('Front'))
        );
        const frontPngUrl = frontResult?.url || null;

        if (frontPngUrl) {
            console.log(`🎯 FRONT VIEW: Front PNG available at ${frontPngUrl}`);
        }

        return {
            success: successCount > 0,
            designId: designId,
            totalViews: visualResults.length,
            savedViews: successCount,
            results: saveResults,
            frontPngUrl: frontPngUrl, // Direct Front View URL access
            method: 'visual_canvas_snapshot',
            message: `Successfully saved ${successCount} of ${visualResults.length} views`
        };

    } catch (error) {
        console.error('❌ PNG SAVE: Error during save process:', error);
        return { success: false, designId: designId, error: error.message };
    }
};

/**
 * Generate PNG for specific view without switching - Used by multi-view system
 */
window.generateViewPNGWithoutSwitching = async function(designer, viewId, viewData) {
    console.log('🎯 VIEW PNG: Generating PNG for specific view', { viewId });

    if (!designer?.fabricCanvas) {
        console.error('❌ VIEW PNG: No designer or canvas available');
        return null;
    }

    try {
        const canvas = designer.fabricCanvas;
        const printZones = detectCanvasPrintZones(canvas, designer);

        // Find matching print zone for the requested view
        let matchingPrintZone = printZones.find(zone =>
            zone.viewId === viewId ||
            zone.viewName === viewData?.name ||
            zone.viewId === 'current'
        );

        // Use first available if no specific match
        if (!matchingPrintZone && printZones.length > 0) {
            matchingPrintZone = printZones[0];
            console.log('🔄 VIEW PNG: Using first available print zone as fallback');
        }

        if (!matchingPrintZone) {
            console.error('❌ VIEW PNG: No print zone found for view');
            return null;
        }

        console.log('📸 VIEW PNG: Generating visual snapshot for view');

        const pngData = await generateVisualCanvasSnapshot(
            canvas,
            matchingPrintZone,
            designer.currentDesignId || designer.activeTemplateId,
            viewId
        );

        if (pngData) {
            console.log('✅ VIEW PNG: Generated successfully for view');
            return pngData;
        } else {
            console.error('❌ VIEW PNG: Failed to generate PNG');
            return null;
        }

    } catch (error) {
        console.error('❌ VIEW PNG: Error during generation:', error);
        return null;
    }
};

/**
 * ===== SYSTEM INITIALIZATION =====
 * Clean system setup and validation
 */

// Validate system requirements
function validateSystemRequirements() {
    console.log('🔧 SYSTEM VALIDATION: Checking requirements for visual PNG system');

    const requirements = {
        fabricJS: typeof fabric !== 'undefined',
        designerInstance: !!window.designerInstance,
        fabricCanvas: !!window.designerInstance?.fabricCanvas,
        clipPathSupport: typeof window.designerInstance?.fabricCanvas?.clipPath !== 'undefined'
    };

    console.log('📋 System Requirements Check:', requirements);

    const allRequirementsMet = Object.values(requirements).every(req => req);

    if (allRequirementsMet) {
        console.log('✅ SYSTEM VALIDATION: All requirements met - system ready');
        return true;
    } else {
        console.warn('⚠️ SYSTEM VALIDATION: Some requirements not met - functionality may be limited');
        return false;
    }
}

// Initialize the visual PNG system
function initializeVisualPNGSystem() {
    console.log('🚀 SYSTEM INITIALIZATION: Starting visual PNG system');

    const systemReady = validateSystemRequirements();

    if (systemReady) {
        console.log('✅ VISUAL PNG SYSTEM: Fully initialized and ready');

        // Test print zone detection on initialization
        if (window.designerInstance?.fabricCanvas) {
            const printZones = detectCanvasPrintZones(
                window.designerInstance.fabricCanvas,
                window.designerInstance
            );
            console.log(`🎯 INITIALIZATION: Detected ${printZones.length} print zones on startup`);
        }
    } else {
        console.warn('⚠️ VISUAL PNG SYSTEM: Initialized with limited functionality');
    }

    return systemReady;
}

// Provide debug access for development
window.visualPNGSystem = {
    // Core functions
    detectCanvasPrintZones: detectCanvasPrintZones,
    generateVisualCanvasSnapshot: generateVisualCanvasSnapshot,
    generateMultiViewVisualPNGs: generateMultiViewVisualPNGs,

    // System management
    validateRequirements: validateSystemRequirements,
    reinitialize: initializeVisualPNGSystem,

    // Quick testing
    testPrintZoneDetection: () => {
        if (window.designerInstance?.fabricCanvas) {
            return detectCanvasPrintZones(window.designerInstance.fabricCanvas, window.designerInstance);
        }
        return [];
    },

    testPNGGeneration: async () => {
        try {
            return await window.generatePNGForDownload();
        } catch (error) {
            console.error('Test PNG generation failed:', error);
            return null;
        }
    }
};

// Initialize system on load
const systemInitialized = initializeVisualPNGSystem();

console.log('🎉 VISUAL PNG SYSTEM: Complete clean implementation loaded');
console.log('ℹ️ STATUS: ' + (systemInitialized ? 'READY FOR PRODUCTION' : 'LIMITED FUNCTIONALITY'));
console.log('🛠️ DEBUG ACCESS: window.visualPNGSystem for development tools');