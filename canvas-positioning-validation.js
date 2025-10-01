/**
 * Canvas Positioning Validation Script
 * Run in Browser DevTools Console on WooCommerce Order Edit Page
 *
 * Purpose: Validates that canvas positioning fixes have been applied correctly
 * Usage: validateCanvasPositioning(5374)
 */

const validateCanvasPositioning = (orderId) => {
    console.log('🎯 Starting Canvas Positioning Validation...\n');

    // Find canvas elements
    const container = document.getElementById(`design-canvas-container-${orderId}`);
    const canvas = document.getElementById(`design-preview-canvas-${orderId}`);

    if (!container || !canvas) {
        console.error('❌ Canvas elements not found');
        console.error('Expected container ID:', `design-canvas-container-${orderId}`);
        console.error('Expected canvas ID:', `design-preview-canvas-${orderId}`);
        return false;
    }

    console.log('✅ Canvas elements found\n');

    // Get computed styles
    const containerStyles = getComputedStyle(container);
    const canvasStyles = getComputedStyle(canvas);

    // Validation checks
    const validation = {
        containerTextAlign: {
            actual: containerStyles.textAlign,
            expected: 'left or start',
            pass: containerStyles.textAlign === 'left' || containerStyles.textAlign === 'start'
        },
        canvasDisplay: {
            actual: canvasStyles.display,
            expected: 'block',
            pass: canvasStyles.display === 'block'
        },
        canvasOffsetLeft: {
            actual: `${canvas.offsetLeft}px`,
            expected: '≤ 5px',
            pass: canvas.offsetLeft <= 5
        },
        canvasMargin: {
            actual: canvasStyles.margin,
            expected: '0px (or minimal)',
            pass: canvasStyles.marginLeft === '0px' || parseInt(canvasStyles.marginLeft) <= 5
        }
    };

    // Print results
    console.log('📊 VALIDATION RESULTS:\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    Object.entries(validation).forEach(([key, result]) => {
        const status = result.pass ? '✅' : '❌';
        const label = key.replace(/([A-Z])/g, ' $1').trim();
        console.log(`${status} ${label}:`);
        console.log(`   Expected: ${result.expected}`);
        console.log(`   Actual:   ${result.actual}`);
        console.log(`   Status:   ${result.pass ? 'PASS' : 'FAIL'}\n`);
    });

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    const allPassed = Object.values(validation).every(v => v.pass);

    if (allPassed) {
        console.log('✅ ALL CHECKS PASSED - Canvas positioning is correct!');
        console.log('🎉 The canvas should now be aligned to the left edge.\n');
    } else {
        console.log('❌ SOME CHECKS FAILED - Review the failed items above.');
        console.log('💡 You may need to clear browser cache and reload.\n');
    }

    // Additional diagnostic information
    console.log('📐 ADDITIONAL DIAGNOSTICS:\n');
    console.log('Container Dimensions:', {
        width: container.offsetWidth,
        height: container.offsetHeight,
        paddingLeft: containerStyles.paddingLeft,
        paddingRight: containerStyles.paddingRight
    });
    console.log('\nCanvas Dimensions:', {
        width: canvas.width,
        height: canvas.height,
        displayWidth: canvas.offsetWidth,
        displayHeight: canvas.offsetHeight
    });
    console.log('\nCanvas Position:', {
        offsetLeft: canvas.offsetLeft,
        offsetTop: canvas.offsetTop,
        boundingClientRect: canvas.getBoundingClientRect()
    });

    return allPassed;
};

// Quick validation helper
const quickCheck = (orderId = 5374) => {
    console.clear();
    console.log('🚀 Quick Canvas Positioning Check\n');
    return validateCanvasPositioning(orderId);
};

// Export for use in console
console.log('✨ Canvas Positioning Validation Loaded!');
console.log('📝 Usage: validateCanvasPositioning(5374)');
console.log('⚡ Quick: quickCheck(5374)\n');
