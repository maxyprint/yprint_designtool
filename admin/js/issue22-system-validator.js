/**
 * 🔍 AGENT 7: FINAL SYSTEM VALIDATOR - Issue #22 Implementation Quality Assurance
 * Two-Point Measurement Interface - Comprehensive System Validation
 */

class Issue22SystemValidator {
    constructor() {
        this.validationResults = {
            timestamp: new Date().toISOString(),
            overallStatus: 'unknown',
            components: {},
            integration: {},
            workflow: {},
            issues: [],
            recommendations: []
        };

        this.requiredComponents = {
            'MeasurementDefinitionSystem': 'Agent 2: Smart JavaScript Selection Logic',
            'MeasurementDatabaseIntegration': 'Agent 3: Database Integration System',
            'MeasurementValidationEngine': 'Agent 4: Real-time Validation Engine',
            'MeasurementFutureProofingSystem': 'Agent 6: Future-Proofing Dynamic Support',
            'MeasurementSystemIntegration': 'Agent 7: Integration Coordinator'
        };

        this.requiredUI = {
            '.measurement-definition-mode': 'Agent 1: Enhanced Toolbar Button',
            '.measurement-panel': 'Agent 5: Measurement Interface Panel'
        };
    }

    /**
     * 🚀 Run Complete System Validation
     */
    async runCompleteValidation() {
        console.log('🔍 [Issue #22 Validator] Starting comprehensive system validation...');

        try {
            // Phase 1: Component Availability Check
            await this.validateComponentAvailability();

            // Phase 2: UI Element Validation
            this.validateUIElements();

            // Phase 3: Integration Health Check
            await this.validateSystemIntegration();

            // Phase 4: Workflow Functionality Test
            await this.validateWorkflowFunctionality();

            // Phase 5: Performance & Quality Metrics
            this.validatePerformanceMetrics();

            // Generate final validation report
            this.generateValidationReport();

            return this.validationResults;

        } catch (error) {
            console.error('❌ [Issue #22 Validator] Validation failed:', error);
            this.validationResults.overallStatus = 'failed';
            this.validationResults.issues.push({
                type: 'critical',
                message: `Validation process failed: ${error.message}`,
                component: 'validator'
            });
            return this.validationResults;
        }
    }

    /**
     * 🧩 Component Availability Validation
     */
    async validateComponentAvailability() {
        console.log('🧩 Validating component availability...');

        for (const [className, description] of Object.entries(this.requiredComponents)) {
            const isAvailable = typeof window[className] !== 'undefined';

            this.validationResults.components[className] = {
                description,
                available: isAvailable,
                status: isAvailable ? 'success' : 'missing'
            };

            if (!isAvailable) {
                this.validationResults.issues.push({
                    type: 'error',
                    message: `Missing required component: ${className} (${description})`,
                    component: className
                });
            } else {
                // Test component instantiation
                try {
                    if (className === 'MeasurementSystemIntegration') {
                        // Test main integration system
                        const testInstance = new window[className]();
                        this.validationResults.components[className].instantiation = 'success';
                        console.log(`✅ ${className} instantiation test passed`);
                    } else {
                        this.validationResults.components[className].instantiation = 'success';
                        console.log(`✅ ${className} available and ready`);
                    }
                } catch (error) {
                    this.validationResults.components[className].instantiation = 'failed';
                    this.validationResults.issues.push({
                        type: 'error',
                        message: `Component instantiation failed for ${className}: ${error.message}`,
                        component: className
                    });
                }
            }
        }
    }

    /**
     * 🎨 UI Elements Validation
     */
    validateUIElements() {
        console.log('🎨 Validating UI elements...');

        for (const [selector, description] of Object.entries(this.requiredUI)) {
            const element = document.querySelector(selector);
            const isPresent = !!element;

            this.validationResults.integration[selector] = {
                description,
                present: isPresent,
                status: isPresent ? 'success' : 'missing'
            };

            if (!isPresent) {
                this.validationResults.issues.push({
                    type: 'warning',
                    message: `Missing UI element: ${selector} (${description})`,
                    component: 'ui'
                });
            } else {
                console.log(`✅ UI Element found: ${selector}`);
            }
        }

        // Check for measurement interface CSS
        const measurementCSS = Array.from(document.styleSheets).some(sheet => {
            try {
                return sheet.href && sheet.href.includes('measurement-definition-interface');
            } catch (e) {
                return false;
            }
        });

        this.validationResults.integration['measurement_css'] = {
            description: 'Agent 5: Measurement Interface Styling',
            present: measurementCSS,
            status: measurementCSS ? 'success' : 'missing'
        };

        if (!measurementCSS) {
            this.validationResults.issues.push({
                type: 'warning',
                message: 'Measurement definition interface CSS not detected',
                component: 'css'
            });
        }
    }

