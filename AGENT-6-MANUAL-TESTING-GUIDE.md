# AGENT 6: Manual Testing Guide
## End-to-End Integration Testing for Offset Fix

**Date**: 2025-10-03
**Purpose**: Provide step-by-step manual testing instructions for validating the canvas offset fix
**Required Environment**: WordPress with YPrint Design Tool plugin installed

---

## 📋 Pre-Testing Checklist

Before beginning manual tests, verify:

- [ ] WordPress environment is running
- [ ] YPrint Design Tool plugin is active
- [ ] WooCommerce is installed and active
- [ ] Test products are available
- [ ] Browser developer tools are accessible (Chrome/Firefox recommended)
- [ ] PHP error logging is enabled (`WP_DEBUG_LOG = true`)
- [ ] Access to database query tools (phpMyAdmin, TablePlus, or WP-CLI)

---

## 🧪 TEST 1: Old Design Backward Compatibility

**Priority**: CRITICAL
**Estimated Time**: 10 minutes
**Purpose**: Ensure existing designs continue to work unchanged

### Steps:

1. **Identify an existing design** (saved before offset fix)
   ```sql
   SELECT id, name, design_data
   FROM wp_octo_user_designs
   ORDER BY created_at ASC
   LIMIT 5;
   ```
   - Look for designs WITHOUT `metadata.offset_applied` field

2. **Open the designer**
   - Navigate to: `/wp-admin/admin.php?page=octo-print-designer`
   - OR: Product page with designer

3. **Load the old design**
   - Click "Load Design"
   - Select the identified old design
   - Click "Load"

4. **Check browser console** (F12)
   - Look for message: `🔧 OFFSET-FIX: Loading OLD design - using coordinates as-is (backward compatible)`
   - Should NOT show "subtracting offset"

5. **Visual verification**
   - Logo should appear at SAME position as before fix
   - No 50px shift in any direction

6. **Check database (optional)**
   ```sql
   SELECT design_data
   FROM wp_octo_user_designs
   WHERE id = [DESIGN_ID];
   ```
   - Verify NO metadata.offset_applied field

7. **Test API rendering** (requires WooCommerce order)
   - Create order with this design
   - Go to admin order screen
   - Click "Preview API Payload"
   - Check PHP error log: Should show "No offset metadata - using as-is"

### ✅ Pass Criteria:

- [ ] Design loads without errors
- [ ] Console shows "OLD design" message
- [ ] Visual position unchanged
- [ ] No metadata field in database
- [ ] PHP log shows backward compatible handling

---

## 🧪 TEST 2: New Design Save & Load Cycle

**Priority**: CRITICAL
**Estimated Time**: 15 minutes
**Purpose**: Verify new designs save with offset and load correctly

### Steps:

#### Part A: Save New Design

1. **Open designer**
   - Navigate to designer page
   - Ensure clean state (no existing design loaded)

2. **Upload logo**
   - Click "Upload Image"
   - Select a logo file (PNG/JPG)

3. **Position logo precisely**
   - Drag logo to a specific position
   - Note the visual Y coordinate from top of canvas (e.g., Y=200px)
   - You can use browser DevTools Elements inspector to measure

4. **Save design**
   - Name it: "TEST_NEW_FORMAT_[TIMESTAMP]"
   - Click "Save"

5. **Check browser console**
   - Look for: `🔧 OFFSET-FIX: Calculated offset`
   - Should show `offsetX: 50, offsetY: 50` (desktop)
   - OR `offsetX: 0, offsetY: 0` (mobile)

6. **Verify database**
   ```sql
   SELECT design_data
   FROM wp_octo_user_designs
   WHERE name LIKE 'TEST_NEW_FORMAT%'
   ORDER BY created_at DESC
   LIMIT 1;
   ```

   Parse the JSON and verify:
   - `views[0].images[0].transform.top` = Visual Y + 50 (e.g., 250 if visual was 200)
   - `views[0].images[0].metadata.offset_applied` = `true`
   - `views[0].images[0].metadata.offset_x` = `50`
   - `views[0].images[0].metadata.offset_y` = `50`

