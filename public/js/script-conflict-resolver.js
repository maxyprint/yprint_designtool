/**
 * 🔧 SCRIPT CONFLICT RESOLVER
 * Prevents duplicate variable declarations and script loading conflicts
 */

(function() {
    'use strict';

    // 🔧 GLOBAL NAMESPACE PROTECTION: Track registered globals to prevent conflicts
    const registeredGlobals = new Set();

    // 🔧 SAFE GLOBAL REGISTRATION: Prevent duplicate global variable declarations
    window.registerGlobal = function(name, value, source = 'unknown') {
        if (registeredGlobals.has(name)) {
            console.warn(`⚠️ CONFLICT RESOLVER: Global '${name}' already registered. Skipping duplicate from ${source}.`);
            return false;
        }

        registeredGlobals.add(name);
        window[name] = value;
        console.log(`✅ CONFLICT RESOLVER: Registered global '${name}' from ${source}`);
        return true;
    };

    // 🔧 SCRIPT LOADING STATE TRACKER: Prevent duplicate script loads
    const loadedScripts = new Set();

    window.markScriptLoaded = function(scriptName, source = 'unknown') {
        if (loadedScripts.has(scriptName)) {
            console.warn(`⚠️ CONFLICT RESOLVER: Script '${scriptName}' already loaded. Preventing duplicate from ${source}.`);
            return false;
        }

        loadedScripts.add(scriptName);
        console.log(`✅ CONFLICT RESOLVER: Marked script '${scriptName}' as loaded from ${source}`);
        return true;
    };

    window.isScriptLoaded = function(scriptName) {
        return loadedScripts.has(scriptName);
    };

    // 🔧 FABRIC.JS SINGLETON PROTECTION
    let fabricLoaded = false;

    window.ensureFabricSingleton = function(fabricInstance, source = 'unknown') {
        if (fabricLoaded && window.fabric) {
            console.warn(`⚠️ CONFLICT RESOLVER: Fabric.js already loaded. Ignoring duplicate from ${source}.`);
            return window.fabric;
        }

        if (fabricInstance && typeof fabricInstance.Canvas === 'function') {
            fabricLoaded = true;
            window.fabric = fabricInstance;
            console.log(`✅ CONFLICT RESOLVER: Fabric.js singleton established from ${source}`);
            return fabricInstance;
        }

        console.error(`❌ CONFLICT RESOLVER: Invalid fabric instance from ${source}`);
        return null;
    };

    // 🔧 VARIABLE CONFLICT DETECTION
    const originalDefineProperty = Object.defineProperty;
    const originalAssignment = window;

    window.detectVariableConflicts = function() {
        const conflicts = [];

        // Check for common conflicting variables
        const commonConflicts = [
            'fabricJSLoaded', 'pngIntegration', 'designDataCapture',
            'canvasInitializer', 'highDPIEngine', 'saveOnlyPNG'
        ];

        commonConflicts.forEach(varName => {
            const descriptors = [];
            let obj = window;

            while (obj) {
                const descriptor = Object.getOwnPropertyDescriptor(obj, varName);
                if (descriptor) {
                    descriptors.push({
                        object: obj === window ? 'window' : obj.constructor.name,
                        descriptor: descriptor
                    });
                }
                obj = Object.getPrototypeOf(obj);
            }

            if (descriptors.length > 1) {
                conflicts.push({
                    variable: varName,
                    sources: descriptors
                });
            }
        });

        if (conflicts.length > 0) {
            console.warn('⚠️ CONFLICT RESOLVER: Variable conflicts detected:', conflicts);
        } else {
            console.log('✅ CONFLICT RESOLVER: No variable conflicts detected');
        }

        return conflicts;
    };

    // 🔧 SAFE SCRIPT EXECUTION: Wrap script execution to catch conflicts
    window.safeExecute = function(scriptFunction, scriptName, context = {}) {
        try {
            if (!window.markScriptLoaded(scriptName, 'safeExecute')) {
                console.warn(`⚠️ CONFLICT RESOLVER: Skipping duplicate execution of ${scriptName}`);
                return false;
            }

            const result = scriptFunction.call(context);
            console.log(`✅ CONFLICT RESOLVER: Successfully executed ${scriptName}`);
            return result;

        } catch (error) {
            if (error.message.includes('already been declared')) {
                console.error(`❌ CONFLICT RESOLVER: Variable conflict in ${scriptName}:`, error.message);

                // Try to clean up and retry
                window.cleanupConflictingVariables(scriptName);

                try {
                    const retryResult = scriptFunction.call(context);
                    console.log(`✅ CONFLICT RESOLVER: Successfully executed ${scriptName} after cleanup`);
                    return retryResult;
                } catch (retryError) {
                    console.error(`❌ CONFLICT RESOLVER: Failed to execute ${scriptName} even after cleanup:`, retryError);
                    return false;
                }
            } else {
                console.error(`❌ CONFLICT RESOLVER: Error executing ${scriptName}:`, error);
                return false;
            }
        }
    };

    // 🔧 CONFLICT CLEANUP: Remove conflicting variables
    window.cleanupConflictingVariables = function(scriptName) {
        console.log(`🧹 CONFLICT RESOLVER: Cleaning up conflicts for ${scriptName}`);

        // Reset common conflicting globals
        const cleanupTargets = [
            'fabricJSLoaded', 'pngIntegrationLoaded', 'designDataCaptureLoaded'
        ];

        cleanupTargets.forEach(target => {
            if (window.hasOwnProperty(target)) {
                try {
                    delete window[target];
                    console.log(`🧹 CONFLICT RESOLVER: Cleaned up ${target}`);
                } catch (error) {
                    console.warn(`⚠️ CONFLICT RESOLVER: Could not clean up ${target}:`, error.message);
                }
            }
        });
    };

    // 🔧 INITIALIZATION GUARD: Prevent multiple initializations
    const initializedSystems = new Set();

    window.guardedInitialize = function(systemName, initFunction, force = false) {
        if (!force && initializedSystems.has(systemName)) {
            console.warn(`⚠️ CONFLICT RESOLVER: System '${systemName}' already initialized. Skipping.`);
            return false;
        }

        try {
            const result = initFunction();
            initializedSystems.add(systemName);
            console.log(`✅ CONFLICT RESOLVER: Successfully initialized ${systemName}`);
            return result;
        } catch (error) {
            console.error(`❌ CONFLICT RESOLVER: Failed to initialize ${systemName}:`, error);
            return false;
        }
    };

    // 🔧 SYSTEM STATUS REPORTING
    window.getConflictResolverStatus = function() {
        return {
            registeredGlobals: Array.from(registeredGlobals),
            loadedScripts: Array.from(loadedScripts),
            initializedSystems: Array.from(initializedSystems),
            fabricLoaded: fabricLoaded,
            conflictCount: window.detectVariableConflicts().length,
            timestamp: new Date().toISOString()
        };
    };

    // 🔧 AUTO-DETECTION: Run conflict detection periodically
    let conflictCheckInterval;

    window.startConflictMonitoring = function(intervalMs = 5000) {
        if (conflictCheckInterval) {
            clearInterval(conflictCheckInterval);
        }

        conflictCheckInterval = setInterval(() => {
            const conflicts = window.detectVariableConflicts();
            if (conflicts.length > 0) {
                console.warn(`⚠️ CONFLICT RESOLVER: Periodic check found ${conflicts.length} conflicts`);
            }
        }, intervalMs);

        console.log(`✅ CONFLICT RESOLVER: Started conflict monitoring (${intervalMs}ms intervals)`);
    };

    window.stopConflictMonitoring = function() {
        if (conflictCheckInterval) {
            clearInterval(conflictCheckInterval);
            conflictCheckInterval = null;
            console.log('✅ CONFLICT RESOLVER: Stopped conflict monitoring');
        }
    };

    // 🔧 GLOBAL EXPOSURE
    console.log('✅ CONFLICT RESOLVER: Script conflict resolver initialized');

    // Auto-start monitoring in debug mode
    if (window.WP_DEBUG || window.octo_print_designer_config?.debug_mode) {
        window.startConflictMonitoring(3000);
    }

})();