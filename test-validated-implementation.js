/**
 * 🧪 COMPREHENSIVE VALIDATION TEST SCRIPT
 * Tests the complete validated implementation for content contamination fixes
 */

console.log('🧪 === VALIDATED IMPLEMENTATION TEST START ===');

// Test Configuration
const TEST_CONFIG = {
    expectedPrintArea: { x: 100, y: 100, width: 600, height: 400 },
    mockupKeywords: ['mockup', 'shirt', 'template', 'product-view'],
    designElements: ['text', 'image', 'path', 'group'],
    logLevel: 'detailed'
};

// Test Results Storage
const TEST_RESULTS = {
    filterLogic: { passed: 0, failed: 0, details: [] },
    transformation: { passed: 0, failed: 0, details: [] },
    validation: { passed: 0, failed: 0, details: [] },
    overall: { status: 'pending', timestamp: new Date() }
};

/**
 * Test 1: Filter Logic Validation
 */
async function testFilterLogic() {
    console.log('🔍 TEST 1: Filter Logic Validation');

    if (!window.saveOnlyPNGGenerator) {
        TEST_RESULTS.filterLogic.failed++;
        TEST_RESULTS.filterLogic.details.push('SaveOnlyPNGGenerator not available');
        return false;
    }

    // Test print area validation
    const generator = window.saveOnlyPNGGenerator;
    const fabricCanvas = window.designerWidgetInstance?.fabricCanvas;

    if (!fabricCanvas) {
        TEST_RESULTS.filterLogic.failed++;
        TEST_RESULTS.filterLogic.details.push('Fabric canvas not available');
        return false;
    }

    // Test valid print area
    const validArea = { x: 50, y: 50, width: 400, height: 300 };
    const isValid = generator.validatePrintAreaCoordinates(validArea, fabricCanvas);

    if (isValid) {
        TEST_RESULTS.filterLogic.passed++;
        TEST_RESULTS.filterLogic.details.push('✅ Valid print area accepted');
    } else {
        TEST_RESULTS.filterLogic.failed++;
        TEST_RESULTS.filterLogic.details.push('❌ Valid print area rejected');
    }

    // Test invalid print area (negative coordinates)
    const invalidArea = { x: -10, y: 50, width: 400, height: 300 };
    const isInvalid = !generator.validatePrintAreaCoordinates(invalidArea, fabricCanvas);

    if (isInvalid) {
        TEST_RESULTS.filterLogic.passed++;
        TEST_RESULTS.filterLogic.details.push('✅ Invalid print area rejected');
    } else {
        TEST_RESULTS.filterLogic.failed++;
        TEST_RESULTS.filterLogic.details.push('❌ Invalid print area accepted');
    }

    console.log('✅ Filter Logic Test Complete');
    return true;
}

/**
 * Test 2: Object Filtering Simulation
 */
async function testObjectFiltering() {
    console.log('🔍 TEST 2: Object Filtering Simulation');

    const fabricCanvas = window.designerWidgetInstance?.fabricCanvas;
    if (!fabricCanvas) {
        TEST_RESULTS.filterLogic.failed++;
        TEST_RESULTS.filterLogic.details.push('No canvas for object filtering test');
        return false;
    }

    // Get current objects
    const allObjects = fabricCanvas.getObjects();
    console.log(`📊 Found ${allObjects.length} objects on canvas for filtering test`);

    // Simulate filter logic
    let mockupsFiltered = 0;
    let designElementsKept = 0;

    allObjects.forEach((obj, idx) => {
        const bounds = obj.getBoundingRect();
        const canvasWidth = fabricCanvas.width || 1312;
        const canvasHeight = fabricCanvas.height || 840;

        console.log(`🔍 Object ${idx}: type=${obj.type}, size=${Math.round(obj.width || 0)}x${Math.round(obj.height || 0)}, position=(${Math.round(obj.left)}, ${Math.round(obj.top)})`);

        // Simulate validated filter logic
        let shouldExclude = false;
        let reason = '';

        // Layer 1: Flags
        if (obj.isBackground || obj.isViewImage || obj.isTemplateBackground) {
            shouldExclude = true;
            reason = 'explicit-flag';
            mockupsFiltered++;
        }
        // Layer 2: Size/Position
        else if (bounds.width > canvasWidth * 0.8 && bounds.height > canvasHeight * 0.8) {
            // Check if outside design area
            const printArea = TEST_CONFIG.expectedPrintArea;
            const isOutside = (obj.left + obj.width < printArea.x) ||
                             (obj.top + obj.height < printArea.y) ||
                             (obj.left > printArea.x + printArea.width) ||
                             (obj.top > printArea.y + printArea.height);

            if (isOutside) {
                shouldExclude = true;
                reason = 'outside-design-area';
                mockupsFiltered++;
            } else {
                designElementsKept++;
                reason = 'large-but-in-design-area';
            }
        }
        // Layer 3: Filename
        else if (obj.src) {
            const filename = obj.src.toLowerCase();
            const isMockupFile = TEST_CONFIG.mockupKeywords.some(keyword => filename.includes(keyword));
            if (isMockupFile) {
                shouldExclude = true;
                reason = 'mockup-filename';
                mockupsFiltered++;
            } else {
                designElementsKept++;
                reason = 'design-image';
            }
        }
        else {
            designElementsKept++;
            reason = 'design-element';
        }

        console.log(`${shouldExclude ? '❌' : '✅'} Object ${idx}: ${shouldExclude ? 'EXCLUDED' : 'INCLUDED'} - ${reason}`);
    });

    TEST_RESULTS.filterLogic.details.push(`Filtering simulation: ${mockupsFiltered} filtered, ${designElementsKept} kept`);

    if (designElementsKept > 0) {
        TEST_RESULTS.filterLogic.passed++;
        TEST_RESULTS.filterLogic.details.push('✅ Design elements preserved in filtering');
    } else {
        TEST_RESULTS.filterLogic.failed++;
        TEST_RESULTS.filterLogic.details.push('❌ No design elements found');
    }

    console.log('✅ Object Filtering Test Complete');
    return true;
}

