// Design Auto-Loader Script mit umfassendem Debugging
(function() {
    'use strict';
    
    console.log('%c=== DESIGN LOADER DEBUG START ===', 'color: blue; font-weight: bold;');
    console.log('Design Auto-Loader initialized at:', new Date().toISOString());
    
    // Debug-Hilfsfunktionen
    function debugLog(message, data = null) {
        console.log('%c[DESIGN-LOADER]', 'color: green;', message, data || '');
    }
    
    function debugError(message, error = null) {
        console.error('%c[DESIGN-LOADER ERROR]', 'color: red;', message, error || '');
    }
    
    function debugWarn(message, data = null) {
        console.warn('%c[DESIGN-LOADER WARNING]', 'color: orange;', message, data || '');
    }

    /**
     * PHASE 3 - AGENT 3: Normalize design data to Golden Standard format
     *
     * Handles 3 formats:
     * 1. Golden Standard (objects + metadata.capture_version) - pass through
     * 2. variationImages (nested transform) - flatten and convert
     * 3. Legacy nested view format - convert to Golden Standard
     *
     * @param {Object} data Design data in any format
     * @returns {Object} Normalized design data in Golden Standard format
     */
    function normalizeDesignData(data) {
        // Already Golden Standard?
        if (data.objects && data.metadata && data.metadata.capture_version) {
            debugLog('✅ Design already in Golden Standard format (capture_version: ' + data.metadata.capture_version + ')');
            return data;
        }

        // variationImages format?
        if (data.variationImages) {
            debugLog('🔄 Converting variationImages format to Golden Standard');

            const variationKeys = Object.keys(data.variationImages);
            const elements = data.variationImages[variationKeys[0]];

            // Flatten transform
            const normalizedElements = elements.map(el => {
                if (el.transform) {
                    // Move transform properties to root
                    const flattened = {...el, ...el.transform};
                    delete flattened.transform;
                    return flattened;
                }
                return el;
            });

            const normalized = {
                objects: normalizedElements,
                metadata: {
                    capture_version: '2.1-migrated',
                    source: 'variation_images_normalized',
                    original_template_id: data.templateId,
                    original_variation: data.currentVariation
                }
            };

            debugLog('✅ variationImages converted: ' + normalizedElements.length + ' elements normalized');
            return normalized;
        }

        // Legacy format? (e.g., "167359_189542": {images: [...]})
        const keys = Object.keys(data);
        if (keys.length > 0 && data[keys[0]] && data[keys[0]].images) {
            debugLog('🔄 Converting legacy view format to Golden Standard');

            const normalized = {
                objects: data[keys[0]].images,
                metadata: {
                    capture_version: '1.0-legacy-migrated',
                    source: 'legacy_normalized',
                    original_view_key: keys[0]
                }
            };

            debugLog('✅ Legacy format converted: ' + data[keys[0]].images.length + ' elements normalized');
            return normalized;
        }

        debugWarn('Unknown design format', data);
        return data;
    }

    // Warte bis Designer geladen ist
    function waitForDesigner() {
        debugLog('Waiting for designer...');
        
        const designerElement = document.querySelector('.octo-print-designer');
        const canvasElement = document.querySelector('#octo-print-designer-canvas');
        
        // Direkte window.fabric Prüfung
        const fabricAvailable = typeof window.fabric !== 'undefined' && 
                               typeof window.fabric.Canvas !== 'undefined' && 
                               typeof window.fabric.Image !== 'undefined';
        
        debugLog('Designer element found:', !!designerElement);
        debugLog('Canvas element found:', !!canvasElement);
        debugLog('window.fabric available:', fabricAvailable);
        debugLog('Auto-load data available:', !!window.octoPrintDesignerAutoLoad);
        
        if (fabricAvailable) {
            debugLog('window.fabric details:', {
                hasCanvas: typeof window.fabric.Canvas !== 'undefined',
                hasImage: typeof window.fabric.Image !== 'undefined',
                canvasInstances: window.fabric.Canvas.getInstances ? window.fabric.Canvas.getInstances().length : 'getInstances not available'
            });
        }
        
        // Korrigierte Requirements Check Logik
        const requirementsMet = designerElement && canvasElement && fabricAvailable;
        
        if (requirementsMet) {
            debugLog('✅ All requirements met, checking for auto-load data');
            
            // Prüfe auf Auto-Load Daten
            if (window.octoPrintDesignerAutoLoad) {
                debugLog('Auto-load data found:', window.octoPrintDesignerAutoLoad);
                
                if (window.octoPrintDesignerAutoLoad.hasDesignToLoad) {
                    debugLog('Design data available, starting load process');
                    loadDesignFromData(window.octoPrintDesignerAutoLoad.designData);
                } else {
                    debugWarn('No design data to load');
                }
            } else {
                debugWarn('No auto-load data available');
            }
        } else {
            debugLog('❌ Requirements not met, retrying in 500ms');
            debugLog('Requirements status:', {
                designerElement: !!designerElement,
                canvasElement: !!canvasElement,
                fabricAvailable: fabricAvailable
            });
            debugLog('Missing requirements:', {
                needsDesignerElement: !designerElement,
                needsCanvasElement: !canvasElement,
                needsFabricJs: !fabricAvailable
            });
            
            // Nur retry wenn wir noch nicht das Maximum erreicht haben
            if (retryCount < maxRetries) {
                setTimeout(waitForDesignerWithTimeout, 500);
            }
        }
    }
    
    function loadDesignFromData(designData) {
        try {
            debugLog('=== LOAD DESIGN FROM DATA START ===');
            debugLog('Design data received:', designData);
            
            if (!designData) {
                debugError('No design data provided');
                return;
            }
            
            // Prüfe design_data Feld
            if (!designData.design_data) {
                debugError('No design_data field in design object');
                return;
            }
            
            debugLog('Raw design_data field:', designData.design_data);
            debugLog('design_data type:', typeof designData.design_data);
            debugLog('design_data length:', designData.design_data.length);
            
            // Parse design_data JSON
            let parsedDesignData;
            try {
                if (typeof designData.design_data === 'string') {
                    debugLog('Parsing design_data from string...');
                    parsedDesignData = JSON.parse(designData.design_data);
                } else {
                    debugLog('Using design_data as object...');
                    parsedDesignData = designData.design_data;
                }
                
                debugLog('Parsed design data:', parsedDesignData);
                debugLog('Parsed design data keys:', Object.keys(parsedDesignData));
                
            } catch (e) {
                debugError('Error parsing design data JSON:', e);
                debugError('Raw design_data that failed to parse:', designData.design_data);
                return;
            }
            
            // Warte auf Canvas
            debugLog('Waiting for canvas to be ready...');
            waitForCanvas(function() {
                applyDesignToCanvas(parsedDesignData, designData);
            });
            
        } catch (error) {
            debugError('Error in loadDesignFromData:', error);
        }
    }
    
    function waitForCanvas(callback) {
        debugLog('Checking canvas availability...');
        
        const canvas = document.querySelector('#octo-print-designer-canvas');
        
        // Prüfe direkt auf window.fabric Canvas Instanzen
        let fabricCanvas = null;
        if (window.fabric && window.fabric.Canvas && window.fabric.Canvas.getInstances) {
            const instances = window.fabric.Canvas.getInstances();
            fabricCanvas = instances.length > 0 ? instances[0] : null;
        }
        
        debugLog('Canvas element found:', !!canvas);
        debugLog('Fabric canvas instance found:', !!fabricCanvas);
        
        if (canvas && fabricCanvas) {
            debugLog('Canvas ready, executing callback after 1s delay');
            setTimeout(callback, 1000);
        } else {
            debugLog('Canvas not ready, retrying in 500ms');
            setTimeout(() => waitForCanvas(callback), 500);
        }
    }
    
    function applyDesignToCanvas(parsedDesignData, designData) {
        try {
            debugLog('=== APPLY DESIGN TO CANVAS START ===');
            debugLog('Parsed design data for application:', parsedDesignData);

            // PHASE 3 - AGENT 3: Normalize design data to Golden Standard
            const normalizedData = normalizeDesignData(parsedDesignData);
            debugLog('Normalized design data:', normalizedData);

            // Template laden falls verfügbar (check both original and metadata)
            const templateId = normalizedData.metadata?.original_template_id || parsedDesignData.templateId;
            if (templateId) {
                debugLog('Template ID found:', templateId);
                triggerTemplateLoad(templateId);
            } else {
                debugWarn('No template ID in design data');
            }

            // Process objects in Golden Standard format
            if (normalizedData.objects && normalizedData.objects.length > 0) {
                debugLog('Processing ' + normalizedData.objects.length + ' objects from Golden Standard format');

                setTimeout(() => {
                    processGoldenStandardObjects(normalizedData.objects);
                }, 3000); // Wait for template loading
            } else {
                debugWarn('No objects in normalized design data');
            }
            
            // Design Name setzen
            if (designData.name) {
                debugLog('Setting design name:', designData.name);
                const nameInput = document.getElementById('designName');
                if (nameInput) {
                    nameInput.value = designData.name;
                    debugLog('Design name set successfully');
                } else {
                    debugWarn('Design name input not found');
                }
            }
            
            // URL bereinigen
            if (window.history && window.history.replaceState) {
                debugLog('Cleaning URL parameters');
                window.history.replaceState({}, '', window.location.pathname);
            }
            
            debugLog('=== APPLY DESIGN TO CANVAS END ===');
            
        } catch (error) {
            debugError('Error applying design to canvas:', error);
        }
    }
    
    function triggerTemplateLoad(templateId) {
        debugLog('Triggering template load for ID:', templateId);
        
        // Verschiedene Selektoren ausprobieren
        const selectors = [
            `[data-template-id="${templateId}"]`,
            `.library-item[data-template-id="${templateId}"]`,
            `.template-item[data-template-id="${templateId}"]`
        ];
        
        let templateElement = null;
        for (const selector of selectors) {
            templateElement = document.querySelector(selector);
            if (templateElement) {
                debugLog('Template element found with selector:', selector);
                break;
            }
        }
        
        if (templateElement) {
            debugLog('Clicking template element');
            templateElement.click();
        } else {
            debugWarn('Template element not found for ID:', templateId);
            debugLog('Available elements with data-template-id:', 
                document.querySelectorAll('[data-template-id]'));
        }
    }
    
    function processVariationImages(variationImages) {
        debugLog('=== PROCESS VARIATION IMAGES START ===');
        debugLog('Processing variation images:', variationImages);

        let totalImages = 0;

        Object.entries(variationImages).forEach(([key, imageData]) => {
            const [variationId, viewId] = key.split('_');
            debugLog(`Processing key: ${key} (variation: ${variationId}, view: ${viewId})`);
            debugLog(`Image data for ${key}:`, imageData);

            // Handle both array and single object formats
            const images = Array.isArray(imageData) ? imageData : [imageData];
            debugLog(`Number of images for ${key}:`, images.length);

            images.forEach((imgData, index) => {
                debugLog(`Processing image ${index + 1} for ${key}:`, imgData);

                if (imgData.url) {
                    debugLog(`Adding image to canvas: ${imgData.url}`);
                    addImageToCanvas(imgData.url, imgData.transform || {}, key, index);
                    totalImages++;
                } else {
                    debugWarn(`No URL found for image ${index + 1} in ${key}`);
                }
            });
        });

        debugLog(`Total images processed: ${totalImages}`);
        debugLog('=== PROCESS VARIATION IMAGES END ===');
    }

    /**
     * PHASE 3 - AGENT 3: Process objects in Golden Standard format
     */
    function processGoldenStandardObjects(objects) {
        debugLog('=== PROCESS GOLDEN STANDARD OBJECTS START ===');
        debugLog('Processing ' + objects.length + ' objects');

        let totalImages = 0;

        objects.forEach((obj, index) => {
            debugLog('Processing object ' + (index + 1) + ':', obj);

            // Extract variation_key for grouping
            const variationKey = obj.elementMetadata?.variation_key || 'default_view';

            // Get image URL (supports both 'src' and 'url' properties)
            const imageUrl = obj.src || obj.url;

            if (imageUrl) {
                debugLog('Adding image to canvas: ' + imageUrl);

                // Transform is already flat in Golden Standard format
                const transform = {
                    left: obj.left,
                    top: obj.top,
                    scaleX: obj.scaleX,
                    scaleY: obj.scaleY,
                    angle: obj.angle
                };

                addImageToCanvas(imageUrl, transform, variationKey, index);
                totalImages++;
            } else {
                debugWarn('No URL/src found for object ' + (index + 1));
            }
        });

        debugLog('Total objects processed: ' + totalImages);
        debugLog('=== PROCESS GOLDEN STANDARD OBJECTS END ===');
    }
    
    function addImageToCanvas(imageUrl, transform, viewKey, imageIndex) {
        debugLog(`=== ADD IMAGE TO CANVAS START ===`);
        debugLog(`URL: ${imageUrl}`);
        debugLog(`Transform:`, transform);
        debugLog(`View key: ${viewKey}`);
        debugLog(`Image index: ${imageIndex}`);
        
        // Direkte window.fabric Nutzung
        if (!window.fabric) {
            debugError('window.fabric not available');
            return;
        }
        
        // Canvas-Instanz finden
        let canvas = null;
        
        if (window.fabric.Canvas && window.fabric.Canvas.getInstances) {
            const instances = window.fabric.Canvas.getInstances();
            canvas = instances.length > 0 ? instances[0] : null;
            debugLog('Canvas found via window.fabric.Canvas.getInstances():', !!canvas);
        }
        
        // Fallback: Direkte Canvas-Suche
        if (!canvas) {
            const canvasElement = document.querySelector('#octo-print-designer-canvas');
            if (canvasElement && canvasElement.__fabric) {
                canvas = canvasElement.__fabric;
                debugLog('Canvas found via direct element access:', !!canvas);
            }
        }
        
        if (!canvas) {
            debugError('No canvas instance found');
            debugError('Available fabric instances:', window.fabric.Canvas?.getInstances?.() || 'getInstances not available');
            return;
        }
        
        debugLog('Canvas found, loading image...');
        
        // Verwende window.fabric.Image.fromURL
        window.fabric.Image.fromURL(imageUrl, function(img) {
            if (!img) {
                debugError('Failed to load image:', imageUrl);
                return;
            }
            
            debugLog('Image loaded successfully:', imageUrl);
            debugLog('Image dimensions:', { width: img.width, height: img.height });
            
            // Transform anwenden
            const finalTransform = {
                left: transform.left || canvas.width / 2,
                top: transform.top || canvas.height / 2,
                scaleX: transform.scaleX || 1,
                scaleY: transform.scaleY || 1,
                angle: transform.angle || 0,
                originX: 'center',
                originY: 'center'
            };
            
            debugLog('Applying transform:', finalTransform);
            img.set(finalTransform);
            
            // Canvas-Methoden prüfen und verwenden
            if (canvas.add && typeof canvas.add === 'function') {
                canvas.add(img);
                debugLog('Image added to canvas via canvas.add()');
            } else {
                debugError('Canvas.add method not available');
            }
            
            if (canvas.renderAll && typeof canvas.renderAll === 'function') {
                canvas.renderAll();
                debugLog('Canvas rendered via canvas.renderAll()');
            } else {
                debugError('Canvas.renderAll method not available');
            }
            
            const objectCount = canvas.getObjects ? canvas.getObjects().length : 'unknown';
            debugLog('Canvas object count:', objectCount);
            
        }, { crossOrigin: 'anonymous' });
        
        debugLog(`=== ADD IMAGE TO CANVAS END ===`);
    }
    
    // Globale Variablen für Retry-Logik
    let retryCount = 0;
    const maxRetries = 20; // 10 Sekunden maximum
    
    // Erweiterte waitForDesigner Funktion
    function waitForDesignerWithTimeout() {
        debugLog(`Attempt ${retryCount + 1}/${maxRetries} to find designer requirements`);
        
        if (retryCount >= maxRetries) {
            debugError('Maximum retry attempts reached. Giving up.');
            debugError('Final state check:');
            debugError('- Designer element:', !!document.querySelector('.octo-print-designer'));
            debugError('- Canvas element:', !!document.querySelector('#octo-print-designer-canvas'));
            debugError('- window.fabric:', typeof window.fabric !== 'undefined');
            debugError('- Auto-load data:', !!window.octoPrintDesignerAutoLoad);
            return;
        }
        
        retryCount++;
        waitForDesigner();
    }
    
    // Starte den Auto-Loader wenn DOM bereit ist
    if (document.readyState === 'loading') {
        debugLog('DOM still loading, waiting for DOMContentLoaded');
        document.addEventListener('DOMContentLoaded', initializeDesignLoader);
    } else {
        debugLog('DOM already loaded, starting immediately');
        initializeDesignLoader();
    }

    async function initializeDesignLoader() {
        debugLog('🚀 DESIGN-LOADER: Starting with enhanced fabric detection...');

        // 🚨 ENHANCED: Multi-method fabric availability detection
        function waitForFabricMultiMethod() {
            return new Promise((resolve, reject) => {
                const maxWaitTime = 15000; // 15 seconds maximum
                const checkInterval = 200; // Check every 200ms (less aggressive)
                let elapsed = 0;
                let attempts = 0;

                function checkFabric() {
                    attempts++;

                    // Method 1: Direct window.fabric check
                    if (typeof window.fabric !== 'undefined' &&
                        typeof window.fabric.Canvas === 'function') {
                        debugLog('✅ DESIGN-LOADER: window.fabric available via direct check after', elapsed, 'ms');
                        resolve();
                        return;
                    }

                    // Method 2: Check for DesignerWidget with fabricCanvas
                    if (window.designerWidgetInstance &&
                        window.designerWidgetInstance.fabricCanvas &&
                        typeof window.designerWidgetInstance.fabricCanvas.constructor === 'function') {
                        debugLog('✅ DESIGN-LOADER: fabric available via DesignerWidget after', elapsed, 'ms');

                        // Extract fabric from DesignerWidget if not globally available
                        if (!window.fabric) {
                            try {
                                const canvas = window.designerWidgetInstance.fabricCanvas;
                                window.fabric = {
                                    Canvas: canvas.constructor,
                                    Image: canvas.constructor.Image || null,
                                    Object: canvas.constructor.Object || null
                                };
                                debugLog('🔧 DESIGN-LOADER: Extracted fabric from DesignerWidget');
                            } catch (e) {
                                debugWarn('⚠️ DESIGN-LOADER: Failed to extract fabric from DesignerWidget:', e.message);
                            }
                        }
                        resolve();
                        return;
                    }

                    // Method 3: Check DOM for any canvas with __fabric
                    const canvasElements = document.querySelectorAll('canvas');
                    for (const canvas of canvasElements) {
                        if (canvas.__fabric && canvas.__fabric.constructor) {
                            debugLog('✅ DESIGN-LOADER: fabric available via DOM canvas after', elapsed, 'ms');
                            if (!window.fabric) {
                                try {
                                    window.fabric = {
                                        Canvas: canvas.__fabric.constructor,
                                        Image: canvas.__fabric.constructor.Image || null,
                                        Object: canvas.__fabric.constructor.Object || null
                                    };
                                    debugLog('🔧 DESIGN-LOADER: Extracted fabric from DOM canvas');
                                } catch (e) {
                                    debugWarn('⚠️ DESIGN-LOADER: Failed to extract fabric from DOM:', e.message);
                                }
                            }
                            resolve();
                            return;
                        }
                    }

                    elapsed += checkInterval;
                    if (elapsed >= maxWaitTime) {
                        debugError('❌ DESIGN-LOADER: Enhanced fabric wait timeout after', maxWaitTime, 'ms');
                        debugError('❌ DESIGN-LOADER: Final state check:');
                        debugError('  - window.fabric:', typeof window.fabric);
                        debugError('  - designerWidgetInstance:', !!window.designerWidgetInstance);
                        debugError('  - canvas elements found:', canvasElements.length);
                        debugError('  - total attempts:', attempts);
                        reject(new Error('Enhanced fabric availability timeout'));
                        return;
                    }

                    // Reduce log spam - only log every 5th attempt
                    if (attempts % 5 === 0) {
                        debugLog(`🔄 DESIGN-LOADER: Enhanced fabric detection... (${elapsed}ms, attempt ${attempts})`);
                    }
                    setTimeout(checkFabric, checkInterval);
                }

                // Start checking immediately
                checkFabric();

                // Listen for fabric ready event with higher priority
                window.addEventListener('fabricGlobalReady', function(event) {
                    debugLog('✅ DESIGN-LOADER: Received fabricGlobalReady event from', event.detail?.source);
                    resolve();
                }, { once: true });
            });
        }

        try {
            // Enhanced multi-method fabric detection
            await waitForFabricMultiMethod();
            debugLog('✅ DESIGN-LOADER: Fabric availability confirmed via enhanced detection');

            // Verify fabric is actually functional
            if (typeof window.fabric === 'undefined') {
                throw new Error('Fabric resolved but window.fabric is still undefined');
            }

            debugLog('✅ DESIGN-LOADER: Fabric functional verification passed');

            // Now proceed with designer initialization
            setTimeout(waitForDesigner, 500); // Slightly longer delay for stability

        } catch (error) {
            debugError('❌ DESIGN-LOADER: Enhanced detection failed:', error.message);
            debugError('❌ DESIGN-LOADER: Cannot proceed without fabric.js');

            // Emergency fallback: try to proceed anyway for debugging
            debugWarn('⚠️ DESIGN-LOADER: Attempting emergency fallback initialization...');
            setTimeout(waitForDesigner, 1000);
        }
        
        // Zusätzlicher Check nach vollständigem Page Load
        window.addEventListener('load', () => {
            debugLog('Window load event fired, doing final check...');
            setTimeout(() => {
                if (typeof window.fabric !== 'undefined' && retryCount < maxRetries) {
                    debugLog('window.fabric available after window load, retrying...');
                    waitForDesigner();
                }
            }, 1000);
        });
    }
    
    console.log('%c=== DESIGN LOADER DEBUG END ===', 'color: blue; font-weight: bold;');
    
})();