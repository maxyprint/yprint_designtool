# Phase 3.4: Database Migration Guide

**Version:** 3.0.0
**Status:** ✅ READY FOR DEPLOYMENT
**Date:** 2025-10-02
**Estimated Time:** 8-10 hours (including testing and monitoring)

---

## Overview

This guide covers the database migration process for converting existing design data from **variationImages** and **legacy nested** formats to the new **Golden Standard** format.

### What This Migration Does

- ✅ Converts all `variationImages` format designs → Golden Standard
- ✅ Converts all legacy nested format designs → Golden Standard
- ✅ Creates backup of original data (optional but recommended)
- ✅ Processes in batches to prevent timeouts
- ✅ Provides rollback capability
- ✅ Shows progress bar and statistics

### What This Migration Does NOT Do

- ❌ Does NOT delete backup data (manual cleanup after 30 days)
- ❌ Does NOT modify designs already in Golden Standard format
- ❌ Does NOT affect frontend rendering (normalization layer handles all formats)

---

## Prerequisites

### Before Starting

1. **✅ Complete Phase 3.1-3.3**
   - Frontend Golden Standard implementation deployed
   - Backend validation gate active (log-only mode)
   - Input normalization layer functional

2. **✅ Database Backup**
   ```bash
   # Create full database backup
   wp db export backup-$(date +%Y%m%d-%H%M%S).sql

   # Verify backup file exists and is not empty
   ls -lh backup-*.sql
   ```

3. **✅ Test Environment Available**
   - Staging server with production data copy
   - Or local development environment with sample data

4. **✅ WP-CLI Installed**
   ```bash
   wp --version
   # Should output: WP-CLI 2.x.x or higher
   ```

5. **✅ Check Current Data Status**
   ```bash
   # Count designs by format
   wp db query "SELECT
     COUNT(*) as total,
     SUM(CASE WHEN design_data LIKE '%capture_version%' THEN 1 ELSE 0 END) as golden_standard,
     SUM(CASE WHEN design_data LIKE '%variationImages%' THEN 1 ELSE 0 END) as variation_images,
     SUM(CASE WHEN design_data NOT LIKE '%capture_version%' AND design_data NOT LIKE '%variationImages%' THEN 1 ELSE 0 END) as legacy
   FROM wp_octo_user_designs"
   ```

---

## Migration Steps

### Step 1: Test on Staging (REQUIRED)

**Duration:** 2-3 hours

1. **Copy Production Data to Staging**
   ```bash
   # On production
   wp db export production-backup.sql

   # On staging
   wp db import production-backup.sql
   ```

2. **Run Dry-Run Migration**
   ```bash
   # Preview what will happen (no changes made)
   wp octo-migrate design-data --dry-run --verbose
   ```

3. **Analyze Dry-Run Output**
   - Check format breakdown (how many of each type)
   - Verify no errors reported
   - Confirm expected conversion count

4. **Run Actual Migration on Staging**
   ```bash
   # With backup enabled
   wp octo-migrate design-data --backup --batch-size=50
   ```

5. **Verify Staging Migration**
   ```bash
   # Check all designs now have capture_version
   wp db query "SELECT COUNT(*) FROM wp_octo_user_designs
   WHERE design_data LIKE '%capture_version%'"

   # Should equal total record count
   wp db query "SELECT COUNT(*) FROM wp_octo_user_designs"
   ```

6. **Test Admin Preview**
   - Open several orders in WP Admin
   - Verify designs render correctly
   - Check console for errors

7. **Test Print Provider Integration**
   - Generate print data for test order
   - Verify format is correct
   - Confirm no coordinate issues

### Step 2: Prepare Production

**Duration:** 30 minutes

1. **Schedule Maintenance Window**
   - Recommended: Off-peak hours (e.g., 2-4 AM)
   - Duration: 1-2 hours for migration + monitoring
   - Inform stakeholders

2. **Final Production Backup**
   ```bash
   # Create timestamped backup
   wp db export backup-pre-migration-$(date +%Y%m%d-%H%M%S).sql

   # Compress backup
   gzip backup-pre-migration-*.sql

   # Store in safe location
   mv backup-pre-migration-*.sql.gz /backups/
   ```

3. **Enable Maintenance Mode** (Optional)
   ```bash
   wp maintenance-mode activate
   ```

### Step 3: Production Migration

**Duration:** 15 minutes - 2 hours (depends on data size)

1. **Start Migration with Backup**
   ```bash
   # Recommended settings for production
   wp octo-migrate design-data \
     --backup \
     --batch-size=50 \
     --verbose
   ```

2. **Monitor Progress**
   - Progress bar shows real-time status
   - Watch for error messages
   - Note migration statistics

