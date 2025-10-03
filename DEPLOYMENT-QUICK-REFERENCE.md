# Canvas Offset Bug Fix - Quick Reference Card

**Version**: 2.0
**Architecture**: Architecture A (Minimal Fix)
**Last Updated**: 2025-10-03

---

## Current Status

| Phase | Status | Date | Next Action |
|-------|--------|------|-------------|
| Phase 1 | COMPLETED | 2025-10-03 | Monitor new designs |
| Phase 2 | PENDING | TBD | Develop migration script |
| Phase 3 | PENDING | TBD | Run migration |
| Phase 4 | PENDING | TBD | 30-day monitoring |

---

## Phase-by-Phase Quick Commands

### PHASE 1: Code Fix (COMPLETED)

Status: Bug stopped spreading

```bash
# Verify Phase 1 deployed
grep "containerElement = canvasElement.parentNode" \
  /workspaces/yprint_designtool/public/js/dist/designer.bundle.js
# Expected: Found on line 931 ✓
```

---

### PHASE 2: Migration Development (Day 1-3)

**Goal**: Create and test migration script

**Day 1: Create Scripts (4-6 hours)**

```bash
# Already created at /workspaces/yprint_designtool/DEPLOYMENT-RUNBOOK.md
# Copy migration script code from runbook sections:
# - migration-offset-correction.php
# - rollback-offset-migration.php

# Validate syntax
php -l migration-offset-correction.php
php -l rollback-offset-migration.php

# Test dry run
wp eval-file migration-offset-correction.php --dry-run=1
```

**Day 2: Staging Test (4-6 hours)**

```bash
# Clone production DB
wp db export production-$(date +%Y%m%d).sql

# Import to staging
scp production-*.sql staging:/tmp/
ssh staging "cd /var/staging && wp db import /tmp/production-*.sql"

# Run migration on staging
ssh staging "cd /var/staging && wp eval-file migration-offset-correction.php --dry-run=0"

# Verify success
ssh staging "wp option get canvas_offset_migration_stats --format=json | jq '.'"
```

**Day 3: Visual Regression (2-4 hours)**

```bash
# Manual testing:
# 1. Load 5 designs before migration → screenshot
# 2. Run migration
# 3. Load same 5 designs after migration → screenshot
# 4. Compare: should be IDENTICAL

# Expected: 0 visual differences
```

---

### PHASE 3: Production Migration (Day 4-7)

**Goal**: Fix corrupted designs in production

**Day 4: Pre-Flight (1-2 hours)**

```bash
# Checklist
[ ] Phase 1 verified working
[ ] Staging migration 100% successful
[ ] Migration scripts validated
[ ] Disk space sufficient (5GB+)
[ ] Team ready and on standby

# Verify no new corruptions since Phase 1
wp eval "
  \$designs = get_posts([
    'post_type' => 'design',
    'date_query' => [['after' => '7 days ago']],
    'posts_per_page' => 10
  ]);
  foreach (\$designs as \$d) {
    \$data = get_post_meta(\$d->ID, 'design_data', true);
    if (isset(\$data['metadata']['offset_x'])) {
      echo \$d->ID . ': offset_x=' . \$data['metadata']['offset_x'] . PHP_EOL;
    }
  }
"
# Expected: All show offset_x=0
```

**Day 5: MIGRATION DAY (1-2 hours)**

**CRITICAL: Run during LOW-TRAFFIC hours (e.g., 2AM-4AM)**

```bash
# Step 1: Database Backup
cd /var/www/html
wp db export backup-pre-migration-$(date +%Y%m%d-%H%M%S).sql

# Step 2: Verify backup
ls -lh backup-pre-migration-*.sql
# Expected: File size > 0 bytes

# Step 3: Upload migration scripts
scp migration-offset-correction.php production:/var/www/html/
scp rollback-offset-migration.php production:/var/www/html/

# Step 4: Dry run (safety check)
wp eval-file migration-offset-correction.php --dry-run=1 > migration-dry-run.log
cat migration-dry-run.log
# Expected: 0 errors

# Step 5: Execute migration
wp eval "
  define('MIGRATION_BACKUP_CONFIRMED', true);
  include 'migration-offset-correction.php';
" | tee migration-production.log

# Step 6: Verify success
cat migration-production.log | grep "Success Rate"
# Expected: Success Rate: 100%

# Step 7: Check migration stats
wp option get canvas_offset_migration_stats --format=json | jq '.'
# Expected:
# {
#   "migrated": 88,
#   "errors": 0,
#   ...
# }
```

**Day 6-7: Post-Migration Validation (2-4 hours)**

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
  }
"
# Expected: SUCCESS: All NEW designs have offset_x ≈ 0

# Manual testing:
# [ ] Load 5 OLD designs - verify unchanged
# [ ] Load 5 migrated designs (Type A) - verify unchanged
# [ ] Load 5 migrated designs (Type B) - verify unchanged
# [ ] Create 3 new designs - verify offset_x = 0
# [ ] Create 3 WooCommerce orders - verify API correct
```

---

### PHASE 4: Monitoring (Day 8-30)

**Week 2 (Day 8-14): Daily Monitoring**

```bash
# Every day at 9AM:

# Check new designs created in last 24h
wp eval "
  \$designs = get_posts([
    'post_type' => 'design',
    'date_query' => [['after' => '24 hours ago']],
    'posts_per_page' => -1
  ]);
  echo 'New designs in last 24h: ' . count(\$designs) . PHP_EOL;
  foreach (\$designs as \$d) {
    \$data = get_post_meta(\$d->ID, 'design_data', true);
    if (isset(\$data['metadata']['offset_x'])) {
      \$offset_x = floatval(\$data['metadata']['offset_x'] ?? 0);
      echo 'ID: ' . \$d->ID . ' | offset_x: ' . \$offset_x . PHP_EOL;
      if (abs(\$offset_x) > 0.1) {
        echo '⚠️  WARNING: Non-zero offset detected!' . PHP_EOL;
      }
    }
  }
