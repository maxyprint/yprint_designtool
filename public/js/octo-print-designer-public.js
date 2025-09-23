(function( $ ) {
	'use strict';

	/**
	 * All of the code for your public-facing JavaScript source
	 * should reside in this file.
	 *
	 * Note: It has been assumed you will write jQuery code here, so the
	 * $ function reference has been prepared for usage within the scope
	 * of this function.
	 *
	 * This enables you to define handlers, for when the DOM is ready:
	 *
	 * $(function() {
	 *
	 * });
	 *
	 * When the window is loaded:
	 *
	 * $( window ).load(function() {
	 *
	 * });
	 *
	 * ...and/or other possibilities.
	 *
	 * Ideally, it is not considered best practise to attach more than a
	 * single DOM-ready or window-load handler for a particular page.
	 * Although scripts in the WordPress core, Plugins and Themes may be
	 * practising this, we should strive to set a better example in our own work.
	 */

	// 🚀 ISSUE #18 FIX: Console-Optimized Designer Widget Instance
	// Debug level system: PRODUCTION reduces 90%+ console messages
	const DEBUG_MODE = (typeof window.octoPrintDesignerDebug !== 'undefined') ? window.octoPrintDesignerDebug : false;

	function debugLog(level, ...args) {
		if (!DEBUG_MODE && level === 'debug') return;
		if (level === 'error') console.error(...args);
		else if (level === 'warn') console.warn(...args);
		else if (DEBUG_MODE) console.log(...args);
	}

	$(function() {
		// 🎯 ISSUE #123 FIX: Use Canvas Initialization Controller
		debugLog('info', '🎯 ISSUE #123 FIX: Using Canvas Initialization Controller for singleton management');

		// Wait for controller to be ready
		function initializeWithController() {
			if (!window.canvasInitializationController) {
				debugLog('debug', '⏳ Waiting for Canvas Initialization Controller...');
				return false;
			}

			// Check controller status
			const status = window.canvasInitializationController.getStatus();
			debugLog('debug', '📊 Canvas Controller Status:', status);

			// If canvas already initialized, get existing instance
			if (status.isInitialized) {
				const existingCanvas = window.canvasInitializationController.getCanvas();
				if (existingCanvas && window.designerWidgetInstance) {
					debugLog('info', '✅ ISSUE #123 FIX: Canvas and DesignerWidget already initialized, reusing existing');
					return true;
				}
			}

			// SINGLETON CHECK: Prevent duplicate widget instances
			if (window.designerWidgetInstance) {
				debugLog('debug', '🎯 SINGLETON: DesignerWidget instance already exists, reusing existing');
				return true;
			}

			return false;
		}

		// Try immediate initialization with controller
		if (initializeWithController()) {
			return;
		}

		// Wait for designer bundle to load and expose DesignerWidget
		function initializeDesignerWidget() {
			// PHASE 3 FIX: Singleton guard - prevent double initialization
			if (window.designerWidgetInstance) {
				debugLog('debug', '🛡️ SINGLETON: DesignerWidget already exists, skipping initialization');
				return true;
			}

			// Check if DesignerWidget is available
			console.log('🔍 CANVAS DEBUG: Checking DesignerWidget availability...');
			console.log('🔍 CANVAS DEBUG: typeof DesignerWidget:', typeof DesignerWidget);
			console.log('🔍 CANVAS DEBUG: window.fabric exists:', typeof window.fabric);
			console.log('🔍 CANVAS DEBUG: window.fabric.Canvas exists:', typeof window.fabric?.Canvas);

			// 🎯 TIMING FIX: Ensure both DesignerWidget AND fabric.js are available
			if (typeof DesignerWidget !== 'undefined' && typeof window.fabric !== 'undefined' && window.fabric.Canvas) {
				debugLog('debug', '🎯 GLOBAL INSTANCE: DesignerWidget class found, fabric.js ready, creating instance');
				console.log('🔍 CANVAS DEBUG: Both DesignerWidget and fabric.js are ready, creating instance...');

				try {
					window.designerWidgetInstance = new DesignerWidget();
					console.log('✅ CANVAS DEBUG: DesignerWidget created successfully');
					debugLog('info', '✅ GLOBAL INSTANCE: window.designerWidgetInstance created successfully');
					return true;
				} catch (error) {
					console.error('❌ CANVAS DEBUG: DesignerWidget creation failed:', error);
					debugLog('error', '❌ GLOBAL INSTANCE: DesignerWidget creation failed:', error);
					return false;
				}
			}

			// Debug what's missing
			if (typeof DesignerWidget === 'undefined') {
				console.log('🔍 CANVAS DEBUG: DesignerWidget not yet available');
			}
			if (typeof window.fabric === 'undefined') {
				console.log('🔍 CANVAS DEBUG: window.fabric not yet available - waiting for emergency fabric loader...');
			}
			if (typeof window.fabric !== 'undefined' && !window.fabric.Canvas) {
				console.log('🔍 CANVAS DEBUG: window.fabric exists but Canvas not available');
			}

			// Try to import from designer bundle if webpack is available
			if (typeof window.__webpack_require__ === 'function') {
				try {
					// Get the webpack modules cache
					const modules = window.__webpack_require__.cache;

					// Find the designer module
					for (const moduleId in modules) {
						const module = modules[moduleId];
						if (module && module.exports && module.exports.DesignerWidget) {
							debugLog('debug', '🎯 GLOBAL INSTANCE: Found DesignerWidget in webpack module', moduleId);
							window.DesignerWidget = module.exports.DesignerWidget;
							window.designerWidgetInstance = new window.DesignerWidget();
							debugLog('info', '✅ GLOBAL INSTANCE: window.designerWidgetInstance created from webpack module');
							return true;
						}
					}
				} catch (error) {
					debugLog('warn', '⚠️ GLOBAL INSTANCE: Webpack module extraction failed:', error.message);
				}
			}

			return false;
		}

		// 🎯 ISSUE #123 FIX: Initialize DesignerWidget through Controller
		async function initializeWithControllerAndWidget() {
			debugLog('info', '🎯 ISSUE #123 FIX: Initializing DesignerWidget through Canvas Controller');

			try {
				// Ensure controller is available
				if (!window.canvasInitializationController) {
					debugLog('warn', '⚠️ Canvas Controller not available, falling back to traditional initialization');
					return initializeDesignerWidget();
				}

				// Initialize canvas through controller first
				const canvasResult = await window.canvasInitializationController.initializeCanvas({
					source: 'octo-print-designer-public',
					width: 800,
					height: 600,
					backgroundColor: '#ffffff'
				});

				if (!canvasResult.success) {
					debugLog('error', '❌ Canvas initialization failed:', canvasResult.error);
					return false;
				}

				debugLog('info', '✅ Canvas initialized:', canvasResult.message);

				// Now initialize DesignerWidget
				if (initializeDesignerWidget()) {
					// Link canvas to widget if needed
					if (window.designerWidgetInstance && canvasResult.canvas) {
						if (!window.designerWidgetInstance.canvas) {
							window.designerWidgetInstance.canvas = canvasResult.canvas;
							debugLog('info', '🔗 Linked canvas to DesignerWidget instance');
						}
					}
					return true;
				}

				return false;

			} catch (error) {
				debugLog('error', '❌ Controller-based initialization failed:', error);
				return initializeDesignerWidget();
			}
		}

		// Try controller-based initialization first
		initializeWithControllerAndWidget().then(success => {
			if (success) {
				debugLog('info', '✅ ISSUE #123 FIX: DesignerWidget initialized successfully through controller');
				return;
			}

			// Fallback to retry mechanism
			let attempts = 0;
			const maxAttempts = 3;
			let retryDelay = 500;

			const retryInit = setInterval(function() {
				attempts++;
				debugLog('debug', '🔄 FALLBACK: Attempt', attempts, 'to find DesignerWidget');

				if (initializeDesignerWidget()) {
					clearInterval(retryInit);
					return;
				}

				if (attempts >= maxAttempts) {
					debugLog('error', '❌ FALLBACK: Failed to initialize DesignerWidget after', maxAttempts, 'attempts');
					clearInterval(retryInit);

					// Create minimal fallback instance
					window.designerWidgetInstance = {
						initialized: false,
						error: 'Failed to initialize DesignerWidget',
						generateDesignData: () => ({
							error: 'DesignerWidget initialization failed',
							template_view_id: 'fallback',
							designed_on_area_px: { width: 0, height: 0 },
							elements: [],
							timestamp: new Date().toISOString()
						})
					};
					return;
				}

				retryDelay = Math.min(retryDelay * 2, 2000);
			}, retryDelay);
		});
	});

})( jQuery );
