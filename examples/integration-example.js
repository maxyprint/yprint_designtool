/**
 * Perfect Positioning System - Integration Example
 *
 * This file demonstrates how to integrate the Perfect Positioning System
 * into your application with complete error handling, validation, and monitoring.
 */

// ============================================
// EXAMPLE 1: Basic Integration
// ============================================

async function basicIntegration() {
    console.log('=== EXAMPLE 1: Basic Integration ===\n');

    // 1. Create renderer instance
    const renderer = new AdminCanvasRenderer();

    // 2. Initialize with container
    const success = renderer.init('canvas-container', {
        canvasDimensions: { width: 780, height: 580 }
    });

    if (!success) {
        console.error('Failed to initialize renderer');
        return;
    }

    // 3. Prepare design data
    const designData = {
        objects: [
            {
                type: 'image',
                left: 100,
                top: 100,
                width: 200,
                height: 150,
                scaleX: 1.0,
                scaleY: 1.0,
                src: 'https://example.com/logo.jpg'
            },
            {
                type: 'text',
                left: 150,
                top: 300,
                text: 'Company Name',
                fontSize: 24,
                fontFamily: 'Arial',
                fontWeight: 'bold',
                fill: '#000000'
            }
        ],
        metadata: {
            capture_version: '2.0',
            designer_offset: { x: 0, y: 0 }
        }
    };

    // 4. Render design
    try {
        await renderer.renderDesign(designData);
        console.log('✓ Design rendered successfully');
    } catch (error) {
        console.error('✗ Rendering failed:', error);
    }

    // 5. Check results
    const stats = renderer.renderingStatistics;
    console.log('Rendered:', stats.renderedObjects.length, 'objects');
    console.log('Errors:', stats.errors.length);
    console.log('Render time:', (stats.endTime - stats.startTime).toFixed(2), 'ms\n');
}

// ============================================
// EXAMPLE 2: Legacy Order Handling
// ============================================

async function legacyOrderHandling() {
    console.log('=== EXAMPLE 2: Legacy Order Handling ===\n');

    const renderer = new AdminCanvasRenderer();
    renderer.init('canvas-container');

    // Legacy order data (e.g., Order 5378)
    const legacyOrderData = {
        objects: [
            {
                type: 'image',
                left: 500,
                top: 300,
                width: 200,
                height: 150,
                scaleX: 1.4,
                scaleY: 1.4,
                src: 'logo.jpg'
            },
            {
                type: 'text',
                left: 450,
                top: 250,
                text: 'Old Company',
                fontSize: 32,
                scaleX: 1.4,
                scaleY: 1.4,
                fill: '#000000'
            }
        ],
        db_processed_views: true // Legacy flag
    };

    console.log('Original coordinates:', {
        image: { left: legacyOrderData.objects[0].left, top: legacyOrderData.objects[0].top },
        text: { left: legacyOrderData.objects[1].left, top: legacyOrderData.objects[1].top }
    });

    // Apply legacy correction
    const correction = renderer.applyLegacyDataCorrection(legacyOrderData);

    if (correction.applied) {
        console.log('✓ Legacy data correction applied');
        console.log('  Method:', correction.method);
        console.log('  Confidence:', (correction.confidence * 100).toFixed(0) + '%');
        console.log('  Elements transformed:', correction.elementsTransformed);
        console.log('  Matrix:', correction.matrix);
    }

    console.log('Corrected coordinates:', {
        image: { left: legacyOrderData.objects[0].left, top: legacyOrderData.objects[0].top },
        text: { left: legacyOrderData.objects[1].left, top: legacyOrderData.objects[1].top }
    });

    // Render corrected data
    await renderer.renderDesign(legacyOrderData);
    console.log('✓ Legacy order rendered correctly\n');
}

// ============================================
// EXAMPLE 3: With Validation
// ============================================

