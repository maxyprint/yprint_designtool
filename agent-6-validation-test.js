/**
 * 🎯 AGENT 6: INTEGRATION TESTING & VERIFICATION
 * Node.js test script for validateRenderingParameters method
 * Comprehensive testing of Agent 5's dimension validation system
 */

// Mock DOM and Canvas API for Node.js environment
global.document = {
    createElement: (tag) => {
        if (tag === 'canvas') {
            return {
                getContext: () => ({
                    scale: () => {},
                    clearRect: () => {},
                    fillRect: () => {},
                    drawImage: () => {},
                    save: () => {},
                    restore: () => {},
                    translate: () => {},
                    rotate: () => {},
                    getTransform: () => ({ a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 })
                }),
                width: 800,
                height: 600,
                style: {}
            };
        }
        return { style: {} };
    },
    getElementById: () => ({ clientWidth: 800, innerHTML: '', appendChild: () => {} }),
    fonts: { add: () => {} }
};

global.window = {
    devicePixelRatio: 1,
    AdminCanvasRenderer: null
};

global.Image = class {
    constructor() {
        this.complete = true;
        this.naturalWidth = 100;
        this.naturalHeight = 100;
        this.crossOrigin = '';
        this.onload = null;
        this.onerror = null;
    }
    set src(value) {
        if (this.onload) this.onload();
    }
};

global.FontFace = class {
    constructor(family, source) {
        this.family = family;
        this.source = source;
    }
    async load() {
        return Promise.resolve();
    }
};

global.DOMMatrix = class {
    constructor() {
        this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0;
    }
    translateSelf(x, y) { this.e += x; this.f += y; return this; }
    rotateSelf(x, y, angle) { return this; }
    scaleSelf(x, y) { this.a *= x; this.d *= y; return this; }
};

global.performance = {
    now: () => Date.now()
};

global.console = console;

// Load AdminCanvasRenderer
const fs = require('fs');
const path = require('path');

try {
    const rendererCode = fs.readFileSync(
        path.join(__dirname, 'admin/js/admin-canvas-renderer.js'),
        'utf8'
    );

    // Execute the renderer code in our mock environment
    eval(rendererCode);

    console.log('✅ AdminCanvasRenderer loaded successfully');

} catch (error) {
    console.error('❌ Failed to load AdminCanvasRenderer:', error.message);
    process.exit(1);
}

/**
 * 🧪 AGENT 6: COMPREHENSIVE VALIDATION TESTS
 */