"
# Expected: All have offset_x ≈ 0

# Check error logs
tail -100 /var/www/html/wp-content/debug.log | grep "OFFSET-FIX"
# Expected: No ERROR messages
```

**Week 3-4 (Day 15-30): Weekly Monitoring**

```bash
# Every Monday:

# Weekly summary
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
```

**Day 30: Final Assessment**

```bash
# 30-day report
echo "30-DAY POST-MIGRATION REPORT"
echo ""

# Migration stats
wp option get canvas_offset_migration_stats --format=json | jq '.'

# New designs since migration
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
  echo 'New Designs (Day 0-30):' . PHP_EOL;
  echo '  Total: ' . \$total . PHP_EOL;
  echo '  Corrupted: ' . \$corrupted . PHP_EOL;
  echo '  Success Rate: ' . ((\$total - \$corrupted) / \$total * 100) . '%' . PHP_EOL;
"
# Expected: Success Rate: 100%

# Final decision
# IF success rate = 100% AND support tickets = 0:
echo "✓ MIGRATION SUCCESSFUL"
echo "✓ Rollback window CLOSED"
echo "✓ Mission COMPLETE"
```

---

## Emergency Rollback

**TRIGGER ROLLBACK IF:**
- Migration errors > 5%
- Visual regressions detected
- API integration failures
- User complaints > 3 within 24h
- Database corruption detected

**ROLLBACK PROCEDURE:**

```bash
# Method 1: Rollback script (RECOMMENDED)
cd /var/www/html
wp eval-file rollback-offset-migration.php --confirm=1

# Expected output:
# Rolled back: 88
# Errors: 0
# ✓ Rollback complete

# Method 2: Database restore (NUCLEAR OPTION)
# ONLY if rollback script fails
wp db import backup-pre-migration-*.sql

# Verify rollback
wp option get canvas_offset_migration_stats
# Expected: (empty) or "No value"
```

**Time**: 5-15 minutes
**Impact**: Designs return to corrupted state (but known and documented)

**After rollback:**
1. Notify team
2. Document reason
3. Schedule post-mortem
4. Fix issues
5. Re-test on staging
6. Reschedule deployment

---

## Success Metrics

| Metric | Target | Check Command |
|--------|--------|---------------|
| Migration success | 100% | `wp option get canvas_offset_migration_stats` |
| New designs correct | 100% | Daily check command (see Phase 4) |
| Visual regressions | 0 | Manual screenshot comparison |
| API integration | 100% | WooCommerce order tests |
| User complaints | 0 | Support ticket count |

---

## Key File Locations

| File | Path |
|------|------|
| JavaScript fix | `/public/js/dist/designer.bundle.js` (line 931) |
| PHP fix | `/includes/class-octo-print-api-integration.php` (lines 657-682) |
| Migration script | `/migration-offset-correction.php` (create from runbook) |
| Rollback script | `/rollback-offset-migration.php` (create from runbook) |
| Debug log | `/wp-content/debug.log` |
| Database backups | `/backups/` or S3 |

---

## Common Issues & Solutions

**Issue**: New designs still have offset_x != 0 after Phase 1

**Solution**:
```bash
# Verify Phase 1 deployed
grep "containerElement = canvasElement.parentNode" \
  /var/www/html/wp-content/plugins/octo-print-designer/public/js/dist/designer.bundle.js

# If not found: Phase 1 rollback or deployment failed
# Re-deploy Phase 1

# Clear browser cache (Ctrl+Shift+Del)
```

---

**Issue**: Migration script errors

**Solution**:
```bash
# Check database
wp db check

# Verify WP-CLI
wp --version

# Check PHP error log
tail -50 /var/log/php8.1-fpm/error.log

# Re-run dry run
wp eval-file migration-offset-correction.php --dry-run=1
```

---

**Issue**: Visual regressions after migration

**Solution**:
```bash
# Immediate rollback
wp eval-file rollback-offset-migration.php --confirm=1

# Investigate
# - Check migration log
# - Review screenshots
# - Test affected designs

# Fix and re-test on staging
```

---

## Contact Information

| Role | Name | Contact |
|------|------|---------|
| Deployment Lead | _________ | _________ |
| Backend Dev | _________ | _________ |
| DevOps | _________ | _________ |
| QA Engineer | _________ | _________ |
| Support Lead | _________ | _________ |

**Emergency Slack**: #deployment-emergency
**Emergency Email**: devops@company.com

---

## Next Steps

**Current**: Phase 1 COMPLETED
**Next**: Schedule Phase 2 (Migration Development)

**Action Items**:
1. [ ] Review full deployment runbook (`DEPLOYMENT-RUNBOOK.md`)
2. [ ] Assign roles and responsibilities
3. [ ] Schedule Phase 2 kickoff meeting
4. [ ] Clone production DB to staging
5. [ ] Create migration scripts
6. [ ] Begin Phase 2 development

**Timeline**:
- Phase 2: Day 1-3 (8-16 hours total)
- Phase 3: Day 4-7 (2-4 hours total)
- Phase 4: Day 8-30 (ongoing monitoring)

**Total**: ~30 days from now to mission complete

---

**For detailed procedures, see**: `DEPLOYMENT-RUNBOOK.md`

**Last Updated**: 2025-10-03
**Version**: 2.0
**Status**: Phase 1 Complete / Phases 2-4 Pending
