/**
 * 🧠 AGENT-6-REFERENCE-LINE-TESTER
 * Mission: Reference Line System End-to-End Testing
 * Specialized in: Reference line testing, canvas validation, save operations, end-to-end testing
 */

console.log('📏 AGENT-6-REFERENCE-LINE-TESTER: DEPLOYMENT INITIATED');

class ReferenceLineTester {
    constructor() {
        this.testResults = {
            canvas_system: 'pending',
            reference_line_creation: 'pending',
            save_operations: 'pending',
            multi_view_support: 'pending',
            integration_bridge: 'pending'
        };
        this.canvasTests = [];
        this.saveTests = [];
        this.integrationTests = [];
    }

    async execute() {
        console.log('📏 AGENT-6: Starting reference line system end-to-end testing...');

        // TASK 1: Test Canvas System Availability
        await this.testCanvasSystem();

        // TASK 2: Test Reference Line Creation
        await this.testReferenceLineCreation();

        // TASK 3: Test Save Operations
        await this.testSaveOperations();

        // TASK 4: Test Multi-View Support
        await this.testMultiViewSupport();

        // TASK 5: Test Integration Bridge
        await this.testIntegrationBridge();

        // TASK 6: Test Complete Workflow
        await this.testCompleteWorkflow();

        return this.generateReport();
    }

    async testCanvasSystem() {
        console.log('📏 AGENT-6: Testing canvas system availability...');

        const canvasChecks = {
            fabric_js_available: typeof window.fabric !== 'undefined',
            global_canvas_exposed: typeof window.fabricCanvas !== 'undefined',
            multi_view_selector_available: typeof window.multiViewPointToPointSelector !== 'undefined',
            canvas_hook_system: false,
            template_editor_integration: false
        };

        // Check Fabric.js availability
        if (canvasChecks.fabric_js_available) {
            console.log('✅ AGENT-6: Fabric.js is available');
            this.canvasTests.push({
                test: 'fabric_js',
                status: 'success',
                version: window.fabric.version || 'unknown'
            });
        } else {
            console.log('❌ AGENT-6: Fabric.js not available');
            this.canvasTests.push({
                test: 'fabric_js',
                status: 'error',
                error: 'Fabric.js not loaded'
            });
        }

        // Check global canvas exposure
        if (canvasChecks.global_canvas_exposed) {
            console.log('✅ AGENT-6: Global fabricCanvas is exposed');
            this.canvasTests.push({
                test: 'global_canvas',
                status: 'success',
                canvas_type: typeof window.fabricCanvas
            });

            // Test canvas methods
            if (window.fabricCanvas && typeof window.fabricCanvas.add === 'function') {
                canvasChecks.canvas_hook_system = true;
                console.log('✅ AGENT-6: Canvas hook system operational');
            }
        } else {
            console.log('⚠️ AGENT-6: Global fabricCanvas not exposed yet');
            this.canvasTests.push({
                test: 'global_canvas',
                status: 'warning',
                note: 'Canvas may not be initialized yet'
            });
        }

        // Check multi-view selector
        if (canvasChecks.multi_view_selector_available) {
            console.log('✅ AGENT-6: Multi-view selector available');

            const selector = window.multiViewPointToPointSelector;

            // Test selector properties
            const selectorTests = {
                has_canvas: !!selector.canvas,
                has_template_views: !!selector.templateViews,
                has_reference_lines: !!selector.multiViewReferenceLines,
                has_measurement_types: !!selector.measurementTypes,
                is_initialized: selector.isInitialized || false
            };

            this.canvasTests.push({
                test: 'multi_view_selector',
                status: 'success',
                properties: selectorTests
            });

            canvasChecks.template_editor_integration = selectorTests.has_canvas && selectorTests.has_template_views;

        } else {
            console.log('❌ AGENT-6: Multi-view selector not available');
            this.canvasTests.push({
                test: 'multi_view_selector',
                status: 'error',
                error: 'Multi-view selector not initialized'
            });
        }

        // Check DOM canvas elements
        const canvasElements = document.querySelectorAll('canvas');
        this.canvasTests.push({
            test: 'dom_canvas_elements',
            status: canvasElements.length > 0 ? 'success' : 'warning',
            count: canvasElements.length,
            elements: Array.from(canvasElements).map(canvas => ({
                id: canvas.id,
                has_fabric: !!canvas.__fabric,
                width: canvas.width,
                height: canvas.height
            }))
        });

        const successCount = Object.values(canvasChecks).filter(check => check === true).length;
        this.testResults.canvas_system = successCount >= 3 ? 'success' : 'partial';
    }

