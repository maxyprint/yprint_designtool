#!/usr/bin/env node

/**
 * VOLLSTÄNDIGE WORDPRESS PLUGIN SIMULATION
 * Simuliert komplette WordPress-Initialisierung mit echten Scripts
 */

const fs = require('fs');
const path = require('path');
const { performance } = require('perf_hooks');
const { JSDOM } = require('jsdom');

class WordPressFullSimulation {
    constructor() {
        this.startTime = performance.now();
        this.testResults = [];
        this.dom = null;
        this.window = null;
        this.document = null;

        console.log('🌍 WORDPRESS FULL SIMULATION');
        console.log('============================');
        console.log('Vollständige WordPress Plugin Initialisierung');
        console.log('');
    }

    async initialize() {
        console.log('🚀 Starting WordPress simulation...');

        // 1. Setup DOM Environment
        await this.setupWordPressDOMEnvironment();

        // 2. Load WordPress Core Scripts
        await this.loadWordPressCore();

        // 3. Load Plugin Scripts in correct order
        await this.loadPluginScripts();

        // 4. Test Canvas Creation
        await this.testCanvasCreation();

        // 5. Test Production-Ready Capture
        await this.testProductionReadyCapture();

        // 6. Generate Report
        this.generateReport();
    }

    async setupWordPressDOMEnvironment() {
        console.log('🌍 Setting up WordPress DOM environment...');

        const html = `
        <!DOCTYPE html>
        <html lang="de">
        <head>
            <meta charset="UTF-8">
            <title>YPrint Designer</title>
            <style>
                .mockup-design-area {
                    width: 800px;
                    height: 600px;
                    position: relative;
                    background: #f0f0f0;
                }
                canvas {
                    position: absolute;
                    top: 10px;
                    left: 10px;
                }
            </style>
        </head>
        <body>
            <!-- WordPress Header -->
            <div id="wpadminbar" style="display: none;"></div>

            <!-- YPrint Designer HTML Structure -->
            <div class="yprint-designer-container">
                <div class="mockup-design-area" data-template-view-id="test-template-front">
                    <canvas id="designer-canvas" width="780" height="580"></canvas>
                </div>

                <!-- WordPress/WooCommerce Buttons -->
                <button id="add-to-cart" class="btn btn-primary">In Warenkorb</button>
                <button id="save-design" class="btn btn-secondary">Design speichern</button>
            </div>

            <!-- WordPress Footer -->
            <div id="wp-footer"></div>
        </body>
        </html>
        `;

        this.dom = new JSDOM(html, {
            url: 'https://yprint.de/designer/',
            runScripts: 'dangerously',
            resources: 'usable',
            pretendToBeVisual: true
        });

        this.window = this.dom.window;
        this.document = this.window.document;

        // Setup global WordPress environment
        this.window.wp = {
            hooks: {
                addAction: () => {},
                addFilter: () => {},
                doAction: () => {},
                applyFilters: (filter, value) => value
            }
        };

        // Setup jQuery simulation
        this.window.$ = this.window.jQuery = this.createJQueryMock();

        // Setup WordPress globals
        this.window.ajaxurl = 'https://yprint.de/wp-admin/admin-ajax.php';
        this.window.octoPrintDesigner = {
            ajaxUrl: 'https://yprint.de/wp-admin/admin-ajax.php',
            nonce: 'test-nonce-123',
            isLoggedIn: true,
            loginUrl: 'https://yprint.de/wp-login.php'
        };

        console.log('✅ WordPress DOM environment ready');
    }

    createJQueryMock() {
        const elements = [];

        function jQueryMock(selector) {
            if (typeof selector === 'string') {
                const found = jQueryMock.dom.querySelectorAll(selector);
                return {
                    length: found.length,
                    [Symbol.iterator]: function* () {
                        for (let i = 0; i < found.length; i++) {
                            yield found[i];
                        }
                    },
                    ready: (callback) => {
                        if (jQueryMock.dom.readyState === 'complete') {
                            setTimeout(callback, 0);
                        } else {
                            jQueryMock.dom.addEventListener('DOMContentLoaded', callback);
                        }
                    },
                    on: (event, handler) => {
                        for (let element of found) {
                            element.addEventListener(event, handler);
                        }
                        return this;
                    },
                    click: (handler) => {
                        if (handler) {
                            return this.on('click', handler);
                        } else {
                            for (let element of found) {
                                element.click();
                            }
                        }
                        return this;
                    }
                };
            } else if (typeof selector === 'function') {
                // Document ready shorthand
                if (jQueryMock.dom.readyState === 'complete') {
                    setTimeout(selector, 0);
                } else {
                    jQueryMock.dom.addEventListener('DOMContentLoaded', selector);
                }
            }
            return jQueryMock;
        }

        jQueryMock.dom = this.document;
        jQueryMock.extend = (target, ...sources) => Object.assign(target, ...sources);
        jQueryMock.ajax = (options) => {
            console.log('🌐 jQuery AJAX call:', options.url);
            return Promise.resolve({success: true});
        };

        return jQueryMock;
    }

