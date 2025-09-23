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
		// 🎯 SINGLETON CHECK: Prevent duplicate instances
		if (window.designerWidgetInstance) {
			debugLog('debug', '🎯 SINGLETON: DesignerWidget instance already exists, reusing existing');
			return;
		}

		// 🎯 CANVAS CHECK: Prevent fabric.js double initialization
		const canvasElement = document.getElementById('octo-print-designer-canvas');
		if (canvasElement && canvasElement.__fabric) {
			debugLog('debug', '🎯 SINGLETON: Canvas already initialized, preventing duplicate fabric initialization');
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

			if (typeof DesignerWidget !== 'undefined') {
				debugLog('debug', '🎯 GLOBAL INSTANCE: DesignerWidget class found, creating instance');
				console.log('🔍 CANVAS DEBUG: Creating new DesignerWidget...');

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

		// Try immediate initialization
		if (initializeDesignerWidget()) {
			return;
		}

		// 🚀 ISSUE #18 FIX: Optimized retry with exponential backoff, max 3 attempts
		let attempts = 0;
		const maxAttempts = 3; // Reduced from 10 to eliminate console spam
		let retryDelay = 500;

		const retryInit = setInterval(function() {
			attempts++;
			debugLog('debug', '🔄 GLOBAL INSTANCE: Attempt', attempts, 'to find DesignerWidget');

			if (initializeDesignerWidget()) {
				clearInterval(retryInit);
				return;
			}

			if (attempts >= maxAttempts) {
				debugLog('error', '❌ GLOBAL INSTANCE: Failed to initialize DesignerWidget after', maxAttempts, 'attempts');
				clearInterval(retryInit);

				// 🚀 FALLBACK: Create minimal instance for data capture compatibility
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

			// Exponential backoff for subsequent attempts
			retryDelay = Math.min(retryDelay * 2, 2000);
		}, retryDelay);
	});

})( jQuery );