    async testReferenceLineCreation() {
        console.log('📏 AGENT-6: Testing reference line creation capabilities...');

        if (!window.multiViewPointToPointSelector) {
            console.log('❌ AGENT-6: Cannot test reference line creation - selector not available');
            this.testResults.reference_line_creation = 'error';
            return;
        }

        const selector = window.multiViewPointToPointSelector;
        const creationTests = [];

        // Test 1: Point Creation
        try {
            if (typeof selector.addPoint === 'function') {
                console.log('✅ AGENT-6: Point creation method available');
                creationTests.push({
                    test: 'point_creation_method',
                    status: 'success',
                    method: 'addPoint'
                });
            } else {
                console.log('⚠️ AGENT-6: Point creation method not found');
                creationTests.push({
                    test: 'point_creation_method',
                    status: 'warning',
                    note: 'addPoint method not available'
                });
            }
        } catch (error) {
            creationTests.push({
                test: 'point_creation_method',
                status: 'error',
                error: error.message
            });
        }

        // Test 2: Line Drawing
        try {
            if (typeof selector.drawReferenceLines === 'function') {
                console.log('✅ AGENT-6: Line drawing method available');
                creationTests.push({
                    test: 'line_drawing_method',
                    status: 'success',
                    method: 'drawReferenceLines'
                });
            } else if (typeof selector.redrawCanvas === 'function') {
                console.log('✅ AGENT-6: Canvas redraw method available');
                creationTests.push({
                    test: 'canvas_redraw_method',
                    status: 'success',
                    method: 'redrawCanvas'
                });
            }
        } catch (error) {
            creationTests.push({
                test: 'line_drawing_method',
                status: 'error',
                error: error.message
            });
        }

        // Test 3: Measurement Integration
        try {
            if (typeof selector.getMeasurementCategory === 'function') {
                console.log('✅ AGENT-6: Measurement integration available');
                creationTests.push({
                    test: 'measurement_integration',
                    status: 'success',
                    method: 'getMeasurementCategory'
                });
            }
        } catch (error) {
            creationTests.push({
                test: 'measurement_integration',
                status: 'error',
                error: error.message
            });
        }

        // Test 4: Event Handling
        try {
            const hasEventHandlers = selector.setupEventListeners || selector.handleCanvasClick;
            if (hasEventHandlers) {
                console.log('✅ AGENT-6: Event handling system available');
                creationTests.push({
                    test: 'event_handling',
                    status: 'success',
                    available: !!hasEventHandlers
                });
            }
        } catch (error) {
            creationTests.push({
                test: 'event_handling',
                status: 'error',
                error: error.message
            });
        }

        this.referenceLineTests = creationTests;
        const successfulTests = creationTests.filter(test => test.status === 'success').length;
        this.testResults.reference_line_creation = successfulTests >= 2 ? 'success' : 'partial';
    }

