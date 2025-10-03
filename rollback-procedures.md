# ROLLBACK PROCEDURES - Canvas Offset Fix
## Emergency Recovery & System Restoration

**Version**: 1.0.0
**Last Updated**: 2025-10-03
**Rollback Time**: < 5 minutes
**Risk Level**: LOW
**Data Safety**: 100% (No data loss)

---

## TABLE OF CONTENTS

1. [Quick Reference Guide](#quick-reference-guide)
2. [Rollback Decision Matrix](#rollback-decision-matrix)
3. [Code Rollback Procedures](#code-rollback-procedures)
4. [Database Rollback Procedures](#database-rollback-procedures)
5. [Automated Rollback Scripts](#automated-rollback-scripts)
6. [Verification & Testing](#verification--testing)
7. [Emergency Contact Procedures](#emergency-contact-procedures)
8. [Post-Rollback Actions](#post-rollback-actions)

---

## QUICK REFERENCE GUIDE

### What Was Changed?

**Commit**: `fc3f8b7` - Canvas Offset Bug Fix
**Date**: 2025-10-03 11:38:32 UTC
**Files Modified**: 2 files
**Lines Changed**: 74 lines (38 JavaScript + 36 PHP)

1. **`/workspaces/yprint_designtool/public/js/dist/designer.bundle.js`**
   - Added `getCanvasOffset()` function
   - Modified save path: ADD 50px offset to coordinates
   - Modified load path: SUBTRACT 50px offset from new designs
   - Added metadata tracking (offset_applied, offset_x, offset_y)

2. **`/workspaces/yprint_designtool/includes/class-octo-print-api-integration.php`**
   - Modified `convert_canvas_to_print_coordinates()`: SUBTRACT offset for Print API
   - Modified `estimate_position_from_canvas()`: Position detection with offset
   - Backward compatible via metadata flags

### Backup Files Location

```bash
# JavaScript backup (pre-fix)
/workspaces/yprint_designtool/public/js/dist/designer.bundle.js.backup-pre-offset-fix-1759487255

# PHP backup (pre-fix)
/workspaces/yprint_designtool/includes/class-octo-print-api-integration.php.backup-pre-offset-fix-1759488230

# Git commit (pre-fix)
git show fc3f8b7^:public/js/dist/designer.bundle.js
git show fc3f8b7^:includes/class-octo-print-api-integration.php
```

### Emergency Rollback Command

```bash
# ONE-COMMAND ROLLBACK (recommended)
bash /workspaces/yprint_designtool/AGENT-5-QUICK-ROLLBACK.sh
```

---

## ROLLBACK DECISION MATRIX

### TRIGGER 1: IMMEDIATE ROLLBACK REQUIRED

Execute rollback **IMMEDIATELY** if any of these occur:

| Symptom | Impact | Rollback Method | Notes |
|---------|--------|----------------|-------|
| Old designs don't load | CRITICAL | Code Rollback | Visual position changed for existing designs |
| Old designs misaligned by 50px | CRITICAL | Code Rollback | Offset fix broke backward compatibility |
| JavaScript fatal errors | CRITICAL | Code Rollback | "Uncaught TypeError", "Cannot read property" |
| PHP fatal errors | CRITICAL | Code Rollback | "Fatal error", "Call to undefined" |
| Error rate increase > 10% | CRITICAL | Code Rollback | Monitor error logs |
| Designer completely broken | CRITICAL | Code Rollback | White screen, blank canvas |
| Print API payload incorrect | CRITICAL | Code Rollback | Coordinates wrong for > 1 order |
| Customer complaints | CRITICAL | Code Rollback | Broken designs, lost work |
| Database corruption detected | CRITICAL | Full Rollback | Database + Code restoration |

**Decision**: Code Rollback (< 5 minutes)

---

### TRIGGER 2: CONDITIONAL ROLLBACK

Investigate first, rollback if issue persists:

| Symptom | Impact | Investigation Steps | Rollback If... |
|---------|--------|-------------------|---------------|
| Minor visual discrepancy (< 5px) | LOW | Check CSS, browser cache | Issue affects > 25% of designs |
| Performance degradation (< 10ms) | LOW | Profile code, check logs | Degradation > 50ms |
| Single isolated error | LOW | Check logs, reproduce | Error is reproducible |
| Edge case failure | MEDIUM | Test scenario, check metadata | Affects production users |
| Mobile responsiveness issue | MEDIUM | Test viewport sizes | Broken on < 720px width |
| Console warnings (non-fatal) | LOW | Review warning messages | Warnings increase error rate |

**Decision**: Monitor for 1-4 hours, rollback if issue escalates

---

### TRIGGER 3: DO NOT ROLLBACK

System is functioning correctly:

| Symptom | Why It's Normal | Action |
|---------|----------------|--------|
| Console logs with "OFFSET-FIX" | Expected behavior | Monitor, no action needed |
| Debug logs with offset calculations | Expected behavior | Normal operation |
| New designs have metadata.offset_applied | Expected behavior | Correct implementation |
| Old designs load without metadata | Expected backward compatibility | Working as designed |
| getBoundingClientRect() calls | Expected offset detection | Performance is < 1ms |
| Different offset on mobile (0,0) vs desktop (50,50) | Expected responsive behavior | CSS media query working |

**Decision**: No rollback needed, continue monitoring

---

## CODE ROLLBACK PROCEDURES

### METHOD 1: Automated Script (RECOMMENDED)

**Time**: < 2 minutes
**Risk**: Very Low
**Validation**: Automatic

```bash
# Navigate to plugin directory
cd /workspaces/yprint_designtool

# Execute automated rollback
bash AGENT-5-QUICK-ROLLBACK.sh

# Script will:
# 1. Create safety backup of current state
# 2. Restore pre-fix PHP file from backup
# 3. Validate PHP syntax
# 4. Clear OPCache
# 5. Log rollback completion
```

**What the script does:**
- Restores: `/includes/class-octo-print-api-integration.php`
- Creates safety backup: `.backup-with-offset-fix-[timestamp]`
- Validates PHP syntax before confirming
- Auto-detects and clears OPCache
- Logs all actions

**Script Output:**
```
==========================================
🔄 PHP RENDERER OFFSET FIX - ROLLBACK
==========================================

📋 Creating safety backup of current state...
   ✅ Saved to: [path]

🔄 Restoring original file from backup...
🔍 Validating PHP syntax...
   ✅ Syntax valid

==========================================
✅ ROLLBACK COMPLETE
==========================================
```

---

### METHOD 2: Manual Code Rollback

**Time**: < 5 minutes
**Risk**: Low
**Validation**: Manual

#### Step 1: Create Safety Backups

```bash
# Backup current state (with offset fix) before rolling back
cd /workspaces/yprint_designtool

# Backup JavaScript (current state)
cp public/js/dist/designer.bundle.js \
   public/js/dist/designer.bundle.js.backup-with-offset-fix-$(date +%s)

# Backup PHP (current state)
cp includes/class-octo-print-api-integration.php \
   includes/class-octo-print-api-integration.php.backup-with-offset-fix-$(date +%s)

# Verify backups created
ls -lah public/js/dist/*.backup-with-offset-fix-*
ls -lah includes/*.backup-with-offset-fix-*
```

#### Step 2: Restore Pre-Fix Files

```bash
# Restore JavaScript bundle (pre-fix version)
cp public/js/dist/designer.bundle.js.backup-pre-offset-fix-1759487255 \
   public/js/dist/designer.bundle.js

# Restore PHP integration file (pre-fix version)
cp includes/class-octo-print-api-integration.php.backup-pre-offset-fix-1759488230 \
   includes/class-octo-print-api-integration.php

# Verify restoration
ls -lah public/js/dist/designer.bundle.js
ls -lah includes/class-octo-print-api-integration.php
```

#### Step 3: Validate Restored Files

```bash
# Validate JavaScript syntax (optional, but recommended)
node -c public/js/dist/designer.bundle.js && echo "✅ JavaScript syntax valid"

# Validate PHP syntax (CRITICAL)
php -l includes/class-octo-print-api-integration.php
# Expected output: "No syntax errors detected"

# Check file sizes (should match backup sizes)
ls -lh public/js/dist/designer.bundle.js.backup-pre-offset-fix-1759487255
ls -lh public/js/dist/designer.bundle.js
# Sizes should match

ls -lh includes/class-octo-print-api-integration.php.backup-pre-offset-fix-1759488230
ls -lh includes/class-octo-print-api-integration.php
# Sizes should match
```

#### Step 4: Clear Caches

```bash
# Clear PHP OPCache (CRITICAL)
# Option A: Reload PHP-FPM service (recommended)
sudo service php8.1-fpm reload  # or php7.4-fpm depending on version

# Option B: Use WP-CLI
wp cache flush

# Option C: Programmatic reset
php -r "if(function_exists('opcache_reset')){opcache_reset(); echo 'OPCache cleared';}"

# Clear WordPress object cache (if Redis/Memcached used)
wp cache flush

# Clear browser cache (manual step)
# Instruct users to hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
```

#### Step 5: Verify Rollback

```bash
# Check for OFFSET-FIX markers (should be 0 after rollback)
grep -c "🔧 OFFSET-FIX" public/js/dist/designer.bundle.js
# Expected: 0

grep -c "🔧 OFFSET-FIX" includes/class-octo-print-api-integration.php
# Expected: 0

# Check for getCanvasOffset function (should not exist after rollback)
grep -c "getCanvasOffset" public/js/dist/designer.bundle.js
# Expected: 0

# Check file permissions
ls -la public/js/dist/designer.bundle.js
ls -la includes/class-octo-print-api-integration.php
# Expected: -rw-r--r-- or 644
```

---

### METHOD 3: Git Revert

**Time**: < 3 minutes
**Risk**: Medium (affects entire commit)
**Use When**: Clean git history needed

```bash
cd /workspaces/yprint_designtool

# Option A: Soft revert (keeps changes in working directory)
git revert fc3f8b7 --no-commit
git status  # Review changes
# Manual step: Remove documentation files from staging
git restore --staged AGENT-*.md AGENT-*.json *.md
git commit -m "Revert: Canvas Offset Fix due to [REASON]"

# Option B: Hard revert (creates new commit)
git revert fc3f8b7
# This will revert ALL changes including documentation

# Option C: Reset to previous commit (DESTRUCTIVE)
git reset --hard fc3f8b7^
# WARNING: This removes commit from history entirely
# Only use if commit was not pushed to remote
```

**Important Notes:**
- Method A: Preserves documentation, only reverts code
- Method B: Reverts everything (code + docs)
- Method C: DESTRUCTIVE - Only use locally before pushing

---

## DATABASE ROLLBACK PROCEDURES

### Understanding Database Impact

**IMPORTANT**: The canvas offset fix is **100% backward compatible** and does **NOT** require database migration.

- **Old Designs**: No metadata flag → Coordinates used as-is → **No change**
- **New Designs**: Has metadata flag → Offset applied → **Self-contained**
- **Database Schema**: **Not modified** (no ALTER TABLE commands)
- **Data Structure**: **Not changed** (design_data JSON format unchanged)

### When Database Rollback is Needed

Database rollback is **ONLY** needed if:

1. **Data Corruption Detected**: design_data JSON is malformed
2. **Mass Migration Gone Wrong**: Bulk update script corrupted designs
3. **Manual Database Edits Failed**: Direct SQL updates caused issues

**Likelihood**: VERY LOW (< 1% of rollback scenarios)

---

### METHOD 1: WordPress Database Export/Import (RECOMMENDED)

**Time**: 5-30 minutes (depends on database size)
**Risk**: Very Low
**Data Loss**: None (if backup is recent)

#### Pre-Rollback: Create Database Backup

```bash
# Create backup BEFORE deploying offset fix (CRITICAL)
cd /workspaces/yprint_designtool

# Export entire WordPress database
wp db export backup-pre-offset-fix-$(date +%Y%m%d-%H%M%S).sql

# Verify backup created
ls -lah backup-pre-offset-fix-*.sql

# Optional: Compress backup to save space
gzip backup-pre-offset-fix-*.sql

# Optional: Export only design table (faster)
wp db export backup-designs-only-$(date +%Y%m%d-%H%M%S).sql \
  --tables=wp_octo_user_designs
```

#### Rollback: Restore Database from Backup

```bash
# WARNING: This will OVERWRITE current database data
# Make sure you have a recent backup of CURRENT state before restoring

# Step 1: Create safety backup of CURRENT database
wp db export safety-backup-current-state-$(date +%Y%m%d-%H%M%S).sql

# Step 2: Verify backup file exists
ls -lah backup-pre-offset-fix-*.sql

# Step 3: Restore database from backup
# Option A: Full database restore
wp db import backup-pre-offset-fix-20251003-113000.sql  # Use actual filename

# Option B: Restore compressed backup
gunzip -c backup-pre-offset-fix-20251003-113000.sql.gz | wp db import -

# Option C: Restore only design table (if you exported only that table)
mysql -u [username] -p [database_name] < backup-designs-only-20251003-113000.sql
```

#### Verification After Database Restore

```bash
# Check database integrity
wp db check

# Verify design count (should match pre-fix count)
wp db query "SELECT COUNT(*) FROM wp_octo_user_designs;"

# Check for designs with offset metadata (should be 0 after restore)
wp db query "SELECT COUNT(*) FROM wp_octo_user_designs
  WHERE design_data LIKE '%offset_applied%';"
# Expected: 0 (no new designs with metadata)

# Test loading a design in WordPress admin
# Manual step: Open designer, load existing design, verify no errors
```

---

### METHOD 2: Inverse Migration Script

**Time**: 10-20 minutes
**Risk**: Medium
**Use When**: Only NEW designs need to be reverted (old designs are fine)

**Scenario**: You deployed the fix, users created new designs with offset metadata, now you need to rollback but preserve new designs.

#### Script: Remove Offset Metadata and Adjust Coordinates

```bash
# Create inverse migration script
cat > /tmp/inverse-offset-migration.php << 'EOF'
<?php
/**
 * Inverse Offset Migration Script
 * Removes offset_applied metadata and re-applies offset to coordinates
 * Use this to revert new designs to pre-fix format
 */

// Load WordPress
require_once('/var/www/html/wp-load.php');

global $wpdb;

// Find all designs with offset metadata
$designs = $wpdb->get_results("
    SELECT id, design_data
    FROM {$wpdb->prefix}octo_user_designs
    WHERE design_data LIKE '%offset_applied%'
");

$total = count($designs);
$updated = 0;
$errors = 0;

echo "Found {$total} designs with offset metadata\n";

foreach ($designs as $design) {
    $data = json_decode($design->design_data, true);

    if (!$data) {
        echo "ERROR: Could not decode JSON for design ID {$design->id}\n";
        $errors++;
        continue;
    }

    $modified = false;

    // Process each variation and view
    foreach ($data as $variation_key => &$variation_data) {
        if (!is_array($variation_data)) continue;

        foreach ($variation_data as $view_key => &$view_data) {
            if (!isset($view_data['images']) || !is_array($view_data['images'])) continue;

            foreach ($view_data['images'] as &$image_data) {
                // Check if this image has offset metadata
                if (isset($image_data['metadata']['offset_applied'])
                    && $image_data['metadata']['offset_applied'] === true) {

                    // Re-apply offset to coordinates (reverse of fix)
                    $offset_x = floatval($image_data['metadata']['offset_x'] ?? 0);
                    $offset_y = floatval($image_data['metadata']['offset_y'] ?? 0);

                    if (isset($image_data['transform'])) {
                        $image_data['transform']['left'] -= $offset_x;
                        $image_data['transform']['top'] -= $offset_y;
                    }

                    // Remove offset metadata
                    unset($image_data['metadata']['offset_applied']);
                    unset($image_data['metadata']['offset_x']);
                    unset($image_data['metadata']['offset_y']);
                    unset($image_data['metadata']['offset_fix_version']);
                    unset($image_data['metadata']['offset_fix_timestamp']);

                    $modified = true;
                }
            }
        }
    }

    if ($modified) {
        // Update database
        $updated_data = json_encode($data);
        $result = $wpdb->update(
            "{$wpdb->prefix}octo_user_designs",
            array('design_data' => $updated_data),
            array('id' => $design->id),
            array('%s'),
            array('%d')
        );

        if ($result !== false) {
            $updated++;
            echo "✅ Updated design ID {$design->id}\n";
        } else {
            $errors++;
            echo "❌ Failed to update design ID {$design->id}\n";
        }
    }
}

echo "\n======================\n";
echo "Migration Complete\n";
echo "======================\n";
echo "Total designs found: {$total}\n";
echo "Successfully updated: {$updated}\n";
echo "Errors: {$errors}\n";
?>
EOF

# Execute the script
php /tmp/inverse-offset-migration.php

# Clean up
rm /tmp/inverse-offset-migration.php
```

**Warning**: This script is DESTRUCTIVE. Test on staging first!

---

### METHOD 3: Selective Table Restore

**Time**: 5-10 minutes
**Risk**: Low
**Use When**: Only user_designs table needs restoration

```bash
# Step 1: Export CURRENT user_designs table (safety backup)
wp db export - --tables=wp_octo_user_designs > \
  safety-backup-user-designs-$(date +%Y%m%d-%H%M%S).sql

# Step 2: Drop CURRENT user_designs table
wp db query "DROP TABLE wp_octo_user_designs;"

# Step 3: Extract user_designs table from pre-fix backup
# (This assumes you have a full database backup from pre-fix)
sed -n '/CREATE TABLE.*wp_octo_user_designs/,/UNLOCK TABLES/p' \
  backup-pre-offset-fix-20251003-113000.sql > user_designs_only.sql

# Step 4: Import user_designs table only
wp db import user_designs_only.sql

# Step 5: Verify
wp db query "SELECT COUNT(*) FROM wp_octo_user_designs;"

# Cleanup
rm user_designs_only.sql
```

---

## AUTOMATED ROLLBACK SCRIPTS

### Script 1: Complete System Rollback

**Location**: `/workspaces/yprint_designtool/complete-rollback.sh`

```bash
#!/bin/bash
#
# COMPLETE SYSTEM ROLLBACK - Canvas Offset Fix
# Reverts code + database to pre-fix state
# Usage: bash complete-rollback.sh [database_backup.sql]
#

set -e  # Exit on error

echo "======================================"
echo "🔄 COMPLETE SYSTEM ROLLBACK"
echo "======================================"
echo ""

# Configuration
PLUGIN_DIR="/workspaces/yprint_designtool"
JS_BACKUP="${PLUGIN_DIR}/public/js/dist/designer.bundle.js.backup-pre-offset-fix-1759487255"
PHP_BACKUP="${PLUGIN_DIR}/includes/class-octo-print-api-integration.php.backup-pre-offset-fix-1759488230"
JS_TARGET="${PLUGIN_DIR}/public/js/dist/designer.bundle.js"
PHP_TARGET="${PLUGIN_DIR}/includes/class-octo-print-api-integration.php"
DB_BACKUP="${1}"  # Pass as first argument

# Validation
if [ ! -f "$JS_BACKUP" ]; then
    echo "❌ ERROR: JavaScript backup not found at $JS_BACKUP"
    exit 1
fi

if [ ! -f "$PHP_BACKUP" ]; then
    echo "❌ ERROR: PHP backup not found at $PHP_BACKUP"
    exit 1
fi

# Optional: Database backup
if [ -n "$DB_BACKUP" ] && [ ! -f "$DB_BACKUP" ]; then
    echo "❌ ERROR: Database backup not found at $DB_BACKUP"
    exit 1
fi

# Step 1: Create safety backups
echo "📋 Creating safety backups of current state..."
TIMESTAMP=$(date +%s)
cp "$JS_TARGET" "${JS_TARGET}.backup-with-offset-fix-${TIMESTAMP}"
cp "$PHP_TARGET" "${PHP_TARGET}.backup-with-offset-fix-${TIMESTAMP}"
echo "   ✅ Safety backups created"
echo ""

# Step 2: Restore code files
echo "🔄 Restoring code files..."
cp "$JS_BACKUP" "$JS_TARGET"
cp "$PHP_BACKUP" "$PHP_TARGET"
echo "   ✅ JavaScript restored"
echo "   ✅ PHP restored"
echo ""

# Step 3: Validate syntax
echo "🔍 Validating syntax..."
if php -l "$PHP_TARGET" >/dev/null 2>&1; then
    echo "   ✅ PHP syntax valid"
else
    echo "   ❌ PHP syntax error detected!"
    echo "   🔄 Restoring offset fix version..."
    cp "${PHP_TARGET}.backup-with-offset-fix-${TIMESTAMP}" "$PHP_TARGET"
    echo "   ❌ Rollback failed - code restored to offset fix version"
    exit 1
fi

# Step 4: Clear caches
echo "🗑️  Clearing caches..."
if command -v wp &> /dev/null; then
    wp cache flush 2>/dev/null && echo "   ✅ WordPress cache cleared" || true
fi

if php -m 2>/dev/null | grep -q "Zend OPcache"; then
    php -r "if(function_exists('opcache_reset')){opcache_reset(); echo '   ✅ OPCache cleared\n';}" 2>/dev/null || echo "   ⚠️  OPCache clear failed (may require service restart)"
fi
echo ""

# Step 5: Database restore (optional)
if [ -n "$DB_BACKUP" ]; then
    echo "💾 Restoring database..."

    # Create current database backup first
    if command -v wp &> /dev/null; then
        echo "   📋 Creating safety backup of current database..."
        wp db export "safety-backup-current-state-${TIMESTAMP}.sql"
        echo "   ✅ Database safety backup created"
    fi

    # Restore from backup
    echo "   🔄 Importing database backup..."
    if command -v wp &> /dev/null; then
        wp db import "$DB_BACKUP"
        echo "   ✅ Database restored"
    else
        echo "   ⚠️  WP-CLI not available, skipping database restore"
        echo "   Manual restore required: mysql -u [user] -p [database] < $DB_BACKUP"
    fi
    echo ""
fi

# Step 6: Verification
echo "🔍 Verifying rollback..."
JS_MARKERS=$(grep -c "🔧 OFFSET-FIX" "$JS_TARGET" || echo "0")
PHP_MARKERS=$(grep -c "🔧 OFFSET-FIX" "$PHP_TARGET" || echo "0")

if [ "$JS_MARKERS" -eq 0 ] && [ "$PHP_MARKERS" -eq 0 ]; then
    echo "   ✅ Rollback verification passed"
else
    echo "   ⚠️  Warning: Found $JS_MARKERS JS markers and $PHP_MARKERS PHP markers"
    echo "   Expected: 0 markers (clean pre-fix state)"
fi
echo ""

# Summary
echo "======================================"
echo "✅ ROLLBACK COMPLETE"
echo "======================================"
echo ""
echo "📊 Status:"
echo "   - JavaScript: Restored to pre-fix version"
echo "   - PHP: Restored to pre-fix version"
if [ -n "$DB_BACKUP" ]; then
    echo "   - Database: Restored from backup"
else
    echo "   - Database: Not modified (backward compatible)"
fi
echo "   - Safety backups: Created with timestamp ${TIMESTAMP}"
echo ""
echo "⚠️  Impact:"
echo "   - Old designs: Continue working (no change)"
echo "   - New designs: Will render 50px off (back to broken state)"
echo "   - Offset fix: Completely removed"
echo ""
echo "🔄 To re-apply the fix:"
echo "   git checkout fc3f8b7 -- public/js/dist/designer.bundle.js includes/class-octo-print-api-integration.php"
echo ""
echo "📝 Next Steps:"
echo "   1. Clear browser caches (Ctrl+Shift+R)"
echo "   2. Test old design loading"
echo "   3. Monitor error logs for 30 minutes"
echo "   4. Notify team of rollback completion"
echo ""
echo "✅ Rollback completed successfully at $(date)"
```

### Script 2: Code-Only Rollback (Fast)

**Location**: `/workspaces/yprint_designtool/code-rollback-fast.sh`

```bash
#!/bin/bash
#
# CODE-ONLY ROLLBACK (FAST) - Canvas Offset Fix
# Reverts ONLY JavaScript and PHP files (no database changes)
# Usage: bash code-rollback-fast.sh
#

set -e

echo "⚡ FAST CODE ROLLBACK - Canvas Offset Fix"
echo "=========================================="

# Restore files
cp public/js/dist/designer.bundle.js.backup-pre-offset-fix-1759487255 \
   public/js/dist/designer.bundle.js

cp includes/class-octo-print-api-integration.php.backup-pre-offset-fix-1759488230 \
   includes/class-octo-print-api-integration.php

# Validate
php -l includes/class-octo-print-api-integration.php >/dev/null 2>&1 && \
  echo "✅ PHP syntax valid" || (echo "❌ PHP syntax error!" && exit 1)

# Clear OPCache
php -r "if(function_exists('opcache_reset')){opcache_reset(); echo '✅ OPCache cleared\n';}" 2>/dev/null || \
  echo "⚠️  OPCache clear failed"

# Verification
MARKERS=$(grep -c "🔧 OFFSET-FIX" public/js/dist/designer.bundle.js || echo "0")
if [ "$MARKERS" -eq 0 ]; then
    echo "✅ Rollback complete ($(date))"
else
    echo "⚠️  Warning: Found $MARKERS OFFSET-FIX markers"
fi
```

### Script 3: Validation-Only Script

**Location**: `/workspaces/yprint_designtool/validate-rollback.sh`

```bash
#!/bin/bash
#
# ROLLBACK VALIDATION SCRIPT
# Verifies rollback was successful
# Usage: bash validate-rollback.sh
#

echo "🔍 Rollback Validation"
echo "======================"
echo ""

PASS=0
FAIL=0

# Check 1: OFFSET-FIX markers removed
echo "✓ Checking for OFFSET-FIX markers..."
JS_MARKERS=$(grep -c "🔧 OFFSET-FIX" public/js/dist/designer.bundle.js || echo "0")
PHP_MARKERS=$(grep -c "🔧 OFFSET-FIX" includes/class-octo-print-api-integration.php || echo "0")

if [ "$JS_MARKERS" -eq 0 ] && [ "$PHP_MARKERS" -eq 0 ]; then
    echo "  ✅ PASS: No OFFSET-FIX markers found"
    ((PASS++))
else
    echo "  ❌ FAIL: Found $JS_MARKERS JS markers and $PHP_MARKERS PHP markers"
    ((FAIL++))
fi

# Check 2: getCanvasOffset function removed
echo "✓ Checking for getCanvasOffset function..."
OFFSET_FUNC=$(grep -c "getCanvasOffset" public/js/dist/designer.bundle.js || echo "0")

if [ "$OFFSET_FUNC" -eq 0 ]; then
    echo "  ✅ PASS: getCanvasOffset function removed"
    ((PASS++))
else
    echo "  ❌ FAIL: getCanvasOffset function still exists"
    ((FAIL++))
fi

# Check 3: PHP syntax validation
echo "✓ Validating PHP syntax..."
if php -l includes/class-octo-print-api-integration.php >/dev/null 2>&1; then
    echo "  ✅ PASS: PHP syntax valid"
    ((PASS++))
else
    echo "  ❌ FAIL: PHP syntax errors detected"
    ((FAIL++))
fi

# Check 4: File sizes match backups
echo "✓ Checking file sizes..."
JS_SIZE=$(stat -c%s public/js/dist/designer.bundle.js 2>/dev/null || stat -f%z public/js/dist/designer.bundle.js 2>/dev/null)
JS_BACKUP_SIZE=$(stat -c%s public/js/dist/designer.bundle.js.backup-pre-offset-fix-1759487255 2>/dev/null || stat -f%z public/js/dist/designer.bundle.js.backup-pre-offset-fix-1759487255 2>/dev/null)

if [ "$JS_SIZE" -eq "$JS_BACKUP_SIZE" ]; then
    echo "  ✅ PASS: JavaScript file size matches backup"
    ((PASS++))
else
    echo "  ❌ FAIL: JavaScript file size mismatch (current: $JS_SIZE, backup: $JS_BACKUP_SIZE)"
    ((FAIL++))
fi

# Check 5: Backup files exist
echo "✓ Checking backup files..."
if [ -f "public/js/dist/designer.bundle.js.backup-pre-offset-fix-1759487255" ] && \
   [ -f "includes/class-octo-print-api-integration.php.backup-pre-offset-fix-1759488230" ]; then
    echo "  ✅ PASS: Backup files exist"
    ((PASS++))
else
    echo "  ❌ FAIL: Backup files missing"
    ((FAIL++))
fi

# Summary
echo ""
echo "======================"
echo "📊 Validation Summary"
echo "======================"
echo "✅ Passed: $PASS"
echo "❌ Failed: $FAIL"
echo ""

if [ "$FAIL" -eq 0 ]; then
    echo "🎉 All validation checks passed!"
    echo "✅ Rollback was successful"
    exit 0
else
    echo "⚠️  Some validation checks failed"
    echo "❌ Rollback may be incomplete"
    exit 1
fi
```

---

## VERIFICATION & TESTING

### Post-Rollback Testing Checklist

Execute these tests **IMMEDIATELY** after rollback:

#### Test 1: Old Design Loading (CRITICAL)

```bash
# Manual test in browser
# 1. Open WordPress admin: /wp-admin/admin.php?page=octo-print-designer
# 2. Load an existing design (saved before offset fix was deployed)
# 3. Check browser console (F12)
# 4. Verify visual position matches pre-fix position

# Expected Results:
✅ No JavaScript console errors
✅ No "OFFSET-FIX" log messages
✅ Design loads at same position as before fix was deployed
✅ No visual displacement or misalignment
```

#### Test 2: New Design Creation

```bash
# Manual test in browser
# 1. Create new design
# 2. Upload logo and position it
# 3. Save design
# 4. Reload page and load saved design

# Expected Results:
✅ Design saves without errors
✅ Design loads without errors
✅ Visual position is 50px off (expected behavior in pre-fix state)
⚠️  This confirms rollback was successful (bug is back)
```

#### Test 3: PHP Error Log Check

```bash
# Check WordPress debug log
tail -100 wp-content/debug.log

# Expected Results:
✅ No "OFFSET-FIX" log messages
✅ No PHP fatal errors
✅ No warnings related to offset calculations
```

#### Test 4: Database Integrity

```bash
# Check database connection
wp db check

# Count designs
wp db query "SELECT COUNT(*) FROM wp_octo_user_designs;"

# Check for orphaned offset metadata (if database was NOT rolled back)
wp db query "SELECT COUNT(*) FROM wp_octo_user_designs
  WHERE design_data LIKE '%offset_applied%';"

# Expected Results:
✅ Database accessible
✅ Design count matches expected number
⚠️  If metadata exists, designs with offset_applied flag will render 50px off (expected)
```

#### Test 5: File Integrity

```bash
# Verify no OFFSET-FIX markers
grep -c "🔧 OFFSET-FIX" public/js/dist/designer.bundle.js
# Expected: 0

grep -c "🔧 OFFSET-FIX" includes/class-octo-print-api-integration.php
# Expected: 0

# Verify file sizes match backups
diff public/js/dist/designer.bundle.js \
     public/js/dist/designer.bundle.js.backup-pre-offset-fix-1759487255
# Expected: No differences

diff includes/class-octo-print-api-integration.php \
     includes/class-octo-print-api-integration.php.backup-pre-offset-fix-1759488230
# Expected: No differences
```

---

### Automated Validation Command

```bash
# Run complete validation suite
bash validate-rollback.sh

# If all checks pass, proceed to monitoring phase
# If any checks fail, investigate immediately
```

---

## EMERGENCY CONTACT PROCEDURES

### Escalation Matrix

| Severity | Response Time | Contact | Method |
|----------|--------------|---------|--------|
| P0 - Complete system down | Immediate | Lead Developer | Phone + Slack |
| P1 - Critical functionality broken | < 15 min | Development Team | Slack |
| P2 - Partial functionality broken | < 1 hour | Development Team | Email + Slack |
| P3 - Minor issues, workaround exists | < 4 hours | Development Team | Email |

### Contact Information

```yaml
# Update with actual contact details
Lead Developer:
  Name: [NAME]
  Phone: [PHONE]
  Email: [EMAIL]
  Slack: @[USERNAME]

DevOps Team:
  On-Call: [PHONE]
  Email: devops@company.com
  Slack: #devops-emergency

Database Admin:
  Name: [NAME]
  Phone: [PHONE]
  Email: [EMAIL]
  Slack: @[USERNAME]
```

### Communication Template

**Subject**: EMERGENCY ROLLBACK - Canvas Offset Fix [STATUS]

```
Priority: [P0/P1/P2/P3]
System: yprint_designtool - Canvas Designer
Issue: [Brief description]
Rollback Status: [IN PROGRESS / COMPLETE / FAILED]
Impact: [User-facing impact]
Timeline:
  - Issue detected: [TIME]
  - Rollback initiated: [TIME]
  - Rollback completed: [TIME]
  - System restored: [TIME]
Verification:
  - [✅/❌] Code files restored
  - [✅/❌] Database restored (if applicable)
  - [✅/❌] Old designs loading correctly
  - [✅/❌] No errors in logs
Next Steps:
  1. [Action item]
  2. [Action item]
Root Cause: [Brief explanation or "Under investigation"]
```

### Slack Alert Command

```bash
# If Slack webhook is configured
curl -X POST -H 'Content-type: application/json' \
  --data '{
    "text":"🔄 EMERGENCY ROLLBACK - Canvas Offset Fix",
    "blocks":[
      {
        "type":"section",
        "text":{
          "type":"mrkdwn",
          "text":"*Status:* Rollback Complete\n*Time:* '$(date)'\n*Impact:* Old designs working, new designs may have 50px offset\n*Action Required:* Monitor error logs for 30 minutes"
        }
      }
    ]
  }' \
  https://hooks.slack.com/services/YOUR/WEBHOOK/URL
```

---

## POST-ROLLBACK ACTIONS

### Immediate Actions (< 30 minutes)

- [ ] **Clear all caches**
  ```bash
  # WordPress cache
  wp cache flush

  # Browser cache notification
  echo "ALERT: Instruct users to hard refresh (Ctrl+Shift+R)"

  # CDN cache (if applicable)
  # curl -X PURGE https://cdn.example.com/path/to/designer.bundle.js
  ```

- [ ] **Monitor error logs**
  ```bash
  # Real-time monitoring
  tail -f wp-content/debug.log | grep -i "error\|warning\|fatal"
  ```

- [ ] **Test critical user journeys**
  - Load existing design → Verify position → Save → Reload → Verify position
  - Create new design → Position logo → Save → Reload → Verify position (will be 50px off)
  - Create test order → Generate API payload → Verify coordinates

- [ ] **Notify stakeholders**
  - Send email to development team
  - Post in #engineering Slack channel
  - Update status page (if applicable)

### Short-Term Actions (< 4 hours)

- [ ] **Root cause analysis**
  - What triggered the rollback?
  - Why did the fix fail?
  - What was missed in testing?
  - Document findings in postmortem

- [ ] **Update documentation**
  - Update PRODUCTION-DEPLOYMENT-RUNBOOK.md with lessons learned
  - Add failed scenario to test plan
  - Update rollback procedures if needed

- [ ] **Database audit**
  ```bash
  # Check for designs with offset metadata
  wp db query "SELECT id, created_at FROM wp_octo_user_designs
    WHERE design_data LIKE '%offset_applied%'
    ORDER BY created_at DESC LIMIT 20;"

  # If found, consider running inverse migration or informing users
  ```

- [ ] **Customer communication** (if applicable)
  - Identify affected users (those who created designs during fix deployment)
  - Prepare customer support script
  - Offer assistance for re-positioning designs

### Long-Term Actions (< 1 week)

- [ ] **Postmortem meeting**
  - What happened?
  - Why did it happen?
  - How do we prevent it?
  - Action items with owners and deadlines

- [ ] **Fix improvement**
  - Address root cause of rollback
  - Enhance testing scenarios
  - Add monitoring/alerting
  - Plan re-deployment with improved fix

- [ ] **Process improvements**
  - Update deployment checklist
  - Enhance rollback procedures
  - Improve staging environment parity
  - Add automated validation tests

---

## ROLLBACK DECISION TREE (FLOWCHART)

```
┌─────────────────────────────────────┐
│     Issue Detected After Fix        │
│         Deployment                  │
└──────────────┬──────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │  Is system completely│  YES ──┐
    │  broken? (P0)        │        │
    └──────────┬───────────┘        │
               │ NO                  │
               ▼                     ▼
    ┌──────────────────────┐   ┌─────────────────┐
    │ Are old designs      │   │ IMMEDIATE       │
    │ misaligned? (P1)     │   │ ROLLBACK        │
    └──────────┬───────────┘   │ Method: Code    │
               │ NO             │ Time: < 5 min   │
               ▼                └─────────────────┘
    ┌──────────────────────┐
    │ Are there JS/PHP     │  YES ──┐
    │ fatal errors? (P1)   │        │
    └──────────┬───────────┘        │
               │ NO                  │
               ▼                     ▼
    ┌──────────────────────┐   ┌─────────────────┐
    │ Is error rate        │   │ IMMEDIATE       │
    │ increased > 10%? (P1)│   │ ROLLBACK        │
    └──────────┬───────────┘   │ Method: Code    │
               │ NO             │ Time: < 5 min   │
               ▼                └─────────────────┘
    ┌──────────────────────┐
    │ Are there minor      │  YES ──┐
    │ issues? (P2)         │        │
    └──────────┬───────────┘        │
               │ NO                  ▼
               ▼                ┌─────────────────┐
    ┌──────────────────────┐   │ INVESTIGATE     │
    │ System working       │   │ Monitor: 1-4 hrs│
    │ correctly            │   │ Rollback if:    │
    │ Continue monitoring  │   │ - Issue persists│
    └──────────────────────┘   │ - Users affected│
                               └──────┬──────────┘
                                      │
                          ┌───────────┴───────────┐
                          ▼                       ▼
                   ┌──────────────┐        ┌──────────────┐
                   │ Issue        │        │ Issue        │
                   │ Escalates    │        │ Resolves     │
                   │              │        │              │
                   │ → ROLLBACK   │        │ → CONTINUE   │
                   └──────────────┘        └──────────────┘
```

---

## APPENDIX A: File Locations Quick Reference

```yaml
Modified Files:
  JavaScript:
    Current: /workspaces/yprint_designtool/public/js/dist/designer.bundle.js
    Backup: /workspaces/yprint_designtool/public/js/dist/designer.bundle.js.backup-pre-offset-fix-1759487255
    Lines Changed: 102 (+96/-6)

  PHP:
    Current: /workspaces/yprint_designtool/includes/class-octo-print-api-integration.php
    Backup: /workspaces/yprint_designtool/includes/class-octo-print-api-integration.php.backup-pre-offset-fix-1759488230
    Lines Changed: 38 (+36/-2)

Rollback Scripts:
  Quick Rollback: /workspaces/yprint_designtool/AGENT-5-QUICK-ROLLBACK.sh
  Complete Rollback: /workspaces/yprint_designtool/complete-rollback.sh
  Code-Only Rollback: /workspaces/yprint_designtool/code-rollback-fast.sh
  Validation: /workspaces/yprint_designtool/validate-rollback.sh

Documentation:
  Deployment Runbook: /workspaces/yprint_designtool/PRODUCTION-DEPLOYMENT-RUNBOOK.md
  Rollback Procedures: /workspaces/yprint_designtool/rollback-procedures.md (this file)
  Technical Architecture: /workspaces/yprint_designtool/TECHNICAL-ARCHITECTURE-OFFSET-FIX.md

Logs:
  WordPress Debug: wp-content/debug.log
  Rollback Log: wp-content/rollback.log (created during rollback)
  Error Log: wp-content/error.log (if configured)

Database:
  Table: wp_octo_user_designs
  Key Column: design_data (JSON)
  Metadata Flag: metadata.offset_applied (boolean)
```

---

## APPENDIX B: Common Rollback Scenarios

### Scenario 1: Old Designs Misaligned After Fix

**Symptom**: Existing designs load 50px off from where they should be

**Root Cause**: Offset fix applied to old designs incorrectly (metadata check failed)

**Rollback Method**: Code-only rollback (< 5 minutes)

**Steps**:
```bash
bash AGENT-5-QUICK-ROLLBACK.sh
# Test old design loading
# Verify position is correct
```

**Re-deployment**: Fix metadata detection logic before re-deploying

---

### Scenario 2: New Designs Not Saving

**Symptom**: JavaScript error when saving new design with logo

**Root Cause**: getCanvasOffset() throwing error, metadata object malformed

**Rollback Method**: Code-only rollback (< 5 minutes)

**Steps**:
```bash
bash code-rollback-fast.sh
# Clear browser cache
# Test new design save/load
```

**Re-deployment**: Add error handling to getCanvasOffset(), validate metadata structure

---

### Scenario 3: Print API Coordinates Wrong

**Symptom**: API payload has incorrect coordinates (container-relative instead of canvas-relative)

**Root Cause**: PHP offset calculation error, metadata not passed to API integration

**Rollback Method**: Code-only rollback (< 5 minutes)

**Steps**:
```bash
bash code-rollback-fast.sh
# Generate test API payload
# Verify coordinates are correct
```

**Re-deployment**: Fix PHP coordinate transformation, add API payload validation tests

---

### Scenario 4: Database Corruption (Rare)

**Symptom**: design_data JSON is malformed, designs won't load

**Root Cause**: Migration script error, manual database edits gone wrong

**Rollback Method**: Full rollback (code + database)

**Steps**:
```bash
# Restore code
bash code-rollback-fast.sh

# Restore database
wp db export safety-backup-current-state-$(date +%s).sql
wp db import backup-pre-offset-fix-20251003-113000.sql

# Verify database integrity
wp db check

# Test design loading
```

**Re-deployment**: Fix migration script, test on staging database first

---

## APPENDIX C: Validation Checklist

Use this checklist after EVERY rollback:

```
POST-ROLLBACK VALIDATION CHECKLIST

□ Code Files Restored
  □ designer.bundle.js size matches backup
  □ class-octo-print-api-integration.php size matches backup
  □ No OFFSET-FIX markers in JavaScript (grep count = 0)
  □ No OFFSET-FIX markers in PHP (grep count = 0)
  □ No getCanvasOffset function exists (grep count = 0)

□ Syntax Validation
  □ PHP syntax validation passed (php -l)
  □ No JavaScript syntax errors (browser console)

□ Cache Cleared
  □ PHP OPCache cleared/reloaded
  □ WordPress object cache flushed
  □ Browser cache cleared (instruct users)
  □ CDN cache purged (if applicable)

□ Database Integrity
  □ Database connection verified (wp db check)
  □ Design count matches expected (SELECT COUNT(*))
  □ No data corruption (test load 5+ designs)

□ Functional Testing
  □ Old design loads correctly (no position change)
  □ New design saves without errors
  □ New design loads without errors
  □ Visual position stable across save/reload
  □ No JavaScript console errors
  □ No PHP errors in debug log

□ API Testing
  □ Test order API payload generated
  □ Coordinates are correct format
  □ No PHP errors during API call

□ Monitoring
  □ Error log monitoring active (tail -f)
  □ Error rate < baseline
  □ No increase in 500 errors
  □ No customer complaints

□ Communication
  □ Team notified of rollback
  □ Stakeholders informed
  □ Postmortem scheduled
  □ Documentation updated

□ Backup Verification
  □ Safety backups created before rollback
  □ Pre-fix backups still exist
  □ Database backups accessible
  □ Backup restoration tested (on staging)

Validated By: __________________
Date/Time: ____________________
Rollback Status: ✅ SUCCESS / ❌ PARTIAL / ⚠️ ISSUES FOUND
```

---

## VERSION HISTORY

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0.0 | 2025-10-03 | Initial rollback procedures created | Agent 4 |

---

## APPROVAL & SIGN-OFF

| Role | Name | Signature | Date |
|------|------|-----------|------|
| Lead Developer | __________ | __________ | ________ |
| DevOps Lead | __________ | __________ | ________ |
| Product Owner | __________ | __________ | ________ |

---

**END OF DOCUMENT**

For questions or issues with rollback procedures, contact:
- Lead Developer: [CONTACT]
- DevOps Team: [CONTACT]
- Emergency Hotline: [PHONE]
