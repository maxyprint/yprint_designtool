// 🚨 EMERGENCY: jQuery Event Binding & Delegation Failure Analysis
// AGENT 2: jQuery Event Binding & Delegation Failure Analysis Specialist

console.group('🚨 EMERGENCY JQUERY EVENT BINDING ANALYSIS');

// =====================================
// 1. JQUERY ENVIRONMENT VALIDATION
// =====================================
console.group('📊 JQUERY ENVIRONMENT VALIDATION');

const jqueryEnvironment = {
    jqueryLoaded: typeof $ !== 'undefined',
    jqueryVersion: typeof $ !== 'undefined' ? $.fn.jquery : 'NOT FOUND',
    documentReady: document.readyState,
    ajaxurlAvailable: typeof ajaxurl !== 'undefined',
    ajaxurlValue: typeof ajaxurl !== 'undefined' ? ajaxurl : 'MISSING',
    wordpressAdmin: window.location.href.includes('/wp-admin/'),
    currentURL: window.location.href,
    userAgent: navigator.userAgent.substring(0, 100)
};

console.log('🔍 JQUERY ENVIRONMENT STATUS:', jqueryEnvironment);

// Check for jQuery conflicts
if (typeof $ !== 'undefined' && typeof jQuery !== 'undefined') {
    console.log('✅ JQUERY CONFLICT CHECK: Both $ and jQuery available');
    console.log('$ === jQuery:', $ === jQuery);
} else {
    console.error('❌ JQUERY CONFLICT: Missing $ or jQuery');
}

console.groupEnd(); // JQUERY ENVIRONMENT VALIDATION

// =====================================
// 2. BUTTON ELEMENT ANALYSIS
// =====================================
console.group('🎯 BUTTON ELEMENT ANALYSIS');

const buttonAnalysis = {
    buttonExists: !!document.getElementById('design-preview-btn'),
    buttonElement: document.getElementById('design-preview-btn'),
    buttonCount: document.querySelectorAll('#design-preview-btn').length,
    duplicateButtons: document.querySelectorAll('[id="design-preview-btn"]').length > 1
};

if (buttonAnalysis.buttonElement) {
    const btn = buttonAnalysis.buttonElement;
    buttonAnalysis.properties = {
        disabled: btn.disabled,
        visible: btn.offsetWidth > 0 && btn.offsetHeight > 0,
        display: window.getComputedStyle(btn).display,
        visibility: window.getComputedStyle(btn).visibility,
        opacity: window.getComputedStyle(btn).opacity,
        pointerEvents: window.getComputedStyle(btn).pointerEvents,
        zIndex: window.getComputedStyle(btn).zIndex,
        position: window.getComputedStyle(btn).position,
        orderId: btn.getAttribute('data-order-id'),
        className: btn.className,
        tagName: btn.tagName
    };

    // Check for event listeners
    const events = $._data ? $._data(btn, 'events') : 'Cannot access events';
    buttonAnalysis.existingEvents = events;

    console.log('✅ BUTTON FOUND:', buttonAnalysis);
} else {
    console.error('❌ BUTTON NOT FOUND: #design-preview-btn element missing');
    console.log('🔍 Available buttons:', document.querySelectorAll('button'));
}

console.groupEnd(); // BUTTON ELEMENT ANALYSIS

// =====================================
// 3. EVENT BINDING METHODS TEST
// =====================================
console.group('⚡ EVENT BINDING METHODS TEST');

