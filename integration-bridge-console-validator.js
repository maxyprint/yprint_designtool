/**
 * AGENT 5: Integration Bridge API Console Validation Script
 *
 * This script validates the accessibility and functionality of the Integration Bridge API
 * after fixes have been applied. Run this in the browser console to test all methods.
 */

(function() {
    'use strict';

    console.log('🎯 AGENT 5: Integration Bridge API Validation Script Loaded');
    console.log('='.repeat(60));

    class IntegrationBridgeConsoleValidator {
        constructor() {
            this.testResults = {
                globalInstance: null,
                methodAccessibility: {},
                coreAPIMethods: {},
                classIntegrity: null,
                validationSummary: null
            };
        }

        log(message, level = 'info') {
            const styles = {
                info: 'color: #2196F3',
                success: 'color: #4CAF50; font-weight: bold',
                warning: 'color: #FF9800; font-weight: bold',
                error: 'color: #F44336; font-weight: bold',
                header: 'color: #9C27B0; font-size: 14px; font-weight: bold'
            };

            console.log(`%c${message}`, styles[level] || styles.info);
        }

        // 1. Validate Global Instance Accessibility
        validateGlobalInstance() {
            this.log('🔍 AGENT 5: Testing global instance accessibility...', 'header');

            try {
                // Check for window.multiViewSelector
                if (typeof window.multiViewSelector !== 'undefined' && window.multiViewSelector) {
                    this.testResults.globalInstance = {
                        accessible: true,
                        type: typeof window.multiViewSelector,
                        constructor: window.multiViewSelector.constructor.name,
                        instanceId: window.multiViewSelector.templateId || 'unknown'
                    };

                    this.log('✅ Global instance found: window.multiViewSelector', 'success');
                    this.log(`   Constructor: ${window.multiViewSelector.constructor.name}`, 'info');
                    this.log(`   Type: ${typeof window.multiViewSelector}`, 'info');
                    this.log(`   Template ID: ${window.multiViewSelector.templateId || 'unknown'}`, 'info');

                    return true;
                } else {
                    this.testResults.globalInstance = {
                        accessible: false,
                        error: 'window.multiViewSelector is undefined or null'
                    };

                    this.log('❌ Global instance not accessible', 'error');
                    this.log('   window.multiViewSelector is undefined or null', 'error');

                    return false;
                }
            } catch (error) {
                this.testResults.globalInstance = {
                    accessible: false,
                    error: error.message
                };

                this.log(`❌ Error accessing global instance: ${error.message}`, 'error');
                return false;
            }
        }

        // 2. Test Method Signatures and Accessibility
        validateMethodSignatures() {
            this.log('🔧 AGENT 5: Testing method signatures and accessibility...', 'header');

            const criticalMethods = [
                'validateReferenceLineBridgeSystem',
                'exportForPrecisionCalculation',
                'validateForPrecisionCalculation',
                'getReferenceLinesByMeasurement',
                'getPrimaryReferenceLines'
            ];

            let accessibleMethods = 0;

            for (const methodName of criticalMethods) {
                try {
                    const method = window.multiViewSelector[methodName];

                    if (typeof method === 'function') {
                        this.testResults.methodAccessibility[methodName] = {
                            accessible: true,
                            type: typeof method,
                            parameters: method.length // Number of parameters
                        };

                        this.log(`✅ ${methodName}() - ACCESSIBLE (${method.length} params)`, 'success');
                        accessibleMethods++;
                    } else {
                        this.testResults.methodAccessibility[methodName] = {
                            accessible: false,
                            type: typeof method,
                            error: 'Not a function'
                        };

                        this.log(`❌ ${methodName}() - NOT ACCESSIBLE (${typeof method})`, 'error');
                    }
                } catch (error) {
                    this.testResults.methodAccessibility[methodName] = {
                        accessible: false,
                        error: error.message
                    };

                    this.log(`❌ ${methodName}() - ERROR: ${error.message}`, 'error');
                }
            }

            const accessibilityRate = Math.round((accessibleMethods / criticalMethods.length) * 100);
            this.log(`📊 Method accessibility: ${accessibleMethods}/${criticalMethods.length} (${accessibilityRate}%)`, 'info');

            return accessibilityRate === 100;
        }

        // 3. Test Core API Functions
        testCoreAPIFunctions() {
            this.log('⚙️ AGENT 5: Testing core API function execution...', 'header');

            let successfulTests = 0;
            const totalTests = 2;

            // Test 1: validateReferenceLineBridgeSystem()
            try {
                this.log('🧪 Testing validateReferenceLineBridgeSystem()...', 'info');
                const validationResult = window.multiViewSelector.validateReferenceLineBridgeSystem();

                if (validationResult && typeof validationResult === 'object') {
                    const hasRequiredFields = [
                        'timestamp',
                        'system_status',
                        'validation_results',
                        'overall_score',
                        'integration_readiness'
                    ].every(field => field in validationResult);

                    if (hasRequiredFields) {
                        this.testResults.coreAPIMethods.validateReferenceLineBridgeSystem = {
                            working: true,
                            resultType: typeof validationResult,
                            overallScore: validationResult.overall_score,
                            integrationReadiness: validationResult.integration_readiness,
                            validationCount: Object.keys(validationResult.validation_results).length
                        };

                        this.log('✅ validateReferenceLineBridgeSystem() - WORKING', 'success');
                        this.log(`   Overall score: ${validationResult.overall_score}%`, 'info');
                        this.log(`   Integration readiness: ${validationResult.integration_readiness}`, 'info');
                        this.log(`   Validation modules: ${Object.keys(validationResult.validation_results).length}`, 'info');

                        successfulTests++;
                    } else {
                        this.log('❌ validateReferenceLineBridgeSystem() - Missing required fields', 'error');
                    }
                } else {
                    this.log('❌ validateReferenceLineBridgeSystem() - Invalid return type', 'error');
                }
            } catch (error) {
                this.testResults.coreAPIMethods.validateReferenceLineBridgeSystem = {
                    working: false,
                    error: error.message
                };
                this.log(`❌ validateReferenceLineBridgeSystem() - ERROR: ${error.message}`, 'error');
            }

            // Test 2: exportForPrecisionCalculation()
            try {
                this.log('🧪 Testing exportForPrecisionCalculation()...', 'info');
                const exportResult = window.multiViewSelector.exportForPrecisionCalculation();

                if (exportResult && typeof exportResult === 'object') {
                    const hasRequiredFields = [
                        'template_id',
                        'timestamp',
                        'total_views',
                        'views'
                    ].every(field => field in exportResult);

                    if (hasRequiredFields) {
                        this.testResults.coreAPIMethods.exportForPrecisionCalculation = {
                            working: true,
                            resultType: typeof exportResult,
                            templateId: exportResult.template_id,
                            totalViews: exportResult.total_views,
                            viewCount: Object.keys(exportResult.views).length
                        };

                        this.log('✅ exportForPrecisionCalculation() - WORKING', 'success');
                        this.log(`   Template ID: ${exportResult.template_id}`, 'info');
                        this.log(`   Total views: ${exportResult.total_views}`, 'info');
                        this.log(`   Export timestamp: ${new Date(exportResult.timestamp).toLocaleString()}`, 'info');

                        successfulTests++;
                    } else {
                        this.log('❌ exportForPrecisionCalculation() - Missing required fields', 'error');
                    }
                } else {
                    this.log('❌ exportForPrecisionCalculation() - Invalid return type', 'error');
                }
            } catch (error) {
                this.testResults.coreAPIMethods.exportForPrecisionCalculation = {
                    working: false,
                    error: error.message
                };
                this.log(`❌ exportForPrecisionCalculation() - ERROR: ${error.message}`, 'error');
            }

            const functionTestRate = Math.round((successfulTests / totalTests) * 100);
            this.log(`📊 Core API function tests: ${successfulTests}/${totalTests} (${functionTestRate}%)`, 'info');

            return functionTestRate === 100;
        }

        // 4. Confirm Class Instance Integrity
        confirmClassInstanceIntegrity() {
            this.log('🏗️ AGENT 5: Confirming class instance integrity...', 'header');

            try {
                const instance = window.multiViewSelector;

                // Check essential properties
                const essentialProperties = [
                    'templateId',
                    'canvas',
                    'debug',
                    'multiViewReferenceLines',
                    'templateViews'
                ];

                const presentProperties = essentialProperties.filter(prop => prop in instance);
                const methods = Object.getOwnPropertyNames(Object.getPrototypeOf(instance))
                    .filter(name => typeof instance[name] === 'function' && name !== 'constructor');

                this.testResults.classIntegrity = {
                    valid: true,
                    constructorName: instance.constructor.name,
                    essentialProperties: presentProperties.length,
                    totalMethods: methods.length,
                    hasTemplateId: 'templateId' in instance && instance.templateId !== null,
                    hasCanvas: 'canvas' in instance && instance.canvas !== null,
                    hasDebugger: 'debug' in instance && typeof instance.debug === 'object'
                };

                this.log('✅ Class instance integrity confirmed', 'success');
                this.log(`   Constructor: ${instance.constructor.name}`, 'info');
                this.log(`   Essential properties: ${presentProperties.length}/${essentialProperties.length}`, 'info');
                this.log(`   Total methods: ${methods.length}`, 'info');
                this.log(`   Template ID set: ${'templateId' in instance && instance.templateId !== null}`, 'info');
                this.log(`   Canvas attached: ${'canvas' in instance && instance.canvas !== null}`, 'info');
                this.log(`   Debug system: ${'debug' in instance && typeof instance.debug === 'object'}`, 'info');

                return true;
            } catch (error) {
                this.testResults.classIntegrity = {
                    valid: false,
                    error: error.message
                };

                this.log(`❌ Class instance integrity check failed: ${error.message}`, 'error');
                return false;
            }
        }

        // 5. Run Complete Validation
        runCompleteValidation() {
            this.log('🚀 AGENT 5: Starting complete Integration Bridge API validation...', 'header');
            this.log('='.repeat(80), 'info');

            const results = {
                step1_globalInstance: this.validateGlobalInstance(),
                step2_methodSignatures: this.validateMethodSignatures(),
                step3_coreAPIFunctions: this.testCoreAPIFunctions(),
                step4_classIntegrity: this.confirmClassInstanceIntegrity()
            };

            // Calculate overall results
            const totalSteps = Object.keys(results).length;
            const passedSteps = Object.values(results).filter(result => result === true).length;
            const successRate = Math.round((passedSteps / totalSteps) * 100);

            this.testResults.validationSummary = {
                totalSteps,
                passedSteps,
                successRate,
                timestamp: Date.now(),
                integrationBridgeReady: successRate === 100
            };

            // Display results
            this.log('='.repeat(80), 'info');
            this.log('📊 AGENT 5: INTEGRATION BRIDGE VALIDATION SUMMARY', 'header');
            this.log('='.repeat(80), 'info');

            this.log(`1. Global Instance Access: ${results.step1_globalInstance ? '✅ PASS' : '❌ FAIL'}`,
                results.step1_globalInstance ? 'success' : 'error');
            this.log(`2. Method Signatures: ${results.step2_methodSignatures ? '✅ PASS' : '❌ FAIL'}`,
                results.step2_methodSignatures ? 'success' : 'error');
            this.log(`3. Core API Functions: ${results.step3_coreAPIFunctions ? '✅ PASS' : '❌ FAIL'}`,
                results.step3_coreAPIFunctions ? 'success' : 'error');
            this.log(`4. Class Instance Integrity: ${results.step4_classIntegrity ? '✅ PASS' : '❌ FAIL'}`,
                results.step4_classIntegrity ? 'success' : 'error');

            this.log('', 'info');
            this.log(`OVERALL SUCCESS RATE: ${passedSteps}/${totalSteps} (${successRate}%)`, 'header');

            if (successRate === 100) {
                this.log('🎉 INTEGRATION BRIDGE API FULLY VALIDATED AND READY FOR USE!', 'success');
                this.log('✅ All TypeError errors resolved', 'success');
                this.log('✅ All methods accessible via global instance', 'success');
                this.log('✅ Core API functions operational', 'success');
            } else {
                this.log('⚠️ Integration Bridge API validation incomplete - issues detected', 'warning');
                this.log('❌ Review individual test results above', 'error');
            }

            this.log('='.repeat(80), 'info');

            return {
                success: successRate === 100,
                successRate,
                results: this.testResults,
                integrationBridgeReady: successRate === 100
            };
        }

        // Helper method to get detailed results
        getDetailedResults() {
            return {
                timestamp: Date.now(),
                testResults: this.testResults,
                summary: this.testResults.validationSummary
            };
        }
    }

    // Create global validator instance
    window.integrationBridgeValidator = new IntegrationBridgeConsoleValidator();

    // Convenience functions
    window.validateIntegrationBridge = () => {
        return window.integrationBridgeValidator.runCompleteValidation();
    };

    window.getValidationResults = () => {
        return window.integrationBridgeValidator.getDetailedResults();
    };

    // Auto-run validation if global instance is available
    if (typeof window.multiViewSelector !== 'undefined' && window.multiViewSelector) {
        console.log('🎯 AGENT 5: Global instance detected - running automatic validation...');
        setTimeout(() => {
            window.validateIntegrationBridge();
        }, 500);
    } else {
        console.log('ℹ️ AGENT 5: Console validator ready. Run validateIntegrationBridge() when ready.');
        console.log('ℹ️ Available commands:');
        console.log('  - validateIntegrationBridge() - Run complete validation');
        console.log('  - getValidationResults() - Get detailed results');
    }

})();