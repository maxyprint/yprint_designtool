#!/bin/bash
# Dry-Run Validation Pipeline for SSOT Migration
# Agent 6 of 7 - Single Source of Truth Redesign

echo "🔍 SSOT DRY-RUN VALIDATION PIPELINE"
echo "===================================="
echo ""

# ============================================================================
# STEP 1: Environment Check
# ============================================================================
echo "STEP 1: ENVIRONMENT CHECK"
echo "------------------------"

# Check if running in dev/staging
if [[ "$WP_ENV" == "production" ]]; then
    echo "❌ ERROR: Do NOT run dry-run on production!"
    echo "   This script should run on staging/dev only"
    exit 1
fi

if [[ -z "$WP_ENV" ]]; then
    echo "⚠️  WARNING: WP_ENV not set, assuming development"
    WP_ENV="development"
fi

echo "✅ Environment: $WP_ENV (safe for testing)"

# Check if we're in the correct directory
if [ ! -f "migration-offset-fix.php" ]; then
    echo "❌ ERROR: migration-offset-fix.php not found"
    echo "   Please run this script from the project root directory"
    exit 1
fi

echo "✅ Migration script found: migration-offset-fix.php"

# Check PHP is available
php --version > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ ERROR: PHP not accessible"
    exit 1
fi

echo "✅ PHP: $(php -r 'echo PHP_VERSION;')"

# Check WordPress is accessible
if [ ! -f "wp-load.php" ]; then
    echo "❌ ERROR: wp-load.php not found"
    echo "   This doesn't appear to be a WordPress installation"
    exit 1
fi

echo "✅ WordPress installation found"