#### Part B: Load Saved Design

7. **Reload page completely**
   - Press F5 or Cmd+R
   - Clear any cached state

8. **Load the saved design**
   - Click "Load Design"
   - Select "TEST_NEW_FORMAT_[TIMESTAMP]"
   - Click "Load"

9. **Check browser console**
   - Look for: `🔧 OFFSET-FIX: Loading NEW design - subtracting offset`
   - Should show offset values being subtracted

10. **Visual verification**
    - Logo should appear at SAME visual position (e.g., Y=200px)
    - NOT at stored position (e.g., Y=250px)

#### Part C: API Rendering

11. **Add to cart and create order**
    - Add design to cart
    - Complete checkout

12. **Admin: Preview API payload**
    - Go to WooCommerce → Orders
    - Open the test order
    - Click "Preview AllesKlarDruck API"

13. **Check PHP error log**
    ```bash
    tail -f /wp-content/debug.log | grep "OFFSET-FIX"
    ```

    Should show:
    ```
    🔧 OFFSET-FIX: Applied coordinate offset correction - X: 50.00, Y: 50.00
    (Before: left=XXX, top=250.00 | After: left=XXX, top=200.00)
    ```

14. **Verify API payload JSON**
    - Inspect `orderPositions[].printItems[].offsetY` value
    - Should correspond to canvas-relative Y=200px (converted to mm)
    - NOT container-relative Y=250px

### ✅ Pass Criteria:

- [ ] Design saves with metadata.offset_applied = true
- [ ] Stored coordinates = visual + offset
- [ ] Console shows offset calculation on save
- [ ] Design loads at same visual position
- [ ] Console shows offset subtraction on load
- [ ] PHP log shows offset correction applied
- [ ] API payload has canvas-relative coordinates

---

## 🧪 TEST 3: Drag & Drop Update

**Priority**: HIGH
**Estimated Time**: 10 minutes
**Purpose**: Verify drag operations maintain correct offset handling

### Steps:

1. **Load any design**
   - Can be old or new format

2. **Note current position**
   - Visual Y coordinate (e.g., Y=200px)

3. **Drag logo to new position**
   - Drag logo down (e.g., to Y=300px)
   - Release mouse

4. **Check console immediately**
   - Should show coordinate update log
   - May show updateImageTransform() call

5. **Save design**
   - Click "Save"

6. **Check database**
   ```sql
   SELECT design_data FROM wp_octo_user_designs
   WHERE id = [DESIGN_ID];
   ```

   Verify:
   - New top coordinate = 350 (300 + 50)
   - metadata.offset_applied = true

7. **Reload and verify**
   - Refresh page
   - Load design
   - Logo should appear at Y=300px (new visual position)

### ✅ Pass Criteria:

- [ ] Drag operation smooth
- [ ] Coordinates updated with offset
- [ ] Metadata preserved
- [ ] Reload shows correct position

---

## 🧪 TEST 4: Mobile Responsive

**Priority**: HIGH
**Estimated Time**: 10 minutes
**Purpose**: Verify mobile viewport has 0px offset

### Steps:

1. **Open designer in desktop browser**

2. **Enable mobile emulation**
   - Chrome: DevTools → Toggle Device Toolbar (Cmd+Shift+M)
   - Select device: iPhone 12 or Galaxy S20
   - OR: Resize browser to width < 720px

3. **Create new design**
   - Upload logo
   - Position at Y=150px

4. **Check console**
   - Look for: `🔧 OFFSET-FIX: Calculated offset { offsetX: 0, offsetY: 0 }`
   - Mobile should show 0px offset

5. **Save design**
   - Name: "TEST_MOBILE_[TIMESTAMP]"

