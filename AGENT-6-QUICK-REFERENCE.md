# Agent 6 Quick Reference: Dry-Run Validation

**Agent 6 of 7 - SSOT Migration Validation**

---

## 🚀 Quick Start (3 Commands)

```bash
# 1. Upload to staging server
scp dry-run-validation.sh migration-offset-fix.php user@staging:/var/www/html/

# 2. SSH and set environment
ssh user@staging
cd /var/www/html && export WP_ENV="staging"

# 3. Run validation
chmod +x dry-run-validation.sh && ./dry-run-validation.sh
```

---

## 📦 Deliverables

| File | Lines | Purpose |
|------|-------|---------|
| `dry-run-validation.sh` | 620 | Automated 7-step validation pipeline |
| `migration-offset-fix.php` | 898 | Production migration script (Agent 3) |
| `test-migration-script.php` | 371 | Unit test suite (Agent 3) |
| `AGENT-6-DRY-RUN-VALIDATION-DELIVERABLE.md` | 630 | Complete documentation |
| `AGENT-6-QUICK-REFERENCE.md` | - | This file |

---

## ✅ Validation Pipeline (7 Steps)

1. **Environment Check** - Verify staging/dev, check WordPress access
2. **Pre-Migration Analysis** - Analyze offset distribution
3. **Execute Migration (Dry-Run)** - Run with --dry-run --verbose
4. **Database Integrity** - Verify checksum unchanged
5. **Sample Designs** - Extract test samples
6. **Idempotency Test** - Run 3x, verify consistent results
7. **Generate Report** - Create validation report + recommendation

---

## 🚦 Traffic Light System

### ✅ GREEN LIGHT
- **Meaning:** All checks passed, proceed to staging execution
- **Action:** Run manual QA on sample designs, then execute migration

### 🟡 YELLOW LIGHT
- **Meaning:** Warnings detected, review before proceeding
- **Action:** Check `dry-run-output.txt`, assess risk, consult team

### 🔴 RED LIGHT
- **Meaning:** Errors detected, DO NOT proceed
- **Action:** Fix errors in migration script, re-run validation

---

## 📋 Manual QA Checklist (After Validation)

For each sample design:
- [ ] Open in browser (use provided URL)
- [ ] Verify logo position correct
- [ ] Save without changes
- [ ] Reload page
- [ ] Verify position unchanged
- [ ] Check console for errors
- [ ] Test zoom in/out
- [ ] Test responsive (mobile/desktop)

---

## 🔧 Migration Commands

```bash
# Dry-run with verbose output
php migration-offset-fix.php --dry-run --verbose

# Execute migration with backup
php migration-offset-fix.php --execute --backup

# Rollback to backup (emergency)
php migration-offset-fix.php --rollback --execute
```

---

## ⚠️ Safety Features

| Feature | Protection |
|---------|------------|
| Environment check | Prevents production execution |
| Database checksum | Verifies dry-run is non-destructive |
| Idempotency test | Ensures safe re-runs |
| Backup creation | Enables emergency rollback |
| Migration flag | Prevents double-migration |

---

## 🐛 Common Issues

### "wp-load.php not found"
**Fix:** Run from WordPress root directory

### "Database checksum differs"
**Fix:** Migration script has bugs, DO NOT proceed

### "Idempotency failed"
**Fix:** Check migration logic for randomness/timestamps

### "No sample designs found"
**Fix:** Clone production database to staging first

---

## 📊 Expected Output

```
🔍 SSOT DRY-RUN VALIDATION PIPELINE
====================================

STEP 1: ENVIRONMENT CHECK
✅ Environment: staging (safe for testing)
✅ Migration script found
✅ WordPress installation found
✅ Found 2,000 designs in database

STEP 2: PRE-MIGRATION ANALYSIS
Offset distribution:
  0px (correct):     1,247
  26.1px (Type B):     523
  50px (Type A):       230
✅ Designs needing migration: 753

STEP 3: EXECUTING MIGRATION (DRY-RUN MODE)
✅ No errors or warnings detected

STEP 4: VERIFYING DATABASE UNCHANGED
✅ Database unchanged (dry-run is safe)

STEP 5: SAMPLE DESIGN VALIDATION
  Type A (50px): Design #4523
  Type B (26.1px): Design #3891
  Correct (0px): Design #5012

STEP 6: TESTING IDEMPOTENCY (Running 3x)
✅ Idempotency verified: All 3 runs show same count (753)

STEP 7: GENERATING VALIDATION REPORT
✅ GREEN LIGHT: Safe to proceed to staging execution
```