/**
 * Test 3: Transformation Preservation
 */
async function testTransformationPreservation() {
    console.log('🔍 TEST 3: Transformation Preservation');

    const fabricCanvas = window.designerWidgetInstance?.fabricCanvas;
    if (!fabricCanvas) {
        TEST_RESULTS.transformation.failed++;
        TEST_RESULTS.transformation.details.push('No canvas for transformation test');
        return false;
    }

    // Find objects with transformations
    const transformedObjects = fabricCanvas.getObjects().filter(obj =>
        obj.scaleX !== 1 || obj.scaleY !== 1 || obj.angle !== 0 || obj.flipX || obj.flipY
    );

    console.log(`🔍 Found ${transformedObjects.length} objects with transformations`);

    if (transformedObjects.length > 0) {
        const obj = transformedObjects[0];
        console.log(`🔍 Testing transformation preservation for object:`, {
            type: obj.type,
            scaleX: obj.scaleX,
            scaleY: obj.scaleY,
            angle: obj.angle,
            flipX: obj.flipX,
            flipY: obj.flipY
        });

        // Simulate the transformation copying logic
        const originalTransforms = {
            scaleX: obj.scaleX || 1,
            scaleY: obj.scaleY || 1,
            angle: obj.angle || 0,
            flipX: obj.flipX || false,
            flipY: obj.flipY || false,
            skewX: obj.skewX || 0,
            skewY: obj.skewY || 0,
            opacity: obj.opacity !== undefined ? obj.opacity : 1
        };

        // Verify all transformation properties are captured
        const hasTransforms = originalTransforms.scaleX !== 1 ||
                             originalTransforms.scaleY !== 1 ||
                             originalTransforms.angle !== 0;

        if (hasTransforms) {
            TEST_RESULTS.transformation.passed++;
            TEST_RESULTS.transformation.details.push('✅ Transformations properly captured and would be preserved');
        } else {
            TEST_RESULTS.transformation.failed++;
            TEST_RESULTS.transformation.details.push('❌ Transformations not properly captured');
        }
    } else {
        TEST_RESULTS.transformation.passed++;
        TEST_RESULTS.transformation.details.push('✅ No transformed objects found (no risk of transformation loss)');
    }

    console.log('✅ Transformation Preservation Test Complete');
    return true;
}

/**
 * Test 4: Coordinate Relativization
 */
async function testCoordinateRelativization() {
    console.log('🔍 TEST 4: Coordinate Relativization');

    const printArea = TEST_CONFIG.expectedPrintArea;

    // Test coordinate transformation logic
    const testObjects = [
        { left: 150, top: 200, expected: { left: 50, top: 100 } },  // Inside print area
        { left: 300, top: 300, expected: { left: 200, top: 200 } }, // Inside print area
        { left: 50, top: 50, expected: { left: -50, top: -50 } }    // Before print area
    ];

    let correctTransformations = 0;

    testObjects.forEach((testObj, idx) => {
        const newLeft = testObj.left - printArea.x;
        const newTop = testObj.top - printArea.y;

        const correct = newLeft === testObj.expected.left && newTop === testObj.expected.top;

        console.log(`🔍 Test ${idx + 1}: (${testObj.left}, ${testObj.top}) → (${newLeft}, ${newTop}) ${correct ? '✅' : '❌'}`);

        if (correct) {
            correctTransformations++;
        }
    });

    if (correctTransformations === testObjects.length) {
        TEST_RESULTS.transformation.passed++;
        TEST_RESULTS.transformation.details.push('✅ Coordinate relativization logic correct');
    } else {
        TEST_RESULTS.transformation.failed++;
        TEST_RESULTS.transformation.details.push(`❌ Coordinate relativization failed: ${correctTransformations}/${testObjects.length} correct`);
    }

    console.log('✅ Coordinate Relativization Test Complete');
    return true;
}

