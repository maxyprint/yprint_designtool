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
		// 🧠 HIVE-MIND SOLUTION: Multi-Layer Singleton Architecture Integration
		debugLog('info', '🧠 HIVE-MIND: Integrating with Multi-Layer Singleton Architecture');

		// Wait for all singleton controllers to be ready
		function initializeWithHiveMindArchitecture() {
			// Check for Canvas Initialization Controller
			if (!window.canvasInitializationController) {
				debugLog('debug', '⏳ HIVE-MIND: Waiting for Canvas Initialization Controller...');
				return false;
			}

			// Check for Fabric Singleton Wrapper
			if (!window.FabricCanvasSingleton && (!window.fabric || !window.fabric.Canvas.__singletonWrapped)) {
				debugLog('debug', '⏳ HIVE-MIND: Waiting for Fabric Canvas Singleton...');
				return false;
			}

			// Check for Script Load Coordinator
			if (!window.scriptLoadCoordinator) {
				debugLog('debug', '⏳ HIVE-MIND: Waiting for Script Load Coordinator...');
				return false;
			}

			// Get controller status
			const status = window.canvasInitializationController.getStatus();
			debugLog('debug', '📊 HIVE-MIND: Canvas Controller Status:', status);

			// Get fabric singleton stats
			const fabricStats = window.fabric?.Canvas?.getStats ? window.fabric.Canvas.getStats() : {};
			debugLog('debug', '📊 HIVE-MIND: Fabric Singleton Stats:', fabricStats);

			// Get script coordinator stats
			const scriptStats = window.scriptLoadCoordinator.getStats();
			debugLog('debug', '📊 HIVE-MIND: Script Coordinator Stats:', scriptStats);

			// If canvas already initialized, get existing instance
			if (status.isInitialized) {
				const existingCanvas = window.canvasInitializationController.getCanvas();
				if (existingCanvas && window.designerWidgetInstance) {
					debugLog('info', '✅ HIVE-MIND: Canvas and DesignerWidget already initialized via singleton architecture');
					return true;
				}
			}

			// SINGLETON CHECK: Prevent duplicate widget instances
			if (window.designerWidgetInstance) {
				debugLog('debug', '🎯 HIVE-MIND: DesignerWidget instance already exists, reusing existing');
				return true;
			}

			return false;
		}

		// Try immediate initialization with Hive-Mind architecture
		if (initializeWithHiveMindArchitecture()) {
			return;
		}

		// Wait for designer bundle to load and expose DesignerWidget
		async function initializeDesignerWidget() {
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
					// 🧠 HIVE-MIND: Use Canvas Initialization Controller for DesignerWidget
					const canvasResult = await window.canvasInitializationController.initializeCanvas({
						source: 'octo-print-designer-public.js',
						width: 800,
						height: 600,
						backgroundColor: '#ffffff'
					});

					if (canvasResult.success) {
						// Create DesignerWidget with controlled canvas
						window.designerWidgetInstance = new DesignerWidget();

						// Ensure DesignerWidget uses the singleton canvas
						if (window.designerWidgetInstance && canvasResult.canvas) {
							window.designerWidgetInstance.canvas = canvasResult.canvas;
						}

						console.log('✅ HIVE-MIND: DesignerWidget created with singleton canvas architecture');
						debugLog('info', '✅ HIVE-MIND: Multi-layer singleton integration successful');

						// Log agent validation metrics
						const metrics = window.canvasInitializationController.getMetrics();
						debugLog('debug', '📊 HIVE-MIND SUCCESS METRICS:', metrics);

						return true;
					} else {
						console.error('❌ HIVE-MIND: Canvas initialization failed:', canvasResult.error);
						return false;
					}
				} catch (error) {
					console.error('❌ HIVE-MIND: DesignerWidget integration failed:', error);
					debugLog('error', '❌ HIVE-MIND: Multi-layer singleton integration failed:', error);

					// Fallback to direct creation for backward compatibility
					try {
						window.designerWidgetInstance = new DesignerWidget();
						console.log('⚠️ HIVE-MIND: Fallback DesignerWidget creation successful');
						return true;
					} catch (fallbackError) {
						console.error('❌ HIVE-MIND: Even fallback creation failed:', fallbackError);
						return false;
					}
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
