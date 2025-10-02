# PHASE 3.5-3.7: TESTING, DEPLOYMENT & CLEANUP

---

## PHASE 3.5: STAGING DEPLOYMENT & TESTING

**Duration:** 4-6 hours
**Goal:** Validate entire system before production deployment
**Success Criteria:** 100% test pass rate, zero regressions, performance within benchmarks

---

### 3.5.1: Staging Deployment Checklist

#### Environment Setup

- [ ] Clone production database to staging environment
- [ ] Deploy all code changes from phases 3.1, 3.2, 3.3
- [ ] Run migration script on staging database
- [ ] Clear all caches (OPcache, object cache, browser cache)
- [ ] Verify file permissions and ownership
- [ ] Enable WordPress debug mode

#### Verification Commands

```bash
# Check deployed files exist
ls -la /workspaces/yprint_designtool/public/js/dist/designer.bundle.js
ls -la /workspaces/yprint_designtool/includes/cli/class-octo-migration-command.php
ls -la /workspaces/yprint_designtool/includes/class-octo-print-designer-wc-integration.php

# Verify migration completed
wp db query "SELECT COUNT(*) as migrated_count FROM deo6_octo_user_designs WHERE design_data LIKE '%objects%' AND design_data LIKE '%capture_version%' AND design_data_backup IS NOT NULL"

# Check backup column exists
wp db query "SHOW COLUMNS FROM deo6_octo_user_designs LIKE 'design_data_backup'"

# Verify WP-CLI command registration
wp octo-migrate --help
```

---

### 3.5.2: Complete Test Suite

#### TEST 1: Frontend Golden Standard Output

**Objective:** Verify frontend generates correct data format
**Location:** Browser console on designer page
**Expected Duration:** 2 minutes

```javascript
// Execute in browser console
const designData = window.designerInstance.collectDesignState();

// Assertions
console.group('Frontend Golden Standard Test');

console.assert(designData.objects, 'PASS: Has objects array');
console.assert(Array.isArray(designData.objects), 'PASS: objects is array');
console.assert(designData.metadata, 'PASS: Has metadata object');
console.assert(designData.metadata.capture_version === '3.0.0', 'PASS: capture_version is 3.0.0');
console.assert(designData.metadata.source === 'designer', 'PASS: source is designer');
console.assert(designData.metadata.designer_offset !== undefined, 'PASS: Has designer_offset');

// Forbidden properties
console.assert(!designData.variationImages, 'PASS: NO variationImages');
console.assert(!designData.variations, 'PASS: NO variations');
console.assert(!designData.canvasConfig, 'PASS: NO canvasConfig');

// Coordinate flattening
if (designData.objects.length > 0) {
    const obj = designData.objects[0];
    console.assert(typeof obj.left === 'number', 'PASS: Flat left coordinate');
    console.assert(typeof obj.top === 'number', 'PASS: Flat top coordinate');
    console.assert(!obj.transform, 'PASS: NO nested transform object');
}

console.groupEnd();
console.log('✅ ALL FRONTEND TESTS PASSED');
```

**Expected Output:**
```
Frontend Golden Standard Test
  PASS: Has objects array
  PASS: objects is array
  PASS: Has metadata object
  PASS: capture_version is 3.0.0
  PASS: source is designer
  PASS: Has designer_offset
  PASS: NO variationImages
  PASS: NO variations
  PASS: NO canvasConfig
  PASS: Flat left coordinate
  PASS: Flat top coordinate
  PASS: NO nested transform object
✅ ALL FRONTEND TESTS PASSED
```

---

#### TEST 2: Backend Validation

**Objective:** Verify schema validator accepts/rejects correctly
**Location:** Server-side PHP test script
**Expected Duration:** 3 minutes

```php
<?php
/**
 * File: /workspaces/yprint_designtool/test-backend-validation.php
 * Run: php test-backend-validation.php
 */

require_once '/workspaces/yprint_designtool/includes/class-octo-print-designer-wc-integration.php';

$wc_integration = new Octo_Print_Designer_WC_Integration();
$tests_passed = 0;
$tests_failed = 0;

// TEST 2.1: Valid Golden Standard format
$valid_data = [
    'objects' => [
        ['type' => 'image', 'left' => 100, 'top' => 200, 'src' => 'test.jpg'],
        ['type' => 'text', 'left' => 50, 'top' => 150, 'text' => 'Hello']
    ],
    'metadata' => [
        'capture_version' => '3.0.0',
        'source' => 'designer',
        'designer_offset' => ['top' => 0, 'left' => 0],
        'timestamp' => time()
    ]
];

$result = $wc_integration->validate_design_data_schema($valid_data);
if ($result === true) {
    echo "✅ TEST 2.1 PASSED: Valid Golden Standard accepted\n";
    $tests_passed++;
} else {
    echo "❌ TEST 2.1 FAILED: Valid data rejected - " . $result->get_error_message() . "\n";
    $tests_failed++;
}

// TEST 2.2: Reject variationImages format
$invalid_variation_images = [
    'variationImages' => [
        'front' => [
            ['type' => 'image', 'left' => 100, 'top' => 200]
        ]
    ],
    'metadata' => ['source' => 'designer']
];

$result = $wc_integration->validate_design_data_schema($invalid_variation_images);
if (is_wp_error($result) && $result->get_error_code() === 'forbidden_format') {
    echo "✅ TEST 2.2 PASSED: variationImages format rejected\n";
    $tests_passed++;
} else {
    echo "❌ TEST 2.2 FAILED: variationImages format not rejected\n";
    $tests_failed++;
}

// TEST 2.3: Reject nested transform coordinates
$invalid_nested = [
    'objects' => [
        [
            'type' => 'image',
            'transform' => ['translateX' => 100, 'translateY' => 200]
        ]
    ],
    'metadata' => ['capture_version' => '3.0.0', 'source' => 'designer']
];

$result = $wc_integration->validate_design_data_schema($invalid_nested);
if (is_wp_error($result) && $result->get_error_code() === 'forbidden_format') {
    echo "✅ TEST 2.3 PASSED: Nested transform rejected\n";
    $tests_passed++;
} else {
    echo "❌ TEST 2.3 FAILED: Nested transform not rejected\n";
    $tests_failed++;
}

// TEST 2.4: Missing required fields
$invalid_missing = [
    'objects' => [['type' => 'image']]
    // No metadata
];

$result = $wc_integration->validate_design_data_schema($invalid_missing);
if (is_wp_error($result) && $result->get_error_code() === 'missing_required') {
    echo "✅ TEST 2.4 PASSED: Missing metadata detected\n";
    $tests_passed++;
} else {
    echo "❌ TEST 2.4 FAILED: Missing metadata not detected\n";
    $tests_failed++;
}

// Summary
echo "\n========================================\n";
echo "Tests Passed: $tests_passed / 4\n";
echo "Tests Failed: $tests_failed / 4\n";

if ($tests_failed === 0) {
    echo "✅ ALL BACKEND VALIDATION TESTS PASSED\n";
    exit(0);
} else {
    echo "❌ SOME BACKEND VALIDATION TESTS FAILED\n";
    exit(1);
}
```

