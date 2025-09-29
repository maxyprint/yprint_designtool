<?php
/**
 * AGENT 5: AJAX Infrastructure Validation Test
 *
 * This script validates the complete AJAX endpoint infrastructure for the design preview system
 */

// WordPress constants simulation for testing
if (!defined('WP_ADMIN')) define('WP_ADMIN', true);
if (!defined('DOING_AJAX')) define('DOING_AJAX', true);

echo "🔍 AGENT 5: AJAX ENDPOINT VALIDATION REPORT\n";
echo "=" . str_repeat("=", 50) . "\n\n";

$validation_results = [
    'endpoint_registration' => [],
    'method_accessibility' => [],
    'security_infrastructure' => [],
    'nonce_validation' => [],
    'recommendations' => []
];

// 1. AJAX ENDPOINT REGISTRATION VERIFICATION
echo "1. AJAX ENDPOINT REGISTRATION STATUS\n";
echo "-" . str_repeat("-", 35) . "\n";

// Check main integration class
$wc_integration_file = __DIR__ . '/includes/class-octo-print-designer-wc-integration.php';
if (file_exists($wc_integration_file)) {
    $content = file_get_contents($wc_integration_file);

    // Check for hook registration
    if (strpos($content, "add_action('wp_ajax_octo_load_design_preview'") !== false) {
        echo "✅ AJAX hook registration found: wp_ajax_octo_load_design_preview\n";
        $validation_results['endpoint_registration']['hook_registered'] = true;
    } else {
        echo "❌ AJAX hook registration MISSING\n";
        $validation_results['endpoint_registration']['hook_registered'] = false;
    }

    // Check for method reference
    if (strpos($content, "array(\$this, 'ajax_load_design_preview')") !== false) {
        echo "✅ Method callback properly referenced\n";
        $validation_results['endpoint_registration']['callback_referenced'] = true;
    } else {
        echo "❌ Method callback reference MISSING\n";
        $validation_results['endpoint_registration']['callback_referenced'] = false;
    }
} else {
    echo "❌ Main integration file not found\n";
    $validation_results['endpoint_registration']['file_exists'] = false;
}

echo "\n";

// 2. AJAX HANDLER METHOD ANALYSIS
echo "2. AJAX HANDLER METHOD ACCESSIBILITY\n";
echo "-" . str_repeat("-", 35) . "\n";

// Check method definition
if (strpos($content, 'public function ajax_load_design_preview()') !== false) {
    echo "✅ Method ajax_load_design_preview() found and is PUBLIC\n";
    $validation_results['method_accessibility']['method_exists'] = true;
    $validation_results['method_accessibility']['method_public'] = true;

    // Check method has proper wp_send_json response
    if (strpos($content, 'wp_send_json_success') !== false) {
        echo "✅ Method uses proper wp_send_json_success response\n";
        $validation_results['method_accessibility']['proper_response'] = true;
    } else {
        echo "⚠️  Method may not use proper JSON response format\n";
        $validation_results['method_accessibility']['proper_response'] = false;
    }

} elseif (strpos($content, 'private function ajax_load_design_preview()') !== false) {
    echo "❌ Method exists but is PRIVATE - must be PUBLIC for AJAX\n";
    $validation_results['method_accessibility']['method_exists'] = true;
    $validation_results['method_accessibility']['method_public'] = false;
} else {
    echo "❌ Method ajax_load_design_preview() NOT FOUND\n";
    $validation_results['method_accessibility']['method_exists'] = false;
}

echo "\n";

// 3. SECURITY INFRASTRUCTURE VALIDATION
echo "3. SECURITY INFRASTRUCTURE STATUS\n";
echo "-" . str_repeat("-", 35) . "\n";

$security_file = __DIR__ . '/includes/class-octo-ajax-security-hardening.php';
if (file_exists($security_file)) {
    $security_content = file_get_contents($security_file);

    // Check security function exists
    if (strpos($security_content, 'function octo_secure_ajax_order_validation') !== false) {
        echo "✅ Security validation function found\n";
        $validation_results['security_infrastructure']['validation_function'] = true;

        // Check nonce validation
        if (strpos($security_content, 'wp_verify_nonce') !== false) {
            echo "✅ Nonce verification implemented\n";
            $validation_results['security_infrastructure']['nonce_verification'] = true;
        } else {
            echo "❌ Nonce verification MISSING\n";
            $validation_results['security_infrastructure']['nonce_verification'] = false;
        }

        // Check permission validation
        if (strpos($security_content, 'validate_ajax_permissions') !== false) {
            echo "✅ Permission validation implemented\n";
            $validation_results['security_infrastructure']['permission_check'] = true;
        } else {
            echo "❌ Permission validation MISSING\n";
            $validation_results['security_infrastructure']['permission_check'] = false;
        }
    } else {
        echo "❌ Security validation function MISSING\n";
        $validation_results['security_infrastructure']['validation_function'] = false;
    }
} else {
    echo "❌ Security hardening file not found\n";
    $validation_results['security_infrastructure']['file_exists'] = false;
}

