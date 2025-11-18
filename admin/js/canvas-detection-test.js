/**
 * Canvas Detection Test Suite
 * Comprehensive diagnostics for Fabric.js canvas detection issues
 */

window.canvasDetectionTest = {

    runTests() {
        console.log('🧪 CANVAS DETECTION TEST SUITE - STARTING...');
        console.log('=====================================');

        const results = {
            globalCanvas: this.testGlobalCanvas(),
            templateEditors: this.testTemplateEditors(),
            variationsManager: this.testVariationsManager(),
            canvasElements: this.testCanvasElements(),
            scriptLoading: this.testScriptLoading(),
            eventSystem: this.testEventSystem(),
            pollingSystem: this.testPollingSystem()
        };

        console.log('🧪 TEST RESULTS SUMMARY:');
        Object.entries(results).forEach(([test, result]) => {
            const status = result.pass ? '✅' : '❌';
            console.log(`${status} ${test}: ${result.message}`);
        });

        return results;
    },

    testGlobalCanvas() {
        const exists = !!window.fabricCanvas;
        const hasCanvas = exists && window.fabricCanvas.getObjects !== undefined;

        return {
            pass: exists && hasCanvas,
            message: exists
                ? (hasCanvas ? 'Global fabricCanvas available and functional' : 'Global fabricCanvas exists but not functional')
                : 'No global fabricCanvas found'
        };
    },

    testTemplateEditors() {
        const exists = !!window.templateEditors;
        const isMap = exists && window.templateEditors instanceof Map;
        const hasEditors = isMap && window.templateEditors.size > 0;
        let hasCanvas = false;

        if (hasEditors) {
            for (const [key, editor] of window.templateEditors.entries()) {
                if (editor && editor.canvas) {
                    hasCanvas = true;
                    break;
                }
            }
        }

        return {
            pass: exists && isMap && hasEditors && hasCanvas,
            message: `templateEditors: ${exists ? 'exists' : 'missing'}, ${isMap ? 'is Map' : 'not Map'}, ${hasEditors ? hasCanvas ? 'has canvas' : 'no canvas' : 'empty'}`
        };
    },

    testVariationsManager() {
        const exists = !!window.variationsManager;
        const hasEditors = exists && window.variationsManager.editors instanceof Map;
        let hasCanvas = false;

        if (hasEditors) {
            for (const [key, editor] of window.variationsManager.editors.entries()) {
                if (editor && editor.canvas) {
                    hasCanvas = true;
                    break;
                }
            }
        }

        return {
            pass: exists && hasEditors && hasCanvas,
            message: `variationsManager: ${exists ? 'exists' : 'missing'}, ${hasEditors ? hasCanvas ? 'has canvas' : 'no canvas' : 'no editors'}`
        };
    },

    testCanvasElements() {
        const canvasElements = document.querySelectorAll('canvas');
        const fabricCanvases = Array.from(canvasElements).filter(c => c.__fabric);

        return {
            pass: fabricCanvases.length > 0,
            message: `Found ${canvasElements.length} canvas elements, ${fabricCanvases.length} with Fabric.js`
        };
    },

    testScriptLoading() {
        const scripts = Array.from(document.querySelectorAll('script')).map(s => s.src);
        const hasVendor = scripts.some(s => s.includes('vendor.bundle.js'));
        const hasAdmin = scripts.some(s => s.includes('admin.bundle.js'));
        const hasHook = scripts.some(s => s.includes('template-editor-canvas-hook.js'));
        const hasReference = scripts.some(s => s.includes('reference-line-system.js'));

        return {
            pass: hasVendor && hasAdmin && hasHook && hasReference,
            message: `Scripts: vendor(${hasVendor}) admin(${hasAdmin}) hook(${hasHook}) reference(${hasReference})`
        };
    },

    testEventSystem() {
        // Test if custom events are working
        let eventFired = false;
        const testListener = () => { eventFired = true; };

        window.addEventListener('test-event', testListener);
        window.dispatchEvent(new CustomEvent('test-event'));
        window.removeEventListener('test-event', testListener);

        return {
            pass: eventFired,
            message: eventFired ? 'Custom events working' : 'Custom events not working'
        };
    },

    testPollingSystem() {
        // Check if polling would find anything
        const canvasFound = this.findAnyCanvas();

        return {
            pass: !!canvasFound,
            message: canvasFound ? 'Canvas findable via polling' : 'No canvas findable'
        };
    },

    findAnyCanvas() {
        // Replicate the polling logic
        if (window.templateEditors instanceof Map) {
            for (const [key, editor] of window.templateEditors.entries()) {
                if (editor && editor.canvas) return editor.canvas;
            }
        }

        if (window.variationsManager && window.variationsManager.editors instanceof Map) {
            for (const [key, editor] of window.variationsManager.editors.entries()) {
                if (editor && editor.canvas) return editor.canvas;
            }
        }

        const canvasElements = document.querySelectorAll('canvas');
        for (const canvas of canvasElements) {
            if (canvas.__fabric) return canvas.__fabric;
        }

        return null;
    },

    runDiagnostics() {
        console.log('🔍 DETAILED CANVAS DIAGNOSTICS');
        console.log('===============================');

        console.log('📊 Window Objects:', {
            templateEditors: window.templateEditors,
            variationsManager: window.variationsManager,
            fabricCanvas: window.fabricCanvas,
            fabric: window.fabric
        });

        console.log('📊 Canvas Elements Analysis:');
        const canvasElements = document.querySelectorAll('canvas');
        canvasElements.forEach((canvas, i) => {
            console.log(`Canvas ${i}:`, {
                element: canvas,
                classes: canvas.className,
                parent: canvas.parentElement?.className,
                hasFabric: !!canvas.__fabric,
                fabricType: canvas.__fabric?.constructor?.name
            });
        });

        console.log('📊 DOM Structure:');
        console.log('- Template editors:', document.querySelectorAll('.template-editor').length);
        console.log('- Canvas containers:', document.querySelectorAll('.template-canvas-container').length);
        console.log('- View items:', document.querySelectorAll('.view-item').length);

        console.log('📊 Script Analysis:');
        const scripts = document.querySelectorAll('script[src]');
        Array.from(scripts).forEach(script => {
            if (script.src.includes('octo-') || script.src.includes('template') || script.src.includes('reference')) {
                console.log('- Script:', script.src.split('/').pop());
            }
        });

        return 'Diagnostics complete - check console for details';
    },

    forceCanvasDetection() {
        console.log('🔧 FORCING CANVAS DETECTION...');

        // Try all methods sequentially
        const canvas = this.findAnyCanvas();

        if (canvas) {
            window.fabricCanvas = canvas;
            window.dispatchEvent(new CustomEvent('fabricCanvasReady', {
                detail: { canvas: canvas, forced: true }
            }));
            console.log('✅ FORCED DETECTION SUCCESS:', canvas);
            return canvas;
        } else {
            console.log('❌ FORCED DETECTION FAILED - no canvas found');
            return null;
        }
    }
};

console.log('🧪 Canvas Detection Test Suite Loaded');
console.log('Usage: canvasDetectionTest.runTests() or canvasDetectionTest.runDiagnostics()');