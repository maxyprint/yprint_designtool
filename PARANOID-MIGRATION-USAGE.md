# Paranoid Migration Script - SSOT v2.0

**The Most Paranoid Migration Script Possible**

Agent 3 of 7 - Single Source of Truth Redesign Implementation

---

## 🛡️ Three Critical Safety Rules

### 1. **Erkennen statt Raten** (Recognize, Don't Guess)
- **ONLY** corrects KNOWN offset values: `50.0px`, `26.1px`, `0.0px`
- **SKIPS** unknown offsets with warning (manual review required)
- Floating point tolerance: ±0.5px for safe comparison

### 2. **Einmal ist genug** (Once is Enough)
- **100% IDEMPOTENT** - Can run 100 times safely
- Detects already-migrated designs using 4 strategies:
  - SSOT v2.0 coordinate system marker (`coordinate_system: 'fabric_native'`)
  - Version marker (`version: '2.0'`)
  - Migration timestamp (`migrated_at`)
  - Zero offset + offset_applied flag
- **NEVER** double-applies offset corrections

### 3. **Trockenübung mit echten Daten** (Dry-Run with Real Data)
- `--dry-run` mode simulates without saving
- Shows exactly what **WOULD** happen
- Zero risk preview before production

---

## 📋 Quick Start

### Step 1: Always Start with Dry-Run!

```bash
# Basic dry-run (recommended first step)
php paranoid-migration-ssot.php --dry-run

# Verbose dry-run (shows details for each design)
php paranoid-migration-ssot.php --dry-run --verbose
```

### Step 2: Review Results

Check the output for:
- ✅ How many designs will be migrated
- ⚠️ Any unknown offsets (manual review needed)
- ❌ Any errors or issues

### Step 3: Execute Migration (Only After Dry-Run Review)

```bash
# Execute with backup (RECOMMENDED)
php paranoid-migration-ssot.php --execute --backup

# Execute without backup (faster, but risky)
php paranoid-migration-ssot.php --execute --no-backup
```

---

## 🔧 Usage Examples

### CLI Usage

```bash
# DRY-RUN EXAMPLES
php paranoid-migration-ssot.php --dry-run
php paranoid-migration-ssot.php --dry-run --verbose

# EXECUTE EXAMPLES
php paranoid-migration-ssot.php --execute
php paranoid-migration-ssot.php --execute --backup
php paranoid-migration-ssot.php --execute --no-backup --verbose

# ROLLBACK EXAMPLES
php paranoid-migration-ssot.php --rollback --dry-run
php paranoid-migration-ssot.php --rollback --execute
```

### WP-CLI Usage

```bash
# DRY-RUN
wp ssot migrate --dry-run
wp ssot migrate --dry-run --verbose

# EXECUTE
wp ssot migrate --execute --backup
wp ssot migrate --execute

# ROLLBACK
wp ssot rollback --dry-run
wp ssot rollback --execute
```

---

## 📊 What the Script Does

### Migration Process

1. **Scans** all designs in `wp_octo_user_designs` table
2. **Validates** design data structure (JSON, objects array)
3. **Checks** if already migrated (4 detection strategies)
4. **Identifies** offset values and validates against KNOWN_OFFSETS
5. **Corrects** object coordinates by subtracting offset
6. **Updates** metadata:
   ```json
   {
     "offset_x": 0,
     "offset_y": 0,
     "coordinate_system": "fabric_native",
     "version": "2.0",
     "migrated_at": "2025-10-03 14:30:00",
     "original_offset_x": 50.0,
     "original_offset_y": 50.0
   }
   ```
7. **Creates** backup (if `--backup` enabled)

### What Gets Skipped (Safely)

- ✅ Already migrated designs (idempotent check)
- ✅ Designs with offset 0,0 (already correct)
- ⚠️ Unknown offset values (manual review required)
- ⚠️ Invalid JSON or missing objects array

---

## 🔍 Safety Features

### Known Offset Detection

