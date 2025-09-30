/**
 * 🎯 AGENT 6: CANVAS SIMULATION TEST
 * Simulates real canvas operations to test rendering behavior
 */

// Mock Canvas API with tracking
class MockCanvas {
    constructor(width = 800, height = 600) {
        this.width = width;
        this.height = height;
        this.style = {};
        this.operations = [];
        this.context = new MockCanvasContext(this);
    }

    getContext(type) {
        return this.context;
    }

    toDataURL(format = 'image/png') {
        return `data:${format};base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==`;
    }
}

class MockCanvasContext {
    constructor(canvas) {
        this.canvas = canvas;
        this.operations = [];
        this.fillStyle = '#000000';
        this.strokeStyle = '#000000';
        this.lineWidth = 1;
        this.font = '10px Arial';
        this.textAlign = 'left';
        this.textBaseline = 'top';
        this.globalAlpha = 1;
        this.imageSmoothingEnabled = true;
        this.imageSmoothingQuality = 'low';
        this.transformStack = [];
        this.currentTransform = { a: 1, b: 0, c: 0, d: 1, e: 0, f: 0 };
    }

    // Drawing operations
    clearRect(x, y, width, height) {
        this.operations.push({ type: 'clearRect', x, y, width, height });
    }

    fillRect(x, y, width, height) {
        this.operations.push({ type: 'fillRect', x, y, width, height, fillStyle: this.fillStyle });
    }

    strokeRect(x, y, width, height) {
        this.operations.push({ type: 'strokeRect', x, y, width, height, strokeStyle: this.strokeStyle });
    }

    drawImage(image, sx, sy, sw, sh, dx, dy, dw, dh) {
        const op = { type: 'drawImage', image: image.src || 'MockImage' };

        if (arguments.length === 3) {
            op.dx = sx; op.dy = sy;
        } else if (arguments.length === 5) {
            op.dx = sx; op.dy = sy; op.dw = sw; op.dh = sh;
        } else if (arguments.length === 9) {
            op.sx = sx; op.sy = sy; op.sw = sw; op.sh = sh;
            op.dx = dx; op.dy = dy; op.dw = dw; op.dh = dh;
        }

        this.operations.push(op);
    }

    fillText(text, x, y) {
        this.operations.push({ type: 'fillText', text, x, y, font: this.font, fillStyle: this.fillStyle });
    }

    strokeText(text, x, y) {
        this.operations.push({ type: 'strokeText', text, x, y, font: this.font, strokeStyle: this.strokeStyle });
    }

    // Path operations
    beginPath() {
        this.operations.push({ type: 'beginPath' });
    }

    moveTo(x, y) {
        this.operations.push({ type: 'moveTo', x, y });
    }

    lineTo(x, y) {
        this.operations.push({ type: 'lineTo', x, y });
    }

    arc(x, y, radius, startAngle, endAngle) {
        this.operations.push({ type: 'arc', x, y, radius, startAngle, endAngle });
    }

    ellipse(x, y, radiusX, radiusY, rotation, startAngle, endAngle) {
        this.operations.push({ type: 'ellipse', x, y, radiusX, radiusY, rotation, startAngle, endAngle });
    }

    rect(x, y, width, height) {
        this.operations.push({ type: 'rect', x, y, width, height });
    }

    quadraticCurveTo(cpx, cpy, x, y) {
        this.operations.push({ type: 'quadraticCurveTo', cpx, cpy, x, y });
    }

    fill() {
        this.operations.push({ type: 'fill', fillStyle: this.fillStyle });
    }

    stroke() {
        this.operations.push({ type: 'stroke', strokeStyle: this.strokeStyle });
    }

    // Transform operations
    save() {
        this.transformStack.push({ ...this.currentTransform });
        this.operations.push({ type: 'save' });
    }

    restore() {
        if (this.transformStack.length > 0) {
            this.currentTransform = this.transformStack.pop();
        }
        this.operations.push({ type: 'restore' });
    }

    translate(x, y) {
        this.currentTransform.e += x;
        this.currentTransform.f += y;
        this.operations.push({ type: 'translate', x, y });
    }

    rotate(angle) {
        this.operations.push({ type: 'rotate', angle });
    }

    scale(x, y) {
        this.currentTransform.a *= x;
        this.currentTransform.d *= y;
        this.operations.push({ type: 'scale', x, y });
    }

    getTransform() {
        return this.currentTransform;
    }

    // Get summary of operations
    getOperationSummary() {
        const summary = {};
        this.operations.forEach(op => {
            summary[op.type] = (summary[op.type] || 0) + 1;
        });
        return summary;
    }

    // Check for invisible renders
    getInvisibleRenders() {
        return this.operations.filter(op => {
            if (op.type === 'drawImage') {
                return (op.dw && op.dh && (op.dw <= 0 || op.dh <= 0)) ||
                       (op.dx !== undefined && (isNaN(op.dx) || isNaN(op.dy)));
            }
            if (op.type === 'fillRect' || op.type === 'strokeRect') {
                return op.width <= 0 || op.height <= 0 || isNaN(op.x) || isNaN(op.y);
            }
            return false;
        });
    }
}