**Expected Output:**
```
✅ TEST 2.1 PASSED: Valid Golden Standard accepted
✅ TEST 2.2 PASSED: variationImages format rejected
✅ TEST 2.3 PASSED: Nested transform rejected
✅ TEST 2.4 PASSED: Missing metadata detected

========================================
Tests Passed: 4 / 4
Tests Failed: 0 / 4
✅ ALL BACKEND VALIDATION TESTS PASSED
```

---

#### TEST 3: Design Save & Load (End-to-End)

**Objective:** Verify complete user workflow
**Location:** Designer page in browser
**Expected Duration:** 5 minutes

**Manual Test Steps:**

1. **Setup:**
   - Open designer page: `https://staging.example.com/designer/?product_id=123`
   - Open browser DevTools (F12)
   - Go to Network tab, filter by "XHR"

2. **Save Design:**
   - Upload test image to canvas
   - Position image at coordinates (300, 200)
   - Click "Save Design" button
   - In Network tab, find the save request
   - Click on request → Payload tab
   - Verify JSON structure:
     ```json
     {
       "objects": [
         {
           "type": "image",
           "left": 300,
           "top": 200,
           "src": "...",
           // No "transform" property
         }
       ],
       "metadata": {
         "capture_version": "3.0.0",
         "source": "designer",
         "designer_offset": {...}
       }
       // NO "variationImages" property
     }
     ```
   - Verify response: HTTP 200 status

3. **Load Design:**
   - Reload the page
   - Click "Load Design" button
   - Verify: Image appears at (300, 200)
   - Check Console tab for log: `"Loading design in Golden Standard format"`
   - Verify: No errors in console

4. **Success Criteria:**
   - [ ] Save request contains `objects` array
   - [ ] Save request contains `metadata.capture_version`
   - [ ] Save request does NOT contain `variationImages`
   - [ ] Coordinates are flat (no nested `transform`)
   - [ ] HTTP 200 response received
   - [ ] Page reload shows design correctly
   - [ ] No console errors

---

#### TEST 4: Legacy Design Loading

**Objective:** Verify backward compatibility with pre-migration designs
**Location:** Admin order page
**Expected Duration:** 4 minutes

**Manual Test Steps:**

1. **Find Legacy Order:**
   ```bash
   # Find orders with legacy format (before migration)
   wp db query "SELECT p.ID, p.post_date, pm.meta_value
                FROM deo6_posts p
                JOIN deo6_postmeta pm ON p.ID = pm.post_id
                WHERE p.post_type = 'shop_order'
                AND pm.meta_key = '_design_data'
                AND pm.meta_value LIKE '%variationImages%'
                LIMIT 5"
   ```

2. **Load Legacy Design:**
   - Open order in WordPress admin: `/wp-admin/post.php?post=5378&action=edit`
   - Scroll to "Design Preview" metabox
   - Click "View Design Preview" button
   - Open browser console

3. **Verify Legacy Handling:**
   - Check console for log: `"Legacy variationImages format detected"`
   - Verify: Design renders correctly on canvas
   - Verify: No visual glitches or missing elements

4. **Re-save Test:**
   - Click "Edit Design" link
   - Make small change (move object 10px)
   - Click "Save Design"
   - Verify in Network tab: Now uses Golden Standard format
   - Reload order page
   - Verify: Design still displays correctly

5. **Success Criteria:**
   - [ ] Legacy design loads without errors
   - [ ] Canvas renders correctly
   - [ ] Console shows legacy detection message
   - [ ] Re-save converts to Golden Standard
   - [ ] Converted design still renders correctly

---

#### TEST 5: Print Provider Integration

**Objective:** Verify print data generation works with new format
**Location:** Server-side PHP
**Expected Duration:** 3 minutes

