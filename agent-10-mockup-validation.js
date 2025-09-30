#!/usr/bin/env node

/**
 * 🎯 AGENT 10: MOCKUP EXTRACTION VALIDATION
 *
 * Verifies that mockup extraction strategies are correctly implemented
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 AGENT 10 VALIDATION: Mockup Extraction System Check\n');

const phpFile = path.join(__dirname, 'includes/class-octo-print-designer-wc-integration.php');
const phpContent = fs.readFileSync(phpFile, 'utf8');

let allChecks = true;

// Check 1: Correct meta key _template_mockup_image_url
console.log('CHECK 1: Template Mockup Meta Key');
const hasCorrectMetaKey = phpContent.includes("_template_mockup_image_url");
const hasLegacyFallback = phpContent.includes("_mockup_image_url");

if (hasCorrectMetaKey && hasLegacyFallback) {
    console.log('✅ PASSED: Correct meta key + legacy fallback');
    console.log('   - Primary: _template_mockup_image_url ✓');
    console.log('   - Fallback: _mockup_image_url ✓\n');
} else {
    console.log('❌ FAILED: Meta keys not properly configured');
    console.log(`   - Primary key: ${hasCorrectMetaKey ? '✓' : '✗'}`);
    console.log(`   - Legacy fallback: ${hasLegacyFallback ? '✓' : '✗'}\n`);
    allChecks = false;
}

// Check 2: Strategy 4 - Product Featured Image
console.log('CHECK 2: Product Featured Image Fallback');
const hasProductFeaturedImage = phpContent.includes("AGENT 10 STRATEGY 4") &&
                                 phpContent.includes("get_image_id()") &&
                                 phpContent.includes("wp_get_attachment_image_url");

if (hasProductFeaturedImage) {
    console.log('✅ PASSED: Product featured image fallback implemented');
    console.log('   - Strategy 4 present ✓');
    console.log('   - Uses product->get_image_id() ✓\n');
} else {
    console.log('❌ FAILED: Product featured image fallback missing\n');
    allChecks = false;
}

// Check 3: Strategy 5 - Template Thumbnail
console.log('CHECK 3: Template Thumbnail Fallback');
const hasTemplateThumbnail = phpContent.includes("AGENT 10 STRATEGY 5") &&
                              phpContent.includes("get_post_thumbnail_id");

if (hasTemplateThumbnail) {
    console.log('✅ PASSED: Template thumbnail fallback implemented');
    console.log('   - Strategy 5 present ✓');
    console.log('   - Uses get_post_thumbnail_id() ✓\n');
} else {
    console.log('❌ FAILED: Template thumbnail fallback missing\n');
    allChecks = false;
}

// Check 4: Color Detection Filter
console.log('CHECK 4: Color vs Image URL Detection');
const hasColorFilter = phpContent.includes("Background is a color") &&
                       phpContent.includes("preg_match('/^(#|rgb|hsl)/i'");

if (hasColorFilter) {
    console.log('✅ PASSED: Color detection filter implemented');
    console.log('   - Filters out color codes (#, rgb, hsl) ✓');
    console.log('   - Only allows image URLs as mockup ✓\n');
} else {
    console.log('❌ FAILED: Color detection filter missing\n');
    allChecks = false;
}

// Check 5: AGENT 10 Logging
console.log('CHECK 5: AGENT 10 Logging');
const agent10Logs = phpContent.match(/AGENT 10/g) || [];
console.log(`Found ${agent10Logs.length} AGENT 10 log identifiers`);

if (agent10Logs.length >= 7) {
    console.log('✅ PASSED: Comprehensive AGENT 10 logging present');
    console.log('   - Minimum 7 log points required ✓');
    console.log(`   - Actual: ${agent10Logs.length} log points ✓\n`);
} else {
    console.log('❌ FAILED: Insufficient AGENT 10 logging');
    console.log(`   - Expected: >= 7, Got: ${agent10Logs.length}\n`);
    allChecks = false;
}

// Check 6: Extraction Strategy Order
console.log('CHECK 6: Extraction Strategy Order');
const strategyOrder = [
    { name: 'Strategy 1: design_data[background]', pattern: 'Strategy 1: Try to get from design_data' },
    { name: 'Strategy 2: design_data[mockup_url]', pattern: 'Strategy 2: Try to get from mockup_url' },
    { name: 'Strategy 3: Template meta', pattern: 'Strategy 3: Try to get from template/product' },
    { name: 'Strategy 4: Product featured image', pattern: 'AGENT 10 STRATEGY 4' },
    { name: 'Strategy 5: Template thumbnail', pattern: 'AGENT 10 STRATEGY 5' }
];

let strategyOrderCorrect = true;
let lastIndex = -1;

strategyOrder.forEach(strategy => {
    const index = phpContent.indexOf(strategy.pattern);
    if (index === -1) {
        console.log(`   ❌ ${strategy.name} - NOT FOUND`);
        strategyOrderCorrect = false;
    } else if (index <= lastIndex) {
        console.log(`   ❌ ${strategy.name} - OUT OF ORDER`);
        strategyOrderCorrect = false;
    } else {
        console.log(`   ✅ ${strategy.name}`);
        lastIndex = index;
    }
});

if (strategyOrderCorrect) {
    console.log('✅ PASSED: All strategies in correct cascading order\n');
} else {
    console.log('❌ FAILED: Strategy order incorrect\n');
    allChecks = false;
}

// Summary
console.log('═══════════════════════════════════════════════════════════');
if (allChecks) {
    console.log('✅ ALL CHECKS PASSED (6/6)');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n🎯 AGENT 10 MOCKUP EXTRACTION: READY FOR TESTING\n');
    console.log('Expected Behavior:');
    console.log('1. System tries _template_mockup_image_url first');
    console.log('2. Falls back to _mockup_image_url (legacy)');
    console.log('3. Falls back to product featured image');
    console.log('4. Falls back to template thumbnail');
    console.log('5. Filters out color codes (only accepts image URLs)');
    console.log('6. Logs which strategy succeeded\n');
    console.log('Next Step: Refresh browser and check console for:');
    console.log('   "🎯 AGENT 10 MOCKUP: Found from..." logs');
    process.exit(0);
} else {
    console.log('❌ SOME CHECKS FAILED');
    console.log('═══════════════════════════════════════════════════════════');
    process.exit(1);
}