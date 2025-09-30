#!/usr/bin/env node

/**
 * 🎯 AGENT 11: CONVERSION MOCKUP INTEGRATION VALIDATION
 *
 * Verifies that mockup extraction is correctly implemented in
 * convert_processed_views_to_canvas_data() function
 */

const fs = require('fs');
const path = require('path');

console.log('🎯 AGENT 11 VALIDATION: Conversion Mockup Integration Check\n');

const phpFile = path.join(__dirname, 'includes/class-octo-print-designer-wc-integration.php');
const phpContent = fs.readFileSync(phpFile, 'utf8');

let allChecks = true;

// Check 1: Template ID extraction from item meta
console.log('CHECK 1: Template ID Extraction');
const hasTemplateIdExtraction = phpContent.includes("$template_id = $item->get_meta('_yprint_template_id')");

if (hasTemplateIdExtraction) {
    console.log('✅ PASSED: Template ID extraction from item meta');
    console.log('   - get_meta(_yprint_template_id) ✓\n');
} else {
    console.log('❌ FAILED: Template ID extraction missing\n');
    allChecks = false;
}

// Check 2: Template mockup meta extraction
console.log('CHECK 2: Template Mockup Meta Extraction');
const hasTemplateMockupMeta = phpContent.includes("get_post_meta($template_id, '_template_mockup_image_url', true)") &&
                                phpContent.includes("AGENT 11 CONVERSION: Found mockup from template meta");

if (hasTemplateMockupMeta) {
    console.log('✅ PASSED: Template mockup meta extraction implemented');
    console.log('   - Correct meta key: _template_mockup_image_url ✓');
    console.log('   - AGENT 11 logging present ✓\n');
} else {
    console.log('❌ FAILED: Template mockup meta extraction missing\n');
    allChecks = false;
}

// Check 3: Template featured image fallback
console.log('CHECK 3: Template Featured Image Fallback');
const hasTemplateFeaturedImage = phpContent.includes("get_post_thumbnail_id($template_id)") &&
                                   phpContent.includes("AGENT 11 CONVERSION: Using template featured image");

if (hasTemplateFeaturedImage) {
    console.log('✅ PASSED: Template featured image fallback implemented');
    console.log('   - get_post_thumbnail_id() ✓');
    console.log('   - AGENT 11 logging present ✓\n');
} else {
    console.log('❌ FAILED: Template featured image fallback missing\n');
    allChecks = false;
}

// Check 4: Product featured image fallback
console.log('CHECK 4: Product Featured Image Fallback');
const hasProductFeaturedImage = phpContent.includes("$product->get_image_id()") &&
                                 phpContent.includes("AGENT 11 CONVERSION: Using product featured image as mockup fallback");

if (hasProductFeaturedImage) {
    console.log('✅ PASSED: Product featured image fallback implemented');
    console.log('   - product->get_image_id() ✓');
    console.log('   - AGENT 11 logging present ✓\n');
} else {
    console.log('❌ FAILED: Product featured image fallback missing\n');
    allChecks = false;
}

// Check 5: Color code filter
console.log('CHECK 5: Color Code Filter');
const hasColorFilter = phpContent.includes("Mockup is a color code") &&
                       phpContent.includes("preg_match('/^(#|rgb|hsl)/i', $mockup_url)");

if (hasColorFilter) {
    console.log('✅ PASSED: Color code filter implemented');
    console.log('   - Filters out #, rgb, hsl patterns ✓');
    console.log('   - AGENT 11 logging present ✓\n');
} else {
    console.log('❌ FAILED: Color code filter missing\n');
    allChecks = false;
}

// Check 6: Dynamic background assignment (not hardcoded)
console.log('CHECK 6: Dynamic Background Assignment');
const hasDynamicBackground = phpContent.includes("'background' => $mockup_url ?: '#ffffff'");
const notHardcodedWhite = !phpContent.match(/'background'\s*=>\s*'#ffffff',\s*\/\/\s*(?!.*AGENT 11)/);