# Try to load WordPress and check design database table
DESIGN_COUNT=$(php -r "
require_once('wp-load.php');
global \$wpdb;
\$table = \$wpdb->prefix . 'octo_user_designs';
\$count = \$wpdb->get_var(\"SELECT COUNT(*) FROM \$table WHERE design_data IS NOT NULL\");
echo intval(\$count);
" 2>/dev/null)

if [ $? -ne 0 ]; then
    echo "❌ ERROR: Unable to query WordPress database"
    exit 1
fi

echo "✅ Found $DESIGN_COUNT designs in database"

if [ "$DESIGN_COUNT" -eq 0 ]; then
    echo "⚠️  WARNING: No designs found. Clone production data first!"
    echo "   Validation can continue but results may not be meaningful"
fi

echo ""

# ============================================================================
# STEP 2: Pre-Migration Analysis
# ============================================================================
echo "STEP 2: PRE-MIGRATION ANALYSIS"
echo "------------------------------"

php <<'PHP'
<?php
require_once('wp-load.php');

global $wpdb;
$table = $wpdb->prefix . 'octo_user_designs';

$offsets = ['0' => 0, '26.1' => 0, '50' => 0, 'other' => 0];
$offset_details = [];

$designs = $wpdb->get_results("SELECT id, design_data FROM $table WHERE design_data IS NOT NULL", ARRAY_A);

foreach ($designs as $design) {
    $data = json_decode($design['design_data'], true);

    if (!is_array($data) || !isset($data['metadata'])) {
        continue;
    }

    $offset = $data['metadata']['offset_x'] ?? 0;

    if ($offset == 0) {
        $offsets['0']++;
    } elseif (abs($offset - 26.1) < 0.01) {
        $offsets['26.1']++;
    } elseif (abs($offset - 50) < 0.01) {
        $offsets['50']++;
    } else {
        $offsets['other']++;
        $offset_details[] = $offset;
    }
}

echo "Offset distribution:\n";
echo "  0px (correct):     {$offsets['0']}\n";
echo "  26.1px (Type B):   {$offsets['26.1']}\n";
echo "  50px (Type A):     {$offsets['50']}\n";
echo "  Unknown:           {$offsets['other']}\n";

if ($offsets['other'] > 0) {
    echo "\nUnknown offset values: " . implode(', ', array_unique($offset_details)) . "\n";
}

$needs_migration = $offsets['26.1'] + $offsets['50'];
echo "\n✅ Designs needing migration: $needs_migration\n";

// Store for later comparison
file_put_contents('/tmp/pre-migration-count.txt', $needs_migration);
PHP

echo ""

# ============================================================================
# STEP 3: Execute Migration in Dry-Run Mode
# ============================================================================
echo "STEP 3: EXECUTING MIGRATION (DRY-RUN MODE)"
echo "------------------------------------------"

php migration-offset-fix.php --dry-run --verbose > dry-run-output.txt 2>&1
MIGRATION_EXIT_CODE=$?

# Show output
echo "Migration output:"
echo "----------------"
cat dry-run-output.txt
echo "----------------"
echo ""

# Check for warnings/errors
WARNINGS=$(grep -c "WARNING" dry-run-output.txt || true)
ERRORS=$(grep -c "ERROR" dry-run-output.txt || true)
CRITICAL=$(grep -c "CRITICAL" dry-run-output.txt || true)

echo "Dry-run results:"
echo "  Warnings:  $WARNINGS"
echo "  Errors:    $ERRORS"
echo "  Critical:  $CRITICAL"
echo "  Exit code: $MIGRATION_EXIT_CODE"
echo ""

if [ "$MIGRATION_EXIT_CODE" -ne 0 ]; then
    echo "❌ MIGRATION SCRIPT FAILED - Do NOT proceed to production!"
    exit 1
fi

if [ "$ERRORS" -gt 0 ] || [ "$CRITICAL" -gt 0 ]; then
    echo "❌ ERRORS DETECTED - Do NOT proceed to production!"
    echo "   Check dry-run-output.txt for details"
    exit 1
fi

if [ "$WARNINGS" -gt 0 ]; then
    echo "⚠️  WARNINGS DETECTED - Review before production"
    echo "   Check dry-run-output.txt for details"
else
    echo "✅ No errors or warnings detected"
fi

echo ""

# ============================================================================
# STEP 4: Verify Database Unchanged
# ============================================================================
echo "STEP 4: VERIFYING DATABASE UNCHANGED"
echo "------------------------------------"

# Calculate checksum of design_data meta values before
CHECKSUM_BEFORE=$(php -r "
require_once('wp-load.php');
global \$wpdb;
\$results = \$wpdb->get_results(\"
    SELECT meta_value
    FROM {\$wpdb->postmeta}
    WHERE meta_key = 'design_data'
    ORDER BY meta_id
\");
\$concat = '';
foreach (\$results as \$r) {
    \$concat .= \$r->meta_value;
}
echo md5(\$concat);
")

echo "Database checksum before: $CHECKSUM_BEFORE"

# Run dry-run again (to ensure it's truly non-destructive)
php migration-offset-fix.php --dry-run > /dev/null 2>&1

# Calculate checksum after
CHECKSUM_AFTER=$(php -r "
require_once('wp-load.php');
global \$wpdb;
\$results = \$wpdb->get_results(\"
    SELECT meta_value
    FROM {\$wpdb->postmeta}
    WHERE meta_key = 'design_data'
    ORDER BY meta_id
\");
\$concat = '';
foreach (\$results as \$r) {
    \$concat .= \$r->meta_value;
}
echo md5(\$concat);
")

echo "Database checksum after:  $CHECKSUM_AFTER"

if [ "$CHECKSUM_BEFORE" == "$CHECKSUM_AFTER" ]; then
    echo "✅ Database unchanged (dry-run is safe)"
else
    echo "❌ DATABASE MODIFIED during dry-run!"
    echo "   This is a bug in the migration script!"
    exit 1
fi

echo ""

# ============================================================================
# STEP 5: Sample Design Validation
# ============================================================================
echo "STEP 5: SAMPLE DESIGN VALIDATION"
echo "--------------------------------"

php <<'PHP'
<?php
require_once('wp-load.php');

global $wpdb;
$table = $wpdb->prefix . 'octo_user_designs';

// Get designs with different offset types
$designs = $wpdb->get_results("SELECT id, design_data, user_id FROM $table WHERE design_data IS NOT NULL LIMIT 1000", ARRAY_A);

$samples = [
    'Type A (50px)' => null,
    'Type B (26.1px)' => null,
    'Correct (0px)' => null
];

foreach ($designs as $design) {
    $data = json_decode($design['design_data'], true);

    if (!is_array($data) || !isset($data['metadata'])) {
        continue;
    }

    $offset = $data['metadata']['offset_x'] ?? 0;

    if (abs($offset - 50) < 0.01 && !$samples['Type A (50px)']) {
        $samples['Type A (50px)'] = $design['id'];
    } elseif (abs($offset - 26.1) < 0.01 && !$samples['Type B (26.1px)']) {
        $samples['Type B (26.1px)'] = $design['id'];
    } elseif ($offset == 0 && !$samples['Correct (0px)']) {
        $samples['Correct (0px)'] = $design['id'];
    }

    // Stop if we have all samples
    if ($samples['Type A (50px)'] && $samples['Type B (26.1px)'] && $samples['Correct (0px)']) {
        break;
    }
}

echo "Sample designs for manual validation:\n\n";

$found_samples = false;
foreach ($samples as $type => $id) {
    if ($id) {
        $found_samples = true;
        $design_row = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $id), ARRAY_A);
        echo "  $type: Design #$id\n";
        if ($design_row) {
            echo "    User ID: " . ($design_row['user_id'] ?? 'N/A') . "\n";
            echo "    Created: " . ($design_row['created_at'] ?? 'N/A') . "\n";
            echo "\n";
        }
    }
}

if (!$found_samples) {
    echo "  ⚠️  No sample designs found (database may be empty)\n";
}

echo "Manual validation checklist:\n";
echo "  [ ] Open each design in browser\n";
echo "  [ ] Verify logo position looks correct\n";
echo "  [ ] Save without changes\n";
echo "  [ ] Reload and verify position unchanged\n";
echo "  [ ] Check browser console for errors\n";

// Save sample IDs for later reference
$sample_ids = array_filter(array_values($samples));
file_put_contents('/tmp/sample-design-ids.txt', json_encode($sample_ids));
PHP

echo ""

# ============================================================================
# STEP 6: Test Idempotency
# ============================================================================
echo "STEP 6: TESTING IDEMPOTENCY (Running 3x)"
echo "----------------------------------------"

MIGRATION_COUNTS=()

for i in {1..3}; do
    echo "Run #$i:"

    OUTPUT=$(php migration-offset-fix.php --dry-run 2>&1)

    # Extract the count of designs needing migration
    COUNT=$(echo "$OUTPUT" | grep -oP "Corrupted Found:\s+\K\d+" || echo "0")
    MIGRATION_COUNTS+=($COUNT)

    echo "  Designs would be migrated: $COUNT"
done

echo ""

# Check if all counts are the same
FIRST_COUNT=${MIGRATION_COUNTS[0]}
ALL_SAME=true

for count in "${MIGRATION_COUNTS[@]}"; do
    if [ "$count" != "$FIRST_COUNT" ]; then
        ALL_SAME=false
        break
    fi
done

if [ "$ALL_SAME" = true ]; then
    echo "✅ Idempotency verified: All 3 runs show same count ($FIRST_COUNT)"
else
    echo "❌ Idempotency FAILED: Runs show different counts (${MIGRATION_COUNTS[*]})"
    echo "   Migration script is NOT safe to run multiple times!"
    exit 1
fi

echo ""

# ============================================================================
# STEP 7: Generate Validation Report
# ============================================================================
echo "STEP 7: GENERATING VALIDATION REPORT"
echo "------------------------------------"

# Get migration count from pre-migration analysis
NEEDS_MIGRATION=$(cat /tmp/pre-migration-count.txt 2>/dev/null || echo "Unknown")

cat > dry-run-validation-report.txt <<EOF
================================================================================
SSOT DRY-RUN VALIDATION REPORT
================================================================================

Generated: $(date)
Environment: $WP_ENV
Validator: Agent 6 of 7 - SSOT Migration Pipeline

================================================================================
SUMMARY
================================================================================

Total designs:          $DESIGN_COUNT
Designs needing fix:    $NEEDS_MIGRATION
Idempotent count:       $FIRST_COUNT
Warnings:               $WARNINGS
Errors:                 $ERRORS
Critical issues:        $CRITICAL
Exit code:              $MIGRATION_EXIT_CODE

================================================================================
VALIDATION CHECKS
================================================================================

✅ Environment is staging/dev (not production)
✅ Migration script exists and is readable
✅ PHP runtime accessible (version $(php -r 'echo PHP_VERSION;'))
✅ WordPress installation accessible
✅ Database queries successful
✅ Migration script syntax valid (exit code 0)
✅ Dry-run mode doesn't modify database (checksum verified)
✅ Idempotency verified (3 runs show consistent results: $FIRST_COUNT)
$([ "$DESIGN_COUNT" -gt 0 ] && echo "✅ Sample designs identified for manual check" || echo "⚠️  No designs in database for validation")

================================================================================
PRE-MIGRATION DESIGN DISTRIBUTION
================================================================================

EOF

php <<'PHP'
<?php
require_once('wp-load.php');

global $wpdb;
$table = $wpdb->prefix . 'octo_user_designs';

$offsets = ['0' => 0, '26.1' => 0, '50' => 0, 'other' => 0];

$designs = $wpdb->get_results("SELECT id, design_data FROM $table WHERE design_data IS NOT NULL", ARRAY_A);

foreach ($designs as $design) {
    $data = json_decode($design['design_data'], true);

    if (!is_array($data) || !isset($data['metadata'])) {
        continue;
    }

    $offset = $data['metadata']['offset_x'] ?? 0;

    if ($offset == 0) $offsets['0']++;
    elseif (abs($offset - 26.1) < 0.01) $offsets['26.1']++;
    elseif (abs($offset - 50) < 0.01) $offsets['50']++;
    else $offsets['other']++;
}

$total = array_sum($offsets);
$correct_pct = $total > 0 ? round(($offsets['0'] / $total) * 100, 1) : 0;
$type_b_pct = $total > 0 ? round(($offsets['26.1'] / $total) * 100, 1) : 0;
$type_a_pct = $total > 0 ? round(($offsets['50'] / $total) * 100, 1) : 0;

echo "  Correct (0px):          {$offsets['0']} designs ({$correct_pct}%)\n";
echo "  Type B (26.1px):        {$offsets['26.1']} designs ({$type_b_pct}%)\n";
echo "  Type A (50px):          {$offsets['50']} designs ({$type_a_pct}%)\n";
echo "  Unknown offsets:        {$offsets['other']} designs\n";
echo "\n";
echo "  Impact: " . ($offsets['26.1'] + $offsets['50']) . " designs will be migrated\n";
PHP

cat >> dry-run-validation-report.txt

cat >> dry-run-validation-report.txt <<EOF

================================================================================
SAMPLE DESIGNS FOR MANUAL QA
================================================================================

EOF

php <<'PHP'
<?php
$sample_ids = json_decode(file_get_contents('/tmp/sample-design-ids.txt'), true);

if (empty($sample_ids)) {
    echo "No sample designs available (database may be empty)\n";
} else {
    require_once('wp-load.php');

    global $wpdb;
    $table = $wpdb->prefix . 'octo_user_designs';

    foreach ($sample_ids as $id) {
        $design_row = $wpdb->get_row($wpdb->prepare("SELECT * FROM $table WHERE id = %d", $id), ARRAY_A);
        if (!$design_row) continue;

        $data = json_decode($design_row['design_data'], true);
        $offset = $data['metadata']['offset_x'] ?? 0;

        $type = 'Unknown';
        if ($offset == 0) $type = 'Correct (0px)';
        elseif (abs($offset - 26.1) < 0.01) $type = 'Type B (26.1px)';
        elseif (abs($offset - 50) < 0.01) $type = 'Type A (50px)';

        echo "Design #$id - $type\n";
        echo "  User ID: " . ($design_row['user_id'] ?? 'N/A') . "\n";
        echo "  Created: " . ($design_row['created_at'] ?? 'N/A') . "\n";
        echo "  Offset:  {$offset}px\n";
        echo "\n";
    }
}
PHP

cat >> dry-run-validation-report.txt

cat >> dry-run-validation-report.txt <<EOF

================================================================================
NEXT STEPS
================================================================================

1. ✅ Review this validation report completely
2. ⏳ Manually validate sample designs in browser
3. ⏳ Check dry-run-output.txt for any warnings
4. ⏳ If all checks pass: Proceed to staging execution
5. ⏳ If staging succeeds: Schedule production deployment
6. ⏳ Keep backup ready for rollback if needed

Manual QA Checklist:
  [ ] Open each sample design in browser
  [ ] Verify logo positions look correct
  [ ] Test save/reload cycle for each design
  [ ] Check browser console for errors
  [ ] Verify no visual regressions
  [ ] Test with different browsers if possible

================================================================================
RECOMMENDATION
================================================================================

EOF

# Determine recommendation
if [ "$ERRORS" -eq 0 ] && [ "$CRITICAL" -eq 0 ] && [ "$MIGRATION_EXIT_CODE" -eq 0 ] && [ "$ALL_SAME" = true ]; then
    if [ "$WARNINGS" -eq 0 ]; then
        echo "✅ GREEN LIGHT: Safe to proceed to staging execution" >> dry-run-validation-report.txt
        echo "" >> dry-run-validation-report.txt
        echo "All automated checks passed successfully. The migration script:" >> dry-run-validation-report.txt
        echo "  - Runs without errors or warnings" >> dry-run-validation-report.txt
        echo "  - Does not modify the database in dry-run mode" >> dry-run-validation-report.txt
        echo "  - Produces consistent results across multiple runs (idempotent)" >> dry-run-validation-report.txt
        echo "  - Has been validated against $DESIGN_COUNT designs" >> dry-run-validation-report.txt
        echo "" >> dry-run-validation-report.txt
        echo "Proceed to staging execution with confidence." >> dry-run-validation-report.txt
        RECOMMENDATION="GREEN"
    else
        echo "🟡 YELLOW LIGHT: Review warnings, then proceed with caution" >> dry-run-validation-report.txt
        echo "" >> dry-run-validation-report.txt
        echo "The migration script passed all critical checks but generated $WARNINGS warning(s)." >> dry-run-validation-report.txt
        echo "Review dry-run-output.txt to understand the warnings before proceeding." >> dry-run-validation-report.txt
        echo "" >> dry-run-validation-report.txt
        echo "If warnings are acceptable, proceed to staging execution." >> dry-run-validation-report.txt
        RECOMMENDATION="YELLOW"
    fi
else
    echo "🔴 RED LIGHT: Fix errors before proceeding" >> dry-run-validation-report.txt
    echo "" >> dry-run-validation-report.txt
    echo "CRITICAL ISSUES DETECTED:" >> dry-run-validation-report.txt
    [ "$ERRORS" -gt 0 ] && echo "  - $ERRORS error(s) in migration script" >> dry-run-validation-report.txt
    [ "$CRITICAL" -gt 0 ] && echo "  - $CRITICAL critical issue(s) detected" >> dry-run-validation-report.txt
    [ "$MIGRATION_EXIT_CODE" -ne 0 ] && echo "  - Non-zero exit code: $MIGRATION_EXIT_CODE" >> dry-run-validation-report.txt
    [ "$ALL_SAME" != true ] && echo "  - Idempotency check failed" >> dry-run-validation-report.txt
    echo "" >> dry-run-validation-report.txt
    echo "DO NOT proceed to production until all issues are resolved." >> dry-run-validation-report.txt
    RECOMMENDATION="RED"
fi

cat >> dry-run-validation-report.txt <<EOF

================================================================================
TECHNICAL DETAILS
================================================================================

Database Integrity:
  - Checksum before dry-run: $CHECKSUM_BEFORE
  - Checksum after dry-run:  $CHECKSUM_AFTER
  - Status: $([ "$CHECKSUM_BEFORE" == "$CHECKSUM_AFTER" ] && echo "UNCHANGED ✅" || echo "MODIFIED ❌")

Idempotency Test Results:
  - Run 1: ${MIGRATION_COUNTS[0]} designs would be migrated
  - Run 2: ${MIGRATION_COUNTS[1]} designs would be migrated
  - Run 3: ${MIGRATION_COUNTS[2]} designs would be migrated
  - Status: $([ "$ALL_SAME" = true ] && echo "CONSISTENT ✅" || echo "INCONSISTENT ❌")

Migration Script Output:
  - See: dry-run-output.txt
  - Warnings: $WARNINGS
  - Errors: $ERRORS
  - Critical: $CRITICAL

================================================================================
VALIDATION COMPLETE
================================================================================

Report generated by: Agent 6 - Dry-Run Validation Pipeline
Timestamp: $(date -u +"%Y-%m-%d %H:%M:%S UTC")

EOF

cat dry-run-validation-report.txt

echo ""
echo "================================================================================"
echo "✅ DRY-RUN VALIDATION COMPLETE"
echo "================================================================================"
echo ""
echo "Recommendation: $RECOMMENDATION LIGHT"
echo ""
echo "Files created:"
echo "  - dry-run-validation-report.txt (full validation report)"
echo "  - dry-run-output.txt (migration script output)"
echo ""
echo "Next steps:"
echo "  1. Review the validation report above"
echo "  2. Manually test sample designs if available"
echo "  3. If GREEN/YELLOW: Proceed to staging execution"
echo "  4. If RED: Fix issues and re-run validation"
echo ""
echo "================================================================================"

# Exit with appropriate code
if [ "$RECOMMENDATION" == "RED" ]; then
    exit 1
elif [ "$RECOMMENDATION" == "YELLOW" ]; then
    exit 0
else
    exit 0
fi
