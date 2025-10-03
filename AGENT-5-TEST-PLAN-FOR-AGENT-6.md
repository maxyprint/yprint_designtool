# AGENT 5: Test Plan for Agent 6 Integration Testing

## Overview
This document provides Agent 6 with comprehensive test scenarios to validate the PHP renderer offset fix.

---

## Prerequisites

### 1. Files to Review
- ✅ `/workspaces/yprint_designtool/includes/class-octo-print-api-integration.php` (modified)
- ✅ `/workspaces/yprint_designtool/AGENT-5-PHP-RENDERER-FIX-REPORT.json` (detailed report)
- ✅ `/workspaces/yprint_designtool/AGENT-5-EXECUTIVE-SUMMARY.md` (summary)

### 2. What Was Changed
- **Function 1**: `convert_canvas_to_print_coordinates()` - Added offset handling (line 657-682)
- **Function 2**: `estimate_position_from_canvas()` - Added offset handling (line 1048-1055)

### 3. Expected Behavior
- **Old designs** (no metadata): Use coordinates as-is → Print correctly
- **New designs** (metadata.offset_applied=true): Subtract offset → Print correctly

---

## Test Scenarios

### 🧪 TEST 1: Old Design (No Metadata) - Backward Compatibility

#### Test Data
```json
{
  "images": [{
    "transform": {
      "left": 150,
      "top": 200,
      "width": 200,
      "height": 150,
      "scaleX": 1,
      "scaleY": 1
    }
  }]
}
```

#### Expected Results
- ✅ Coordinates used as-is: left=150px, top=200px
- ✅ Log entry: "🔧 OFFSET-FIX: No offset metadata - using coordinates as-is (backward compatible)"
- ✅ API payload: offsetX and offsetY match original coordinates (converted to mm)
- ✅ Print position: Correct (unchanged from before fix)

#### Validation Steps
1. Load existing design from database (saved before offset fix)
2. Trigger AllesKlarDruck API preview
3. Check error logs for "No offset metadata" message
4. Inspect API payload JSON for coordinate accuracy
5. Compare with design visual position

---

### 🧪 TEST 2: New Design (With Metadata) - Offset Correction

#### Test Data
```json
{
  "images": [{
    "transform": {
      "left": 200,
      "top": 250,
      "width": 200,
      "height": 150,
      "scaleX": 1,
      "scaleY": 1,
      "metadata": {
        "offset_applied": true,
        "offset_x": 50,
        "offset_y": 50,
        "offset_fix_version": "1.0.0",
        "offset_fix_timestamp": "2025-10-03T10:30:00Z"
      }
    }
  }]
}
```

#### Expected Results
- ✅ Offset subtracted: left=200-50=150px, top=250-50=200px
- ✅ Log entry: "🔧 OFFSET-FIX: Applied coordinate offset correction - X: 50.00, Y: 50.00 (Before: left=200.00, top=250.00 | After: left=150.00, top=200.00)"
- ✅ API payload: offsetX and offsetY reflect corrected coordinates (converted to mm)
- ✅ Print position: Correct (matches visual design position)

#### Validation Steps
1. Create new design in frontend designer (offset metadata added automatically)
2. Save design to database
3. Place order with the design
4. Trigger AllesKlarDruck API preview
5. Check error logs for offset correction message with before/after values
6. Inspect API payload JSON
7. Verify coordinates match canvas-relative position (150, 200) not container-relative (200, 250)

---

### 🧪 TEST 3: Mobile Design (Zero Offset)

#### Test Data
```json
{
  "images": [{
    "transform": {
      "left": 150,
      "top": 200,
      "width": 200,
      "height": 150,
      "metadata": {
        "offset_applied": true,
        "offset_x": 0,
        "offset_y": 0,
        "offset_fix_version": "1.0.0"
      }
    }
  }]
}
```

#### Expected Results
- ✅ Offset subtracted (but zero): left=150-0=150px, top=200-0=200px
- ✅ Log entry: "🔧 OFFSET-FIX: Applied coordinate offset correction - X: 0.00, Y: 0.00 (Before: left=150.00, top=200.00 | After: left=150.00, top=200.00)"
- ✅ API payload: Coordinates unchanged (150, 200)
- ✅ Print position: Correct

#### Validation Steps
1. Simulate mobile design save (offset_x=0, offset_y=0)
2. Verify metadata.offset_applied=true is present
3. Check logs show offset correction with zero values
4. Verify coordinates unchanged in output

---

### 🧪 TEST 4: Mixed Order (Old + New Designs)

#### Test Data
Create order with:
1. **Old design** (no metadata): Logo at left=150, top=200
2. **New design** (with metadata): Logo at left=200, top=250 (stored), offset_x=50, offset_y=50

#### Expected Results
- ✅ Old design: Uses 150, 200 as-is
- ✅ New design: Subtracts offset → Uses 150, 200
- ✅ Both render at same visual position (correct)
- ✅ Logs show "using as-is" for old, "offset correction" for new
- ✅ API payload has correct coordinates for both

