# Canvas Offset Bug - Migration Script Documentation

## Overview

This migration script fixes corrupted design coordinates caused by a viewport-dependent offset bug in the canvas rendering system. The bug caused different offset values to be saved depending on the user's viewport size.

## Problem Summary

### Root Cause
- **Bug Location**: `designer.bundle.js:931` - incorrect container selector (`.designer-editor` instead of `.designer-canvas-container`)
- **Impact**: Viewport-dependent offset values were saved with design coordinates

### Corruption Types

| Type | Offset Value | Viewport | Affected Designs |
|------|-------------|----------|------------------|
| **Type A** | 50px, 50px | Desktop (>950px) | ~75-90% of designs |
| **Type B** | 26.1px, 26.1px | Breakpoint (950px) | ~5-15% of designs |
| **Type C** | 0px, 0px | Mobile (<950px) | ~5-10% of designs (already correct) |

### Data Structure

**Corrupted Design (Type A - Desktop):**
```json
{
  "objects": [
    {
      "type": "image",
      "left": 250,  // Should be 200 (includes +50px offset)
      "top": 200    // Should be 150 (includes +50px offset)
    }
  ],
  "metadata": {
    "offset_applied": true,
    "offset_x": 50,  // Wrong - should be 0
    "offset_y": 50,
    "canvas_width": 400,
    "canvas_height": 400
  }
}
```

**Corrected Design:**
```json
{
  "objects": [
    {
      "type": "image",
      "left": 200,  // Corrected: 250 - 50 = 200
      "top": 150    // Corrected: 200 - 50 = 150
    }
  ],
  "metadata": {
    "offset_applied": true,
    "offset_x": 0,  // Corrected
    "offset_y": 0,
    "offset_migration_applied": true,
    "offset_migration_date": "2025-10-03 14:30:00",
    "original_offset_x": 50,  // Preserved for reference
    "original_offset_y": 50
  }
}
```

## Installation

### Prerequisites
- WordPress installation with YPrint Design Tool plugin
- PHP 7.4+ or PHP 8.0+
- WP-CLI (optional, for command-line usage)
- Database backup (strongly recommended)

### Setup

1. **Upload script to WordPress root:**
   ```bash
   cp migration-offset-fix.php /path/to/wordpress/
   ```

2. **Verify database connection:**
   ```bash
   php migration-offset-fix.php --dry-run
   ```

## Usage

### Method 1: Standalone PHP Script

#### Dry Run (Preview Changes)
```bash
# Basic dry run
php migration-offset-fix.php --dry-run

# Dry run with verbose output
php migration-offset-fix.php --dry-run --verbose

# Preview specific batch size
php migration-offset-fix.php --dry-run --verbose --batch-size=100
```

#### Execute Migration
```bash
# Execute with backup (recommended)
php migration-offset-fix.php --execute --backup

# Execute without backup (faster but risky)
php migration-offset-fix.php --execute --no-backup

# Execute with verbose logging
php migration-offset-fix.php --execute --backup --verbose
```

#### Rollback
```bash
# Preview rollback
php migration-offset-fix.php --rollback --dry-run --verbose

# Execute rollback
php migration-offset-fix.php --rollback --execute
```

### Method 2: WP-CLI Commands

#### Dry Run
```bash
# Preview changes
wp canvas-offset migrate --dry-run --verbose

# Check specific designs
wp canvas-offset migrate --dry-run --batch-size=10 --verbose
```

#### Execute Migration
```bash
# Full migration with backup
wp canvas-offset migrate --execute --backup

# Migration without backup (not recommended)
wp canvas-offset migrate --execute --no-backup
```

#### Rollback
```bash
# Preview rollback
wp canvas-offset rollback --dry-run --verbose

# Execute rollback
wp canvas-offset rollback --execute
```

## Command Options

### Migration Options

| Option | Description | Default |
|--------|-------------|---------|
| `--dry-run` | Preview changes without writing to database | `true` |
| `--execute` | Execute migration and write changes | `false` |
| `--verbose` | Show detailed output for each design | `false` |
| `--backup` | Create backup column before migration | `true` |
| `--no-backup` | Skip backup creation (not recommended) | `false` |
| `--batch-size=<N>` | Number of records per batch | `50` |

### Rollback Options

| Option | Description |
|--------|-------------|
| `--rollback` | Switch to rollback mode |
| `--dry-run` | Preview rollback |
| `--execute` | Execute rollback |
| `--verbose` | Detailed output |