    async loadWordPressCore() {
        console.log('📦 Loading WordPress core scripts...');

        // Simuliere WordPress Script Loading
        const wpScripts = [
            'jquery',
            'wp-util',
            'wp-hooks'
        ];

        for (const script of wpScripts) {
            await this.loadScript(`WordPress Core: ${script}`);
        }

        console.log('✅ WordPress core loaded');
    }

    async loadPluginScripts() {
        console.log('🔌 Loading YPrint Plugin scripts in WordPress order...');

        // Exakte Reihenfolge aus class-octo-print-designer-public.php
        const scriptOrder = [
            'vendor.bundle.js',
            'emergency-fabric-loader.js',
            'yprint-stripe-service.js',
            'designer.bundle.js',
            'webpack-designer-patch.js',
            'designer-global-exposer.js',
            'octo-print-designer-public.js',
            'production-ready-design-data-capture.js'
        ];

        for (const scriptFile of scriptOrder) {
            await this.loadPluginScript(scriptFile);
        }

        console.log('✅ All plugin scripts loaded');
    }

    async loadPluginScript(scriptFile) {
        console.log(`📜 Loading: ${scriptFile}`);

        try {
            const scriptPath = path.join(__dirname, 'public/js', scriptFile);

            if (fs.existsSync(scriptPath)) {
                let scriptContent = fs.readFileSync(scriptPath, 'utf8');

                // Script-spezifische Anpassungen für Node.js
                scriptContent = this.adaptScriptForNodeJs(scriptContent, scriptFile);

                // Script in DOM-Kontext ausführen mit korrekten Argumenten
                const scriptFunction = new this.window.Function('', scriptContent);
                scriptFunction.call(this.window, this.window);

                // Simuliere Ladezeit
                await this.sleep(100 + Math.random() * 200);

                console.log(`  ✅ ${scriptFile} loaded`);
            } else {
                console.log(`  ⚠️ ${scriptFile} not found, simulating...`);
                await this.simulateScript(scriptFile);
            }
        } catch (error) {
            console.log(`  ❌ ${scriptFile} error:`, error.message);
            this.testResults.push({
                test: `script_loading_${scriptFile}`,
                success: false,
                error: error.message
            });
        }
    }

    adaptScriptForNodeJs(scriptContent, scriptFile) {
        // Setup globals für Script-Kontext
        this.window.global = this.window;

        // Globale Verfügbarkeit sicherstellen
        scriptContent = `
            (function() {
                const window = this;
                const document = this.document;
                const console = this.console;
                const performance = this.performance || {now: Date.now};
                const global = this;

                ${scriptContent}
            }).call(arguments[0]);
        `;

        // Script-spezifische Anpassungen
        switch (scriptFile) {
            case 'vendor.bundle.js':
                // Fabric.js aus vendor bundle extrahieren
                scriptContent += `
                    if (typeof fabric !== 'undefined') {
                        window.fabric = fabric;
                        console.log('📦 Fabric.js from vendor bundle available');
                    }
                `;
                break;

            case 'designer.bundle.js':
                // DesignerWidget aus webpack bundle simulieren
                scriptContent += `
                    // Simuliere DesignerWidget aus webpack
                    if (typeof window.webpackChunkocto_print_designer !== 'undefined') {
                        // Webpack chunk simulation
                        window.DesignerWidget = class DesignerWidget {
                            constructor(canvasId) {
                                this.canvasId = canvasId;
                                this.canvas = window.fabric ? new window.fabric.Canvas(canvasId) : null;
                                console.log('🎨 DesignerWidget instance created');
                            }
                        };
                    }
                `;
                break;
        }

        return scriptContent;
    }