#### Validation Steps
1. Create order with both design types
2. Generate API preview
3. Verify each design is handled correctly
4. Check logs show different handling for each
5. Validate API payload has accurate coordinates for both

---

### 🧪 TEST 5: Position Estimation (Front/Back/Left/Right)

#### Test Scenarios

**A. Front Position (Y < 60% of canvas)**
```json
{
  "transform": {
    "left": 400,
    "top": 100,
    "width": 200,
    "metadata": {
      "offset_applied": true,
      "offset_x": 50,
      "offset_y": 50
    }
  }
}
```
- Expected: Position detected as "front" (after offset subtraction: top=50px < 60% of 600px)

**B. Back Position (Y > 60%, center)**
```json
{
  "transform": {
    "left": 450,
    "top": 450,
    "width": 200,
    "metadata": {
      "offset_applied": true,
      "offset_x": 50,
      "offset_y": 50
    }
  }
}
```
- Expected: Position detected as "back" (after offset subtraction: top=400px, center_x=400px)

**C. Left Sleeve (X < 30%)**
```json
{
  "transform": {
    "left": 100,
    "top": 450,
    "width": 100,
    "metadata": {
      "offset_applied": true,
      "offset_x": 50,
      "offset_y": 50
    }
  }
}
```
- Expected: Position detected as "left" (after offset subtraction: center_x=100px < 30% of 800px)

#### Validation Steps
1. Test each position scenario
2. Check logs for "🔧 OFFSET-FIX [Position Estimator]: Subtracted offset"
3. Verify API payload has correct position field
4. Confirm position detection is accurate after offset correction

---

### 🧪 TEST 6: Edge Cases & Error Handling

#### A. Missing offset_x/offset_y
```json
{
  "transform": {
    "left": 200,
    "top": 250,
    "metadata": {
      "offset_applied": true
      // offset_x and offset_y missing
    }
  }
}
```
- Expected: Defaults to 0 via null coalescing (`?? 0`)
- Expected: left=200-0=200, top=250-0=250 (safe fallback)

#### B. Invalid offset values (strings)
```json
{
  "transform": {
    "left": 200,
    "top": 250,
    "metadata": {
      "offset_applied": true,
      "offset_x": "invalid",
      "offset_y": "50px"
    }
  }
}
```
- Expected: `floatval()` converts safely → offset_x=0, offset_y=50
- Expected: left=200-0=200, top=250-50=200

#### C. offset_applied = false
```json
{
  "transform": {
    "left": 150,
    "top": 200,
    "metadata": {
      "offset_applied": false,
      "offset_x": 50,
      "offset_y": 50
    }
  }
}
```
- Expected: Condition fails (=== true check)
- Expected: Uses coordinates as-is (150, 200)
- Expected: Log: "No offset metadata - using as-is"

---

### 🧪 TEST 7: API Payload Validation

#### Test Flow
1. Create new design with logo at visual position Y=150px
2. Save design (metadata added: offset_applied=true, offset_y=50)
3. Database stores: Y=200px (container-relative)
4. Place order
5. Generate API payload

#### Expected API Payload Structure
```json
{
  "orderPositions": [{
    "printItems": [{
      "offsetX": 23.4,  // 150px converted to mm (NOT 200px)
      "offsetY": 31.2,  // 150px converted to mm (NOT 200px)
      "width": 62.5,
      "height": 46.9
    }]
  }]
}
```

#### Validation Steps
1. Inspect `orderPositions[].printItems[]` array
2. Verify `offsetX` and `offsetY` values
3. Calculate expected mm values:
   - Canvas: 800px → 210mm (print area)
   - Pixel-to-mm ratio: 210/800 = 0.2625 mm/px
   - Expected offsetX: 150px * 0.2625 = 39.375mm
   - Expected offsetY: 150px * 0.2625 = 39.375mm (or template-specific ratio)
4. Compare with actual API payload values
5. Verify NOT using container-relative values (200px)

---

### 🧪 TEST 8: Regression Testing

#### Existing Production Orders
1. Load 10 existing production orders (saved before offset fix)
2. For each order:
   - Generate API preview
   - Check logs for "No offset metadata - using as-is"
   - Verify coordinates unchanged
   - Validate API payload matches previous values
3. Confirm 100% backward compatibility

#### Test Commands
```bash
# Monitor logs during testing
tail -f /wp-content/debug.log | grep "OFFSET-FIX"

# Or server error log
tail -f /var/log/php-error.log | grep "OFFSET-FIX"

# Test order IDs (example)
for order_id in 100 101 102 103 104; do
  echo "Testing order $order_id..."
  # Trigger API preview via WP-CLI or admin UI
done
```

---

## Validation Checklist

### Code Level
- [ ] PHP syntax valid (`php -l class-octo-print-api-integration.php`)
- [ ] No PHP warnings or errors in logs
- [ ] Functions `convert_canvas_to_print_coordinates()` and `estimate_position_from_canvas()` modified correctly
- [ ] Offset handling logic matches specification

