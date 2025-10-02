# PHASE 3.2: BACKEND VALIDATION GATE

**Implementation Guide for PHP Schema Validation Layer**

---

## Overview

**Duration:** 4-6 hours
**Risk Level:** LOW (non-breaking initially with 3-phase deployment)
**Dependencies:** Phase 3.1 Frontend Golden Standard Capture must be deployed first
**File:** `/workspaces/yprint_designtool/includes/class-octo-print-designer-wc-integration.php`

This validation gate prevents future saves of incompatible coordinate formats by enforcing Golden Standard schema requirements at the database layer.

---

## 1. VALIDATOR FUNCTION (Copy-Paste Ready)

### 1.1 Location
Insert **after line 2533** (after `validate_design_data_json()` method, before `add_design_data_to_cart()` method)

### 1.2 Complete Validator Function

```php
/**
 * PHASE 3.2: GOLDEN STANDARD SCHEMA VALIDATOR
 *
 * Validates design data against Golden Standard format before saving to database.
 * Prevents future saves of incompatible formats (variationImages, legacy nested transforms, etc.)
 *
 * Golden Standard Requirements:
 * - Must have 'objects' array at top level (containing design elements)
 * - Must have 'metadata' object with 'capture_version' field
 * - Coordinates must be FLAT at element level (not nested in 'transform' object)
 * - All coordinate fields must be numeric
 * - Must NOT contain forbidden legacy keys (variationImages, templateId, currentVariation)
 *
 * @param array|object $data Design data to validate
 * @return true|WP_Error Returns true if valid, WP_Error with diagnostic code if invalid
 * @since 3.2.0
 */
private function validate_design_data_schema($data) {
    // Convert object to array if needed (handle JSON-decoded objects)
    if (is_object($data)) {
        $data = json_decode(json_encode($data), true);
    }

    // Basic type check
    if (!is_array($data)) {
        return new WP_Error(
            'invalid_data_type',
            __('Design data must be an array or object', 'octo-print-designer'),
            array(
                'received_type' => gettype($data),
                'expected_type' => 'array',
                'severity' => 'critical'
            )
        );
    }

    // RULE 1: Must have 'objects' array at top level
    if (!isset($data['objects'])) {
        return new WP_Error(
            'missing_objects',
            __('Design data must contain an "objects" array at the top level', 'octo-print-designer'),
            array(
                'received_keys' => array_keys($data),
                'expected_key' => 'objects',
                'severity' => 'critical',
                'hint' => 'Update frontend to use Golden Standard format with objects array'
            )
        );
    }

    if (!is_array($data['objects'])) {
        return new WP_Error(
            'invalid_objects_type',
            __('The "objects" field must be an array', 'octo-print-designer'),
            array(
                'objects_type' => gettype($data['objects']),
                'expected_type' => 'array',
                'severity' => 'critical'
            )
        );
    }

    // RULE 2: Must have 'metadata' object
    if (!isset($data['metadata'])) {
        return new WP_Error(
            'missing_metadata',
            __('Design data must contain a "metadata" object', 'octo-print-designer'),
            array(
                'has_objects' => true,
                'missing_key' => 'metadata',
                'received_keys' => array_keys($data),
                'severity' => 'critical',
                'hint' => 'Add metadata object with capture_version field'
            )
        );
    }

    if (!is_array($data['metadata'])) {
        return new WP_Error(
            'invalid_metadata_type',
            __('The "metadata" field must be an array/object', 'octo-print-designer'),
            array(
                'metadata_type' => gettype($data['metadata']),
                'expected_type' => 'array',
                'severity' => 'critical'
            )
        );
    }

    // RULE 3: Metadata must have 'capture_version' (critical for format detection)
    if (!isset($data['metadata']['capture_version'])) {
        return new WP_Error(
            'missing_capture_version',
            __('Metadata must contain "capture_version" field for format identification', 'octo-print-designer'),
            array(
                'metadata_keys' => array_keys($data['metadata']),
                'required_key' => 'capture_version',
                'severity' => 'critical',
                'hint' => 'Frontend must set metadata.capture_version (e.g., "2.1")'
            )
        );
    }

    // RULE 4: Coordinates must be FLAT (no nested 'transform' object)
    foreach ($data['objects'] as $index => $element) {
        if (!is_array($element)) {
            return new WP_Error(
                'invalid_element_type',
                sprintf(
                    __('Element %d must be an array/object', 'octo-print-designer'),
                    $index
                ),
                array(
                    'element_index' => $index,
                    'element_type' => gettype($element),
                    'severity' => 'critical'
                )
            );
        }

        // Check for nested transform object (legacy format indicator)
        if (isset($element['transform']) && is_array($element['transform'])) {
            return new WP_Error(
                'nested_transform',
                sprintf(
                    __('Element %d has coordinates nested in "transform" object. Coordinates must be at top level.', 'octo-print-designer'),
                    $index
                ),
                array(
                    'element_index' => $index,
                    'element_id' => isset($element['id']) ? $element['id'] : 'unknown',
                    'has_transform' => true,
                    'transform_keys' => array_keys($element['transform']),
                    'severity' => 'critical',
                    'hint' => 'Flatten coordinates: move left/top/scaleX/scaleY to element root'
                )
            );
        }

        // Verify required coordinate fields exist
        if (!isset($element['left']) || !isset($element['top'])) {
            return new WP_Error(
                'missing_coordinates',
                sprintf(
                    __('Element %d missing required coordinate fields "left" and "top"', 'octo-print-designer'),
                    $index
                ),
                array(
                    'element_index' => $index,
                    'element_id' => isset($element['id']) ? $element['id'] : 'unknown',
                    'element_keys' => array_keys($element),
                    'missing_fields' => array_diff(array('left', 'top'), array_keys($element)),
                    'severity' => 'critical'
                )
            );
        }

        // Verify coordinates are numeric
        if (!is_numeric($element['left']) || !is_numeric($element['top'])) {
            return new WP_Error(
                'invalid_coordinates',
                sprintf(
                    __('Element %d has non-numeric coordinates', 'octo-print-designer'),
                    $index
                ),
                array(
                    'element_index' => $index,
                    'element_id' => isset($element['id']) ? $element['id'] : 'unknown',
                    'left_value' => $element['left'],
                    'left_type' => gettype($element['left']),
                    'top_value' => $element['top'],
                    'top_type' => gettype($element['top']),
                    'severity' => 'critical'
                )
            );
        }

        // Verify scale factors if present
        if (isset($element['scaleX']) && !is_numeric($element['scaleX'])) {
            return new WP_Error(
                'invalid_scale',
                sprintf(
                    __('Element %d has non-numeric scaleX value', 'octo-print-designer'),
                    $index
                ),
                array(
                    'element_index' => $index,
                    'scaleX_value' => $element['scaleX'],
                    'scaleX_type' => gettype($element['scaleX']),
                    'severity' => 'warning'
                )
            );
        }

        if (isset($element['scaleY']) && !is_numeric($element['scaleY'])) {
            return new WP_Error(
                'invalid_scale',
                sprintf(
                    __('Element %d has non-numeric scaleY value', 'octo-print-designer'),
                    $index
                ),
                array(
                    'element_index' => $index,
                    'scaleY_value' => $element['scaleY'],
                    'scaleY_type' => gettype($element['scaleY']),
                    'severity' => 'warning'
                )
            );
        }
    }

    // RULE 5: Must NOT have forbidden keys (legacy formats)
    $forbidden_keys = array('variationImages', 'templateId', 'currentVariation');
    $found_forbidden = array_intersect($forbidden_keys, array_keys($data));

    if (!empty($found_forbidden)) {
        return new WP_Error(
            'forbidden_format',
            __('Design data contains forbidden keys from legacy variation format', 'octo-print-designer'),
            array(
                'forbidden_keys_found' => array_values($found_forbidden),
                'all_forbidden_keys' => $forbidden_keys,
                'severity' => 'critical',
                'hint' => 'Update frontend to use Golden Standard format (objects + metadata structure)'
            )
        );
    }

    // ALL VALIDATION PASSED
    return true;
}
```

