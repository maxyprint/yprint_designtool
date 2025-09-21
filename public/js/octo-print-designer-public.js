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

	// Initialize Designer Widget Instance for global access
	$(function() {
		// Wait for designer bundle to load and expose DesignerWidget
		function initializeDesignerWidget() {
			// Check if DesignerWidget is available
			if (typeof DesignerWidget !== 'undefined') {
				console.log('🎯 GLOBAL INSTANCE: DesignerWidget class found, creating instance');
				window.designerWidgetInstance = new DesignerWidget();
				console.log('✅ GLOBAL INSTANCE: window.designerWidgetInstance created successfully');
				return true;
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
							console.log('🎯 GLOBAL INSTANCE: Found DesignerWidget in webpack module', moduleId);
							window.DesignerWidget = module.exports.DesignerWidget;
							window.designerWidgetInstance = new window.DesignerWidget();
							console.log('✅ GLOBAL INSTANCE: window.designerWidgetInstance created from webpack module');
							return true;
						}
					}
				} catch (error) {
					console.warn('⚠️ GLOBAL INSTANCE: Webpack module extraction failed:', error.message);
				}
			}

			return false;
		}

		// Try immediate initialization
		if (initializeDesignerWidget()) {
			return;
		}

		// If not available, wait for designer bundle
		let attempts = 0;
		const maxAttempts = 10;
		const retryInterval = 500;

		const retryInit = setInterval(function() {
			attempts++;
			console.log('🔄 GLOBAL INSTANCE: Attempt', attempts, 'to find DesignerWidget');

			if (initializeDesignerWidget()) {
				clearInterval(retryInit);
			} else if (attempts >= maxAttempts) {
				console.error('❌ GLOBAL INSTANCE: Failed to initialize DesignerWidget after', maxAttempts, 'attempts');
				clearInterval(retryInit);
			}
		}, retryInterval);
	});

})( jQuery );
