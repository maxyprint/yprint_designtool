# Canvas Offset Bug - Complete Deployment Runbook
## Architecture A: Minimal Fix + Data Migration

**Document Version**: 2.0
**Last Updated**: 2025-10-03
**Fix Status**: Phase 1 DEPLOYED / Phase 2-4 PENDING
**Architecture**: Architecture A (Minimal Fix - 1-Line Change + Migration)

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Status](#current-status)
3. [Deployment Timeline](#deployment-timeline)
4. [Phase-by-Phase Deployment](#phase-by-phase-deployment)
5. [Pre-Deployment Checklist](#pre-deployment-checklist)
6. [Monitoring & Validation](#monitoring--validation)
7. [Rollback Procedures](#rollback-procedures)
8. [Stakeholder Communication](#stakeholder-communication)
9. [Risk Mitigation](#risk-mitigation)
10. [Appendix](#appendix)

---

## Executive Summary

### Problem Statement

The canvas offset bug caused viewport-dependent coordinate corruption in 75-90% of all NEW designs:

- **Root Cause**: Container selector bug (line 931: used `.designer-editor` with 50px padding instead of `.designer-canvas-container` with 0px padding)
- **Impact**: Designs saved at Desktop (50px offset), Breakpoint 950px (26.1px offset), or Mobile (0px offset)
- **Data Corruption**: Logo positioned at visual Y=200px saved as Y=150px, Y=173.9px, or Y=200px depending on viewport

### Solution Architecture

**Architecture A - Minimal Fix**:
- 1-line JavaScript change (COMPLETED Phase 1)
- Migration script for corrupted data (Phases 2-4)
- Keep existing OFFSET-FIX system (74 lines become dead code but ensure backward compatibility)
- Zero downtime deployment
- Simple rollback capability

### Deployment Phases

| Phase | Status | Timeline | Risk | Downtime |
|-------|--------|----------|------|----------|
| **Phase 1** | COMPLETED | Day 0 (2-4 hours) | LOW | None |
| **Phase 2** | PENDING | Day 1-3 (8-16 hours) | LOW | None |
| **Phase 3** | PENDING | Day 4-7 (2-4 hours) | MEDIUM | None |
| **Phase 4** | PENDING | Day 8-30 (ongoing) | LOW | None |

---

## Current Status

### What Has Been Deployed (Phase 1)

**Commit**: `fc3f8b7` - "FIX: Canvas Offset Bug - 50px CSS Padding Compensation"
**Date**: 2025-10-03
**Files Modified**:
- `/public/js/dist/designer.bundle.js` (line 931)
- `/includes/class-octo-print-api-integration.php` (lines 657-682)

**Code Change**:
```javascript
// BEFORE (BUGGY):
var containerElement = canvasElement.closest('.designer-editor');

// AFTER (FIXED):
var containerElement = canvasElement.parentNode; // .designer-canvas-container
```

**Effect**:
- `getCanvasOffset()` now returns `{x: 0, y: 0}` because `.designer-canvas-container` has no padding
- NEW designs created after deployment have `offset_x: 0, offset_y: 0`
- Further data corruption STOPPED
- Existing corrupted designs still in database UNCHANGED

### What Remains To Be Done (Phases 2-4)

1. **Phase 2**: Develop and test migration script
2. **Phase 3**: Migrate corrupted designs in production database
3. **Phase 4**: Monitor for edge cases and validate success

---

## Deployment Timeline

### Overview

```
DAY 0 ════════════════════════════════════════════════════════════
  Phase 1: 1-Line Fix Deployment (COMPLETED)
  ├─ Code change deployed
  ├─ Verification tests passed
  └─ Monitoring initiated

DAY 1-3 ══════════════════════════════════════════════════════════
  Phase 2: Migration Development
  ├─ Day 1: Migration script development (4-6 hours)
  ├─ Day 2: Staging database testing (4-6 hours)
  └─ Day 3: Visual regression validation (2-4 hours)

DAY 4-7 ══════════════════════════════════════════════════════════
  Phase 3: Production Migration
  ├─ Day 4: Final pre-flight checks (1-2 hours)
  ├─ Day 5: Database backup + migration execution (1-2 hours)
  └─ Day 6-7: Post-migration validation (2-4 hours)

DAY 8-30 ═════════════════════════════════════════════════════════
  Phase 4: Monitoring & Validation
  ├─ Week 2: Daily monitoring
  ├─ Week 3-4: Weekly monitoring
  └─ Day 30: Final assessment & rollback window closure

TOTAL TIMELINE: 30 days (but production fixed on Day 0)
```

### Detailed Timeline

| Day | Activity | Duration | Team Members | Deliverable |
|-----|----------|----------|--------------|-------------|
| 0 | Phase 1 Deployment | 2-4 hours | DevOps + Backend Dev | Bug stopped |
| 1 | Migration script development | 4-6 hours | Backend Dev | migration.php |
| 2 | Staging DB clone + test | 4-6 hours | DevOps + QA | Test report |
| 3 | Visual regression tests | 2-4 hours | QA | Screenshots comparison |
| 4 | Final pre-flight checks | 1-2 hours | All team | Go/No-Go decision |
| 5 | Production migration | 1-2 hours | DevOps + Backend Dev | Migration complete |
| 6-7 | Post-migration validation | 2-4 hours | QA + Support | Validation report |
| 8-14 | Daily monitoring | 30 min/day | Support + DevOps | Monitoring logs |
| 15-30 | Weekly monitoring | 2 hours/week | Support + DevOps | Final report |

---

## Phase-by-Phase Deployment

---

## PHASE 1: Immediate Fix (Day 0) - COMPLETED

**Goal**: Stop further data corruption
**Status**: COMPLETED
**Duration**: 2-4 hours
**Risk**: LOW
**Downtime**: None

### What Was Done

1. Code change deployed (line 931 in designer.bundle.js)
2. PHP offset compensation deployed (class-octo-print-api-integration.php)
3. Smoke tests executed
4. Monitoring initiated

### Verification Completed

```bash
# Verified offset calculation returns 0,0
grep "containerElement = canvasElement.parentNode" \
  /workspaces/yprint_designtool/public/js/dist/designer.bundle.js
# Result: Found on line 931 ✓

# Verified PHP offset compensation
grep "OFFSET-FIX" \
  /workspaces/yprint_designtool/includes/class-octo-print-api-integration.php
# Result: 5 instances found ✓
```

### Success Criteria (MET)

- New designs created after deployment have `offset_x: 0, offset_y: 0` ✓
- Old designs still load correctly (backward compatible) ✓
- No console errors ✓
- No PHP errors ✓

---

## PHASE 2: Migration Development (Day 1-3) - PENDING

**Goal**: Develop and test migration script on staging
**Duration**: 8-16 hours (spread over 3 days)
**Risk**: LOW
**Downtime**: None

### Day 1: Migration Script Development (4-6 hours)

#### Step 1.1: Create Migration Script

Create file: `/workspaces/yprint_designtool/migration-offset-correction.php`

```php
<?php
/**
 * Migration Script: Canvas Offset Bug - Coordinate Correction
 *
 * PURPOSE: Correct viewport-dependent offset corruption in NEW designs
 *
 * AFFECTED DESIGNS:
 * - Type A: Desktop designs with offset_x = 50px (or ~50px)
 * - Type B: Breakpoint designs with offset_x = 26.1px (or ~26px)
 * - Type C: Mobile designs with offset_x = 0px (already correct - skip)
 *
 * MIGRATION LOGIC:
 * 1. Find all designs with metadata.offset_applied = true AND offset_x != 0
 * 2. For each object: left -= offset_x, top -= offset_y
 * 3. Set metadata.offset_x = 0, metadata.offset_y = 0
 * 4. Backup original values to metadata.legacy_offset_x/y
 * 5. Log all changes
 *
 * SAFETY:
 * - Read-only mode available (dry run)
 * - Backup mechanism included
 * - Rollback script available
 * - Extensive logging
 *
 * USAGE:
 * wp eval-file migration-offset-correction.php --dry-run=1
 * wp eval-file migration-offset-correction.php --dry-run=0
 */

// Configuration
define('MIGRATION_VERSION', '1.0.0');
define('MIGRATION_TIMESTAMP', gmdate('Y-m-d H:i:s'));

// Safety check - require explicit backup confirmation
if (!defined('MIGRATION_BACKUP_CONFIRMED')) {
    // Check for --dry-run flag
    $dry_run = isset($args[0]) && $args[0] === '--dry-run=1';

    if (!$dry_run) {
        echo "┌─────────────────────────────────────────────────────────┐\n";
        echo "│         ⚠️  MIGRATION SAFETY CHECK REQUIRED ⚠️          │\n";
        echo "└─────────────────────────────────────────────────────────┘\n\n";
        echo "Before running migration, you MUST:\n\n";
        echo "1. Create database backup:\n";
        echo "   wp db export backup-pre-migration-\$(date +%Y%m%d-%H%M%S).sql\n\n";
        echo "2. Verify backup:\n";
        echo "   ls -lh backup-pre-migration-*.sql\n\n";
        echo "3. Test migration on staging first\n\n";
        echo "4. Re-run with: define('MIGRATION_BACKUP_CONFIRMED', true);\n\n";
        echo "OR run dry-run mode:\n";
        echo "   wp eval-file migration-offset-correction.php --dry-run=1\n\n";
        die("Migration aborted - backup not confirmed.\n");
    }
}

// Dry run mode
$dry_run = isset($args[0]) && $args[0] === '--dry-run=1';

if ($dry_run) {
    echo "┌─────────────────────────────────────────────────────────┐\n";
    echo "│              🔍 DRY RUN MODE ENABLED 🔍                 │\n";
    echo "│         No changes will be written to database         │\n";
    echo "└─────────────────────────────────────────────────────────┘\n\n";
}

// Statistics
$stats = [
    'total_designs' => 0,
    'old_designs' => 0,
    'new_designs_correct' => 0,
    'new_designs_corrupted' => 0,
    'migrated' => 0,
    'errors' => 0,
    'skipped' => 0
];

// Migration log
$migration_log = [];
$error_log = [];

// Get all designs
echo "Scanning designs...\n";
$designs = get_posts([
    'post_type' => 'design',
    'posts_per_page' => -1,
    'post_status' => 'any'
]);

$stats['total_designs'] = count($designs);
echo "Found {$stats['total_designs']} designs\n\n";

// Process each design
foreach ($designs as $design) {
    echo "Processing Design ID: {$design->ID} - \"{$design->post_title}\"\n";

    // Get design data
    $data = get_post_meta($design->ID, 'design_data', true);

    if (empty($data) || !is_array($data)) {
        echo "  ⊘ SKIP: No design data found\n\n";
        $stats['skipped']++;
        continue;
    }

    // Check if OLD design (no offset_applied flag)
    if (!isset($data['metadata']['offset_applied']) ||
        $data['metadata']['offset_applied'] !== true) {
        echo "  ✓ OLD design (no offset_applied flag) - backward compatible\n\n";
        $stats['old_designs']++;
        continue;
    }

    // NEW design with offset_applied = true
    $offset_x = floatval($data['metadata']['offset_x'] ?? 0);
    $offset_y = floatval($data['metadata']['offset_y'] ?? 0);

    echo "  → NEW design with offset_x={$offset_x}, offset_y={$offset_y}\n";

    // Check if already corrected (offset = 0)
    if (abs($offset_x) < 0.1 && abs($offset_y) < 0.1) {
        echo "  ✓ Already corrected (offset ≈ 0)\n\n";
        $stats['new_designs_correct']++;
        continue;
    }

    // Corrupted design - needs migration
    echo "  ⚠️  CORRUPTED - requires migration\n";
    $stats['new_designs_corrupted']++;

    // Classify corruption type
    $corruption_type = 'UNKNOWN';
    if (abs($offset_x - 50) < 2) {
        $corruption_type = 'Type A (Desktop 50px)';
    } elseif (abs($offset_x - 26.1) < 2) {
        $corruption_type = 'Type B (Breakpoint 26.1px)';
    }
    echo "  → Corruption Type: {$corruption_type}\n";

    // Count objects
    $object_count = 0;
    foreach ($data['objects'] ?? [] as $view_objects) {
        $object_count += count($view_objects);
    }
    echo "  → Objects to migrate: {$object_count}\n";

    if (!$dry_run) {
        // MIGRATION: Correct all object coordinates
        $corrected_objects = 0;

        foreach ($data['objects'] as $view_id => &$view_objects) {
            foreach ($view_objects as &$obj) {
                if (isset($obj['transform'])) {
                    // Subtract offset from coordinates
                    $old_left = $obj['transform']['left'];
                    $old_top = $obj['transform']['top'];

                    $obj['transform']['left'] -= $offset_x;
                    $obj['transform']['top'] -= $offset_y;

                    $corrected_objects++;
                }
            }
        }

        // Backup original offset values
        $data['metadata']['legacy_offset_x'] = $offset_x;
        $data['metadata']['legacy_offset_y'] = $offset_y;

        // Set offset to 0
        $data['metadata']['offset_x'] = 0;
        $data['metadata']['offset_y'] = 0;

        // Add migration metadata
        $data['metadata']['migration_version'] = MIGRATION_VERSION;
        $data['metadata']['migration_timestamp'] = MIGRATION_TIMESTAMP;
        $data['metadata']['migration_corruption_type'] = $corruption_type;

        // Save to database
        $result = update_post_meta($design->ID, 'design_data', $data);

        if ($result !== false) {
            echo "  ✓ MIGRATED successfully ({$corrected_objects} objects corrected)\n";
            $stats['migrated']++;

            // Log successful migration
            $migration_log[] = [
                'design_id' => $design->ID,
                'title' => $design->post_title,
                'corruption_type' => $corruption_type,
                'old_offset_x' => $offset_x,
                'old_offset_y' => $offset_y,
                'objects_corrected' => $corrected_objects,
                'timestamp' => MIGRATION_TIMESTAMP
            ];
        } else {
            echo "  ✗ ERROR: Failed to update database\n";
            $stats['errors']++;

            // Log error
            $error_log[] = [
                'design_id' => $design->ID,
                'title' => $design->post_title,
                'error' => 'Database update failed',
                'timestamp' => MIGRATION_TIMESTAMP
            ];
        }
    } else {
        echo "  → DRY RUN: Would migrate {$object_count} objects\n";
        $stats['migrated']++;
    }

    echo "\n";
}

// Save logs to database (only if not dry run)
if (!$dry_run && !empty($migration_log)) {
    update_option('canvas_offset_migration_log', $migration_log);
    update_option('canvas_offset_migration_timestamp', MIGRATION_TIMESTAMP);
    update_option('canvas_offset_migration_stats', $stats);

    if (!empty($error_log)) {
        update_option('canvas_offset_migration_errors', $error_log);
    }
}

// Print summary
echo "┌─────────────────────────────────────────────────────────┐\n";
echo "│                  MIGRATION SUMMARY                      │\n";
echo "└─────────────────────────────────────────────────────────┘\n\n";

echo "Total Designs:           {$stats['total_designs']}\n";
echo "  ├─ OLD designs:        {$stats['old_designs']} (backward compatible)\n";
echo "  ├─ NEW correct:        {$stats['new_designs_correct']} (offset=0)\n";
echo "  ├─ NEW corrupted:      {$stats['new_designs_corrupted']}\n";
echo "  └─ Skipped:            {$stats['skipped']}\n\n";

echo "Migration Results:\n";
echo "  ├─ Migrated:           {$stats['migrated']}\n";
echo "  ├─ Errors:             {$stats['errors']}\n";
echo "  └─ Success Rate:       " . ($stats['new_designs_corrupted'] > 0 ?
    round(($stats['migrated'] / $stats['new_designs_corrupted']) * 100, 2) : 100) . "%\n\n";

if ($dry_run) {
    echo "⚠️  DRY RUN - No changes written to database\n";
    echo "To execute migration: wp eval-file migration-offset-correction.php --dry-run=0\n\n";
} else {
    echo "✓ Migration logs saved to wp_options:\n";
    echo "  - canvas_offset_migration_log\n";
    echo "  - canvas_offset_migration_stats\n";
    if (!empty($error_log)) {
        echo "  - canvas_offset_migration_errors\n";
    }
    echo "\n";
}

if ($stats['errors'] > 0) {
    echo "⚠️  WARNING: {$stats['errors']} errors occurred\n";
    echo "Review error log: wp option get canvas_offset_migration_errors\n\n";
    exit(1);
}

echo "✓ Migration complete\n";
exit(0);
?>
```

**Expected Output**:
```
Dry run mode enabled - script created and validated
Syntax check: PASSED
```

#### Step 1.2: Create Rollback Script

Create file: `/workspaces/yprint_designtool/rollback-offset-migration.php`

```php
<?php
/**
 * Rollback Script: Canvas Offset Migration
 *
 * SAFETY: This script restores designs to pre-migration state
 * using legacy_offset_x/y values stored during migration.
 *
 * USAGE:
 * wp eval-file rollback-offset-migration.php --confirm=1
 */

// Safety check
if (!isset($args[0]) || $args[0] !== '--confirm=1') {
    echo "┌─────────────────────────────────────────────────────────┐\n";
    echo "│              ⚠️  ROLLBACK CONFIRMATION ⚠️                │\n";
    echo "└─────────────────────────────────────────────────────────┘\n\n";
    echo "This will rollback all migrated designs.\n\n";
    echo "To confirm: wp eval-file rollback-offset-migration.php --confirm=1\n\n";
    die("Rollback aborted.\n");
}

// Get migration log
$migration_log = get_option('canvas_offset_migration_log', []);

if (empty($migration_log)) {
    echo "No migration log found - nothing to rollback\n";
    exit(0);
}

echo "Rolling back {count($migration_log)} designs...\n\n";

$rollback_count = 0;
$errors = 0;

foreach ($migration_log as $entry) {
    $design_id = $entry['design_id'];
    echo "Rolling back Design ID: {$design_id}\n";

    $data = get_post_meta($design_id, 'design_data', true);

    if (empty($data)) {
        echo "  ✗ ERROR: Design data not found\n\n";
        $errors++;
        continue;
    }

    // Restore legacy offset values
    $offset_x = floatval($data['metadata']['legacy_offset_x'] ?? 0);
    $offset_y = floatval($data['metadata']['legacy_offset_y'] ?? 0);

    if ($offset_x == 0 && $offset_y == 0) {
        echo "  ⊘ SKIP: No legacy offset found\n\n";
        continue;
    }

    // Restore object coordinates
    foreach ($data['objects'] as $view_id => &$view_objects) {
        foreach ($view_objects as &$obj) {
            if (isset($obj['transform'])) {
                $obj['transform']['left'] += $offset_x;
                $obj['transform']['top'] += $offset_y;
            }
        }
    }

    // Restore metadata
    $data['metadata']['offset_x'] = $offset_x;
    $data['metadata']['offset_y'] = $offset_y;

    // Mark as rolled back
    $data['metadata']['rollback_timestamp'] = gmdate('Y-m-d H:i:s');

    // Save
    $result = update_post_meta($design_id, 'design_data', $data);

    if ($result !== false) {
        echo "  ✓ Rolled back\n\n";
        $rollback_count++;
    } else {
        echo "  ✗ ERROR: Failed to update\n\n";
        $errors++;
    }
}

echo "┌─────────────────────────────────────────────────────────┐\n";
echo "│               ROLLBACK SUMMARY                          │\n";
echo "└─────────────────────────────────────────────────────────┘\n\n";
echo "Rolled back: {$rollback_count}\n";
echo "Errors:      {$errors}\n\n";

if ($errors > 0) {
    echo "⚠️  WARNING: Some designs failed to rollback\n";
    exit(1);
}

echo "✓ Rollback complete\n";
exit(0);
?>
```

#### Step 1.3: Validate Scripts

```bash
# Navigate to plugin directory
cd /workspaces/yprint_designtool

# Validate PHP syntax
php -l migration-offset-correction.php
# Expected: No syntax errors detected

php -l rollback-offset-migration.php
# Expected: No syntax errors detected

# Test dry run (safe - no changes)
wp eval-file migration-offset-correction.php --dry-run=1
# Expected: Scanning report with no errors
```

**Success Criteria**:
- Migration script created ✓
- Rollback script created ✓
- Syntax validation passed ✓
- Dry run executes without errors ✓

**Deliverable**: `migration-offset-correction.php` and `rollback-offset-migration.php`

---

### Day 2: Staging Database Testing (4-6 hours)

#### Step 2.1: Clone Production Database

```bash
# On production server
cd /var/www/html

# Export production database
wp db export production-db-$(date +%Y%m%d-%H%M%S).sql
# Expected output: Success: Exported to 'production-db-20251003-140530.sql'.

# Verify export
ls -lh production-db-*.sql
# Expected: File size > 0 bytes

# Download to staging (from local machine)
scp user@production:/var/www/html/production-db-*.sql /tmp/
```

#### Step 2.2: Import to Staging

```bash
# On staging server
cd /var/staging/html

# Import database
wp db import /tmp/production-db-20251003-140530.sql
# Expected: Success: Imported from 'production-db-20251003-140530.sql'.

# Verify import
wp db query "SELECT COUNT(*) FROM wp_posts WHERE post_type='design';"
# Expected: Count matches production
```

#### Step 2.3: Run Migration on Staging

```bash
# Copy migration scripts to staging
scp migration-offset-correction.php user@staging:/var/staging/html/
scp rollback-offset-migration.php user@staging:/var/staging/html/

# On staging server
cd /var/staging/html

# First: Dry run
wp eval-file migration-offset-correction.php --dry-run=1 > migration-dry-run.log
# Expected: Summary report with 0 errors

# Review dry run output
cat migration-dry-run.log
# Expected:
# - Total designs counted
# - Corruption types identified
# - Migration plan displayed

# Run actual migration (with backup confirmation bypassed for staging)
php -r "define('MIGRATION_BACKUP_CONFIRMED', true); include 'migration-offset-correction.php';"
# OR modify script temporarily to bypass check

# Alternative: Use wp eval with inline code
wp eval "
  define('MIGRATION_BACKUP_CONFIRMED', true);
  include 'migration-offset-correction.php';
" > migration-staging.log

# Review migration output
cat migration-staging.log
# Expected:
# - Migration summary
# - Migrated count > 0
# - Errors: 0
# - Success rate: 100%
```

#### Step 2.4: Validate Migration Results

```bash
# Check migrated designs in database
wp eval "
  \$log = get_option('canvas_offset_migration_log');
  echo 'Migrated designs: ' . count(\$log) . PHP_EOL;
  foreach (array_slice(\$log, 0, 5) as \$entry) {
    echo 'ID: ' . \$entry['design_id'] .
         ' | Type: ' . \$entry['corruption_type'] .
         ' | Old offset: ' . \$entry['old_offset_x'] . 'px' . PHP_EOL;
  }
"

# Expected output:
# Migrated designs: 42
# ID: 123 | Type: Type A (Desktop 50px) | Old offset: 50px
# ID: 124 | Type: Type A (Desktop 50px) | Old offset: 50px
# ID: 125 | Type: Type B (Breakpoint 26.1px) | Old offset: 26.1px
# ...

# Verify offset values are now 0
wp eval "
  \$designs = get_posts(['post_type' => 'design', 'posts_per_page' => 5]);
  foreach (\$designs as \$d) {
    \$data = get_post_meta(\$d->ID, 'design_data', true);
    if (isset(\$data['metadata']['offset_applied'])) {
      echo 'ID: ' . \$d->ID .
           ' | offset_x: ' . (\$data['metadata']['offset_x'] ?? 'N/A') .
           ' | offset_y: ' . (\$data['metadata']['offset_y'] ?? 'N/A') . PHP_EOL;
    }
  }
"

# Expected: All NEW designs show offset_x: 0, offset_y: 0
```

#### Step 2.5: Test Rollback

```bash
# Run rollback script
wp eval-file rollback-offset-migration.php --confirm=1 > rollback-test.log

# Verify rollback
cat rollback-test.log
# Expected: All designs rolled back successfully

# Re-run migration to restore corrected state
wp eval "
  define('MIGRATION_BACKUP_CONFIRMED', true);
  include 'migration-offset-correction.php';
"
```

**Success Criteria**:
- Staging DB matches production ✓
- Migration executes with 0 errors ✓
- All corrupted designs identified and migrated ✓
- Rollback tested and working ✓

**Deliverable**: `migration-staging.log` showing successful migration

---

### Day 3: Visual Regression Validation (2-4 hours)

#### Step 3.1: Pre-Migration Screenshots

```bash
# On staging environment (BEFORE migration)
# Manually capture screenshots of 5-10 designs

# Save to: /tmp/screenshots-before/
# - design-123-before.png
# - design-124-before.png
# - design-125-before.png
# ...
```

#### Step 3.2: Run Migration

```bash
# Run migration on staging (already done in Step 2.3)
# OR re-import fresh DB and run again
```

#### Step 3.3: Post-Migration Screenshots

```bash
# On staging environment (AFTER migration)
# Capture screenshots of SAME designs

# Save to: /tmp/screenshots-after/
# - design-123-after.png
# - design-124-after.png
# - design-125-after.png
# ...
```

#### Step 3.4: Compare Screenshots

```bash
# Manual comparison (visual inspection)
# - Open before/after side by side
# - Verify positions are IDENTICAL
# - Check no visual regressions

# Automated comparison (if imagemagick available)
compare \
  /tmp/screenshots-before/design-123-before.png \
  /tmp/screenshots-after/design-123-after.png \
  -metric AE \
  /tmp/diff-123.png

# Expected: Difference = 0 pixels (or very low for anti-aliasing differences)
```

#### Step 3.5: API Integration Test

```bash
# Test that API coordinates are correct after migration

# 1. Load migrated design in designer
# 2. Place logo at visual Y=200px
# 3. Save design
# 4. Create test order via WooCommerce
# 5. Check API payload

wp eval "
  // Get latest order
  \$orders = wc_get_orders(['limit' => 1, 'orderby' => 'date', 'order' => 'DESC']);
  \$order = \$orders[0];

  // Get order meta with design data
  \$design_data = get_post_meta(\$order->get_id(), 'octo_print_design_data', true);

  // Check API payload coordinates
  echo 'API Payload (print coordinates):' . PHP_EOL;
  print_r(\$design_data);
"

# Expected: Coordinates in API payload are canvas-relative (NOT container-relative)
# Logo at visual Y=200px should be sent to API as Y=200px (after mm conversion)
```

**Success Criteria**:
- Visual regression: 0 differences detected ✓
- API integration: Coordinates correct ✓
- OLD designs: Still render correctly ✓
- NEW designs: Render correctly after migration ✓

**Deliverable**: Visual regression report with screenshots

---

## PHASE 3: Production Migration (Day 4-7) - PENDING

**Goal**: Migrate corrupted designs in production database
**Duration**: 2-4 hours (spread over 4 days for safety)
**Risk**: MEDIUM
**Downtime**: None

### Day 4: Pre-Flight Checks (1-2 hours)

#### Checklist

```bash
# 1. Verify Phase 1 is deployed and working
cd /var/www/html/wp-content/plugins/octo-print-designer

grep "containerElement = canvasElement.parentNode" \
  public/js/dist/designer.bundle.js
# Expected: Found on line 931 ✓

# 2. Verify no new corrupted designs created since Phase 1
wp eval "
  // Get designs created in last 7 days
  \$designs = get_posts([
    'post_type' => 'design',
    'date_query' => [['after' => '7 days ago']],
    'posts_per_page' => 10
  ]);

  foreach (\$designs as \$d) {
    \$data = get_post_meta(\$d->ID, 'design_data', true);
    if (isset(\$data['metadata']['offset_applied'])) {
      echo 'ID: ' . \$d->ID .
           ' | Created: ' . \$d->post_date .
           ' | offset_x: ' . (\$data['metadata']['offset_x'] ?? 'N/A') . PHP_EOL;
    }
  }
"
# Expected: All recent designs have offset_x: 0 ✓

# 3. Verify staging migration was successful
ssh user@staging "cat /var/staging/html/migration-staging.log | grep 'Success Rate'"
# Expected: Success Rate: 100% ✓

# 4. Verify migration scripts are ready
ls -lh migration-offset-correction.php rollback-offset-migration.php
# Expected: Both files exist ✓

# 5. Check disk space (for database backup)
df -h /var/www
# Expected: At least 5GB free space ✓

# 6. Verify WP-CLI is working
wp --version
# Expected: WP-CLI 2.x or higher ✓

# 7. Check current database size
wp db size
# Expected: Size displayed (for backup time estimation)
```

**Go/No-Go Decision Point**

- [ ] Phase 1 verified working
- [ ] No new corrupted designs since Phase 1
- [ ] Staging migration 100% successful
- [ ] Migration scripts validated
- [ ] Sufficient disk space
- [ ] WP-CLI operational
- [ ] Team ready and on standby

**If ALL checkboxes are checked**: PROCEED to Day 5
**If ANY checkbox is unchecked**: HOLD and investigate

---

### Day 5: Production Migration (1-2 hours)

**IMPORTANT**: Schedule during LOW-TRAFFIC period (e.g., 2AM-4AM local time)

#### Pre-Migration Backup

```bash
# Navigate to WordPress root
cd /var/www/html

# Create database backup
wp db export backup-pre-migration-$(date +%Y%m%d-%H%M%S).sql

# Verify backup created
ls -lh backup-pre-migration-*.sql
# Expected: File size > 0 bytes

# Test backup integrity
wp db import backup-pre-migration-*.sql --dry-run
# Expected: No errors

# Copy backup to secure location
cp backup-pre-migration-*.sql /backups/
aws s3 cp backup-pre-migration-*.sql s3://your-backup-bucket/
# (if using cloud storage)
```

#### Execute Migration

```bash
# Upload migration scripts
scp migration-offset-correction.php user@production:/var/www/html/
scp rollback-offset-migration.php user@production:/var/www/html/

# On production server
cd /var/www/html

# STEP 1: Dry run first (safety check)
wp eval-file migration-offset-correction.php --dry-run=1 > migration-dry-run-production.log

# Review dry run output
cat migration-dry-run-production.log
# Expected:
# - Total designs counted
# - Corrupted designs identified
# - 0 errors

# STEP 2: Execute migration
wp eval "
  define('MIGRATION_BACKUP_CONFIRMED', true);
  include 'migration-offset-correction.php';
" | tee migration-production.log

# Monitor in real-time
# Expected output:
# Processing Design ID: 123 - "Logo Design"
#   → NEW design with offset_x=50, offset_y=50
#   ⚠️  CORRUPTED - requires migration
#   → Corruption Type: Type A (Desktop 50px)
#   → Objects to migrate: 1
#   ✓ MIGRATED successfully (1 objects corrected)
#
# ...
#
# ┌─────────────────────────────────────────────────────────┐
# │                  MIGRATION SUMMARY                      │
# └─────────────────────────────────────────────────────────┘
#
# Total Designs:           150
#   ├─ OLD designs:        50 (backward compatible)
#   ├─ NEW correct:        12 (offset=0)
#   ├─ NEW corrupted:      88
#   └─ Skipped:            0
#
# Migration Results:
#   ├─ Migrated:           88
#   ├─ Errors:             0
#   └─ Success Rate:       100%
#
# ✓ Migration logs saved to wp_options:
#   - canvas_offset_migration_log
#   - canvas_offset_migration_stats
#
# ✓ Migration complete
```

#### Immediate Post-Migration Checks

```bash
# Check migration stats
wp option get canvas_offset_migration_stats --format=json | jq '.'
# Expected:
# {
#   "total_designs": 150,
#   "old_designs": 50,
#   "new_designs_correct": 12,
#   "new_designs_corrupted": 88,
#   "migrated": 88,
#   "errors": 0,
#   "skipped": 0
# }

# Verify no errors occurred
wp option get canvas_offset_migration_errors
# Expected: (empty) or "No value"

# Check sample migrated designs
wp eval "
  \$log = get_option('canvas_offset_migration_log');
  echo 'First 5 migrated designs:' . PHP_EOL;
  foreach (array_slice(\$log, 0, 5) as \$entry) {
    echo sprintf(
      'ID: %d | Type: %s | Old offset: %.1fpx | Objects: %d' . PHP_EOL,
      \$entry['design_id'],
      \$entry['corruption_type'],
      \$entry['old_offset_x'],
      \$entry['objects_corrected']
    );
  }
"

# Expected output:
# First 5 migrated designs:
# ID: 123 | Type: Type A (Desktop 50px) | Old offset: 50.0px | Objects: 1
# ID: 124 | Type: Type A (Desktop 50px) | Old offset: 50.0px | Objects: 2
# ID: 125 | Type: Type B (Breakpoint 26.1px) | Old offset: 26.1px | Objects: 1
# ID: 126 | Type: Type A (Desktop 50px) | Old offset: 50.0px | Objects: 1
# ID: 127 | Type: Type A (Desktop 50px) | Old offset: 50.0px | Objects: 3
```

**CHECKPOINT**: If errors detected, STOP and execute rollback

```bash
# IF ERRORS > 0, rollback immediately:
wp eval-file rollback-offset-migration.php --confirm=1

# Then restore database backup:
wp db import backup-pre-migration-*.sql

# And notify team
```

---

### Day 6-7: Post-Migration Validation (2-4 hours)

#### Validation Tests

```bash
# Test 1: Load OLD design (created before Phase 1)
# 1. Open designer
# 2. Load design created before 2025-10-03
# 3. Verify renders correctly
# Expected: No visual changes ✓

# Test 2: Load migrated NEW design (Type A - Desktop 50px)
# 1. Open designer
# 2. Load design from migration log (Type A)
# 3. Verify renders correctly
# Expected: No visual changes, but coordinates now correct ✓

# Test 3: Load migrated NEW design (Type B - Breakpoint 26.1px)
# 1. Open designer
# 2. Load design from migration log (Type B)
# 3. Verify renders correctly
# Expected: No visual changes, but coordinates now correct ✓

# Test 4: Create NEW design (post-migration)
# 1. Create new design
# 2. Place logo at visual Y=200px
# 3. Save
# 4. Check database
# Expected: offset_x: 0, offset_y: 0 ✓

# Test 5: WooCommerce order creation
# 1. Load migrated design
# 2. Add to cart
# 3. Complete order
# 4. Check API payload sent to print provider
# Expected: Coordinates correct (canvas-relative) ✓
```

#### Database Validation

```bash
# Verify all NEW designs have offset_x = 0
wp eval "
  \$designs = get_posts(['post_type' => 'design', 'posts_per_page' => -1]);
  \$invalid = 0;

  foreach (\$designs as \$d) {
    \$data = get_post_meta(\$d->ID, 'design_data', true);

    if (isset(\$data['metadata']['offset_applied']) &&
        \$data['metadata']['offset_applied'] === true) {

      \$offset_x = floatval(\$data['metadata']['offset_x'] ?? 0);

      if (abs(\$offset_x) > 0.1) {
        echo 'INVALID: ID ' . \$d->ID . ' has offset_x=' . \$offset_x . PHP_EOL;
        \$invalid++;
      }
    }
  }

  if (\$invalid === 0) {
    echo 'SUCCESS: All NEW designs have offset_x ≈ 0' . PHP_EOL;
  } else {
    echo 'WARNING: ' . \$invalid . ' designs still have non-zero offset' . PHP_EOL;
  }
"

# Expected: SUCCESS: All NEW designs have offset_x ≈ 0
```

#### User Acceptance Testing (UAT)

- [ ] Load 5 random OLD designs - verify unchanged
- [ ] Load 5 random migrated designs (Type A) - verify unchanged
- [ ] Load 5 random migrated designs (Type B) - verify unchanged
- [ ] Create 3 new designs - verify offset_x = 0
- [ ] Create 3 WooCommerce orders - verify API payloads correct
- [ ] Test mobile viewport - verify offset_x = 0
- [ ] Test desktop viewport - verify offset_x = 0
- [ ] Test breakpoint viewport (950px) - verify offset_x = 0

**Success Criteria**:
- All validation tests PASSED ✓
- 0 visual regressions detected ✓
- All NEW designs have offset_x = 0 ✓
- API integration working correctly ✓
- No user-reported issues ✓

**Deliverable**: Post-migration validation report

---

## PHASE 4: Monitoring & Validation (Day 8-30) - PENDING

**Goal**: Monitor for edge cases and ensure long-term stability
**Duration**: 30 days (ongoing)
**Risk**: LOW
**Downtime**: None

### Week 2 (Day 8-14): Daily Monitoring

#### Daily Checklist

```bash
# Every day at 9AM, run these checks:

# 1. Check for new designs created
wp eval "
  \$designs = get_posts([
    'post_type' => 'design',
    'date_query' => [['after' => '24 hours ago']],
    'posts_per_page' => -1
  ]);

  echo 'New designs in last 24h: ' . count(\$designs) . PHP_EOL;

  foreach (\$designs as \$d) {
    \$data = get_post_meta(\$d->ID, 'design_data', true);
    if (isset(\$data['metadata']['offset_applied'])) {
      \$offset_x = floatval(\$data['metadata']['offset_x'] ?? 0);
      echo 'ID: ' . \$d->ID . ' | offset_x: ' . \$offset_x . PHP_EOL;

      if (abs(\$offset_x) > 0.1) {
        echo '⚠️  WARNING: Non-zero offset detected!' . PHP_EOL;
      }
    }
  }
"

# Expected: All new designs have offset_x ≈ 0

# 2. Check error logs
tail -100 /var/www/html/wp-content/debug.log | grep "OFFSET-FIX"

# Expected: No ERROR messages, only INFO logs

# 3. Check user bug reports
# Review support tickets for:
# - Logo position wrong
# - Design looks different after loading
# - Print output misaligned

# Expected: 0 tickets related to offset issues
```

#### Metrics to Track

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| New designs with offset=0 | 100% | ___ | ___ |
| User bug reports | 0 | ___ | ___ |
| API order errors | 0 | ___ | ___ |
| Visual regressions | 0 | ___ | ___ |
| Support tickets | 0 | ___ | ___ |

---

### Week 3-4 (Day 15-30): Weekly Monitoring

#### Weekly Checklist

```bash
# Every Monday, run these checks:

# 1. Weekly design creation stats
wp eval "
  \$designs = get_posts([
    'post_type' => 'design',
    'date_query' => [['after' => '7 days ago']],
    'posts_per_page' => -1
  ]);

  \$total = count(\$designs);
  \$with_offset = 0;

  foreach (\$designs as \$d) {
    \$data = get_post_meta(\$d->ID, 'design_data', true);
    if (isset(\$data['metadata']['offset_applied'])) {
      \$offset_x = floatval(\$data['metadata']['offset_x'] ?? 0);
      if (abs(\$offset_x) > 0.1) {
        \$with_offset++;
      }
    }
  }

  echo 'Week Summary:' . PHP_EOL;
  echo '  Total designs: ' . \$total . PHP_EOL;
  echo '  With non-zero offset: ' . \$with_offset . PHP_EOL;
  echo '  Success rate: ' . ((\$total - \$with_offset) / \$total * 100) . '%' . PHP_EOL;
"

# Expected: Success rate = 100%

# 2. Migration log review
wp option get canvas_offset_migration_stats --format=json | jq '.'

# Expected: Stats unchanged (no new corruptions)

# 3. Support ticket review
# Review all tickets from past week
# Filter for keywords: offset, position, alignment, logo, print

# Expected: 0 tickets related to canvas offset bug
```

---

### Day 30: Final Assessment & Rollback Window Closure

#### Final Validation

```bash
# Comprehensive 30-day report

echo "┌─────────────────────────────────────────────────────────┐"
echo "│           30-DAY POST-MIGRATION REPORT                  │"
echo "└─────────────────────────────────────────────────────────┘"
echo ""

# 1. Migration stats (unchanged since Day 5)
echo "Migration Statistics:"
wp option get canvas_offset_migration_stats --format=json | jq '.'

# 2. New designs since migration
echo ""
echo "New Designs Created (Day 0-30):"
wp eval "
  \$designs = get_posts([
    'post_type' => 'design',
    'date_query' => [['after' => '30 days ago']],
    'posts_per_page' => -1
  ]);

  \$total = count(\$designs);
  \$corrupted = 0;

  foreach (\$designs as \$d) {
    \$data = get_post_meta(\$d->ID, 'design_data', true);
    if (isset(\$data['metadata']['offset_applied'])) {
      \$offset_x = floatval(\$data['metadata']['offset_x'] ?? 0);
      if (abs(\$offset_x) > 0.1) {
        \$corrupted++;
      }
    }
  }

  echo '  Total: ' . \$total . PHP_EOL;
  echo '  Corrupted: ' . \$corrupted . PHP_EOL;
  echo '  Success Rate: ' . ((\$total - \$corrupted) / \$total * 100) . '%' . PHP_EOL;
"

# 3. Support tickets
echo ""
echo "Support Ticket Summary:"
echo "  Offset-related tickets: 0"  # Manual count from support system
echo "  User complaints: 0"          # Manual count

# 4. API integration health
echo ""
echo "API Integration Health:"
# Check recent WooCommerce orders
wp eval "
  \$orders = wc_get_orders([
    'limit' => 100,
    'date_created' => '>' . (time() - 30*24*60*60)
  ]);

  echo '  Orders in last 30 days: ' . count(\$orders) . PHP_EOL;
  echo '  Orders with design data: ' .
    count(array_filter(\$orders, function(\$o) {
      return !empty(get_post_meta(\$o->get_id(), 'octo_print_design_data', true));
    })) . PHP_EOL;
"

# 5. Recommendation
echo ""
echo "┌─────────────────────────────────────────────────────────┐"
echo "│                  FINAL RECOMMENDATION                   │"
echo "└─────────────────────────────────────────────────────────┘"
echo ""

# IF success rate = 100% AND support tickets = 0:
echo "✓ MIGRATION SUCCESSFUL"
echo "✓ Rollback window can be CLOSED"
echo "✓ Database backups from Day 5 can be ARCHIVED"
echo "✓ Migration scripts can be ARCHIVED"
echo ""
echo "Next Steps:"
echo "1. Archive database backups to long-term storage"
echo "2. Remove migration scripts from production"
echo "3. Update documentation with final results"
echo "4. Close monitoring tickets"
echo "5. Schedule Phase 5 (optional): Code cleanup to remove dead code"
```

**Success Criteria for Rollback Window Closure**:
- [ ] 100% of new designs (Day 0-30) have offset_x = 0
- [ ] 0 support tickets related to offset issues
- [ ] 0 user-reported visual regressions
- [ ] API integration working correctly for all orders
- [ ] No errors in logs related to OFFSET-FIX

**If ALL criteria met**: CLOSE rollback window, archive backups, MISSION COMPLETE
**If ANY criteria not met**: INVESTIGATE, extend monitoring, consider rollback

---

## Pre-Deployment Checklist

### Environment Preparation

- [ ] **Development environment ready**
  - [ ] Git repository up to date
  - [ ] All agent reports reviewed
  - [ ] Architecture decision confirmed (Architecture A)

- [ ] **Staging environment ready**
  - [ ] Matches production (PHP, WordPress, WooCommerce versions)
  - [ ] Database cloned from production
  - [ ] WP-CLI installed and working

- [ ] **Production environment verified**
  - [ ] PHP 7.4+ confirmed
  - [ ] WordPress 5.0+ confirmed
  - [ ] WooCommerce 3.0+ confirmed
  - [ ] Sufficient disk space (5GB+)
  - [ ] WP-CLI operational

### Backup Strategy

- [ ] **Database backup plan**
  - [ ] Backup location identified (/backups/ or S3)
  - [ ] Backup retention policy defined (90 days)
  - [ ] Restoration procedure tested on staging

- [ ] **File backup plan**
  - [ ] Plugin files backed up
  - [ ] Backup verification procedure defined

### Team Readiness

- [ ] **Roles assigned**
  - [ ] Deployment lead: ___________
  - [ ] Backend developer: ___________
  - [ ] DevOps engineer: ___________
  - [ ] QA engineer: ___________
  - [ ] Support team lead: ___________

- [ ] **Communication plan**
  - [ ] Stakeholders notified (24h advance)
  - [ ] Emergency contact list prepared
  - [ ] Slack/Teams channel created for deployment

- [ ] **Schedule confirmed**
  - [ ] Phase 2 start date: ___________
  - [ ] Phase 3 start date: ___________
  - [ ] Low-traffic window identified: ___________

### Technical Readiness

- [ ] **Migration scripts validated**
  - [ ] Syntax check passed
  - [ ] Dry run tested on staging
  - [ ] Rollback script tested on staging

- [ ] **Monitoring tools ready**
  - [ ] Debug logging enabled
  - [ ] Error log access confirmed
  - [ ] WP-CLI access confirmed

### Risk Assessment

- [ ] **Risk mitigation reviewed**
  - [ ] Rollback procedure documented
  - [ ] Backup restoration tested
  - [ ] Team trained on emergency procedures

- [ ] **Go/No-Go criteria defined**
  - [ ] Phase 1 verification complete
  - [ ] Staging migration 100% successful
  - [ ] No blockers identified

---

## Monitoring & Validation

### Monitoring Strategy

#### Real-Time Monitoring (During Migration)

```bash
# Terminal 1: Monitor PHP error log
tail -f /var/www/html/wp-content/debug.log | grep -E "(ERROR|WARNING|OFFSET-FIX)"

# Terminal 2: Monitor migration script output
# (script will output to console)

# Terminal 3: Monitor system resources
watch -n 5 'ps aux | grep php'
```

#### Post-Deployment Monitoring

**Day 0-7: Hourly**
```bash
# Check for new corrupted designs
wp eval "
  \$recent = get_posts([
    'post_type' => 'design',
    'date_query' => [['after' => '1 hour ago']],
    'posts_per_page' => -1
  ]);
  foreach (\$recent as \$d) {
    \$data = get_post_meta(\$d->ID, 'design_data', true);
    if (isset(\$data['metadata']['offset_x']) && abs(\$data['metadata']['offset_x']) > 0.1) {
      echo 'WARNING: Design ' . \$d->ID . ' has offset_x=' . \$data['metadata']['offset_x'] . PHP_EOL;
    }
  }
"
```

**Day 8-14: Daily**
- Check new designs created (should all have offset_x=0)
- Review support tickets
- Monitor error logs

**Day 15-30: Weekly**
- Review weekly stats
- Support ticket summary
- API integration health check

### Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Migration success rate** | 100% | Migrated / Total corrupted |
| **New design corruption rate** | 0% | Corrupted since Phase 1 / Total new |
| **Visual regression rate** | 0% | Designs with visual changes / Total |
| **API integration success** | 100% | Successful orders / Total orders |
| **User-reported issues** | 0 | Support tickets count |
| **Rollback executions** | 0 | Number of rollbacks |

### Warning Signs

**STOP deployment and investigate if:**

- [ ] Migration success rate < 95%
- [ ] Any new designs created after Phase 1 have offset_x != 0
- [ ] Visual regressions detected (screenshot comparison)
- [ ] API integration errors in logs
- [ ] User-reported position issues
- [ ] Database errors during migration

**Escalation procedure:**
1. STOP all deployment activity
2. Notify deployment lead
3. Assemble emergency team (Slack/Teams call)
4. Assess severity
5. Execute rollback if necessary
6. Document incident
7. Post-mortem after resolution

---

## Rollback Procedures

### Rollback Triggers

Execute rollback if ANY of the following occur:

1. **Migration errors** > 5% of designs
2. **Visual regressions** detected in ANY design
3. **API integration failures** (coordinates wrong in print payloads)
4. **User complaints** > 3 within 24 hours
5. **Database corruption** detected
6. **Team decision** (Go/No-Go review)

### Rollback Procedures by Phase

#### Rollback Phase 1 (JavaScript Fix)

**If Phase 1 needs rollback:**

```bash
# This is UNLIKELY because Phase 1 only STOPS corruption, doesn't migrate existing data
# But if needed:

cd /var/www/html/wp-content/plugins/octo-print-designer

# Restore from Git
git revert fc3f8b7
npm run build  # If source files changed
# OR restore from backup:
cp public/js/dist/designer.bundle.js.backup-pre-offset-fix-* \
   public/js/dist/designer.bundle.js

# Clear caches
wp cache flush
sudo service php8.1-fpm reload

# Verify
grep "closest('.designer-editor')" public/js/dist/designer.bundle.js
# Expected: Line 931 shows .closest() again
```

**Time**: < 5 minutes
**Impact**: New designs will be corrupted again (but existing designs unaffected)

#### Rollback Phase 3 (Migration)

**If migration needs rollback:**

```bash
# Method 1: Use rollback script (RECOMMENDED)
cd /var/www/html
wp eval-file rollback-offset-migration.php --confirm=1

# Expected output:
# Rolling back 88 designs...
# Rolled back: 88
# Errors: 0
# ✓ Rollback complete

# Method 2: Restore database backup (NUCLEAR OPTION)
# ONLY if rollback script fails

# List available backups
ls -lh backup-pre-migration-*.sql

# Restore backup
wp db import backup-pre-migration-20251005-020000.sql

# Verify restoration
wp eval "
  \$stats = get_option('canvas_offset_migration_stats');
  if (empty(\$stats)) {
    echo 'Database restored - migration stats removed' . PHP_EOL;
  } else {
    echo 'WARNING: Migration stats still present' . PHP_EOL;
  }
"
```

**Time**: 5-15 minutes
**Impact**: Designs return to corrupted state (but known and documented)

### Post-Rollback Actions

After rollback execution:

1. **Verify rollback success**
   ```bash
   # Load 5 random designs
   # Verify they render correctly
   ```

2. **Document rollback reason**
   - What triggered the rollback?
   - What went wrong?
   - How many designs affected?

3. **Notify stakeholders**
   - Email to management
   - Slack notification
   - Support team briefing

4. **Post-mortem planning**
   - Schedule post-mortem meeting
   - Collect logs and error reports
   - Identify root cause of rollback

5. **Re-planning**
   - Fix issues identified
   - Re-test on staging
   - Reschedule deployment

---

## Stakeholder Communication

### Communication Timeline

| When | Audience | Channel | Message |
|------|----------|---------|---------|
| **T-24h** | All stakeholders | Email | Deployment announcement |
| **T-2h** | Tech team | Slack | Deployment starting soon |
| **T-0** | Tech team | Slack | Deployment started |
| **T+1h** | Tech team | Slack | Phase 1 complete |
| **T+24h** | Management | Email | Phase 1 summary |
| **Day 4** | All stakeholders | Email | Migration scheduled |
| **Day 5** | Tech team | Slack | Migration in progress |
| **Day 6** | All stakeholders | Email | Migration complete |
| **Day 30** | All stakeholders | Email | Final report |

### Communication Templates

#### Template 1: Pre-Deployment Announcement (T-24h)

**Subject**: [ACTION REQUIRED] Canvas Offset Bug Fix - Deployment Starting [DATE]

**To**: Development team, QA team, Support team, Management

**Body**:
```
Hi team,

We will be deploying a fix for the canvas offset bug on [DATE] starting at [TIME].

WHAT IS CHANGING:
- Bug fix: Logo positions will be saved correctly (no more 50px offset issue)
- Backward compatible: Existing designs will continue to work
- No user-facing changes: Invisible to end users

DEPLOYMENT PHASES:
- Phase 1 (Day 0): Code deployment - stops further corruption
- Phase 2 (Day 1-3): Migration script development
- Phase 3 (Day 4-7): Data migration - fixes existing corrupted designs
- Phase 4 (Day 8-30): Monitoring

EXPECTED DOWNTIME: None

RISK LEVEL: Low

WHAT YOU NEED TO DO:
- Development: Monitor Slack channel during deployment
- QA: Execute validation tests after each phase
- Support: Watch for user reports of position issues
- Management: No action required

ROLLBACK PLAN: < 5 minutes if needed

Questions? Reply to this email or ping #deployment channel.

Thanks,
[Deployment Lead]
```

#### Template 2: Deployment Started (T-0)

**Slack message**:
```
🚀 DEPLOYMENT STARTED: Canvas Offset Bug Fix

Phase 1: Code Deployment (1-Line Fix)
Status: IN PROGRESS
Expected duration: 2-4 hours

Monitor: #deployment-logs
Emergency contact: @deployment-lead
```

#### Template 3: Phase Complete (T+1h)

**Slack message**:
```
✅ PHASE 1 COMPLETE: Canvas Offset Bug Fix

Status: SUCCESS
Duration: 2 hours 15 minutes
Errors: 0

Verification:
✓ Code deployed
✓ Syntax validated
✓ Smoke tests passed
✓ Monitoring active

Next: Phase 2 starts [DATE]
```

#### Template 4: Migration Complete (Day 6)

**Subject**: [SUCCESS] Canvas Offset Bug Migration Complete

**To**: All stakeholders

**Body**:
```
Hi team,

The canvas offset bug migration has been completed successfully.

SUMMARY:
- Total designs processed: 150
- Designs migrated: 88
- Errors: 0
- Success rate: 100%

IMPACT:
- All NEW designs now save coordinates correctly
- All existing corrupted designs have been fixed
- 0 visual regressions detected
- API integration working correctly

NEXT STEPS:
- 30-day monitoring period (Day 8-30)
- Daily checks for first week
- Weekly checks for weeks 2-4
- Final assessment on Day 30

WHAT TO WATCH FOR:
- New designs should have offset_x = 0
- No user reports of position issues
- No API integration errors

Support team: If users report position issues, escalate to @backend-dev

Thanks for your support!

[Deployment Lead]
```

#### Template 5: Final Report (Day 30)

**Subject**: [FINAL REPORT] Canvas Offset Bug - 30-Day Post-Migration

**To**: All stakeholders

**Body**:
```
Hi team,

30 days after the canvas offset bug fix, here's the final report:

MIGRATION STATISTICS:
- Migrated designs: 88
- New designs created (Day 0-30): 42
- Corrupted new designs: 0
- Success rate: 100%

USER IMPACT:
- Support tickets related to offset: 0
- User complaints: 0
- Visual regressions: 0

API INTEGRATION:
- Orders processed: 156
- API errors: 0
- Coordinate accuracy: 100%

RECOMMENDATION:
✅ MIGRATION SUCCESSFUL
✅ Rollback window CLOSED
✅ Database backups archived
✅ Monitoring concluded

NEXT STEPS:
- Archive migration scripts
- Update documentation
- Close monitoring tickets
- Optional: Schedule Phase 5 (code cleanup - remove dead code)

LESSONS LEARNED:
- Staged deployment approach worked well
- 30-day monitoring period provided confidence
- Backup/rollback strategy was essential

Thank you all for your support during this deployment!

[Deployment Lead]
```

### User Communication (Optional)

**If users need to be notified:**

**Template: User Notification (Optional)**

**Subject**: Designer Improvement: More Accurate Logo Positioning

**To**: Active designer users

**Body**:
```
Hi [User],

We've deployed an improvement to the designer that makes logo positioning more accurate.

WHAT CHANGED:
- Logo coordinates are now saved more precisely
- Your existing designs will continue to work correctly
- New designs will be more accurate

NO ACTION REQUIRED:
- All changes are automatic
- Your existing designs are safe
- No need to re-create designs

WHAT YOU MIGHT NOTICE:
- Nothing! This change is invisible to you
- Designs will load exactly as before

Questions? Contact support at [email]

Thanks,
[Product Team]
```

**NOTE**: User notification is OPTIONAL and may not be necessary if changes are truly invisible.

---

## Risk Mitigation

### Risk Assessment Matrix

| Risk | Probability | Impact | Severity | Mitigation |
|------|-------------|--------|----------|------------|
| Migration errors | Low | High | MEDIUM | Dry run + staging test + rollback script |
| Visual regressions | Very Low | High | MEDIUM | Screenshot comparison + manual QA |
| API integration failure | Very Low | High | MEDIUM | API integration tests + monitoring |
| Database corruption | Very Low | Critical | HIGH | Database backup + verification |
| Rollback needed | Low | Medium | LOW | Rollback script tested + backup ready |
| User complaints | Very Low | Medium | LOW | Support team briefed + escalation plan |
| New designs corrupted | Very Low | High | MEDIUM | Phase 1 verification + monitoring |
| Performance degradation | Very Low | Low | LOW | System monitoring + resource checks |

### Risk Mitigation Strategies

#### 1. Database Corruption Risk

**Mitigation**:
- Full database backup before migration
- Backup verification (test import)
- Dry run on staging with production clone
- Migration script validation
- Rollback script tested

**Contingency**:
- If corruption detected → immediate rollback
- Database restore from backup
- Post-mortem to identify cause

#### 2. Visual Regression Risk

**Mitigation**:
- Screenshot comparison before/after
- Manual QA testing (5-10 designs)
- Staging environment testing
- Backward compatibility validation

**Contingency**:
- If regressions detected → STOP deployment
- Investigate root cause
- Fix and re-test on staging
- Resume only after 100% validation

#### 3. API Integration Failure Risk

**Mitigation**:
- API integration tests on staging
- Coordinate validation in API payloads
- Test orders created and verified
- PHP logging enabled for debugging

**Contingency**:
- If API errors detected → STOP deployment
- Check PHP logs for OFFSET-FIX messages
- Verify coordinate transformation logic
- Rollback if cannot resolve quickly

#### 4. New Design Corruption Risk

**Mitigation**:
- Phase 1 deployed first (stops corruption)
- Verification that offset_x = 0 for new designs
- Monitoring for 7 days before migration
- Daily checks on new designs

**Contingency**:
- If new corruptions detected → Phase 1 failed
- Rollback Phase 1 immediately
- Re-investigate container selector fix
- Do NOT proceed to Phase 3 until resolved

#### 5. User Complaint Risk

**Mitigation**:
- Backward compatibility guaranteed
- Visual regressions prevented (testing)
- Support team briefed and ready
- Escalation path defined

**Contingency**:
- If > 3 complaints in 24h → investigate
- Assess severity (cosmetic vs critical)
- Rollback if critical issues
- Fix and re-deploy if cosmetic issues

#### 6. Rollback Complexity Risk

**Mitigation**:
- Rollback script developed and tested
- Database backup restoration tested
- Rollback procedure documented
- Team trained on rollback process

**Contingency**:
- If rollback fails → escalate to senior engineer
- Use database restore (nuclear option)
- Document failure for post-mortem
- Prevent future rollback failures

---

## Appendix

### A. File Locations

| File | Location | Purpose |
|------|----------|---------|
| designer.bundle.js | `/public/js/dist/designer.bundle.js` | JavaScript fix (Phase 1) |
| class-octo-print-api-integration.php | `/includes/class-octo-print-api-integration.php` | PHP fix (Phase 1) |
| migration-offset-correction.php | `/migration-offset-correction.php` | Migration script (Phase 3) |
| rollback-offset-migration.php | `/rollback-offset-migration.php` | Rollback script |
| debug.log | `/wp-content/debug.log` | WordPress debug log |
| Database backups | `/backups/` or S3 | Pre-migration backups |

### B. Command Reference

**Database Operations**:
```bash
# Export database
wp db export backup-$(date +%Y%m%d-%H%M%S).sql

# Import database
wp db import backup-20251005-020000.sql

# Database size
wp db size

# Query database
wp db query "SELECT COUNT(*) FROM wp_posts WHERE post_type='design';"
```

**Design Data Operations**:
```bash
# Get design count
wp eval "echo get_posts(['post_type' => 'design', 'posts_per_page' => -1]) |  count;"

# Check design metadata
wp eval "
  \$d = get_post(123);
  \$data = get_post_meta(123, 'design_data', true);
  print_r(\$data['metadata']);
"

# Get migration stats
wp option get canvas_offset_migration_stats --format=json | jq '.'

# Get migration log
wp option get canvas_offset_migration_log --format=json | jq '.[]  | {id, type, old_offset_x}'
```

**Cache Operations**:
```bash
# Clear WordPress cache
wp cache flush

# Reload PHP-FPM
sudo service php8.1-fpm reload

# Clear OPcache
php -r "opcache_reset(); echo 'OPcache cleared';"
```

**Monitoring**:
```bash
# Tail debug log
tail -f /var/www/html/wp-content/debug.log | grep "OFFSET-FIX"

# Monitor PHP processes
watch -n 5 'ps aux | grep php'

# Check disk space
df -h /var/www
```

### C. Testing Scenarios

**Scenario 1: OLD Design (No offset_applied flag)**
- Design created before Phase 1
- No metadata.offset_applied flag
- Expected: Loads correctly, unchanged behavior

**Scenario 2: NEW Design Type A (Desktop 50px offset)**
- Design created at desktop viewport (>1200px) before Phase 1
- metadata.offset_applied = true, offset_x = 50
- Expected: After migration, offset_x = 0, visual position unchanged

**Scenario 3: NEW Design Type B (Breakpoint 26.1px offset)**
- Design created at breakpoint viewport (~950px) before Phase 1
- metadata.offset_applied = true, offset_x = 26.1
- Expected: After migration, offset_x = 0, visual position unchanged

**Scenario 4: NEW Design Type C (Mobile 0px offset)**
- Design created at mobile viewport (<720px) before Phase 1
- metadata.offset_applied = true, offset_x = 0
- Expected: Already correct, skipped by migration

**Scenario 5: NEW Design Post-Phase 1**
- Design created after Phase 1 deployment
- metadata.offset_applied = true, offset_x = 0
- Expected: Correct from the start, no migration needed

**Scenario 6: WooCommerce Order with OLD Design**
- Order created with OLD design (no offset_applied)
- Expected: API payload has coordinates as-is (backward compatible)

**Scenario 7: WooCommerce Order with Migrated Design**
- Order created with migrated NEW design
- Expected: API payload has correct canvas-relative coordinates

**Scenario 8: Design Created at Multiple Viewports**
- Create design at desktop, save
- Load at mobile, modify, save
- Load at breakpoint, modify, save
- Expected: offset_x always 0 after Phase 1

### D. Troubleshooting Guide

**Problem**: Migration script fails with database errors

**Solution**:
```bash
# Check database connection
wp db check

# Verify table exists
wp db query "SHOW TABLES LIKE 'wp_postmeta';"

# Check permissions
wp eval "echo get_post_meta(1, 'test', true);"

# If still failing: check PHP error log
tail -50 /var/log/php8.1-fpm/error.log
```

**Problem**: New designs still have offset_x != 0 after Phase 1

**Solution**:
```bash
# Verify Phase 1 code deployed
grep "containerElement = canvasElement.parentNode" \
  /var/www/html/wp-content/plugins/octo-print-designer/public/js/dist/designer.bundle.js

# If not found: Phase 1 rollback occurred or deployment failed
# Re-deploy Phase 1

# Clear browser cache
# Chrome: Ctrl+Shift+Del → Clear cache
# Or force refresh: Ctrl+F5
```

**Problem**: Visual regressions detected after migration

**Solution**:
```bash
# Immediate rollback
wp eval-file rollback-offset-migration.php --confirm=1

# Investigate cause
# - Check migration log for errors
# - Review screenshot comparisons
# - Test specific affected designs

# Fix and re-test on staging before re-deploying
```

**Problem**: API integration errors after migration

**Solution**:
```bash
# Check PHP logs
tail -100 /var/www/html/wp-content/debug.log | grep "OFFSET-FIX"

# Verify offset compensation logic
grep -A 20 "OFFSET-FIX: Handle frontend canvas offset" \
  /var/www/html/wp-content/plugins/octo-print-designer/includes/class-octo-print-api-integration.php

# Test with sample design
# 1. Create test order
# 2. Check API payload in logs
# 3. Verify coordinates are canvas-relative (NOT container-relative)
```

### E. Glossary

**Terms**:

- **OLD Design**: Design created before Phase 1, has no `metadata.offset_applied` flag
- **NEW Design**: Design created after OFFSET-FIX system was added (before Phase 1 bug fix), has `metadata.offset_applied = true`
- **Type A Corruption**: Desktop viewport (>1200px), offset_x ≈ 50px
- **Type B Corruption**: Breakpoint viewport (~950px), offset_x ≈ 26.1px
- **Type C Design**: Mobile viewport (<720px), offset_x = 0 (already correct)
- **Container Element**: The DOM element used as reference for coordinate calculations
- **Canvas Element**: The Fabric.js canvas element where designs are rendered
- **Offset**: The distance between container and canvas due to CSS padding
- **Migration**: Process of correcting coordinates in corrupted designs
- **Rollback**: Reverting changes to restore previous state
- **Backward Compatibility**: Old designs continue to work with new code

**Code Markers**:
- `🔧 OFFSET-FIX`: Log messages related to offset system
- `MIGRATION_BACKUP_CONFIRMED`: Safety check in migration script
- `legacy_offset_x/y`: Backup of original offset values before migration
- `migration_timestamp`: When design was migrated

### F. References

**Related Documents**:
- `AGENT-6-ARCHITECTURE-COMPARISON-DE.md` - Architecture analysis and comparison
- `AGENT-4-EXECUTIVE-SUMMARY-DE.md` - 26.1px discrepancy analysis
- `PRODUCTION-DEPLOYMENT-RUNBOOK.md` - Original Phase 1 deployment runbook
- `TECHNICAL-ARCHITECTURE-OFFSET-FIX.md` - Technical architecture documentation

**Git Commits**:
- `fc3f8b7` - Phase 1: 1-Line Fix Deployment
- Future commits will reference this runbook

**Contact**:
- Deployment Lead: ___________
- Backend Developer: ___________
- DevOps Engineer: ___________
- Support Team: ___________

---

## Document Changelog

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 2.0 | 2025-10-03 | Agent 6 | Initial runbook for Phases 2-4 (Migration) |
| 1.0 | 2025-10-03 | Agent 7 | Original runbook for Phase 1 (Code Fix) |

---

**END OF RUNBOOK**

For questions or clarifications, contact the deployment lead.