async function withValidation() {
    console.log('=== EXAMPLE 3: With Validation ===\n');

    const renderer = new AdminCanvasRenderer();
    renderer.init('canvas-container');

    const designData = {
        objects: [
            { type: 'image', left: 100, top: 100, width: 200, height: 150, scaleX: 1.0, scaleY: 1.0, src: 'test.jpg' }
        ],
        metadata: { capture_version: '2.0' }
    };

    // Render design
    await renderer.renderDesign(designData);

    // Create comparator for validation
    const comparator = new DesignFidelityComparator(designData);

    // Capture rendered state
    const renderedState = comparator.captureRenderedState(
        renderer.canvas,
        renderer
    );

    console.log('Rendered State:', {
        canvas: renderedState.canvas,
        background: renderedState.background,
        elementCount: renderedState.elements.length
    });

    // Compare with original
    const comparison = comparator.compareDesigns();

    console.log('Validation Results:');
    console.log('  Overall Accuracy:', comparison.overall.accuracy);
    console.log('  Passed:', comparison.overall.passed ? '✓' : '✗');

    comparison.elements.forEach((element, index) => {
        console.log(`  Element ${index}:`, {
            deltaX: element.positionDelta.x.toFixed(2) + 'px',
            deltaY: element.positionDelta.y.toFixed(2) + 'px',
            error: element.positionError.toFixed(2) + 'px',
            accuracy: element.accuracy
        });
    });

    console.log();
}

// ============================================
// EXAMPLE 4: Error Handling
// ============================================

async function errorHandling() {
    console.log('=== EXAMPLE 4: Error Handling ===\n');

    const renderer = new AdminCanvasRenderer();
    renderer.init('canvas-container');

    const designData = {
        objects: [
            // Valid element
            { type: 'rect', left: 100, top: 100, width: 100, height: 100, fill: '#00ff00' },
            // Invalid element (negative dimensions)
            { type: 'rect', left: 250, top: 100, width: -50, height: 100, fill: '#ff0000' },
            // Invalid element (missing src)
            { type: 'image', left: 400, top: 100, width: 100, height: 100, scaleX: 1.0, scaleY: 1.0 }
        ]
    };

    try {
        await renderer.renderDesign(designData);

        // Check rendering statistics
        const stats = renderer.renderingStatistics;

        console.log('Rendering completed with errors:');
        console.log('  Successfully rendered:', stats.renderedObjects.length, 'objects');
        console.log('  Errors encountered:', stats.errors.length);

        if (stats.errors.length > 0) {
            console.log('\nError Details:');
            stats.errors.forEach((error, index) => {
                console.log(`  Error ${index + 1}:`);
                console.log('    Element:', error.element);
                console.log('    Message:', error.error.message);
            });
        }
    } catch (error) {
        console.error('Fatal rendering error:', error);
    }

    console.log();
}

// ============================================
// EXAMPLE 5: Performance Monitoring
// ============================================

async function performanceMonitoring() {
    console.log('=== EXAMPLE 5: Performance Monitoring ===\n');

    const renderer = new AdminCanvasRenderer();
    renderer.init('canvas-container');

    // Generate test data
    const complexDesign = {
        objects: []
    };

    for (let i = 0; i < 20; i++) {
        complexDesign.objects.push({
            type: i % 2 === 0 ? 'rect' : 'circle',
            left: 50 + (i % 10) * 70,
            top: 50 + Math.floor(i / 10) * 150,
            width: 50,
            height: 50,
            radius: 25,
            fill: `#${Math.floor(Math.random() * 16777215).toString(16)}`
        });
    }

    // Measure render time
    const startTime = performance.now();
    await renderer.renderDesign(complexDesign);
    const endTime = performance.now();
    const renderTime = endTime - startTime;

    console.log('Performance Metrics:');
    console.log('  Total render time:', renderTime.toFixed(2), 'ms');
    console.log('  Object count:', complexDesign.objects.length);
    console.log('  Avg per object:', (renderTime / complexDesign.objects.length).toFixed(2), 'ms');
    console.log('  Image cache size:', renderer.imageCache.size);
    console.log('  Font cache size:', renderer.textRenderer.fontCache.size);

    // Performance classification
    let classification;
    if (renderTime < 50) classification = '⚡ EXCELLENT';
    else if (renderTime < 100) classification = '✓ GOOD';
    else if (renderTime < 200) classification = '⚠ ACCEPTABLE';
    else classification = '✗ SLOW';

    console.log('  Classification:', classification);
    console.log();
}

// ============================================
// EXAMPLE 6: Custom Configuration
// ============================================

