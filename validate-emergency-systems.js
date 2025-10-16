/**
 * 🔍 EMERGENCY SYSTEMS VALIDATION
 * Comprehensive validation of all deployed emergency systems
 */

class EmergencySystemValidator {
    constructor() {
        console.log('🔍 EMERGENCY VALIDATOR: Starting comprehensive system validation...');

        this.validationResults = {
            coreSuperpowers: {},
            emergencyResolver: {},
            systemIntegration: {},
            performanceMetrics: {},
            overallHealth: 'UNKNOWN'
        };

        this.runCompleteValidation();
    }

    async runCompleteValidation() {
        console.log('🚀 EMERGENCY VALIDATOR: Beginning validation sequence...');

        try {
            // Phase 1: Validate core superpower systems
            await this.validateCoreSuperpowers();

            // Phase 2: Validate emergency paradox resolver
            await this.validateEmergencyResolver();

            // Phase 3: Validate system integration
            await this.validateSystemIntegration();

            // Phase 4: Measure performance metrics
            await this.measurePerformanceMetrics();

            // Phase 5: Generate overall health assessment
            this.generateHealthAssessment();

            console.log('✅ EMERGENCY VALIDATOR: Validation completed successfully!');
            this.displayResults();

        } catch (error) {
            console.error('❌ EMERGENCY VALIDATOR: Validation failed:', error);
            this.validationResults.overallHealth = 'CRITICAL';
            this.displayResults();
        }
    }

    async validateCoreSuperpowers() {
        console.log('🔧 EMERGENCY VALIDATOR: Validating core superpower systems...');

        const coreTests = {
            // Test 1: Emergency Response System
            emergencySystem: this.testEmergencySystem(),

            // Test 2: Unified Fabric Loader
            unifiedFabricLoader: this.testUnifiedFabricLoader(),

            // Test 3: Event Coordination System
            eventCoordination: this.testEventCoordination(),

            // Test 4: Superpower Activation
            superpowerActivation: this.testSuperpowerActivation()
        };

        for (const [testName, testResult] of Object.entries(coreTests)) {
            this.validationResults.coreSuperpowers[testName] = testResult;
            const status = testResult.passed ? '✅' : '❌';
            console.log(`${status} CORE VALIDATION: ${testName} - ${testResult.message}`);
        }
    }

    testEmergencySystem() {
        try {
            if (!window.OptimizedDesignDataCaptureInstance) {
                return { passed: false, message: 'OptimizedDesignDataCaptureInstance not found' };
            }

            if (typeof window.OptimizedDesignDataCaptureInstance.emergencyFabricDetection !== 'function') {
                return { passed: false, message: 'Emergency fabric detection method missing' };
            }

            return { passed: true, message: 'Emergency system functional' };
        } catch (error) {
            return { passed: false, message: `Emergency system error: ${error.message}` };
        }
    }

    testUnifiedFabricLoader() {
        try {
            if (!window.unifiedFabricLoader) {
                return { passed: false, message: 'Unified fabric loader not found' };
            }

            const status = window.unifiedFabricLoader.getStatus();
            if (!status.ready) {
                return { passed: false, message: 'Unified fabric loader not ready' };
            }

            if (!window.fabric || typeof window.fabric.Canvas !== 'function') {
                return { passed: false, message: 'Fabric.js not available globally' };
            }

            return { passed: true, message: `Fabric loaded via ${status.source}`, details: status };
        } catch (error) {
            return { passed: false, message: `Fabric loader error: ${error.message}` };
        }
    }

    testEventCoordination() {
        try {
            if (!window.eventCoordinationSystem) {
                return { passed: false, message: 'Event coordination system not found' };
            }

            const state = window.eventCoordinationSystem.getCurrentState();
            if (!state) {
                return { passed: false, message: 'Event coordination state unavailable' };
            }

            return { passed: true, message: `Event coordination active - ${state.state}`, details: state };
        } catch (error) {
            return { passed: false, message: `Event coordination error: ${error.message}` };
        }
    }

    testSuperpowerActivation() {
        try {
            if (!window.yprintSuperpowerActivation) {
                return { passed: false, message: 'Superpower activation system not found' };
            }

            const status = window.yprintSuperpowerActivation.getSuperpowerStatus();
            if (!status) {
                return { passed: false, message: 'Superpower status unavailable' };
            }

            return { passed: true, message: 'Superpower activation system functional', details: status };
        } catch (error) {
            return { passed: false, message: `Superpower activation error: ${error.message}` };
        }
    }