```php
KNOWN_OFFSETS = [50.0, 26.1, 0.0]
TOLERANCE = ±0.5px

if (abs($offset_x - 50.0) <= 0.5) {
    // ✅ Known offset - will correct
} else {
    // ⚠️ Unknown offset - will skip and warn
}
```

### Idempotent Checks (4 Strategies)

```php
// Strategy 1: Coordinate system marker
if ($metadata['coordinate_system'] === 'fabric_native') return true;

// Strategy 2: Version marker
if ($metadata['version'] === '2.0') return true;

// Strategy 3: Migration timestamp
if (isset($metadata['migrated_at'])) return true;

// Strategy 4: Zero offset + applied flag
if ($metadata['offset_applied'] === true &&
    $metadata['offset_x'] == 0 &&
    $metadata['offset_y'] == 0) return true;
```

### Backup Column

- Column name: `design_data_backup_ssot`
- Stores original JSON before migration
- Created automatically if missing
- Used by rollback script

---

## 📈 Output Interpretation

### Dry-Run Output Example

```
═══════════════════════════════════════════════════════════════════════════
  PARANOID MIGRATION SCRIPT - Single Source of Truth v2.0
═══════════════════════════════════════════════════════════════════════════

🛡️  SAFETY RULES:
  1. Erkennen statt Raten    - Only fix KNOWN offsets (50px, 26.1px)
  2. Einmal ist genug        - Idempotent (can run 100x safely)
  3. Trockenübung            - Dry-run mode simulates without saving

⚙️  CONFIGURATION:
  Mode:       🔍 DRY-RUN
  Backup:     ENABLED
  Verbose:    ENABLED
  Table:      wp_octo_user_designs

───────────────────────────────────────────────────────────────────────────

ℹ️  Found 150 design(s) to scan

[1/150] DRY-RUN: Would migrate Design #5374 (offset: 50.0, 50.0) - 12 objects
[2/150] Design #5375: Already migrated (SSOT v2.0), skipping
[3/150] Design #5376: Unknown offset (35.7, 35.7) - SKIPPED

...

📊 STATISTICS:
───────────────────────────────────────────────────────────────────────────
Total scanned:           150 designs
Already migrated:        85 designs (skipped safely)
Needs migration:         50 designs
Migrated successfully:   50 designs
Unknown offsets (skip):  10 designs
Errors:                  5 designs

⚠️  WARNINGS:
───────────────────────────────────────────────────────────────────────────
  Design #5376: Unknown offset (35.7, 35.7) - SKIPPED for manual review
  Design #5400: Unknown offset (12.3, 12.3) - SKIPPED for manual review

🔍 DRY-RUN COMPLETE - No data was modified
   Run with --execute to perform actual migration
```

### Statistics Breakdown

| Metric | Meaning |
|--------|---------|
| **Total scanned** | All designs found in database |
| **Already migrated** | Designs that passed idempotent checks (safe to skip) |
| **Needs migration** | Designs with known offsets that need correction |
| **Migrated successfully** | Designs actually migrated (or would migrate in dry-run) |
| **Unknown offsets** | Designs skipped due to unrecognized offset values |
| **Errors** | Designs with JSON errors or other issues |

---

## 🔄 Rollback Process

### When to Rollback

- Migration caused unexpected issues
- Need to revert to previous state
- Testing different migration strategies

### How to Rollback

```bash
# 1. DRY-RUN first (see what would be restored)
php paranoid-migration-ssot.php --rollback --dry-run --verbose

# 2. Execute rollback (ONLY if backup exists)
php paranoid-migration-ssot.php --rollback --execute
```

### Rollback Requirements

- ✅ Backup column `design_data_backup_ssot` must exist
- ✅ Designs must have backup data
- ⚠️ Rollback **OVERWRITES** current data (cannot undo!)

---

## 🚨 Troubleshooting

### Unknown Offsets Warning

```
⚠️ Design #123: Unknown offset (35.7, 35.7) - SKIPPED for manual review
```

**What it means:** Design has offset values not in KNOWN_OFFSETS list.

