/**
 * 🔧 EMERGENCY SYSTEM INTEGRATION PATCH
 *
 * This patch fixes the missing emergencyFabricDetection method and integrates
 * the comprehensive emergency response system with the existing YPrint codebase.
 */

(function() {
    'use strict';

    console.log('🔧 EMERGENCY SYSTEM INTEGRATION: Starting patch application...');

    /**
     * 🚨 FIX: Add missing emergencyFabricDetection method to OptimizedDesignDataCapture
     */
    function patchOptimizedDesignDataCapture() {
        if (window.OptimizedDesignDataCapture && window.OptimizedDesignDataCapture.prototype) {
            // Add the missing emergencyFabricDetection method
            window.OptimizedDesignDataCapture.prototype.emergencyFabricDetection = function() {
                console.log('🚨 EMERGENCY: emergencyFabricDetection method called');

                // Trigger comprehensive emergency system
                if (window.emergencyResponseSystem) {
                    return window.emergencyResponseSystem.triggerEmergency('fabric-detection-failure', {
                        source: 'optimized-design-data-capture',
                        method: 'emergencyFabricDetection',
                        instance: this
                    });
                }

                // Fallback implementation if emergency system not available
                console.log('🔧 Fallback: Attempting basic fabric detection...');

                // Check if fabric is now available
                if (typeof window.fabric !== 'undefined' && window.fabric.Canvas) {
                    console.log('✅ Fabric.js now available - attempting re-initialization');

                    // Reset initialization state
                    this.initialized = false;
                    this.status.fabricLoaded = true;

                    // Try immediate initialization
                    return this.attemptImmediateInitialization();
                }

                console.log('❌ Fabric.js still not available');
                return false;
            };

            console.log('✅ PATCH: emergencyFabricDetection method added to OptimizedDesignDataCapture');
        }

        // Also patch existing instances
        if (window.OptimizedDesignDataCaptureInstance) {
            window.OptimizedDesignDataCaptureInstance.emergencyFabricDetection = function() {
                console.log('🚨 INSTANCE: emergencyFabricDetection called on existing instance');

                if (window.emergencyResponseSystem) {
                    return window.emergencyResponseSystem.triggerEmergency('fabric-detection-failure', {
                        source: 'existing-instance',
                        instance: this
                    });
                }

                // Basic fallback
                if (typeof window.fabric !== 'undefined' && window.fabric.Canvas) {
                    this.initialized = false;
                    this.status.fabricLoaded = true;
                    return this.attemptImmediateInitialization();
                }

                return false;
            };

            console.log('✅ PATCH: emergencyFabricDetection method added to existing instance');
        }
    }

    /**
     * 🔌 INTEGRATE: Connect emergency system with existing error handlers
     */
    function integrateWithExistingErrorHandlers() {
        // Hook into existing handleInitializationFailure
        if (window.OptimizedDesignDataCapture && window.OptimizedDesignDataCapture.prototype.handleInitializationFailure) {
            const originalHandler = window.OptimizedDesignDataCapture.prototype.handleInitializationFailure;

            window.OptimizedDesignDataCapture.prototype.handleInitializationFailure = function() {
                console.log('🔌 INTEGRATION: Enhanced handleInitializationFailure called');

                // Trigger emergency system first
                if (window.emergencyResponseSystem) {
                    const emergencyHandled = window.emergencyResponseSystem.handleEmergency('initialization-failure', {
                        status: this.status,
                        retryCount: this.retryCount,
                        maxRetries: this.maxRetries,
                        source: 'optimized-design-data-capture'
                    }, {
                        instance: this,
                        userAgent: navigator.userAgent,
                        context: window.octoAdminContext || 'unknown'
                    });

                    // If emergency system handled it successfully, skip original handler
                    if (emergencyHandled) {
                        console.log('✅ Emergency system handled initialization failure');
                        return;
                    }
                }

                // Fall back to original handler
                console.log('🔄 Falling back to original handleInitializationFailure');
                return originalHandler.call(this);
            };

            console.log('✅ INTEGRATION: handleInitializationFailure enhanced with emergency system');
        }

        // Hook into fabric loading failures
        document.addEventListener('fabricLoadFailed', function(event) {
            console.log('🔌 INTEGRATION: fabricLoadFailed event intercepted');

            if (window.emergencyResponseSystem) {
                window.emergencyResponseSystem.handleEmergency('fabric-load-failed', event.detail || {}, {
                    source: 'fabric-loader',
                    timestamp: Date.now()
                });
            }
        });

        // Hook into canvas creation failures
        window.addEventListener('canvasCreationFailed', function(event) {
            console.log('🔌 INTEGRATION: canvasCreationFailed event intercepted');

            if (window.emergencyResponseSystem) {
                window.emergencyResponseSystem.handleEmergency('canvas-creation-failed', event.detail || {}, {
                    source: 'canvas-creator',
                    timestamp: Date.now()
                });
            }
        });

        console.log('✅ INTEGRATION: Connected with existing error handlers');
    }

    /**
     * 🎯 ENHANCE: Add emergency triggers to key failure points
     */
    function addEmergencyTriggers() {
        // Monitor for repeated generateDesignData failures
        let generateDataFailures = 0;
        const originalGenerateDesignData = window.generateDesignData;

        if (typeof originalGenerateDesignData === 'function') {
            window.generateDesignData = function() {
                try {
                    const result = originalGenerateDesignData.apply(this, arguments);

                    // Check if result indicates an error
                    if (result && (result.error || result.emergency_mode)) {
                        generateDataFailures++;

                        if (generateDataFailures >= 3 && window.emergencyResponseSystem) {
                            console.log('🎯 TRIGGER: Multiple generateDesignData failures detected');
                            window.emergencyResponseSystem.handleEmergency('repeated-generate-data-failures', {
                                failureCount: generateDataFailures,
                                lastResult: result
                            }, {
                                source: 'generate-design-data-monitor'
                            });
                        }
                    } else {
                        // Reset failure count on success
                        generateDataFailures = 0;
                    }

                    return result;
                } catch (error) {
                    generateDataFailures++;

                    if (window.emergencyResponseSystem) {
                        window.emergencyResponseSystem.handleEmergency('generate-data-exception', {
                            error: error.message,
                            stack: error.stack,
                            failureCount: generateDataFailures
                        }, {
                            source: 'generate-design-data-exception'
                        });
                    }

                    throw error;
                }
            };

            console.log('✅ ENHANCE: generateDesignData monitoring added');
        }

        // Monitor for fabric canvas creation failures
        if (window.fabric && window.fabric.Canvas) {
            const originalCanvas = window.fabric.Canvas;

            window.fabric.Canvas = function() {
                try {
                    return new originalCanvas(...arguments);
                } catch (error) {
                    console.error('🎯 TRIGGER: Fabric Canvas creation failed');

                    if (window.emergencyResponseSystem) {
                        window.emergencyResponseSystem.handleEmergency('fabric-canvas-creation-failed', {
                            error: error.message,
                            stack: error.stack,
                            arguments: Array.from(arguments)
                        }, {
                            source: 'fabric-canvas-constructor'
                        });
                    }

                    throw error;
                }
            };

            // Copy prototype and static methods
            window.fabric.Canvas.prototype = originalCanvas.prototype;
            Object.setPrototypeOf(window.fabric.Canvas, originalCanvas);

            console.log('✅ ENHANCE: Fabric Canvas monitoring added');
        }
    }

    /**
     * 💡 PROVIDE: Emergency recovery UI for manual intervention
     */
    function createEmergencyRecoveryUI() {
        // Create floating emergency controls
        const controlPanel = document.createElement('div');
        controlPanel.id = 'emergency-control-panel';
        controlPanel.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            z-index: 9999;
            min-width: 200px;
            display: none;
        `;

        controlPanel.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px;">🚨 Emergency Controls</div>
            <button id="emergency-diagnose" style="width: 100%; margin: 2px 0; padding: 4px; background: #2196F3; color: white; border: none; border-radius: 3px; cursor: pointer;">Diagnose System</button>
            <button id="emergency-force-recovery" style="width: 100%; margin: 2px 0; padding: 4px; background: #FF9800; color: white; border: none; border-radius: 3px; cursor: pointer;">Force Recovery</button>
            <button id="emergency-reset" style="width: 100%; margin: 2px 0; padding: 4px; background: #F44336; color: white; border: none; border-radius: 3px; cursor: pointer;">Emergency Reset</button>
            <button id="emergency-hide" style="width: 100%; margin: 2px 0; padding: 4px; background: #555; color: white; border: none; border-radius: 3px; cursor: pointer;">Hide Panel</button>
        `;

        document.body.appendChild(controlPanel);

        // Add event listeners
        document.getElementById('emergency-diagnose').addEventListener('click', function() {
            console.log('🔍 EMERGENCY DIAGNOSIS:');
            console.log('Emergency System Status:', window.emergencyResponseSystem ? window.emergencyResponseSystem.getSystemStatus() : 'Not available');
            console.log('Fabric Available:', typeof window.fabric !== 'undefined');
            console.log('Canvas Elements:', document.querySelectorAll('canvas').length);
            console.log('OptimizedCapture Instance:', !!window.OptimizedDesignDataCaptureInstance);

            alert('Diagnosis complete - check console for details');
        });

        document.getElementById('emergency-force-recovery').addEventListener('click', function() {
            if (window.emergencyResponseSystem) {
                window.emergencyResponseSystem.triggerEmergency('manual-force-recovery', {
                    source: 'user-intervention',
                    timestamp: Date.now()
                });
            } else {
                alert('Emergency system not available');
            }
        });

        document.getElementById('emergency-reset').addEventListener('click', function() {
            if (confirm('Are you sure you want to reset the emergency system? This will reload the page.')) {
                localStorage.setItem('emergency_reset_triggered', Date.now());
                location.reload();
            }
        });

        document.getElementById('emergency-hide').addEventListener('click', function() {
            controlPanel.style.display = 'none';
        });

        // Show panel on key combination (Ctrl+Shift+E)
        document.addEventListener('keydown', function(event) {
            if (event.ctrlKey && event.shiftKey && event.key === 'E') {
                controlPanel.style.display = controlPanel.style.display === 'none' ? 'block' : 'none';
                console.log('🎛️ Emergency control panel toggled');
            }
        });

        console.log('💡 PROVIDE: Emergency recovery UI created (Ctrl+Shift+E to toggle)');
    }

    /**
     * 📊 MONITOR: System health and early warning
     */
    function setupSystemHealthMonitoring() {
        let healthCheckInterval;
        let consecutiveFailures = 0;

        function performHealthCheck() {
            const health = {
                timestamp: Date.now(),
                fabric: typeof window.fabric !== 'undefined',
                canvas: document.querySelectorAll('canvas').length > 0,
                designerInstance: !!window.OptimizedDesignDataCaptureInstance,
                emergencySystem: !!window.emergencyResponseSystem
            };

            const issuesFound = Object.values(health).filter(v => v === false).length;

            if (issuesFound > 0) {
                consecutiveFailures++;
                console.warn(`⚠️ HEALTH CHECK: ${issuesFound} issues found (${consecutiveFailures} consecutive)`, health);

                // Trigger early warning after 3 consecutive failures
                if (consecutiveFailures >= 3 && window.emergencyResponseSystem) {
                    window.emergencyResponseSystem.handleEmergency('health-check-degradation', {
                        health,
                        consecutiveFailures,
                        issuesFound
                    }, {
                        source: 'health-monitor'
                    });
                }
            } else {
                consecutiveFailures = 0;
            }

            return health;
        }

        // Start monitoring
        healthCheckInterval = setInterval(performHealthCheck, 30000); // Check every 30 seconds

        // Perform initial check
        setTimeout(performHealthCheck, 2000);

        console.log('📊 MONITOR: System health monitoring started');

        // Return cleanup function
        return () => {
            if (healthCheckInterval) {
                clearInterval(healthCheckInterval);
            }
        };
    }

    /**
     * 🚀 MAIN INITIALIZATION
     */
    function initializeEmergencyIntegration() {
        console.log('🚀 EMERGENCY INTEGRATION: Starting initialization...');

        // Wait for emergency response system to be available
        const waitForEmergencySystem = () => {
            if (window.emergencyResponseSystem) {
                console.log('✅ Emergency response system detected');

                // Apply all patches and integrations
                patchOptimizedDesignDataCapture();
                integrateWithExistingErrorHandlers();
                addEmergencyTriggers();
                createEmergencyRecoveryUI();
                setupSystemHealthMonitoring();

                console.log('🎉 EMERGENCY INTEGRATION: Complete and operational');

                // Test the integration
                setTimeout(() => {
                    console.log('🧪 INTEGRATION TEST: Testing emergency system...');
                    // This should not trigger an actual emergency, just test the plumbing
                    if (window.emergencyResponseSystem.getSystemStatus) {
                        console.log('🧪 Emergency system status:', window.emergencyResponseSystem.getSystemStatus());
                    }
                }, 1000);

            } else {
                console.log('⏳ Waiting for emergency response system...');
                setTimeout(waitForEmergencySystem, 100);
            }
        };

        waitForEmergencySystem();
    }

    // Start integration when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeEmergencyIntegration);
    } else {
        // Start immediately if DOM is already ready
        setTimeout(initializeEmergencyIntegration, 100);
    }

    console.log('🔧 EMERGENCY SYSTEM INTEGRATION PATCH: Loaded and ready');

})();