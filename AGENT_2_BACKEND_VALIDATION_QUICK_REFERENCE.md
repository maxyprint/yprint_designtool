# Agent 2: Backend Validation Gate - Quick Reference

## Implementation Summary

**Status:** COMPLETED ✅
**Date:** 2025-10-02
**Phase:** A (Log-Only Mode)
**File Modified:** `/workspaces/yprint_designtool/includes/class-octo-print-designer-wc-integration.php`

---

## Functions Added

### 1. `validate_design_data_schema($data)`
**Location:** Lines 2542-2567
**Visibility:** `private`
**Purpose:** Validates design data against Golden Standard schema

**Returns:**
- `true` if valid
- `WP_Error` object with error code if invalid

**Validation Rules:**
```php
Rule 1: Must have 'objects' array           → Error: 'missing_objects'
Rule 2: Must have 'metadata.capture_version' → Error: 'missing_capture_version'
Rule 3: No nested 'transform' objects       → Error: 'nested_transform'
Rule 4: No forbidden keys                   → Error: 'forbidden_format'
        (variationImages, templateId, currentVariation)
```

### 2. `increment_validation_stat($result)`
**Location:** Lines 2575-2592
**Visibility:** `private`
**Purpose:** Tracks validation statistics

**Tracks:**
- Total validations
- Passed validations
- Failed validations
- Last update timestamp

**Storage:** WordPress options table (`design_validation_stats`)

---

## Integration Point

### Modified Function: `save_design_data_to_order()`
**Location:** Lines 2617-2654
**Behavior:** Phase A (Log-Only Mode)

**Flow:**
1. Check kill switch (`DISABLE_DESIGN_VALIDATION`)
2. Validate design data
3. Log results (pass or fail)
4. Track statistics
5. **ALWAYS save data** (log-only mode)

---

## Kill Switch (Emergency Rollback)

Add to `wp-config.php`:
```php
define('DISABLE_DESIGN_VALIDATION', true);
```

**Effect:** Completely bypasses validation, returns to pre-Phase 3 behavior

---

## Monitoring

### View Statistics (WordPress Admin or WP-CLI)
```php
<?php
$stats = get_option('design_validation_stats');
echo "Total: " . $stats['total'] . "\n";
echo "Passed: " . $stats['passed'] . "\n";
echo "Failed: " . $stats['failed'] . "\n";
echo "Success Rate: " . round(($stats['passed'] / $stats['total']) * 100, 1) . "%\n";
?>
```

### View Logs
```bash
# Check error logs for validation messages
tail -f /var/log/wordpress/debug.log | grep "VALIDATION"

# Look for these patterns:
# ✅ [VALIDATION] Passed
# ⚠️ [VALIDATION LOG-ONLY] Failed
```

---

## Golden Standard Format (Accepted)

```json
{
  "objects": [
    {
      "type": "image",
      "id": "img_123",
      "left": 330.18,
      "top": 160.50,
      "scaleX": 0.096,
      "scaleY": 0.096,
      "angle": 0,
      "width": 1924,
      "height": 1075
    }
  ],
  "metadata": {
    "capture_version": "3.0.0",
    "source": "frontend_designer",
    "template_id": "3657"
  }
}
```

---

## Legacy Format (Rejected)

```json
{
  "variationImages": { ... },       // ❌ Forbidden key
  "templateId": "3657",             // ❌ Forbidden key
  "currentVariation": "167359",     // ❌ Forbidden key
  "objects": [
    {
      "transform": {                 // ❌ Nested transform
        "x": 330.18,
        "y": 160.50
      }
    }
  ]
}
```

---

## Testing

### Test File Location
`/workspaces/yprint_designtool/test-phase3-validator-standalone.php`

### Run Tests
```bash
php test-phase3-validator-standalone.php
```

### Expected Result
```
Total Tests: 8
Passed: 8
Failed: 0
Success Rate: 100%
🎉 ALL TESTS PASSED!
```

---

## Backup & Rollback

### Backup File Location
`/workspaces/yprint_designtool/includes/class-octo-print-designer-wc-integration.php.backup-phase3`

### Restore from Backup
```bash
cp /workspaces/yprint_designtool/includes/class-octo-print-designer-wc-integration.php.backup-phase3 \
   /workspaces/yprint_designtool/includes/class-octo-print-designer-wc-integration.php
```

---

## Next Steps

### Phase B: Analysis Mode (24-48 hours)
1. Monitor error logs
2. Analyze validation statistics
3. Investigate failure patterns
4. Verify no false positives
5. Decision: proceed to Phase C or fix issues

### Phase C: Strict Mode (After Phase B)
1. Update `save_design_data_to_order()` to block invalid saves
2. Return error to user for invalid designs
3. Monitor for blocking issues
4. Keep kill switch ready

---

## Error Codes Reference

| Error Code | Meaning | Fix Required |
|-----------|---------|-------------|
| `missing_objects` | No 'objects' array in data | Add objects array |
| `missing_capture_version` | No 'metadata.capture_version' | Add capture_version |
| `nested_transform` | Elements have nested transform | Flatten coordinates |
| `forbidden_format` | Contains legacy keys | Remove legacy keys |

---

## Contact & Dependencies

**Agent 2 Status:** COMPLETED ✅
**Unblocked Agents:**
- Agent 3 (Downstream Fixes)
- Agent 4 (Migration) - after Agent 3

**Related Files:**
- Master Plan: `/workspaces/yprint_designtool/PHASE_3_REFACTORING_MASTERPLAN.md`
- Agent Status: `/workspaces/yprint_designtool/deploy/agent-status.json`

---

**Last Updated:** 2025-10-02T15:45:00Z
