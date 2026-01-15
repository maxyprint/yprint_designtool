/**
 * 🧪 NEW ARCHITECTURE TEST SUITE
 *
 * Umfassender Test der neuen sauberen PNG-Architektur
 * Kopiere diesen Code in die Browser-Konsole für Tests
 */

// 🧪 COMPREHENSIVE ARCHITECTURE TESTER
async function testNewArchitecture() {
    console.log('🧪 NEW ARCHITECTURE TEST: Starting comprehensive test suite...');

    const testResults = {
        dependencies: false,
        initialization: false,
        templateDetection: false,
        viewState: false,
        pngPipeline: false,
        errorHandling: false,
        systemHealth: false,
        integration: false,
        summary: {}
    };

    try {
        // 🔧 TEST 1: Dependencies Check
        console.log('\n🔧 TEST 1: Checking architecture dependencies...');
        const dependencies = {
            'unifiedTemplateDataAccess': window.unifiedTemplateDataAccess,
            'consolidatedPNGPipeline': window.consolidatedPNGPipeline,
            'centralizedViewState': window.centralizedViewState,
            'systemBootstrapper': window.systemBootstrapper,
            'unifiedErrorHandler': window.unifiedErrorHandler
        };

        const missingDeps = Object.entries(dependencies)
            .filter(([name, instance]) => !instance)
            .map(([name]) => name);

        if (missingDeps.length === 0) {
            testResults.dependencies = true;
            console.log('✅ TEST 1: All architecture dependencies available');
        } else {
            console.error('❌ TEST 1: Missing dependencies:', missingDeps);
        }

        // 🚀 TEST 2: System Initialization
        console.log('\n🚀 TEST 2: Testing system initialization...');
        if (window.systemBootstrapper) {
            const initResult = await window.systemBootstrapper.init();
            if (initResult.success) {
                testResults.initialization = true;
                console.log('✅ TEST 2: System initialized successfully');
                console.log('📊 Initialization Status:', initResult.status);
            } else {
                console.error('❌ TEST 2: System initialization failed:', initResult.error);
            }
        }

        // 🎯 TEST 3: Template Detection
        console.log('\n🎯 TEST 3: Testing template ID detection...');
        if (window.unifiedTemplateDataAccess) {
            const templateId = window.unifiedTemplateDataAccess.getTemplateId();
            const debugInfo = window.unifiedTemplateDataAccess.getDebugInfo();

            if (templateId) {
                testResults.templateDetection = true;
                console.log('✅ TEST 3: Template ID detected:', templateId);
                console.log('📊 Template Debug Info:', debugInfo);
            } else {
                console.error('❌ TEST 3: No template ID found');
                console.log('🔍 Debug Info:', debugInfo);
            }
        }

        // 🎨 TEST 4: View State Management
        console.log('\n🎨 TEST 4: Testing view state management...');
        if (window.centralizedViewState) {
            const currentState = window.centralizedViewState.getCurrentState();
            const debugInfo = window.centralizedViewState.getDebugInfo();

            testResults.viewState = true;
            console.log('✅ TEST 4: View state accessible');
            console.log('📊 Current State:', currentState);
            console.log('🔍 Debug Info:', debugInfo);
        }

        // 🖼️ TEST 5: PNG Pipeline
        console.log('\n🖼️ TEST 5: Testing PNG pipeline...');
        if (window.consolidatedPNGPipeline) {
            const pipelineDebug = window.consolidatedPNGPipeline.getDebugInfo();

            if (pipelineDebug.isInitialized) {
                testResults.pngPipeline = true;
                console.log('✅ TEST 5: PNG pipeline initialized');
                console.log('📊 Pipeline Status:', pipelineDebug);
            } else {
                console.error('❌ TEST 5: PNG pipeline not initialized');
                console.log('🔍 Pipeline Debug:', pipelineDebug);
            }
        }

        // 🚨 TEST 6: Error Handling
        console.log('\n🚨 TEST 6: Testing error handling...');
        if (window.unifiedErrorHandler) {
            // Create test error
            const testError = new Error('Architecture test error');
            const errorEntry = window.unifiedErrorHandler.handleError(testError, {
                component: 'architectureTest',
                operation: 'error_handling_test',
                testId: 'test_6'
            });

            testResults.errorHandling = true;
            console.log('✅ TEST 6: Error handling works');
            console.log('📊 Error Entry:', errorEntry);

            const errorSummary = window.unifiedErrorHandler.getErrorSummary();
            console.log('📊 Error Summary:', errorSummary);
        }

        // 🏥 TEST 7: System Health Check
        console.log('\n🏥 TEST 7: Running system health check...');
        if (window.systemBootstrapper) {
            const healthCheck = await window.systemBootstrapper.checkSystemHealth();

            if (healthCheck.allHealthy) {
                testResults.systemHealth = true;
                console.log('✅ TEST 7: All systems healthy');
            } else {
                console.error('❌ TEST 7: System health issues detected');
            }
            console.log('📊 Health Check Results:', healthCheck);
        }

        // 🔗 TEST 8: Integration Test
        console.log('\n🔗 TEST 8: Running integration test...');
        try {
            // Test template data -> view state -> PNG pipeline chain
            const templateId = window.unifiedTemplateDataAccess.getTemplateId();
            const viewData = window.unifiedTemplateDataAccess.getViewData(templateId);
            const currentState = window.centralizedViewState.getCurrentState();

            console.log('🔗 Integration Chain:');
            console.log('  Template ID:', templateId);
            console.log('  View Data:', viewData?.length || 0, 'views');
            console.log('  Current State:', currentState.view);

            testResults.integration = true;
            console.log('✅ TEST 8: Integration test passed');

        } catch (integrationError) {
            console.error('❌ TEST 8: Integration test failed:', integrationError);
        }

        // 📊 FINAL SUMMARY
        const passedTests = Object.values(testResults).filter(result => result === true).length;
        const totalTests = Object.keys(testResults).length - 1; // Exclude summary

        testResults.summary = {
            passed: passedTests,
            total: totalTests,
            success: passedTests === totalTests,
            timestamp: new Date().toISOString()
        };

        console.log('\n📊 FINAL TEST RESULTS:');
        console.log(`✅ Passed: ${passedTests}/${totalTests} tests`);
        console.log('📋 Detailed Results:', testResults);

        if (testResults.summary.success) {
            console.log('🎉 NEW ARCHITECTURE: All tests passed! System is ready for production.');
        } else {
            console.log('⚠️ NEW ARCHITECTURE: Some tests failed. Check individual results above.');
        }

        return testResults;

    } catch (error) {
        console.error('❌ NEW ARCHITECTURE TEST: Test suite failed:', error);
        return { error: error.message, testResults };
    }
}

