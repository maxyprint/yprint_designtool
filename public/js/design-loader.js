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
        let fabricAvailable = checkFabricAvailability();
        
        // Falls Fabric nicht gefunden, versuche alternative Methoden
        if (!fabricAvailable) {
            debugLog('Primary fabric check failed, trying alternatives...');
            fabricAvailable = findFabricAlternative() || checkDesignerInitialization();
        }
        
        debugLog('Designer element found:', !!designerElement);
        debugLog('Canvas element found:', !!canvasElement);
        debugLog('Fabric.js available:', fabricAvailable);
        debugLog('Auto-load data available:', !!window.octoPrintDesignerAutoLoad);
        
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
    
    function checkFabricAvailability() {
        debugLog('Checking Fabric.js availability...');
        
        // Basis-Checks
        const checks = {
            windowFabric: typeof window.fabric !== 'undefined',
            fabricCanvas: typeof window.fabric?.Canvas !== 'undefined',
            fabricImage: typeof window.fabric?.Image !== 'undefined',
            fabricInstances: window.fabric?.Canvas?.getInstances ? true : false
        };
        
        debugLog('Basic Fabric.js checks:', checks);
        
        // Wenn Basis-Checks fehlschlagen, prüfe tiefere Ebenen
        if (!checks.windowFabric) {
            debugLog('Basic fabric check failed, checking deeper...');
            
            // Prüfe ob Fabric.js in anderen globalen Variablen versteckt ist
            const globalVars = Object.keys(window).filter(key => 
                key.toLowerCase().includes('fabric') || 
                (window[key] && typeof window[key] === 'object' && window[key].Canvas)
            );
            
            debugLog('Potential fabric-related globals:', globalVars);
            
            // Versuche Fabric aus versteckten Variablen zu extrahieren
            for (const varName of globalVars) {
                try {
                    const candidate = window[varName];
                    if (candidate && candidate.Canvas && candidate.Image) {
                        debugLog(`Found Fabric.js in global variable: ${varName}`);
                        window.fabric = candidate;
                        checks.windowFabric = true;
                        checks.fabricCanvas = true;
                        checks.fabricImage = true;
                        break;
                    }
                } catch (e) {
                    debugLog(`Error checking global variable ${varName}:`, e);
                }
            }
        }
        
        // Canvas-basierte Erkennung
        if (!checks.windowFabric) {
            const canvasBasedFabric = extractFabricFromCanvas();
            if (canvasBasedFabric) {
                Object.assign(checks, {
                    windowFabric: true,
                    fabricCanvas: true,
                    fabricImage: true,
                    fabricFromCanvas: true
                });
            }
        }
        
        debugLog('Final Fabric.js checks:', checks);
        
        return checks.windowFabric && checks.fabricCanvas;
    }
    
    function extractFabricFromCanvas() {
        debugLog('Attempting to extract Fabric.js from canvas instances...');
        
        const canvasElements = document.querySelectorAll('canvas');
        
        for (let i = 0; i < canvasElements.length; i++) {
            const canvas = canvasElements[i];
            debugLog(`Checking canvas ${i}:`, {
                id: canvas.id,
                className: canvas.className,
                hasFabricInstance: !!canvas.__fabric
            });
            
            if (canvas.__fabric) {
                try {
                    const fabricInstance = canvas.__fabric;
                    
                    // Validiere dass es sich um eine echte Fabric-Instanz handelt
                    const requiredMethods = ['getObjects', 'add', 'remove', 'renderAll', 'clear'];
                    const hasRequiredMethods = requiredMethods.every(method => 
                        typeof fabricInstance[method] === 'function'
                    );
                    
                    if (hasRequiredMethods && fabricInstance.constructor) {
                        debugLog(`Valid Fabric instance found in canvas ${i}`);
                        
                        // Erstelle globales Fabric-Objekt
                        window.fabric = {
                            Canvas: fabricInstance.constructor,
                            Image: fabricInstance.constructor.Image || createFabricImageMock(),
                            util: fabricInstance.constructor.util || {},
                            Object: fabricInstance.constructor.Object || class FabricObject {},
                            filters: fabricInstance.constructor.filters || {},
                            getInstances: function() {
                                return fabricInstance.constructor.getInstances ? 
                                       fabricInstance.constructor.getInstances() : [fabricInstance];
                            }
                        };
                        
                        debugLog('Fabric.js successfully extracted and made global');
                        return true;
                    }
                } catch (e) {
                    debugLog(`Error extracting fabric from canvas ${i}:`, e);
                }
            }
        }
        
        return false;
    }
    
    /**
 * Erstellt ein Mock-Objekt für Fabric.Image, falls Fabric.js nicht vollständig geladen ist.
 * Ermöglicht das Laden von Bildern, um Fehler zu vermeiden.
 */
