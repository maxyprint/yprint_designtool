# 🚀 Paranoid Migration - Quick Start Guide

**SSOT v2.0 Migration Script**

---

## ⚡ 3-Step Migration Process

### Step 1️⃣: Dry-Run (ALWAYS START HERE!)

```bash
php paranoid-migration-ssot.php --dry-run --verbose
```

**What it does:**
- ✅ Simulates migration WITHOUT modifying data
- ✅ Shows exactly what WILL happen
- ✅ Identifies unknown offsets
- ✅ Reports statistics

### Step 2️⃣: Review Output

**Check for:**
- ✅ Expected migration count
- ⚠️ Unknown offset warnings
- ❌ Errors or issues

### Step 3️⃣: Execute (After Review)

```bash
php paranoid-migration-ssot.php --execute --backup
```

**What it does:**
- ✅ Corrects object coordinates
- ✅ Sets offset to 0
- ✅ Marks as SSOT v2.0
- ✅ Creates backup

---

## 🛡️ Safety Rules

| Rule | German | English | What it Means |
|------|--------|---------|---------------|
| 1️⃣ | Erkennen statt Raten | Recognize, Don't Guess | Only fix KNOWN offsets (50px, 26.1px) |
| 2️⃣ | Einmal ist genug | Once is Enough | Idempotent - can run 100x safely |
| 3️⃣ | Trockenübung | Dry-Run First | Simulate before executing |

---

## 📋 Command Cheat Sheet

### CLI Commands

```bash
# DRY-RUN (safe preview)
php paranoid-migration-ssot.php --dry-run
php paranoid-migration-ssot.php --dry-run --verbose

# EXECUTE (real migration)
php paranoid-migration-ssot.php --execute --backup
php paranoid-migration-ssot.php --execute --no-backup

# ROLLBACK (restore from backup)
php paranoid-migration-ssot.php --rollback --dry-run
php paranoid-migration-ssot.php --rollback --execute
```

### WP-CLI Commands

```bash
# DRY-RUN
wp ssot migrate --dry-run
wp ssot migrate --dry-run --verbose

# EXECUTE
wp ssot migrate --execute --backup

# ROLLBACK
wp ssot rollback --dry-run
wp ssot rollback --execute
```

---

## 📊 What Gets Migrated?

### ✅ Will Migrate (Known Offsets)

- **50.0px** - Desktop corruption (>950px viewport)
- **26.1px** - Breakpoint corruption (950px viewport)
- **50.3px** - Within tolerance (±0.5px of 50.0)

### ⏭️ Will Skip (Safe)

- **0.0px** - Already correct
- **Already migrated** - Has SSOT v2.0 markers
- **No objects** - Old design format

### ⚠️ Will Skip (Manual Review Needed)

- **Unknown offsets** - Example: 35.7px, 12.3px
- **Invalid JSON** - Corrupted data

---

## 🔍 Output Interpretation

### Good Output (Ready to Execute)

```
📊 STATISTICS:
Total scanned:           150 designs
Already migrated:        0 designs
Needs migration:         120 designs
Migrated successfully:   120 designs
Unknown offsets:         0 designs  ← Perfect!
Errors:                  0 designs  ← Perfect!

📈 Success Rate: 100%
```

### Needs Attention Output

```
📊 STATISTICS:
Total scanned:           150 designs
Needs migration:         100 designs
Unknown offsets:         20 designs  ← Review these!
Errors:                  5 designs   ← Fix these!

⚠️  WARNINGS:
  Design #123: Unknown offset (35.7, 35.7) - SKIPPED
```

**Action:** Review unknown offsets and errors before executing

---

## 🔄 Rollback (Emergency)

### When to Rollback
- Migration caused issues
- Designs not rendering
- Need to try different approach

### How to Rollback

```bash
# 1. Preview rollback
php paranoid-migration-ssot.php --rollback --dry-run

# 2. Execute rollback (CAREFUL!)
php paranoid-migration-ssot.php --rollback --execute
```