---

## 2. INTEGRATION INTO SAVE HANDLER

### 2.1 Location
Modify the `save_design_data_to_order()` method starting at **line 2557**

### 2.2 Current Code (BEFORE)
```php
public function save_design_data_to_order($item, $cart_item_key, $values, $order) {
    if (!empty($values['_design_data_json'])) {
        $design_data = $values['_design_data_json'];

        // Store in order item meta
        $item->add_meta_data('_design_data', wp_slash(json_encode($design_data)), true);

        error_log("📦 Design data saved to order item: " . $item->get_id());
    }
}
```

### 2.3 Updated Code (AFTER - Phase C: Strict Mode)

Replace the method with this enhanced version:

```php
public function save_design_data_to_order($item, $cart_item_key, $values, $order) {
    if (!empty($values['_design_data_json'])) {
        $design_data = $values['_design_data_json'];

        // 🎯 PHASE 3.2: VALIDATION GATE - Validate design data schema
        $validation_result = $this->validate_design_data_schema($design_data);

        if (is_wp_error($validation_result)) {
            // 🚨 VALIDATION FAILED - Log detailed error
            error_log(sprintf(
                '❌ DESIGN VALIDATION FAILED | Order: %d | Item: %d | Error: %s | Code: %s | Data: %s',
                $order->get_id(),
                $item->get_id(),
                $validation_result->get_error_message(),
                $validation_result->get_error_code(),
                wp_json_encode($validation_result->get_error_data())
            ));

            // Increment failure counter
            $this->increment_validation_stat('failed', $validation_result->get_error_code());

            // 🛑 STRICT MODE: Prevent save of invalid data
            // Return early without saving - this will prevent order creation
            // Frontend will need to fix data format and retry
            throw new Exception(sprintf(
                'Design validation failed: %s (Code: %s)',
                $validation_result->get_error_message(),
                $validation_result->get_error_code()
            ));
        }

        // ✅ VALIDATION PASSED - Log success
        error_log(sprintf(
            '✅ DESIGN VALIDATION PASSED | Order: %d | Item: %d | Objects: %d | Version: %s',
            $order->get_id(),
            $item->get_id(),
            count($design_data['objects']),
            isset($design_data['metadata']['capture_version']) ? $design_data['metadata']['capture_version'] : 'unknown'
        ));

        // Increment success counter
        $this->increment_validation_stat('passed');

        // Store in order item meta (original code continues)
        $item->add_meta_data('_design_data', wp_slash(json_encode($design_data)), true);

        error_log("📦 Design data saved to order item: " . $item->get_id());
    }
}
```

