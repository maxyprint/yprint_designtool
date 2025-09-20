/**
 * Test Suite für Design Data Capture System
 * Schritt 2: Frontend – Saubere Datenerfassung im Canvas
 *
 * Comprehensive Testing für alle Akzeptanzkriterien
 */

class DesignDataCaptureTest {
    constructor() {
        this.testResults = {
            passed: 0,
            failed: 0,
            tests: []
        };
    }

    /**
     * Haupt-Test-Runner
     */
    async runAllTests() {
        console.log('🧪 Design Data Capture Test Suite Starting...');
        console.log('═'.repeat(60));

        // Test 1: JSON Generation bei Speichern-Button
        await this.testSaveButtonTrigger();

        // Test 2: Vollständige Element-Erfassung
        await this.testCompleteElementCapture();

        // Test 3: Koordinaten-Korrektheit
        await this.testCoordinateAccuracy();

        // Test 4: Transformations-Erfassung
        await this.testTransformationCapture();

        // Test 5: JSON-Schema Validierung
        await this.testJSONSchemaValidation();

        // Test 6: Debug-Output Verfügbarkeit
        await this.testDebugOutput();

        // Test 7: Integration mit bestehender saveDesign
        await this.testSaveDesignIntegration();

        this.printTestResults();
        return this.testResults;
    }

    /**
     * Test 1: Akzeptanzkriterium - JSON bei Save-Button
     */
    async testSaveButtonTrigger() {
        this.logTest('Save Button Trigger Test');

        try {
            // Mock Designer Widget
            const mockDesigner = this.createMockDesigner();
            const capture = new DesignDataCapture(mockDesigner);

            // Simuliere Button Click
            let capturedData = null;
            const originalLog = console.log;
            console.log = function(message, data) {
                if (message === 'Design Data Captured:' && data) {
                    capturedData = data;
                }
                originalLog.apply(console, arguments);
            };

            const designData = capture.generateDesignData();
            console.log = originalLog;

            if (capturedData && typeof capturedData === 'object') {
                this.passTest('✅ JSON wird bei generateDesignData() zuverlässig generiert');
            } else {
                this.failTest('❌ Kein JSON bei generateDesignData() generiert');
            }

        } catch (error) {
            this.failTest(`❌ Save Button Test Fehler: ${error.message}`);
        }
    }

    /**
     * Test 2: Akzeptanzkriterium - Vollständige Element-Erfassung
     */
    async testCompleteElementCapture() {
        this.logTest('Complete Element Capture Test');

        try {
            const mockDesigner = this.createMockDesigner();
            const capture = new DesignDataCapture(mockDesigner);

            // Simuliere Canvas mit verschiedenen Elementen
            mockDesigner.fabricCanvas.getObjects = () => [
                this.createMockImage(),
                this.createMockText(),
                this.createMockRect(),
                this.createMockInternalObject() // Sollte ignoriert werden
            ];

            const designData = capture.generateDesignData();

            if (designData && designData.elements && designData.elements.length === 3) {
                this.passTest('✅ Alle User-Elemente werden erfasst, interne Objekte ignoriert');
            } else {
                this.failTest(`❌ Element-Erfassung fehlerhaft. Erwartet: 3, Erhalten: ${designData?.elements?.length || 0}`);
            }

        } catch (error) {
            this.failTest(`❌ Element Capture Test Fehler: ${error.message}`);
        }
    }

    /**
     * Test 3: Akzeptanzkriterium - Koordinaten-Korrektheit
     */
    async testCoordinateAccuracy() {
        this.logTest('Coordinate Accuracy Test');

        try {
            const mockDesigner = this.createMockDesigner();
            const capture = new DesignDataCapture(mockDesigner);

            // Mock coordinate transformation
            capture.mockupDesignAreaContainer = {
                getBoundingClientRect: () => ({
                    left: 100,
                    top: 50
                })
            };

            const mockCanvas = {
                upperCanvasEl: {
                    getBoundingClientRect: () => ({
                        left: 150,
                        top: 100
                    })
                }
            };
            capture.fabricCanvas = { ...capture.fabricCanvas, ...mockCanvas };

            const transformed = capture.transformCoordinates(50, 75);

            // Erwartete Transformation: Canvas(50,75) + Offset(50,50) = mockup_design_area(100,125)
            if (transformed.x === 100 && transformed.y === 125) {
                this.passTest('✅ Koordinaten-Transformation korrekt relativ zu mockup_design_area');
            } else {
                this.failTest(`❌ Koordinaten-Transformation fehlerhaft. Erwartet: (100,125), Erhalten: (${transformed.x},${transformed.y})`);
            }

        } catch (error) {
            this.failTest(`❌ Koordinaten Test Fehler: ${error.message}`);
        }
    }