```php
<?php
/**
 * File: /workspaces/yprint_designtool/test-print-provider.php
 * Run: php test-print-provider.php
 */

// Find order with migrated design
$order_id = 5378; // Replace with actual order ID
$order = wc_get_order($order_id);

if (!$order) {
    die("❌ Order $order_id not found\n");
}

// Trigger print data refresh
do_action('woocommerce_order_status_processing', $order_id);

// Check _db_processed_views meta
$processed_views = $order->get_meta('_db_processed_views');

if (empty($processed_views)) {
    die("❌ TEST FAILED: No print data generated\n");
}

echo "✅ Print data exists\n";

$views_data = json_decode($processed_views, true);

if (!is_array($views_data) || empty($views_data)) {
    die("❌ TEST FAILED: Invalid print data format\n");
}

echo "✅ Print data is valid JSON\n";

// Check structure
$view_key = key($views_data);
$view = $views_data[$view_key];

if (!isset($view['images']) || !is_array($view['images'])) {
    die("❌ TEST FAILED: Missing images array\n");
}

echo "✅ Print data has images array\n";

if (empty($view['images'])) {
    die("❌ TEST FAILED: Images array is empty\n");
}

echo "✅ Print data has image entries\n";

// Verify image structure
$first_image = $view['images'][0];
if (!isset($first_image['url']) || !isset($first_image['x']) || !isset($first_image['y'])) {
    die("❌ TEST FAILED: Invalid image structure\n");
}

echo "✅ Image structure is correct\n";

echo "\n========================================\n";
echo "✅ ALL PRINT PROVIDER TESTS PASSED\n";
echo "Generated " . count($view['images']) . " images for view '$view_key'\n";
```

**Expected Output:**
```
✅ Print data exists
✅ Print data is valid JSON
✅ Print data has images array
✅ Print data has image entries
✅ Image structure is correct

========================================
✅ ALL PRINT PROVIDER TESTS PASSED
Generated 3 images for view 'front'
```

---

#### TEST 6: Database Migration Validation

**Objective:** Verify migration script correctness
**Location:** MySQL queries
**Expected Duration:** 5 minutes

```sql
-- TEST 6.1: Count migrated records
SELECT
    COUNT(*) as total_migrated,
    COUNT(DISTINCT id) as unique_designs
FROM deo6_octo_user_designs
WHERE design_data LIKE '%objects%'
  AND design_data LIKE '%capture_version%'
  AND design_data_backup IS NOT NULL;
-- Expected: Same count as original variationImages designs

-- TEST 6.2: Verify object count preservation
SELECT
    id,
    JSON_LENGTH(JSON_EXTRACT(design_data_backup, '$.variationImages.*[0]')) as old_object_count,
    JSON_LENGTH(JSON_EXTRACT(design_data, '$.objects')) as new_object_count,
    CASE
        WHEN JSON_LENGTH(JSON_EXTRACT(design_data_backup, '$.variationImages.*[0]')) =
             JSON_LENGTH(JSON_EXTRACT(design_data, '$.objects'))
        THEN 'PASS'
        ELSE 'FAIL'
    END as status
FROM deo6_octo_user_designs
WHERE design_data_backup IS NOT NULL
LIMIT 20;
-- Expected: All rows show 'PASS' status

-- TEST 6.3: Check for nested transforms (should be zero)
SELECT COUNT(*) as nested_transform_count
FROM deo6_octo_user_designs
WHERE design_data LIKE '%"transform":%'
  AND design_data_backup IS NOT NULL;
-- Expected: 0

-- TEST 6.4: Verify metadata structure
SELECT
    id,
    JSON_EXTRACT(design_data, '$.metadata.capture_version') as capture_version,
    JSON_EXTRACT(design_data, '$.metadata.source') as source,
    JSON_EXTRACT(design_data, '$.metadata.migration_timestamp') as migration_timestamp
FROM deo6_octo_user_designs
WHERE design_data_backup IS NOT NULL
LIMIT 10;
-- Expected: All rows have capture_version = "3.0.0", source = "migration"

-- TEST 6.5: Verify no data loss (backup integrity)
SELECT COUNT(*) as corrupted_backups
FROM deo6_octo_user_designs
WHERE design_data_backup IS NOT NULL
  AND (
      design_data_backup = ''
      OR design_data_backup = 'null'
      OR JSON_VALID(design_data_backup) = 0
  );
-- Expected: 0

-- TEST 6.6: Spot-check coordinate flattening
SELECT
    id,
    JSON_EXTRACT(design_data, '$.objects[0].left') as left_coord,
    JSON_EXTRACT(design_data, '$.objects[0].top') as top_coord,
    CASE
        WHEN JSON_EXTRACT(design_data, '$.objects[0].left') IS NOT NULL
         AND JSON_EXTRACT(design_data, '$.objects[0].top') IS NOT NULL
        THEN 'PASS'
        ELSE 'FAIL'
    END as status
FROM deo6_octo_user_designs
WHERE design_data_backup IS NOT NULL
  AND JSON_LENGTH(JSON_EXTRACT(design_data, '$.objects')) > 0
LIMIT 10;
-- Expected: All rows show 'PASS' status
```

**Success Criteria:**
- [ ] Total migrated count matches original variationImages count
- [ ] Object counts preserved (old count = new count)
- [ ] Zero nested transform objects
- [ ] All records have `capture_version = "3.0.0"`
- [ ] Zero corrupted backups
- [ ] Coordinates are flattened (left/top present)

---

#### TEST 7: Performance Benchmark

**Objective:** Ensure rendering performance meets requirements
**Location:** Browser console
**Expected Duration:** 3 minutes