---

## 🎯 Success Criteria

### Validation Success
- ✅ All 7 steps complete
- ✅ Database checksum unchanged
- ✅ Idempotency verified
- ✅ GREEN/YELLOW light

### Manual QA Success
- ✅ Sample designs render correctly
- ✅ Save/reload preserves positions
- ✅ No console errors

### Production Readiness
- ✅ Dry-run validation passed
- ✅ Manual QA passed
- ✅ Staging execution successful
- ✅ Database backup created
- ✅ Rollback tested

---

## 📞 Escalation Path

| Issue | Escalation |
|-------|------------|
| RED light validation | Fix migration script, re-validate |
| Manual QA failures | Investigate offset calculation logic |
| Staging execution errors | Review error logs, consult Agent 3 deliverables |
| Production rollback needed | Use rollback command immediately |

---

## 🔄 Workflow Summary

```
Development (Agent 6)
   ↓
   └─> dry-run-validation.sh created ✅

Staging Server
   ↓
   ├─> Upload validation script
   ├─> Clone production database
   ├─> Run dry-run-validation.sh
   ├─> GREEN/YELLOW/RED?
   │   ├─> GREEN → Manual QA
   │   ├─> YELLOW → Review warnings → Manual QA
   │   └─> RED → FIX → Re-validate
   │
   ├─> Manual QA passed?
   │   ├─> YES → Execute migration (--execute)
   │   └─> NO → Investigate → Fix → Re-validate
   │
   ├─> Staging migration successful?
   │   ├─> YES → Proceed to production
   │   └─> NO → Rollback → Debug

Production Server
   ↓
   ├─> Create database backup
   ├─> Upload migration script
   ├─> Run migration-offset-fix.php --execute --backup
   ├─> Monitor execution
   ├─> Verify random sample designs
   │
   └─> Success?
       ├─> YES → Monitor for 24h → DONE ✅
       └─> NO → Rollback immediately
```

---

## 📈 Performance Estimates

| Designs | Validation Time | Migration Time |
|---------|----------------|----------------|
| 100 | ~1 min | ~5 sec |
| 1,000 | ~2 min | ~30 sec |
| 10,000 | ~5 min | ~5 min |
| 100,000 | ~15 min | ~45 min |

---

## 📝 Output Files

After running validation:

- **`dry-run-validation-report.txt`** - Full validation report
- **`dry-run-output.txt`** - Migration script output
- **`/tmp/pre-migration-count.txt`** - Design count cache
- **`/tmp/sample-design-ids.txt`** - Sample design IDs

---

## 🎓 Key Concepts

### Single Source of Truth (SSOT)
- Before: Coordinates stored as `canvas_coords + offset`
- After: Coordinates stored as `canvas_coords only` (offset = 0)
- Benefit: No viewport-dependent offset bugs

### Corruption Types
- **Type A (50px):** Desktop viewport (>950px)
- **Type B (26.1px):** Breakpoint (950px exactly)
- **Type C (0px):** Mobile viewport (<950px) - already correct

### Idempotency
- Migration can be run multiple times safely
- Already-migrated designs are skipped
- Prevents double-correction

---

## ⏱️ Timeline Estimate

| Phase | Duration | Dependencies |
|-------|----------|--------------|
| Upload to staging | 5 min | SSH access |
| Run validation | 5-15 min | Production clone |
| Manual QA | 30 min | Sample designs |
| Staging execution | 10-60 min | Database size |
| Production backup | 15 min | Backup tools |
| Production execution | 10-60 min | Database size |
| Post-migration verify | 2 hours | QA team |

**Total: ~4-6 hours for complete deployment**

---

## 🚨 Emergency Contacts

If issues arise during production deployment:

1. **First Response:** Run rollback immediately
2. **Review Logs:** Check `dry-run-output.txt` for clues
3. **Consult Documentation:** `AGENT-6-DRY-RUN-VALIDATION-DELIVERABLE.md`
4. **Agent 3 Deliverables:** `AGENT-3-MIGRATION-SCRIPT-DELIVERABLE.md`

---

**Agent 6 Mission: COMPLETE ✅**

Ready for Agent 7 (Production Deployment)