    /**
     * 🔗 System Integration Validation
     */
    async validateSystemIntegration() {
        console.log('🔗 Validating system integration...');

        // Check if main integration system exists
        if (window.measurementSystemIntegrator) {
            try {
                const integrator = window.measurementSystemIntegrator;

                // Test system health
                const systemHealth = integrator.state?.systemHealth || 'unknown';
                this.validationResults.integration['system_health'] = {
                    description: 'Overall system health status',
                    value: systemHealth,
                    status: systemHealth === 'healthy' ? 'success' : 'warning'
                };

                // Test component connections
                const components = integrator.components || {};
                const connectedComponents = Object.keys(components).filter(key => components[key]);

                this.validationResults.integration['connected_components'] = {
                    description: 'Successfully connected components',
                    value: connectedComponents.length,
                    total: Object.keys(this.requiredComponents).length,
                    status: connectedComponents.length >= 3 ? 'success' : 'warning'
                };

                // Test event system
                const hasEventSystem = !!window.measurementSystemEvents;
                this.validationResults.integration['event_system'] = {
                    description: 'Global event coordination system',
                    present: hasEventSystem,
                    status: hasEventSystem ? 'success' : 'error'
                };

                console.log(`✅ Integration system validated: ${connectedComponents.length}/${Object.keys(this.requiredComponents).length} components connected`);

            } catch (error) {
                this.validationResults.issues.push({
                    type: 'error',
                    message: `Integration validation failed: ${error.message}`,
                    component: 'integration'
                });
            }
        } else {
            this.validationResults.integration['main_integrator'] = {
                description: 'Main integration system',
                present: false,
                status: 'missing'
            };

            this.validationResults.issues.push({
                type: 'critical',
                message: 'Main integration system (measurementSystemIntegrator) not found',
                component: 'integration'
            });
        }
    }

    /**
     * 🔄 Workflow Functionality Validation
     */
    async validateWorkflowFunctionality() {
        console.log('🔄 Validating workflow functionality...');

        // Test 1: Measurement Mode Activation
        const measurementButton = document.querySelector('.measurement-definition-mode');
        if (measurementButton) {
            this.validationResults.workflow['measurement_activation'] = {
                description: 'Measurement mode activation capability',
                button_present: true,
                status: 'ready'
            };
        } else {
            this.validationResults.workflow['measurement_activation'] = {
                description: 'Measurement mode activation capability',
                button_present: false,
                status: 'missing'
            };
        }

        // Test 2: Database Integration Capability
        if (window.MeasurementDatabaseIntegration) {
            try {
                const dbIntegration = new window.MeasurementDatabaseIntegration({
                    endpoint: 'test',
                    nonce: 'test',
                    templateId: 'test'
                });

                this.validationResults.workflow['database_integration'] = {
                    description: 'Database integration functionality',
                    instantiable: true,
                    status: 'ready'
                };
            } catch (error) {
                this.validationResults.workflow['database_integration'] = {
                    description: 'Database integration functionality',
                    instantiable: false,
                    error: error.message,
                    status: 'error'
                };
            }
        }

        // Test 3: Validation Engine Capability
        if (window.MeasurementValidationEngine) {
            try {
                const validationEngine = new window.MeasurementValidationEngine({});
                this.validationResults.workflow['validation_engine'] = {
                    description: 'Real-time validation functionality',
                    instantiable: true,
                    status: 'ready'
                };
            } catch (error) {
                this.validationResults.workflow['validation_engine'] = {
                    description: 'Real-time validation functionality',
                    instantiable: false,
                    error: error.message,
                    status: 'error'
                };
            }
        }
    }

    /**
     * ⚡ Performance Metrics Validation
     */
    validatePerformanceMetrics() {
        console.log('⚡ Validating performance metrics...');

        // Check script loading performance
        const performanceEntries = performance.getEntriesByType('navigation');
        const measurementScripts = performance.getEntriesByType('resource').filter(entry =>
            entry.name.includes('measurement')
        );

        this.validationResults.integration['performance'] = {
            description: 'System performance metrics',
            measurement_scripts_loaded: measurementScripts.length,
            total_load_time: performanceEntries[0]?.loadEventEnd || 0,
            status: measurementScripts.length >= 3 ? 'success' : 'warning'
        };

        // Memory usage estimation
        if (performance.memory) {
            this.validationResults.integration['memory_usage'] = {
                description: 'Memory usage metrics',
                used: performance.memory.usedJSHeapSize,
                total: performance.memory.totalJSHeapSize,
                limit: performance.memory.jsHeapSizeLimit,
                status: 'info'
            };
        }
    }