function createFabricImageMock() {
    return {
        fromURL: function(url, callback, options) {
            debugLog('Mock Fabric.Image.fromURL called with:', url);

            const img = new Image();
            img.crossOrigin = options?.crossOrigin || 'anonymous';

            img.onload = function() {
                const fabricImg = {
                    width: img.width,
                    height: img.height,
                    src: url,
                    element: img,
                    set: function(props) {
                        Object.assign(this, props);
                        return this;
                    },
                    setCoords: function() { return this; },
                    clone: function() { return this; }
                };

                if (callback) callback(fabricImg);
            };

            img.onerror = function() {
                debugError('Mock image loading failed:', url);
                if (callback) callback(null);
            };

            img.src = url;
        }
    };
}

/**
 * Überprüft die Verfügbarkeit von Fabric.js im globalen Scope und auf Canvas-Elementen.
 * Versucht, Fabric.js aus einer Canvas-Instanz zu extrahieren und global verfügbar zu machen.
 */
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

    // Zusätzliche Prüfung: Schaue nach bereits initialisierten Fabric Canvas Instanzen
    let fabricFromCanvas = false;
    const canvasElements = document.querySelectorAll('canvas');

    canvasElements.forEach((canvas, index) => {
        const canvasInfo = {
            id: canvas.id,
            className: canvas.className,
            hasContext: !!canvas.getContext,
            hasFabricInstance: !!canvas.__fabric,
            fabricType: canvas.__fabric ? typeof canvas.__fabric : 'none'
        };

        debugLog(`Canvas ${index} analysis:`, canvasInfo);

        // Wenn Canvas eine Fabric-Instanz hat, versuche Fabric zu extrahieren
        if (canvas.__fabric) {
            try {
                const fabricInstance = canvas.__fabric;

                // Prüfe ob es sich um eine echte Fabric Canvas Instanz handelt
                if (fabricInstance.getObjects && fabricInstance.add && fabricInstance.renderAll) {
                    debugLog(`Canvas ${index} has valid Fabric instance`);
                    fabricFromCanvas = true;

                    // Versuche Fabric-Konstruktor zu finden
                    if (fabricInstance.constructor && !window.fabric) {
                        debugLog('Attempting to extract Fabric from canvas instance...');

                        // Erstelle minimales globales Fabric-Objekt
                        window.fabric = {
                            Canvas: fabricInstance.constructor,
                            Image: fabricInstance.constructor.Image || createFabricImageMock(),
                            util: fabricInstance.constructor.util || {},
                            Object: fabricInstance.constructor.Object || class MockObject {},
                            filters: fabricInstance.constructor.filters || {}
                        };

                        debugLog('Fabric extracted and made global:', typeof window.fabric);
                    }
                }
            } catch (e) {
                debugLog(`Error analyzing canvas ${index}:`, e);
            }
        }
    });

    // Aktualisierte Checks nach möglicher Extraktion
    const updatedChecks = {
        windowFabric: typeof window.fabric !== 'undefined',
        fabricCanvas: typeof window.fabric?.Canvas !== 'undefined',
        fabricImage: typeof window.fabric?.Image !== 'undefined',
        fabricInstances: window.fabric?.Canvas?.getInstances ? true : false,
        fabricFromCanvas: fabricFromCanvas
    };

    debugLog('Updated Fabric.js checks:', updatedChecks);

    // Prüfe auch ob Fabric-Scripts geladen sind
    const fabricScripts = Array.from(document.scripts).filter(script =>
        script.src && (script.src.includes('fabric') || script.src.includes('designer'))
    );
    debugLog('Relevant scripts found:', fabricScripts.length, fabricScripts.map(s => s.src));

    // Prüfe ob Designer Bundle geladen ist (da Fabric.js darin enthalten sein könnte)
    const designerScripts = Array.from(document.scripts).filter(script =>
        script.src && script.src.includes('designer')
    );
    debugLog('Designer scripts found:', designerScripts.length);

    // Zusätzliche Prüfung: Suche nach Fabric in globalen Variablen
    const globalFabricCheck = Object.keys(window).filter(key =>
        key.toLowerCase().includes('fabric')
    );
    debugLog('Global variables containing "fabric":', globalFabricCheck);

}
    
