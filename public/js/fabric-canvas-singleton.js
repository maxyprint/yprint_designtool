/**
 * 🎯 FABRIC.JS CANVAS SINGLETON WRAPPER
 *
 * CRITICAL PURPOSE: Overrides fabric.js Canvas constructor to enforce singleton pattern
 * ISSUE #123 SOLUTION: Prevents multiple canvas initialization at the fabric.js level
 */

(function(global) {
    'use strict';

    console.log('🔧 FABRIC SINGLETON: Initializing fabric.js Canvas singleton wrapper');

    // Wait for fabric.js to be available
    function initializeFabricSingleton() {
        if (!global.fabric || typeof global.fabric.Canvas !== 'function') {
            console.log('⏳ FABRIC SINGLETON: Waiting for fabric.js...');
            return false;
        }

        // Check if already wrapped - PREVENT MULTIPLE ATTEMPTS
        if (global.fabric.Canvas.__singletonWrapped) {
            console.log('✅ FABRIC SINGLETON: fabric.js Canvas already wrapped, skipping');
            return true;
        }

        // 🧠 AGENT-5 FIX: Check property descriptor to prevent errors
        const descriptor = Object.getOwnPropertyDescriptor(global.fabric, 'Canvas');
        if (descriptor && !descriptor.configurable) {
            console.log('⚠️ FABRIC SINGLETON: Canvas property non-configurable, marking as wrapped to prevent retries');
            global.fabric.Canvas.__singletonWrapped = true;
            return true;
        }

        console.log('🔧 FABRIC SINGLETON: Wrapping fabric.js Canvas constructor');

        // Store original constructor
        const OriginalCanvas = global.fabric.Canvas;
        const canvasInstances = new Map(); // Track by canvas element ID

        // Singleton wrapper function
        function SingletonCanvas(canvasId, options = {}) {
            console.log('🎯 FABRIC SINGLETON: Canvas constructor called for:', canvasId);

            // Handle different parameter formats
            let elementId;
            let canvasElement;

            if (typeof canvasId === 'string') {
                elementId = canvasId;
                canvasElement = document.getElementById(canvasId);
            } else if (canvasId && canvasId.id) {
                elementId = canvasId.id;
                canvasElement = canvasId;
            } else if (canvasId && canvasId.nodeName === 'CANVAS') {
                elementId = canvasId.id || 'unnamed-canvas';
                canvasElement = canvasId;
            } else {
                console.error('❌ FABRIC SINGLETON: Invalid canvas identifier:', canvasId);
                throw new Error('Invalid canvas identifier provided to fabric.Canvas');
            }

            // Check if element already has fabric instance
            if (canvasElement && canvasElement.__fabric) {
                console.log('⚠️ FABRIC SINGLETON: Canvas element already has fabric instance, returning existing');
                return canvasElement.__fabric;
            }

            // Check our singleton map
            if (canvasInstances.has(elementId)) {
                const existingInstance = canvasInstances.get(elementId);
                console.log('✅ FABRIC SINGLETON: Returning existing fabric Canvas for:', elementId);
                return existingInstance;
            }

            // Check if initialization controller exists and has canvas
            if (global.canvasInitializationController) {
                const existingCanvas = global.canvasInitializationController.getExistingCanvas();
                if (existingCanvas && existingCanvas.upperCanvasEl) {
                    const existingElementId = existingCanvas.upperCanvasEl.id;
                    if (existingElementId === elementId || existingElementId.includes(elementId)) {
                        console.log('✅ FABRIC SINGLETON: Found matching canvas in controller:', existingElementId);
                        canvasInstances.set(elementId, existingCanvas);
                        return existingCanvas;
                    }
                }
            }

            // Create new instance only if none exists
            console.log('🎯 FABRIC SINGLETON: Creating new fabric Canvas for:', elementId);

            try {
                // Call original constructor
                const newInstance = new OriginalCanvas(canvasId, options);

                // Store in our singleton map
                canvasInstances.set(elementId, newInstance);

                // Register with controller if available
                if (global.canvasInitializationController) {
                    global.canvasInitializationController.registerSource('fabric-singleton-wrapper');
                    if (!global.canvasInitializationController.canvasInstance) {
                        global.canvasInitializationController.canvasInstance = newInstance;
                    }
                }

                console.log('✅ FABRIC SINGLETON: New fabric Canvas created and registered:', elementId);
                return newInstance;

            } catch (error) {
                console.error('❌ FABRIC SINGLETON: Error creating fabric Canvas:', error);

                // Check if error is about existing initialization
                if (error.message && error.message.includes('already been initialized')) {
                    console.log('🔄 FABRIC SINGLETON: Canvas already initialized, attempting to find existing instance');

                    // Try to find existing instance
                    if (canvasElement && canvasElement.__fabric) {
                        console.log('✅ FABRIC SINGLETON: Found existing fabric instance on element');
                        canvasInstances.set(elementId, canvasElement.__fabric);
                        return canvasElement.__fabric;
                    }
                }

                throw error;
            }
        }

        // Copy all static methods and properties from original
        Object.setPrototypeOf(SingletonCanvas, OriginalCanvas);
        Object.getOwnPropertyNames(OriginalCanvas).forEach(name => {
            if (name !== 'prototype' && name !== 'name' && name !== 'length') {
                try {
                    SingletonCanvas[name] = OriginalCanvas[name];
                } catch (e) {
                    // Some properties might not be configurable
                }
            }
        });

        // Ensure prototype chain is correct
        SingletonCanvas.prototype = OriginalCanvas.prototype;

        // Add singleton-specific methods
        SingletonCanvas.getInstances = function() {
            return Array.from(canvasInstances.values());
        };

        SingletonCanvas.getInstanceById = function(id) {
            return canvasInstances.get(id) || null;
        };

        SingletonCanvas.clearInstances = function() {
            console.log('🗑️ FABRIC SINGLETON: Clearing all canvas instances');
            canvasInstances.forEach((instance, id) => {
                try {
                    if (instance && typeof instance.dispose === 'function') {
                        instance.dispose();
                    }
                } catch (error) {
                    console.error('Error disposing canvas:', id, error);
                }
            });
            canvasInstances.clear();
        };

        // Mark as wrapped
        SingletonCanvas.__singletonWrapped = true;
        SingletonCanvas.__originalConstructor = OriginalCanvas;

        // Replace global fabric.Canvas (with error handling)
        try {
            global.fabric.Canvas = SingletonCanvas;
        } catch (e) {
            // 🧠 AGENT-1 FIX: Check existing property descriptor before defineProperty
            const existingDescriptor = Object.getOwnPropertyDescriptor(global.fabric, 'Canvas');

            if (existingDescriptor && !existingDescriptor.configurable) {
                console.log('⚠️ FABRIC SINGLETON: Canvas property is non-configurable, skipping redefinition');
                return true; // Skip redefinition to prevent error
            }

            try {
                Object.defineProperty(global.fabric, 'Canvas', {
                    value: SingletonCanvas,
                    writable: false,
                    configurable: true
                });
            } catch (defineError) {
                console.error('❌ FABRIC SINGLETON: Failed to define Canvas property:', defineError);
                return false;
            }
        }

        console.log('✅ FABRIC SINGLETON: fabric.js Canvas constructor wrapped with singleton pattern');
        return true;
    }

    // Try immediate initialization
    if (initializeFabricSingleton()) {
        return;
    }

    // Listen for fabric ready events
    const fabricEvents = ['fabricGloballyExposed', 'fabricGlobalReady', 'fabricManuallyExposed'];

    fabricEvents.forEach(eventName => {
        document.addEventListener(eventName, function() {
            console.log('🔧 FABRIC SINGLETON: Received event:', eventName);
            initializeFabricSingleton();
        }, { once: true });
    });

    // Polling fallback
    let attempts = 0;
    const maxAttempts = 20;
    const checkInterval = setInterval(() => {
        attempts++;

        if (initializeFabricSingleton()) {
            clearInterval(checkInterval);
        } else if (attempts >= maxAttempts) {
            clearInterval(checkInterval);
            console.error('❌ FABRIC SINGLETON: Failed to wrap fabric.js Canvas after', maxAttempts, 'attempts');
        }
    }, 250);

    // Global helper for debugging
    global.getFabricCanvasInstances = function() {
        return global.fabric && global.fabric.Canvas && global.fabric.Canvas.getInstances
            ? global.fabric.Canvas.getInstances()
            : [];
    };

    console.log('🔧 FABRIC SINGLETON: Fabric Canvas singleton wrapper initialized');

})(window);