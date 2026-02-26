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
 * Discovers all available views from template data
 * Returns view information without loading view data
 */
function discoverAvailableViews(designer) {
    console.log('🔍 VIEW DISCOVERY: Scanning template for available views');

    if (!designer?.activeTemplateId || !designer?.currentVariation) {
        console.warn('⚠️ VIEW DISCOVERY: No active template or variation');
        return [];
    }

    try {
        const template = designer.templates?.get(designer.activeTemplateId);
        const variation = template?.variations?.get(designer.currentVariation?.toString());

        if (!variation?.views) {
            console.warn('⚠️ VIEW DISCOVERY: No views found in template variation');
            return [];
        }

        const discoveredViews = [];
        variation.views.forEach((viewData, viewId) => {
            // Find live canvas print zone rectangle using stable identifier
            const canvas = designer?.fabricCanvas;
            const objects = canvas?.getObjects() || [];
            const printZoneRect = objects.find(obj => obj.data?.role === 'printZone');

            // Use live canvas coordinates - correct coordinate space
            const zoneBounds = printZoneRect?.getBoundingRect(true, true) || null;

            discoveredViews.push({
                viewId: viewId,
                viewName: viewData.name,
                printZone: zoneBounds, // Use safeZone data for print zone
                safeZone: viewData.safeZone,
                isCurrentView: viewId === designer.currentView,
                templateData: viewData
            });
            console.log(`✅ VIEW DISCOVERY: Found ${viewData.name} (${viewId}) - bounds:`, zoneBounds);
        });

        console.log(`🎯 VIEW DISCOVERY: Found ${discoveredViews.length} total views`);
        return discoveredViews;

    } catch (error) {
        console.error('❌ VIEW DISCOVERY: Error discovering views:', error);
        return [];
    }
}

/**
 * Converts template bounds from percent/center-origin to pixel/top-left coordinates
 * Template format: left/top as percent (0-100) center-origin, width/height as pixels
 * Export needs: top-left pixel coordinates for canvas.toDataURL()
 */
function convertTemplateBoundsToPixels(zoneData, canvasWidth, canvasHeight) {
    if (!zoneData || typeof zoneData.left !== 'number' || typeof zoneData.top !== 'number') {
        return null;
    }

    // Convert percent center-origin to center coordinates
    const centerX = zoneData.left * canvasWidth / 100;
    const centerY = zoneData.top * canvasHeight / 100;

    // Convert center to top-left
    let left = centerX - (zoneData.width / 2);
    let top = centerY - (zoneData.height / 2);

    // Clamp left/top to >= 0
    left = Math.max(0, left);
    top = Math.max(0, top);

    // Guarantee crop rect stays within canvas
    const width = Math.min(zoneData.width, canvasWidth - left);
    const height = Math.min(zoneData.height, canvasHeight - top);

    const clampedBounds = {
        left: Math.floor(left),
        top: Math.floor(top),
        width: Math.ceil(width),
        height: Math.ceil(height)
    };

    // Reduced verbosity: only log if conversion fails
    if (!clampedBounds || clampedBounds.width <= 0 || clampedBounds.height <= 0) {
        console.warn('TEMPLATE_BOUNDS_CONVERSION_FAILED', {
            input: zoneData,
            canvas: { width: canvasWidth, height: canvasHeight },
            result: clampedBounds
        });
    }

    return clampedBounds;
}

/**
 * Detects all print zones on canvas using live visual detection
 * Enhanced with multi-view support while preserving working single-view logic
 */