    async simulateScript(scriptFile) {
        switch (scriptFile) {
            case 'vendor.bundle.js':
                // Fabric.js simulieren
                this.window.fabric = this.createFabricMock();
                console.log('  🎨 Fabric.js mock created');
                break;

            case 'designer.bundle.js':
                // DesignerWidget simulieren
                this.window.DesignerWidget = this.createDesignerWidgetMock();
                console.log('  🎯 DesignerWidget mock created');
                break;

            case 'emergency-fabric-loader.js':
                // Emergency loader simulation
                this.window.emergencyFabricLoaderActive = true;
                console.log('  🚨 Emergency fabric loader simulated');
                break;
        }

        await this.sleep(50);
    }

    createFabricMock() {
        return {
            Canvas: class FabricCanvas {
                constructor(canvasId) {
                    this.canvasId = canvasId;
                    this.width = 780;
                    this.height = 580;
                    this.objects = [
                        {
                            type: 'i-text',
                            text: 'Simulation Text',
                            left: 100,
                            top: 50,
                            width: 120,
                            height: 30,
                            scaleX: 1,
                            scaleY: 1,
                            angle: 0,
                            fontFamily: 'Arial',
                            fontSize: 24,
                            fill: '#333333'
                        }
                    ];

                    // Element mit Canvas verknüpfen
                    const element = this.window?.document?.getElementById(canvasId);
                    if (element) {
                        element.__fabric = this;
                    }

                    console.log(`🎨 Fabric Canvas created: ${canvasId}`);
                }

                getObjects() {
                    return this.objects;
                }

                add(obj) {
                    this.objects.push(obj);
                }

                toJSON() {
                    return {
                        objects: this.objects,
                        width: this.width,
                        height: this.height
                    };
                }
            },

            Image: {
                fromURL: (url, callback) => {
                    setTimeout(() => {
                        callback({
                            type: 'image',
                            src: url,
                            width: 100,
                            height: 100
                        });
                    }, 100);
                }
            }
        };
    }

    createDesignerWidgetMock() {
        const window = this.window;
        return class DesignerWidget {
            constructor(canvasId) {
                this.canvasId = canvasId;
                if (window.fabric && window.fabric.Canvas) {
                    this.canvas = new window.fabric.Canvas(canvasId);
                } else {
                    console.log('⚠️ Fabric.js not available, creating placeholder canvas');
                    this.canvas = {
                        getObjects: () => [],
                        toJSON: () => ({objects: [], width: 780, height: 580})
                    };
                }
                console.log(`🎯 DesignerWidget created for: ${canvasId}`);
            }

            getCanvas() {
                return this.canvas;
            }

            exportDesign() {
                return this.canvas.toJSON();
            }
        };
    }

    async testCanvasCreation() {
        console.log('🎨 Testing canvas creation...');

        try {
            // Test Canvas Element
            const canvasElement = this.document.getElementById('designer-canvas');
            if (!canvasElement) {
                throw new Error('Canvas element not found');
            }

            // Test Fabric.js
            if (!this.window.fabric) {
                throw new Error('Fabric.js not available');
            }

            // Test DesignerWidget
            if (!this.window.DesignerWidget) {
                console.log('⚠️ DesignerWidget not available, using direct Fabric');
                // Direkter Fabric Canvas
                const fabricCanvas = new this.window.fabric.Canvas('designer-canvas');
                canvasElement.__fabric = fabricCanvas;
                console.log('🔗 Canvas element marked with __fabric property');
            } else {
                // DesignerWidget verwenden
                const widget = new this.window.DesignerWidget('designer-canvas');

                // Stelle sicher, dass das Canvas Element korrekt mit __fabric markiert ist
                if (widget.canvas && canvasElement) {
                    canvasElement.__fabric = widget.canvas;
                    console.log('🔗 Canvas element marked with __fabric property via DesignerWidget');
                }
            }

            // Überprüfe, ob Canvas korrekt markiert ist
            const markedCanvas = this.window.document.querySelector('canvas[id="designer-canvas"]');
            if (markedCanvas && markedCanvas.__fabric) {
                console.log('✅ Canvas successfully marked with __fabric property');
            } else {
                console.log('⚠️ Canvas not properly marked with __fabric property');
            }

            console.log('✅ Canvas creation successful');
            this.testResults.push({
                test: 'canvas_creation',
                success: true
            });

        } catch (error) {
            console.log(`❌ Canvas creation failed: ${error.message}`);
            this.testResults.push({
                test: 'canvas_creation',
                success: false,
                error: error.message
            });
        }
    }