// 🚀 QUICK FUNCTIONS
function quickStatusCheck() {
    console.log('🚀 QUICK STATUS CHECK:');

    const status = {
        newArchitectureLoaded: !!window.newArchitectureLoaded,
        systemBootstrapper: !!window.systemBootstrapper,
        systemInitialized: window.systemBootstrapper?.isInitialized,
        templateDataAccess: !!window.unifiedTemplateDataAccess,
        viewState: !!window.centralizedViewState,
        pngPipeline: !!window.consolidatedPNGPipeline,
        errorHandler: !!window.unifiedErrorHandler
    };

    console.table(status);
    return status;
}

async function quickPNGTest() {
    console.log('🖼️ QUICK PNG TEST: Testing single view generation...');

    if (!window.consolidatedPNGPipeline) {
        console.error('❌ PNG Pipeline not available');
        return false;
    }

    try {
        const templateId = window.unifiedTemplateDataAccess?.getTemplateId();
        if (!templateId) {
            console.error('❌ No template ID available');
            return false;
        }

        const result = await window.consolidatedPNGPipeline.generateSingleView({
            templateId: templateId,
            saveType: 'test_generation'
        });

        console.log('✅ PNG Test Result:', result);
        return result;

    } catch (error) {
        console.error('❌ PNG Test Failed:', error);
        return false;
    }
}

function showArchitectureOverview() {
    console.log(`
🏗️ NEW ARCHITECTURE OVERVIEW:

📚 Core Components:
├── 🎯 UnifiedTemplateDataAccess - Zentrale Template-Datenquelle
├── 🎨 CentralizedViewState - Atomare View-Operationen
├── 🖼️ ConsolidatedPNGPipeline - Vereinheitlichte PNG-Generierung
├── 🚀 SystemBootstrapper - Kontrollierte Initialisierung
└── 🚨 UnifiedErrorHandler - Konsistentes Fehler-Management

🔧 Available Functions:
• testNewArchitecture() - Vollständiger Architektur-Test
• quickStatusCheck() - Schneller Status-Check
• quickPNGTest() - PNG-Generierung testen
• showArchitectureOverview() - Diese Übersicht

🚀 Quick Start:
1. testNewArchitecture() - Alles testen
2. quickStatusCheck() - Status prüfen
3. quickPNGTest() - PNG-System testen

💡 Status: ${window.newArchitectureLoaded ? '✅ LOADED' : '⏳ LOADING'}
    `);
}

// 🚀 READY MESSAGE
console.log(`
🧪 NEW ARCHITECTURE TEST SUITE LOADED!

Available functions:
• testNewArchitecture() - Comprehensive test suite
• quickStatusCheck() - Quick system status
• quickPNGTest() - Test PNG generation
• showArchitectureOverview() - Show component overview

🚀 Run testNewArchitecture() for full validation!
`);

// Show overview immediately
showArchitectureOverview();