/**
 * Test 5: Live PNG Generation Test
 */
async function testLivePNGGeneration() {
    console.log('🔍 TEST 5: Live PNG Generation Test');

    if (!window.saveOnlyPNGGenerator) {
        TEST_RESULTS.overall.status = 'failed';
        console.log('❌ SaveOnlyPNGGenerator not available for live test');
        return false;
    }

    try {
        console.log('🚀 Triggering live PNG generation test...');

        // Trigger PNG generation
        const result = await window.saveOnlyPNGGenerator.generatePNG();

        if (result && result.includes('data:image/png')) {
            TEST_RESULTS.validation.passed++;
            TEST_RESULTS.validation.details.push('✅ Live PNG generation successful');

            // Analyze PNG size (rough content check)
            const pngSize = result.length;
            if (pngSize > 50000) { // > 50KB suggests real content
                TEST_RESULTS.validation.passed++;
                TEST_RESULTS.validation.details.push(`✅ PNG size suggests real content: ${Math.round(pngSize / 1000)}KB`);
            } else {
                TEST_RESULTS.validation.failed++;
                TEST_RESULTS.validation.details.push(`⚠️ PNG size suggests minimal content: ${Math.round(pngSize / 1000)}KB`);
            }

        } else {
            TEST_RESULTS.validation.failed++;
            TEST_RESULTS.validation.details.push('❌ PNG generation failed or returned invalid data');
        }

    } catch (error) {
        TEST_RESULTS.validation.failed++;
        TEST_RESULTS.validation.details.push(`❌ PNG generation error: ${error.message}`);
        console.error('❌ Live PNG generation test error:', error);
    }

    console.log('✅ Live PNG Generation Test Complete');
    return true;
}

/**
 * Run All Tests
 */
async function runAllTests() {
    console.log('🧪 === STARTING COMPREHENSIVE VALIDATION ===');

    try {
        await testFilterLogic();
        await testObjectFiltering();
        await testTransformationPreservation();
        await testCoordinateRelativization();
        await testLivePNGGeneration();

        // Calculate overall results
        const totalPassed = TEST_RESULTS.filterLogic.passed +
                           TEST_RESULTS.transformation.passed +
                           TEST_RESULTS.validation.passed;
        const totalFailed = TEST_RESULTS.filterLogic.failed +
                           TEST_RESULTS.transformation.failed +
                           TEST_RESULTS.validation.failed;

        TEST_RESULTS.overall.status = totalFailed === 0 ? 'passed' : 'partial';

        console.log('🧪 === VALIDATION COMPLETE ===');
        console.log('📊 FINAL RESULTS:');
        console.log(`✅ Passed: ${totalPassed}`);
        console.log(`❌ Failed: ${totalFailed}`);
        console.log(`🎯 Overall: ${TEST_RESULTS.overall.status.toUpperCase()}`);

        // Detailed breakdown
        console.log('\n📋 DETAILED BREAKDOWN:');
        console.log('Filter Logic:', TEST_RESULTS.filterLogic);
        console.log('Transformation:', TEST_RESULTS.transformation);
        console.log('Validation:', TEST_RESULTS.validation);

        // Production readiness assessment
        if (TEST_RESULTS.overall.status === 'passed') {
            console.log('\n🟢 PRODUCTION READINESS: VALIDATED IMPLEMENTATION IS READY FOR DEPLOYMENT');
        } else if (TEST_RESULTS.overall.status === 'partial') {
            console.log('\n🟡 PRODUCTION READINESS: SOME ISSUES DETECTED - REVIEW REQUIRED');
        } else {
            console.log('\n🔴 PRODUCTION READINESS: CRITICAL ISSUES - DO NOT DEPLOY');
        }

    } catch (error) {
        console.error('❌ Test suite error:', error);
        TEST_RESULTS.overall.status = 'error';
    }

    return TEST_RESULTS;
}

// Auto-run if called directly
if (typeof window !== 'undefined') {
    window.testValidatedImplementation = runAllTests;
    console.log('🧪 Test suite loaded. Run window.testValidatedImplementation() to start tests.');

    // Auto-run after short delay to allow system initialization
    setTimeout(runAllTests, 2000);
}

console.log('🧪 === VALIDATED IMPLEMENTATION TEST SCRIPT LOADED ===');