6. **Verify database**
   ```sql
   SELECT design_data FROM wp_octo_user_designs
   WHERE name LIKE 'TEST_MOBILE%'
   ORDER BY created_at DESC LIMIT 1;
   ```

   Verify:
   - `transform.top` = 150 (same as visual, no offset)
   - `metadata.offset_x` = 0
   - `metadata.offset_y` = 0
   - `metadata.offset_applied` = true (still flagged)

### ✅ Pass Criteria:

- [ ] Mobile shows 0px offset in console
- [ ] Stored coordinates match visual coordinates
- [ ] metadata.offset_x = 0, offset_y = 0
- [ ] Design loads correctly on mobile

---

## 🧪 TEST 5: Position Estimation

**Priority**: MEDIUM
**Estimated Time**: 15 minutes
**Purpose**: Verify front/back/left/right detection uses correct coordinates

### Steps:

1. **Create 4 test designs**:

   **Design A: Front Position**
   - Logo centered horizontally
   - Y position: Top 30% of canvas (e.g., Y=180px)
   - Expected detection: "front"

   **Design B: Back Position**
   - Logo centered horizontally
   - Y position: Bottom 30% of canvas (e.g., Y=450px)
   - Expected detection: "back"

   **Design C: Left Position**
   - Logo on left 20% of canvas (e.g., X=80px)
   - Y position: Middle (e.g., Y=300px)
   - Expected detection: "left"

   **Design D: Right Position**
   - Logo on right 20% of canvas (e.g., X=640px)
   - Y position: Middle (e.g., Y=300px)
   - Expected detection: "right"

2. **Save all 4 designs**

3. **Create orders with each design**

4. **Preview API for each order**
   - Check position field in API payload

5. **Check PHP error logs**
   ```bash
   grep "Position Estimator" /wp-content/debug.log
   ```

   Should show offset subtraction before position detection

### ✅ Pass Criteria:

- [ ] Front position detected correctly
- [ ] Back position detected correctly
- [ ] Left position detected correctly
- [ ] Right position detected correctly
- [ ] PHP log shows offset handling

---

## 🧪 TEST 6: Edge Cases

**Priority**: MEDIUM
**Estimated Time**: 20 minutes
**Purpose**: Verify graceful error handling

### Test Cases:

#### Case 1: Missing Metadata Field

1. **Manually create design data without metadata**
   ```sql
   UPDATE wp_octo_user_designs
   SET design_data = '[JSON_WITHOUT_METADATA]'
   WHERE id = [TEST_ID];
   ```

2. **Load design** → Should work (treated as old design)

#### Case 2: offset_applied = false

1. **Create design data with explicit false**
   ```json
   "metadata": {
     "offset_applied": false,
     "offset_x": 50,
     "offset_y": 50
   }
   ```

2. **Load design** → Should use coords as-is (offset NOT applied)

#### Case 3: Missing offset_x/offset_y

1. **Create design with incomplete metadata**
   ```json
   "metadata": {
     "offset_applied": true
   }
   ```

2. **Load design** → Should default to 0 (graceful fallback)

### ✅ Pass Criteria:

- [ ] No JavaScript errors
- [ ] No PHP fatal errors
- [ ] Graceful fallback behavior
- [ ] Appropriate console/log messages

---

## 🧪 TEST 7: Performance & Regression

**Priority**: MEDIUM
**Estimated Time**: 30 minutes
**Purpose**: Verify no performance issues or regressions

### Steps:

1. **Identify 10 existing production designs**

2. **For each design**:
   - Load in designer
   - Measure load time (DevTools Performance tab)
   - Verify visual position unchanged
   - Check console for appropriate handling

3. **Compare with pre-fix baseline** (if available)

4. **Generate API previews for all 10**
   - Verify coordinates in payloads
   - Check for any errors

### ✅ Pass Criteria:

- [ ] All 10 designs load successfully
- [ ] No visual position changes
- [ ] Load time < 2 seconds per design
- [ ] No performance degradation
- [ ] API payloads correct

---

## 🧪 TEST 8: End-to-End Workflow

**Priority**: CRITICAL
**Estimated Time**: 20 minutes
**Purpose**: Complete workflow validation