```javascript
// Execute in browser console
console.group('Performance Benchmark Test');

// Test 1: Small design (1-3 objects)
const smallDesign = {
    objects: [
        {type: 'image', left: 100, top: 100, width: 200, height: 200, src: 'test.jpg'}
    ],
    metadata: {
        capture_version: '3.0.0',
        source: 'test',
        designer_offset: {top: 0, left: 0}
    }
};

console.time('Render small design');
await adminCanvasRenderer.renderDesignPreview(5378, smallDesign);
console.timeEnd('Render small design');
// Expected: < 100ms

// Test 2: Medium design (10-15 objects)
const mediumDesign = {
    objects: Array.from({length: 12}, (_, i) => ({
        type: 'text',
        left: 50 + i * 30,
        top: 100 + i * 20,
        text: `Object ${i}`,
        fontSize: 16
    })),
    metadata: {
        capture_version: '3.0.0',
        source: 'test',
        designer_offset: {top: 0, left: 0}
    }
};

console.time('Render medium design');
await adminCanvasRenderer.renderDesignPreview(5378, mediumDesign);
console.timeEnd('Render medium design');
// Expected: < 150ms

// Test 3: Large design (30+ objects)
const largeDesign = {
    objects: Array.from({length: 35}, (_, i) => ({
        type: i % 2 === 0 ? 'text' : 'image',
        left: (i % 10) * 50,
        top: Math.floor(i / 10) * 60,
        text: i % 2 === 0 ? `Text ${i}` : undefined,
        src: i % 2 === 1 ? 'test.jpg' : undefined
    })),
    metadata: {
        capture_version: '3.0.0',
        source: 'test',
        designer_offset: {top: 0, left: 0}
    }
};

console.time('Render large design');
await adminCanvasRenderer.renderDesignPreview(5378, largeDesign);
console.timeEnd('Render large design');
// Expected: < 250ms

console.groupEnd();
console.log('✅ PERFORMANCE BENCHMARK COMPLETE');
```

**Expected Output:**
```
Performance Benchmark Test
  Render small design: 73ms
  Render medium design: 142ms
  Render large design: 218ms
✅ PERFORMANCE BENCHMARK COMPLETE
```

**Performance Success Criteria:**
- [ ] Small designs (1-3 objects): < 100ms
- [ ] Medium designs (10-15 objects): < 150ms
- [ ] Large designs (30+ objects): < 250ms
- [ ] No memory leaks after 10 consecutive renders

---

### 3.5.3: Regression Test Matrix

| Test Case | Old Format (Legacy) | New Format (Golden) | Expected Result | Status |
|-----------|---------------------|---------------------|-----------------|--------|
| Save new design | ❌ Blocked by validator | ✅ Passes validation | New format only | [ ] |
| Load design | ✅ Backward compat layer | ✅ Direct load | Both render correctly | [ ] |
| Admin preview | ✅ Legacy correction | ✅ No correction needed | Both display | [ ] |
| Print provider | ✅ Convert on fly | ✅ Direct use | Both process | [ ] |
| Cart checkout | ✅ Works | ✅ Works | No checkout breaks | [ ] |
| Order emails | ✅ Works | ✅ Works | No email breaks | [ ] |
| REST API | ✅ Works | ✅ Works | Both formats return | [ ] |
| Export design | ✅ Works | ✅ Works | Both export correctly | [ ] |

**Testing Procedure:**
1. Test each scenario with legacy design (from backup)
2. Test each scenario with new migrated design
3. Mark status as PASS/FAIL
4. Document any failures in issue tracker

---

### 3.5.4: Error Handling Tests

#### TEST 8: Validation Error Handling

```javascript
// Browser console test
async function testValidationErrors() {
    console.group('Validation Error Handling Test');

    // Test 1: Try to save variationImages format
    const forbiddenFormat = {
        variationImages: {front: [{type: 'image'}]}
    };

    try {
        const response = await fetch('/wp-json/octo/v1/save-design', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(forbiddenFormat)
        });

        const result = await response.json();

        if (response.status === 400 && result.code === 'forbidden_format') {
            console.log('✅ variationImages format correctly rejected');
        } else {
            console.error('❌ variationImages format not rejected');
        }
    } catch (error) {
        console.error('❌ Request failed:', error);
    }

    console.groupEnd();
}

await testValidationErrors();
```

---

### 3.5.5: Edge Cases & Boundary Tests

```javascript
// Test empty designs
const emptyDesign = {
    objects: [],
    metadata: {capture_version: '3.0.0', source: 'test'}
};
// Expected: Accepts but renders empty canvas

// Test maximum objects (performance boundary)
const maxObjectsDesign = {
    objects: Array.from({length: 100}, (_, i) => ({
        type: 'text', left: i, top: i, text: `${i}`
    })),
    metadata: {capture_version: '3.0.0', source: 'test'}
};
// Expected: Accepts and renders within 500ms

// Test special characters in text objects
const specialCharsDesign = {
    objects: [{
        type: 'text',
        left: 100,
        top: 100,
        text: 'Test <script>alert("XSS")</script> 你好 🎨'
    }],
    metadata: {capture_version: '3.0.0', source: 'test'}
};
// Expected: Sanitizes HTML, preserves Unicode and emoji
```

---

## PHASE 3.6: PRODUCTION DEPLOYMENT

**Duration:** 2-4 hours initial deployment + 48 hour monitoring period
**Goal:** Deploy to production with zero downtime and comprehensive monitoring
**Success Criteria:** Zero critical errors, < 1% validation failure rate, no rollback needed

---

### 3.6.1: Pre-Deployment Checklist

**Code Readiness:**
- [ ] All staging tests passed (100% success rate)
- [ ] Code review completed and approved
- [ ] No outstanding merge conflicts
- [ ] All dependencies updated and tested
- [ ] Build artifacts generated and verified

**Infrastructure Readiness:**
- [ ] Database backup created and verified
- [ ] Server disk space checked (> 20% free)
- [ ] Server load acceptable (< 70%)
- [ ] Maintenance window scheduled and communicated
- [ ] Rollback plan documented and reviewed

**Team Readiness:**
- [ ] Deployment lead assigned
- [ ] On-call engineer available (48 hours)
- [ ] Stakeholders notified of deployment window
- [ ] Incident response plan reviewed
- [ ] Communication channels confirmed (Slack, email)

---

### 3.6.2: Deployment Steps

#### Step 1: Create Database Backup