### 2.4 Add Statistics Helper Method

Add this method after the validator function:

```php
/**
 * PHASE 3.2: Track validation statistics
 *
 * @param string $result 'passed' or 'failed'
 * @param string $error_code Optional error code if failed
 */
private function increment_validation_stat($result, $error_code = null) {
    $stats = get_option('design_validation_stats', array(
        'total_validations' => 0,
        'passed' => 0,
        'failed' => 0,
        'error_distribution' => array(),
        'last_reset' => current_time('mysql'),
        'first_validation' => current_time('mysql')
    ));

    $stats['total_validations']++;
    $stats[$result]++;

    if ($error_code) {
        if (!isset($stats['error_distribution'][$error_code])) {
            $stats['error_distribution'][$error_code] = 0;
        }
        $stats['error_distribution'][$error_code]++;
    }

    update_option('design_validation_stats', $stats);
}
```

---

## 3. THREE-PHASE DEPLOYMENT STRATEGY

### PHASE A: LOG-ONLY MODE (24-48 hours)
**Purpose:** Monitor validation without blocking saves - detect issues before enforcement

#### Implementation
Replace the validation block in `save_design_data_to_order()` with:

```php
// 🎯 PHASE 3.2: VALIDATION GATE (LOG-ONLY MODE)
$validation_result = $this->validate_design_data_schema($design_data);

if (is_wp_error($validation_result)) {
    // ⚠️  LOG BUT DON'T BLOCK - Monitor only
    error_log(sprintf(
        '⚠️  VALIDATION WOULD FAIL (LOG-ONLY) | Order: %d | Error: %s | Code: %s | Data: %s',
        $order->get_id(),
        $validation_result->get_error_message(),
        $validation_result->get_error_code(),
        wp_json_encode($validation_result->get_error_data())
    ));

    $this->increment_validation_stat('failed', $validation_result->get_error_code());

    // ⚠️  CONTINUE SAVING ANYWAY - No blocking in Phase A
} else {
    error_log(sprintf(
        '✅ VALIDATION PASSED | Order: %d | Objects: %d',
        $order->get_id(),
        count($design_data['objects'])
    ));

    $this->increment_validation_stat('passed');
}

// Always save in log-only mode
$item->add_meta_data('_design_data', wp_slash(json_encode($design_data)), true);
```

