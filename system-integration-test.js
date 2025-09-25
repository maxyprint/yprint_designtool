#!/usr/bin/env node

/**
 * AGENT 6 - SYSTEM INTEGRATION TESTER
 * Comprehensive testing of restored Integration Bridge System
 */

const fs = require('fs');

console.log('🧪 AGENT 6 - SYSTEM INTEGRATION TESTER MISSION');
console.log('================================================');
console.log('');

// Load the system file
const systemFile = './admin/js/multi-view-point-to-point-selector.js';

if (!fs.existsSync(systemFile)) {
    console.error('❌ System file not found:', systemFile);
    process.exit(1);
}

let systemCode = fs.readFileSync(systemFile, 'utf8');

// Create a mock DOM and WordPress environment for testing
const mockEnv = {
    window: {
        wp: {
            ajax: {
                post: (action, data, success, error) => {
                    console.log(`📡 AJAX Call: ${action}`);
                    if (success) success({ success: true, data: {} });
                }
            }
        },
        jQuery: function(selector) {
            return {
                length: 1,
                val: () => 'test-value',
                append: () => {},
                html: () => {},
                show: () => {},
                hide: () => {},
                removeClass: () => {},
                addClass: () => {},
                on: () => {},
                off: () => {},
                trigger: () => {},
                closest: () => ({ length: 1 }),
                find: () => ({ length: 1, val: () => 'test' }),
                each: function(callback) { callback.call(this, 0, this); return this; },
                get: () => [{ getBoundingClientRect: () => ({ left: 0, top: 0, width: 100, height: 100 }) }]
            };
        },
        fabric: {
            Canvas: function() {
                return {
                    add: () => {},
                    remove: () => {},
                    getObjects: () => [],
                    renderAll: () => {},
                    clear: () => {},
                    setWidth: () => {},
                    setHeight: () => {},
                    on: () => {}
                };
            },
            Line: function() { return { set: () => {} }; }
        }
    },
    console: {
        log: console.log,
        error: console.error,
        warn: console.warn
    }
};

// Set global variables for the test environment
global.window = mockEnv.window;
global.$ = global.jQuery = mockEnv.window.jQuery;
global.console = mockEnv.console;
global.fabric = mockEnv.window.fabric;

try {
    console.log('⚡ Loading Integration Bridge System...');

    // Execute the system code in our test environment
    eval(systemCode);

    // Now test the system
    if (typeof MultiViewPointToPointSelector !== 'undefined') {
        console.log('✅ MultiViewPointToPointSelector class loaded successfully');

        const testInstance = new MultiViewPointToPointSelector();

        if (typeof testInstance.validateReferenceLineBridgeSystem === 'function') {
            console.log('✅ Found validateReferenceLineBridgeSystem function');

            console.log('🧪 Executing comprehensive validation...');
            const validation = testInstance.validateReferenceLineBridgeSystem();

            console.log('');
            console.log('📊 VALIDATION RESULTS:');
            console.log('======================');
            console.log('Timestamp:', new Date(validation.timestamp));
            console.log('System Status:', validation.system_status);
            console.log('Overall Score:', validation.overall_score);
            console.log('Integration Readiness:', validation.integration_readiness);
            console.log('');

            if (validation.validation_results) {
                console.log('📋 COMPONENT VALIDATION:');
                Object.entries(validation.validation_results).forEach(([key, result]) => {
                    console.log(`  ${key}:`);
                    console.log(`    Score: ${result.score}/100`);
                    console.log(`    Status: ${result.status}`);
                    if (result.critical_issues && result.critical_issues.length > 0) {
                        console.log(`    Critical Issues: ${result.critical_issues.length}`);
                    }
                    if (result.warnings && result.warnings.length > 0) {
                        console.log(`    Warnings: ${result.warnings.length}`);
                    }
                });
                console.log('');
            }

            if (validation.critical_issues && validation.critical_issues.length > 0) {
                console.log('🚨 CRITICAL ISSUES:');
                validation.critical_issues.forEach((issue, i) => {
                    console.log(`  ${i+1}. ${issue}`);
                });
                console.log('');
            }

            if (validation.recommendations && validation.recommendations.length > 0) {
                console.log('💡 RECOMMENDATIONS:');
                validation.recommendations.forEach((rec, i) => {
                    console.log(`  ${i+1}. ${rec}`);
                });
                console.log('');
            }

            // Test specific PrecisionCalculator Bridge functionality
            console.log('🔧 Testing PrecisionCalculator Bridge API...');
            if (typeof testInstance.initializePrecisionCalculatorBridge === 'function') {
                console.log('✅ initializePrecisionCalculatorBridge method found');
            } else {
                console.log('❌ initializePrecisionCalculatorBridge method missing');
            }

            // Test UI Integration
            console.log('🖥️  Testing UI Integration...');
            if (typeof testInstance.generateValidationReport === 'function') {
                console.log('✅ generateValidationReport method found');
                try {
                    const report = testInstance.generateValidationReport();
                    console.log('✅ Validation report generated successfully');
                } catch (error) {
                    console.log('⚠️  Validation report generation failed:', error.message);
                }
            } else {
                console.log('❌ generateValidationReport method missing');
            }

            // Test Multi-View Mapping
            console.log('🗺️  Testing Multi-View Mapping functions...');
            if (typeof testInstance.measurement_mapping === 'object') {
                console.log('✅ measurement_mapping object found');
            } else {
                console.log('❌ measurement_mapping object missing');
            }

            console.log('');
            console.log('📈 SYSTEM INTEGRATION TEST SUMMARY');
            console.log('===================================');
            console.log(`Overall Score: ${validation.overall_score}/100`);
            console.log(`Status: ${validation.integration_readiness}`);

            if (validation.overall_score >= 80) {
                console.log('✅ SYSTEM READY FOR PRODUCTION');
            } else if (validation.overall_score >= 60) {
                console.log('⚠️  SYSTEM NEEDS IMPROVEMENT');
            } else {
                console.log('❌ SYSTEM NOT READY FOR PRODUCTION');
            }

        } else {
            console.error('❌ validateReferenceLineBridgeSystem function not found!');
        }
    } else {
        console.error('❌ MultiViewPointToPointSelector class not found!');
    }

} catch (error) {
    console.error('❌ Critical error during system validation:', error.message);
    console.error('Stack trace:', error.stack);
    process.exit(1);
}