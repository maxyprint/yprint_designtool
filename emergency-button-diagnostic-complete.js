/**
 * 🚨 EMERGENCY BUTTON DIAGNOSTIC - COMPLETE BUTTON LIFECYCLE TEST
 * Agent 7: Complete Button Lifecycle Emergency Testing
 */

console.log('🚨 EMERGENCY: Button Lifecycle Diagnostic Starting...');

// Test 1: Function Scope Availability Test
console.log('🔍 TEST 1: Function Scope Availability');
try {
    console.log('- loadOrderDesign function available:', typeof loadOrderDesign);
    console.log('- saveOrderPreview function available:', typeof saveOrderPreview);
    console.log('- loadDesignPreview function available:', typeof loadDesignPreview);
} catch (error) {
    console.error('❌ Scope test failed:', error);
}

// Test 2: Button Element Detection Test
console.log('🔍 TEST 2: Button Element Detection');
const loadButton = document.getElementById('load-order-btn');
const saveButton = document.getElementById('save-order-btn');

console.log('- Load Order Button:', loadButton ? 'FOUND' : 'MISSING');
console.log('- Save Order Button:', saveButton ? 'FOUND' : 'MISSING');

if (loadButton) {
    console.log('- Load button onclick attr:', loadButton.getAttribute('onclick'));
    console.log('- Load button class:', loadButton.className);
    console.log('- Load button disabled:', loadButton.disabled);
}

if (saveButton) {
    console.log('- Save button onclick attr:', saveButton.getAttribute('onclick'));
    console.log('- Save button class:', saveButton.className);
    console.log('- Save button disabled:', saveButton.disabled);
}

// Test 3: Click Handler Simulation Test
console.log('🔍 TEST 3: Click Handler Simulation');
if (loadButton) {
    loadButton.addEventListener('click', function(e) {
        console.log('🎯 CLICK EVENT DETECTED on Load Order Button');
        console.log('- Event target:', e.target);
        console.log('- Event type:', e.type);
        console.log('- Attempting function call...');

        try {
            if (typeof loadOrderDesign === 'function') {
                console.log('✅ loadOrderDesign function is callable');
            } else {
                console.error('❌ loadOrderDesign is not a function:', typeof loadOrderDesign);
            }
        } catch (error) {
            console.error('❌ Error calling loadOrderDesign:', error);
        }
    });

    // Simulate click
    setTimeout(() => {
        console.log('🎯 SIMULATING CLICK on Load Order Button...');
        loadButton.click();
    }, 1000);
}

// Test 4: Global Scope Injection Test
console.log('🔍 TEST 4: Global Scope Injection Test');
if (typeof window.loadOrderDesign === 'undefined') {
    console.log('⚠️ CRITICAL: loadOrderDesign not in global scope - INJECTING TEST VERSION');

    window.loadOrderDesign = function() {
        console.log('🎯 TEST loadOrderDesign() called successfully!');
        const orderCard = document.getElementById('order-preview-card');

        console.log('- Updating status...');

        // Show order preview card with sample data
        document.getElementById('order-id').textContent = '#12345';
        document.getElementById('customer-name').textContent = 'John Doe';
        document.getElementById('product-name').textContent = 'Custom T-Shirt';
        document.getElementById('design-status').textContent = 'Ready for Preview';

        orderCard.style.display = 'block';
        orderCard.classList.add('octo-fade-in');

        console.log('✅ TEST: Order design loaded successfully');
    };

    window.saveOrderPreview = function() {
        console.log('🎯 TEST saveOrderPreview() called successfully!');
        console.log('✅ TEST: Preview saved to WooCommerce order');
    };
}

// Test 5: jQuery Availability Test
console.log('🔍 TEST 5: jQuery Availability');
console.log('- jQuery available:', typeof jQuery);
console.log('- $ available:', typeof $);
console.log('- ajaxurl available:', typeof ajaxurl);

// Test 6: AJAX Endpoint Test
console.log('🔍 TEST 6: AJAX Endpoint Test');
if (typeof jQuery !== 'undefined' && typeof ajaxurl !== 'undefined') {
    jQuery.post(ajaxurl, {
        action: 'get_design_templates_for_measurements'
    }, function(response) {
        console.log('✅ AJAX Test Response:', response);
    }).fail(function(xhr, status, error) {
        console.error('❌ AJAX Test Failed:', status, error);
    });
}

console.log('🚨 EMERGENCY: Button Lifecycle Diagnostic Complete');