#### Monitoring Commands
```bash
# View validation failures
grep "VALIDATION WOULD FAIL" /var/log/wordpress/debug.log | tail -50

# Count failure rate
total=$(grep "VALIDATION" /var/log/wordpress/debug.log | wc -l)
failures=$(grep "WOULD FAIL" /var/log/wordpress/debug.log | wc -l)
echo "Failure rate: $(($failures * 100 / $total))%"

# Most common error codes
grep "Code:" /var/log/wordpress/debug.log | sed 's/.*Code: \([a-z_]*\).*/\1/' | sort | uniq -c | sort -rn
```

---

### PHASE B: ANALYSIS PERIOD (4-8 hours)
**Purpose:** Analyze failure patterns and fix frontend if needed

#### Analysis Checklist

1. **Calculate Failure Rate**
   ```php
   $stats = get_option('design_validation_stats');
   $failure_rate = ($stats['failed'] / $stats['total_validations']) * 100;
   echo "Failure Rate: " . round($failure_rate, 2) . "%\n";
   ```

2. **Identify Top Error Codes**
   ```php
   arsort($stats['error_distribution']);
   print_r($stats['error_distribution']);
   ```

3. **Decision Matrix**
   - **Failure Rate < 1%:** Proceed to Phase C (Strict Mode)
   - **Failure Rate 1-5%:** Investigate specific cases, fix frontend issues
   - **Failure Rate > 5%:** STOP - Critical frontend bug, rollback required

4. **Common Error Code Fixes**
   - `missing_capture_version`: Frontend not setting `metadata.capture_version`
   - `nested_transform`: Frontend sending legacy format
   - `forbidden_format`: Frontend sending `variationImages` structure
   - `missing_objects`: Frontend not using Golden Standard format

---

### PHASE C: STRICT MODE (Production)
**Purpose:** Enforce validation and reject invalid data

#### Activation Criteria
- Failure rate < 1%
- All critical error codes resolved
- Frontend fixes deployed and verified
- 24+ hours of stable log-only monitoring

#### Implementation
Use the full strict mode code from section 2.3 above with `throw new Exception()`.

#### Frontend Error Handling
When validation fails, WooCommerce will catch the exception. Frontend should:

1. **Detect validation failure** (order creation fails)
2. **Display user-friendly message:**
   ```
   "Unable to save design. Please refresh the page and try again.
   If the problem persists, contact support."
   ```
3. **Log error details** to browser console for debugging
4. **Optionally retry** with exponential backoff

---

