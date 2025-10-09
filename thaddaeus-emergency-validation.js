/**
 * 🚨 THADDÄUS EMERGENCY VALIDATION SCRIPT
 * 4-Phase comprehensive testing of emergency coordinate system fixes
 */

(function() {
    'use strict';

    console.log('🚨 THADDÄUS EMERGENCY VALIDATION: Starting comprehensive testing...');

    /**
     * 🎯 PHASE 1: THADDÄUS Function Loading Validation
     */
    function phase1_validateThaddaeusFunctionLoading() {
        console.log('\n🎯 PHASE 1: THADDÄUS Function Loading Validation');
        console.log('=====================================');

        const results = {
            logFunctionExists: typeof window.logCoordinateSystemOutput === 'function',
            functionCallable: false,
            testOutput: null
        };

        // Test function existence
        console.log('🔍 logCoordinateSystemOutput function exists:', results.logFunctionExists);

        // Test function execution
        if (results.logFunctionExists) {
            try {
                window.logCoordinateSystemOutput('THADDÄUS-TEST-SYSTEM', {
                    elements: [{x: 100, y: 200, type: 'test'}],
                    test: true,
                    timestamp: new Date().toISOString()
                });
                results.functionCallable = true;
                console.log('✅ THADDÄUS Function Test: logCoordinateSystemOutput executed successfully');
            } catch (error) {
                console.error('❌ THADDÄUS Function Test: Error calling logCoordinateSystemOutput:', error);
            }
        } else {
            console.error('❌ CRITICAL: logCoordinateSystemOutput function not loaded!');
        }

        return results;
    }

    /**
     * 🎨 PHASE 2: Canvas Detection Emergency Validation
     */
    function phase2_validateCanvasDetection() {
        console.log('\n🎨 PHASE 2: Canvas Detection Emergency Validation');
        console.log('===========================================');

        const results = {
            domCanvases: document.querySelectorAll('canvas').length,
            fabricAvailable: typeof window.fabric !== 'undefined',
            fabricCanvas: !!window.fabricCanvas,
            designerInstance: !!window.designerWidgetInstance,
            optimizedInstance: !!window.optimizedCaptureInstance,
            emergencyForceDetection: false
        };

        console.log('🔍 DOM Canvas Elements:', results.domCanvases);
        console.log('🔍 Fabric.js Available:', results.fabricAvailable);
        console.log('🔍 Global fabricCanvas:', results.fabricCanvas);
        console.log('🔍 Designer Instance:', results.designerInstance);
        console.log('🔍 Optimized Instance:', results.optimizedInstance);

        // Test emergency force canvas detection if optimized instance exists
        if (results.optimizedInstance && window.optimizedCaptureInstance.forceCanvasDetection) {
            try {
                console.log('🚨 Testing emergency forceCanvasDetection...');
                const forceResult = window.optimizedCaptureInstance.forceCanvasDetection();
                results.emergencyForceDetection = forceResult;
                console.log('✅ Emergency Force Detection Result:', forceResult);
            } catch (error) {
                console.error('❌ Emergency Force Detection Error:', error);
            }
        }

        return results;
    }

    /**
     * 🎯 PHASE 3: Coordinate Systems Comprehensive Test
     */
    function phase3_validateCoordinateSystems() {
        console.log('\n🎯 PHASE 3: Coordinate Systems Comprehensive Test');
        console.log('===============================================');

        const systems = [
            {
                name: 'Global Function',
                test: () => typeof window.generateDesignData === 'function' ? window.generateDesignData() : null,
                exists: typeof window.generateDesignData === 'function'
            },
            {
                name: 'YPrint Coordinate Capture',
                test: () => window.YPrintTools?.CoordinateCapture?.generateDesignData ? window.YPrintTools.CoordinateCapture.generateDesignData() : null,
                exists: !!(window.YPrintTools?.CoordinateCapture?.generateDesignData)
            },
            {
                name: 'Production Ready',
                test: () => window.ProductionReadyDesignDataCapture?.generateDesignData ? window.ProductionReadyDesignDataCapture.generateDesignData() : null,
                exists: !!(window.ProductionReadyDesignDataCapture?.generateDesignData)
            },
            {
                name: 'Optimized',
                test: () => window.OptimizedDesignDataCapture?.generateDesignData ? window.OptimizedDesignDataCapture.generateDesignData() : null,
                exists: !!(window.OptimizedDesignDataCapture?.generateDesignData)
            }
        ];

        const results = {};

        systems.forEach(system => {
            console.log(`\n🧪 Testing ${system.name}:`);
            console.log(`   Exists: ${system.exists}`);

            results[system.name] = {
                exists: system.exists,
                executable: false,
                data: null,
                error: null
            };

            if (system.exists) {
                try {
                    const data = system.test();
                    results[system.name].executable = true;
                    results[system.name].data = data;

                    if (data && data.elements) {
                        console.log(`   ✅ Executed successfully - ${data.elements.length} elements`);
                    } else if (data && data.error) {
                        console.log(`   ⚠️ Executed with error: ${data.message || 'Unknown error'}`);
                    } else {
                        console.log(`   ✅ Executed successfully - data:`, data);
                    }
                } catch (error) {
                    results[system.name].error = error.message;
                    console.log(`   ❌ Execution failed: ${error.message}`);
                }
            } else {
                console.log(`   ❌ System not available`);
            }
        });

        return results;
    }

    /**
     * 📢 PHASE 4: Event System Validation
     */
    function phase4_validateEventSystem() {
        console.log('\n📢 PHASE 4: Event System Validation');
        console.log('=================================');

        const results = {
            designerReadyListenerAttached: !!window.designerReadyListenerAttached,
            productionReadyListenerAttached: !!window.productionReadyListenerAttached,
            yprintReadyListenerAttached: !!window.yprintReadyListenerAttached,
            eventTest: false
        };

        console.log('🔍 Event Listener Flags:');
        console.log('   designerReady:', results.designerReadyListenerAttached);
        console.log('   productionReady:', results.productionReadyListenerAttached);
        console.log('   yprintReady:', results.yprintReadyListenerAttached);

        // Test event dispatching
        console.log('\n🧪 Testing designerReady event dispatch...');

        let eventReceived = false;
        const testListener = () => {
            eventReceived = true;
            console.log('✅ Test designerReady event received successfully');
        };

        document.addEventListener('designerReady', testListener, { once: true });

        // Dispatch test event
        const testEvent = new CustomEvent('designerReady', {
            detail: {
                instance: window.designerWidgetInstance || {
                    fabricCanvas: window.canvas || window.fabricCanvas,
                    test: true
                }
            }
        });

        document.dispatchEvent(testEvent);

        // Check if event was received (async check)
        setTimeout(() => {
            results.eventTest = eventReceived;
            console.log('📢 Event system test result:', eventReceived);
            document.removeEventListener('designerReady', testListener);
        }, 100);

        return results;
    }

    /**
     * 📊 GENERATE FINAL VALIDATION REPORT
     */
    function generateFinalReport(phase1, phase2, phase3, phase4) {
        console.log('\n📊 THADDÄUS EMERGENCY VALIDATION FINAL REPORT');
        console.log('=============================================');

        const overallStatus = {
            thaddaeusFunctionLoaded: phase1.logFunctionExists && phase1.functionCallable,
            canvasDetectionWorking: phase2.domCanvases > 0 && phase2.fabricAvailable,
            coordinateSystemsOperational: Object.values(phase3).some(system => system.executable),
            eventSystemWorking: phase4.designerReadyListenerAttached,
            emergencyFixesActive: phase2.emergencyForceDetection !== false
        };

        console.log('\n🎯 CRITICAL SYSTEMS STATUS:');
        console.log(`   THADDÄUS Function: ${overallStatus.thaddaeusFunctionLoaded ? '✅ OPERATIONAL' : '❌ FAILED'}`);
        console.log(`   Canvas Detection: ${overallStatus.canvasDetectionWorking ? '✅ OPERATIONAL' : '❌ FAILED'}`);
        console.log(`   Coordinate Systems: ${overallStatus.coordinateSystemsOperational ? '✅ OPERATIONAL' : '❌ FAILED'}`);
        console.log(`   Event System: ${overallStatus.eventSystemWorking ? '✅ OPERATIONAL' : '❌ FAILED'}`);
        console.log(`   Emergency Fixes: ${overallStatus.emergencyFixesActive ? '✅ ACTIVE' : '⚠️ INACTIVE'}`);

        const systemsWorking = Object.values(overallStatus).filter(Boolean).length;
        const totalSystems = Object.keys(overallStatus).length;

        console.log(`\n📈 OVERALL SYSTEM HEALTH: ${systemsWorking}/${totalSystems} systems operational`);

        if (systemsWorking === totalSystems) {
            console.log('🎉 ALL THADDÄUS EMERGENCY FIXES SUCCESSFUL!');
            console.log('🚀 Coordinate systems should now be fully operational.');
        } else {
            console.log('⚠️ Some systems still need attention:');
            Object.entries(overallStatus).forEach(([system, working]) => {
                if (!working) {
                    console.log(`   🔧 ${system}: Needs manual intervention`);
                }
            });
        }

        return overallStatus;
    }

    /**
     * 🚀 EXECUTE ALL VALIDATION PHASES
     */
    function executeEmergencyValidation() {
        console.log('🚨 THADDÄUS EMERGENCY VALIDATION: 4-Phase Testing Started');

        // Execute all phases
        const phase1Results = phase1_validateThaddaeusFunctionLoading();
        const phase2Results = phase2_validateCanvasDetection();
        const phase3Results = phase3_validateCoordinateSystems();
        const phase4Results = phase4_validateEventSystem();

        // Generate final report
        setTimeout(() => {
            const finalReport = generateFinalReport(phase1Results, phase2Results, phase3Results, phase4Results);

            // Make results globally available for debugging
            window.thaddaeusValidationResults = {
                phase1: phase1Results,
                phase2: phase2Results,
                phase3: phase3Results,
                phase4: phase4Results,
                final: finalReport
            };

            console.log('\n🔧 Results stored in: window.thaddaeusValidationResults');
        }, 200);
    }

    // Auto-execute validation after a short delay to allow page loading
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(executeEmergencyValidation, 1000);
        });
    } else {
        setTimeout(executeEmergencyValidation, 500);
    }

    // Expose manual execution function
    window.runThaddaeusValidation = executeEmergencyValidation;

    console.log('🚨 THADDÄUS Emergency Validation Script Loaded');
    console.log('🔧 Manual execution: window.runThaddaeusValidation()');

})();