// Alternative Methode: Prüfe ob Designer bereits initialisiert ist
function checkDesignerInitialization() {
    debugLog('Checking designer initialization...');
    
    const canvas = document.querySelector('#octo-print-designer-canvas');
    
    // Prüfe auf DesignerWidget Instanz
    const checks = {
        designerWidget: typeof window.DesignerWidget !== 'undefined',
        fabricCanvas: canvas ? !!canvas.__fabric : false,
        canvasContext: canvas ? !!canvas.getContext : false,
        fabricInGlobal: typeof window.fabric !== 'undefined'
    };
    
    debugLog('Designer initialization checks:', checks);
    
    // Suche nach Fabric Canvas Instanzen direkt im Canvas Element
    if (canvas) {
        const canvasAnalysis = {
            id: canvas.id,
            width: canvas.width,
            height: canvas.height,
            hasFabricInstance: !!canvas.__fabric,
            fabricMethods: canvas.__fabric ? [
                'getObjects', 'add', 'remove', 'renderAll', 'clear'
            ].filter(method => typeof canvas.__fabric[method] === 'function') : [],
            fabricProperties: canvas.__fabric ? Object.keys(canvas.__fabric).slice(0, 10) : 'none'
        };
        
        debugLog('Detailed canvas analysis:', canvasAnalysis);
        
        // Wenn Fabric Canvas gefunden, aber globales Fabric fehlt, erstelle Wrapper
        if (canvas.__fabric && !window.fabric) {
            debugLog('Creating Fabric wrapper from canvas instance...');
            
            const fabricInstance = canvas.__fabric;
            
            // Erstelle funktionalen Fabric Wrapper
            window.fabric = {
                Canvas: fabricInstance.constructor,
                Image: {
                    fromURL: function(url, callback, options) {
                        debugLog('Fabric.Image.fromURL called with:', url);
                        
                        // Verwende native Image-Erstellung und füge zu Canvas hinzu
                        const img = new Image();
                        img.crossOrigin = 'anonymous';
                        img.onload = function() {
                            // Simuliere Fabric Image Objekt
                            const fabricImage = {
                                width: img.width,
                                height: img.height,
                                src: url,
                                set: function(props) {
                                    Object.assign(this, props);
                                    return this;
                                },
                                setCoords: function() { return this; }
                            };
                            
                            if (callback) callback(fabricImage);
                        };
                        img.onerror = function() {
                            debugError('Failed to load image:', url);
                            if (callback) callback(null);
                        };
                        img.src = url;
                    }
                },
                util: fabricInstance.constructor.util || {},
                getInstances: function() {
                    return fabricInstance.constructor.getInstances ? 
                           fabricInstance.constructor.getInstances() : [fabricInstance];
                }
            };
            
            debugLog('Fabric wrapper created successfully');
            checks.fabricInGlobal = true;
        }
    }
    
    return checks.designerWidget || checks.fabricCanvas || checks.fabricInGlobal;
}