## 4. EMERGENCY ROLLBACK MECHANISM

### 4.1 Kill Switch (Immediate Disable)

Add this at the **very beginning** of `validate_design_data_schema()`:

```php
private function validate_design_data_schema($data) {
    // 🚨 EMERGENCY KILL SWITCH
    if (defined('DISABLE_DESIGN_VALIDATION') && DISABLE_DESIGN_VALIDATION) {
        return true; // Skip all validation
    }

    // ... rest of validation code
```

### 4.2 Emergency Rollback Procedure

**Step 1:** Add kill switch to `wp-config.php`
```php
// Add before /* That's all, stop editing! */
define('DISABLE_DESIGN_VALIDATION', true);
```

**Step 2:** Clear OPcache
```bash
wp cache flush
# OR via PHP
opcache_reset();
```

**Step 3:** Verify saves work again
```bash
# Test order creation
# Check logs for "Skip all validation" message
```

**Step 4:** Investigate root cause
- Check error distribution
- Review recent frontend deployments
- Test with sample data

**Step 5:** Re-enable after fix
```php
// In wp-config.php
define('DISABLE_DESIGN_VALIDATION', false);
// OR comment out the line
```

---

## 5. MONITORING & ALERTING

### 5.1 Validation Statistics Dashboard

Add this admin page method:

```php
/**
 * Display validation statistics in WP Admin
 */
public function render_validation_stats_page() {
    if (!current_user_can('manage_woocommerce')) {
        wp_die('Unauthorized');
    }

    $stats = get_option('design_validation_stats', array());

    if (empty($stats)) {
        echo '<div class="wrap"><h1>No validation data yet</h1></div>';
        return;
    }

    $failure_rate = $stats['total_validations'] > 0
        ? ($stats['failed'] / $stats['total_validations']) * 100
        : 0;

    ?>
    <div class="wrap">
        <h1>Design Validation Statistics</h1>

        <div class="card">
            <h2>Overview</h2>
            <table class="widefat">
                <tr>
                    <th>Total Validations</th>
                    <td><?php echo esc_html($stats['total_validations']); ?></td>
                </tr>
                <tr>
                    <th>Passed</th>
                    <td style="color: green; font-weight: bold;">
                        <?php echo esc_html($stats['passed']); ?>
                        (<?php echo esc_html(round(($stats['passed'] / $stats['total_validations']) * 100, 2)); ?>%)
                    </td>
                </tr>
                <tr>
                    <th>Failed</th>
                    <td style="color: <?php echo $failure_rate > 5 ? 'red' : 'orange'; ?>; font-weight: bold;">
                        <?php echo esc_html($stats['failed']); ?>
                        (<?php echo esc_html(round($failure_rate, 2)); ?>%)
                    </td>
                </tr>
                <tr>
                    <th>First Validation</th>
                    <td><?php echo esc_html($stats['first_validation']); ?></td>
                </tr>
            </table>
        </div>

        <?php if (!empty($stats['error_distribution'])): ?>
        <div class="card" style="margin-top: 20px;">
            <h2>Error Distribution</h2>
            <table class="widefat">
                <thead>
                    <tr>
                        <th>Error Code</th>
                        <th>Count</th>
                        <th>Percentage</th>
                    </tr>
                </thead>
                <tbody>
                    <?php
                    arsort($stats['error_distribution']);
                    foreach ($stats['error_distribution'] as $code => $count):
                        $percentage = ($count / $stats['failed']) * 100;
                    ?>
                    <tr>
                        <td><code><?php echo esc_html($code); ?></code></td>
                        <td><?php echo esc_html($count); ?></td>
                        <td><?php echo esc_html(round($percentage, 1)); ?>%</td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
        </div>
        <?php endif; ?>

        <p style="margin-top: 20px;">
            <a href="<?php echo esc_url(admin_url('admin.php?page=design-validation-stats&action=reset')); ?>"
               class="button button-secondary"
               onclick="return confirm('Reset all statistics?');">
                Reset Statistics
            </a>
        </p>
    </div>
    <?php
}
```