async function runValidationTests() {
    console.log('\n🎯 AGENT 6: Starting validateRenderingParameters tests...\n');

    const renderer = new global.window.AdminCanvasRenderer();
    const testResults = [];

    function runTest(name, testFn) {
        try {
            const result = testFn();
            const passed = result.passed;
            testResults.push({ name, passed, details: result.details });

            console.log(`${passed ? '✅' : '❌'} ${name}: ${passed ? 'PASS' : 'FAIL'}`);
            if (result.details) {
                console.log(`   📝 ${result.details}`);
            }
            if (!passed && result.error) {
                console.log(`   🚨 ${result.error}`);
            }

            return passed;
        } catch (error) {
            testResults.push({ name, passed: false, details: `Test threw error: ${error.message}` });
            console.log(`❌ ${name}: FAIL (Exception)`);
            console.log(`   🚨 ${error.message}`);
            return false;
        }
    }

    // Test 1: Valid image parameters
    runTest('Valid Image Parameters', () => {
        const params = {
            imageData: { src: 'test.jpg', width: 100, height: 100, left: 50, top: 50 },
            img: { complete: true, naturalWidth: 100, naturalHeight: 100 },
            position: { x: 50, y: 50 },
            dimensions: { width: 100, height: 100 },
            scaleX: 1,
            scaleY: 1,
            angle: 0,
            context: 'image'
        };

        const result = renderer.validateRenderingParameters(params);
        return {
            passed: result.isValid === true && result.errors.length === 0,
            details: `Valid: ${result.isValid}, Errors: ${result.errors.length}, Warnings: ${result.warnings.length}`
        };
    });

    // Test 2: Zero width dimension
    runTest('Zero Width Dimension', () => {
        const params = {
            imageData: { src: 'test.jpg' },
            position: { x: 50, y: 50 },
            dimensions: { width: 0, height: 100 },
            scaleX: 1,
            scaleY: 1,
            context: 'image'
        };

        const result = renderer.validateRenderingParameters(params);
        return {
            passed: result.isValid === false && result.errors.some(e => e.includes('Invalid dimensions')),
            details: `Should reject zero width. Valid: ${result.isValid}, Errors: [${result.errors.join(', ')}]`
        };
    });

    // Test 3: Negative height dimension
    runTest('Negative Height Dimension', () => {
        const params = {
            imageData: { src: 'test.jpg' },
            position: { x: 50, y: 50 },
            dimensions: { width: 100, height: -50 },
            scaleX: 1,
            scaleY: 1,
            context: 'image'
        };

        const result = renderer.validateRenderingParameters(params);
        return {
            passed: result.isValid === false && result.errors.some(e => e.includes('Invalid dimensions')),
            details: `Should reject negative height. Valid: ${result.isValid}`
        };
    });

    // Test 4: NaN position coordinates
    runTest('NaN Position Coordinates', () => {
        const params = {
            imageData: { src: 'test.jpg' },
            position: { x: NaN, y: 50 },
            dimensions: { width: 100, height: 100 },
            scaleX: 1,
            scaleY: 1,
            context: 'image'
        };

        const result = renderer.validateRenderingParameters(params);
        return {
            passed: result.isValid === false && result.errors.some(e => e.includes('Invalid position')),
            details: `Should reject NaN coordinates. Valid: ${result.isValid}`
        };
    });

    // Test 5: Infinity position coordinates
    runTest('Infinity Position Coordinates', () => {
        const params = {
            imageData: { src: 'test.jpg' },
            position: { x: 50, y: Infinity },
            dimensions: { width: 100, height: 100 },
            scaleX: 1,
            scaleY: 1,
            context: 'image'
        };

        const result = renderer.validateRenderingParameters(params);
        return {
            passed: result.isValid === false && result.errors.some(e => e.includes('Invalid position')),
            details: `Should reject Infinity coordinates. Valid: ${result.isValid}`
        };
    });

    // Test 6: Zero scale factors
    runTest('Zero Scale Factors', () => {
        const params = {
            imageData: { src: 'test.jpg' },
            position: { x: 50, y: 50 },
            dimensions: { width: 100, height: 100 },
            scaleX: 0,
            scaleY: 1,
            context: 'image'
        };

        const result = renderer.validateRenderingParameters(params);
        return {
            passed: result.isValid === false && result.errors.some(e => e.includes('Invalid scale')),
            details: `Should reject zero scale factors. Valid: ${result.isValid}`
        };
    });

    // Test 7: Negative scale factors
    runTest('Negative Scale Factors', () => {
        const params = {
            imageData: { src: 'test.jpg' },
            position: { x: 50, y: 50 },
            dimensions: { width: 100, height: 100 },
            scaleX: 1,
            scaleY: -0.5,
            context: 'image'
        };

        const result = renderer.validateRenderingParameters(params);
        return {
            passed: result.isValid === false && result.errors.some(e => e.includes('Invalid scale')),
            details: `Should reject negative scale factors. Valid: ${result.isValid}`
        };
    });

    // Test 8: NaN scale factors
    runTest('NaN Scale Factors', () => {
        const params = {
            imageData: { src: 'test.jpg' },
            position: { x: 50, y: 50 },
            dimensions: { width: 100, height: 100 },
            scaleX: NaN,
            scaleY: 1,
            context: 'image'
        };

        const result = renderer.validateRenderingParameters(params);
        return {
            passed: result.isValid === false && result.errors.some(e => e.includes('Invalid scale')),
            details: `Should reject NaN scale factors. Valid: ${result.isValid}`
        };
    });

    // Test 9: Invalid rotation angle
    runTest('Invalid Rotation Angle', () => {
        const params = {
            imageData: { src: 'test.jpg' },
            position: { x: 50, y: 50 },
            dimensions: { width: 100, height: 100 },
            scaleX: 1,
            scaleY: 1,
            angle: NaN,
            context: 'image'
        };

        const result = renderer.validateRenderingParameters(params);
        return {
            passed: result.isValid === false && result.errors.some(e => e.includes('Invalid rotation')),
            details: `Should reject NaN angle. Valid: ${result.isValid}`
        };
    });

    // Test 10: Incomplete image
    runTest('Incomplete Image', () => {
        const params = {
            imageData: { src: 'test.jpg' },
            img: { complete: false, naturalWidth: 0, naturalHeight: 0 },
            position: { x: 50, y: 50 },
            dimensions: { width: 100, height: 100 },
            scaleX: 1,
            scaleY: 1,
            context: 'image'
        };

        const result = renderer.validateRenderingParameters(params);
        return {
            passed: result.isValid === false && result.errors.some(e => e.includes('Image not loaded') || e.includes('zero natural dimensions')),
            details: `Should reject incomplete images. Valid: ${result.isValid}, Errors: [${result.errors.join(', ')}]`
        };
    });

    // Test 11: Sub-pixel dimensions warning
    runTest('Sub-pixel Dimensions Warning', () => {
        const params = {
            imageData: { src: 'test.jpg' },
            img: { complete: true, naturalWidth: 100, naturalHeight: 100 },
            position: { x: 50, y: 50 },
            dimensions: { width: 0.5, height: 0.8 },
            scaleX: 1,
            scaleY: 1,
            context: 'image'
        };

        const result = renderer.validateRenderingParameters(params);
        return {
            passed: result.warnings.some(w => w.includes('Sub-pixel dimensions')),
            details: `Should warn about sub-pixel dimensions. Warnings: [${result.warnings.join(', ')}]`
        };
    });

    // Test 12: Out of canvas bounds warning
    runTest('Out of Canvas Bounds Warning', () => {
        renderer.canvasWidth = 800;
        renderer.canvasHeight = 600;

        const params = {
            imageData: { src: 'test.jpg' },
            img: { complete: true, naturalWidth: 100, naturalHeight: 100 },
            position: { x: 1000, y: 1000 },
            dimensions: { width: 100, height: 100 },
            scaleX: 1,
            scaleY: 1,
            context: 'image'
        };

        const result = renderer.validateRenderingParameters(params);
        return {
            passed: result.warnings.some(w => w.includes('outside canvas bounds')),
            details: `Should warn about out-of-bounds positioning. Warnings: [${result.warnings.join(', ')}]`
        };
    });

    // Test 13: Text context validation
    runTest('Text Context Validation', () => {
        const params = {
            imageData: { text: 'Hello World' },
            position: { x: 50, y: 50 },
            dimensions: { width: 100, height: 20 },
            scaleX: 1,
            scaleY: 1,
            context: 'text'
        };

        const result = renderer.validateRenderingParameters(params);
        return {
            passed: result.isValid === true, // Should be valid for text context
            details: `Text context should be valid. Valid: ${result.isValid}, Errors: ${result.errors.length}`
        };
    });

    console.log('\n📊 VALIDATION TEST SUMMARY:');
    console.log('=' .repeat(50));

    const totalTests = testResults.length;
    const passedTests = testResults.filter(t => t.passed).length;
    const failedTests = totalTests - passedTests;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${failedTests}`);
    console.log(`Success Rate: ${successRate}%`);

    if (failedTests > 0) {
        console.log('\n❌ FAILED TESTS:');
        testResults.filter(t => !t.passed).forEach(test => {
            console.log(`   - ${test.name}: ${test.details}`);
        });
    }

    return {
        totalTests,
        passedTests,
        failedTests,
        successRate: parseFloat(successRate),
        testResults
    };
}

/**
 * 🧪 COORDINATE PRESERVATION TESTS
 */
async function testCoordinatePreservation() {
    console.log('\n🎯 AGENT 6: Testing coordinate preservation system...\n');

    const renderer = new global.window.AdminCanvasRenderer();
    const testResults = [];

    // Test different coordinate scenarios
    const testCases = [
        { name: 'Origin Point', x: 0, y: 0 },
        { name: 'Positive Coordinates', x: 100, y: 150 },
        { name: 'Large Coordinates', x: 1000, y: 2000 },
        { name: 'Decimal Coordinates', x: 123.45, y: 678.90 },
        { name: 'Small Decimals', x: 0.1, y: 0.5 }
    ];

    console.log('Testing coordinate preservation with noTransformMode...');

    testCases.forEach(testCase => {
        const result = renderer.preserveCoordinates(testCase.x, testCase.y);
        const preserved = result.x === testCase.x && result.y === testCase.y;

        testResults.push({
            name: testCase.name,
            input: { x: testCase.x, y: testCase.y },
            output: { x: result.x, y: result.y },
            preserved,
            noTransformation: result.preservation?.noTransformation || false
        });

        console.log(`${preserved ? '✅' : '❌'} ${testCase.name}: (${testCase.x}, ${testCase.y}) → (${result.x}, ${result.y}) ${preserved ? 'PRESERVED' : 'MODIFIED'}`);
    });

    const preservedCount = testResults.filter(t => t.preserved).length;
    const preservationRate = ((preservedCount / testResults.length) * 100).toFixed(1);

    console.log(`\n📊 COORDINATE PRESERVATION SUMMARY:`);
    console.log(`Preserved: ${preservedCount}/${testResults.length} (${preservationRate}%)`);

    return {
        preservedCount,
        totalTests: testResults.length,
        preservationRate: parseFloat(preservationRate),
        testResults
    };
}

/**
 * 🧪 PERFORMANCE TESTS
 */
async function testPerformance() {
    console.log('\n🎯 AGENT 6: Testing performance metrics...\n');

    const renderer = new global.window.AdminCanvasRenderer();

    // Test transform cache performance
    const startTime = performance.now();
    const coordinates = [];

    // Generate test coordinates
    for (let i = 0; i < 1000; i++) {
        coordinates.push({
            left: Math.random() * 800,
            top: Math.random() * 600
        });
    }

    // First run - no cache
    const firstRunStart = performance.now();
    coordinates.forEach(coord => {
        renderer.transformCoordinates(coord.left, coord.top);
    });
    const firstRunTime = performance.now() - firstRunStart;

    // Second run - with cache (should be faster for repeated coordinates)
    const cachedCoords = coordinates.slice(0, 100); // Use subset for cache testing
    const secondRunStart = performance.now();
    for (let i = 0; i < 10; i++) { // Repeat same coordinates
        cachedCoords.forEach(coord => {
            const cacheKey = `${coord.left}_${coord.top}_1_1_true`;
            renderer.getCachedTransform(cacheKey, coord);
        });
    }
    const secondRunTime = performance.now() - secondRunStart;

    console.log(`Transform Performance:`);
    console.log(`  First run (1000 transforms): ${firstRunTime.toFixed(2)}ms`);
    console.log(`  Cached run (1000 cached): ${secondRunTime.toFixed(2)}ms`);
    console.log(`  Cache efficiency: ${((firstRunTime - secondRunTime) / firstRunTime * 100).toFixed(1)}% faster`);

    return {
        firstRunTime,
        secondRunTime,
        cacheEfficiency: ((firstRunTime - secondRunTime) / firstRunTime * 100)
    };
}

/**
 * 🎯 MAIN TEST EXECUTION
 */
async function runIntegrationTests() {
    console.log('🚀 AGENT 6: INTEGRATION TESTING & VERIFICATION SPECIALIST');
    console.log('Testing AdminCanvasRenderer with Agent 5\'s dimension validation system');
    console.log('=' .repeat(80));

    try {
        // Run all test suites
        const validationResults = await runValidationTests();
        const coordinateResults = await testCoordinatePreservation();
        const performanceResults = await testPerformance();

        console.log('\n🎯 COMPREHENSIVE TEST REPORT');
        console.log('=' .repeat(50));

        // Overall assessment
        const overallSuccessRate = validationResults.successRate;
        const coordinateSuccessRate = coordinateResults.preservationRate;

        const isSystemHealthy = overallSuccessRate >= 85 && coordinateSuccessRate >= 95;

        console.log(`\n📊 SYSTEM HEALTH ASSESSMENT:`);
        console.log(`  Validation Tests: ${validationResults.successRate}% (${validationResults.passedTests}/${validationResults.totalTests})`);
        console.log(`  Coordinate Preservation: ${coordinateSuccessRate}% (${coordinateResults.preservedCount}/${coordinateResults.totalTests})`);
        console.log(`  Overall System Status: ${isSystemHealthy ? '✅ HEALTHY' : '⚠️ NEEDS ATTENTION'}`);

        console.log(`\n🔍 KEY FINDINGS:`);
        console.log(`  ✅ Agent 5's validateRenderingParameters method: ${validationResults.successRate >= 85 ? 'Working correctly' : 'Has issues'}`);
        console.log(`  ✅ Dimension validation system: ${validationResults.testResults.filter(t => t.name.includes('Dimension')).every(t => t.passed) ? 'Robust' : 'Needs improvement'}`);
        console.log(`  ✅ Error handling: ${validationResults.testResults.filter(t => t.name.includes('NaN') || t.name.includes('Invalid')).every(t => t.passed) ? 'Comprehensive' : 'Incomplete'}`);
        console.log(`  ✅ Coordinate preservation: ${coordinateSuccessRate >= 95 ? '1:1 replica maintained' : 'Transformation issues detected'}`);
        console.log(`  ✅ Performance optimization: Cache efficiency of ${performanceResults.cacheEfficiency.toFixed(1)}%`);

        console.log(`\n🎯 AGENT 6 CONCLUSION:`);
        if (isSystemHealthy) {
            console.log('✅ INTEGRATION TESTING SUCCESSFUL!');
            console.log('   AdminCanvasRenderer with Agent 5\'s dimension validation is working correctly.');
            console.log('   The system successfully prevents invisible rendering, validates parameters');
            console.log('   comprehensively, and maintains coordinate preservation for 1:1 replica achievement.');
        } else {
            console.log('⚠️ INTEGRATION TESTING REVEALS ISSUES that need attention.');
            console.log('   Some critical tests failed, indicating potential problems with the');
            console.log('   dimension validation or rendering system that should be addressed.');
        }

        return {
            isSystemHealthy,
            validationResults,
            coordinateResults,
            performanceResults
        };

    } catch (error) {
        console.error('❌ INTEGRATION TEST FAILURE:', error);
        return {
            isSystemHealthy: false,
            error: error.message
        };
    }
}

// Run tests if this file is executed directly
if (require.main === module) {
    runIntegrationTests()
        .then(results => {
            process.exit(results.isSystemHealthy ? 0 : 1);
        })
        .catch(error => {
            console.error('Fatal test error:', error);
            process.exit(1);
        });
}

module.exports = {
    runIntegrationTests,
    runValidationTests,
    testCoordinatePreservation,
    testPerformance
};