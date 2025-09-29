// 🚨 LIVE SITE EMERGENCY DIAGNOSTIC - Copy & Paste in Browser Console
// Führe diesen Code in der Browser Console auf yprint.de/wp-admin/admin.php?page=wc-orders&action=edit&id=5374 aus

console.log('🚨 STARTING LIVE SITE EMERGENCY DIAGNOSTIC');

// 1. CHECK BUTTON EXISTENCE AND STATE
const button = document.getElementById('design-preview-btn');
console.log('🔍 BUTTON CHECK:', {
    exists: !!button,
    disabled: button ? button.disabled : 'N/A',
    innerHTML: button ? button.innerHTML : 'N/A',
    classes: button ? button.className : 'N/A',
    orderId: button ? button.getAttribute('data-order-id') : 'N/A'
});

// 2. CHECK IF BUTTON HTML IS RENDERED AT ALL
const designSection = document.getElementById('design-preview-section');
console.log('🔍 DESIGN SECTION CHECK:', {
    exists: !!designSection,
    innerHTML: designSection ? designSection.innerHTML.substring(0, 200) + '...' : 'N/A'
});

// 3. CHECK JQUERY AND EVENT HANDLERS
console.log('🔍 JQUERY CHECK:', {
    jQueryLoaded: typeof jQuery !== 'undefined',
    jQueryVersion: typeof jQuery !== 'undefined' ? jQuery.fn.jquery : 'N/A',
    ajaxurlAvailable: typeof ajaxurl !== 'undefined',
    ajaxurlValue: typeof ajaxurl !== 'undefined' ? ajaxurl : 'N/A'
});

// 4. CHECK EVENT HANDLERS ON BUTTON
if (button) {
    const events = jQuery._data ? jQuery._data(button, 'events') : 'jQuery._data not available';
    console.log('🔍 EVENT HANDLERS CHECK:', events);
}

// 5. TEST EMERGENCY BUTTON ENABLE
if (button && button.disabled) {
    console.log('🚑 EMERGENCY: Button is disabled, attempting force enable...');
    button.disabled = false;
    button.style.opacity = '1';
    button.style.pointerEvents = 'auto';
    button.style.backgroundColor = '#2271b1';
    button.style.borderColor = '#2271b1';
    console.log('✅ Button force-enabled');
}

// 6. TEST CLICK HANDLER MANUALLY
if (button) {
    console.log('🧪 TESTING MANUAL CLICK...');
    button.addEventListener('click', function(e) {
        console.log('🎯 MANUAL CLICK HANDLER FIRED!', {
            event: e,
            target: e.target,
            timestamp: new Date().toISOString()
        });

        // Try to trigger AJAX manually
        if (typeof jQuery !== 'undefined' && typeof ajaxurl !== 'undefined') {
            console.log('🚀 ATTEMPTING MANUAL AJAX CALL...');
            jQuery.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'octo_load_design_preview',
                    order_id: 5374,
                    nonce: 'test_nonce'
                },
                success: function(response) {
                    console.log('✅ AJAX SUCCESS:', response);
                },
                error: function(xhr, status, error) {
                    console.log('❌ AJAX ERROR:', {xhr, status, error});
                }
            });
        }
    }, true);
}

// 7. CHECK FOR EXISTING CLICK HANDLERS IN DIFFERENT WAYS
console.log('🔍 CHECKING GLOBAL CLICK HANDLERS...');
const originalAddEventListener = document.addEventListener;
let clickHandlerCount = 0;

// Temporarily override to count handlers
document.addEventListener = function(type, handler, options) {
    if (type === 'click') {
        clickHandlerCount++;
        console.log('📊 Click handler #' + clickHandlerCount + ' detected');
    }
    return originalAddEventListener.call(this, type, handler, options);
};

// Restore original
setTimeout(() => {
    document.addEventListener = originalAddEventListener;
}, 1000);

// 8. CHECK PAGE CONTEXT
console.log('🔍 PAGE CONTEXT CHECK:', {
    url: window.location.href,
    isWooCommerceOrderPage: window.location.href.includes('page=wc-orders'),
    isOrderEdit: window.location.href.includes('action=edit'),
    orderId: new URLSearchParams(window.location.search).get('id'),
    pageTitle: document.title
});

// 9. EMERGENCY MANUAL BUTTON SETUP
function setupEmergencyButton() {
    const btn = document.getElementById('design-preview-btn');
    if (!btn) {
        console.log('❌ Button not found - checking if design section exists...');
        const section = document.getElementById('design-preview-section');
        if (!section) {
            console.log('❌ Design preview section not found - Plugin may not be rendering');
            return;
        }
    }

    console.log('🚑 Setting up emergency button functionality...');

    // Remove all existing handlers
    if (btn) {
        btn.replaceWith(btn.cloneNode(true));
        const newBtn = document.getElementById('design-preview-btn');

        newBtn.disabled = false;
        newBtn.onclick = function() {
            alert('🚑 Emergency button click detected!\n\nButton is now functional.\n\nOrder ID: ' + (newBtn.getAttribute('data-order-id') || '5374'));
            console.log('🎉 EMERGENCY BUTTON CLICK SUCCESSFUL!');
            return false;
        };

        newBtn.style.backgroundColor = '#dc3545';
        newBtn.style.borderColor = '#dc3545';
        newBtn.innerHTML = '<span class="dashicons dashicons-admin-tools"></span> 🚑 Emergency Test Button';

        console.log('✅ Emergency button setup complete - try clicking now!');
    }
}

// 10. EXECUTE EMERGENCY SETUP
setupEmergencyButton();

console.log('🏁 LIVE SITE DIAGNOSTIC COMPLETE - Check results above!');
console.log('📋 NEXT STEPS:');
console.log('1. Check if button exists and is enabled');
console.log('2. Try clicking the emergency button');
console.log('3. Check AJAX response in Network tab');
console.log('4. Report results back');