**How to handle:**
1. Investigate design #123 manually
2. Determine if offset is legitimate or corruption
3. If legitimate unknown offset:
   - Add to KNOWN_OFFSETS constant
   - Re-run migration
4. If data corruption:
   - Fix manually or develop separate migration

### Already Migrated (Multiple Runs)

```
Design #456: Already migrated (SSOT v2.0), skipping
```

**What it means:** Design was migrated in previous run.

**Why it's safe:** Idempotent checks prevent double-migration.

### Insufficient Disk Space

```
❌ ERROR: Insufficient disk space!
```

**Solution:**
1. Free up disk space
2. Run without backup (risky): `--no-backup`
3. Migrate in smaller batches

### Invalid JSON

```
Design #789: Invalid JSON data
```

**What it means:** Corrupted design_data field.

**How to fix:**
1. Investigate design #789 in database
2. Validate JSON structure
3. Fix or exclude from migration

---

## 🔐 Security & Safety

### Pre-Migration Checklist

- [ ] Run dry-run first (`--dry-run`)
- [ ] Review warnings and errors
- [ ] Ensure sufficient disk space
- [ ] Enable backup (`--backup`)
- [ ] Test on staging environment
- [ ] Create database backup externally

### Post-Migration Verification

```bash
# Verify migration results
wp ssot migrate --dry-run --verbose

# Check for remaining issues
# Should show: "Already migrated: X designs"
```

### Emergency Rollback

```bash
# If something goes wrong:
php paranoid-migration-ssot.php --rollback --execute

# Or via WP-CLI:
wp ssot rollback --execute
```

---

## 📝 Technical Details

### KNOWN_OFFSETS Explanation

| Offset | Cause | Viewport |
|--------|-------|----------|
| `50.0px` | Container padding bug | Desktop >950px |
| `26.1px` | CSS breakpoint edge case | Exactly 950px |
| `0.0px` | Already correct | Mobile <950px |

### Migration Metadata Added

```json
{
  "offset_x": 0,
  "offset_y": 0,
  "coordinate_system": "fabric_native",
  "version": "2.0",
  "migrated_at": "2025-10-03 14:30:00",
  "original_offset_x": 50.0,
  "original_offset_y": 50.0
}
```

### Database Schema Changes

```sql
ALTER TABLE wp_octo_user_designs
ADD COLUMN design_data_backup_ssot LONGTEXT NULL
COMMENT 'SSOT v2.0 migration backup'
AFTER design_data;
```

---

## 📚 Related Documentation

- [AGENT-4-EXECUTIVE-SUMMARY-DE.md](AGENT-4-EXECUTIVE-SUMMARY-DE.md) - German executive summary
- [AGENT-6-ARCHITECTURE-COMPARISON-DE.md](AGENT-6-ARCHITECTURE-COMPARISON-DE.md) - Architecture analysis
- [Canvas Offset Bug Analysis](AGENT-1-EVENT-HANDLER-BUG-ANALYSIS.json) - Original bug report

---

## 🆘 Support

### Common Issues

1. **"Must specify --dry-run or --execute"**
   - Solution: Always specify mode explicitly

2. **"Table does not exist"**
   - Solution: Verify table name in wp-config.php
   - Check table prefix

3. **"Cannot find WordPress installation"**
   - Solution: Run from WordPress root directory
   - Or use WP-CLI

### Getting Help

```bash
# Show script header (no execution)
php paranoid-migration-ssot.php

# Contact
# - Check migration logs
# - Review dry-run output
# - Consult Agent 3 documentation
```

---

## ✅ Success Criteria

Migration is successful when:

- ✅ All known offsets (50.0, 26.1) are corrected to 0
- ✅ Unknown offsets are flagged for review
- ✅ Zero errors in migration log
- ✅ Success rate > 95%
- ✅ Designs render correctly after migration
- ✅ Idempotent: Re-running shows "already migrated"

---

**Version:** 2.0.0
**Last Updated:** 2025-10-03
**Author:** Agent 3 of 7
