/**
 * 🔧 CONSOLE DEBUG: View Design Preview Issue
 *
 * Führe diesen Code in der Browser-Console aus um das Preview-Problem zu debuggen
 */

console.log('🔧 [DEBUG] Starting View Design Preview diagnosis...');

// 1. Check if preview button exists and is enabled
function checkPreviewButton() {
    console.group('📋 [CHECK] Preview Button Status');

    const button = document.getElementById('design-preview-btn');
    if (!button) {
        console.error('❌ Preview button not found!');
        return false;
    }

    console.log('✅ Button found:', button);
    console.log('Button disabled:', button.disabled);
    console.log('Button aria-label:', button.getAttribute('aria-label'));
    console.log('Button data-order-id:', button.getAttribute('data-order-id'));

    console.groupEnd();
    return !button.disabled;
}

// 2. Check order meta data directly
function checkOrderData() {
    console.group('📊 [CHECK] Order Meta Data');

    // Get order ID from button
    const button = document.getElementById('design-preview-btn');
    if (!button) {
        console.error('❌ No button found');
        console.groupEnd();
        return;
    }

    const orderId = button.getAttribute('data-order-id');
    console.log('Order ID:', orderId);

    // Look for design data indicators on page
    const designSections = document.querySelectorAll('[id*="design"], [class*="design"]');
    console.log('Design-related elements found:', designSections.length);

    designSections.forEach((el, index) => {
        if (el.textContent.includes('design') || el.textContent.includes('Design')) {
            console.log(`Design element ${index}:`, el.tagName, el.className, el.textContent.substring(0, 100));
        }
    });

    console.groupEnd();
}

// 3. Test AJAX call manually
function testPreviewAJAX() {
    console.group('🔄 [TEST] Manual AJAX Call');

    const button = document.getElementById('design-preview-btn');
    if (!button) {
        console.error('❌ No button found');
        console.groupEnd();
        return;
    }

    const orderId = button.getAttribute('data-order-id');
    console.log('Testing AJAX for order:', orderId);

    // Get nonce from page
    const nonceField = document.querySelector('[name*="nonce"]');
    const nonce = nonceField ? nonceField.value : 'test-nonce';

    console.log('Using nonce:', nonce);

    jQuery.ajax({
        url: ajaxurl,
        type: 'POST',
        data: {
            action: 'octo_load_design_preview',
            order_id: orderId,
            nonce: nonce
        },
        success: function(response) {
            console.group('✅ [AJAX SUCCESS] Response received');
            console.log('Full response:', response);
            console.log('Success:', response.success);
            console.log('Data keys:', response.data ? Object.keys(response.data) : 'No data');

            if (response.data) {
                console.log('Files count:', response.data.files_count);
                console.log('Print files:', response.data.print_files);
                console.log('HTML length:', response.data.html ? response.data.html.length : 0);

                if (response.data.html) {
                    console.log('HTML preview (first 500 chars):', response.data.html.substring(0, 500));
                }
            }
            console.groupEnd();
        },
        error: function(xhr, status, error) {
            console.group('❌ [AJAX ERROR]');
            console.error('Status:', status);
            console.error('Error:', error);
            console.error('Response:', xhr.responseText);
            console.groupEnd();
        }
    });

    console.groupEnd();
}

// 4. Check for JavaScript errors
function checkJavaScriptErrors() {
    console.group('🐛 [CHECK] JavaScript Errors');

    // Override console.error to catch errors
    const originalError = console.error;
    const errors = [];

    console.error = function(...args) {
        errors.push(args.join(' '));
        originalError.apply(console, args);
    };

    // Check if jQuery is available
    console.log('jQuery available:', typeof jQuery !== 'undefined');
    console.log('ajaxurl defined:', typeof ajaxurl !== 'undefined');

    if (typeof ajaxurl !== 'undefined') {
        console.log('ajaxurl value:', ajaxurl);
    }

    // Check for recent errors
    if (errors.length > 0) {
        console.log('Recent errors:', errors);
    }

    console.groupEnd();
}

// 5. Check modal functionality
function checkModalElements() {
    console.group('🖼️ [CHECK] Modal Elements');

    const modal = document.getElementById('design-preview-modal');
    const content = document.getElementById('design-preview-content');
    const loading = document.getElementById('design-preview-loading');

    console.log('Modal element:', modal ? '✅ Found' : '❌ Missing');
    console.log('Content element:', content ? '✅ Found' : '❌ Missing');
    console.log('Loading element:', loading ? '✅ Found' : '❌ Missing');

    if (modal) {
        console.log('Modal display style:', getComputedStyle(modal).display);
        console.log('Modal innerHTML length:', modal.innerHTML.length);
    }

    if (content) {
        console.log('Content innerHTML:', content.innerHTML);
    }

    console.groupEnd();
}

// 6. Main diagnostic function
function runFullDiagnosis() {
    console.log('🚀 [DIAGNOSIS] Starting full View Design Preview diagnosis...');
    console.log('📅 Timestamp:', new Date().toISOString());

    // Run all checks
    const buttonEnabled = checkPreviewButton();
    checkOrderData();
    checkJavaScriptErrors();
    checkModalElements();

    console.log('\n📊 [SUMMARY] Diagnosis complete:');
    console.log('- Preview button enabled:', buttonEnabled);
    console.log('- Run testPreviewAJAX() to test AJAX call manually');
    console.log('- Check WordPress error logs for PHP errors');

    return {
        buttonEnabled,
        timestamp: new Date().toISOString()
    };
}

// 7. Auto-run basic checks
console.log('🔧 [AUTO] Running basic checks...');
runFullDiagnosis();

console.log('\n🛠️ [AVAILABLE FUNCTIONS]:');
console.log('- runFullDiagnosis() - Full diagnostic');
console.log('- testPreviewAJAX() - Test AJAX call manually');
console.log('- checkPreviewButton() - Check button status');
console.log('- checkModalElements() - Check modal elements');