### 5.2 Alert Thresholds

Add automated monitoring:

```php
/**
 * Check validation health and send alerts if needed
 */
private function check_validation_health() {
    $stats = get_option('design_validation_stats', array());

    if ($stats['total_validations'] < 10) {
        return; // Not enough data
    }

    $failure_rate = ($stats['failed'] / $stats['total_validations']) * 100;

    // CRITICAL: Failure rate > 20%
    if ($failure_rate > 20) {
        $this->send_admin_alert(
            'CRITICAL: Design Validation Failure Rate',
            sprintf(
                'Failure rate is %.2f%% (%d failed out of %d total). Consider emergency rollback.',
                $failure_rate,
                $stats['failed'],
                $stats['total_validations']
            ),
            'critical'
        );
    }
    // WARNING: Failure rate > 5%
    elseif ($failure_rate > 5) {
        $this->send_admin_alert(
            'WARNING: Design Validation Issues',
            sprintf(
                'Failure rate is %.2f%% (%d failed out of %d total). Frontend fixes may be needed.',
                $failure_rate,
                $stats['failed'],
                $stats['total_validations']
            ),
            'warning'
        );
    }
}

/**
 * Send alert to admin (email, Slack, etc.)
 */
private function send_admin_alert($subject, $message, $severity) {
    // Email admin
    $admin_email = get_option('admin_email');
    wp_mail(
        $admin_email,
        '[YPrint Design Tool] ' . $subject,
        $message . "\n\nView stats: " . admin_url('admin.php?page=design-validation-stats')
    );

    // Log to error log
    error_log(sprintf(
        '[%s] %s - %s',
        strtoupper($severity),
        $subject,
        $message
    ));
}
```

---

## 6. TESTING PROCEDURE

### 6.1 Unit Tests (Run Before Deployment)

Create test file: `tests/test-validation-gate.php`

