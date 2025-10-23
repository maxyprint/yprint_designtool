// 🔍 COMPREHENSIVE CANVAS OBJECT ANALYSIS - Console Debug Commands
// Copy and paste these commands into browser console for detailed debugging

console.log('🔍 === CANVAS DEBUG COMMANDS LOADED ===');
console.log('Run canvasDebug.analyzeAll() for complete analysis');

window.canvasDebug = {

    // 🔍 Complete analysis of all canvas objects and PNG issues
    analyzeAll: function() {
        console.log('🔍 === COMPREHENSIVE CANVAS ANALYSIS START ===');

        this.analyzeCanvasState();
        this.analyzeObjects();
        this.analyzePrintArea();
        this.analyzeScriptLoading();
        this.analyzePNGGeneration();

        console.log('🔍 === COMPREHENSIVE CANVAS ANALYSIS END ===');
    },

    // 📊 Canvas state analysis
    analyzeCanvasState: function() {
        console.log('📊 === CANVAS STATE ANALYSIS ===');

        // Check for canvas instances
        const canvases = document.querySelectorAll('canvas');
        console.log(`Found ${canvases.length} canvas elements in DOM`);

        canvases.forEach((canvas, idx) => {
            console.log(`Canvas ${idx}:`, {
                id: canvas.id || 'no-id',
                width: canvas.width,
                height: canvas.height,
                style: canvas.style.cssText,
                hasFabric: !!canvas.__fabric,
                fabricVersion: canvas.__fabric ? 'detected' : 'none'
            });
        });

        // Check designer widget instance
        console.log('Designer Widget State:');
        if (window.designerWidgetInstance) {
            console.log('✅ designerWidgetInstance exists');
            console.log('  fabricCanvas:', !!window.designerWidgetInstance.fabricCanvas);

            if (window.designerWidgetInstance.fabricCanvas) {
                const canvas = window.designerWidgetInstance.fabricCanvas;
                console.log('  Canvas dimensions:', canvas.width + 'x' + canvas.height);
                console.log('  Object count:', canvas.getObjects().length);
                console.log('  Canvas ready:', !!canvas._objects);
            }
        } else {
            console.log('❌ designerWidgetInstance not found');
        }

        // Check fabric.js availability
        console.log('Fabric.js State:');
        console.log('  window.fabric:', typeof window.fabric);
        if (window.fabric) {
            console.log('  Fabric version:', window.fabric.version || 'unknown');
            console.log('  Canvas constructor:', typeof window.fabric.Canvas);
        }
    },

    // 🎯 Detailed object analysis
    analyzeObjects: function() {
        console.log('🎯 === CANVAS OBJECTS ANALYSIS ===');

        const canvas = window.designerWidgetInstance?.fabricCanvas;
        if (!canvas) {
            console.log('❌ No fabric canvas found');
            return;
        }

        const objects = canvas.getObjects();
        console.log(`Total objects: ${objects.length}`);

        if (objects.length === 0) {
            console.log('⚠️ No objects on canvas');
            return;
        }

        // Analyze each object in detail
        objects.forEach((obj, idx) => {
            const bounds = obj.getBoundingRect ? obj.getBoundingRect() : {};
            const analysis = {
                index: idx,
                type: obj.type,
                name: obj.name || 'unnamed',
                id: obj.id || 'no-id',
                visible: obj.visible,
                position: {
                    left: Math.round(obj.left || 0),
                    top: Math.round(obj.top || 0)
                },
                size: {
                    width: Math.round(obj.width || 0),
                    height: Math.round(obj.height || 0),
                    scaleX: obj.scaleX || 1,
                    scaleY: obj.scaleY || 1
                },
                bounds: {
                    left: Math.round(bounds.left || 0),
                    top: Math.round(bounds.top || 0),
                    width: Math.round(bounds.width || 0),
                    height: Math.round(bounds.height || 0)
                },
                flags: {
                    isBackground: !!obj.isBackground,
                    isViewImage: !!obj.isViewImage,
                    isTemplateBackground: !!obj.isTemplateBackground,
                    excludeFromExport: !!obj.excludeFromExport,
                    selectable: obj.selectable,
                    evented: obj.evented
                },
                classification: this.classifyObject(obj)
            };

            // Add type-specific analysis
            if (obj.type === 'image') {
                analysis.image = {
                    src: obj.src ? obj.src.substring(obj.src.lastIndexOf('/') + 1) : 'no-src',
                    crossOrigin: obj.crossOrigin,
                    filters: obj.filters ? obj.filters.length : 0
                };
            }

            if (obj.type === 'text' || obj.type === 'i-text') {
                analysis.text = {
                    content: obj.text ? obj.text.substring(0, 50) + '...' : 'empty',
                    fontFamily: obj.fontFamily,
                    fontSize: obj.fontSize,
                    fill: obj.fill
                };
            }

            console.log(`Object ${idx} (${obj.type}):`, analysis);
        });

        // Object classification summary
        const classifications = {
            design: objects.filter(obj => this.classifyObject(obj) === 'design').length,
            background: objects.filter(obj => this.classifyObject(obj) === 'background').length,
            view: objects.filter(obj => this.classifyObject(obj) === 'view').length,
            excluded: objects.filter(obj => this.classifyObject(obj) === 'excluded').length
        };

        console.log('📊 Object Classification Summary:', classifications);

        // Check for potential issues
        this.detectObjectIssues(objects);
    },

    // 🔍 Object classification logic (matches PNG generation filter)
    classifyObject: function(obj) {
        if (!obj.visible) return 'excluded';
        if (obj.excludeFromExport) return 'excluded';
        if (obj.isViewImage || obj.isTemplateBackground || obj.isBackground) return 'background';
        return 'design';
    },

    // ⚠️ Detect common object issues
    detectObjectIssues: function(objects) {
        console.log('⚠️ === OBJECT ISSUES DETECTION ===');

        const issues = [];

        // Check for objects outside canvas
        const canvas = window.designerWidgetInstance?.fabricCanvas;
        if (canvas) {
            objects.forEach((obj, idx) => {
                const bounds = obj.getBoundingRect();
                if (bounds.left < 0 || bounds.top < 0 ||
                    bounds.left + bounds.width > canvas.width ||
                    bounds.top + bounds.height > canvas.height) {
                    issues.push(`Object ${idx} (${obj.type}) extends outside canvas bounds`);
                }
            });
        }

        // Check for invisible design elements
        const invisibleDesign = objects.filter(obj =>
            this.classifyObject(obj) === 'design' && !obj.visible
        );
        if (invisibleDesign.length > 0) {
            issues.push(`${invisibleDesign.length} design elements are invisible`);
        }

        // Check for objects without proper IDs
        const noId = objects.filter(obj => !obj.id || obj.id === 'no-id');
        if (noId.length > 0) {
            issues.push(`${noId.length} objects missing proper IDs`);
        }

        // Check for potential background misclassification
        const backgroundFlags = objects.filter(obj =>
            obj.isBackground || obj.isViewImage || obj.isTemplateBackground
        );
        if (backgroundFlags.length === 0 && objects.length > 0) {
            issues.push('No objects marked as background - check if view image is properly flagged');
        }

        if (issues.length > 0) {
            console.log('❌ Issues detected:');
            issues.forEach(issue => console.log(`  - ${issue}`));
        } else {
            console.log('✅ No obvious object issues detected');
        }
    },

    // 📐 Print area analysis
    analyzePrintArea: function() {
        console.log('📐 === PRINT AREA ANALYSIS ===');

        // Check template metadata sources
        console.log('Template Data Sources:');

        // URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const templateId = urlParams.get('template_id');
        console.log('  URL template_id:', templateId || 'none');

        // DOM elements
        const templateElements = document.querySelectorAll('[data-template-id]');
        console.log(`  DOM template elements: ${templateElements.length}`);
        templateElements.forEach((elem, idx) => {
            console.log(`    Element ${idx}:`, {
                templateId: elem.dataset.templateId,
                hasPrintArea: !!elem.dataset.printArea,
                printArea: elem.dataset.printArea ?
                    elem.dataset.printArea.substring(0, 100) + '...' : 'none'
            });
        });

        // High-DPI engine metadata
        console.log('  High-DPI Engine:');
        if (window.highDPIPrintExportEngine) {
            console.log('    Engine exists: YES');
            console.log('    metaData:', !!window.highDPIPrintExportEngine.metaData);
            console.log('    printAreaPx:', !!window.highDPIPrintExportEngine.printAreaPx);
        } else {
            console.log('    Engine exists: NO');
        }

        // WordPress config
        console.log('  WordPress Config:');
        if (window.octo_print_designer_config) {
            console.log('    Config exists: YES');
            console.log('    template data:', !!window.octo_print_designer_config.template);
        } else {
            console.log('    Config exists: NO');
        }

        // Calculate intelligent print area
        console.log('Intelligent Print Area Calculation:');
        try {
            const canvas = window.designerWidgetInstance?.fabricCanvas;
            if (canvas) {
                const designObjects = canvas.getObjects().filter(obj =>
                    this.classifyObject(obj) === 'design'
                );

                if (designObjects.length > 0) {
                    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

                    designObjects.forEach(obj => {
                        const bounds = obj.getBoundingRect();
                        minX = Math.min(minX, bounds.left);
                        minY = Math.min(minY, bounds.top);
                        maxX = Math.max(maxX, bounds.left + bounds.width);
                        maxY = Math.max(maxY, bounds.top + bounds.height);
                    });

                    const calculatedArea = {
                        x: Math.max(0, minX - 50),
                        y: Math.max(0, minY - 50),
                        width: (maxX - minX) + 100,
                        height: (maxY - minY) + 100
                    };

                    console.log('  Calculated from design elements:', calculatedArea);
                    console.log('  Design elements used:', designObjects.length);
                } else {
                    console.log('  No design elements found for calculation');
                }
            }
        } catch (error) {
            console.log('  Calculation error:', error.message);
        }
    },

    // 📦 Script loading analysis
    analyzeScriptLoading: function() {
        console.log('📦 === SCRIPT LOADING ANALYSIS ===');

        // Check PNG-related scripts in DOM
        const allScripts = document.querySelectorAll('script[src]');
        const pngScripts = Array.from(allScripts).filter(script =>
            script.src.includes('png') ||
            script.src.includes('yprint') ||
            script.src.includes('enhanced-json') ||
            script.src.includes('high-dpi') ||
            script.src.includes('fallback-loader')
        );

        console.log(`Found ${pngScripts.length} PNG-related scripts in DOM:`);
        pngScripts.forEach((script, idx) => {
            const src = script.src;
            const filename = src.split('/').pop();
            const version = (src.match(/ver=([^&]+)/) || ['', 'none'])[1];

            console.log(`  ${idx + 1}. ${filename} (ver: ${version})`);
        });

        // Check for duplicates
        const filenames = pngScripts.map(s => s.src.split('/').pop().split('?')[0]);
        const duplicates = filenames.filter((name, idx) => filenames.indexOf(name) !== idx);
        if (duplicates.length > 0) {
            console.log('❌ Duplicate scripts detected:', [...new Set(duplicates)]);
        } else {
            console.log('✅ No duplicate script filenames');
        }

        // Check global variables
        console.log('Global Variables:');
        const expectedGlobals = {
            'EnhancedJSONCoordinateSystem': window.EnhancedJSONCoordinateSystem,
            'HighDPIPrintExportEngine': window.HighDPIPrintExportEngine,
            'PNGOnlySystemIntegration': window.PNGOnlySystemIntegration,
            'saveOnlyPNGSystem': window.saveOnlyPNGSystem,
            'generateDesignData': window.generateDesignData
        };

        Object.entries(expectedGlobals).forEach(([name, value]) => {
            const status = typeof value !== 'undefined' ? '✅ EXISTS' : '❌ MISSING';
            const type = typeof value;
            console.log(`  ${name}: ${status} (${type})`);
        });
    },

    // 🖨️ PNG generation test
    analyzePNGGeneration: function() {
        console.log('🖨️ === PNG GENERATION ANALYSIS ===');

        // Check if generateDesignData function exists
        if (typeof window.generateDesignData === 'function') {
            console.log('✅ generateDesignData function available');

            try {
                console.log('Testing generateDesignData...');
                const designData = window.generateDesignData();

                console.log('Design data result:', {
                    hasCanvas: !!designData.canvas,
                    objectCount: designData.canvas?.objects?.length || 0,
                    templateId: designData.template_id,
                    designedArea: designData.designed_on_area_px,
                    timestamp: designData.timestamp
                });

                if (designData.canvas && designData.canvas.objects) {
                    console.log('Canvas objects in design data:');
                    designData.canvas.objects.forEach((obj, idx) => {
                        console.log(`  ${idx}: ${obj.type} at ${Math.round(obj.left || 0)},${Math.round(obj.top || 0)}`);
                    });
                }

            } catch (error) {
                console.log('❌ generateDesignData error:', error.message);
            }
        } else {
            console.log('❌ generateDesignData function not available');
        }

        // Check save-only PNG system
        if (window.saveOnlyPNGSystem) {
            console.log('✅ saveOnlyPNGSystem available');
            console.log('  pngEngine:', !!window.saveOnlyPNGSystem.pngEngine);
            console.log('  initialized:', !!window.saveOnlyPNGSystem.initialized);
        } else {
            console.log('❌ saveOnlyPNGSystem not available');
        }

        // Test PNG generation if possible
        if (window.saveOnlyPNGSystem && window.designerWidgetInstance?.fabricCanvas) {
            console.log('PNG Generation Test Available - call canvasDebug.testPNGGeneration() to test');
        }
    },

    // 🧪 Test PNG generation
    testPNGGeneration: function() {
        console.log('🧪 === PNG GENERATION TEST ===');

        const canvas = window.designerWidgetInstance?.fabricCanvas;
        if (!canvas) {
            console.log('❌ No canvas available for testing');
            return;
        }

        const objects = canvas.getObjects();
        const designObjects = objects.filter(obj => this.classifyObject(obj) === 'design');

        console.log(`Testing with ${objects.length} total objects, ${designObjects.length} design objects`);

        try {
            // Test basic canvas export
            const dataURL = canvas.toDataURL({
                format: 'png',
                quality: 0.8,
                multiplier: 1
            });

            console.log('✅ Basic canvas export successful');
            console.log(`Data URL length: ${dataURL.length} characters`);

            // Test with design-only filtering
            const originalObjects = Array.from(objects);
            const hiddenObjects = [];

            // Hide non-design objects
            originalObjects.forEach(obj => {
                if (this.classifyObject(obj) !== 'design') {
                    obj.visible = false;
                    hiddenObjects.push(obj);
                }
            });

            canvas.renderAll();

            const designOnlyURL = canvas.toDataURL({
                format: 'png',
                quality: 0.8,
                multiplier: 1
            });

            // Restore visibility
            hiddenObjects.forEach(obj => {
                obj.visible = true;
            });
            canvas.renderAll();

            console.log('✅ Design-only export successful');
            console.log(`Design-only URL length: ${designOnlyURL.length} characters`);
            console.log(`Hidden ${hiddenObjects.length} background objects`);

            // Create preview links
            const previewWindow = window.open('', '_blank');
            previewWindow.document.write(`
                <h3>PNG Generation Test Results</h3>
                <h4>Full Canvas:</h4>
                <img src="${dataURL}" style="max-width: 400px; border: 1px solid #ccc;" />
                <h4>Design Only:</h4>
                <img src="${designOnlyURL}" style="max-width: 400px; border: 1px solid #ccc;" />
            `);

            console.log('✅ Preview window opened with test results');

        } catch (error) {
            console.log('❌ PNG generation test failed:', error.message);
        }
    },

    // 📋 Generate debug report
    generateReport: function() {
        console.log('📋 === GENERATING DEBUG REPORT ===');

        const report = {
            timestamp: new Date().toISOString(),
            url: window.location.href,
            canvas: {
                available: !!window.designerWidgetInstance?.fabricCanvas,
                objectCount: window.designerWidgetInstance?.fabricCanvas?.getObjects().length || 0,
                dimensions: window.designerWidgetInstance?.fabricCanvas ?
                    `${window.designerWidgetInstance.fabricCanvas.width}x${window.designerWidgetInstance.fabricCanvas.height}` : 'unknown'
            },
            scripts: {
                generateDesignData: typeof window.generateDesignData,
                saveOnlyPNGSystem: typeof window.saveOnlyPNGSystem,
                fabric: typeof window.fabric,
                designerWidget: typeof window.designerWidgetInstance
            },
            templateData: {
                urlTemplateId: new URLSearchParams(window.location.search).get('template_id'),
                domElements: document.querySelectorAll('[data-template-id]').length,
                highDPIEngine: !!window.highDPIPrintExportEngine,
                wpConfig: !!window.octo_print_designer_config
            }
        };

        console.log('Debug Report:', report);

        // Copy to clipboard if possible
        if (navigator.clipboard) {
            navigator.clipboard.writeText(JSON.stringify(report, null, 2)).then(() => {
                console.log('📋 Debug report copied to clipboard');
            });
        }

        return report;
    }
};

console.log('🔍 Canvas Debug Commands Available:');
console.log('  canvasDebug.analyzeAll() - Complete analysis');
console.log('  canvasDebug.analyzeObjects() - Object details');
console.log('  canvasDebug.analyzePrintArea() - Print area detection');
console.log('  canvasDebug.analyzeScriptLoading() - Script status');
console.log('  canvasDebug.testPNGGeneration() - Test PNG export');
console.log('  canvasDebug.generateReport() - Create debug report');