## Expected Output

### Dry Run Example

```
======================================================================
  CANVAS OFFSET BUG - DATABASE MIGRATION SCRIPT
  Agent 3 of 7 - Architecture A (MINIMAL FIX)
======================================================================

MODE: DRY RUN
BACKUP: ENABLED
VERBOSE: ENABLED

ℹ️  Table wp_octo_user_designs exists
ℹ️  Disk space: Required ~15.3MB, Available 2048.5MB
ℹ️  Found 127 design(s) to analyze
----------------------------------------------------------------------

[1/127] ID 5374: CORRUPTED - Type Desktop (50px) (offset: 50.0,50.0) - 3 objects
  Object img_123: left 250 -> 200
  Object img_123: top 200 -> 150
  ✓ ID 5374: Migration successful

[2/127] ID 5375: Already correct (offset 0,0), skipping
[3/127] ID 5376: No offset metadata (OLD design format), skipping
[4/127] ID 5377: CORRUPTED - Type Breakpoint (26px) (offset: 26.1,26.1) - 2 objects
  ...

----------------------------------------------------------------------
MIGRATION RESULTS
----------------------------------------------------------------------

📊 Total Scanned:      127 designs
🔍 Corrupted Found:    95 designs
✅ Migrated Success:   95 designs
✓  Already Correct:    12 designs
❌ Errors:             0 designs

📈 Corruption Type Breakdown:
   • Type A (50px Desktop):      85
   • Type B (26px Breakpoint):   8
   • Type C (0px Mobile - OK):   12
   • Other offset values:        2

📏 Unique Offset Values Found:
   • (50,50): 85 design(s)
   • (26.1,26.1): 8 design(s)
   • (0,0): 12 design(s)
   • (35.5,35.5): 2 design(s)

📈 Success Rate: 100.0%

⚠️  DRY RUN MODE - No changes were made to the database
ℹ️  Run with --execute to perform actual migration
```

### Production Run Example

```
======================================================================
  CANVAS OFFSET BUG - DATABASE MIGRATION SCRIPT
  Agent 3 of 7 - Architecture A (MINIMAL FIX)
======================================================================

MODE: PRODUCTION
BACKUP: ENABLED
VERBOSE: DISABLED

ℹ️  Backup column already exists
ℹ️  Found 127 design(s) to analyze

Proceed with migration? [y/N]: y

⚠️  PRODUCTION MODE - Changes will be written to database!

[Processing designs...]

----------------------------------------------------------------------
MIGRATION RESULTS
----------------------------------------------------------------------

📊 Total Scanned:      127 designs
🔍 Corrupted Found:    95 designs
✅ Migrated Success:   95 designs
✓  Already Correct:    12 designs
❌ Errors:             0 designs

📈 Success Rate: 100.0%

✅ Migration completed!
ℹ️  Backup saved to column: design_data_backup_offset_fix
ℹ️  To rollback: Use the rollback script or restore from backup
```

## Safety Features

### 1. Dry Run Mode
- **Default behavior**: Always runs in dry-run mode unless `--execute` is specified
- **Safe testing**: Preview exactly what will be changed before committing
- **Verbose output**: See detailed changes for each design

### 2. Automatic Backup
- **Backup column**: `design_data_backup_offset_fix`
- **Preserves original**: Stores original `design_data` before any changes
- **Rollback capability**: Can restore to pre-migration state

### 3. Migration Tracking
- **Migration flag**: `offset_migration_applied = true` prevents duplicate migrations
- **Migration date**: `offset_migration_date` timestamp for audit trail
- **Original values**: `original_offset_x/y` preserved for debugging

### 4. Error Handling
- **JSON validation**: Skips invalid design data
- **Database errors**: Tracks and reports failures
- **Disk space check**: Validates sufficient space before migration
- **Atomic operations**: Each design migrated individually

### 5. Rollback Protection
- **Quick rollback**: Restore original data from backup column
- **Selective rollback**: Can rollback specific designs if needed
- **Dry-run rollback**: Preview rollback before executing

## Migration Workflow

### Recommended Process