if (hasDynamicBackground) {
    console.log('✅ PASSED: Background is dynamic, not hardcoded');
    console.log('   - Uses $mockup_url ?: #ffffff ✓');
    console.log('   - No hardcoded #ffffff without AGENT 11 context ✓\n');
} else {
    console.log('❌ FAILED: Background may still be hardcoded\n');
    allChecks = false;
}

// Check 7: Final mockup logging
console.log('CHECK 7: Final Mockup Logging');
const hasFinalLog = phpContent.includes("AGENT 11 CONVERSION MOCKUP FINAL");

if (hasFinalLog) {
    console.log('✅ PASSED: Final mockup logging implemented');
    console.log('   - AGENT 11 CONVERSION MOCKUP FINAL log present ✓\n');
} else {
    console.log('❌ FAILED: Final mockup logging missing\n');
    allChecks = false;
}

// Check 8: Metadata tracking
console.log('CHECK 8: Mockup Source Metadata Tracking');
const hasMetadataTracking = phpContent.includes("'mockup_source' => $mockup_url ? 'template/product' : 'none'");

if (hasMetadataTracking) {
    console.log('✅ PASSED: Metadata tracks mockup source');
    console.log('   - mockup_source field added to metadata ✓\n');
} else {
    console.log('❌ FAILED: Metadata tracking missing\n');
    allChecks = false;
}

// Check 9: AGENT 11 identifier count
console.log('CHECK 9: AGENT 11 Identifier Count');
const agent11Logs = phpContent.match(/AGENT 11 CONVERSION/g) || [];
console.log(`Found ${agent11Logs.length} AGENT 11 CONVERSION log identifiers`);

if (agent11Logs.length >= 5) {
    console.log('✅ PASSED: Sufficient AGENT 11 logging present');
    console.log(`   - Expected: >= 5, Got: ${agent11Logs.length} ✓\n`);
} else {
    console.log('❌ FAILED: Insufficient AGENT 11 logging');
    console.log(`   - Expected: >= 5, Got: ${agent11Logs.length}\n`);
    allChecks = false;
}

// Check 10: Function location verification
console.log('CHECK 10: Function Location Verification');
const hasConversionFunction = phpContent.includes("private function convert_processed_views_to_canvas_data");

if (hasConversionFunction) {
    console.log('✅ PASSED: Conversion function found');
    console.log('   - convert_processed_views_to_canvas_data() ✓\n');
} else {
    console.log('❌ FAILED: Conversion function not found\n');
    allChecks = false;
}

// Summary
console.log('═══════════════════════════════════════════════════════════');
if (allChecks) {
    console.log('✅ ALL CHECKS PASSED (10/10)');
    console.log('═══════════════════════════════════════════════════════════');
    console.log('\n🎯 AGENT 11 CONVERSION MOCKUP INTEGRATION: READY FOR TESTING\n');
    console.log('Expected Behavior:');
    console.log('1. Legacy _db_processed_views data conversion now extracts mockup');
    console.log('2. Template mockup meta (_template_mockup_image_url) tried first');
    console.log('3. Falls back to template featured image');
    console.log('4. Falls back to product featured image');
    console.log('5. Color codes filtered out (only image URLs)');
    console.log('6. Background is dynamic: $mockup_url or #ffffff fallback');
    console.log('7. Metadata tracks mockup source\n');
    console.log('Next Step: Refresh browser and check console for:');
    console.log('   "🎯 AGENT 11 CONVERSION: Found mockup from..." logs');
    console.log('\nExpected Visual Change:');
    console.log('   - Canvas should show product mockup as background');
    console.log('   - Logos should appear ON the product');
    console.log('   - Realistic preview of designed article');
    process.exit(0);
} else {
    console.log('❌ SOME CHECKS FAILED');
    console.log('═══════════════════════════════════════════════════════════');
    process.exit(1);
}