3. **Expected Output**
   ```
   ═══════════════════════════════════════════════════════════════
     Design Data Migration to Golden Standard Format (v3.0.0)
   ═══════════════════════════════════════════════════════════════

   💾 Creating design_data_backup column...
   ✓ Backup column created successfully
   📊 Found 1,247 record(s) to process
   🔧 Batch size: 50
   🔍 Mode: PRODUCTION
   💾 Backup: ENABLED

   Migrating designs  100% [============================] 0:02:15

   ═══════════════════════════════════════════════════════════════
     Migration Results
   ═══════════════════════════════════════════════════════════════

   📊 Total records:    1,247
   ✅ Migrated:         1,198
   ⏭️  Skipped:           48 (already Golden Standard)
   ❌ Errors:              1

   Format breakdown:
     • variationImages:  856
     • legacy_nested:    342
     • already_golden:    48
     • unknown:            1

   📈 Success rate: 96.1%

   ✓ Migration completed!
   ⚠ 1 record(s) had errors. Check logs for details.
   ```

4. **Handle Errors (if any)**
   ```bash
   # Check WordPress debug log
   tail -100 /var/log/wordpress/debug.log | grep "Migration"

   # Re-run migration for failed records only
   wp octo-migrate design-data --verbose
   ```

### Step 4: Verification

**Duration:** 30 minutes

1. **Database Verification**
   ```bash
   # All records should have capture_version
   wp db query "SELECT COUNT(*) as migrated
   FROM wp_octo_user_designs
   WHERE design_data LIKE '%capture_version%'"

   # Backup column should exist
   wp db query "SHOW COLUMNS FROM wp_octo_user_designs LIKE 'design_data_backup'"

   # Sample random migrated record
   wp db query "SELECT id,
     JSON_EXTRACT(design_data, '$.metadata.capture_version') as version,
     JSON_EXTRACT(design_data, '$.metadata.original_format') as original_format
   FROM wp_octo_user_designs
   WHERE design_data LIKE '%migrated%'
   LIMIT 5"
   ```

2. **Functional Testing**
   - **Test 5-10 Random Orders:**
     - Open order in admin
     - Verify design preview renders
     - Check coordinates look correct
     - Confirm no console errors

   - **Test High-Risk Orders:**
     - Orders that previously had issues (e.g., Order 5378)
     - Complex designs with multiple elements
     - Large images

3. **Print Provider Integration Test**
   ```bash
   # Trigger print data generation for test order
   # Verify API payload structure
   # Confirm print provider accepts data
   ```

4. **Performance Check**
   - Admin preview load time (should be <500ms)
   - No significant slowdown reported
   - Database queries efficient

### Step 5: Monitoring Period

**Duration:** 24-48 hours

**Hour 0-4: Critical Monitoring**
- Check every 15 minutes
- Monitor error logs
- Test random order previews
- Keep rollback plan ready

**Hour 4-24: Active Monitoring**
- Check every hour
- Review error logs
- Verify no user complaints
- Monitor system performance

**Hour 24-48: Passive Monitoring**
- Check every 4 hours
- Weekly review of statistics
- Plan cleanup phase

### Step 6: Disable Maintenance Mode

```bash
wp maintenance-mode deactivate
```

---

## Command Reference

### Main Migration Command

```bash
wp octo-migrate design-data [OPTIONS]
```

**Options:**

| Option | Description | Default | Example |
|--------|-------------|---------|---------|
| `--batch-size=<N>` | Records per batch | 50 | `--batch-size=100` |
| `--dry-run` | Preview without changes | false | `--dry-run` |
| `--verbose` | Show detailed output | false | `--verbose` |
| `--force` | Migrate all records | false | `--force` |
| `--backup` | Create backup column | false | `--backup` |
| `--limit=<N>` | Limit total records | none | `--limit=10` |

**Examples:**

```bash
# 1. Test run (first 10 records)
wp octo-migrate design-data --dry-run --limit=10 --verbose

# 2. Production migration with backup
wp octo-migrate design-data --backup --batch-size=50

# 3. Re-run migration for remaining records
wp octo-migrate design-data

# 4. Force migration of ALL records (including already migrated)
wp octo-migrate design-data --force --backup
```

### Rollback Command

```bash
wp octo-migrate rollback [OPTIONS]
```

**Options:**

| Option | Description | Default | Example |
|--------|-------------|---------|---------|
| `--dry-run` | Preview rollback | false | `--dry-run` |
| `--verbose` | Show detailed output | false | `--verbose` |
| `--limit=<N>` | Limit records to rollback | none | `--limit=10` |

**Examples:**

```bash
# 1. Preview rollback
wp octo-migrate rollback --dry-run --verbose

# 2. Perform rollback (restore from backup)
wp octo-migrate rollback

# 3. Test rollback on first 10 records
wp octo-migrate rollback --limit=10 --verbose
```

---

## Rollback Procedure

If issues are discovered after migration, you can rollback using the backup data.

### Option A: Using WP-CLI Rollback Command

**Duration:** 5-10 minutes

```bash
# 1. Verify backup data exists
wp db query "SELECT COUNT(*) FROM wp_octo_user_designs
WHERE design_data_backup IS NOT NULL"

# 2. Preview rollback
wp octo-migrate rollback --dry-run --verbose

# 3. Perform rollback
wp octo-migrate rollback

# 4. Verify restoration
wp db query "SELECT COUNT(*) FROM wp_octo_user_designs
WHERE design_data LIKE '%variationImages%'"
# Should show original variationImages count
```

