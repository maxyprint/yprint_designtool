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
            
            // Template laden falls verfügbar
            if (parsedDesignData.templateId) {
                debugLog('Template ID found:', parsedDesignData.templateId);
                triggerTemplateLoad(parsedDesignData.templateId);
            } else {
                debugWarn('No template ID in design data');
            }
            
            // Variation Images verarbeiten
            if (parsedDesignData.variationImages) {
                debugLog('Variation images found:', parsedDesignData.variationImages);
                debugLog('Number of variation image entries:', Object.keys(parsedDesignData.variationImages).length);
                
                setTimeout(() => {
                    processVariationImages(parsedDesignData.variationImages);
                }, 3000); // Längere Wartezeit für Template-Loading
            } else {
                debugWarn('No variation images in design data');
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
    
    // 🎨 REAL-TIME DESIGN DEBUGGING: Canvas Events überwachen
    function setupRealTimeDesignDebugging() {
        debugLog('🎨 Setting up real-time design debugging...');
        
        // Warte auf Canvas-Initialisierung
        const checkCanvas = setInterval(() => {
            const canvasElement = document.querySelector('#octo-print-designer-canvas');
            if (canvasElement && window.fabric && window.fabric.Canvas) {
                clearInterval(checkCanvas);
                
                // Finde die Fabric Canvas Instanz
                const fabricCanvas = window.fabric.Canvas.getInstances ? 
                    window.fabric.Canvas.getInstances().find(canvas => canvas.wrapperEl === canvasElement) :
                    null;
                
                if (fabricCanvas) {
                    debugLog('✅ Fabric Canvas gefunden, Events werden überwacht');
                    setupCanvasEventListeners(fabricCanvas);
                } else {
                    debugWarn('⚠️ Fabric Canvas Instanz nicht gefunden');
                }
            }
        }, 500);
        
        // Timeout nach 10 Sekunden
        setTimeout(() => {
            clearInterval(checkCanvas);
        }, 10000);
    }
    
    // 🎯 Canvas Event Listeners für Real-Time Debugging
    function setupCanvasEventListeners(canvas) {
        debugLog('🎯 Setting up canvas event listeners...');
        
        // Object Moving Event
        canvas.on('object:moving', function(e) {
            const obj = e.target;
            if (obj) {
                console.log('%c🎯 OBJECT MOVING', 'color: #007cba; font-weight: bold;', {
                    type: obj.type || 'unknown',
                    position: {
                        x: Math.round(obj.left || 0),
                        y: Math.round(obj.top || 0)
                    },
                    size: {
                        width: Math.round((obj.width || 0) * (obj.scaleX || 1)),
                        height: Math.round((obj.height || 0) * (obj.scaleY || 1))
                    },
                    scale: {
                        scaleX: obj.scaleX || 1,
                        scaleY: obj.scaleY || 1
                    },
                    rotation: obj.angle || 0,
                    timestamp: new Date().toISOString()
                });
            }
        });
        
        // Object Modified Event (nach Skalierung, Rotation, etc.)
        canvas.on('object:modified', function(e) {
            const obj = e.target;
            if (obj) {
                console.log('%c🔄 OBJECT MODIFIED', 'color: #28a745; font-weight: bold;', {
                    type: obj.type || 'unknown',
                    finalPosition: {
                        x: Math.round(obj.left || 0),
                        y: Math.round(obj.top || 0)
                    },
                    finalSize: {
                        width: Math.round((obj.width || 0) * (obj.scaleX || 1)),
                        height: Math.round((obj.height || 0) * (obj.scaleY || 1))
                    },
                    finalTransform: {
                        scaleX: obj.scaleX || 1,
                        scaleY: obj.scaleY || 1,
                        rotation: obj.angle || 0
                    },
                    canvasSize: {
                        width: canvas.width || 0,
                        height: canvas.height || 0
                    },
                    timestamp: new Date().toISOString()
                });
            }
        });
        
        // Object Selected Event
        canvas.on('object:selected', function(e) {
            const obj = e.target;
            if (obj) {
                console.log('%c👆 OBJECT SELECTED', 'color: #ffc107; font-weight: bold;', {
                    type: obj.type || 'unknown',
                    currentState: {
                        position: { x: Math.round(obj.left || 0), y: Math.round(obj.top || 0) },
                        size: { 
                            width: Math.round((obj.width || 0) * (obj.scaleX || 1)), 
                            height: Math.round((obj.height || 0) * (obj.scaleY || 1)) 
                        },
                        transform: { scaleX: obj.scaleX || 1, scaleY: obj.scaleY || 1, rotation: obj.angle || 0 }
                    },
                    timestamp: new Date().toISOString()
                });
            }
        });
        
        // Object Added Event
        canvas.on('object:added', function(e) {
            const obj = e.target;
            if (obj) {
                console.log('%c➕ OBJECT ADDED', 'color: #17a2b8; font-weight: bold;', {
                    type: obj.type || 'unknown',
                    initialPosition: {
                        x: Math.round(obj.left || 0),
                        y: Math.round(obj.top || 0)
                    },
                    initialSize: {
                        width: Math.round((obj.width || 0) * (obj.scaleX || 1)),
                        height: Math.round((obj.height || 0) * (obj.scaleY || 1))
                    },
                    initialTransform: {
                        scaleX: obj.scaleX || 1,
                        scaleY: obj.scaleY || 1,
                        rotation: obj.angle || 0
                    },
                    totalObjects: canvas.getObjects ? canvas.getObjects().length : 'unknown',
                    timestamp: new Date().toISOString()
                });
            }
        });
        
        // Object Removed Event
        canvas.on('object:removed', function(e) {
            const obj = e.target;
            if (obj) {
                console.log('%c➖ OBJECT REMOVED', 'color: #dc3545; font-weight: bold;', {
                    type: obj.type || 'unknown',
                    removedObject: {
                        position: { x: Math.round(obj.left || 0), y: Math.round(obj.top || 0) },
                        size: { 
                            width: Math.round((obj.width || 0) * (obj.scaleX || 1)), 
                            height: Math.round((obj.height || 0) * (obj.scaleY || 1)) 
                        },
                        transform: { scaleX: obj.scaleX || 1, scaleY: obj.scaleY || 1, rotation: obj.angle || 0 }
                    },
                    remainingObjects: canvas.getObjects ? canvas.getObjects().length : 'unknown',
                    timestamp: new Date().toISOString()
                });
            }
        });
        
        // Canvas Size Change Event
        canvas.on('canvas:resized', function(e) {
            console.log('%c📐 CANVAS RESIZED', 'color: #6f42c1; font-weight: bold;', {
                newSize: {
                    width: canvas.width || 0,
                    height: canvas.height || 0
                },
                deviceType: detectDeviceType(canvas.width || 0),
                timestamp: new Date().toISOString()
            });
        });
        
        debugLog('✅ Canvas event listeners erfolgreich eingerichtet');
    }
    
    // 📱 Device Type Detection
    function detectDeviceType(canvasWidth) {
        if (canvasWidth >= 800) return 'desktop';
        if (canvasWidth >= 600) return 'tablet';
        return 'mobile';
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

    function initializeDesignLoader() {
        debugLog('Initializing design loader...');
        
        // 🎨 Starte Real-Time Design Debugging
        setupRealTimeDesignDebugging();
        
        // Prüfe ob window.fabric bereits verfügbar ist
        if (typeof window.fabric !== 'undefined') {
            debugLog('window.fabric already available at initialization');
            setTimeout(waitForDesigner, 100);
        } else {
            debugLog('window.fabric not immediately available, starting polling...');
            waitForDesignerWithTimeout();
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