```bash
# Step 1: Create full database backup
mysqldump -u user -p database > backup_pre_migration.sql

# Step 2: Dry run to analyze impact
php migration-offset-fix.php --dry-run --verbose > migration_preview.log

# Step 3: Review the preview
cat migration_preview.log

# Step 4: Execute migration with backup
php migration-offset-fix.php --execute --backup --verbose > migration_results.log

# Step 5: Validate results
cat migration_results.log

# Step 6: Spot check 5-10 designs manually
# - Open designs in browser
# - Verify coordinates are correct
# - Check objects are positioned properly

# Step 7: If issues found, rollback
php migration-offset-fix.php --rollback --execute

# Step 8: If successful, keep backup for 30 days then remove
# ALTER TABLE wp_octo_user_designs DROP COLUMN design_data_backup_offset_fix;
```

### Validation Steps

1. **Visual Inspection**
   - Open 5-10 migrated designs in designer
   - Verify object positions are correct
   - Compare with screenshots if available

2. **API Integration Test**
   - Send test order to print API
   - Verify coordinates are correct in API payload
   - Compare with pre-migration orders

3. **Coordinate Validation**
   - Check that all `offset_x` and `offset_y` are now 0
   - Verify `offset_migration_applied = true` is set
   - Confirm objects have corrected coordinates

## Database Schema Changes

### New Columns Added

```sql
-- Backup column (if --backup enabled)
ALTER TABLE wp_octo_user_designs
ADD COLUMN design_data_backup_offset_fix LONGTEXT NULL
AFTER design_data;
```

### Metadata Changes

**Before Migration:**
```json
"metadata": {
  "offset_applied": true,
  "offset_x": 50,
  "offset_y": 50
}
```

**After Migration:**
```json
"metadata": {
  "offset_applied": true,
  "offset_x": 0,
  "offset_y": 0,
  "offset_migration_applied": true,
  "offset_migration_date": "2025-10-03 14:30:00",
  "original_offset_x": 50,
  "original_offset_y": 50
}
```

## Troubleshooting

### Issue: "Table does not exist"

**Cause**: Database table name mismatch

**Solution**:
```php
// Check actual table name
global $wpdb;
$tables = $wpdb->get_results("SHOW TABLES LIKE '%octo%'");
print_r($tables);

// Update script if needed (line 104)
$this->config['table_name'] = $wpdb->prefix . 'YOUR_ACTUAL_TABLE_NAME';
```

### Issue: "Insufficient disk space"

**Cause**: Not enough space for backup column

**Solutions**:
1. Free up disk space
2. Run without backup (risky): `--no-backup`
3. Manually backup database externally

### Issue: "Migration shows 0 corrupted designs"

**Possible causes**:
1. All designs already migrated (check for `offset_migration_applied = true`)
2. No designs with `offset_applied = true` (all are OLD designs)
3. Database table is empty

**Debug**:
```sql
-- Check for NEW designs
SELECT COUNT(*) FROM wp_octo_user_designs
WHERE design_data LIKE '%offset_applied%';

-- Check for already migrated
SELECT COUNT(*) FROM wp_octo_user_designs
WHERE design_data LIKE '%offset_migration_applied%';
```

### Issue: "Objects appear in wrong position after migration"

**Cause**: Rare edge cases or custom modifications

**Solution**:
1. Rollback immediately: `php migration-offset-fix.php --rollback --execute`
2. Inspect specific design data manually
3. Report issue with design ID for investigation

### Issue: "WP-CLI command not found"

**Cause**: WP-CLI not installed or script not in WordPress root

**Solutions**:
1. Install WP-CLI: https://wp-cli.org/#installing
2. Use standalone PHP method instead
3. Move script to WordPress root directory

## Performance Considerations

### Batch Processing
- **Default batch size**: 50 designs
- **Memory efficient**: Processes in chunks to prevent memory exhaustion
- **Cache clearing**: Automatic WordPress cache flush between batches

### Optimization Tips

```bash
# For large databases (1000+ designs)
php migration-offset-fix.php --execute --batch-size=100 --no-backup

# For small databases (<100 designs)
php migration-offset-fix.php --execute --batch-size=10 --verbose --backup
```

### Expected Performance

| Design Count | Estimated Time | Memory Usage |
|--------------|----------------|--------------|
| 100 designs  | ~5-10 seconds  | 32MB        |
| 500 designs  | ~30-60 seconds | 64MB        |
| 1000 designs | ~1-2 minutes   | 128MB       |
| 5000 designs | ~5-10 minutes  | 256MB       |

## Security Considerations

### Access Control
- Script requires WordPress environment (prevents unauthorized access)
- WP-CLI commands require WordPress admin privileges
- File should be removed after migration completion