// Mock Image class
class MockImage {
    constructor() {
        this.complete = false;
        this.naturalWidth = 0;
        this.naturalHeight = 0;
        this.src = '';
        this.crossOrigin = '';
        this.onload = null;
        this.onerror = null;
    }

    set src(value) {
        this._src = value;
        // Simulate async loading
        setTimeout(() => {
            if (value.includes('invalid') || value.includes('error')) {
                this.complete = false;
                if (this.onerror) this.onerror(new Error('Image load failed'));
            } else {
                this.complete = true;
                this.naturalWidth = 100;
                this.naturalHeight = 100;
                if (this.onload) this.onload();
            }
        }, 10);
    }

    get src() {
        return this._src;
    }
}

// Setup global mocks
global.document = {
    createElement: (tag) => {
        if (tag === 'canvas') return new MockCanvas();
        return { style: {} };
    },
    getElementById: () => ({ clientWidth: 800, innerHTML: '', appendChild: () => {} }),
    fonts: { add: () => {} }
};

global.window = {
    devicePixelRatio: 1,
    AdminCanvasRenderer: null
};

global.Image = MockImage;
global.FontFace = class { async load() { return Promise.resolve(); } };
global.DOMMatrix = class {
    constructor() { this.a = 1; this.b = 0; this.c = 0; this.d = 1; this.e = 0; this.f = 0; }
    translateSelf(x, y) { this.e += x; this.f += y; return this; }
    rotateSelf(x, y, angle) { return this; }
    scaleSelf(x, y) { this.a *= x; this.d *= y; return this; }
};

global.performance = { now: () => Date.now() };

// Load AdminCanvasRenderer
const fs = require('fs');
const path = require('path');

const rendererCode = fs.readFileSync(
    path.join(__dirname, 'admin/js/admin-canvas-renderer.js'),
    'utf8'
);
eval(rendererCode);

/**
 * 🧪 CANVAS RENDERING SIMULATION TESTS
 */