### Steps:

1. **Create Design**
   - Upload logo
   - Position at Y=200px
   - Save as "E2E_TEST_[TIMESTAMP]"

2. **Verify Save**
   - Check database: Y=250px stored
   - metadata.offset_applied = true

3. **Load Design**
   - Reload page
   - Load saved design
   - Verify: Logo at Y=200px visual

4. **Add to Cart**
   - Add design to WooCommerce cart
   - Check cart item data

5. **Checkout**
   - Complete order

6. **Admin: Order Processing**
   - View order in admin
   - Preview API payload
   - Verify coordinates

7. **Check PHP Logs**
   ```bash
   tail -100 /wp-content/debug.log | grep "OFFSET-FIX"
   ```

### ✅ Pass Criteria:

- [ ] Design created successfully
- [ ] Saved with correct metadata
- [ ] Loaded at same visual position
- [ ] Cart preserves design data
- [ ] Order contains complete data
- [ ] API preview shows correct coords
- [ ] PHP logs show offset handling

---

## 📊 Test Results Summary

After completing all tests, fill out:

| Test | Status | Issues Found | Notes |
|------|--------|--------------|-------|
| 1. Old Design Backward Compat | ☐ PASS ☐ FAIL | | |
| 2. New Design Save/Load | ☐ PASS ☐ FAIL | | |
| 3. Drag & Drop | ☐ PASS ☐ FAIL | | |
| 4. Mobile Responsive | ☐ PASS ☐ FAIL | | |
| 5. Position Estimation | ☐ PASS ☐ FAIL | | |
| 6. Edge Cases | ☐ PASS ☐ FAIL | | |
| 7. Performance & Regression | ☐ PASS ☐ FAIL | | |
| 8. End-to-End Workflow | ☐ PASS ☐ FAIL | | |

**Overall Status**: ☐ READY FOR PRODUCTION ☐ NEEDS FIXES

---

## 🚨 Troubleshooting

### Console shows no offset messages

**Cause**: Old JavaScript bundle cached
**Fix**: Hard reload (Cmd+Shift+R) or clear browser cache

### PHP logs show no offset messages

**Cause**: WP_DEBUG_LOG not enabled or wrong log file
**Fix**:
```php
// wp-config.php
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
```

### Design loads 50px off position

**Cause**: Metadata missing or incorrect
**Fix**: Check database design_data, verify metadata.offset_applied exists

### API coordinates incorrect

**Cause**: PHP renderer not deployed or reverted
**Fix**: Verify class-octo-print-api-integration.php has offset handling code

---

## 📁 Log File Locations

**WordPress Debug Log**:
```
/wp-content/debug.log
```

**PHP Error Log** (server-dependent):
```
/var/log/php-error.log
/var/log/php/error.log
/var/log/apache2/error.log
/var/log/nginx/error.log
```

**Monitor in real-time**:
```bash
# WordPress debug log
tail -f /wp-content/debug.log | grep "OFFSET-FIX"

# PHP error log (adjust path)
tail -f /var/log/php-error.log | grep "OFFSET-FIX"
```

---

## 🎯 Success Criteria Summary

**Minimum Required for Production**:
- ✅ Test 1 (Old Design Backward Compat) MUST PASS
- ✅ Test 2 (New Design Save/Load) MUST PASS
- ✅ Test 8 (End-to-End Workflow) MUST PASS

**Recommended (Should Pass)**:
- ✅ Test 3 (Drag & Drop)
- ✅ Test 4 (Mobile Responsive)
- ✅ Test 7 (Performance & Regression)

**Optional (Nice to Have)**:
- ✅ Test 5 (Position Estimation)
- ✅ Test 6 (Edge Cases)

---

## 📝 Notes

- Take screenshots of critical test results
- Document any unexpected behavior
- Record coordinate values for verification
- Save console logs for evidence
- Keep test designs for future regression testing

---

**Testing Guide Version**: 1.0.0
**Last Updated**: 2025-10-03
**Prepared By**: AGENT 6