async function customConfiguration() {
    console.log('=== EXAMPLE 6: Custom Configuration ===\n');

    const renderer = new AdminCanvasRenderer();

    // Customize coordinate preservation
    renderer.coordinatePreservation.allowedTolerance = 0.5; // Increase tolerance to 0.5px
    renderer.coordinatePreservation.validateCoordinates = true; // Enable validation logging

    // Customize image renderer
    renderer.imageRenderer.logImageRender = false; // Disable verbose image logging
    renderer.imageRenderer.enableImageCaching = true; // Enable caching

    // Customize text renderer
    renderer.textRenderer.fontLoadingSupport = true; // Enable web font loading
    renderer.textRenderer.logTextRender = true; // Enable text logging

    console.log('Custom Configuration Applied:');
    console.log('  Coordinate tolerance:', renderer.coordinatePreservation.allowedTolerance, 'px');
    console.log('  Image caching:', renderer.imageRenderer.enableImageCaching ? 'enabled' : 'disabled');
    console.log('  Font loading:', renderer.textRenderer.fontLoadingSupport ? 'enabled' : 'disabled');

    renderer.init('canvas-container');

    const designData = {
        objects: [
            { type: 'text', left: 100, top: 100, text: 'Custom Config', fontSize: 32, fontFamily: 'Arial', fill: '#000' }
        ]
    };

    await renderer.renderDesign(designData);
    console.log('✓ Rendered with custom configuration\n');
}

// ============================================
// EXAMPLE 7: Debugging Workflow
// ============================================

async function debuggingWorkflow() {
    console.log('=== EXAMPLE 7: Debugging Workflow ===\n');

    const renderer = new AdminCanvasRenderer();
    renderer.init('canvas-container');

    const designData = {
        objects: [
            { type: 'image', left: 430, top: 265, width: 200, height: 150, scaleX: 1.0, scaleY: 1.0, src: 'test.jpg' }
        ],
        metadata: {
            capture_version: '2.0',
            designer_offset: { x: 330, y: 165 },
            canvas_dimensions: { width: 780, height: 580 }
        }
    };

    console.log('Step 1: Check Legacy Detection');
    const isLegacy = !designData.metadata?.capture_version &&
                     !designData.metadata?.designer_offset;
    console.log('  Is Legacy:', isLegacy ? 'Yes' : 'No');

    console.log('\nStep 2: Extract Designer Offset');
    renderer.extractDesignerOffset(designData);
    console.log('  Offset detected:', renderer.designerOffset.detected ? 'Yes' : 'No');
    console.log('  Offset values:', renderer.designerOffset);

    console.log('\nStep 3: Extract Canvas Scaling');
    renderer.extractCanvasScaling(designData);
    console.log('  Scaling detected:', renderer.canvasScaling.detected ? 'Yes' : 'No');
    console.log('  Scaling values:', renderer.canvasScaling);

    console.log('\nStep 4: Transform Coordinates');
    const element = designData.objects[0];
    const transformed = renderer.transformCoordinates(element.left, element.top);
    console.log('  Original:', { x: element.left, y: element.top });
    console.log('  Transformed:', transformed);
    console.log('  Delta:', {
        x: (transformed.x - element.left).toFixed(2) + 'px',
        y: (transformed.y - element.top).toFixed(2) + 'px'
    });

    console.log('\nStep 5: Render and Validate');
    await renderer.renderDesign(designData);
    const stats = renderer.renderingStatistics;
    console.log('  Rendered objects:', stats.renderedObjects.length);
    console.log('  Errors:', stats.errors.length);
    console.log('  Render time:', (stats.endTime - stats.startTime).toFixed(2), 'ms');

    console.log();
}

// ============================================
// EXAMPLE 8: Complete Production Integration
// ============================================