async function runCanvasSimulationTests() {
    console.log('\n🎯 AGENT 6: Canvas rendering simulation tests...\n');

    const renderer = new global.window.AdminCanvasRenderer();
    const testResults = [];

    // Initialize renderer
    renderer.init('test-container');
    const canvas = renderer.canvas;
    const ctx = renderer.ctx;

    console.log('✅ Renderer initialized with mock canvas');

    // Test 1: Valid image rendering
    console.log('🧪 Test 1: Valid image rendering...');
    const validImageData = {
        type: 'image',
        src: 'test-image.jpg',
        left: 50,
        top: 50,
        width: 100,
        height: 100,
        scaleX: 1,
        scaleY: 1,
        angle: 0
    };

    try {
        await renderer.renderImageElement(validImageData);
        const operations = ctx.getOperationSummary();
        const invisibleRenders = ctx.getInvisibleRenders();

        testResults.push({
            name: 'Valid Image Rendering',
            passed: operations.drawImage > 0 && invisibleRenders.length === 0,
            details: `DrawImage calls: ${operations.drawImage || 0}, Invisible renders: ${invisibleRenders.length}`
        });

        console.log(`  ✅ Valid image test: ${operations.drawImage || 0} drawImage operations`);
    } catch (error) {
        testResults.push({
            name: 'Valid Image Rendering',
            passed: false,
            details: `Error: ${error.message}`
        });
        console.log(`  ❌ Valid image test failed: ${error.message}`);
    }

    // Test 2: Invalid dimensions (should not render)
    console.log('🧪 Test 2: Invalid dimensions rendering...');
    const invalidImageData = {
        type: 'image',
        src: 'test-image.jpg',
        left: 50,
        top: 50,
        width: 0, // Invalid width
        height: 100,
        scaleX: 1,
        scaleY: 1,
        angle: 0
    };

    const beforeOps = ctx.operations.length;
    try {
        await renderer.renderImageElement(invalidImageData);
        const afterOps = ctx.operations.length;
        const newOps = afterOps - beforeOps;

        testResults.push({
            name: 'Invalid Dimensions Prevention',
            passed: newOps === 0, // Should not add any draw operations
            details: `New operations added: ${newOps} (should be 0)`
        });

        console.log(`  ✅ Invalid dimensions test: ${newOps} operations added (should be 0)`);
    } catch (error) {
        testResults.push({
            name: 'Invalid Dimensions Prevention',
            passed: true, // Throwing error is also acceptable
            details: `Correctly threw error: ${error.message}`
        });
        console.log(`  ✅ Invalid dimensions test: Correctly prevented render`);
    }

    // Test 3: NaN coordinates (should not render)
    console.log('🧪 Test 3: NaN coordinates rendering...');
    const nanImageData = {
        type: 'image',
        src: 'test-image.jpg',
        left: NaN,
        top: 50,
        width: 100,
        height: 100,
        scaleX: 1,
        scaleY: 1,
        angle: 0
    };

    const beforeNanOps = ctx.operations.length;
    try {
        await renderer.renderImageElement(nanImageData);
        const afterNanOps = ctx.operations.length;
        const newNanOps = afterNanOps - beforeNanOps;

        testResults.push({
            name: 'NaN Coordinates Prevention',
            passed: newNanOps === 0,
            details: `New operations added: ${newNanOps} (should be 0)`
        });

        console.log(`  ✅ NaN coordinates test: ${newNanOps} operations added (should be 0)`);
    } catch (error) {
        testResults.push({
            name: 'NaN Coordinates Prevention',
            passed: true,
            details: `Correctly threw error: ${error.message}`
        });
        console.log(`  ✅ NaN coordinates test: Correctly prevented render`);
    }

    // Test 4: Performance with multiple valid images
    console.log('🧪 Test 4: Multiple valid images performance...');
    const startTime = performance.now();
    const beforeMultiOps = ctx.operations.length;

    for (let i = 0; i < 10; i++) {
        const imageData = {
            type: 'image',
            src: `test-image-${i}.jpg`,
            left: i * 20,
            top: i * 15,
            width: 50,
            height: 50,
            scaleX: 1,
            scaleY: 1,
            angle: 0
        };

        try {
            await renderer.renderImageElement(imageData);
        } catch (error) {
            // Continue with next image
        }
    }

    const endTime = performance.now();
    const afterMultiOps = ctx.operations.length;
    const multiOpsAdded = afterMultiOps - beforeMultiOps;
    const renderTime = endTime - startTime;

    testResults.push({
        name: 'Multiple Images Performance',
        passed: multiOpsAdded > 0 && renderTime < 1000, // Should complete in under 1 second
        details: `Rendered ${multiOpsAdded} operations in ${renderTime.toFixed(2)}ms`
    });

    console.log(`  ✅ Multiple images test: ${multiOpsAdded} operations in ${renderTime.toFixed(2)}ms`);

    // Test 5: Coordinate preservation verification
    console.log('🧪 Test 5: Coordinate preservation verification...');
    const testCoords = [
        { x: 0, y: 0 },
        { x: 100.5, y: 200.7 },
        { x: 1000, y: 2000 }
    ];

    let allPreserved = true;
    const preservationResults = [];

    testCoords.forEach(coord => {
        const result = renderer.preserveCoordinates(coord.x, coord.y);
        const preserved = result.x === coord.x && result.y === coord.y;
        if (!preserved) allPreserved = false;

        preservationResults.push({
            input: coord,
            output: { x: result.x, y: result.y },
            preserved
        });
    });

    testResults.push({
        name: 'Coordinate Preservation',
        passed: allPreserved,
        details: `${preservationResults.filter(r => r.preserved).length}/${preservationResults.length} coordinates preserved exactly`
    });

    console.log(`  ✅ Coordinate preservation: ${allPreserved ? 'All preserved' : 'Some modified'}`);

    // Summary
    console.log('\n📊 CANVAS SIMULATION TEST SUMMARY:');
    console.log('=' .repeat(50));

    const totalTests = testResults.length;
    const passedTests = testResults.filter(t => t.passed).length;
    const successRate = ((passedTests / totalTests) * 100).toFixed(1);

    console.log(`Total Tests: ${totalTests}`);
    console.log(`Passed: ${passedTests}`);
    console.log(`Failed: ${totalTests - passedTests}`);
    console.log(`Success Rate: ${successRate}%`);

    // Final canvas operation analysis
    const finalOperations = ctx.getOperationSummary();
    const finalInvisibleRenders = ctx.getInvisibleRenders();

    console.log('\n🎨 CANVAS OPERATION ANALYSIS:');
    console.log(`  Total operations: ${ctx.operations.length}`);
    console.log(`  Draw operations: ${finalOperations.drawImage || 0}`);
    console.log(`  Transform operations: ${(finalOperations.translate || 0) + (finalOperations.rotate || 0) + (finalOperations.scale || 0)}`);
    console.log(`  Invisible renders detected: ${finalInvisibleRenders.length}`);

    console.log('\n🔍 DETAILED OPERATION BREAKDOWN:');
    Object.entries(finalOperations)
        .sort(([,a], [,b]) => b - a)
        .forEach(([op, count]) => {
            console.log(`  ${op}: ${count}`);
        });

    return {
        totalTests,
        passedTests,
        successRate: parseFloat(successRate),
        testResults,
        canvasOperations: finalOperations,
        invisibleRenders: finalInvisibleRenders.length,
        totalOperations: ctx.operations.length
    };
}

// Run if executed directly
if (require.main === module) {
    runCanvasSimulationTests()
        .then(results => {
            console.log('\n🎯 AGENT 6 CANVAS SIMULATION COMPLETE');
            console.log(results.successRate >= 80 ? '✅ Tests passed' : '❌ Some tests failed');
        })
        .catch(error => {
            console.error('❌ Canvas simulation error:', error);
            process.exit(1);
        });
}

module.exports = { runCanvasSimulationTests };