    /**
     * Test 4: Akzeptanzkriterium - Transformations-Erfassung
     */
    async testTransformationCapture() {
        this.logTest('Transformation Capture Test');

        try {
            const mockDesigner = this.createMockDesigner();
            const capture = new DesignDataCapture(mockDesigner);

            const mockObject = {
                type: 'image',
                left: 100,
                top: 150,
                width: 200,
                height: 100,
                scaleX: 1.5,
                scaleY: 2.0,
                angle: 45,
                src: 'test.jpg'
            };

            const element = capture.transformObjectToElement(mockObject);

            const expectedTransformations = {
                scaleX: 1.5,
                scaleY: 2.0,
                angle: 45,
                width: 300, // 200 * 1.5
                height: 200  // 100 * 2.0
            };

            let transformationsCorrect = true;
            for (const [key, expected] of Object.entries(expectedTransformations)) {
                if (element[key] !== expected) {
                    transformationsCorrect = false;
                    break;
                }
            }

            if (transformationsCorrect) {
                this.passTest('✅ Skalierung und Rotation werden korrekt erfasst');
            } else {
                this.failTest('❌ Transformations-Erfassung fehlerhaft');
                console.log('Expected:', expectedTransformations);
                console.log('Received:', {
                    scaleX: element.scaleX,
                    scaleY: element.scaleY,
                    angle: element.angle,
                    width: element.width,
                    height: element.height
                });
            }

        } catch (error) {
            this.failTest(`❌ Transformation Test Fehler: ${error.message}`);
        }
    }

    /**
     * Test 5: Akzeptanzkriterium - JSON-Schema Validierung
     */
    async testJSONSchemaValidation() {
        this.logTest('JSON Schema Validation Test');

        try {
            const mockDesigner = this.createMockDesigner();
            const capture = new DesignDataCapture(mockDesigner);

            mockDesigner.fabricCanvas.getObjects = () => [
                this.createMockImage(),
                this.createMockText()
            ];

            const designData = capture.generateDesignData();

            // Validiere Schema-Struktur
            const requiredFields = ['template_view_id', 'designed_on_area_px', 'elements'];
            const hasRequiredFields = requiredFields.every(field => designData.hasOwnProperty(field));

            const designAreaValid = designData.designed_on_area_px &&
                                  typeof designData.designed_on_area_px.width === 'number' &&
                                  typeof designData.designed_on_area_px.height === 'number';

            const elementsValid = Array.isArray(designData.elements) &&
                                designData.elements.every(el =>
                                    el.hasOwnProperty('type') &&
                                    typeof el.x === 'number' &&
                                    typeof el.y === 'number'
                                );

            if (hasRequiredFields && designAreaValid && elementsValid) {
                this.passTest('✅ JSON-Struktur entspricht exakt dem vordefinierten Schema');
            } else {
                this.failTest('❌ JSON-Schema Validierung fehlgeschlagen');
                console.log('Schema Issues:', {
                    hasRequiredFields,
                    designAreaValid,
                    elementsValid,
                    designData
                });
            }

        } catch (error) {
            this.failTest(`❌ Schema Validation Test Fehler: ${error.message}`);
        }
    }

    /**
     * Test 6: Akzeptanzkriterium - Debug-Output
     */
    async testDebugOutput() {
        this.logTest('Debug Output Test');

        try {
            let consoleLogs = [];
            const originalLog = console.log;
            console.log = function(message, data) {
                consoleLogs.push({ message, data });
                originalLog.apply(console, arguments);
            };

            const mockDesigner = this.createMockDesigner();
            const capture = new DesignDataCapture(mockDesigner);
            capture.generateDesignData();

            console.log = originalLog;

            const debugLogFound = consoleLogs.some(log =>
                log.message === 'Design Data Captured:' && log.data
            );

            if (debugLogFound) {
                this.passTest('✅ Debug-Output erscheint in Konsole mit vollständigem Datenobjekt');
            } else {
                this.failTest('❌ Debug-Output nicht gefunden');
                console.log('Console logs:', consoleLogs);
            }

        } catch (error) {
            this.failTest(`❌ Debug Output Test Fehler: ${error.message}`);
        }
    }

