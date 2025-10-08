/**
 * 🚨 CANVAS CREATION BLOCKER
 *
 * CRITICAL PURPOSE: Blocks Canvas creation in DesignerWidget Bundle if HARD-LOCK is active
 * PRIORITY 1 IMPLEMENTATION: Prevents double Canvas initialization
 */

(function(global) {
    'use strict';

    console.log('🚫 CANVAS CREATION BLOCKER: Initializing bundle protection');

    // 🚨 HARD-LOCK CHECK FUNCTION
    function checkCanvasHardLock(location) {
        if (global.__FABRIC_CANVAS_LOCKED__) {
            global.__FABRIC_CANVAS_LOCK_COUNT__ = (global.__FABRIC_CANVAS_LOCK_COUNT__ || 0) + 1;

            const error = new Error(`HARD-LOCK: Canvas creation blocked in ${location}. Current lock count: ${global.__FABRIC_CANVAS_LOCK_COUNT__}`);
            console.error('🚫 CANVAS CREATION BLOCKER: BLOCKED -', location, 'Lock count:', global.__FABRIC_CANVAS_LOCK_COUNT__);

            // Log detailed stack trace to help identify source
            console.error('🚫 CANVAS CREATION BLOCKER: Stack trace:', error.stack);

            throw error;
        }
    }

    // 🚨 INTERCEPT FABRIC.JS IMPORTS IN WEBPACK MODULES
    // This will run before the DesignerWidget tries to create canvas
    if (global.fabric && global.fabric.Canvas) {
        console.log('🚫 CANVAS CREATION BLOCKER: Fabric.js detected, wrapping Canvas constructor');

        const OriginalCanvas = global.fabric.Canvas;

        // Wrapper that checks HARD-LOCK before creation
        function BlockedCanvasConstructor(...args) {
            checkCanvasHardLock('fabric.Canvas constructor (pre-bundle-check)');
            return new OriginalCanvas(...args);
        }

        // Copy all static methods and properties
        Object.setPrototypeOf(BlockedCanvasConstructor, OriginalCanvas);
        Object.getOwnPropertyNames(OriginalCanvas).forEach(name => {
            if (name !== 'prototype' && name !== 'name' && name !== 'length') {
                try {
                    BlockedCanvasConstructor[name] = OriginalCanvas[name];
                } catch (e) {
                    // Some properties might not be configurable
                }
            }
        });

        BlockedCanvasConstructor.prototype = OriginalCanvas.prototype;

        // Replace the constructor
        try {
            global.fabric.Canvas = BlockedCanvasConstructor;
            console.log('✅ CANVAS CREATION BLOCKER: fabric.Canvas wrapped with HARD-LOCK check');
        } catch (error) {
            console.error('❌ CANVAS CREATION BLOCKER: Failed to wrap fabric.Canvas:', error);
        }
    }

    // 🚨 MONITOR DESIGNER WIDGET INITIALIZATION
    // Watch for DesignerWidget class being created
    const originalDesignerWidget = global.DesignerWidget;

    if (originalDesignerWidget) {
        console.log('🚫 CANVAS CREATION BLOCKER: DesignerWidget detected, wrapping constructor');

        function BlockedDesignerWidget(...args) {
            checkCanvasHardLock('DesignerWidget constructor');
            return new originalDesignerWidget(...args);
        }

        // Copy prototype and static properties
        BlockedDesignerWidget.prototype = originalDesignerWidget.prototype;
        Object.setPrototypeOf(BlockedDesignerWidget, originalDesignerWidget);

        global.DesignerWidget = BlockedDesignerWidget;
        console.log('✅ CANVAS CREATION BLOCKER: DesignerWidget wrapped with HARD-LOCK check');
    }

    // 🚨 GLOBAL CANVAS ELEMENT CREATION MONITORING
    // Monitor for canvas elements being created
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName, ...args) {
        if (tagName.toLowerCase() === 'canvas') {
            checkCanvasHardLock('document.createElement("canvas")');
        }
        return originalCreateElement.call(this, tagName, ...args);
    };

    // 🚨 EMERGENCY FABRIC CANVAS MONITORING
    // Monitor any attempts to access fabric.Canvas constructor
    if (global.fabric) {
        let fabricCanvas = global.fabric.Canvas;

        Object.defineProperty(global.fabric, 'Canvas', {
            get: function() {
                return fabricCanvas;
            },
            set: function(newValue) {
                console.log('🚫 CANVAS CREATION BLOCKER: fabric.Canvas being reassigned');

                // If it's a function, wrap it with HARD-LOCK check
                if (typeof newValue === 'function') {
                    const wrappedCanvas = function(...args) {
                        checkCanvasHardLock('fabric.Canvas (via property setter)');
                        return new newValue(...args);
                    };

                    // Copy prototype and properties
                    Object.setPrototypeOf(wrappedCanvas, newValue);
                    wrappedCanvas.prototype = newValue.prototype;

                    // Copy static methods
                    Object.getOwnPropertyNames(newValue).forEach(name => {
                        if (name !== 'prototype' && name !== 'name' && name !== 'length') {
                            try {
                                wrappedCanvas[name] = newValue[name];
                            } catch (e) {
                                // Some properties might not be configurable
                            }
                        }
                    });

                    fabricCanvas = wrappedCanvas;
                } else {
                    fabricCanvas = newValue;
                }
            },
            configurable: true,
            enumerable: true
        });
    }

    // 🚨 GLOBAL HARD-LOCK STATUS MONITOR
    global.getCanvasHardLockStatus = function() {
        return {
            locked: global.__FABRIC_CANVAS_LOCKED__ || false,
            lockCount: global.__FABRIC_CANVAS_LOCK_COUNT__ || 0,
            blockerActive: true
        };
    };

    console.log('✅ CANVAS CREATION BLOCKER: All protection mechanisms active');

})(window);