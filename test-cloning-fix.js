/**
 * 🧪 TEST SCRIPT: Robust Fabric.js Cloning System
 * Tests the new multi-method cloning approach
 */

// Test function to verify cloning improvements
async function testCloningSystem() {
    console.log('🧪 CLONING TEST: Starting test of improved cloning system...');

    // Check if the saveOnlyPNGGenerator is available
    if (!window.saveOnlyPNGGenerator) {
        console.error('❌ CLONING TEST: saveOnlyPNGGenerator not found');
        return false;
    }

    // Check if designer widget and canvas are available
    if (!window.designerWidgetInstance || !window.designerWidgetInstance.fabricCanvas) {
        console.error('❌ CLONING TEST: Designer widget or canvas not found');
        return false;
    }

    const canvas = window.designerWidgetInstance.fabricCanvas;
    const objects = canvas.getObjects();

    console.log(`🔍 CLONING TEST: Found ${objects.length} objects on canvas`);

    if (objects.length === 0) {
        console.warn('⚠️ CLONING TEST: No objects to test cloning with');
        return false;
    }

    // Test cloning each object using the new methods
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < Math.min(objects.length, 3); i++) { // Test first 3 objects
        const obj = objects[i];
        console.log(`🧪 CLONING TEST: Testing object ${i} (${obj.type})`);

        try {
            // Method 1: Traditional clone
            const cloned1 = await new Promise((resolve, reject) => {
                obj.clone((result) => {
                    if (result) {
                        resolve(result);
                    } else {
                        reject(new Error('Clone returned null'));
                    }
                });
            });

            if (cloned1) {
                console.log(`✅ CLONING TEST: Method 1 success for object ${i}`);
                successCount++;
            }

        } catch (error) {
            console.log(`⚠️ CLONING TEST: Method 1 failed for object ${i}: ${error.message}`);

            // Method 2: toObject/fromObject
            try {
                const objData = obj.toObject();
                const cloned2 = new fabric[obj.type](objData);
                if (cloned2) {
                    console.log(`✅ CLONING TEST: Method 2 success for object ${i}`);
                    successCount++;
                } else {
                    failCount++;
                }
            } catch (error2) {
                console.log(`❌ CLONING TEST: Method 2 also failed for object ${i}: ${error2.message}`);
                failCount++;
            }
        }
    }

    console.log(`🧪 CLONING TEST RESULTS: ${successCount} successes, ${failCount} failures`);

    // Test PNG generation if cloning is working
    if (successCount > 0) {
        console.log('🖨️ CLONING TEST: Testing PNG generation with improved cloning...');

        try {
            const result = await window.saveOnlyPNGGenerator.testSave('cloning-test');
            if (result && result.success) {
                console.log('✅ CLONING TEST: PNG generation successful with improved cloning!');
                return true;
            } else {
                console.log('❌ CLONING TEST: PNG generation still failing');
                return false;
            }
        } catch (error) {
            console.log('❌ CLONING TEST: PNG generation error:', error.message);
            return false;
        }
    } else {
        console.log('❌ CLONING TEST: All cloning methods failed');
        return false;
    }
}

// Auto-run test after page loads
setTimeout(() => {
    testCloningSystem().then(result => {
        console.log(`🧪 FINAL RESULT: Cloning test ${result ? 'PASSED' : 'FAILED'}`);
    });
}, 2000);

console.log('🧪 CLONING TEST: Test script loaded, will run in 2 seconds...');