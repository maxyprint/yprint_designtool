// Design Auto-Loader Script
(function() {
    'use strict';
    
    console.log('Design Auto-Loader initialized');
    
    // Warte bis Designer geladen ist
    function waitForDesigner() {
        if (typeof window.DesignerWidget !== 'undefined' || 
            document.querySelector('.octo-print-designer')) {
            
            console.log('Designer found, checking for auto-load data');
            
            // Prüfe auf Auto-Load Daten
            if (window.octoPrintDesignerAutoLoad && 
                window.octoPrintDesignerAutoLoad.hasDesignToLoad) {
                
                console.log('Auto-loading design:', window.octoPrintDesignerAutoLoad);
                loadDesignFromData(window.octoPrintDesignerAutoLoad.designData);
            }
        } else {
            setTimeout(waitForDesigner, 500);
        }
    }
    
    function loadDesignFromData(designData) {
        try {
            console.log('Loading design from server data:', designData);
            
            // Parse design_data JSON
            let parsedDesignData;
            try {
                parsedDesignData = typeof designData.design_data === 'string' 
                    ? JSON.parse(designData.design_data) 
                    : designData.design_data;
            } catch (e) {
                console.error('Error parsing design data:', e);
                return;
            }
            
            // Warte auf Canvas
            waitForCanvas(function() {
                applyDesignToCanvas(parsedDesignData, designData);
            });
            
        } catch (error) {
            console.error('Error in loadDesignFromData:', error);
        }
    }
    
    function waitForCanvas(callback) {
        const canvas = document.querySelector('#octo-print-designer-canvas');
        if (canvas && window.fabric) {
            // Canvas gefunden, kurz warten damit es initialisiert ist
            setTimeout(callback, 1000);
        } else {
            setTimeout(() => waitForCanvas(callback), 500);
        }
    }
    
    function applyDesignToCanvas(parsedDesignData, designData) {
        try {
            console.log('Applying design to canvas:', parsedDesignData);
            
            // Template laden falls verfügbar
            if (parsedDesignData.templateId) {
                triggerTemplateLoad(parsedDesignData.templateId);
            }
            
            // Variation Images verarbeiten
            if (parsedDesignData.variationImages) {
                setTimeout(() => {
                    processVariationImages(parsedDesignData.variationImages);
                }, 2000); // Warte bis Template geladen ist
            }
            
            // Design Name setzen
            if (designData.name) {
                const nameInput = document.getElementById('designName');
                if (nameInput) {
                    nameInput.value = designData.name;
                }
            }
            
            // URL bereinigen
            if (window.history && window.history.replaceState) {
                window.history.replaceState({}, '', window.location.pathname);
            }
            
        } catch (error) {
            console.error('Error applying design to canvas:', error);
        }
    }
    
    function triggerTemplateLoad(templateId) {
        // Simuliere Template-Auswahl durch Klick
        const templateElements = document.querySelectorAll('.library-item');
        templateElements.forEach(element => {
            if (element.dataset.templateId === templateId) {
                element.click();
            }
        });
    }
    
    function processVariationImages(variationImages) {
        console.log('Processing variation images:', variationImages);
        
        Object.entries(variationImages).forEach(([key, imageData]) => {
            const [variationId, viewId] = key.split('_');
            console.log(`Processing ${key}:`, imageData);
            
            // Handle both array and single object formats
            const images = Array.isArray(imageData) ? imageData : [imageData];
            
            images.forEach(imgData => {
                if (imgData.url) {
                    addImageToCanvas(imgData.url, imgData.transform || {});
                }
            });
        });
    }
    
    function addImageToCanvas(imageUrl, transform) {
        if (!window.fabric) {
            console.error('Fabric.js not available');
            return;
        }
        
        fabric.Image.fromURL(imageUrl, function(img) {
            if (!img) {
                console.error('Failed to load image:', imageUrl);
                return;
            }
            
            const canvas = window.fabric.Canvas.getInstances()[0];
            if (!canvas) {
                console.error('No canvas instance found');
                return;
            }
            
            // Transform anwenden
            img.set({
                left: transform.left || canvas.width / 2,
                top: transform.top || canvas.height / 2,
                scaleX: transform.scaleX || 1,
                scaleY: transform.scaleY || 1,
                angle: transform.angle || 0,
                originX: 'center',
                originY: 'center'
            });
            
            canvas.add(img);
            canvas.renderAll();
            
            console.log('Image added to canvas:', imageUrl);
        });
    }
    
    // Starte den Auto-Loader wenn DOM bereit ist
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForDesigner);
    } else {
        waitForDesigner();
    }
    
})();