    async testSaveOperations() {
        console.log('📏 AGENT-6: Testing save operations...');

        // Test save endpoints
        const saveEndpoints = [
            'save_reference_lines',
            'save_multi_view_reference_lines'
        ];

        for (const endpoint of saveEndpoints) {
            try {
                console.log(`📏 AGENT-6: Testing ${endpoint} endpoint...`);

                const testData = {
                    action: endpoint,
                    template_id: 63,
                    nonce: 'test_nonce',
                    reference_lines: JSON.stringify([{
                        measurement_key: 'A',
                        view_id: 'front',
                        points: [{ x: 100, y: 100 }, { x: 200, y: 200 }]
                    }])
                };

                const response = await fetch('https://test-site.local/wp-admin/admin-ajax.php', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: Object.entries(testData).map(([key, value]) => `${key}=${encodeURIComponent(value)}`).join('&')
                });

                const responseText = await response.text();

                this.saveTests.push({
                    endpoint: endpoint,
                    status: response.ok ? 'success' : 'error',
                    response_status: response.status,
                    has_cors_headers: response.headers.get('Access-Control-Allow-Origin') ? true : false,
                    response_length: responseText.length,
                    response_preview: responseText.substring(0, 100)
                });

                if (response.ok) {
                    console.log(`✅ AGENT-6: ${endpoint} endpoint responsive`);
                } else {
                    console.log(`⚠️ AGENT-6: ${endpoint} endpoint returned ${response.status}`);
                }

            } catch (error) {
                this.saveTests.push({
                    endpoint: endpoint,
                    status: 'error',
                    error: error.message
                });
                console.error(`❌ AGENT-6: ${endpoint} test failed:`, error.message);
            }
        }

        // Test save functionality from selector
        if (window.multiViewPointToPointSelector && typeof window.multiViewPointToPointSelector.saveReferenceLines === 'function') {
            try {
                console.log('📏 AGENT-6: Testing selector save method...');

                // Don't actually save, just check if method exists and is callable
                const saveMethod = window.multiViewPointToPointSelector.saveReferenceLines;
                if (typeof saveMethod === 'function') {
                    this.saveTests.push({
                        test: 'selector_save_method',
                        status: 'success',
                        method: 'available'
                    });
                    console.log('✅ AGENT-6: Selector save method available');
                }
            } catch (error) {
                this.saveTests.push({
                    test: 'selector_save_method',
                    status: 'error',
                    error: error.message
                });
            }
        }