⚠️ **Warning:** Rollback OVERWRITES current data (cannot undo!)

---

## ✅ Verification Checklist

### After Migration

- [ ] Run dry-run again (should show "already migrated")
- [ ] Check frontend design rendering
- [ ] Verify offset_x = 0, offset_y = 0 in database
- [ ] Confirm coordinate_system = 'fabric_native'
- [ ] Test API payload generation

### Success Indicators

```bash
# Second dry-run should show:
Already migrated:        120 designs (skipped safely)
Needs migration:         0 designs
```

---

## 🚨 Troubleshooting

### "Must specify --dry-run or --execute"
```bash
# ❌ Wrong
php paranoid-migration-ssot.php

# ✅ Correct
php paranoid-migration-ssot.php --dry-run
```

### "Unknown offset (X, Y) - SKIPPED"
**Solution:**
1. Review design in database
2. Determine if legitimate offset or corruption
3. Add to KNOWN_OFFSETS if needed
4. Or fix manually

### "Insufficient disk space"
**Solutions:**
- Free up space
- Use `--no-backup` (risky)
- Migrate in batches

---

## 📁 File Locations

| File | Location |
|------|----------|
| **Main Script** | `/workspaces/yprint_designtool/paranoid-migration-ssot.php` |
| **Full Documentation** | `/workspaces/yprint_designtool/PARANOID-MIGRATION-USAGE.md` |
| **Test Suite** | `/workspaces/yprint_designtool/test-paranoid-migration.php` |
| **Report** | `/workspaces/yprint_designtool/AGENT-3-PARANOID-MIGRATION-REPORT.md` |
| **Quick Start** | `/workspaces/yprint_designtool/MIGRATION-QUICK-START.md` |

---

## 🎯 Production Workflow

### Pre-Migration

1. [ ] Create external database backup
2. [ ] Run dry-run: `--dry-run --verbose`
3. [ ] Review statistics and warnings
4. [ ] Identify unknown offsets
5. [ ] Fix errors (invalid JSON)

### Migration

1. [ ] Confirm dry-run results look good
2. [ ] Execute: `--execute --backup`
3. [ ] Monitor output for errors
4. [ ] Verify success rate > 95%

### Post-Migration

1. [ ] Run dry-run again (verify idempotent)
2. [ ] Test frontend rendering
3. [ ] Check API payloads
4. [ ] Keep backup for 7 days

---

## 💡 Pro Tips

### Tip 1: Always Dry-Run First
```bash
# NEVER skip this step!
php paranoid-migration-ssot.php --dry-run --verbose
```

### Tip 2: Check Idempotency
```bash
# Run dry-run AFTER migration
# Should show: "Already migrated: X designs"
wp ssot migrate --dry-run
```

### Tip 3: Keep Backup
```bash
# Always use --backup (default)
php paranoid-migration-ssot.php --execute --backup
```

### Tip 4: Verbose for Debugging
```bash
# Shows details for each design
php paranoid-migration-ssot.php --dry-run --verbose
```

---

## 📞 Quick Support

### Test Migration Logic
```bash
php test-paranoid-migration.php
```

### Check Files Exist
```bash
ls -la paranoid-migration-ssot.php
ls -la PARANOID-MIGRATION-USAGE.md
```

### View Documentation
```bash
cat PARANOID-MIGRATION-USAGE.md | less
```

---

## 🏁 Summary

**3 Rules, 3 Steps, Zero Risk**

1️⃣ **Dry-Run** → Review → Execute
2️⃣ **Only known offsets** (50px, 26.1px)
3️⃣ **Idempotent** (run 100x safely)

**Files:**
- Main: `paranoid-migration-ssot.php`
- Docs: `PARANOID-MIGRATION-USAGE.md`
- Test: `test-paranoid-migration.php`

**Status:** ✅ Production Ready

---

*Quick Start Guide - Agent 3 of 7*
*Version 2.0.0 - 2025-10-03*