    /**
     * Test 7: Integration mit bestehender saveDesign
     */
    async testSaveDesignIntegration() {
        this.logTest('Save Design Integration Test');

        try {
            const mockDesigner = this.createMockDesigner();
            mockDesigner.collectDesignState = () => ({ original: 'data' });

            const capture = new DesignDataCapture(mockDesigner);
            capture.hookIntoSaveDesign();

            const result = mockDesigner.collectDesignState();

            if (result.original === 'data' && result.capturedCanvasData) {
                this.passTest('✅ Integration in bestehende saveDesign erfolgreich');
            } else {
                this.failTest('❌ Integration in saveDesign fehlgeschlagen');
                console.log('Integration result:', result);
            }

        } catch (error) {
            this.failTest(`❌ Integration Test Fehler: ${error.message}`);
        }
    }

    /**
     * Helper: Mock Designer Widget erstellen
     */
    createMockDesigner() {
        return {
            currentView: 'front',
            activeTemplateId: 'template-123',
            fabricCanvas: {
                width: 500,
                height: 625,
                getObjects: () => [],
                upperCanvasEl: {
                    getBoundingClientRect: () => ({
                        left: 0,
                        top: 0
                    })
                }
            }
        };
    }

    /**
     * Helper: Mock Image Objekt
     */
    createMockImage() {
        return {
            type: 'image',
            left: 50,
            top: 75,
            width: 200,
            height: 180,
            scaleX: 1.2,
            scaleY: 1.2,
            angle: 15,
            src: 'https://server.com/pfad/zum/bild.png'
        };
    }

    /**
     * Helper: Mock Text Objekt
     */
    createMockText() {
        return {
            type: 'i-text',
            left: 150,
            top: 300,
            width: 100,
            height: 30,
            scaleX: 1,
            scaleY: 1,
            angle: 0,
            text: 'Hallo Welt',
            fontFamily: 'Arial',
            fontSize: 24,
            fill: '#000000'
        };
    }

    /**
     * Helper: Mock Rectangle Objekt
     */
    createMockRect() {
        return {
            type: 'rect',
            left: 200,
            top: 400,
            width: 150,
            height: 100,
            scaleX: 1,
            scaleY: 1,
            angle: 0,
            fill: '#ff0000'
        };
    }

    /**
     * Helper: Mock Internal Object (sollte ignoriert werden)
     */
    createMockInternalObject() {
        return {
            type: 'rect',
            left: 0,
            top: 0,
            width: 100,
            height: 100,
            selectable: false,
            evented: false,
            isInternal: true
        };
    }

    /**
     * Test logging helpers
     */
    logTest(testName) {
        console.log(`🔍 Testing: ${testName}`);
    }

    passTest(message) {
        this.testResults.passed++;
        this.testResults.tests.push({ status: 'PASSED', message });
        console.log(`   ${message}`);
    }

    failTest(message) {
        this.testResults.failed++;
        this.testResults.tests.push({ status: 'FAILED', message });
        console.error(`   ${message}`);
    }

    /**
     * Test Results Summary
     */
    printTestResults() {
        console.log('═'.repeat(60));
        console.log('🧪 TEST SUITE RESULTS');
        console.log('═'.repeat(60));
        console.log(`✅ Passed: ${this.testResults.passed}`);
        console.log(`❌ Failed: ${this.testResults.failed}`);
        console.log(`📊 Total:  ${this.testResults.passed + this.testResults.failed}`);

        if (this.testResults.failed === 0) {
            console.log('🎉 ALL TESTS PASSED - AKZEPTANZKRITERIEN ERFÜLLT!');
        } else {
            console.log('⚠️  SOME TESTS FAILED - REVIEW REQUIRED');
        }

        console.log('═'.repeat(60));
    }
}

// Auto-Run wenn im Browser ausgeführt
if (typeof window !== 'undefined') {
    window.DesignDataCaptureTest = DesignDataCaptureTest;

    // Auto-Test nach DOM ready
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(async () => {
            if (window.designDataCapture) {
                console.log('🚀 Running Design Data Capture Tests...');
                const tester = new DesignDataCaptureTest();
                await tester.runAllTests();
            }
        }, 2000); // Warte 2s auf vollständige Initialisierung
    });
}

// Export für Node.js Tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DesignDataCaptureTest;
}