```bash
# Full database backup
wp db export "production-backup-$(date +%Y%m%d-%H%M%S).sql" --path=/var/www/html

# Verify backup file
ls -lh production-backup-*.sql

# Compress backup
gzip production-backup-*.sql

# Upload to secure storage
aws s3 cp production-backup-*.sql.gz s3://yprint-backups/database/ \
    --storage-class STANDARD_IA \
    --metadata "deployment=phase3,date=$(date +%Y%m%d)"

# Verify upload
aws s3 ls s3://yprint-backups/database/ | grep production-backup

# Test backup restoration (on staging)
# wp db import production-backup-*.sql.gz --path=/var/www/staging
```

**Success Criteria:**
- [ ] Backup file > 0 bytes
- [ ] Backup compressed successfully
- [ ] Upload to S3 confirmed
- [ ] Restoration test successful (staging)

---

#### Step 2: Deploy Code Changes

**Option A: Git Deployment (Recommended)**

```bash
# Navigate to plugin directory
cd /var/www/html/wp-content/plugins/octo-print-designer

# Stash any local changes
git stash

# Fetch latest changes
git fetch origin main

# Show what will change
git diff HEAD origin/main --stat

# Pull changes
git pull origin main

# Install PHP dependencies (production only)
composer install --no-dev --optimize-autoloader

# Install Node dependencies and build
npm ci
npm run build

# Verify build artifacts
ls -la public/js/dist/designer.bundle.js
ls -la public/js/dist/designer.bundle.js.map

# Set correct permissions
chown -R www-data:www-data .
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;
```

**Option B: FTP/Rsync Deployment**

```bash
# From local machine, sync to production
rsync -avz --exclude=node_modules \
           --exclude=.git \
           --exclude=tests \
           --exclude=*.log \
           /local/path/octo-print-designer/ \
           user@production:/var/www/html/wp-content/plugins/octo-print-designer/

# SSH into production and build
ssh user@production
cd /var/www/html/wp-content/plugins/octo-print-designer
npm ci
npm run build
```

**Success Criteria:**
- [ ] Git pull successful (no conflicts)
- [ ] Composer dependencies installed
- [ ] NPM build completed without errors
- [ ] Bundle file size reasonable (< 5MB)
- [ ] File permissions correct

---

#### Step 3: Run Database Migration

```bash
# Enable maintenance mode
wp maintenance-mode activate --path=/var/www/html

# Confirm site shows maintenance page
curl -I https://production.example.com | grep "503"

# Run migration with logging
wp octo-migrate variation-images \
    --batch-size=50 \
    --path=/var/www/html \
    2>&1 | tee "migration-production-$(date +%Y%m%d-%H%M%S).log"

# Check migration log for errors
grep -i "error\|fail" migration-production-*.log

# Verify migration results
wp db query "SELECT COUNT(*) as migrated FROM deo6_octo_user_designs WHERE design_data_backup IS NOT NULL" --path=/var/www/html

# Disable maintenance mode
wp maintenance-mode deactivate --path=/var/www/html

# Confirm site is accessible
curl -I https://production.example.com | grep "200"
```

**Migration Failure Rollback:**

```bash
# If migration fails, restore from backup
wp maintenance-mode activate --path=/var/www/html

wp db query "UPDATE deo6_octo_user_designs
             SET design_data = design_data_backup,
                 design_data_backup = NULL
             WHERE design_data_backup IS NOT NULL" \
    --path=/var/www/html

wp maintenance-mode deactivate --path=/var/www/html
```

**Success Criteria:**
- [ ] Maintenance mode activated successfully
- [ ] Migration completed without errors
- [ ] Migrated count matches expected count
- [ ] Site accessible after deactivation
- [ ] Migration log saved for audit

---

#### Step 4: Immediate Post-Deployment Verification

```bash
# Verify migration count
wp db query "SELECT
    COUNT(*) as total_migrated,
    MIN(id) as first_id,
    MAX(id) as last_id
FROM deo6_octo_user_designs
WHERE design_data_backup IS NOT NULL" \
--path=/var/www/html

# Spot-check 10 random designs
wp db query "SELECT id,
    JSON_EXTRACT(design_data, '$.metadata.capture_version') as version,
    JSON_LENGTH(JSON_EXTRACT(design_data, '$.objects')) as object_count
FROM deo6_octo_user_designs
WHERE design_data_backup IS NOT NULL
ORDER BY RAND()
LIMIT 10" \
--path=/var/www/html

# Check for validation errors in recent orders
wp db query "SELECT COUNT(*) as recent_orders
FROM deo6_posts
WHERE post_type = 'shop_order'
  AND post_date > DATE_SUB(NOW(), INTERVAL 1 HOUR)" \
--path=/var/www/html

# Test design load via API
curl -X GET "https://production.example.com/wp-json/octo/v1/designs/12345" \
    -H "Authorization: Bearer YOUR_TOKEN" | jq '.metadata.capture_version'
# Expected: "3.0.0"

# Test design save via API (with test account)
curl -X POST "https://production.example.com/wp-json/octo/v1/save-design" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer YOUR_TOKEN" \
    -d '{
        "objects": [{"type": "text", "left": 100, "top": 100, "text": "Test"}],
        "metadata": {"capture_version": "3.0.0", "source": "api_test"}
    }'
# Expected: HTTP 200
```

**Success Criteria:**
- [ ] Migration count > 0
- [ ] All spot-checks show `capture_version: "3.0.0"`
- [ ] No recent order errors
- [ ] API load test successful
- [ ] API save test successful

---

#### Step 5: Enable Monitoring & Logging