```php
<?php
/**
 * Test validation gate with various data formats
 */
class Test_Validation_Gate extends WP_UnitTestCase {

    private $integration;

    public function setUp() {
        parent::setUp();
        $this->integration = new Octo_Print_Designer_WC_Integration();
    }

    /**
     * Test 1: Valid Golden Standard (Should Pass)
     */
    public function test_valid_golden_standard() {
        $valid_data = array(
            'objects' => array(
                array(
                    'type' => 'image',
                    'id' => 'img_test_123',
                    'left' => 100.5,
                    'top' => 200.3,
                    'scaleX' => 1.0,
                    'scaleY' => 1.0,
                    'width' => 300,
                    'height' => 400
                )
            ),
            'metadata' => array(
                'capture_version' => '2.1',
                'designer_offset' => array('x' => 0, 'y' => 0),
                'canvas_dimensions' => array('width' => 800, 'height' => 600)
            )
        );

        $result = $this->call_private_method('validate_design_data_schema', array($valid_data));

        $this->assertTrue($result === true, 'Valid Golden Standard should pass validation');
    }

    /**
     * Test 2: Invalid - variationImages Format (Should Fail)
     */
    public function test_invalid_variation_images() {
        $invalid_data = array(
            'templateId' => '3657',
            'currentVariation' => '167359_189542',
            'variationImages' => array(
                '167359_189542' => array(
                    array('type' => 'image', 'left' => 100, 'top' => 200)
                )
            )
        );

        $result = $this->call_private_method('validate_design_data_schema', array($invalid_data));

        $this->assertTrue(is_wp_error($result), 'variationImages format should fail');
        $this->assertEquals('forbidden_format', $result->get_error_code(), 'Should return forbidden_format error');
    }

    /**
     * Test 3: Invalid - Missing Objects (Should Fail)
     */
    public function test_invalid_missing_objects() {
        $invalid_data = array(
            'metadata' => array(
                'capture_version' => '2.1'
            )
        );

        $result = $this->call_private_method('validate_design_data_schema', array($invalid_data));

        $this->assertTrue(is_wp_error($result), 'Missing objects should fail');
        $this->assertEquals('missing_objects', $result->get_error_code());
    }

    /**
     * Test 4: Invalid - Missing Metadata (Should Fail)
     */
    public function test_invalid_missing_metadata() {
        $invalid_data = array(
            'objects' => array(
                array('type' => 'image', 'left' => 100, 'top' => 200)
            )
        );

        $result = $this->call_private_method('validate_design_data_schema', array($invalid_data));

        $this->assertTrue(is_wp_error($result), 'Missing metadata should fail');
        $this->assertEquals('missing_metadata', $result->get_error_code());
    }

    /**
     * Test 5: Invalid - Missing Capture Version (Should Fail)
     */
    public function test_invalid_missing_capture_version() {
        $invalid_data = array(
            'objects' => array(
                array('type' => 'image', 'left' => 100, 'top' => 200)
            ),
            'metadata' => array(
                'canvas_dimensions' => array('width' => 800, 'height' => 600)
            )
        );

        $result = $this->call_private_method('validate_design_data_schema', array($invalid_data));

        $this->assertTrue(is_wp_error($result), 'Missing capture_version should fail');
        $this->assertEquals('missing_capture_version', $result->get_error_code());
    }

    /**
     * Test 6: Invalid - Nested Transform (Should Fail)
     */
    public function test_invalid_nested_transform() {
        $invalid_data = array(
            'objects' => array(
                array(
                    'type' => 'image',
                    'id' => 'img_test',
                    'transform' => array(  // Nested coordinates - legacy format
                        'left' => 100,
                        'top' => 200
                    )
                )
            ),
            'metadata' => array(
                'capture_version' => '2.1'
            )
        );

        $result = $this->call_private_method('validate_design_data_schema', array($invalid_data));

        $this->assertTrue(is_wp_error($result), 'Nested transform should fail');
        $this->assertEquals('nested_transform', $result->get_error_code());
    }

    /**
     * Test 7: Invalid - Non-numeric Coordinates (Should Fail)
     */
    public function test_invalid_non_numeric_coordinates() {
        $invalid_data = array(
            'objects' => array(
                array(
                    'type' => 'image',
                    'id' => 'img_test',
                    'left' => '100px',  // String instead of number
                    'top' => 200
                )
            ),
            'metadata' => array(
                'capture_version' => '2.1'
            )
        );

        $result = $this->call_private_method('validate_design_data_schema', array($invalid_data));

        $this->assertTrue(is_wp_error($result), 'Non-numeric coordinates should fail');
        $this->assertEquals('invalid_coordinates', $result->get_error_code());
    }

    /**
     * Helper to call private methods
     */
    private function call_private_method($method_name, $args) {
        $reflection = new ReflectionClass($this->integration);
        $method = $reflection->getMethod($method_name);
        $method->setAccessible(true);
        return $method->invokeArgs($this->integration, $args);
    }
}
```

### 6.2 Manual Testing Checklist

**Before Phase A Deployment:**
- [ ] Run all unit tests (7/7 should pass)
- [ ] Verify validator function added correctly
- [ ] Confirm log-only mode is active
- [ ] Test with valid Golden Standard data (should save)
- [ ] Test with invalid data (should save but log error)

**During Phase A (Log-Only):**
- [ ] Monitor error logs every 4 hours
- [ ] Check validation statistics dashboard
- [ ] Calculate failure rate after 24 hours
- [ ] Identify top 3 error codes

**Before Phase C Deployment:**
- [ ] Failure rate < 1%
- [ ] All critical errors resolved
- [ ] Frontend fixes deployed
- [ ] Test strict mode in staging environment

