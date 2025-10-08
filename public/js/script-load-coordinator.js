/**
 * 🎯 SCRIPT LOAD COORDINATOR - Issue #123 Solution
 *
 * CRITICAL PURPOSE: Ensures proper loading order for canvas initialization scripts
 * Prevents race conditions between fabric.js loading and canvas initialization
 */

(function(global) {
    'use strict';

    console.log('🚀 SCRIPT COORDINATOR: Initializing script load coordination');

    // Prevent multiple coordinators
    if (global.scriptLoadCoordinator) {
        console.log('✅ SCRIPT COORDINATOR: Already active');
        return global.scriptLoadCoordinator;
    }

    /**
     * Script Load Coordinator Class
     */
    class ScriptLoadCoordinator {
        constructor() {
            this.loadedScripts = new Set();
            this.pendingCallbacks = [];
            this.initializationPhase = 'starting';
            this.requiredScripts = [
                'vendor.bundle.js',
                'designer.bundle.js',
                'fabric-global-exposer.js',
                'emergency-fabric-loader.js',
                'fabric-canvas-singleton.js',
                'canvas-creation-blocker.js',
                'canvas-initialization-controller.js'
            ];

            this.scriptLoadPromises = new Map();

            console.log('🚀 SCRIPT COORDINATOR: Coordinator initialized');
            this.startCoordination();
        }

        /**
         * Start the coordination process
         */
        async startCoordination() {
            console.log('🔄 SCRIPT COORDINATOR: Starting coordinated loading process');
            this.initializationPhase = 'loading';

            try {
                // Phase 1: Wait for vendor bundle (contains fabric.js)
                await this.waitForVendorBundle();

                // Phase 2: Initialize fabric exposure and singleton wrapper
                await this.initializeFabricSystems();

                // Phase 2.5: 🚨 VALIDATE CANVAS CREATION BLOCKER
                await this.validateCanvasBlocker();

                // Phase 3: Initialize canvas controller
                await this.initializeCanvasController();

                // Phase 4: Signal ready for designer initialization
                this.signalReadyForDesigner();

                console.log('✅ SCRIPT COORDINATOR: All phases completed successfully');
                this.initializationPhase = 'completed';

            } catch (error) {
                console.error('❌ SCRIPT COORDINATOR: Coordination failed:', error);
                this.initializationPhase = 'failed';
                this.signalFailure(error);
            }
        }

        /**
         * Wait for vendor bundle to load
         */
        async waitForVendorBundle() {
            console.log('⏳ SCRIPT COORDINATOR: Phase 1 - Waiting for vendor bundle');

            return new Promise((resolve) => {
                const checkVendorBundle = () => {
                    // Check for webpack chunks
                    if (global.webpackChunkocto_print_designer || global.__webpack_require__) {
                        console.log('✅ SCRIPT COORDINATOR: Vendor bundle detected');
                        resolve();
                        return;
                    }

                    // Check for script tags
                    const vendorScript = Array.from(document.scripts).find(script =>
                        script.src && script.src.includes('vendor.bundle.js')
                    );

                    if (vendorScript && vendorScript.readyState === 'complete') {
                        console.log('✅ SCRIPT COORDINATOR: Vendor script loaded');
                        resolve();
                        return;
                    }

                    // Continue checking
                    setTimeout(checkVendorBundle, 100);
                };

                checkVendorBundle();
            });
        }

        /**
         * Initialize fabric exposure and singleton systems
         */
        async initializeFabricSystems() {
            console.log('⏳ SCRIPT COORDINATOR: Phase 2 - Initializing fabric systems');

            // Wait for fabric to be exposed globally
            await this.waitForFabricExposure();

            // Wait for singleton wrapper to be applied
            await this.waitForSingletonWrapper();

            console.log('✅ SCRIPT COORDINATOR: Fabric systems initialized');
        }

        /**
         * Wait for fabric.js to be exposed globally
         */
        async waitForFabricExposure() {
            return new Promise((resolve) => {
                const checkFabric = () => {
                    if (global.fabric && typeof global.fabric.Canvas === 'function') {
                        console.log('✅ SCRIPT COORDINATOR: fabric.js globally exposed');
                        resolve();
                        return;
                    }

                    setTimeout(checkFabric, 50);
                };

                // Listen for fabric ready events
                const handleFabricReady = () => {
                    console.log('✅ SCRIPT COORDINATOR: Received fabric ready event');
                    resolve();
                };

                document.addEventListener('fabricGloballyExposed', handleFabricReady, { once: true });
                document.addEventListener('fabricGlobalReady', handleFabricReady, { once: true });

                checkFabric();
            });
        }

        /**
         * Wait for singleton wrapper to be applied
         */
        async waitForSingletonWrapper() {
            return new Promise((resolve) => {
                const checkWrapper = () => {
                    if (global.fabric && global.fabric.Canvas && global.fabric.Canvas.__singletonWrapped) {
                        console.log('✅ SCRIPT COORDINATOR: Singleton wrapper applied');
                        resolve();
                        return;
                    }

                    setTimeout(checkWrapper, 50);
                };

                checkWrapper();
            });
        }

        /**
         * 🚨 HARD-LOCK VALIDATION: Check Canvas Creation Blocker
         */
        async validateCanvasBlocker() {
            console.log('🚫 SCRIPT COORDINATOR: Phase 2.5 - Validating Canvas Creation Blocker');

            return new Promise((resolve) => {
                const checkBlocker = () => {
                    // Check if blocker is active
                    if (typeof global.getCanvasHardLockStatus === 'function') {
                        const status = global.getCanvasHardLockStatus();
                        console.log('✅ SCRIPT COORDINATOR: Canvas Creation Blocker active:', status);

                        // Verify HARD-LOCK globals exist
                        if (typeof global.__FABRIC_CANVAS_LOCKED__ !== 'undefined') {
                            console.log('✅ SCRIPT COORDINATOR: HARD-LOCK mechanism confirmed');
                            resolve();
                            return;
                        }
                    }

                    setTimeout(checkBlocker, 50);
                };

                checkBlocker();
            });
        }

        /**
         * Initialize canvas controller
         */
        async initializeCanvasController() {
            console.log('⏳ SCRIPT COORDINATOR: Phase 3 - Initializing canvas controller');

            return new Promise((resolve) => {
                const checkController = () => {
                    if (global.canvasInitializationController) {
                        console.log('✅ SCRIPT COORDINATOR: Canvas controller ready');
                        resolve();
                        return;
                    }

                    setTimeout(checkController, 50);
                };

                checkController();
            });
        }

        /**
         * Signal ready for designer initialization
         */
        signalReadyForDesigner() {
            console.log('🎉 SCRIPT COORDINATOR: System ready for designer initialization');

            // Dispatch ready event
            const readyEvent = new CustomEvent('canvasSystemReady', {
                detail: {
                    coordinator: this,
                    fabricReady: !!(global.fabric && global.fabric.Canvas),
                    singletonReady: !!(global.fabric && global.fabric.Canvas && global.fabric.Canvas.__singletonWrapped),
                    controllerReady: !!global.canvasInitializationController,
                    timestamp: Date.now()
                }
            });

            document.dispatchEvent(readyEvent);

            // Set global flag
            global.canvasSystemReady = true;

            // Execute pending callbacks
            this.pendingCallbacks.forEach(callback => {
                try {
                    callback(true);
                } catch (error) {
                    console.error('Error in coordinator callback:', error);
                }
            });
            this.pendingCallbacks = [];
        }

        /**
         * Signal system failure
         */
        signalFailure(error) {
            console.error('❌ SCRIPT COORDINATOR: System initialization failed');

            const failureEvent = new CustomEvent('canvasSystemFailed', {
                detail: { error: error.message, coordinator: this }
            });

            document.dispatchEvent(failureEvent);

            // Execute pending callbacks with failure
            this.pendingCallbacks.forEach(callback => {
                try {
                    callback(false, error);
                } catch (callbackError) {
                    console.error('Error in coordinator failure callback:', callbackError);
                }
            });
            this.pendingCallbacks = [];
        }

        /**
         * Wait for system to be ready
         */
        waitForSystemReady() {
            return new Promise((resolve, reject) => {
                if (this.initializationPhase === 'completed') {
                    resolve(true);
                    return;
                }

                if (this.initializationPhase === 'failed') {
                    reject(new Error('Canvas system initialization failed'));
                    return;
                }

                this.pendingCallbacks.push((success, error) => {
                    if (success) {
                        resolve(true);
                    } else {
                        reject(error || new Error('Canvas system initialization failed'));
                    }
                });
            });
        }

        /**
         * Get coordination status
         */
        getStatus() {
            return {
                phase: this.initializationPhase,
                fabricReady: !!(global.fabric && global.fabric.Canvas),
                singletonReady: !!(global.fabric && global.fabric.Canvas && global.fabric.Canvas.__singletonWrapped),
                controllerReady: !!global.canvasInitializationController,
                systemReady: global.canvasSystemReady === true,
                loadedScripts: Array.from(this.loadedScripts),
                pendingCallbacks: this.pendingCallbacks.length
            };
        }
    }

    // Create coordinator instance
    const coordinator = new ScriptLoadCoordinator();

    // Global exposure
    global.scriptLoadCoordinator = coordinator;
    global.waitForCanvasSystem = () => coordinator.waitForSystemReady();
    global.getCanvasSystemStatus = () => coordinator.getStatus();

    console.log('🚀 SCRIPT COORDINATOR: Load coordinator active');

    return coordinator;

})(window);