if (typeof $ !== 'undefined' && buttonAnalysis.buttonElement) {
    console.log('🧪 TESTING EVENT BINDING METHODS...');

    // Test Method 1: Direct jQuery binding
    try {
        $('#design-preview-btn').off('click.test'); // Remove any existing test handlers
        $('#design-preview-btn').on('click.test', function(e) {
            console.log('✅ METHOD 1 SUCCESS: Direct jQuery binding worked!');
            e.preventDefault();
            return false;
        });
        console.log('✅ METHOD 1: Direct binding attached successfully');
    } catch (error) {
        console.error('❌ METHOD 1 FAILED: Direct binding error:', error);
    }

    // Test Method 2: Event delegation
    try {
        $(document).off('click.test', '#design-preview-btn'); // Remove any existing test handlers
        $(document).on('click.test', '#design-preview-btn', function(e) {
            console.log('✅ METHOD 2 SUCCESS: Event delegation worked!');
            e.preventDefault();
            return false;
        });
        console.log('✅ METHOD 2: Event delegation attached successfully');
    } catch (error) {
        console.error('❌ METHOD 2 FAILED: Event delegation error:', error);
    }

    // Test Method 3: Native addEventListener
    try {
        const nativeHandler = function(e) {
            console.log('✅ METHOD 3 SUCCESS: Native addEventListener worked!');
            e.preventDefault();
            return false;
        };
        buttonAnalysis.buttonElement.removeEventListener('click', nativeHandler);
        buttonAnalysis.buttonElement.addEventListener('click', nativeHandler);
        console.log('✅ METHOD 3: Native addEventListener attached successfully');
    } catch (error) {
        console.error('❌ METHOD 3 FAILED: Native addEventListener error:', error);
    }

    // Manual click test
    console.log('🔧 MANUAL CLICK TEST: Click the button to test event handlers...');

} else {
    console.error('❌ CANNOT TEST: jQuery not loaded or button not found');
}

console.groupEnd(); // EVENT BINDING METHODS TEST

// =====================================
// 4. EVENT PROPAGATION ANALYSIS
// =====================================
console.group('🌊 EVENT PROPAGATION ANALYSIS');

if (buttonAnalysis.buttonElement) {
    const btn = buttonAnalysis.buttonElement;

    // Check for event blocking elements
    const propagationAnalysis = {
        parentElements: [],
        overlappingElements: [],
        cssBlocking: false
    };

    // Analyze parent elements
    let parent = btn.parentElement;
    while (parent && parent !== document.body) {
        const styles = window.getComputedStyle(parent);
        propagationAnalysis.parentElements.push({
            tagName: parent.tagName,
            id: parent.id,
            className: parent.className,
            pointerEvents: styles.pointerEvents,
            position: styles.position,
            zIndex: styles.zIndex,
            overflow: styles.overflow
        });

        // Check for CSS that might block events
        if (styles.pointerEvents === 'none') {
            propagationAnalysis.cssBlocking = true;
        }

        parent = parent.parentElement;
    }

    // Check for overlapping elements
    const btnRect = btn.getBoundingClientRect();
    const centerX = btnRect.left + btnRect.width / 2;
    const centerY = btnRect.top + btnRect.height / 2;
    const elementAtCenter = document.elementFromPoint(centerX, centerY);

    if (elementAtCenter && elementAtCenter !== btn) {
        propagationAnalysis.overlappingElements.push({
            tagName: elementAtCenter.tagName,
            id: elementAtCenter.id,
            className: elementAtCenter.className,
            zIndex: window.getComputedStyle(elementAtCenter).zIndex
        });
    }

    console.log('🌊 EVENT PROPAGATION ANALYSIS:', propagationAnalysis);

    if (propagationAnalysis.cssBlocking) {
        console.warn('⚠️ CSS BLOCKING DETECTED: pointer-events: none found in parent chain');
    }

    if (propagationAnalysis.overlappingElements.length > 0) {
        console.warn('⚠️ OVERLAPPING ELEMENTS: Elements covering button detected');
    }

} else {
    console.error('❌ CANNOT ANALYZE: Button element not found');
}

console.groupEnd(); // EVENT PROPAGATION ANALYSIS

// =====================================
// 5. TIMING AND EXECUTION ORDER ANALYSIS
// =====================================
console.group('⏰ TIMING AND EXECUTION ORDER ANALYSIS');

const timingAnalysis = {
    documentReadyState: document.readyState,
    domContentLoaded: false,
    windowLoaded: false,
    jqueryReady: false
};

// Test jQuery ready state
if (typeof $ !== 'undefined') {
    $(document).ready(function() {
        timingAnalysis.jqueryReady = true;
        console.log('✅ JQUERY READY: jQuery(document).ready() fired');
    });
}