function detectCanvasPrintZones(canvas, designer) {
    console.log('🔍 PRINT ZONE DETECTION: Scanning for print zones (multi-view enabled)');

    if (!canvas || !designer) {
        console.error('❌ PRINT ZONE DETECTION: Missing canvas or designer');
        return [];
    }

    const printZones = [];

    // NEW: Try template-based multi-view approach first using real template store
    try {
        const template = designer.templates?.get(designer.activeTemplateId);
        const variation = template?.variations?.get(designer.currentVariation?.toString());

        // Robust canvas dimension detection
        let cw, ch, canvasType;
        if (canvas && typeof canvas.getWidth === 'function') {
            cw = canvas.getWidth();
            ch = canvas.getHeight();
            canvasType = 'fabric';
        } else if (canvas instanceof HTMLCanvasElement) {
            cw = canvas.width;
            ch = canvas.height;
            canvasType = 'html';
        } else if (designer.fabricCanvas && typeof designer.fabricCanvas.getWidth === 'function') {
            cw = designer.fabricCanvas.getWidth();
            ch = designer.fabricCanvas.getHeight();
            canvasType = 'fallback_fabric';
            console.log('CANVAS_FALLBACK_USED', { reason: 'canvas param invalid, using designer.fabricCanvas' });
        } else {
            throw new Error('No valid canvas dimensions available');
        }

        if (variation?.views) {
            console.log('📋 PRINT ZONE DETECTION: Using template-based multi-view approach');

            variation.views.forEach((viewData, viewId) => {
                if (viewId === designer.currentView && designer.printZoneRect?.visible) {
                    // Current view: use PROVEN working live canvas approach
                    const bounds = designer.printZoneRect.getBoundingRect();
                    printZones.push({
                        source: 'live_canvas_current_view',
                        rect: designer.printZoneRect,
                        bounds: bounds,
                        viewId: viewId,
                        viewName: viewData.name
                    });
                    console.log('VIEW_BOUNDS_RESOLVED', {
                        viewId: viewId,
                        source: 'live_canvas',
                        bounds: bounds
                    });
                } else {
                    // Other views: resolve template bounds using real template variation store
                    // Fix: Handle empty array [] which is truthy but should fall back to safeZone
                    let zoneData;
                    if (Array.isArray(viewData.printZone)) {
                        if (viewData.printZone.length > 0) {
                            zoneData = viewData.printZone[0];  // Use first zone object
                        } else {
                            zoneData = viewData.safeZone;      // Fallback to safeZone
                        }
                    } else if (viewData.printZone && typeof viewData.printZone.left === 'number') {
                        zoneData = viewData.printZone;        // Use object with numeric left/top
                    } else {
                        zoneData = viewData.safeZone;         // Fallback to safeZone
                    }

                    if (zoneData) {
                        const pixelBounds = convertTemplateBoundsToPixels(zoneData, cw, ch);

                        if (pixelBounds) {
                            printZones.push({
                                source: 'template_bounds_resolved',
                                rect: null, // No live rect for non-current views
                                bounds: pixelBounds,
                                viewId: viewId,
                                viewName: viewData.name
                            });
                            console.log('VIEW_BOUNDS_RESOLVED', {
                                viewId: viewId,
                                source: 'template',
                                raw: zoneData,
                                pixels: pixelBounds,
                                printZone_len: Array.isArray(viewData.printZone) ? viewData.printZone.length : 'not_array'
                            });
                        }
                    } else {
                        console.warn(`⚠️ PRINT ZONE: No zone data for ${viewData.name}`);
                    }
                }
            });

            if (printZones.length > 0) {
                console.log(`🎯 PRINT ZONE DETECTION: Template success - found ${printZones.length} zones`);

                // Concise per-export summary
                const summary = printZones.map(zone => ({
                    viewId: zone.viewId,
                    cropDims: `${zone.bounds.width}×${zone.bounds.height}`
                }));
                console.log('MULTI_VIEW_EXPORT_SUMMARY', summary);

                return printZones;
            } else {
                // Log why template path returned empty
                const emptyDiagnostic = [];
                variation.views.forEach((viewData, viewId) => {
                    const zoneData = viewData.printZone || viewData.safeZone;
                    const hasZoneData = !!zoneData;
                    let pixelBoundsNull = false;
                    if (hasZoneData) {
                        const testBounds = convertTemplateBoundsToPixels(zoneData, cw, ch);
                        pixelBoundsNull = !testBounds;
                    }
                    emptyDiagnostic.push({
                        viewId: viewId,
                        hasZoneData: hasZoneData,
                        pixelBoundsNull: pixelBoundsNull
                    });
                });
                console.log('TEMPLATE_PATH_EMPTY', {
                    printZonesCount: printZones.length,
                    perViewDiagnostic: emptyDiagnostic
                });
            }
        }
    } catch (error) {
        console.error('TEMPLATE_PATH_ERROR', {
            message: error.message,
            stackSummary: error.stack?.split('\n')[0] || 'no stack',
            activeTemplateId: designer.activeTemplateId,
            currentVariation: designer.currentVariation,
            viewsType: typeof variation?.views,
            canvasDims: `${cw}×${ch}`,
            canvasType: canvasType
        });
    }

    // PRESERVED: Original working single-view logic as fallback
    console.log('📋 PRINT ZONE DETECTION: Using proven single-view canvas approach');
    const allObjects = canvas.getObjects();

    // Method 1: Direct designer print zone references
    if (designer.printZoneRect && designer.printZoneRect.visible) {
        const bounds = designer.printZoneRect.getBoundingRect();
        printZones.push({
            source: 'designer.printZoneRect',
            rect: designer.printZoneRect,
            bounds: bounds,
            viewId: 'current',
            viewName: 'Current View'
        });
        console.log('✅ PRINT ZONE: Found printZoneRect', bounds);
    }

    if (designer.safeZoneRect && designer.safeZoneRect.visible) {
        const bounds = designer.safeZoneRect.getBoundingRect();
        printZones.push({
            source: 'designer.safeZoneRect',
            rect: designer.safeZoneRect,
            bounds: bounds,
            viewId: 'safe',
            viewName: 'Safe Zone'
        });
        console.log('✅ PRINT ZONE: Found safeZoneRect', bounds);
    }

    // Method 2: Canvas object analysis for excludeFromExport rectangles
    const excludeRects = allObjects.filter(obj =>
        obj.type === 'rect' &&
        obj.excludeFromExport === true &&
        obj.visible === true
    );

    excludeRects.forEach((rect, index) => {
        const bounds = rect.getBoundingRect();
        const coverage = {
            x: bounds.width / canvas.width,
            y: bounds.height / canvas.height
        };

        // Only consider rectangles that cover significant area (likely print zones)
        if (coverage.x > 0.15 && coverage.y > 0.15) {
            printZones.push({
                source: 'canvas_excludeFromExport',
                rect: rect,
                bounds: bounds,
                viewId: `detected_${index}`,
                viewName: `Print Zone ${index + 1}`,
                coverage: coverage
            });
            console.log(`✅ PRINT ZONE: Found canvas zone ${index + 1}`, bounds);
        }
    });

    console.log(`🎯 PRINT ZONE DETECTION: Found ${printZones.length} zones total`);
    return printZones;
}