    async validateEmergencyResolver() {
        console.log('🚨 EMERGENCY VALIDATOR: Validating emergency paradox resolver...');

        try {
            if (!window.emergencyParadoxResolver) {
                this.validationResults.emergencyResolver = {
                    passed: false,
                    message: 'Emergency paradox resolver not found'
                };
                return;
            }

            const status = window.emergencyParadoxResolver.getStatus();
            const resolvers = status.resolvers;

            const resolverTests = {
                fabricCanvasConnection: resolvers.fabricCanvasConnection,
                legacySystemOverride: resolvers.legacySystemOverride,
                designerReadyForced: resolvers.designerReadyForced,
                paradoxResolved: resolvers.paradoxResolved
            };

            const passedTests = Object.values(resolverTests).filter(Boolean).length;
            const totalTests = Object.keys(resolverTests).length;

            this.validationResults.emergencyResolver = {
                passed: status.systemReady,
                message: `${passedTests}/${totalTests} resolver tests passed`,
                details: { resolvers: resolverTests, systemReady: status.systemReady }
            };

            const resolverStatus = status.systemReady ? '✅' : '❌';
            console.log(`${resolverStatus} EMERGENCY RESOLVER: ${this.validationResults.emergencyResolver.message}`);

        } catch (error) {
            this.validationResults.emergencyResolver = {
                passed: false,
                message: `Emergency resolver validation error: ${error.message}`
            };
        }
    }

    async validateSystemIntegration() {
        console.log('🔗 EMERGENCY VALIDATOR: Validating system integration...');

        const integrationTests = {
            canvasElements: this.testCanvasElements(),
            designerInstance: this.testDesignerInstance(),
            fabricInstances: this.testFabricInstances(),
            eventFlow: this.testEventFlow(),
            paradoxDetection: this.testParadoxDetection()
        };

        this.validationResults.systemIntegration = integrationTests;

        for (const [testName, result] of Object.entries(integrationTests)) {
            const status = result.passed ? '✅' : '❌';
            console.log(`${status} INTEGRATION: ${testName} - ${result.message}`);
        }
    }

    testCanvasElements() {
        try {
            const canvases = document.querySelectorAll('canvas');
            if (canvases.length === 0) {
                return { passed: false, message: 'No canvas elements found' };
            }

            return { passed: true, message: `${canvases.length} canvas elements found` };
        } catch (error) {
            return { passed: false, message: `Canvas test error: ${error.message}` };
        }
    }

    testDesignerInstance() {
        try {
            if (!window.designerWidgetInstance) {
                return { passed: false, message: 'Designer widget instance not found' };
            }

            return { passed: true, message: 'Designer widget instance available' };
        } catch (error) {
            return { passed: false, message: `Designer test error: ${error.message}` };
        }
    }

    testFabricInstances() {
        try {
            const canvases = document.querySelectorAll('canvas');
            let fabricInstances = 0;

            canvases.forEach(canvas => {
                if (canvas.fabric || canvas.__fabric) {
                    fabricInstances++;
                }
            });

            // Also check designer widget for canvas
            if (window.designerWidgetInstance &&
                (window.designerWidgetInstance.canvas || window.designerWidgetInstance.fabricCanvas)) {
                fabricInstances++;
            }

            if (fabricInstances === 0) {
                return { passed: false, message: 'No fabric instances detected' };
            }

            return { passed: true, message: `${fabricInstances} fabric instances detected` };
        } catch (error) {
            return { passed: false, message: `Fabric instances test error: ${error.message}` };
        }
    }

    testEventFlow() {
        try {
            // Test if events can be properly dispatched and received
            let eventReceived = false;

            const testEventHandler = () => {
                eventReceived = true;
            };

            window.addEventListener('validationTestEvent', testEventHandler, { once: true });
            window.dispatchEvent(new CustomEvent('validationTestEvent'));

            setTimeout(() => {
                window.removeEventListener('validationTestEvent', testEventHandler);
            }, 100);

            return {
                passed: eventReceived,
                message: eventReceived ? 'Event flow working' : 'Event flow blocked'
            };
        } catch (error) {
            return { passed: false, message: `Event flow test error: ${error.message}` };
        }
    }

