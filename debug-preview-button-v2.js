/**
 * 🔧 CONSOLE DEBUG V2: Enhanced View Design Preview Button Diagnosis
 *
 * Comprehensive debugging script for the View Design Preview button issue
 */

console.log('🔧 [DEBUG V2] Starting Enhanced Preview Button Diagnosis...');

// 1. Check current page state and button existence
function checkButtonStatus() {
    console.group('📋 [CHECK] Button Status & Environment');

    const button = document.getElementById('design-preview-btn');
    console.log('Button element found:', !!button);

    if (button) {
        console.log('Button details:', {
            disabled: button.disabled,
            'data-order-id': button.getAttribute('data-order-id'),
            'aria-label': button.getAttribute('aria-label'),
            innerHTML: button.innerHTML,
            classList: Array.from(button.classList),
            style: button.style.cssText
        });

        // Check if button is visible
        const rect = button.getBoundingClientRect();
        console.log('Button visibility:', {
            isVisible: rect.width > 0 && rect.height > 0,
            position: {x: rect.x, y: rect.y, width: rect.width, height: rect.height},
            display: getComputedStyle(button).display,
            visibility: getComputedStyle(button).visibility
        });
    }

    console.groupEnd();
    return button;
}

// 2. Check jQuery and event handlers
function checkEventHandlers(button) {
    console.group('🎯 [CHECK] jQuery Events & Handlers');

    console.log('jQuery available:', typeof jQuery);
    console.log('$ available in global scope:', typeof window.$);

    if (button && typeof jQuery !== 'undefined') {
        // Check jQuery events
        const jqData = jQuery._data ? jQuery._data(button, 'events') : null;
        const jqEvents = jQuery(button).data('events');

        console.log('jQuery._data events:', jqData);
        console.log('jQuery.data events:', jqEvents);

        // Check all click events
        const allEvents = jQuery._data(button, 'events') || {};
        console.log('All registered events:', Object.keys(allEvents));

        if (allEvents.click) {
            console.log('Click events found:', allEvents.click.length);
            allEvents.click.forEach((handler, index) => {
                console.log(`Click handler ${index}:`, {
                    namespace: handler.namespace,
                    type: handler.type,
                    handlerObj: handler
                });
            });
        } else {
            console.warn('❌ NO CLICK EVENTS REGISTERED!');
        }
    }

    console.groupEnd();
}

// 3. Check initialization logs
function checkInitializationLogs() {
    console.group('📜 [CHECK] Initialization Logs');

    // Look for our debug message
    const logs = [];
    const originalLog = console.log;

    // Check if our initialization message was logged
    console.log('Looking for initialization message...');

    // Check document ready state
    console.log('Document ready state:', document.readyState);
    console.log('DOM fully loaded:', document.readyState === 'complete');

    console.groupEnd();
}

// 4. Manual event handler registration test
function testManualRegistration(button) {
    console.group('🛠️ [TEST] Manual Event Handler Registration');

    if (!button) {
        console.error('No button found for manual registration');
        console.groupEnd();
        return;
    }

    const orderId = button.getAttribute('data-order-id');
    console.log('Testing manual registration for order:', orderId);

    // Clear all existing handlers
    jQuery(button).off('click');
    console.log('✅ Cleared all existing click handlers');

    // Register new handler
    jQuery(button).on('click.debug-test', function(event) {
        console.log('🎯 [DEBUG TEST] Click handler triggered!', {
            event: event,
            orderId: orderId,
            target: event.target,
            currentTarget: event.currentTarget
        });

        event.preventDefault();
        event.stopPropagation();

        // Test basic functionality
        if (jQuery(this).prop('disabled')) {
            console.warn('Button is disabled, stopping execution');
            return;
        }

        console.log('✅ Handler execution successful - button is functional');

        // Test AJAX call
        testAjaxCall(orderId);
    });

    console.log('✅ Manual handler registered successfully');
    console.log('💡 Try clicking the button now!');

    console.groupEnd();
}

// 5. Test AJAX functionality
function testAjaxCall(orderId) {
    console.group('📡 [TEST] AJAX Call');

    const nonce = window.octoAdminContext?.nonce ||
                  document.querySelector('#octo_print_provider_nonce')?.value ||
                  'test-nonce';

    console.log('Testing AJAX with:', {
        orderId: orderId,
        nonce: nonce,
        ajaxurl: window.ajaxurl
    });

    jQuery.ajax({
        url: window.ajaxurl,
        type: 'POST',
        data: {
            action: 'octo_load_design_preview',
            order_id: orderId,
            nonce: nonce
        },
        beforeSend: function() {
            console.log('⏳ AJAX request starting...');
        },
        success: function(response) {
            console.group('✅ [AJAX SUCCESS]');
            console.log('Response received:', response);
            console.log('Success:', response.success);
            console.log('Data keys:', response.data ? Object.keys(response.data) : 'No data');

            if (response.success && response.data) {
                console.log('Files count:', response.data.files_count);
                console.log('Has HTML:', !!response.data.html);
                console.log('HTML length:', response.data.html ? response.data.html.length : 0);
            }
            console.groupEnd();
        },
        error: function(xhr, status, error) {
            console.group('❌ [AJAX ERROR]');
            console.error('Status:', status);
            console.error('Error:', error);
            console.error('Response Text:', xhr.responseText);
            console.error('Status Code:', xhr.status);
            console.groupEnd();
        },
        complete: function() {
            console.log('📋 AJAX request completed');
            console.groupEnd();
        }
    });
}

// 6. Check modal elements
function checkModalElements() {
    console.group('🖼️ [CHECK] Modal Elements');

    const modal = document.getElementById('design-preview-modal');
    const content = document.getElementById('design-preview-content');
    const loading = document.getElementById('design-preview-loading');
    const closeBtn = document.getElementById('close-preview-modal');

    console.log('Modal elements status:', {
        modal: !!modal,
        content: !!content,
        loading: !!loading,
        closeBtn: !!closeBtn
    });

    if (modal) {
        console.log('Modal display style:', getComputedStyle(modal).display);
        console.log('Modal z-index:', getComputedStyle(modal).zIndex);
    }

    console.groupEnd();
}

// 7. Main diagnosis function
function runFullDiagnosis() {
    console.log('🚀 [FULL DIAGNOSIS V2] Starting comprehensive button analysis...');
    console.log('📅 Timestamp:', new Date().toISOString());
    console.log('🌍 Page URL:', window.location.href);

    const button = checkButtonStatus();
    checkEventHandlers(button);
    checkInitializationLogs();
    checkModalElements();

    if (button) {
        testManualRegistration(button);
    }

    console.log('\n📊 [SUMMARY] Diagnosis V2 complete');
    console.log('- Run additional tests by calling individual functions');
    console.log('- Button should now be functional with manual handler');

    return {
        buttonFound: !!button,
        timestamp: new Date().toISOString(),
        pageUrl: window.location.href
    };
}

// 8. Auto-run diagnosis
console.log('🔧 [AUTO] Running enhanced diagnosis...');
const result = runFullDiagnosis();

console.log('\n🛠️ [AVAILABLE FUNCTIONS V2]:');
console.log('- runFullDiagnosis() - Complete analysis');
console.log('- checkButtonStatus() - Check button state');
console.log('- checkEventHandlers(button) - Analyze event handlers');
console.log('- testManualRegistration(button) - Register working handler');
console.log('- testAjaxCall(orderId) - Test AJAX directly');
console.log('- checkModalElements() - Check modal setup');

// Export result
window.debugResult = result;
console.log('📋 Results stored in window.debugResult');