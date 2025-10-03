# AGENT 4: PHP Renderer Fix Implementation Guide

## Executive Summary

**Status**: ✅ Metadata fully preserved in database | ❌ PHP renderer needs fix
**Priority**: CRITICAL - MUST FIX BEFORE PRODUCTION
**Complexity**: LOW (simple conditional logic)
**Risk**: LOW (100% backward compatible)
**Time**: 30 minutes

---

## Problem Statement

The JavaScript offset fix (Agent 3) successfully:
- ✅ Adds 50px offset when SAVING coordinates (canvas→container)
- ✅ Subtracts 50px offset when LOADING coordinates (container→canvas)
- ✅ Stores metadata flags (`offset_applied: true`, `offset_x: 50`, `offset_y: 50`)

However, the **PHP backend renderer** (AllesKlarDruck API integration) does NOT check the metadata flags:
- ❌ Uses coordinates as-is from database
- ❌ For NEW designs: Reads Y=200px (container-relative) instead of Y=150px (canvas-relative)
- ❌ Result: Print output is 50px off from designer preview

---

## Impact Analysis

### Old Designs (Saved BEFORE Offset Fix)
- **Coordinates**: Canvas-relative (e.g., Y=150px)
- **Metadata**: `offset_applied` is `undefined` or `false`
- **Current Rendering**: ✅ CORRECT (uses Y=150px)
- **After Fix**: ✅ STILL CORRECT (no metadata flag → uses Y=150px as-is)

### New Designs (Saved AFTER Offset Fix)
- **Coordinates**: Container-relative (e.g., Y=200px = 150+50)
- **Metadata**: `offset_applied: true`, `offset_x: 50`, `offset_y: 50`
- **Current Rendering**: ❌ INCORRECT (uses Y=200px → 50px off)
- **After Fix**: ✅ CORRECT (metadata flag detected → subtracts 50px → uses Y=150px)

---

## Solution

### File to Modify
```
/workspaces/yprint_designtool/includes/class-octo-print-api-integration.php
```

### Function to Modify
```php
private function convert_canvas_to_print_coordinates($transform_data, $template_id = null, $position = 'front', $size = null)
```

### Current Code (Line 654-655)
```php
// Transform-Daten aus WordPress
$left_px = isset($transform_data['left']) ? floatval($transform_data['left']) : 0;
$top_px = isset($transform_data['top']) ? floatval($transform_data['top']) : 0;
```

### Fixed Code
```php
// Transform-Daten aus WordPress
$left_px = isset($transform_data['left']) ? floatval($transform_data['left']) : 0;
$top_px = isset($transform_data['top']) ? floatval($transform_data['top']) : 0;

// 🔧 OFFSET-FIX: Handle new coordinate format with metadata
// New designs (saved after frontend fix) store container-relative coordinates
// with metadata.offset_applied flag. We need to subtract the offset to get
// canvas-relative coordinates for print conversion.
if (isset($transform_data['metadata']['offset_applied']) && $transform_data['metadata']['offset_applied'] === true) {
    // New format: Subtract offset to get canvas-relative coordinates
    $offset_x = floatval($transform_data['metadata']['offset_x'] ?? 0);
    $offset_y = floatval($transform_data['metadata']['offset_y'] ?? 0);

    // Store original values for logging
    $original_left = $left_px;
    $original_top = $top_px;

    // Apply offset correction
    $left_px -= $offset_x;
    $top_px -= $offset_y;

    // Debug logging
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log(sprintf(
            '🔧 [API RENDERER OFFSET-FIX] Detected metadata.offset_applied=true. ' .
            'Subtracted offset (%.2fpx, %.2fpx) from coordinates (%.2fpx, %.2fpx) → (%.2fpx, %.2fpx)',
            $offset_x, $offset_y,
            $original_left, $original_top,
            $left_px, $top_px
        ));
    }
}
// Old format (no metadata or offset_applied=false): Use coordinates as-is (already canvas-relative)
```

---

## Implementation Steps

### 1. Create Backup
```bash
cp /workspaces/yprint_designtool/includes/class-octo-print-api-integration.php \
   /workspaces/yprint_designtool/includes/class-octo-print-api-integration.php.backup-pre-offset-fix
```

### 2. Apply the Fix
Use the Edit tool to replace lines 654-655 with the fixed code above.

**Location**: After line 653 (`$print_area_height_mm = $canvas_config['print_area_height_mm'];`)
**Before**: Continue with existing pixel-to-mm conversion

### 3. Verify Syntax
```bash
php -l /workspaces/yprint_designtool/includes/class-octo-print-api-integration.php
```

### 4. Test Backward Compatibility (CRITICAL)
Test with OLD designs (no metadata):
```php
// Test Case: Old Design
$transform_data = array(
    'left' => 150,
    'top' => 200,
    'width' => 200,
    'height' => 150
    // NO metadata field
);

// Expected: Uses 150, 200 as-is (no offset subtraction)
$result = $this->convert_canvas_to_print_coordinates($transform_data, $template_id, 'front', $size);
// Should log: NO offset fix applied (old format)
```

### 5. Test New Format Handling
Test with NEW designs (with metadata):
```php
// Test Case: New Design
$transform_data = array(
    'left' => 200,  // Container-relative (150 + 50 offset)
    'top' => 250,   // Container-relative (200 + 50 offset)
    'width' => 200,
    'height' => 150,
    'metadata' => array(
        'offset_applied' => true,
        'offset_x' => 50,
        'offset_y' => 50,
        'offset_fix_version' => '1.0.0',
        'offset_fix_timestamp' => '2025-10-03T10:30:00Z'
    )
);

// Expected: Subtracts offset → Uses 150, 200 (canvas-relative)
$result = $this->convert_canvas_to_print_coordinates($transform_data, $template_id, 'front', $size);
// Should log: Offset fix applied, subtracted (50, 50) from (200, 250) → (150, 200)
```