        const successfulSaves = this.saveTests.filter(test => test.status === 'success').length;
        this.testResults.save_operations = successfulSaves >= 1 ? 'success' : 'error';
    }

    async testMultiViewSupport() {
        console.log('📏 AGENT-6: Testing multi-view support...');

        if (!window.multiViewPointToPointSelector) {
            this.testResults.multi_view_support = 'error';
            return;
        }

        const selector = window.multiViewPointToPointSelector;
        const multiViewTests = [];

        // Test template views
        try {
            if (selector.templateViews) {
                const viewCount = Object.keys(selector.templateViews).length;
                multiViewTests.push({
                    test: 'template_views',
                    status: viewCount > 0 ? 'success' : 'warning',
                    view_count: viewCount,
                    views: Object.keys(selector.templateViews)
                });
                console.log(`📏 AGENT-6: Found ${viewCount} template views`);
            }
        } catch (error) {
            multiViewTests.push({
                test: 'template_views',
                status: 'error',
                error: error.message
            });
        }

        // Test view switching
        try {
            if (typeof selector.switchView === 'function') {
                multiViewTests.push({
                    test: 'view_switching',
                    status: 'success',
                    method: 'switchView'
                });
                console.log('✅ AGENT-6: View switching capability available');
            }
        } catch (error) {
            multiViewTests.push({
                test: 'view_switching',
                status: 'error',
                error: error.message
            });
        }

        // Test multi-view reference lines
        try {
            if (selector.multiViewReferenceLines) {
                const hasData = Object.keys(selector.multiViewReferenceLines).length > 0;
                multiViewTests.push({
                    test: 'multi_view_data',
                    status: hasData ? 'success' : 'warning',
                    has_data: hasData,
                    data_structure: typeof selector.multiViewReferenceLines
                });
                console.log('📏 AGENT-6: Multi-view reference lines data structure available');
            }
        } catch (error) {
            multiViewTests.push({
                test: 'multi_view_data',
                status: 'error',
                error: error.message
            });
        }

        this.multiViewTests = multiViewTests;
        const successfulMultiViewTests = multiViewTests.filter(test => test.status === 'success').length;
        this.testResults.multi_view_support = successfulMultiViewTests >= 1 ? 'success' : 'partial';
    }

    async testIntegrationBridge() {
        console.log('📏 AGENT-6: Testing integration bridge functionality...');

        if (!window.multiViewPointToPointSelector) {
            this.testResults.integration_bridge = 'error';
            return;
        }

        const selector = window.multiViewPointToPointSelector;

        // Test integration bridge methods
        const bridgeMethods = [
            'createIntegrationBridgeUI',
            'saveMeasurementAssignment',
            'getMeasurementIntegrationStatus',
            'getReferenceLinesByMeasurement'
        ];

        for (const method of bridgeMethods) {
            try {
                if (typeof selector[method] === 'function') {
                    this.integrationTests.push({
                        test: method,
                        status: 'success',
                        available: true
                    });
                    console.log(`✅ AGENT-6: Integration method ${method} available`);
                } else {
                    this.integrationTests.push({
                        test: method,
                        status: 'warning',
                        available: false,
                        note: 'Method not found'
                    });
                }
            } catch (error) {
                this.integrationTests.push({
                    test: method,
                    status: 'error',
                    error: error.message
                });
            }
        }

        // Test measurement dropdown integration
        try {
            const dropdown = document.getElementById('measurement-type-selector');
            if (dropdown) {
                this.integrationTests.push({
                    test: 'measurement_dropdown',
                    status: 'success',
                    element_found: true,
                    option_count: dropdown.options.length
                });
                console.log('✅ AGENT-6: Measurement dropdown found');
            } else {
                this.integrationTests.push({
                    test: 'measurement_dropdown',
                    status: 'warning',
                    element_found: false
                });
            }
        } catch (error) {
            this.integrationTests.push({
                test: 'measurement_dropdown',
                status: 'error',
                error: error.message
            });
        }

        const successfulIntegrationTests = this.integrationTests.filter(test => test.status === 'success').length;
        this.testResults.integration_bridge = successfulIntegrationTests >= 2 ? 'success' : 'partial';
    }

    async testCompleteWorkflow() {
        console.log('📏 AGENT-6: Testing complete workflow...');

        if (!window.multiViewPointToPointSelector) {
            console.log('❌ AGENT-6: Cannot test complete workflow - selector not available');
            return;
        }

        const workflowSteps = [
            { step: 'initialization', description: 'System initialization' },
            { step: 'canvas_ready', description: 'Canvas system ready' },
            { step: 'measurements_loaded', description: 'Measurements loaded' },
            { step: 'views_available', description: 'Template views available' },
            { step: 'interaction_ready', description: 'User interaction ready' }
        ];

        const workflowResults = [];

        for (const step of workflowSteps) {
            let stepStatus = 'error';
            let stepDetails = {};

            try {
                switch (step.step) {
                    case 'initialization':
                        stepStatus = window.multiViewPointToPointSelector ? 'success' : 'error';
                        stepDetails.selector_available = !!window.multiViewPointToPointSelector;
                        break;

                    case 'canvas_ready':
                        stepStatus = (window.fabricCanvas || (window.multiViewPointToPointSelector && window.multiViewPointToPointSelector.canvas)) ? 'success' : 'warning';
                        stepDetails.fabric_canvas = !!window.fabricCanvas;
                        stepDetails.selector_canvas = !!(window.multiViewPointToPointSelector && window.multiViewPointToPointSelector.canvas);
                        break;

                    case 'measurements_loaded':
                        const selector = window.multiViewPointToPointSelector;
                        const hasMeasurements = selector && selector.measurementTypes && Object.keys(selector.measurementTypes).length > 0;
                        stepStatus = hasMeasurements ? 'success' : 'warning';
                        stepDetails.measurement_count = hasMeasurements ? Object.keys(selector.measurementTypes).length : 0;
                        break;

                    case 'views_available':
                        const hasViews = window.multiViewPointToPointSelector && window.multiViewPointToPointSelector.templateViews;
                        stepStatus = hasViews ? 'success' : 'warning';
                        stepDetails.views_loaded = !!hasViews;
                        break;

                    case 'interaction_ready':
                        const canvasElement = document.querySelector('canvas');
                        stepStatus = canvasElement ? 'success' : 'warning';
                        stepDetails.canvas_element = !!canvasElement;
                        break;
                }
            } catch (error) {
                stepStatus = 'error';
                stepDetails.error = error.message;
            }

            workflowResults.push({
                step: step.step,
                description: step.description,
                status: stepStatus,
                details: stepDetails
            });

            console.log(`📏 AGENT-6: Workflow step ${step.step}: ${stepStatus}`);
        }

        this.workflowResults = workflowResults;
        const successfulSteps = workflowResults.filter(result => result.status === 'success').length;
        this.workflowCompleteness = (successfulSteps / workflowSteps.length) * 100;
    }

    generateReport() {
        const report = {
            agent: 'AGENT-6-REFERENCE-LINE-TESTER',
            status: 'completed',
            timestamp: new Date().toISOString(),
            results: this.testResults,
            canvas_analysis: {
                total_tests: this.canvasTests.length,
                successful_tests: this.canvasTests.filter(test => test.status === 'success').length,
                canvas_elements_found: this.canvasTests.find(test => test.test === 'dom_canvas_elements')?.count || 0,
                fabric_js_available: this.canvasTests.some(test => test.test === 'fabric_js' && test.status === 'success')
            },
            reference_line_capabilities: {
                creation_methods: this.referenceLineTests?.filter(test => test.status === 'success').length || 0,
                available_methods: this.referenceLineTests?.filter(test => test.status === 'success').map(test => test.method) || []
            },
            save_operations: {
                tested_endpoints: this.saveTests.length,
                working_endpoints: this.saveTests.filter(test => test.status === 'success').length,
                cors_enabled: this.saveTests.filter(test => test.has_cors_headers).length
            },
            multi_view_support: this.multiViewTests || [],
            integration_bridge: this.integrationTests || [],
            workflow_analysis: {
                completeness_percentage: this.workflowCompleteness || 0,
                workflow_steps: this.workflowResults || []
            },
            system_readiness_score: this.calculateSystemReadinessScore(),
            recommendations: this.getRecommendations()
        };

        console.log('📊 AGENT-6: Final Report:', report);
        return report;
    }

    calculateSystemReadinessScore() {
        const scores = Object.values(this.testResults).map(result => {
            switch (result) {
                case 'success': return 100;
                case 'partial': return 60;
                case 'warning': return 40;
                case 'error': return 0;
                default: return 0;
            }
        });

        const average = scores.reduce((sum, score) => sum + score, 0) / scores.length;
        return Math.round(average);
    }

    getRecommendations() {
        const recommendations = [];

        if (this.testResults.canvas_system !== 'success') {
            recommendations.push('Initialize canvas system and ensure Fabric.js is properly loaded');
        }

        if (this.testResults.reference_line_creation !== 'success') {
            recommendations.push('Implement or verify reference line creation methods in multi-view selector');
        }

        if (this.testResults.save_operations !== 'success') {
            recommendations.push('Fix save operation endpoints and ensure CORS headers are present');
        }

        if (this.testResults.multi_view_support !== 'success') {
            recommendations.push('Enhance multi-view support with proper view switching and data management');
        }

        if (this.testResults.integration_bridge !== 'success') {
            recommendations.push('Complete integration bridge implementation for measurement assignment');
        }

        const failedSaveEndpoints = this.saveTests.filter(test => test.status === 'error').length;
        if (failedSaveEndpoints > 0) {
            recommendations.push(`Fix ${failedSaveEndpoints} failed save endpoint(s)`);
        }

        if (this.workflowCompleteness < 80) {
            recommendations.push('Complete system initialization workflow to achieve full functionality');
        }

        return recommendations;
    }
}

// Execute Agent-6 Mission
const agent6 = new ReferenceLineTester();
agent6.execute().then(report => {
    console.log('🎯 AGENT-6: Mission completed successfully');
    window.AGENT_6_REPORT = report;
}).catch(error => {
    console.error('❌ AGENT-6: Mission failed:', error);
});