### Option B: Manual SQL Rollback

**Duration:** 2-5 minutes

```bash
# 1. Restore from backup column
wp db query "UPDATE wp_octo_user_designs
SET design_data = design_data_backup
WHERE design_data_backup IS NOT NULL"

# 2. Verify restoration
wp db query "SELECT COUNT(*) FROM wp_octo_user_designs
WHERE design_data LIKE '%capture_version%'"
# Should be close to zero (only new designs)
```

### Option C: Full Database Restore

**Duration:** 10-30 minutes

```bash
# 1. Find backup file
ls -lh /backups/backup-pre-migration-*.sql.gz

# 2. Decompress
gunzip /backups/backup-pre-migration-20251002-020000.sql.gz

# 3. Import
wp db import /backups/backup-pre-migration-20251002-020000.sql

# 4. Clear cache
wp cache flush
```

---

## Troubleshooting

### Issue: "Failed to create backup column"

**Cause:** Insufficient database permissions

**Solution:**
```bash
# Grant ALTER permission
# Run as database administrator
GRANT ALTER ON wp_octo_user_designs TO 'wordpress_user'@'localhost';
FLUSH PRIVILEGES;
```

### Issue: "Conversion failed for format unknown"

**Cause:** Unrecognized data format

**Solution:**
1. Extract record for analysis:
   ```bash
   wp db query "SELECT id, design_data FROM wp_octo_user_designs
   WHERE design_data NOT LIKE '%capture_version%'
   AND design_data NOT LIKE '%variationImages%'
   LIMIT 1"
   ```

2. Manually inspect JSON structure
3. Update conversion logic in `class-design-data-migration-command.php`
4. Re-run migration

### Issue: Migration timeout

**Cause:** Too many records in single batch

**Solution:**
```bash
# Reduce batch size
wp octo-migrate design-data --batch-size=25
```

### Issue: "Out of memory"

**Cause:** PHP memory limit too low

**Solution:**
```bash
# Increase PHP memory limit
wp config set WP_MEMORY_LIMIT 512M
wp config set WP_MAX_MEMORY_LIMIT 512M

# Or run with explicit memory limit
php -d memory_limit=512M $(which wp) octo-migrate design-data
```

### Issue: Records not migrating

**Cause:** Already have `capture_version` field

**Solution:**
```bash
# Check if records are already migrated
wp db query "SELECT design_data FROM wp_octo_user_designs
WHERE id = <PROBLEMATIC_ID>"

# Use --force flag to re-migrate
wp octo-migrate design-data --force --limit=10
```

---

## Post-Migration Tasks

### Immediate (Within 24 hours)

- ✅ Verify all critical orders render correctly
- ✅ Monitor error logs for issues
- ✅ Test print provider integration
- ✅ Update validation gate to strict mode (Phase 3.6)

### Short-term (Within 1 week)

- ✅ Review migration statistics
- ✅ Document any edge cases discovered
- ✅ Update team on migration success
- ✅ Plan legacy code cleanup (Phase 3.7)

### Long-term (Within 30 days)

- ✅ Remove backup column (after confirming stability)
  ```bash
  # After 30 days of stable operation
  wp db query "ALTER TABLE wp_octo_user_designs DROP COLUMN design_data_backup"
  ```

- ✅ Remove old format handling code
- ✅ Archive migration documentation

---

## Performance Benchmarks

### Expected Migration Times

| Record Count | Batch Size 25 | Batch Size 50 | Batch Size 100 |
|--------------|---------------|---------------|----------------|
| 100 records  | ~30 seconds   | ~20 seconds   | ~15 seconds    |
| 500 records  | ~2 minutes    | ~1.5 minutes  | ~1 minute      |
| 1,000 records| ~4 minutes    | ~3 minutes    | ~2 minutes     |
| 5,000 records| ~20 minutes   | ~15 minutes   | ~10 minutes    |
| 10,000 records| ~40 minutes  | ~30 minutes   | ~20 minutes    |

**Note:** Times vary based on server performance, database size, and complexity of design data.

---

## Success Criteria

Migration is considered successful when:

- ✅ 95%+ of records migrated successfully
- ✅ All critical orders render correctly in admin
- ✅ No increase in error log entries
- ✅ Print provider integration works
- ✅ No user-reported issues for 48 hours
- ✅ Backup data preserved for rollback capability

---

## Next Steps

After successful migration:

1. **Proceed to Phase 3.5:** Testing & Staging
2. **Proceed to Phase 3.6:** Production Deployment (enable strict validation mode)
3. **Proceed to Phase 3.7:** Legacy Code Cleanup

---

## Support & Resources

- **Migration Command Code:** `includes/cli/class-design-data-migration-command.php`
- **Phase 3 Masterplan:** `PHASE_3_REFACTORING_MASTERPLAN.md`
- **Root Cause Analysis:** `ROOT_CAUSE_PHASE2_ANALYSIS.md`
- **Troubleshooting Guide:** `docs/PHASE_3_TROUBLESHOOTING.md`

---

**Document Version:** 1.0.0
**Last Updated:** 2025-10-02
**Author:** Phase 3 Implementation Team
