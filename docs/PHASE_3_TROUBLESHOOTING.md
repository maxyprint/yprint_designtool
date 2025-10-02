# PHASE 3 TROUBLESHOOTING GUIDE

**Version:** 1.0.0
**Date:** 2025-10-02
**Phase:** Source-Level Data Format Correction

---

## TABLE OF CONTENTS

1. [Quick Diagnosis](#quick-diagnosis)
2. [Common Issues](#common-issues)
3. [Error Code Reference](#error-code-reference)
4. [Log Analysis](#log-analysis)
5. [Debugging Procedures](#debugging-procedures)
6. [Rollback Procedures](#rollback-procedures)
7. [Performance Issues](#performance-issues)
8. [Migration Issues](#migration-issues)

---

## QUICK DIAGNOSIS

### Issue Decision Tree

```
Is the problem with NEW designs or OLD designs?
│
├─ NEW DESIGNS
│  │
│  ├─ Design not saving
│  │  └─ See: "Design Save Failures"
│  │
│  ├─ Blank canvas on preview
│  │  └─ See: "Blank Canvas Issues"
│  │
│  └─ Validation errors
│     └─ See: "Validation Failures"
│
└─ OLD DESIGNS
   │
   ├─ Not rendering correctly
   │  └─ See: "Legacy Format Rendering"
   │
   └─ Migration failures
      └─ See: "Migration Issues"
```

---

## COMMON ISSUES

### 1. Blank Canvas on Order Preview

**Symptom:**
- Order is created successfully
- Design preview shows blank canvas
- No images or elements visible
- Console shows "No objects to render" error

**Quick Check:**

```bash
# 1. View browser console (F12)
# Look for: "No objects to render" or "Empty objects array"

# 2. Check design data format
wp post meta get <ORDER_ID> _design_data --path=/var/www/html | jq '.objects'
# Expected: Array of objects
# Problem: If returns null, empty, or doesn't exist

# 3. Check for variationImages format
wp post meta get <ORDER_ID> _design_data --path=/var/www/html | jq '.variationImages'
# If this returns data, design is in old format
```

**Likely Causes:**

1. **Design still in variationImages format**
   - Frontend not deployed
   - Browser cache not cleared
   - User has old cached JavaScript

2. **Migration not run yet**
   - Design created before Phase 3
   - Migration script not executed
   - Migration failed for this design

3. **Normalization not working**
   - Input normalizer disabled
   - Format detection failed
   - Conversion logic error

**Solution 1: Frontend Not Deployed**

```bash
# Verify frontend has Phase 3 code
grep -n "capture_version" public/js/dist/designer.bundle.js
# Expected: Should find references

# If not found, deploy frontend
npm run build
wp cache flush --path=/var/www/html

# Clear browser cache
# Chrome: Ctrl+Shift+Delete > Cached images and files
# Firefox: Ctrl+Shift+Delete > Cache
```

**Solution 2: Old Design Needs Migration**

```bash
# Check if design is in variationImages format
wp post meta get <ORDER_ID> _design_data --path=/var/www/html | grep "variationImages"

# If yes, manually trigger conversion
wp db query "SELECT post_id, meta_value FROM deo6_postmeta WHERE post_id = <ORDER_ID> AND meta_key = '_design_data'" --path=/var/www/html

# Run migration for this specific design
wp octo-migrate variation-images --order-id=<ORDER_ID> --path=/var/www/html
```

**Solution 3: Enable Input Normalizer**

```javascript
// In admin-canvas-renderer.js constructor
// Ensure this exists:
this.inputNormalizer = {
    enabled: true,  // Should be true
    logNormalization: true,
    validateNormalization: true
};

// Check console for normalization logs
// Should see: "NORMALIZATION: Processing..."
```

---

### 2. High Validation Failure Rate

**Symptom:**
- Validation statistics show high failure rate (> 5%)
- Orders failing to be created
- Error messages about invalid data format
- Customer complaints about checkout failures

**Quick Check:**

```bash
# Check validation statistics
wp db query "SELECT option_value FROM deo6_options WHERE option_name = 'design_validation_stats'" --path=/var/www/html

# Check recent validation failures
grep "VALIDATION.*FAILED" /var/log/wordpress/debug.log | tail -20

# Count failures in last hour
grep "VALIDATION.*FAILED" /var/log/wordpress/debug.log | grep "$(date -d '1 hour ago' '+%Y-%m-%d %H')" | wc -l
```

**Likely Causes:**

1. **Frontend still outputting old format**
   - Code deployment incomplete
   - Cache not cleared
   - Build failed

2. **Validation rules too strict**
   - Edge cases not handled
   - Valid data being rejected
   - Schema definition mismatch

3. **Mixed format data**
   - Partial migration
   - Data corruption
   - Race condition

**Solution 1: Verify Frontend Output**

```javascript
// Open browser console
// Create a new design
// Check console output for collectDesignState
// Should see:
{
  objects: [...],
  metadata: {
    capture_version: "3.0.0",
    format_schema_version: "golden_standard_v1"
  }
}

// If missing, frontend not deployed correctly
```

**Solution 2: Temporarily Relax Validation**

```bash
# Edit wp-config.php
# Add this line:
echo "define('DISABLE_DESIGN_VALIDATION', true);" >> wp-config.php

# This bypasses validation temporarily
# Reload PHP-FPM
sudo systemctl reload php7.4-fpm

# Monitor if issue resolves
# This indicates validation is the problem
```

**Solution 3: Analyze Failure Patterns**

```bash
# Extract failure reasons
grep "VALIDATION FAILED" /var/log/wordpress/debug.log | grep -oP 'Code: \K\w+' | sort | uniq -c | sort -rn

# Most common failure codes:
# E001: missing_objects
# E002: missing_capture_version
# E003: nested_transform
# E004: invalid_metadata

# Check specific error details
grep "Code: E001" /var/log/wordpress/debug.log | tail -5
```

---

### 3. Design Save Failures

**Symptom:**
- "Save Design" button doesn't work
- No response when clicking save
- Error message: "Failed to save design"
- AJAX request fails

**Quick Check:**

```bash
# Check browser console (F12)
# Look for: AJAX errors, 500 errors, or JavaScript exceptions

# Check WordPress error log
tail -50 /var/log/wordpress/debug.log | grep -i "error"

# Check AJAX endpoint
curl -X POST https://yoursite.com/wp-admin/admin-ajax.php \
  -d "action=save_design_data" \
  -d "design_data={}" \
  -H "Cookie: wordpress_logged_in_xxxxx"
# Expected: 200 OK
```

**Likely Causes:**

1. **JavaScript error preventing save**
   - Syntax error in collectDesignState
   - Missing dependency
   - Version mismatch

2. **Backend validation rejecting data**
   - Strict mode enabled
   - Invalid format
   - Missing required fields

3. **Database connection issue**
   - Max connections reached
   - Timeout
   - Permissions issue

**Solution 1: Check JavaScript Errors**

```javascript
// Browser Console (F12)
// Look for red errors

// Common errors:
// - "collectDesignState is not defined"
// - "Cannot read property 'objects' of undefined"
// - "JSON.stringify failed"

// Fix: Rebuild frontend
npm run build
wp cache flush
```

**Solution 2: Check Validation Mode**

```bash
# Verify validation mode
grep "validation_mode" includes/class-octo-print-designer-wc-integration.php

# If in strict mode and causing issues:
# Temporarily switch to log_only
# Edit line ~2570:
# $validation_mode = 'log_only';

# Reload PHP
sudo systemctl reload php7.4-fpm
```

**Solution 3: Check Database Connectivity**

```bash
# Test database connection
wp db check --path=/var/www/html

# Check active connections
wp db query "SHOW PROCESSLIST" --path=/var/www/html | wc -l

# Check max connections
wp db query "SHOW VARIABLES LIKE 'max_connections'" --path=/var/www/html

# If at limit, increase in my.cnf or kill idle connections
```

---

### 4. Legacy Format Rendering Issues

**Symptom:**
- Old designs (pre-Phase 3) not rendering correctly
- Elements misaligned or wrong size
- Designer offset wrong
- Scaling incorrect

**Quick Check:**

```bash
# Check if design has capture_version
wp post meta get <ORDER_ID> _design_data --path=/var/www/html | grep "capture_version"

# If not found, it's a legacy design

# Check if legacy correction is being applied
tail -f /var/log/wordpress/debug.log | grep "LEGACY DATA CORRECTION"
# Should see: "Legacy correction applied" or similar
```

**Likely Causes:**

1. **Legacy correction not applied**
   - `applyLegacyDataCorrection()` not running
   - Format detection failing
   - Correction disabled

2. **Incorrect correction values**
   - deltaY not 80px
   - scaleFactor not 1.23
   - Wrong heuristic

3. **Input normalizer conflict**
   - Multiple corrections applied
   - Correction layer syndrome
   - Transformation stacking

**Solution 1: Verify Legacy Correction**

```javascript
// In admin-canvas-renderer.js
// Check that applyLegacyDataCorrection exists
// Around line 2680

// Check console for:
// "LEGACY DATA CORRECTION: Applied"
// "Method: db_processed_views"
// "Confidence: 1.0"

// If not appearing, check function is called in renderDesign
```

**Solution 2: Manual Correction Test**

```bash
# Get design data
wp post meta get <ORDER_ID> _design_data --path=/var/www/html > /tmp/design.json

# Manually apply correction
cat /tmp/design.json | jq '
  .objects[] |= (
    .top += 80 |
    .scaleX *= 1.23 |
    .scaleY *= 1.23
  )
'

# If this fixes rendering, correction logic is not running
```

**Solution 3: Run Migration**

```bash
# Migrate specific design to Golden Standard
wp octo-migrate variation-images --order-id=<ORDER_ID> --path=/var/www/html

# This converts legacy format to Golden Standard
# Eliminates need for runtime correction
```

---

### 5. Performance Degradation

**Symptom:**
- Slow page load times
- High server CPU/memory usage
- Timeout errors
- Slow admin preview rendering

**Quick Check:**

```bash
# Check server load
uptime
# Load average should be < number of CPU cores

# Check memory usage
free -h
# Available should be > 20% of total

# Check PHP-FPM status
sudo systemctl status php7.4-fpm

# Check slow queries
wp db query "SHOW PROCESSLIST" --path=/var/www/html | grep "SELECT"
```

**Likely Causes:**

1. **Inefficient validation logic**
   - Complex JSON parsing
   - No caching
   - Running on every request

2. **Database query performance**
   - Missing indexes
   - Large meta_value fields
   - No query optimization

3. **Memory leaks**
   - Normalization cache growing
   - Not clearing old data
   - Accumulating logs

**Solution 1: Enable Validation Caching**

```php
// In class-octo-print-designer-wc-integration.php
// Add caching layer

private $validation_cache = array();

public function save_design_data_to_order($order_id, $design_data) {
    // Check cache first
    $cache_key = md5(json_encode($design_data));
    if (isset($this->validation_cache[$cache_key])) {
        $validation = $this->validation_cache[$cache_key];
    } else {
        $validation = $this->validate_design_data_schema($design_data, 'log_only');
        $this->validation_cache[$cache_key] = $validation;
    }
    // ... rest of logic
}
```

**Solution 2: Optimize Database Queries**

```bash
# Add index on meta_key for faster lookups
wp db query "CREATE INDEX idx_meta_key_design ON deo6_postmeta(meta_key(50)) WHERE meta_key = '_design_data'" --path=/var/www/html

# Check query performance
wp db query "EXPLAIN SELECT * FROM deo6_postmeta WHERE meta_key = '_design_data' LIMIT 10" --path=/var/www/html
```

**Solution 3: Clear Normalization Cache**

```javascript
// In admin-canvas-renderer.js
// Add to renderDesign() at start:

async renderDesign(designData, options = {}) {
    // Clear normalization cache at start of each render
    if (this.inputNormalizer && this.inputNormalizer.normalizedCache) {
        this.inputNormalizer.normalizedCache.clear();
        console.log('Normalization cache cleared');
    }
    // ... rest of rendering
}
```

---

## ERROR CODE REFERENCE

### E001: missing_objects

**Error Message:** "Design data missing required 'objects' array"

**Meaning:** The design data doesn't contain an `objects` array, which is required in Golden Standard format.

**Cause:** Design is likely in old variationImages format or corrupted.

**Fix:**

```bash
# Check design format
wp post meta get <ORDER_ID> _design_data --path=/var/www/html | jq 'keys'

# If you see "variationImages" instead of "objects":
# Run migration
wp octo-migrate variation-images --order-id=<ORDER_ID> --path=/var/www/html

# Or manually convert (emergency)
wp post meta get <ORDER_ID> _design_data --path=/var/www/html | jq '
  {
    objects: [.variationImages[] | .images[]],
    metadata: {
      capture_version: "3.0.0",
      source: "manual_conversion"
    }
  }
' | wp post meta update <ORDER_ID> _design_data --format=json --path=/var/www/html
```

---

### E002: missing_capture_version

**Error Message:** "Design data missing metadata.capture_version"

**Meaning:** The design data doesn't have a `metadata.capture_version` field.

**Cause:** Design created before Phase 3 frontend deployment or frontend not properly deployed.

**Fix:**

```bash
# Check if frontend is deployed
grep "capture_version" public/js/dist/designer.bundle.js
# If not found, redeploy frontend:
npm run build
wp cache flush --path=/var/www/html

# For existing designs, add capture_version
wp post meta get <ORDER_ID> _design_data --path=/var/www/html | jq '.metadata.capture_version = "3.0.0"' | wp post meta update <ORDER_ID> _design_data --format=json --path=/var/www/html
```

---

### E003: nested_transform

**Error Message:** "Coordinates nested in transform object (invalid format)"

**Meaning:** The design has coordinates like `transform.left` instead of flat `left`.

**Cause:** variationImages format not properly converted.

**Fix:**

```bash
# Flatten nested coordinates
wp post meta get <ORDER_ID> _design_data --path=/var/www/html | jq '
  .objects[] |= (
    if .transform then
      .left = .transform.left |
      .top = .transform.top |
      .scaleX = .transform.scaleX |
      .scaleY = .transform.scaleY |
      .angle = .transform.angle |
      del(.transform)
    else . end
  )
' | wp post meta update <ORDER_ID> _design_data --format=json --path=/var/www/html
```

---

### E004: invalid_metadata

**Error Message:** "Design metadata structure invalid or missing required fields"

**Meaning:** The metadata object is malformed or missing.

**Cause:** Partial data corruption or incomplete conversion.

**Fix:**

```bash
# Add valid metadata
wp post meta get <ORDER_ID> _design_data --path=/var/www/html | jq '
  .metadata = {
    capture_version: "3.0.0",
    source: "repair",
    format_schema_version: "golden_standard_v1",
    saved_at: (now | todate)
  }
' | wp post meta update <ORDER_ID> _design_data --format=json --path=/var/www/html
```

---

### E005: invalid_json

**Error Message:** "Design data is not valid JSON"

**Cause:** Data corruption during save or database encoding issue.

**Fix:**

```bash
# Extract and validate JSON
wp post meta get <ORDER_ID> _design_data --path=/var/www/html > /tmp/design.json

# Try to parse
jq '.' /tmp/design.json
# If error, JSON is corrupted

# Attempt repair (remove invalid characters)
sed 's/[^[:print:]]//g' /tmp/design.json | jq '.' > /tmp/design-fixed.json

# Restore
cat /tmp/design-fixed.json | wp post meta update <ORDER_ID> _design_data --format=json --path=/var/www/html
```

---

## LOG ANALYSIS

### Check Validation Statistics

```bash
# Get validation stats
wp db query "SELECT option_value FROM deo6_options WHERE option_name = 'design_validation_stats'" --path=/var/www/html

# Parse JSON output
wp db query "SELECT option_value FROM deo6_options WHERE option_name = 'design_validation_stats'" --path=/var/www/html | jq '.'

# Expected output:
{
  "total_validations": 1523,
  "passed": 1521,
  "failed": 2,
  "success_rate": 99.87,
  "last_failure": "2025-10-02T15:45:00Z",
  "failure_reasons": {
    "E001": 1,
    "E002": 1
  }
}
```

### Find Most Common Errors

```bash
# Extract error codes from logs
grep "VALIDATION FAILED" /var/log/wordpress/debug.log | grep -oP 'Code: \K\w+' | sort | uniq -c | sort -rn

# Example output:
#  45 E001
#  12 E002
#   3 E003

# Get details for most common error
grep "Code: E001" /var/log/wordpress/debug.log | tail -5
```

### Analyze Validation Trends

```bash
# Validation failures by hour (last 24h)
for hour in {0..23}; do
  time=$(date -d "$hour hours ago" '+%Y-%m-%d %H')
  count=$(grep "VALIDATION FAILED" /var/log/wordpress/debug.log | grep "$time" | wc -l)
  echo "$time: $count failures"
done

# Validation success by hour
for hour in {0..23}; do
  time=$(date -d "$hour hours ago" '+%Y-%m-%d %H')
  count=$(grep "VALIDATION.*passed" /var/log/wordpress/debug.log | grep "$time" | wc -l)
  echo "$time: $count successes"
done
```

### Check Design Format Distribution

```bash
# Count Golden Standard designs
wp db query "SELECT COUNT(*) as golden_standard FROM deo6_postmeta WHERE meta_key = '_design_data' AND meta_value LIKE '%capture_version%'" --path=/var/www/html

# Count variationImages designs
wp db query "SELECT COUNT(*) as variation_images FROM deo6_postmeta WHERE meta_key = '_design_data' AND meta_value LIKE '%variationImages%'" --path=/var/www/html

# Count legacy designs
wp db query "SELECT COUNT(*) as total FROM deo6_postmeta WHERE meta_key = '_design_data'" --path=/var/www/html
# Legacy = total - golden_standard - variation_images
```

### Monitor Real-Time Validation

```bash
# Watch validation in real-time
tail -f /var/log/wordpress/debug.log | grep --line-buffered "VALIDATION" | while read line; do
  if echo "$line" | grep -q "passed"; then
    echo -e "\033[0;32m$line\033[0m"  # Green for success
  else
    echo -e "\033[0;31m$line\033[0m"  # Red for failure
  fi
done
```

---

## DEBUGGING PROCEDURES

### Procedure 1: Debug Blank Canvas

**Steps:**

1. **Open browser console** (F12)
2. **Navigate to order page** with blank preview
3. **Look for errors** in console
4. **Check network tab** for failed requests
5. **Get design data:**

```bash
# In browser console:
let orderId = document.querySelector('[data-order-id]').dataset.orderId;
fetch(`/wp-json/wp/v2/orders/${orderId}/meta`)
  .then(r => r.json())
  .then(data => console.log(data._design_data));
```

6. **Analyze data structure:**

```javascript
// In console:
let designData = /* paste data from above */;

// Check format
console.log('Has objects:', !!designData.objects);
console.log('Has variationImages:', !!designData.variationImages);
console.log('Has capture_version:', !!designData.metadata?.capture_version);

// If has objects but empty:
console.log('Objects count:', designData.objects?.length);

// If has variationImages:
console.log('Needs migration');
```

7. **Check if normalizer is running:**

```javascript
// Look for these in console:
// "FORMAT DETECTION: ..."
// "NORMALIZATION: ..."
// "LEGACY DATA CORRECTION: ..."

// If not found, normalizer not running
```

---

### Procedure 2: Debug Validation Failures

**Steps:**

1. **Get validation logs:**

```bash
grep "VALIDATION FAILED" /var/log/wordpress/debug.log | tail -1
```

2. **Extract error details:**

```bash
# Get last validation failure
grep "VALIDATION FAILED" /var/log/wordpress/debug.log | tail -1 | jq '.validation_result'
```

3. **Reproduce validation:**

```bash
# Get the design data that failed
ORDER_ID=$(grep "VALIDATION FAILED" /var/log/wordpress/debug.log | tail -1 | grep -oP 'Order: \K\d+')
wp post meta get $ORDER_ID _design_data --path=/var/www/html > /tmp/failed-design.json
```

4. **Test validation manually:**

```php
// Create test file: test-validation.php
<?php
require_once 'wp-load.php';
$design_data = json_decode(file_get_contents('/tmp/failed-design.json'), true);
$integration = new Octo_Print_Designer_WC_Integration();
$result = $integration->validate_design_data_schema($design_data, 'log_only');
print_r($result);
?>
```

```bash
php test-validation.php
```

5. **Analyze failure reason:**

```bash
# Check which validation failed
cat /tmp/validation-result.json | jq '.errors'

# Common issues:
# - Missing objects array
# - Missing metadata
# - Nested transform coordinates
```

---

### Procedure 3: Debug Performance Issues

**Steps:**

1. **Enable query monitoring:**

```php
// Add to wp-config.php
define('SAVEQUERIES', true);
```

2. **Check slow queries:**

```php
// Add to footer.php or create debug page
<?php
global $wpdb;
echo "<pre>";
foreach ($wpdb->queries as $query) {
    if ($query[1] > 0.05) {  // Queries taking > 50ms
        print_r($query);
    }
}
echo "</pre>";
?>
```

3. **Profile JavaScript:**

```javascript
// In browser console
console.profile('Design Render');
// Trigger design render
console.profileEnd('Design Render');
// Check Performance tab in DevTools
```

4. **Check memory usage:**

```bash
# PHP memory
grep "memory_limit" /etc/php/7.4/fpm/php.ini

# Current usage
wp db query "SHOW STATUS WHERE Variable_name = 'Innodb_buffer_pool_pages_data'" --path=/var/www/html
```

5. **Identify bottleneck:**

```bash
# Check if validation is slow
time wp post meta get <ORDER_ID> _design_data --path=/var/www/html > /dev/null

# Check if rendering is slow
# Measure in browser console
console.time('render');
// Trigger render
console.timeEnd('render');
```

---

## ROLLBACK PROCEDURES

See complete rollback procedures in [PHASE_3_DEPLOYMENT_GUIDE.md](PHASE_3_DEPLOYMENT_GUIDE.md#rollback-procedures)

**Quick Rollback Commands:**

```bash
# Frontend only
cp public/js/dist/designer.bundle.js.backup-* public/js/dist/designer.bundle.js
wp cache flush --path=/var/www/html

# Backend disable
echo "define('DISABLE_DESIGN_VALIDATION', true);" >> wp-config.php
sudo systemctl reload php7.4-fpm

# Complete backend
cp includes/class-octo-print-designer-wc-integration.php.backup-* includes/class-octo-print-designer-wc-integration.php
sudo systemctl reload php7.4-fpm

# Database (EMERGENCY ONLY)
gunzip -c /backups/production/*/backup-prod-*.sql.gz | wp db import - --path=/var/www/html
```

---

## MIGRATION ISSUES

### Issue: Migration Script Fails to Start

**Symptoms:**
- WP-CLI command not found
- "Command not registered" error

**Fix:**

```bash
# Verify WP-CLI command is registered
wp cli has-command octo-migrate --path=/var/www/html

# If not found, check command file exists
ls -la includes/cli/class-design-migration-command.php

# Re-register command
wp cli cmd-dump --path=/var/www/html | grep octo-migrate
```

---

### Issue: Migration Batch Failures

**Symptoms:**
- Some designs fail to migrate
- "Conversion failed" errors
- Partial migration completion

**Fix:**

```bash
# Get failed design IDs
wp octo-migrate variation-images --dry-run --verbose --path=/var/www/html | grep "FAILED" | grep -oP 'Design ID: \K\d+'

# Manually inspect failed design
wp db query "SELECT design_data FROM deo6_octo_user_designs WHERE id = <DESIGN_ID>" --path=/var/www/html

# Try single design migration with logging
wp octo-migrate variation-images --design-id=<DESIGN_ID> --verbose --path=/var/www/html
```

---

## SUPPORT ESCALATION

**Level 1: Self-Service** (Use this guide)

**Level 2: Technical Team**
- Check deployment logs
- Analyze validation statistics
- Review code changes

**Level 3: Database Admin**
- Database corruption issues
- Performance problems
- Data recovery

**Level 4: Emergency Rollback**
- Critical production issues
- Data loss risk
- Extended downtime

**Contact Information:** See PHASE_3_DEPLOYMENT_GUIDE.md Appendix C

---

**Document Version:** 1.0.0
**Last Updated:** 2025-10-02
**Related Documents:**
- PHASE_3_DEPLOYMENT_GUIDE.md
- FORMAT_COMPATIBILITY_MATRIX.md