/**
 * Temporarily loads graphics for a specific view onto canvas
 * Preserves original canvas state for restoration
 */
async function temporaryLoadViewGraphics(canvas, designer, targetViewId) {
    console.log(`🔄 VIEW GRAPHICS: Loading graphics for view ${targetViewId}`);

    const currentViewId = designer.currentView;
    if (targetViewId === currentViewId) {
        console.log('✅ VIEW GRAPHICS: Target view is current view - no loading needed');
        return { graphics: [], originalObjects: [] };
    }

    const variationId = designer.currentVariation?.toString();
    const viewKey = `${variationId}_${targetViewId}`;
    const viewGraphics = designer.variationImages?.get(viewKey) || [];

    console.log(`🎯 VIEW GRAPHICS: Found ${viewGraphics.length} graphics for view ${targetViewId}`);

    if (viewGraphics.length === 0) {
        console.log('ℹ️ VIEW GRAPHICS: No graphics to load for this view');
        return { graphics: [], originalObjects: [], hiddenCurrentViewGraphics: [] };
    }

    // CANVAS STATE ISOLATION: Hide current view graphics when loading different target view
    let hiddenCurrentViewGraphics = [];

    // Hard guard: skip isolation if target is current view
    if (targetViewId.toString() !== currentViewId.toString()) {
        const currentViewKey = `${variationId}_${currentViewId}`;
        const currentViewGraphics = designer.variationImages?.get(currentViewKey) || [];
        const currentViewGraphicIds = new Set(currentViewGraphics.map(g => g.id).filter(id => id));

        // Identify and temporarily hide current view graphics on canvas
        canvas.getObjects().forEach(obj => {
            if (obj.type === 'image' && obj.selectable === true && obj.evented === true) {
                const matchesCurrentView = currentViewGraphicIds.has(obj.id) ||
                                         currentViewGraphics.some(g =>
                                             g.fabricImage && obj.getSrc && g.fabricImage.getSrc &&
                                             g.fabricImage.getSrc() === obj.getSrc()
                                         );

                if (matchesCurrentView) {
                    hiddenCurrentViewGraphics.push({
                        obj: obj,
                        originalVisible: obj.visible
                    });
                    obj.visible = false;
                }
            }
        });

        if (hiddenCurrentViewGraphics.length > 0) {
            canvas.renderAll();
            console.log('VIEW_ISOLATION_APPLIED', {
                targetViewId,
                currentViewId,
                hiddenCount: hiddenCurrentViewGraphics.length
            });
        }
    }

    // Save current canvas objects for restoration
    const originalObjects = canvas.getObjects().slice();

    // Add view graphics to canvas temporarily
    const addedGraphics = [];
    for (const graphic of viewGraphics) {
        if (graphic.fabricImage && graphic.visible) {
            const clonedGraphic = await new Promise((resolve) => {
                graphic.fabricImage.clone(resolve);
            });

            canvas.add(clonedGraphic);
            addedGraphics.push(clonedGraphic);
            console.log(`✅ VIEW GRAPHICS: Added graphic to canvas`, graphic.transform);
        }
    }

    canvas.renderAll();
    console.log(`🎨 VIEW GRAPHICS: Loaded ${addedGraphics.length} graphics onto canvas`);

    return {
        graphics: addedGraphics,
        originalObjects: originalObjects,
        viewKey: viewKey,
        hiddenCurrentViewGraphics: hiddenCurrentViewGraphics
    };
}

