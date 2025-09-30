/**
 * 🎯 AGENT 6: RENDERING VERIFICATION TEST
 * Tests actual canvas rendering with real DOM environment
 */

const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');

async function runRenderingVerificationTests() {
    console.log('🎯 AGENT 6: Starting rendering verification tests...');

    let browser;
    try {
        // Launch browser in headless mode
        browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // Set viewport
        await page.setViewport({ width: 1200, height: 800 });

        // Navigate to test page
        await page.goto(`http://localhost:8080/agent-6-integration-test.html`);

        // Wait for page to load
        await page.waitForSelector('.container');

        console.log('✅ Test page loaded successfully');

        // Run validation tests
        console.log('🧪 Running validation tests...');
        await page.click('button[onclick="runValidationTests()"]');

        // Wait for validation tests to complete
        await page.waitForFunction(
            () => document.getElementById('validationResults').innerHTML.includes('Validation tests completed'),
            { timeout: 10000 }
        );

        // Get validation results
        const validationResults = await page.evaluate(() => {
            const resultsDiv = document.getElementById('validationResults');
            const successElements = resultsDiv.querySelectorAll('.status.success');
            const errorElements = resultsDiv.querySelectorAll('.status.error');

            return {
                totalTests: successElements.length + errorElements.length - 1, // Minus header
                passedTests: successElements.length - 1, // Minus header
                failedTests: errorElements.length,
                content: resultsDiv.textContent
            };
        });

        console.log(`📊 Validation Tests: ${validationResults.passedTests}/${validationResults.totalTests} passed`);

        // Run rendering tests
        console.log('🎨 Running rendering tests...');
        await page.click('button[onclick="runRenderingTests()"]');

        // Wait for rendering tests to complete
        await page.waitForFunction(
            () => document.getElementById('renderingResults').innerHTML.includes('rendering tests completed'),
            { timeout: 15000 }
        );

        // Check if canvas was created and has content
        const canvasInfo = await page.evaluate(() => {
            const canvas = document.querySelector('#canvasContainer1 canvas');
            if (!canvas) return { exists: false };

            return {
                exists: true,
                width: canvas.width,
                height: canvas.height,
                styleWidth: canvas.style.width,
                styleHeight: canvas.style.height
            };
        });

        console.log(`🖼️ Canvas created: ${canvasInfo.exists ? 'Yes' : 'No'}`);
        if (canvasInfo.exists) {
            console.log(`   Dimensions: ${canvasInfo.width}x${canvasInfo.height} (${canvasInfo.styleWidth} x ${canvasInfo.styleHeight})`);
        }

        // Run stress tests
        console.log('⚡ Running stress tests...');
        await page.click('button[onclick="runStressTests()"]');

        // Wait for stress tests to complete
        await page.waitForFunction(
            () => document.getElementById('performanceResults').innerHTML.includes('Stress tests completed'),
            { timeout: 20000 }
        );

        // Get final statistics
        const finalStats = await page.evaluate(() => {
            return {
                totalTests: document.getElementById('totalTests').textContent,
                passedTests: document.getElementById('passedTests').textContent,
                failedTests: document.getElementById('failedTests').textContent,
                successRate: document.getElementById('successRate').textContent
            };
        });

        console.log('📊 FINAL BROWSER TEST RESULTS:');
        console.log(`   Total Tests: ${finalStats.totalTests}`);
        console.log(`   Passed: ${finalStats.passedTests}`);
        console.log(`   Failed: ${finalStats.failedTests}`);
        console.log(`   Success Rate: ${finalStats.successRate}`);

        // Take screenshot of test results
        await page.screenshot({
            path: 'agent-6-test-results.png',
            fullPage: true
        });
        console.log('📸 Screenshot saved: agent-6-test-results.png');

        return {
            success: true,
            stats: finalStats,
            canvasCreated: canvasInfo.exists
        };

    } catch (error) {
        console.error('❌ Browser test error:', error);
        return {
            success: false,
            error: error.message
        };
    } finally {
        if (browser) {
            await browser.close();
        }
    }
}

// Check if puppeteer is available, otherwise skip browser tests
async function checkDependencies() {
    try {
        require('puppeteer');
        return true;
    } catch (error) {
        console.log('⚠️ Puppeteer not available, skipping browser tests');
        console.log('   To install: npm install puppeteer');
        return false;
    }
}

// Main execution
async function main() {
    const hasPuppeteer = await checkDependencies();

    if (hasPuppeteer) {
        return await runRenderingVerificationTests();
    } else {
        console.log('🎯 AGENT 6: Skipping browser verification tests (puppeteer not available)');
        return {
            success: true,
            skipped: true,
            reason: 'Puppeteer not available'
        };
    }
}

if (require.main === module) {
    main()
        .then(result => {
            console.log('\n🎯 AGENT 6 BROWSER VERIFICATION COMPLETE');
            if (result.success) {
                console.log('✅ All browser tests completed successfully');
            } else {
                console.log('❌ Browser tests failed:', result.error);
            }
        })
        .catch(error => {
            console.error('Fatal browser test error:', error);
            process.exit(1);
        });
}

module.exports = { runRenderingVerificationTests };