### 6. Integration Testing
1. Create new design in designer with logo at Y=200px visual position
2. Save design (metadata.offset_applied=true will be added)
3. Place order with the design
4. Admin: Go to order page
5. Click "Send to AllesKlarDruck" preview
6. Inspect API payload JSON
7. Verify coordinates in `orderPositions[].printItems[].offsetX/offsetY` are correct
8. Compare with old design - verify both render correctly

---

## Data Flow Visualization

### OLD DESIGN (No Metadata)
```
Frontend Save:     Y=150px (canvas) → DB: 150px
PHP Renderer:      DB: 150px → Check metadata → NO FLAG → Use 150px → API: correct
```

### NEW DESIGN (With Metadata)
```
Frontend Save:     Y=150px (canvas) + 50px offset → DB: 200px (container) + metadata
PHP Renderer:      DB: 200px → Check metadata → offset_applied=true → 200-50=150px → API: correct
```

---

## Secondary Fix Location (Optional)

### Function: `parse_view_images`
**File**: `/workspaces/yprint_designtool/includes/class-octo-print-api-integration.php`
**Line**: 1290-1296
**Issue**: This function extracts transform data from `_db_processed_views` format

**Investigation Required**:
1. Check if `_db_processed_views` contains metadata field
2. If YES: No fix needed (metadata passed through automatically)
3. If NO: Investigate if metadata needs to be injected here

**Current Assessment**: Likely NO FIX NEEDED because:
- `_db_processed_views` is generated AFTER coordinate conversion
- Coordinates in `_db_processed_views` are already processed (canvas-relative)
- This format is used for print provider, not for re-conversion

**Action**: Monitor logs during testing. If you see "API RENDERER OFFSET-FIX" NOT logged when it should be, investigate this function.

---

## Testing Checklist

### Unit Tests
- [ ] Test with old design (no metadata) → coordinates unchanged
- [ ] Test with new design (metadata.offset_applied=true) → offset subtracted
- [ ] Test with new design (offset_x=0, offset_y=0 mobile) → no change needed
- [ ] Test with malformed metadata → graceful fallback to as-is coordinates

### Integration Tests
- [ ] Save new design → place order → verify API payload coordinates
- [ ] Load old design → place order → verify API payload coordinates
- [ ] Mixed order (old + new designs) → verify both correct

### Regression Tests
- [ ] Existing production orders still render correctly
- [ ] Old designs in user dashboard still work
- [ ] Print preview modal shows correct positioning

### Production Validation
- [ ] Generate API preview for 5 old orders → verify correct
- [ ] Generate API preview for 5 new orders → verify correct
- [ ] Send test order to AllesKlarDruck staging API
- [ ] Verify physical print (if possible) matches designer preview

---

## Rollback Plan

If critical issues are discovered:

```bash
# Restore backup
cp /workspaces/yprint_designtool/includes/class-octo-print-api-integration.php.backup-pre-offset-fix \
   /workspaces/yprint_designtool/includes/class-octo-print-api-integration.php

# Clear OPCache (if enabled)
php -r "opcache_reset();"

# OR restart PHP-FPM
sudo systemctl restart php-fpm
```

**Rollback Impact**:
- Old designs: Continue working (no change)
- New designs: Will render 50px off (back to broken state)
- No data loss or corruption

---

## Success Criteria

### Before Deployment
- [x] ✅ Metadata fully preserved in database (AGENT 4 validation passed)
- [x] ✅ Frontend offset fix working (AGENT 3 implementation complete)
- [ ] ❌ PHP renderer fix implemented
- [ ] ❌ All 8 test scenarios pass
- [ ] ❌ Backward compatibility verified with production data
- [ ] ❌ API payload coordinates validated

### After Deployment
- [ ] Monitor error logs for "API RENDERER OFFSET-FIX" messages
- [ ] Verify no "Unknown design format" errors
- [ ] Check that orders complete successfully
- [ ] Validate print output matches designer preview

---

## Code Quality Checklist

- [x] ✅ Backward compatible (old designs not affected)
- [x] ✅ Graceful fallback (missing metadata → use as-is)
- [x] ✅ Debug logging (WP_DEBUG mode)
- [x] ✅ Clear comments explaining logic
- [x] ✅ Type safety (floatval casting)
- [x] ✅ Null coalescing (metadata.offset_x ?? 0)
- [x] ✅ Explicit boolean check (=== true)

---

## Related Files

### Modified by This Fix
- `/workspaces/yprint_designtool/includes/class-octo-print-api-integration.php`

### Related Frontend Files (No Changes Needed)
- `/workspaces/yprint_designtool/public/js/dist/designer.bundle.js` (Agent 3 fix)

### Related Database Tables (No Schema Changes)
- `wp_octo_user_designs` (design_data LONGTEXT)
- `wp_wc_orders_meta` (_design_data key)

---

## Contact & Support

If issues arise during implementation:
1. Check error logs: `tail -f /var/log/php-error.log`
2. Enable WP_DEBUG: `define('WP_DEBUG', true);` in wp-config.php
3. Review AGENT-4-PHP-BACKEND-VALIDATION.json for full analysis
4. Test with AGENT-4 test scenarios

---

**STATUS**: Ready for implementation
**NEXT ACTION**: Apply fix to `convert_canvas_to_print_coordinates()` function
**ESTIMATED TIME**: 30 minutes (including testing)
**RISK LEVEL**: LOW