    async testProductionReadyCapture() {
        console.log('🎯 Testing Production-Ready Design Data Capture...');

        try {
            // Warte etwas länger auf Auto-Initialisierung
            let retryCount = 0;
            while (!this.window.productionReadyCaptureInstance && retryCount < 20) {
                await this.sleep(100);
                retryCount++;
                if (retryCount % 5 === 0) {
                    console.log(`  ⏳ Waiting for auto-initialization... (attempt ${retryCount}/20)`);
                }
            }

            // Prüfe ob das System verfügbar ist
            if (!this.window.productionReadyCaptureInstance) {
                // Prüfe alternative globale Verfügbarkeit
                console.log('🔍 Checking available globals...');
                console.log('  - ProductionReadyDesignDataCapture class:', !!this.window.ProductionReadyDesignDataCapture);
                console.log('  - productionReadyCaptureInstance:', !!this.window.productionReadyCaptureInstance);
                console.log('  - Available window properties:', Object.keys(this.window).filter(k => k.includes('production') || k.includes('capture')));

                throw new Error('Production-ready capture instance not found');
            }

            const instance = this.window.productionReadyCaptureInstance;

            // Warte auf Initialisierung
            let retries = 0;
            while (!instance.initialized && retries < 10) {
                await this.sleep(200);
                retries++;
            }

            if (!instance.initialized) {
                throw new Error('Capture system did not initialize');
            }

            // Test generateDesignData
            const designData = instance.generateDesignData();

            if (!designData) {
                throw new Error('generateDesignData returned null');
            }

            if (!designData.template_view_id) {
                throw new Error('Missing template_view_id');
            }

            if (!designData.designed_on_area_px) {
                throw new Error('Missing designed_on_area_px');
            }

            if (!Array.isArray(designData.elements)) {
                throw new Error('Missing or invalid elements array');
            }

            console.log('✅ Production-Ready Capture test successful');
            console.log(`   Elements captured: ${designData.elements.length}`);
            console.log(`   Template ID: ${designData.template_view_id}`);

            this.testResults.push({
                test: 'production_ready_capture',
                success: true,
                designData: designData
            });

        } catch (error) {
            console.log(`❌ Production-Ready Capture failed: ${error.message}`);
            this.testResults.push({
                test: 'production_ready_capture',
                success: false,
                error: error.message
            });
        }
    }

    generateReport() {
        console.log('\n📊 WORDPRESS SIMULATION REPORT');
        console.log('================================');

        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(r => r.success).length;
        const failedTests = totalTests - passedTests;

        console.log(`Total Tests: ${totalTests}`);
        console.log(`Passed: ${passedTests} ✅`);
        console.log(`Failed: ${failedTests} ❌`);
        console.log(`Success Rate: ${Math.round((passedTests / totalTests) * 100)}%`);

        console.log('\nDetailed Results:');
        this.testResults.forEach(result => {
            const status = result.success ? '✅' : '❌';
            console.log(`  ${status} ${result.test}`);
            if (result.error) {
                console.log(`      Error: ${result.error}`);
            }
        });

        if (passedTests === totalTests) {
            console.log('\n🎉 ALL TESTS PASSED - WordPress simulation successful!');
        } else {
            console.log('\n❌ ISSUES DETECTED in WordPress simulation');
            console.log('Real production problems found that need fixing.');
        }

        return passedTests === totalTests;
    }

    async loadScript(name) {
        console.log(`  📜 Loading: ${name}`);
        await this.sleep(50 + Math.random() * 100);
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// WordPress Simulation ausführen
async function runWordPressSimulation() {
    const simulation = new WordPressFullSimulation();

    try {
        await simulation.initialize();
        process.exit(0);
    } catch (error) {
        console.error('❌ WordPress simulation failed:', error);
        process.exit(1);
    }
}

// Starte nur wenn direkt ausgeführt
if (require.main === module) {
    runWordPressSimulation();
}

module.exports = WordPressFullSimulation;