    testParadoxDetection() {
        try {
            // Test if the original paradox condition still exists
            const canvases = document.querySelectorAll('canvas');
            let fabricInstances = 0;

            canvases.forEach(canvas => {
                if (canvas.fabric || canvas.__fabric) {
                    fabricInstances++;
                }
            });

            const hasFabricGlobal = typeof window.fabric !== 'undefined';
            const paradoxExists = hasFabricGlobal && canvases.length > 0 && fabricInstances === 0;

            return {
                passed: !paradoxExists,
                message: paradoxExists ? 'Canvas/Fabric paradox still exists' : 'No paradox detected'
            };
        } catch (error) {
            return { passed: false, message: `Paradox detection test error: ${error.message}` };
        }
    }

    async measurePerformanceMetrics() {
        console.log('📊 EMERGENCY VALIDATOR: Measuring performance metrics...');

        try {
            const startTime = performance.now();

            // Test fabric canvas creation performance
            let fabricCreationTime = 0;
            if (window.fabric) {
                const fabricStart = performance.now();
                const testCanvas = new window.fabric.Canvas();
                testCanvas.dispose();
                fabricCreationTime = performance.now() - fabricStart;
            }

            // Measure console message count (proxy for system health)
            const consoleLogs = this.getConsoleLogCount();

            const totalTime = performance.now() - startTime;

            this.validationResults.performanceMetrics = {
                passed: fabricCreationTime < 100, // Should be fast
                message: `Performance validation completed in ${totalTime.toFixed(2)}ms`,
                details: {
                    fabricCreationTime: fabricCreationTime.toFixed(2) + 'ms',
                    consoleLogs: consoleLogs,
                    totalValidationTime: totalTime.toFixed(2) + 'ms'
                }
            };

            console.log(`📊 PERFORMANCE: Fabric creation: ${fabricCreationTime.toFixed(2)}ms`);
            console.log(`📊 PERFORMANCE: Total validation: ${totalTime.toFixed(2)}ms`);

        } catch (error) {
            this.validationResults.performanceMetrics = {
                passed: false,
                message: `Performance measurement error: ${error.message}`
            };
        }
    }

    getConsoleLogCount() {
        // This is a simplified proxy - in real implementation you'd track this
        return 'Not tracked in this validation';
    }

    generateHealthAssessment() {
        console.log('🏥 EMERGENCY VALIDATOR: Generating overall health assessment...');

        const allResults = [
            ...Object.values(this.validationResults.coreSuperpowers),
            this.validationResults.emergencyResolver,
            ...Object.values(this.validationResults.systemIntegration),
            this.validationResults.performanceMetrics
        ];

        const passedTests = allResults.filter(result => result.passed).length;
        const totalTests = allResults.length;
        const successRate = (passedTests / totalTests) * 100;

        let healthStatus = 'CRITICAL';
        if (successRate >= 90) healthStatus = 'EXCELLENT';
        else if (successRate >= 80) healthStatus = 'GOOD';
        else if (successRate >= 70) healthStatus = 'ACCEPTABLE';
        else if (successRate >= 50) healthStatus = 'POOR';

        this.validationResults.overallHealth = healthStatus;
        this.validationResults.successRate = successRate;
        this.validationResults.testSummary = { passed: passedTests, total: totalTests };

        console.log(`🏥 HEALTH ASSESSMENT: ${healthStatus} (${successRate.toFixed(1)}% success rate)`);
    }

    displayResults() {
        console.group('📋 EMERGENCY SYSTEMS VALIDATION REPORT');
        console.log('Overall Health:', this.validationResults.overallHealth);
        console.log('Success Rate:', `${this.validationResults.successRate?.toFixed(1)}%`);
        console.log('Test Summary:', this.validationResults.testSummary);
        console.log('Core Superpowers:', this.validationResults.coreSuperpowers);
        console.log('Emergency Resolver:', this.validationResults.emergencyResolver);
        console.log('System Integration:', this.validationResults.systemIntegration);
        console.log('Performance Metrics:', this.validationResults.performanceMetrics);
        console.groupEnd();

        // Store results globally
        window.emergencyValidationResults = this.validationResults;

        // Dispatch completion event
        window.dispatchEvent(new CustomEvent('emergencyValidationCompleted', {
            detail: this.validationResults
        }));
    }

    getResults() {
        return this.validationResults;
    }
}

// Auto-run validation
console.log('🔍 EMERGENCY VALIDATOR: Auto-starting validation...');
window.emergencySystemValidator = new EmergencySystemValidator();

// Global status checker
window.getValidationResults = () => {
    if (window.emergencySystemValidator) {
        return window.emergencySystemValidator.getResults();
    }
    return { error: 'Emergency system validator not initialized' };
};

// Export for compatibility
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmergencySystemValidator;
}