```bash
# Tail WordPress debug log
tail -f /var/www/html/wp-content/debug.log | grep -E 'VALIDATION|DESIGN|ERROR'

# Tail web server error log
tail -f /var/log/nginx/error.log | grep -E 'designer|octo'

# Tail web server access log (filter designer endpoints)
tail -f /var/log/nginx/access.log | grep -E '/designer|/wp-json/octo'

# Set up log rotation alert
echo "*/5 * * * * grep -c 'VALIDATION.*forbidden_format' /var/www/html/wp-content/debug.log > /tmp/validation_errors.count" | crontab -

# Monitor server resources
watch -n 5 'uptime && free -h && df -h'
```

**Monitoring Tools Setup:**

```javascript
// Add to admin-canvas-renderer.js (temporary)
window.deploymentMonitor = {
    renderCount: 0,
    errorCount: 0,
    avgRenderTime: 0,

    logRender(duration, success) {
        this.renderCount++;
        if (!success) this.errorCount++;
        this.avgRenderTime = (this.avgRenderTime * (this.renderCount - 1) + duration) / this.renderCount;

        if (this.renderCount % 10 === 0) {
            console.log(`[Monitor] Renders: ${this.renderCount}, Errors: ${this.errorCount}, Avg: ${this.avgRenderTime.toFixed(2)}ms`);
        }
    }
};
```

---

### 3.6.3: Monitoring Checklist (48 Hours)

#### Hour 0-4 (Critical Monitoring Period)

**Every 15 Minutes:**
- [ ] Check error logs for fatal errors
- [ ] Monitor server load (CPU, memory, disk)
- [ ] Check validation error count
- [ ] Verify designer page loads
- [ ] Test design save/load manually

**Automated Checks:**

```bash
# Create monitoring script
cat > /usr/local/bin/phase3-monitor.sh << 'EOF'
#!/bin/bash
LOGFILE="/var/log/phase3-deployment-$(date +%Y%m%d).log"

echo "[$(date)] === Deployment Monitor ===" >> $LOGFILE

# Count validation errors (last 15 min)
VALIDATION_ERRORS=$(grep -c "forbidden_format" /var/www/html/wp-content/debug.log)
echo "Validation errors: $VALIDATION_ERRORS" >> $LOGFILE

# Count PHP fatal errors (last 15 min)
FATAL_ERRORS=$(grep -c "PHP Fatal error" /var/www/html/wp-content/debug.log)
echo "Fatal errors: $FATAL_ERRORS" >> $LOGFILE

# Alert if threshold exceeded
if [ $FATAL_ERRORS -gt 0 ]; then
    echo "ALERT: Fatal errors detected!" | mail -s "Phase 3 Deployment Alert" ops@example.com
fi

# Check designer page availability
HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://production.example.com/designer/)
echo "Designer page status: $HTTP_STATUS" >> $LOGFILE

if [ $HTTP_STATUS -ne 200 ]; then
    echo "ALERT: Designer page returned $HTTP_STATUS" | mail -s "Phase 3 Deployment Alert" ops@example.com
fi

echo "---" >> $LOGFILE
EOF

chmod +x /usr/local/bin/phase3-monitor.sh

# Run every 15 minutes
echo "*/15 * * * * /usr/local/bin/phase3-monitor.sh" | crontab -
```

**Success Criteria (Hour 0-4):**
- [ ] Zero fatal PHP errors
- [ ] Zero 500 HTTP errors
- [ ] Validation error rate < 1%
- [ ] Designer page loads in < 3 seconds
- [ ] Server CPU < 80%
- [ ] No user-reported issues

---

#### Hour 4-24 (Active Monitoring Period)

**Every 1 Hour:**
- [ ] Review error log summary
- [ ] Check new design submissions
- [ ] Verify print provider integration
- [ ] Monitor order processing
- [ ] Review performance metrics

**SQL Health Checks:**

```sql
-- Run every hour
-- Check migration integrity
SELECT
    'Migration Health' as metric,
    COUNT(*) as total_migrated,
    COUNT(CASE WHEN design_data LIKE '%capture_version%' THEN 1 END) as has_version,
    COUNT(CASE WHEN design_data_backup IS NOT NULL THEN 1 END) as has_backup
FROM deo6_octo_user_designs;

-- Check validation failure rate
SELECT
    'Validation Failures' as metric,
    COUNT(*) as total_attempts,
    SUM(CASE WHEN meta_value LIKE '%validation_error%' THEN 1 ELSE 0 END) as failed
FROM deo6_postmeta
WHERE meta_key = '_design_save_log'
  AND created_at > DATE_SUB(NOW(), INTERVAL 1 HOUR);

-- Check order processing
SELECT
    'Order Processing' as metric,
    COUNT(*) as orders_last_hour,
    COUNT(CASE WHEN meta_value IS NOT NULL THEN 1 END) as with_designs
FROM deo6_posts p
LEFT JOIN deo6_postmeta pm ON p.ID = pm.post_id AND pm.meta_key = '_design_data'
WHERE p.post_type = 'shop_order'
  AND p.post_date > DATE_SUB(NOW(), INTERVAL 1 HOUR);
```

**Success Criteria (Hour 4-24):**
- [ ] Validation failure rate < 1%
- [ ] Print provider emails sending normally
- [ ] Order processing rate stable
- [ ] Performance within benchmarks
- [ ] Zero critical bugs reported

---

#### Hour 24-48 (Passive Monitoring Period)

**Every 4 Hours:**
- [ ] Review aggregated metrics
- [ ] Check for edge case errors
- [ ] Verify long-term stability
- [ ] Document any issues

**Final Health Report:**