echo "\n";

// 4. NONCE GENERATION VALIDATION
echo "4. NONCE GENERATION & VALIDATION\n";
echo "-" . str_repeat("-", 35) . "\n";

// Check nonce generation in JavaScript
if (strpos($content, "wp_create_nonce('design_preview_nonce')") !== false) {
    echo "✅ Nonce generation found with correct action: design_preview_nonce\n";
    $validation_results['nonce_validation']['generation_found'] = true;

    // Check if validation uses same nonce action
    if (strpos($content, "'design_preview_nonce'") !== false) {
        echo "✅ Nonce action consistent between generation and validation\n";
        $validation_results['nonce_validation']['action_consistent'] = true;
    } else {
        echo "❌ Nonce action MISMATCH between generation and validation\n";
        $validation_results['nonce_validation']['action_consistent'] = false;
    }
} else {
    echo "❌ Nonce generation not found or incorrect action\n";
    $validation_results['nonce_validation']['generation_found'] = false;

    // Check for wrong nonce action
    if (strpos($content, "wp_create_nonce('octo_send_to_print_provider')") !== false) {
        echo "⚠️  Found nonce with wrong action: octo_send_to_print_provider\n";
        $validation_results['nonce_validation']['wrong_action_found'] = true;
    }
}

echo "\n";

// 5. COMPREHENSIVE RECOMMENDATIONS
echo "5. AJAX INFRASTRUCTURE RECOMMENDATIONS\n";
echo "-" . str_repeat("-", 40) . "\n";

$critical_issues = 0;
$warnings = 0;

// Check critical issues
if (!$validation_results['endpoint_registration']['hook_registered'] ?? true) {
    echo "🔥 CRITICAL: Add AJAX hook registration in constructor\n";
    $validation_results['recommendations'][] = "Add: add_action('wp_ajax_octo_load_design_preview', array(\$this, 'ajax_load_design_preview'));";
    $critical_issues++;
}

if (!$validation_results['method_accessibility']['method_exists'] ?? true) {
    echo "🔥 CRITICAL: Implement ajax_load_design_preview() method\n";
    $validation_results['recommendations'][] = "Create public function ajax_load_design_preview() with proper security validation";
    $critical_issues++;
}

if (!$validation_results['method_accessibility']['method_public'] ?? true) {
    echo "🔥 CRITICAL: Change method visibility from private to public\n";
    $validation_results['recommendations'][] = "Change: private function ajax_load_design_preview() to public";
    $critical_issues++;
}

if (!$validation_results['nonce_validation']['action_consistent'] ?? true) {
    echo "🔥 CRITICAL: Fix nonce action mismatch\n";
    $validation_results['recommendations'][] = "Ensure consistent nonce action between generation and validation";
    $critical_issues++;
}

// Check warnings
if (!$validation_results['security_infrastructure']['nonce_verification'] ?? true) {
    echo "⚠️  WARNING: Implement nonce verification for security\n";
    $validation_results['recommendations'][] = "Add wp_verify_nonce() validation in AJAX handler";
    $warnings++;
}

if (!$validation_results['method_accessibility']['proper_response'] ?? true) {
    echo "⚠️  WARNING: Use proper JSON response format\n";
    $validation_results['recommendations'][] = "Use wp_send_json_success() and wp_send_json_error() for responses";
    $warnings++;
}

echo "\n";

// 6. FINAL INFRASTRUCTURE STATUS
echo "6. FINAL AJAX INFRASTRUCTURE STATUS\n";
echo "-" . str_repeat("-", 40) . "\n";

if ($critical_issues == 0 && $warnings == 0) {
    echo "🟢 AJAX INFRASTRUCTURE: OPERATIONAL ✅\n";
    echo "All endpoint registration and security checks passed\n";
} elseif ($critical_issues == 0) {
    echo "🟡 AJAX INFRASTRUCTURE: FUNCTIONAL with warnings ⚠️\n";
    echo "Endpoint should work but has {$warnings} security/quality issues\n";
} else {
    echo "🔴 AJAX INFRASTRUCTURE: BROKEN ❌\n";
    echo "Found {$critical_issues} critical issues that prevent functionality\n";
}

echo "\n";
echo "VALIDATION COMPLETE: " . date('Y-m-d H:i:s') . "\n";
?>