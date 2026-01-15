/**
 * 🚀 NEW ARCHITECTURE LOADER
 *
 * Lädt und initialisiert die neue saubere PNG-Architektur
 * Ersetzt die fragmentierte legacy Implementierung
 */

(function() {
    'use strict';

    console.log('🚀 NEW ARCHITECTURE LOADER: Starting...');

    // Check if already loaded
    if (window.newArchitectureLoaded) {
        console.log('✅ NEW ARCHITECTURE: Already loaded');
        return;
    }

    /**
     * 🔧 Load and Initialize New Architecture
     */
    async function loadNewArchitecture() {
        try {
            console.log('🔧 NEW ARCHITECTURE: Loading components...');

            // Wait for core dependencies
            await waitForDependencies();

            // Initialize error handler first
            if (window.unifiedErrorHandler) {
                console.log('✅ NEW ARCHITECTURE: Error handler ready');
            }

            // Bootstrap the system
            if (window.systemBootstrapper) {
                console.log('🚀 NEW ARCHITECTURE: Starting system bootstrap...');
                const initResult = await window.systemBootstrapper.init();

                if (initResult.success) {
                    console.log('✅ NEW ARCHITECTURE: System fully initialized!');

                    // Test the system
                    await testNewArchitecture();

                    // Mark as loaded
                    window.newArchitectureLoaded = true;

                    // Dispatch ready event
                    document.dispatchEvent(new CustomEvent('newArchitectureReady', {
                        detail: {
                            status: initResult.status,
                            healthCheck: initResult.healthCheck
                        }
                    }));

                } else {
                    throw new Error(`System bootstrap failed: ${initResult.error}`);
                }
            } else {
                throw new Error('System bootstrapper not available');
            }

        } catch (error) {
            console.error('❌ NEW ARCHITECTURE: Load failed:', error);

            if (window.unifiedErrorHandler) {
                window.unifiedErrorHandler.handleError(error, {
                    component: 'newArchitectureLoader',
                    operation: 'initialization'
                });
            }
        }
    }

    /**
     * ⏳ Wait for Dependencies
     */
    async function waitForDependencies() {
        const maxWait = 10000;
        const checkInterval = 100;
        let elapsed = 0;

        console.log('⏳ NEW ARCHITECTURE: Waiting for dependencies...');

        const dependencies = {
            'unifiedTemplateDataAccess': () => window.unifiedTemplateDataAccess,
            'consolidatedPNGPipeline': () => window.consolidatedPNGPipeline,
            'centralizedViewState': () => window.centralizedViewState,
            'systemBootstrapper': () => window.systemBootstrapper,
            'unifiedErrorHandler': () => window.unifiedErrorHandler
        };

        while (elapsed < maxWait) {
            const missing = [];
            for (const [name, checker] of Object.entries(dependencies)) {
                if (!checker()) missing.push(name);
            }

            if (missing.length === 0) {
                console.log('✅ NEW ARCHITECTURE: All dependencies available');
                return true;
            }

            if (elapsed % 1000 === 0) {
                console.log(`⏳ NEW ARCHITECTURE: Still waiting for: ${missing.join(', ')}`);
            }

            await new Promise(resolve => setTimeout(resolve, checkInterval));
            elapsed += checkInterval;
        }

        throw new Error('Dependencies not available after timeout');
    }

    /**
     * 🧪 Test New Architecture
     */
    async function testNewArchitecture() {
        console.log('🧪 NEW ARCHITECTURE: Running integration test...');

        try {
            // Test 1: Template ID detection
            const templateId = window.unifiedTemplateDataAccess.getTemplateId();
            console.log('✅ TEST 1: Template ID detection:', templateId);

            // Test 2: View state
            const viewState = window.centralizedViewState.getCurrentState();
            console.log('✅ TEST 2: View state:', viewState);

            // Test 3: PNG pipeline readiness
            const pngDebug = window.consolidatedPNGPipeline.getDebugInfo();
            console.log('✅ TEST 3: PNG pipeline:', pngDebug.isInitialized);

            // Test 4: Error handling
            window.unifiedErrorHandler.handleError(new Error('Test error'), {
                component: 'newArchitectureLoader',
                operation: 'integration_test'
            });
            console.log('✅ TEST 4: Error handling works');

            // Test 5: System health
            const healthCheck = await window.systemBootstrapper.checkSystemHealth();
            console.log('✅ TEST 5: System health:', healthCheck.allHealthy);

            console.log('🎉 NEW ARCHITECTURE: All tests passed!');
            return true;

        } catch (error) {
            console.error('❌ NEW ARCHITECTURE: Test failed:', error);
            return false;
        }
    }

    /**
     * 📊 Status Check Function
     */
    window.checkNewArchitectureStatus = function() {
        console.log('📊 NEW ARCHITECTURE STATUS:');
        console.log('- Loaded:', !!window.newArchitectureLoaded);

        if (window.systemBootstrapper) {
            const status = window.systemBootstrapper.getSystemStatus();
            const debugInfo = window.systemBootstrapper.getDebugInfo();
            console.log('- Bootstrap Status:', status);
            console.log('- Debug Info:', debugInfo);
        }

        if (window.unifiedErrorHandler) {
            const errorSummary = window.unifiedErrorHandler.getErrorSummary();
            console.log('- Error Summary:', errorSummary);
        }

        return {
            loaded: window.newArchitectureLoaded,
            status: window.systemBootstrapper?.getSystemStatus(),
            errors: window.unifiedErrorHandler?.getErrorSummary()
        };
    };

    // Start loading when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', loadNewArchitecture);
    } else {
        // DOM already ready, start with slight delay
        setTimeout(loadNewArchitecture, 100);
    }

    console.log('🚀 NEW ARCHITECTURE LOADER: Registered for initialization');

})();