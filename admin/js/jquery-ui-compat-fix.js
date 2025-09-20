/**
 * jQuery UI Datepicker Compatibility Fix
 * Resolves WooCommerce Cart Abandonment plugin conflict
 */

(function($) {
    'use strict';

    // Check if datepicker is missing from jQuery
    if ($ && !$.fn.datepicker) {
        console.log('🔧 JQUERY FIX: datepicker function missing, loading compatibility...');

        // Try to load jQuery UI if available
        if (typeof jQuery.ui !== 'undefined' && jQuery.ui.datepicker) {
            console.log('✅ JQUERY FIX: jQuery UI available, datepicker should work');
        } else {
            // Create a stub datepicker function to prevent errors
            $.fn.datepicker = function(options) {
                console.warn('🔶 JQUERY FIX: datepicker stub called - jQuery UI not properly loaded');
                console.warn('🔍 Element:', this);
                console.warn('🔍 Options:', options);
                return this; // Return jQuery object for chaining
            };

            console.log('⚠️ JQUERY FIX: Created datepicker stub to prevent TypeError');
        }
    } else if ($ && $.fn.datepicker) {
        console.log('✅ JQUERY FIX: datepicker already available');
    } else {
        console.warn('🚨 JQUERY FIX: jQuery not available');
    }

})(jQuery);