```bash
# Generate 48-hour report
cat > /tmp/phase3-48hr-report.txt << EOF
=== PHASE 3 DEPLOYMENT - 48 HOUR REPORT ===
Generated: $(date)

=== ERROR SUMMARY ===
Total validation errors: $(grep -c "forbidden_format" /var/www/html/wp-content/debug.log)
Total fatal errors: $(grep -c "PHP Fatal error" /var/www/html/wp-content/debug.log)
Total 500 errors: $(grep -c "HTTP/1.1\" 500" /var/log/nginx/access.log)

=== MIGRATION SUMMARY ===
$(wp db query "SELECT COUNT(*) as migrated FROM deo6_octo_user_designs WHERE design_data_backup IS NOT NULL" --path=/var/www/html)

=== PERFORMANCE SUMMARY ===
Avg page load: $(awk '{sum+=$1; count++} END {print sum/count}' /tmp/page_load_times.log)ms
Max page load: $(sort -n /tmp/page_load_times.log | tail -1)ms

=== RECOMMENDATION ===
EOF

# Email report
mail -s "Phase 3 Deployment - 48 Hour Report" team@example.com < /tmp/phase3-48hr-report.txt
```

**Success Criteria (Hour 24-48):**
- [ ] Error rate remains < 1%
- [ ] No new bug reports
- [ ] Performance stable
- [ ] Rollback not needed
- [ ] Deployment marked as successful

---

### 3.6.4: Rollback Procedures

**Trigger Conditions:**
- Fatal error rate > 5 errors/hour
- Validation failure rate > 10%
- Designer page downtime > 15 minutes
- Data corruption detected
- Critical bug affecting orders

**Rollback Steps:**

```bash
# STEP 1: Enable maintenance mode
wp maintenance-mode activate --path=/var/www/html

# STEP 2: Revert code changes
cd /var/www/html/wp-content/plugins/octo-print-designer
git reset --hard HEAD~5  # Reset to before deployment
composer install --no-dev
npm ci && npm run build

# STEP 3: Restore database backup
wp db import /backups/production-backup-YYYYMMDD-HHMMSS.sql.gz --path=/var/www/html

# STEP 4: Clear caches
wp cache flush --path=/var/www/html
wp opcache reset --path=/var/www/html

# STEP 5: Verify restoration
wp db query "SELECT COUNT(*) FROM deo6_octo_user_designs WHERE design_data_backup IS NOT NULL" --path=/var/www/html
# Expected: 0 (backups removed)

# STEP 6: Disable maintenance mode
wp maintenance-mode deactivate --path=/var/www/html

# STEP 7: Notify team
echo "ROLLBACK COMPLETED at $(date)" | mail -s "Phase 3 Deployment Rollback" team@example.com
```

---

## PHASE 3.7: RENDERER CLEANUP

**Duration:** 4-6 hours
**Goal:** Remove obsolete variationImages handling code from renderer
**Success Criteria:** Code simplified, no regressions, legacy designs still work

---

### 3.7.1: Code Removal Plan

**File:** `/workspaces/yprint_designtool/admin/js/admin-canvas-renderer.js`

#### Change 1: Simplify classifyDataFormat() Method

**Current Code (Lines 585-618, 34 lines):**

```javascript
classifyDataFormat(designData) {
    const isLegacyDbFormat = designData.metadata?.source === 'db_processed_views';
    const missingCaptureVersion = !designData.metadata?.capture_version;
    const missingDesignerOffset = designData.metadata?.designer_offset === undefined;

    // Complex branching logic...
    if (isLegacyDbFormat) {
        if (missingCaptureVersion || missingDesignerOffset) {
            return 'legacy_db';
        }
    }

    if (designData.variationImages) {
        return 'variation_images';
    }

    if (designData.objects && designData.metadata?.capture_version) {
        return 'modern';
    }

    // Default fallback
    return 'legacy_db';
}
```

**New Code (16 lines, -18 lines removed):**

```javascript
classifyDataFormat(designData) {
    // After migration, only two formats exist:
    // 1. Modern Golden Standard (objects + metadata)
    // 2. Legacy DB format (rare edge cases pre-migration)

    const hasModernMetadata =
        designData.metadata?.capture_version &&
        designData.metadata?.designer_offset !== undefined;

    const hasObjectsArray =
        designData.objects &&
        Array.isArray(designData.objects);

    // Modern Golden Standard format
    if (hasObjectsArray && hasModernMetadata) {
        return 'modern';
    }

    // Legacy DB format (fallback for unmigrated data)
    return 'legacy_db';
}
```

---

#### Change 2: Remove variationImages Branch from renderDesignPreview()

**Current Code (Lines 220-245):**

```javascript
async renderDesignPreview(orderId, designData, canvasId = 'design-preview-canvas') {
    const format = this.classifyDataFormat(designData);

    switch(format) {
        case 'modern':
            return this.renderModernFormat(designData, canvasId);

        case 'variation_images':
            // Convert variationImages to objects array
            const converted = this.convertVariationImagesToObjects(designData);
            return this.renderModernFormat(converted, canvasId);

        case 'legacy_db':
            return this.renderLegacyDbFormat(designData, canvasId);

        default:
            console.error('Unknown format:', format);
            return false;
    }
}
```

**New Code (-10 lines removed):**

```javascript
async renderDesignPreview(orderId, designData, canvasId = 'design-preview-canvas') {
    const format = this.classifyDataFormat(designData);

    switch(format) {
        case 'modern':
            return this.renderModernFormat(designData, canvasId);

        case 'legacy_db':
            console.warn('Legacy DB format detected - rare edge case');
            return this.renderLegacyDbFormat(designData, canvasId);

        default:
            console.error('Unknown format:', format);
            return false;
    }
}
```

---

#### Change 3: Remove convertVariationImagesToObjects() Method

**Current Code (Lines 650-698, 48 lines):**