### Data Integrity
- All database operations use prepared statements
- JSON validation before processing
- Atomic updates (one design at a time)
- Backup preservation for 30+ days

### Best Practices

```bash
# 1. Always backup first
mysqldump -u user -p database > backup.sql

# 2. Test on staging environment
wp canvas-offset migrate --dry-run --verbose

# 3. Execute during low-traffic period
# Schedule for 2-4 AM when minimal users are active

# 4. Monitor during execution
tail -f migration_results.log

# 5. Validate results
# Manual spot checks + automated tests

# 6. Clean up after success
rm migration-offset-fix.php  # Remove script
# Keep backup column for 30 days, then:
# ALTER TABLE wp_octo_user_designs DROP COLUMN design_data_backup_offset_fix;
```

## Advanced Usage

### Custom Offset Detection

If you have custom offset values to detect:

```php
// Edit classify_corruption() method (line 334)
private function classify_corruption($offset_x, $offset_y) {
    // Add custom offset values
    if (abs($offset_x - 75) < 0.1) {
        return 'type_custom_75px';
    }

    // ... existing code ...
}
```

### Selective Migration

To migrate only specific designs:

```php
// Edit get_designs_to_migrate() method (line 269)
private function get_designs_to_migrate() {
    $query = $this->wpdb->prepare(
        "SELECT id, design_data FROM {$this->config['table_name']}
         WHERE design_data IS NOT NULL
         AND id IN (5374, 5375, 5376)  -- Specific IDs
         ORDER BY id ASC"
    );

    return $this->wpdb->get_results($query, ARRAY_A);
}
```

### Export Migration Report

```bash
# Generate detailed CSV report
php migration-offset-fix.php --dry-run --verbose > report.txt

# Parse into CSV
grep "ID.*CORRUPTED" report.txt | \
  sed 's/.*ID \([0-9]*\).*Type \([^(]*\).*/\1,\2/' > migration_report.csv
```

## Support & Maintenance

### Log Files

Migration creates detailed logs:
- `migration_preview.log` - Dry run results
- `migration_results.log` - Actual migration results
- WordPress debug.log - Error details (if WP_DEBUG enabled)

### Monitoring

```sql
-- Check migration progress
SELECT
  COUNT(*) as total,
  SUM(CASE WHEN design_data LIKE '%offset_migration_applied%' THEN 1 ELSE 0 END) as migrated,
  SUM(CASE WHEN design_data LIKE '%offset_applied%'
           AND design_data NOT LIKE '%offset_migration_applied%' THEN 1 ELSE 0 END) as pending
FROM wp_octo_user_designs;
```

### Cleanup

After successful migration (30+ days):

```sql
-- Remove backup column (frees disk space)
ALTER TABLE wp_octo_user_designs
DROP COLUMN design_data_backup_offset_fix;

-- Remove migration metadata (optional)
-- Note: This requires updating each design's JSON
```

## FAQ

**Q: What if I run the migration twice?**
A: The script detects already-migrated designs (`offset_migration_applied = true`) and skips them automatically.

**Q: Can I rollback after removing the backup column?**
A: No. Keep the backup column for at least 30 days or until you're 100% confident the migration succeeded.

**Q: Will this affect OLD designs (without offset_applied flag)?**
A: No. OLD designs are automatically skipped. Only NEW designs with `offset_applied = true` are processed.

**Q: What happens to designs created AFTER the 1-line CSS fix?**
A: They already have `offset_x = 0` and are classified as "Already Correct". The migration skips them.

**Q: Can I migrate specific designs only?**
A: Yes, modify the `get_designs_to_migrate()` method to add a WHERE clause with specific IDs.

**Q: How do I verify migration success?**
A:
1. Check migration logs for 100% success rate
2. Manually open 5-10 designs in browser
3. Run API integration tests
4. Compare object positions with pre-migration screenshots

**Q: What if the script times out on large databases?**
A:
1. Increase PHP execution time: `php -d max_execution_time=600 migration-offset-fix.php`
2. Use smaller batch sizes: `--batch-size=10`
3. Process in multiple runs with WHERE clause filtering

## Contact & Support

For issues or questions:
- Review this documentation thoroughly
- Check WordPress debug logs
- Examine migration output logs
- Test on staging environment first
- Report bugs with design ID examples

---

**Script Version**: 1.0.0
**Last Updated**: 2025-10-03
**Compatibility**: WordPress 5.0+, PHP 7.4+
**Author**: Agent 3 - Architecture A (MINIMAL FIX)