async function productionIntegration(orderId) {
    console.log('=== EXAMPLE 8: Complete Production Integration ===\n');
    console.log(`Processing Order: ${orderId}\n`);

    // 1. Fetch order data from API
    console.log('Step 1: Fetching order data...');
    let orderData;
    try {
        const response = await fetch(`/api/orders/${orderId}/design-data`);
        if (!response.ok) throw new Error('Failed to fetch order data');
        orderData = await response.json();
        console.log('✓ Order data loaded\n');
    } catch (error) {
        console.error('✗ Failed to fetch order:', error);
        return;
    }

    // 2. Initialize renderer
    console.log('Step 2: Initializing renderer...');
    const renderer = new AdminCanvasRenderer();
    const initialized = renderer.init('canvas-container', {
        canvasDimensions: orderData.canvas_dimensions || { width: 780, height: 580 }
    });

    if (!initialized) {
        console.error('✗ Failed to initialize renderer');
        return;
    }
    console.log('✓ Renderer initialized\n');

    // 3. Apply corrections if needed
    console.log('Step 3: Checking for corrections...');
    const legacyCorrection = renderer.applyLegacyDataCorrection(orderData.design_data);
    if (legacyCorrection.applied) {
        console.log('✓ Legacy correction applied');
        console.log('  Confidence:', (legacyCorrection.confidence * 100).toFixed(0) + '%');
        console.log('  Elements corrected:', legacyCorrection.elementsTransformed);
    } else {
        console.log('✓ No correction needed (modern data)');
    }
    console.log();

    // 4. Render with error handling
    console.log('Step 4: Rendering design...');
    try {
        const renderStart = performance.now();
        await renderer.renderDesign(orderData.design_data, {
            backgroundUrl: orderData.mockup_url
        });
        const renderTime = performance.now() - renderStart;

        const stats = renderer.renderingStatistics;

        if (stats.errors.length === 0) {
            console.log('✓ Rendering completed successfully');
            console.log('  Objects rendered:', stats.renderedObjects.length);
            console.log('  Render time:', renderTime.toFixed(2), 'ms');
        } else {
            console.log('⚠ Rendering completed with errors');
            console.log('  Objects rendered:', stats.renderedObjects.length);
            console.log('  Errors:', stats.errors.length);
            stats.errors.forEach((error, i) => {
                console.log(`    Error ${i + 1}:`, error.error.message);
            });
        }
    } catch (error) {
        console.error('✗ Rendering failed:', error);
        return;
    }
    console.log();

    // 5. Validate rendering
    console.log('Step 5: Validating rendering...');
    const comparator = new DesignFidelityComparator(orderData.design_data);
    const renderedState = comparator.captureRenderedState(renderer.canvas, renderer);
    const comparison = comparator.compareDesigns();

    console.log('✓ Validation completed');
    console.log('  Overall accuracy:', comparison.overall.accuracy);
    console.log('  Status:', comparison.overall.passed ? 'PASSED ✓' : 'FAILED ✗');

    if (!comparison.overall.passed) {
        console.log('\n⚠ Validation Issues:');
        comparison.elements.forEach((element, i) => {
            if (element.accuracy === 'LOW' || element.accuracy === 'MEDIUM') {
                console.log(`  Element ${i}:`, {
                    id: element.id,
                    error: element.positionError.toFixed(2) + 'px',
                    accuracy: element.accuracy
                });
            }
        });
    }
    console.log();

    // 6. Report to monitoring system
    console.log('Step 6: Reporting metrics...');
    const metrics = {
        orderId: orderId,
        renderTime: renderer.renderingStatistics.endTime - renderer.renderingStatistics.startTime,
        objectCount: orderData.design_data.objects.length,
        errorCount: renderer.renderingStatistics.errors.length,
        accuracy: comparison.overall.accuracy,
        correctionApplied: legacyCorrection.applied,
        timestamp: Date.now()
    };

    console.log('✓ Metrics:', metrics);
    console.log();

    // Optional: Send metrics to analytics
    // await fetch('/api/analytics/rendering', {
    //     method: 'POST',
    //     body: JSON.stringify(metrics)
    // });

    console.log('=== Order Processing Complete ===\n');
}

// ============================================
// Run Examples
// ============================================

async function runAllExamples() {
    await basicIntegration();
    await legacyOrderHandling();
    await withValidation();
    await errorHandling();
    await performanceMonitoring();
    await customConfiguration();
    await debuggingWorkflow();

    // Example 8 requires order ID
    // await productionIntegration(5378);
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        basicIntegration,
        legacyOrderHandling,
        withValidation,
        errorHandling,
        performanceMonitoring,
        customConfiguration,
        debuggingWorkflow,
        productionIntegration,
        runAllExamples
    };
}

// Run examples if executed directly
if (typeof window !== 'undefined') {
    // Browser environment
    window.PerfectPositioningExamples = {
        basicIntegration,
        legacyOrderHandling,
        withValidation,
        errorHandling,
        performanceMonitoring,
        customConfiguration,
        debuggingWorkflow,
        productionIntegration,
        runAllExamples
    };

    console.log('Perfect Positioning Examples loaded!');
    console.log('Run examples: PerfectPositioningExamples.runAllExamples()');
}