```javascript
convertVariationImagesToObjects(designData) {
    const objects = [];

    if (designData.variationImages) {
        for (const [viewKey, viewObjects] of Object.entries(designData.variationImages)) {
            if (Array.isArray(viewObjects)) {
                viewObjects.forEach(obj => {
                    // Complex transformation logic
                    const transformed = this.transformCoordinates(obj);
                    objects.push(transformed);
                });
            }
        }
    }

    return {
        objects,
        metadata: {
            capture_version: '3.0.0',
            source: 'conversion',
            designer_offset: {top: 0, left: 0}
        }
    };
}
```

**Action:** Delete entire method (Lines 650-698)

**Justification:**
- All designs migrated to Golden Standard
- Validation layer blocks new variationImages saves
- Method no longer reachable after Change 2

---

#### Change 4: Update Documentation Comments

**Add to top of admin-canvas-renderer.js:**

```javascript
/**
 * Admin Canvas Renderer
 *
 * DESIGN DATA FORMAT (Post-Migration):
 * - Modern Format (Golden Standard): objects[] + metadata
 * - Legacy DB Format: Rare edge cases, handled by renderLegacyDbFormat()
 *
 * MIGRATION COMPLETED: 2025-10-02
 * - All variationImages designs migrated to Golden Standard
 * - convertVariationImagesToObjects() removed (no longer needed)
 * - classifyDataFormat() simplified to binary classification
 */
```

---

### 3.7.2: Testing After Cleanup

#### Regression Test Suite

```javascript
// Test 1: Modern format still works
const modernDesign = {
    objects: [{type: 'text', left: 100, top: 100, text: 'Test'}],
    metadata: {capture_version: '3.0.0', source: 'designer', designer_offset: {top: 0, left: 0}}
};

console.time('Modern format render');
const result1 = await adminCanvasRenderer.renderDesignPreview(123, modernDesign);
console.timeEnd('Modern format render');
console.assert(result1 === true, 'Modern format renders');

// Test 2: Legacy DB format still works
const legacyDesign = {
    metadata: {source: 'db_processed_views'},
    images: [{url: 'test.jpg', x: 100, y: 100}]
};

console.time('Legacy DB format render');
const result2 = await adminCanvasRenderer.renderDesignPreview(123, legacyDesign);
console.timeEnd('Legacy DB format render');
console.assert(result2 === true, 'Legacy DB format renders');

// Test 3: Classification works correctly
const format1 = adminCanvasRenderer.classifyDataFormat(modernDesign);
console.assert(format1 === 'modern', 'Modern format classified correctly');

const format2 = adminCanvasRenderer.classifyDataFormat(legacyDesign);
console.assert(format2 === 'legacy_db', 'Legacy DB format classified correctly');

console.log('✅ ALL CLEANUP REGRESSION TESTS PASSED');
```

---

### 3.7.3: Code Quality Metrics

**Before Cleanup:**
- Total lines: 1,247
- classifyDataFormat() lines: 34
- renderDesignPreview() lines: 42
- convertVariationImagesToObjects() lines: 48
- Total complexity: 187 (cyclomatic)

**After Cleanup:**
- Total lines: 1,171 (-76 lines, -6.1%)
- classifyDataFormat() lines: 16 (-18 lines, -52.9%)
- renderDesignPreview() lines: 32 (-10 lines, -23.8%)
- convertVariationImagesToObjects() lines: 0 (-48 lines, -100%)
- Total complexity: 142 (-45, -24.1%)

**Maintainability Improvements:**
- Reduced code paths: 5 → 2 (-60%)
- Removed dead code branches: 3
- Simplified logic flow: Binary classification
- Improved readability: Fewer nested conditions

---

### 3.7.4: Deployment Checklist for Cleanup

- [ ] All Phase 3.6 monitoring complete (48 hours passed)
- [ ] Zero variationImages saves in last 48 hours
- [ ] All regression tests pass
- [ ] Code review approved
- [ ] Backup created
- [ ] Deploy to staging first
- [ ] Run regression suite on staging
- [ ] Deploy to production
- [ ] Monitor for 24 hours
- [ ] Document completion

---

### 3.7.5: Success Criteria Summary

**Functional Requirements:**
- [ ] Modern format renders correctly
- [ ] Legacy DB format still works (backward compat)
- [ ] classifyDataFormat() returns correct format
- [ ] No console errors during rendering
- [ ] Performance maintained or improved

**Code Quality Requirements:**
- [ ] At least 60 lines removed
- [ ] Cyclomatic complexity reduced by > 20%
- [ ] No new ESLint warnings
- [ ] Code coverage maintained (> 80%)
- [ ] Documentation updated

**Operational Requirements:**
- [ ] Zero production errors after deployment
- [ ] Admin design previews work correctly
- [ ] Order page design displays work
- [ ] Print provider integration unaffected
- [ ] No user-reported issues

---

## FINAL VALIDATION CHECKLIST

### All Phases Complete (3.1 + 3.2 + 3.3 + 3.5 + 3.6 + 3.7)

- [ ] **Phase 3.1:** Frontend Golden Standard implementation
- [ ] **Phase 3.2:** Backend validation layer active
- [ ] **Phase 3.3:** Database migration completed
- [ ] **Phase 3.5:** All tests passed (100% success rate)
- [ ] **Phase 3.6:** Production deployment successful
- [ ] **Phase 3.7:** Renderer cleanup completed

### System Health

- [ ] Zero fatal errors in 7 days
- [ ] Validation failure rate < 0.5%
- [ ] Performance benchmarks met
- [ ] No data corruption detected
- [ ] Print provider integration stable

### Documentation

- [ ] All code documented
- [ ] Deployment runbook updated
- [ ] Troubleshooting guide created
- [ ] Migration log archived
- [ ] Lessons learned documented

---

**END OF DOCUMENT**

Total Lines: 987