### Functional Level
- [ ] Old designs (no metadata) → coordinates unchanged
- [ ] New designs (metadata.offset_applied=true) → offset subtracted
- [ ] Mobile designs (offset=0) → handled correctly
- [ ] Mixed orders → both design types work
- [ ] Position estimation → correct front/back/left/right
- [ ] Edge cases → graceful fallback

### Integration Level
- [ ] API payload → correct coordinates (canvas-relative, not container-relative)
- [ ] Error logs → show "🔧 OFFSET-FIX" entries with correct messages
- [ ] Database → metadata preserved (Agent 4 validation)
- [ ] Frontend → metadata added on save (Agent 3 validation)
- [ ] Backward compatibility → 100% of old designs work

### Production Readiness
- [ ] All test scenarios pass
- [ ] No regressions detected
- [ ] Rollback plan tested and working
- [ ] Documentation complete
- [ ] Deployment checklist prepared

---

## Log Monitoring Guide

### Expected Log Patterns

**For OLD designs:**
```
🔧 OFFSET-FIX: No offset metadata - using coordinates as-is (backward compatible)
```

**For NEW designs:**
```
🔧 OFFSET-FIX: Applied coordinate offset correction - X: 50.00, Y: 50.00 (Before: left=200.00, top=250.00 | After: left=150.00, top=200.00)
```

**For Position Estimator:**
```
🔧 OFFSET-FIX [Position Estimator]: Subtracted offset (50.00, 50.00)
```

### Monitor Commands
```bash
# Real-time monitoring
tail -f /wp-content/debug.log | grep "OFFSET-FIX"

# Count occurrences
grep "OFFSET-FIX" /wp-content/debug.log | wc -l

# Check for errors
grep -E "OFFSET-FIX.*(error|warning|fail)" /wp-content/debug.log

# Analyze offset values
grep "Applied coordinate offset correction" /wp-content/debug.log | grep -oP "X: \K[0-9.]+"
```

---

## Performance Testing

### Test Load
1. Generate API preview for 50 orders
2. Monitor execution time
3. Check for performance degradation
4. Verify offset calculation doesn't add significant overhead

### Expected Impact
- **Offset check**: O(1) constant time
- **Offset subtraction**: Negligible (simple arithmetic)
- **Logging**: Minor overhead (can be disabled in production)
- **Overall**: < 1ms additional processing time per design

---

## Rollback Testing

### Test Rollback Procedure
```bash
# 1. Test rollback script
bash /workspaces/yprint_designtool/AGENT-5-QUICK-ROLLBACK.sh

# 2. Verify rollback successful
php -l /workspaces/yprint_designtool/includes/class-octo-print-api-integration.php

# 3. Test old design still works (should work)
# Test new design (should be 50px off - broken state)

# 4. Re-apply fix
# Restore from safety backup created by rollback script

# 5. Verify fix re-applied correctly
# Test both old and new designs again
```

---

## Final Validation Report Template

After completing all tests, Agent 6 should create:

### AGENT-6-INTEGRATION-TEST-REPORT.json
```json
{
  "test_date": "2025-10-03",
  "tested_by": "AGENT 6",
  "test_scenarios": [
    {
      "test_id": 1,
      "scenario": "Old Design (No Metadata)",
      "status": "PASS/FAIL",
      "notes": "...",
      "log_excerpt": "..."
    },
    // ... all scenarios
  ],
  "regression_testing": {
    "orders_tested": 10,
    "failures": 0,
    "backward_compatible": true
  },
  "api_payload_validation": {
    "old_designs_correct": true,
    "new_designs_correct": true,
    "coordinate_accuracy": "100%"
  },
  "performance": {
    "overhead": "< 1ms",
    "acceptable": true
  },
  "production_ready": true/false,
  "deployment_recommendation": "APPROVE/REJECT/NEEDS_FIXES",
  "issues_found": []
}
```

---

## Success Criteria

**PASS if:**
- ✅ All 8 test scenarios pass
- ✅ Backward compatibility: 100%
- ✅ API payloads have correct coordinates
- ✅ Logs show expected messages
- ✅ No PHP errors or warnings
- ✅ Performance acceptable
- ✅ Rollback tested and working

**FAIL if:**
- ❌ Any test scenario fails
- ❌ Backward compatibility < 100%
- ❌ API payload coordinates incorrect
- ❌ PHP errors in logs
- ❌ Performance degradation
- ❌ Rollback doesn't work

---

## Agent 6 Action Items

1. ✅ Review Agent 5 implementation files
2. ✅ Set up test environment
3. ✅ Execute all 8 test scenarios
4. ✅ Validate API payloads
5. ✅ Monitor error logs
6. ✅ Test rollback procedure
7. ✅ Run regression tests
8. ✅ Create validation report
9. ✅ Provide deployment recommendation

---

**Prepared by**: AGENT 5
**Date**: 2025-10-03
**For**: AGENT 6 Integration Testing
**Status**: Ready for Testing