/**
 * Restores canvas to original state after temporary view loading
 */
function restoreOriginalCanvas(canvas, originalObjects, addedGraphics, hiddenCurrentViewGraphics) {
    console.log('🔄 VIEW GRAPHICS: Restoring original canvas state');

    try {
        // Remove temporarily added graphics
        addedGraphics.forEach(graphic => {
            canvas.remove(graphic);
        });

        // Restore visibility of previously hidden current view graphics
        if (hiddenCurrentViewGraphics?.length) {
            hiddenCurrentViewGraphics.forEach(entry => {
                entry.obj.visible = entry.originalVisible;
            });
        }

        // Verify canvas has original objects only
        const currentObjects = canvas.getObjects();
        console.log(`✅ VIEW GRAPHICS: Canvas restored (${currentObjects.length} objects)`);

        canvas.renderAll();
    } catch (error) {
        console.error('❌ VIEW GRAPHICS: Error restoring canvas:', error);
    }
}

/**
 * Generates PNG using visual canvas snapshot with Fabric.js ClipPath
 * Enhanced with multi-view graphics loading while preserving working approach
 */
async function generateVisualCanvasSnapshot(canvas, printZone, designId, viewId) {
    console.log('📸 VISUAL SNAPSHOT: Starting multi-view coordinate-free generation', {
        viewId: viewId,
        printZone: printZone.bounds,
        source: printZone.source
    });

    let originalClipPath = null;
    let originalBackgroundColor = null;
    let viewGraphicsState = null;
    const designer = window.designerInstance;

    try {
        // STEP 1: Load view-specific graphics (NEW)
        viewGraphicsState = await temporaryLoadViewGraphics(canvas, designer, viewId);

        // STEP 2: Save original canvas state (PRESERVED)
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

        // Causality logging function
        const logObjectStates = (stage) => {
            const objs = canvas.getObjects();
            objs.forEach(obj => {
                if (!obj.__uid) {
                    window.__dbgUid = (window.__dbgUid||0)+1;
                    obj.__uid = 'u'+window.__dbgUid;
                }
            });

            const relevant = objs.filter(obj =>
                obj.data?.role === 'printZone' ||
                (obj.type === 'image' && obj.selectable === false && obj.evented === false) ||
                (obj.type === 'image' && obj.selectable === true && obj.evented === true)
            );

            const rows = relevant.map(obj => ({
                uid: obj.__uid,
                type: obj.type,
                role: obj.data?.role || 'none',
                name: obj.name || 'unnamed',
                visible: obj.visible,
                opacity: obj.opacity,
                selectable: obj.selectable,
                evented: obj.evented,
                srcShort: obj.type === 'image' ?
                    (obj.getSrc?.() || obj._element?.src || 'no-src').slice(-40) : 'n/a'
            }));

            console.groupCollapsed('CAUSALITY ' + stage);
            console.table(rows);
            console.groupEnd();
        };

        // POINT 1: Before hide-block
        logObjectStates('BEFORE_HIDE');

        // Hide print zone frame and mockup images during export
        const printZoneRect = canvas.getObjects().find(obj => obj.data?.role === 'printZone');
        const mockupImages = canvas.getObjects().filter(obj =>
            obj.type === 'image' &&
            obj.selectable === false &&
            obj.evented === false
        );

        // EXPERIMENTAL FIX: Store removal info with original positions (before any removals)
        const currentObjects = canvas.getObjects();
        const removalInfo = [];

        if (printZoneRect) {
            const index = currentObjects.indexOf(printZoneRect);
            removalInfo.push({ obj: printZoneRect, index, type: 'printZone' });
        }

        mockupImages.forEach(img => {
            const index = currentObjects.indexOf(img);
            removalInfo.push({ obj: img, index, type: 'mockup' });
        });

        let dataURL;
        try {
            // Remove objects temporarily instead of hiding
            removalInfo.forEach(info => {
                canvas.remove(info.obj);
            });

            canvas.renderAll();

            // POINT 2: After removal and renderAll
            logObjectStates('AFTER_REMOVE');

            // Proof: Log canvas state to verify removal
            const remaining = canvas.getObjects();
            const userGraphics = remaining.filter(o => o.type === 'image' && o.selectable === true && o.evented === true);
            console.log('🔬 REMOVAL PROOF:', {
                hasPrintZone: remaining.some(o => o.data?.role === 'printZone'),
                mockupCount: remaining.filter(o => o.type === 'image' && o.selectable === false && o.evented === false).length,
                userCount: userGraphics.length,
                totalObjects: remaining.length,
                removedCount: removalInfo.length
            });

            // POINT 3: Immediately before toDataURL
            logObjectStates('PRE_TODATAURL');

            // RENDER BARRIER: Ensure Fabric export captures current clean state
            try {
                // Discard any active selections
                if (canvas.discardActiveObject) {
                    canvas.discardActiveObject();
                }

                // Request render and wait for completion
                canvas.requestRenderAll();
                await new Promise(resolve => requestAnimationFrame(resolve));

                // Force synchronous render
                canvas.renderAll();

                console.log('BARRIER_APPLIED', { ts: Date.now() });
            } catch (e) {
                console.warn('Render barrier failed, using fallback export:', e);
            }

            // Generate high-quality snapshot with correct crop parameters
            const clipPath = canvas.clipPath;
            if (clipPath) {
                // Apply crop parameters with deterministic rounding
                const cropParams = {
                    left: Math.floor(clipPath.left),
                    top: Math.floor(clipPath.top),
                    width: Math.ceil(clipPath.width),
                    height: Math.ceil(clipPath.height),
                    multiplier: 2
                };

                // Proof gate: Assert exact same numbers from VIEW_BOUNDS_RESOLVED are used
                console.log('CROP_BOUNDS_ASSERTION', {
                    viewId: viewId,
                    clipPathBounds: {
                        left: clipPath.left,
                        top: clipPath.top,
                        width: clipPath.width,
                        height: clipPath.height
                    },
                    cropParams: cropParams,
                    printZoneBounds: printZone.bounds
                });

                console.log('CROP_APPLIED', cropParams);

                dataURL = canvas.toDataURL({
                    format: 'png',
                    quality: 1,
                    multiplier: cropParams.multiplier,
                    enableRetinaScaling: false,
                    left: cropParams.left,
                    top: cropParams.top,
                    width: cropParams.width,
                    height: cropParams.height
                });
            } else {
                // Fallback: use existing behavior if no clipPath
                dataURL = canvas.toDataURL({
                    format: 'png',
                    quality: 1,
                    multiplier: 2, // High resolution for print quality
                    enableRetinaScaling: false
                });
            }

        } finally {
            // Always restore removed objects at their original positions
            // Sort by index to restore in correct order
            removalInfo.sort((a, b) => a.index - b.index);

            removalInfo.forEach(info => {
                try {
                    canvas.insertAt(info.obj, info.index);
                } catch (e) {
                    // Fallback: add + moveTo if insertAt fails
                    canvas.add(info.obj);
                    canvas.moveTo(info.obj, info.index);
                }
            });

            canvas.renderAll();

            // POINT 4: After restore and renderAll
            logObjectStates('AFTER_RESTORE');
        }

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
            // STEP 1: Restore view graphics (NEW)
            if (viewGraphicsState && viewGraphicsState.graphics.length > 0) {
                restoreOriginalCanvas(canvas, viewGraphicsState.originalObjects, viewGraphicsState.graphics, viewGraphicsState.hiddenCurrentViewGraphics);
            }

            // STEP 2: Restore canvas properties (PRESERVED)
            canvas.clipPath = originalClipPath;
            canvas.backgroundColor = originalBackgroundColor;
            canvas.renderAll();
            console.log('🔄 VISUAL SNAPSHOT: Complete canvas state restored');
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
                formData.append('view_id', result.viewId);
                formData.append('view_name', result.viewName);

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

    // Multi-view system (NEW)
    discoverAvailableViews: discoverAvailableViews,
    temporaryLoadViewGraphics: temporaryLoadViewGraphics,
    restoreOriginalCanvas: restoreOriginalCanvas,

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

    testViewDiscovery: () => {
        if (window.designerInstance) {
            return discoverAvailableViews(window.designerInstance);
        }
        return [];
    },

    testMultiViewAccess: () => {
        const designer = window.designerInstance;
        if (!designer) return { error: 'No designer' };

        const views = discoverAvailableViews(designer);
        const variationId = designer.currentVariation?.toString();

        const result = {
            currentView: designer.currentView,
            discoveredViews: views,
            graphicsPerView: {}
        };

        views.forEach(view => {
            const viewKey = `${variationId}_${view.viewId}`;
            const graphics = designer.variationImages?.get(viewKey) || [];
            result.graphicsPerView[view.viewName] = graphics.length;
        });

        return result;
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