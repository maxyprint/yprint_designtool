# Canvas Offset Migration - Quick Start Guide

## 🚀 TL;DR - Execute Migration in 5 Minutes

```bash
# 1. Backup database (CRITICAL!)
mysqldump -u user -p database > backup_$(date +%Y%m%d).sql

# 2. Preview changes
php migration-offset-fix.php --dry-run --verbose

# 3. Execute migration
php migration-offset-fix.php --execute --backup

# 4. Verify results (check log output)

# 5. If issues: Rollback
php migration-offset-fix.php --rollback --execute
```

## 📋 What This Fixes

| Problem | Before | After |
|---------|--------|-------|
| Desktop designs | Objects +50px offset | Correct position |
| Mobile designs | Already correct (0px) | No change |
| Breakpoint designs | Objects +26px offset | Correct position |

## 🎯 Quick Commands

### Preview (Safe)
```bash
php migration-offset-fix.php --dry-run
```

### Execute (Production)
```bash
php migration-offset-fix.php --execute --backup
```

### Rollback
```bash
php migration-offset-fix.php --rollback --execute
```

### WP-CLI
```bash
wp canvas-offset migrate --dry-run --verbose
wp canvas-offset migrate --execute --backup
wp canvas-offset rollback --execute
```

## ⚠️ Safety Checklist

- [ ] Database backup created
- [ ] Tested on staging environment
- [ ] Reviewed dry-run output
- [ ] Scheduled during low-traffic period
- [ ] Have rollback plan ready
- [ ] Backup column enabled (default)

## 📊 Expected Results

**Typical Output:**
```
📊 Total Scanned:      127 designs
🔍 Corrupted Found:    95 designs (75% Desktop, 10% Breakpoint)
✅ Migrated Success:   95 designs
✓  Already Correct:    12 designs (Mobile users)
❌ Errors:             0 designs
```

## 🔄 Workflow

```
Backup → Dry-Run → Review → Execute → Validate → (Rollback if issues) → Success!
  ↓         ↓         ↓        ↓         ↓              ↓                  ↓
 1min     10sec     2min     30sec     5min          30sec              Done
```

## 🆘 Emergency Rollback

```bash
# If something goes wrong:
php migration-offset-fix.php --rollback --execute

# Or restore from backup:
mysql -u user -p database < backup_20251003.sql
```

## 📈 Performance

| Designs | Time | Memory |
|---------|------|--------|
| 100     | ~10s | 32MB   |
| 500     | ~1m  | 64MB   |
| 1000    | ~2m  | 128MB  |

## 🔍 Validation

```sql
-- Check migration status
SELECT
  COUNT(*) as total,
  SUM(CASE WHEN design_data LIKE '%offset_migration_applied%' THEN 1 ELSE 0 END) as migrated
FROM wp_octo_user_designs;
```

## 📝 Common Options

| Option | Purpose |
|--------|---------|
| `--dry-run` | Preview only (default) |
| `--execute` | Actually migrate |
| `--verbose` | Detailed output |
| `--backup` | Create backup (default) |
| `--no-backup` | Skip backup (risky) |
| `--rollback` | Restore from backup |

## 🎓 Learn More

See [MIGRATION-OFFSET-FIX-README.md](./MIGRATION-OFFSET-FIX-README.md) for:
- Detailed documentation
- Troubleshooting guide
- Advanced usage
- Security considerations
- FAQ

---

**Remember**: Always backup before migration!