// Test DOM events
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function() {
        timingAnalysis.domContentLoaded = true;
        console.log('✅ DOM READY: DOMContentLoaded fired');
    });
} else {
    timingAnalysis.domContentLoaded = true;
    console.log('✅ DOM READY: Document already loaded');
}

window.addEventListener('load', function() {
    timingAnalysis.windowLoaded = true;
    console.log('✅ WINDOW LOADED: window.onload fired');
});

console.log('⏰ TIMING ANALYSIS:', timingAnalysis);

console.groupEnd(); // TIMING AND EXECUTION ORDER ANALYSIS

// =====================================
// 6. EMERGENCY FIX RECOMMENDATIONS
// =====================================
console.group('🚑 EMERGENCY FIX RECOMMENDATIONS');

const fixes = [];

// Check for common issues and recommend fixes
if (!jqueryEnvironment.jqueryLoaded) {
    fixes.push({
        issue: 'jQuery not loaded',
        severity: 'critical',
        fix: 'Ensure jQuery is properly enqueued before this script'
    });
}

if (!jqueryEnvironment.ajaxurlAvailable) {
    fixes.push({
        issue: 'ajaxurl not available',
        severity: 'critical',
        fix: 'wp_localize_script() needed to pass ajaxurl to frontend'
    });
}

if (buttonAnalysis.duplicateButtons) {
    fixes.push({
        issue: 'Duplicate button IDs detected',
        severity: 'high',
        fix: 'Ensure only one element has id="design-preview-btn"'
    });
}

if (!buttonAnalysis.buttonExists) {
    fixes.push({
        issue: 'Button element not found',
        severity: 'critical',
        fix: 'Check if button HTML is rendered before JavaScript execution'
    });
}

if (buttonAnalysis.properties && buttonAnalysis.properties.disabled) {
    fixes.push({
        issue: 'Button is disabled',
        severity: 'medium',
        fix: 'Check button enable/disable logic in PHP'
    });
}

if (buttonAnalysis.properties && buttonAnalysis.properties.pointerEvents === 'none') {
    fixes.push({
        issue: 'CSS pointer-events disabled',
        severity: 'high',
        fix: 'Remove pointer-events: none from button CSS'
    });
}

console.log('🚑 EMERGENCY FIXES NEEDED:', fixes);

// Provide immediate fix code
if (fixes.length > 0) {
    console.log('🔧 IMMEDIATE FIX CODE:');
    console.log(`
// EMERGENCY JQUERY EVENT BINDING FIX
jQuery(document).ready(function($) {
    // Wait for DOM to be fully ready
    setTimeout(function() {
        var btn = $('#design-preview-btn');
        if (btn.length === 0) {
            console.error('EMERGENCY FIX: Button not found after timeout');
            return;
        }

        // Remove any existing handlers
        btn.off('click.emergency');
        $(document).off('click.emergency', '#design-preview-btn');

        // Apply both direct and delegated handlers
        btn.on('click.emergency', function(e) {
            e.preventDefault();
            console.log('EMERGENCY FIX: Direct handler triggered');
            // Add your click handling code here
            return false;
        });

        $(document).on('click.emergency', '#design-preview-btn', function(e) {
            e.preventDefault();
            console.log('EMERGENCY FIX: Delegated handler triggered');
            // Add your click handling code here
            return false;
        });

        console.log('✅ EMERGENCY FIX APPLIED: Event handlers attached');
    }, 100);
});
    `);
}

console.groupEnd(); // EMERGENCY FIX RECOMMENDATIONS

console.groupEnd(); // EMERGENCY JQUERY EVENT BINDING ANALYSIS

// Add a visual indicator to the page
if (document.body) {
    const indicator = document.createElement('div');
    indicator.innerHTML = '🚨 jQuery Event Analysis Complete - Check Console';
    indicator.style.cssText = 'position: fixed; top: 10px; right: 10px; background: #ff4444; color: white; padding: 10px; border-radius: 4px; z-index: 99999; font-family: monospace; font-size: 12px;';
    document.body.appendChild(indicator);

    setTimeout(() => {
        if (indicator.parentNode) {
            indicator.parentNode.removeChild(indicator);
        }
    }, 5000);
}