// Erweiterte Fabric.js Suche
function findFabricAlternative() {
    debugLog('Searching for Fabric.js alternatives...');
    
    // Suche in verschiedenen globalen Kontexten
    const contexts = [window, window.parent, window.top];
    
    for (let i = 0; i < contexts.length; i++) {
        const context = contexts[i];
        try {
            if (context.fabric) {
                debugLog(`Fabric found in context ${i}:`, typeof context.fabric);
                window.fabric = context.fabric; // Kopiere zu lokalem window
                return true;
            }
        } catch (e) {
            debugLog(`Cannot access context ${i}:`, e.message);
        }
    }
    
    // Suche nach AMD/RequireJS geladenen Modulen
    if (typeof require !== 'undefined') {
        try {
            const fabric = require('fabric');
            if (fabric) {
                debugLog('Fabric found via require()');
                window.fabric = fabric;
                return true;
            }
        } catch (e) {
            debugLog('require() failed:', e.message);
        }
    }
    
    return false;
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
        
        // Erweiterte Canvas-Suche
        let canvas = null;
        
        if (window.fabric && window.fabric.Canvas && window.fabric.Canvas.getInstances) {
            const instances = window.fabric.Canvas.getInstances();
            canvas = instances[0];
            debugLog('Canvas found via Fabric.Canvas.getInstances():', !!canvas);
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
            debugError('Available fabric instances:', window.fabric ? window.fabric.Canvas?.getInstances?.() || 'getInstances not available' : 'fabric not available');
            return;
        }
        
        debugLog('Canvas found, loading image...');
        
        // Verwende verfügbare Fabric.Image.fromURL oder Fallback
        const imageLoader = window.fabric?.Image?.fromURL || function(url, callback, options) {
            debugLog('Using fallback image loader for:', url);
            
            const img = new Image();
            img.crossOrigin = options?.crossOrigin || 'anonymous';
            
            img.onload = function() {
                // Erstelle Fabric-ähnliches Objekt
                const fabricImg = {
                    width: img.width,
                    height: img.height,
                    src: url,
                    element: img,
                    set: function(props) {
                        Object.assign(this, props);
                        return this;
                    },
                    setCoords: function() { return this; }
                };
                
                callback(fabricImg);
            };
            
            img.onerror = function() {
                debugError('Failed to load image:', url);
                callback(null);
            };
            
            img.src = url;
        };
        
        imageLoader(imageUrl, function(img) {
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
    
    // Event-Listener für Fabric.js Ready Event
window.addEventListener('fabricReady', (event) => {
    debugLog('🎉 Fabric.js ready event received:', event.detail);
    
    // Validiere dass Fabric tatsächlich verfügbar ist
    const fabricCheck = {
        windowFabric: typeof window.fabric !== 'undefined',
        fabricCanvas: typeof window.fabric?.Canvas !== 'undefined',
        fabricImage: typeof window.fabric?.Image !== 'undefined'
    };
    
    debugLog('Post-event Fabric validation:', fabricCheck);
    
    if (fabricCheck.windowFabric && fabricCheck.fabricCanvas) {
        debugLog('✅ Fabric.js confirmed available, proceeding with design load...');
        
        // Reset retry counter
        retryCount = 0;
        
        // Kurz warten damit alles initialisiert ist
        setTimeout(() => {
            waitForDesigner();
        }, 200);
    } else {
        debugWarn('❌ Fabric.js event received but validation failed');
        debugLog('Fabric object:', window.fabric);
    }
});

// Zusätzlicher Event-Listener für den Fall dass Events mehrfach ausgelöst werden
let fabricReadyReceived = false;
window.addEventListener('fabricReady', (event) => {
    if (fabricReadyReceived) {
        debugLog('Duplicate fabricReady event ignored:', event.detail);
        return;
    }
    fabricReadyReceived = true;
}, { once: false }); // Nicht once, damit wir Duplikate loggen können
    
    // Prüfe ob Fabric.js bereits verfügbar ist
    if (typeof window.fabric !== 'undefined') {
        debugLog('Fabric.js already available at initialization');
        setTimeout(waitForDesigner, 100);
    } else {
        debugLog('Fabric.js not immediately available, waiting for fabricReady event...');
        
        // Fallback: Normale Warteschleife mit längeren Intervallen
        setTimeout(() => {
            if (typeof window.fabric === 'undefined') {
                debugLog('Starting fallback polling after 2 seconds...');
                startFallbackPolling();
            }
        }, 2000);
    }
    
    // Zusätzlicher Check nach vollständigem Page Load
    window.addEventListener('load', () => {
        debugLog('Window load event fired, doing final check...');
        setTimeout(() => {
            if (typeof window.fabric !== 'undefined' && retryCount < maxRetries) {
                debugLog('Fabric.js available after window load, retrying...');
                waitForDesigner();
            }
        }, 1000);
    });
}

function startFallbackPolling() {
    debugLog('Starting fallback polling for Fabric.js...');
    
    let pollCount = 0;
    const maxPolls = 20; // 10 Sekunden
    
    const pollInterval = setInterval(() => {
        pollCount++;
        debugLog(`Fallback poll attempt ${pollCount}/${maxPolls}`);
        
        if (typeof window.fabric !== 'undefined') {
            debugLog('Fabric.js found during fallback polling!');
            clearInterval(pollInterval);
            waitForDesigner();
        } else if (pollCount >= maxPolls) {
            debugError('Fallback polling timeout - Fabric.js still not available');
            clearInterval(pollInterval);
        }
    }, 500);
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

// Notfall-Fabric.js Initialization
function forceFabricInitialization() {
    debugLog('Attempting forced Fabric.js initialization...');
    
    // Prüfe ob es Fabric CSS gibt
    const fabricCSS = Array.from(document.styleSheets).find(sheet => {
        try {
            return sheet.href && sheet.href.includes('fabric');
        } catch (e) {
            return false;
        }
    });
    
    debugLog('Fabric CSS found:', !!fabricCSS);
    
    // Versuche Fabric aus dem Designer Bundle zu extrahieren
    const designerScripts = Array.from(document.scripts).filter(script => 
        script.src && script.src.includes('designer')
    );
    
    if (designerScripts.length > 0) {
        debugLog('Designer bundle found, attempting to access bundled Fabric...');
        
        // Warte auf Script-Ausführung
        setTimeout(() => {
            // Schaue nach möglichen Fabric-Variablen im Webpack-Bundle
            const webpackCheck = Object.keys(window).filter(key => 
                key.includes('webpack') || key.includes('chunk') || key.includes('__')
            );
            debugLog('Webpack-related globals:', webpackCheck);
            
            // Letzte Chance: Erstelle minimal Fabric Mock für Testing
            if (typeof window.fabric === 'undefined') {
                debugWarn('Creating minimal Fabric mock for testing...');
                window.fabric = {
                    Canvas: {
                        getInstances: () => [],
                    },
                    Image: {
                        fromURL: () => null
                    }
                };
                debugLog('Fabric mock created');
            }
        }, 2000);
    }
}

// Führe forcierte Initialisierung nach 5 Sekunden aus, falls nötig
setTimeout(() => {
    if (typeof window.fabric === 'undefined' && retryCount > 10) {
        forceFabricInitialization();
    }
}, 5000);

})();