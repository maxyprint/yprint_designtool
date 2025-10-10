/**
 * 🎯 COORDINATE LOGGING TEST SCRIPT
 * Run this in browser console to test all coordinate systems
 */

console.log('🎯 COORDINATE LOGGING TEST - Starting comprehensive test...');

// Test all available coordinate systems
const systems = [
    {
        name: 'Global Function',
        test: () => typeof window.generateDesignData === 'function' ? window.generateDesignData() : null,
        exists: typeof window.generateDesignData === 'function'
    },
    {
        name: 'YPrint Coordinate Capture',
        test: () => window.YPrintTools?.CoordinateCapture?.generateDesignData ? window.YPrintTools.CoordinateCapture.generateDesignData() : null,
        exists: !!(window.YPrintTools?.CoordinateCapture?.generateDesignData)
    },
    {
        name: 'Production Ready',
        test: () => window.ProductionReadyDesignDataCapture?.generateDesignData ? window.ProductionReadyDesignDataCapture.generateDesignData() : null,
        exists: !!(window.ProductionReadyDesignDataCapture?.generateDesignData)
    },
    {
        name: 'Optimized',
        test: () => window.OptimizedDesignDataCapture?.generateDesignData ? window.OptimizedDesignDataCapture.generateDesignData() : null,
        exists: !!(window.OptimizedDesignDataCapture?.generateDesignData)
    }
];

console.log('\n🔍 SYSTEM AVAILABILITY CHECK:');
systems.forEach(system => {
    console.log(`${system.name}: ${system.exists ? '✅ Available' : '❌ Missing'}`);
});

console.log('\n🧪 COORDINATE GENERATION TESTS:');
let successCount = 0;
let totalTests = 0;

systems.forEach(system => {
    if (system.exists) {
        totalTests++;
        console.log(`\n--- Testing ${system.name} ---`);

        try {
            const result = system.test();
            console.log('Result:', result);

            if (result && result.elements) {
                console.log(`✅ SUCCESS: Generated ${result.elements.length} elements`);
                console.log('Elements:', result.elements);
                successCount++;

                // Check if coordinates are logged via THADDÄUS
                if (typeof window.logCoordinateSystemOutput === 'function') {
                    window.logCoordinateSystemOutput(system.name, result);
                    console.log(`📝 LOGGED via THADDÄUS: ${system.name} coordinates`);
                }
            } else if (result && result.error) {
                console.log(`⚠️ ERROR: ${result.message || result.error}`);
            } else {
                console.log(`⚠️ UNEXPECTED: ${JSON.stringify(result)}`);
            }
        } catch (error) {
            console.log(`❌ EXCEPTION: ${error.message}`);
            console.error(error);
        }
    }
});

console.log(`\n📊 SUMMARY:`);
console.log(`Total systems available: ${systems.filter(s => s.exists).length}/${systems.length}`);
console.log(`Successful coordinate generation: ${successCount}/${totalTests}`);
console.log(`THADDÄUS logging available: ${typeof window.logCoordinateSystemOutput === 'function' ? '✅ YES' : '❌ NO'}`);

// Test fabric availability one more time
console.log(`\n🔍 FABRIC.JS STATUS:`);
console.log(`window.fabric available: ${typeof window.fabric !== 'undefined' ? '✅ YES' : '❌ NO'}`);
console.log(`fabricCanvas available: ${window.designerWidgetInstance?.fabricCanvas ? '✅ YES' : '❌ NO'}`);

if (window.designerWidgetInstance?.fabricCanvas) {
    try {
        const objects = window.designerWidgetInstance.fabricCanvas.getObjects();
        console.log(`Canvas objects: ${objects.length} found`);
    } catch (e) {
        console.log(`Canvas objects: ❌ Error - ${e.message}`);
    }
}

console.log('\n🎯 COORDINATE LOGGING TEST COMPLETE');