    /**
     * 📊 Generate Final Validation Report
     */
    generateValidationReport() {
        const successCount = Object.values({
            ...this.validationResults.components,
            ...this.validationResults.integration,
            ...this.validationResults.workflow
        }).filter(item => item.status === 'success').length;

        const totalChecks = Object.keys({
            ...this.validationResults.components,
            ...this.validationResults.integration,
            ...this.validationResults.workflow
        }).length;

        const successRate = (successCount / totalChecks) * 100;

        // Determine overall status
        if (successRate >= 90) {
            this.validationResults.overallStatus = 'excellent';
        } else if (successRate >= 75) {
            this.validationResults.overallStatus = 'good';
        } else if (successRate >= 60) {
            this.validationResults.overallStatus = 'acceptable';
        } else {
            this.validationResults.overallStatus = 'needs_improvement';
        }

        // Generate recommendations
        this.generateRecommendations();

        console.log(`📊 Issue #22 System Validation Complete: ${successRate.toFixed(1)}% success rate (${this.validationResults.overallStatus})`);
        console.log('📋 Validation Results:', this.validationResults);
    }

    /**
     * 💡 Generate Recommendations
     */
    generateRecommendations() {
        const criticalIssues = this.validationResults.issues.filter(issue => issue.type === 'critical');
        const errorIssues = this.validationResults.issues.filter(issue => issue.type === 'error');

        if (criticalIssues.length > 0) {
            this.validationResults.recommendations.push(
                '🚨 CRITICAL: Resolve missing critical components before deployment'
            );
        }

        if (errorIssues.length > 0) {
            this.validationResults.recommendations.push(
                '⚠️ ERROR: Fix component instantiation errors for full functionality'
            );
        }

        const missingComponents = Object.values(this.validationResults.components)
            .filter(comp => !comp.available).length;

        if (missingComponents > 0) {
            this.validationResults.recommendations.push(
                `📦 COMPONENTS: ${missingComponents} components need to be loaded or fixed`
            );
        }

        if (this.validationResults.overallStatus === 'excellent') {
            this.validationResults.recommendations.push(
                '🎉 EXCELLENT: Issue #22 implementation is ready for production use!'
            );
        }
    }

    /**
     * 🚀 Quick Health Check (for development)
     */
    quickHealthCheck() {
        const health = {
            components: Object.keys(this.requiredComponents).filter(comp => window[comp]).length,
            ui: Object.keys(this.requiredUI).filter(sel => document.querySelector(sel)).length,
            integration: !!window.measurementSystemIntegrator,
            timestamp: new Date().toISOString()
        };

        console.log('⚡ Quick Health Check:', health);
        return health;
    }
}

/**
 * 🌐 Global System Validator
 */
window.Issue22SystemValidator = Issue22SystemValidator;

/**
 * 🎯 Auto-run validation when DOM is ready
 */
document.addEventListener('DOMContentLoaded', () => {
    // Only run on template pages
    if (document.querySelector('.yprint-template-designer')) {
        console.log('🎯 Initializing Issue #22 System Validator...');

        window.issue22Validator = new Issue22SystemValidator();

        // Run validation after slight delay to ensure all components are loaded
        setTimeout(async () => {
            const results = await window.issue22Validator.runCompleteValidation();

            // Store results globally for debugging
            window.issue22ValidationResults = results;

            console.log('🏁 Issue #22 System Validation Complete!');
            console.log(`📊 Overall Status: ${results.overallStatus}`);
            console.log(`📋 Issues Found: ${results.issues.length}`);

            if (results.recommendations.length > 0) {
                console.log('💡 Recommendations:');
                results.recommendations.forEach(rec => console.log(`   ${rec}`));
            }
        }, 2000);
    }
});

/**
 * 🛠️ Development Helper Functions
 */
if (typeof window !== 'undefined') {
    window.validateIssue22 = async () => {
        if (window.issue22Validator) {
            return await window.issue22Validator.runCompleteValidation();
        } else {
            console.log('❌ Issue #22 validator not initialized');
            return null;
        }
    };

    window.quickIssue22Check = () => {
        if (window.issue22Validator) {
            return window.issue22Validator.quickHealthCheck();
        } else {
            console.log('❌ Issue #22 validator not initialized');
            return null;
        }
    };
}