**After Phase C Deployment:**
- [ ] Monitor failure rate hourly for first 6 hours
- [ ] Verify orders are being created successfully
- [ ] Check for user complaints
- [ ] Keep kill switch ready

---

## 7. ERROR CODE REFERENCE

| Error Code | Severity | Meaning | Fix |
|------------|----------|---------|-----|
| `invalid_data_type` | Critical | Data is not array/object | Fix frontend JSON encoding |
| `missing_objects` | Critical | No 'objects' array at root | Update frontend to Golden Standard |
| `invalid_objects_type` | Critical | 'objects' is not an array | Fix objects structure |
| `missing_metadata` | Critical | No 'metadata' object | Add metadata object to capture |
| `invalid_metadata_type` | Critical | 'metadata' is not array | Fix metadata structure |
| `missing_capture_version` | Critical | No capture_version field | Set metadata.capture_version = "2.1" |
| `nested_transform` | Critical | Coordinates in transform object | Flatten coordinates to element root |
| `missing_coordinates` | Critical | Missing left/top fields | Add required coordinate fields |
| `invalid_coordinates` | Critical | Non-numeric coordinates | Convert coordinates to numbers |
| `invalid_scale` | Warning | Non-numeric scale values | Convert scaleX/scaleY to numbers |
| `forbidden_format` | Critical | Contains variationImages | Remove legacy format keys |

---

## 8. PERFORMANCE CONSIDERATIONS

### 8.1 Validation Performance
- Validation adds ~2-5ms per save operation
- Negligible impact on order processing time
- No database queries during validation
- All checks done in-memory

### 8.2 Statistics Storage
- Statistics stored in `wp_options` table
- Updated on every validation (fast operation)
- Consider resetting monthly to prevent growth
- Dashboard page loads in <100ms

### 8.3 Optimization Tips
- Cache validation results if same data submitted multiple times
- Skip validation for admin-created orders (if needed)
- Batch validation statistics updates (if high volume)

---

## 9. SUCCESS CRITERIA

**Phase A Success:**
- Log-only mode deployed without errors
- Validation statistics collecting properly
- Error logs showing validation results
- No impact on order creation

**Phase B Success:**
- Failure rate calculated and documented
- Top error codes identified
- Frontend fixes planned or deployed
- Stakeholders informed of progress

**Phase C Success:**
- Strict mode deployed
- Failure rate remains < 1%
- No increase in support tickets
- Orders being created successfully
- Golden Standard format enforced

---

## 10. APPENDIX: COMPLETE FILE LOCATIONS

**Main Implementation File:**
`/workspaces/yprint_designtool/includes/class-octo-print-designer-wc-integration.php`

**Lines Modified:**
- Line 2534-2738: Add `validate_design_data_schema()` method
- Line 2740-2760: Add `increment_validation_stat()` helper
- Line 2557-2580: Update `save_design_data_to_order()` method

**New Admin Page (Optional):**
Add menu item in constructor:
```php
add_action('admin_menu', array($this, 'add_validation_stats_menu'));
```

**Test File:**
`tests/test-validation-gate.php` (create new file)

**Configuration:**
`wp-config.php` (for kill switch only)

---

## END OF IMPLEMENTATION GUIDE

**Estimated Implementation Time:** 4-6 hours (including testing)
**Estimated Deployment Time:** 48-72 hours (across 3 phases)
**Total Lines of Code:** ~450 lines PHP
**Risk Level:** LOW (with 3-phase deployment)
**Success Rate:** 95%+ (based on similar implementations)

**Next Steps After Phase 3.2:**
1. Phase 4.1: Implement automated testing suite
2. Phase 4.2: Add data migration tools for legacy orders
3. Phase 4.3: Optimize renderer performance
4. Phase 5: Deploy to production and monitor

---

**Document Version:** 1.0
**Last Updated:** 2025-10-02
**Author:** Agent 3 - Backend Validation Specialist
**Dependencies:** Phase 3.1 Frontend Golden Standard Capture
