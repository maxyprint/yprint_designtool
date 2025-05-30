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
        
        // Erweiterte Fabric.js Prüfung
        const fabricAvailable = checkFabricAvailability();
        
        debugLog('Designer element found:', !!designerElement);
        debugLog('Canvas element found:', !!canvasElement);
        debugLog('Fabric.js available:', fabricAvailable);
        debugLog('Auto-load data available:', !!window.octoPrintDesignerAutoLoad);
        
        if (designerElement && canvasElement && fabricAvailable) {
            debugLog('All requirements met, checking for auto-load data');
            
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
            debugLog('Requirements not met, retrying in 500ms');
            debugLog('Missing requirements:', {
                designerElement: !designerElement,
                canvasElement: !canvasElement,
                fabricJs: !fabricAvailable
            });
            setTimeout(waitForDesigner, 500);
        }
    }
    
    function checkFabricAvailability() {
        debugLog('Checking Fabric.js availability...');
        
        // Prüfe verschiedene Fabric.js Verfügbarkeitsmuster
        const checks = {
            windowFabric: typeof window.fabric !== 'undefined',
            fabricCanvas: typeof window.fabric?.Canvas !== 'undefined',
            fabricImage: typeof window.fabric?.Image !== 'undefined',
            fabricInstances: window.fabric?.Canvas?.getInstances ? true : false
        };
        
        debugLog('Fabric.js checks:', checks);
        
        // Prüfe auch ob Fabric-Scripts geladen sind
        const fabricScripts = Array.from(document.scripts).filter(script => 
            script.src && script.src.includes('fabric')
        );
        debugLog('Fabric scripts found:', fabricScripts.length, fabricScripts.map(s => s.src));
        
        return checks.windowFabric && checks.fabricCanvas && checks.fabricImage;
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
        const fabricCanvas = window.fabric && window.fabric.Canvas.getInstances()[0];
        
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
        
        if (!window.fabric) {
            debugError('Fabric.js not available');
            return;
        }
        
        const canvas = window.fabric.Canvas.getInstances()[0];
        if (!canvas) {
            debugError('No canvas instance found');
            debugLog('Available canvas instances:', window.fabric.Canvas.getInstances());
            return;
        }
        
        debugLog('Canvas found, loading image...');
        
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
            
            canvas.add(img);
            canvas.renderAll();
            
            debugLog('Image added to canvas successfully');
            debugLog('Canvas object count:', canvas.getObjects().length);
            
        }, { crossOrigin: 'anonymous' });
        
        debugLog(`=== ADD IMAGE TO CANVAS END ===`);
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
    
    // Starte Fabric.js Watcher parallel
    startFabricWatcher();
    
    // Starte normale Warteschleife
    waitForDesignerWithTimeout();
    
    // Zusätzlicher Check nach Scripts-Loading
    window.addEventListener('load', () => {
        debugLog('Window load event fired, doing final check...');
        setTimeout(() => {
            if (retryCount < maxRetries && typeof window.fabric !== 'undefined') {
                debugLog('Fabric.js available after window load, retrying...');
                waitForDesigner();
            }
        }, 1000);
    });
}
    
    console.log('%c=== DESIGN LOADER DEBUG END ===', 'color: blue; font-weight: bold;');
    
// Globale Variablen für Retry-Logik
let retryCount = 0;
const maxRetries = 20; // 10 Sekunden maximum
let fabricCheckInterval = null;

// Erweiterte waitForDesigner Funktion
function waitForDesignerWithTimeout() {
    debugLog(`Attempt ${retryCount + 1}/${maxRetries} to find designer requirements`);
    
    if (retryCount >= maxRetries) {
        debugError('Maximum retry attempts reached. Giving up.');
        debugError('Final state check:');
        debugError('- Designer element:', !!document.querySelector('.octo-print-designer'));
        debugError('- Canvas element:', !!document.querySelector('#octo-print-designer-canvas'));
        debugError('- Fabric.js:', checkFabricAvailability());
        debugError('- Auto-load data:', !!window.octoPrintDesignerAutoLoad);
        return;
    }
    
    retryCount++;
    waitForDesigner();
}

// Spezielle Fabric.js Watcher
function startFabricWatcher() {
    debugLog('Starting Fabric.js watcher...');
    
    fabricCheckInterval = setInterval(() => {
        if (typeof window.fabric !== 'undefined') {
            debugLog('Fabric.js detected! Stopping watcher.');
            clearInterval(fabricCheckInterval);
            
            // Kurz warten, dann nochmal versuchen
            setTimeout(() => {
                if (retryCount < maxRetries) {
                    waitForDesigner();
                }
            }, 500);
        }
    }, 100);
    
    // Stoppe Watcher nach 15 Sekunden
    setTimeout(() => {
        if (fabricCheckInterval) {
            debugWarn('Fabric.js watcher timeout after 15 seconds');
            clearInterval(fabricCheckInterval);
        }
    }, 15000);
}

})();