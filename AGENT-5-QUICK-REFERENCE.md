# Agent 5: Verification Suite - Quick Reference

## Canvas Offset Bug Fix - Testing Commands Cheat Sheet

**Version**: 1.0.0 | **Date**: 2025-10-03 | **Architecture**: A (MINIMAL FIX)

---

## Quick Command Reference

### Pre-Deployment

```bash
# Analyze design types before deployment
wp offset-verify pre-migration

# Detailed analysis with export
wp offset-verify pre-migration --verbose --export=pre-deploy.json
```

### Post-Deployment

```bash
# Verify today's new designs
wp offset-verify post-migration

# Verify since deployment date (strict mode)
wp offset-verify post-migration --since=2025-10-01 --strict
```

### Monitoring

```bash
# Monitor last 24 hours
wp offset-verify monitor

# Continuous monitoring (5-min intervals)
wp offset-verify monitor --watch

# With Slack alerts
wp offset-verify monitor --alert-webhook=YOUR_WEBHOOK_URL
```

### Testing

```bash
# Full integration test
wp offset-verify integration-test --cleanup

# Sample visual audit
wp offset-verify sample-audit --sample-size=10
```

---

## Expected Results After Fix

### New Designs (Created After Fix Deployment)

```json
{
  "objects": [...],
  "metadata": {
    "offset_applied": true,
    "offset_x": 0,        // ← Should ALWAYS be 0
    "offset_y": 0,        // ← Should ALWAYS be 0
    "capture_version": "2.1"
  }
}
```

**Why 0?**: After CSS fix, `.designer-canvas-container` has NO padding, so `getCanvasOffset()` returns `{x: 0, y: 0}`.

### Old Designs (Created Before Fix)

```json
{
  "objects": [...],
  // NO offset_applied metadata
}
```

**Backward Compatible**: Old designs work as-is, no migration needed.

---

## Success Indicators

### Pre-Migration

- ✅ Command runs without errors
- ✅ Shows count of Type A designs (50px offset)
- ✅ Export file created (if --export used)

### Post-Migration

- ✅ All 3 tests PASS
- ✅ No anomalies detected
- ✅ All new designs: `offset_x = 0, offset_y = 0`

### Monitoring

- ✅ Zero offset count = Total designs
- ✅ No alerts triggered

### Integration Test

- ✅ 4/4 tests PASS
- ✅ API conversion validated

---

## Failure Indicators

### Red Flags

- ❌ Non-zero offsets in new designs
- ❌ > 10% anomaly rate
- ❌ Integration test < 3/4 pass
- ❌ Database connection errors

### Yellow Flags

- ⚠️ 1-2 designs with anomalies
- ⚠️ Old designs have offset metadata (may be intentional migration)
- ⚠️ Unknown design types > 5%

---

## Database Queries

### Manual Verification

```sql
-- Count new designs with offset metadata
SELECT COUNT(*) FROM wp_octo_user_designs
WHERE design_data LIKE '%offset_applied%';

-- Check latest design metadata
SELECT id, JSON_EXTRACT(design_data, '$.metadata.offset_x') as offset_x,
       JSON_EXTRACT(design_data, '$.metadata.offset_y') as offset_y,
       created_at
FROM wp_octo_user_designs
ORDER BY created_at DESC
LIMIT 10;

-- Find designs with non-zero offsets (should be ZERO after fix)
SELECT id, design_data, created_at
FROM wp_octo_user_designs
WHERE design_data LIKE '%"offset_x":%'
  AND design_data NOT LIKE '%"offset_x":0%'
  AND created_at > '2025-10-01';
```

---

## Debugging

### Check PHP Logs

```bash
# Enable debug mode (wp-config.php)
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);

# View offset-related logs
tail -f wp-content/debug.log | grep "OFFSET-FIX"
```

### Check JavaScript Console

```javascript
// In browser console, after saving a design
// Should see:
🔧 OFFSET-FIX: Applied canvas offset (0, 0)px to coordinates

// NOT:
🔧 OFFSET-FIX: Applied canvas offset (50, 50)px to coordinates
```

### Verify CSS Fix

```bash
# Check that CSS padding is removed
grep -r "designer-canvas-container" public/css/

# Should NOT contain:
# padding-top: 50px;
# padding-left: 50px;
```

---

## Cron Job Setup

### Daily Monitoring

Add to crontab (`crontab -e`):

```bash
# Daily monitoring at 9 AM
0 9 * * * cd /var/www/html && wp offset-verify monitor --hours=24 >> /var/log/offset-monitor.log 2>&1

# Weekly audit at 10 AM Monday
0 10 * * 1 cd /var/www/html && wp offset-verify post-migration --since=$(date -d "7 days ago" +%Y-%m-%d) >> /var/log/offset-audit.log 2>&1
```

---

## File Locations

| File | Purpose |
|------|---------|
| `/workspaces/yprint_designtool/verification-suite.php` | Main verification script |
| `/workspaces/yprint_designtool/AGENT-5-VERIFICATION-SUITE-DOCUMENTATION.md` | Full documentation |
| `/workspaces/yprint_designtool/AGENT-5-QUICK-REFERENCE.md` | This cheat sheet |

---

## Design Type Classification

| Type | Offset X | Offset Y | When Created | Action Needed |
|------|----------|----------|--------------|---------------|
| **Type A** | 50px | 50px | Pre-fix (desktop) | Will be migrated |
| **Type B** | 26.1px | 26.1px | Legacy (mobile) | Legacy, rare |
| **Type C** | 0px | 0px | Post-fix | Correct |
| **Unknown** | Various | Various | Corrupted? | Investigate |

---

## Troubleshooting Quick Fixes

### "Table doesn't exist"
```bash
wp db query "SHOW TABLES LIKE '%octo%';"
```

### "No designs found"
```bash
wp db query "SELECT COUNT(*) FROM wp_octo_user_designs;"
```

### "Permission denied"
```bash
sudo chmod 755 verification-suite.php
```

### "Memory limit exceeded"
```bash
wp offset-verify pre-migration --php-memory-limit=512M
```

---

## Contact

**Agent**: 5 of 7 - Verification & Testing
**Architecture**: A (MINIMAL FIX)
**Documentation**: Full docs in `AGENT-5-VERIFICATION-SUITE-DOCUMENTATION.md`

---

## Key Takeaway

After fix deployment:
- **NEW designs** → `offset_x = 0, offset_y = 0` (CSS padding removed)
- **OLD designs** → No metadata (backward compatible)
- **Monitoring** → Should show 100% zero-offset rate for new designs
