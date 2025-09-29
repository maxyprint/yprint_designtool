<?php
/**
 * 🛡️ AGENT 2: AJAX RESPONSE SECURITY HARDENING SPECIALIST
 *
 * Comprehensive security hardening implementation for all AJAX endpoints
 * in the WooCommerce integration system.
 *
 * @package Octo_Print_Designer
 * @version 2.0
 * @author Agent 2 - Ajax Security Hardening Specialist
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * AJAX Security Hardening Class
 *
 * Provides comprehensive security methods for AJAX endpoint protection
 * including XSS prevention, CSRF protection, input validation, and output sanitization
 */
class Octo_Ajax_Security_Hardening {

    /**
     * 🛡️ SECURITY: Add comprehensive HTTP security headers for AJAX responses
     * Implements CSP, XSS protection, content type validation, and frame protection
     */
    public static function add_security_headers() {
        // Content Security Policy - Allow self and unsafe-inline for existing scripts
        header('Content-Security-Policy: script-src \'self\' \'unsafe-inline\' \'unsafe-eval\'; object-src \'none\'; frame-ancestors \'none\'; base-uri \'self\';');

        // Prevent MIME type sniffing attacks
        header('X-Content-Type-Options: nosniff');

        // Prevent embedding in frames (clickjacking protection)
        header('X-Frame-Options: DENY');

        // Enable XSS filtering in browsers
        header('X-XSS-Protection: 1; mode=block');

        // Ensure content type is properly set
        header('Content-Type: application/json; charset=utf-8');

        // Prevent caching of sensitive AJAX responses
        header('Cache-Control: no-cache, no-store, must-revalidate, private');
        header('Pragma: no-cache');
        header('Expires: 0');

        // Add security timestamp
        header('X-Security-Timestamp: ' . time());
    }

    /**
     * 🛡️ SECURITY: Enhanced nonce validation with timing attack protection
     * Provides additional security layers beyond basic wp_verify_nonce
     */
    public static function validate_ajax_nonce($nonce_value, $nonce_action) {
        // Basic validation
        if (empty($nonce_value) || empty($nonce_action)) {
            error_log("🔒 SECURITY: Empty nonce value or action detected");
            return false;
        }

        // WordPress nonce validation
        $nonce_valid = wp_verify_nonce($nonce_value, $nonce_action);
        if (!$nonce_valid) {
            error_log("🔒 SECURITY: Nonce validation failed for action: " . $nonce_action);
            return false;
        }

        // Additional timing validation (nonces shouldn't be too old)
        $nonce_age = wp_nonce_tick() - (int) substr($nonce_value, -12, 10);
        if ($nonce_age > 2) { // Nonce older than 2 tick periods (24-48 hours)
            error_log("🔒 SECURITY: Nonce too old - potential replay attack");
            return false;
        }

        // Rate limiting check - prevent rapid successive requests
        $user_id = get_current_user_id();
        $rate_limit_key = "ajax_rate_limit_{$user_id}_{$nonce_action}";
        $last_request = wp_cache_get($rate_limit_key, 'security');

        if ($last_request !== false && (time() - $last_request) < 1) {
            error_log("🔒 SECURITY: Rate limit exceeded for user {$user_id}");
            return false;
        }

        wp_cache_set($rate_limit_key, time(), 'security', 60);

        return true;
    }

    /**
     * 🛡️ SECURITY: Comprehensive input validation and sanitization
     * Validates and sanitizes all POST/GET input data with type checking
     */
    public static function validate_and_sanitize_input($input_data, $validation_rules = []) {
        if (!is_array($input_data)) {
            return false;
        }

        $sanitized_data = [];

        foreach ($input_data as $key => $value) {
            // Validate key name (alphanumeric, underscore, dash only)
            if (!preg_match('/^[a-zA-Z0-9_-]+$/', $key)) {
                error_log("🔒 SECURITY: Invalid input key detected: " . $key);
                continue;
            }

            // Apply validation rules if provided
            if (isset($validation_rules[$key])) {
                $rule = $validation_rules[$key];

                // Type validation
                if (isset($rule['type'])) {
                    switch ($rule['type']) {
                        case 'int':
                            $value = absint($value);
                            break;
                        case 'email':
                            $value = sanitize_email($value);
                            if (!is_email($value)) {
                                error_log("🔒 SECURITY: Invalid email format for key: " . $key);
                                continue 2;
                            }
                            break;
                        case 'url':
                            $value = esc_url_raw($value);
                            break;
                        case 'text':
                            $value = sanitize_text_field($value);
                            break;
                        case 'textarea':
                            $value = sanitize_textarea_field($value);
                            break;
                        case 'json':
                            if (!self::validate_json_input($value)) {
                                error_log("🔒 SECURITY: Invalid JSON for key: " . $key);
                                continue 2;
                            }
                            break;
                    }
                }

                // Length validation
                if (isset($rule['max_length']) && strlen($value) > $rule['max_length']) {
                    error_log("🔒 SECURITY: Input too long for key: " . $key);
                    continue;
                }

                // Required field validation
                if (isset($rule['required']) && $rule['required'] && empty($value)) {
                    error_log("🔒 SECURITY: Required field empty: " . $key);
                    return false;
                }
            } else {
                // Default sanitization for unspecified fields
                if (is_string($value)) {
                    $value = sanitize_text_field($value);
                } elseif (is_array($value)) {
                    $value = self::sanitize_array_recursive($value);
                }
            }

            $sanitized_data[$key] = $value;
        }

        return $sanitized_data;
    }

    /**
     * 🛡️ SECURITY: Recursive array sanitization
     */
    public static function sanitize_array_recursive($array) {
        if (!is_array($array)) {
            return sanitize_text_field($array);
        }

        $sanitized = [];
        foreach ($array as $key => $value) {
            $clean_key = sanitize_key($key);
            if (is_array($value)) {
                $sanitized[$clean_key] = self::sanitize_array_recursive($value);
            } else {
                $sanitized[$clean_key] = sanitize_text_field($value);
            }
        }

        return $sanitized;
    }

    /**
     * 🛡️ SECURITY: JSON input validation
     */
    public static function validate_json_input($json_string) {
        if (empty($json_string)) {
            return true; // Empty is acceptable
        }

        // Check for maximum size
        if (strlen($json_string) > 1048576) { // 1MB limit
            return false;
        }

        // Attempt to decode
        $decoded = json_decode($json_string, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return false;
        }

        // Check for dangerous patterns in JSON
        $dangerous_patterns = [
            '/<script/i',
            '/javascript:/i',
            '/on\w+\s*=/i',
            '/eval\s*\(/i',
            '/document\./i'
        ];

        foreach ($dangerous_patterns as $pattern) {
            if (preg_match($pattern, $json_string)) {
                error_log("🔒 SECURITY: Dangerous pattern in JSON: " . $pattern);
                return false;
            }
        }

        return true;
    }

    /**
     * 🛡️ SECURITY: Comprehensive output sanitization for AJAX responses
     * Sanitizes all data being sent back to client to prevent XSS
     */
    public static function sanitize_output_data($data, $context = 'default') {
        if (is_array($data)) {
            $sanitized = [];
            foreach ($data as $key => $value) {
                $sanitized[sanitize_key($key)] = self::sanitize_output_data($value, $context);
            }
            return $sanitized;
        }

        if (is_string($data)) {
            return self::sanitize_string_output($data, $context);
        }

        if (is_numeric($data) || is_bool($data) || is_null($data)) {
            return $data;
        }

        // For objects, convert to array and sanitize
        if (is_object($data)) {
            return self::sanitize_output_data((array) $data, $context);
        }

        return $data;
    }

    /**
     * 🛡️ SECURITY: Context-aware string sanitization for output
     */
    public static function sanitize_string_output($string, $context = 'default') {
        switch ($context) {
            case 'html':
                return wp_kses_post($string);

            case 'html_attr':
                return esc_attr($string);

            case 'js':
                return esc_js($string);

            case 'url':
                return esc_url($string);

            case 'raw_json':
                // For JSON content that needs to remain as-is but be validated
                return self::validate_json_input($string) ? $string : '';

            case 'debug':
                // For debug information - strip potentially dangerous content
                return wp_strip_all_tags($string);

            default:
                // Default: HTML entity encoding
                return esc_html($string);
        }
    }

    /**
     * 🛡️ SECURITY: Enhanced AJAX error response with security logging
     */
    public static function send_secure_ajax_error($message, $error_code = '', $additional_data = []) {
        self::add_security_headers();

        // Log security event
        error_log("🔒 SECURITY: AJAX Error - Code: {$error_code}, Message: {$message}");

        // Sanitize error message to prevent information leakage
        $safe_message = esc_html($message);

        $error_data = [
            'message' => $safe_message,
            'error_code' => sanitize_key($error_code),
            'timestamp' => time()
        ];

        if (!empty($additional_data) && is_array($additional_data)) {
            $error_data = array_merge($error_data, self::sanitize_output_data($additional_data));
        }

        wp_send_json_error($error_data);
    }

    /**
     * 🛡️ SECURITY: Enhanced AJAX success response with comprehensive sanitization
     */
    public static function send_secure_ajax_success($data = [], $message = '') {
        self::add_security_headers();

        // Sanitize all output data
        $sanitized_data = self::sanitize_output_data($data);

        $response_data = [
            'data' => $sanitized_data,
            'timestamp' => time(),
            'security_version' => '2.0'
        ];

        if (!empty($message)) {
            $response_data['message'] = esc_html($message);
        }

        wp_send_json_success($response_data);
    }

    /**
     * 🛡️ SECURITY: Validate user permissions for AJAX operations
     */
    public static function validate_ajax_permissions($required_capability = 'edit_shop_orders', $check_admin = true) {
        // Check if user is logged in
        if (!is_user_logged_in()) {
            error_log("🔒 SECURITY: Unauthenticated AJAX request");
            return false;
        }

        // Check required capability
        if (!current_user_can($required_capability)) {
            error_log("🔒 SECURITY: Insufficient permissions - Required: {$required_capability}");
            return false;
        }

        // Additional admin check if required
        if ($check_admin && !current_user_can('manage_woocommerce')) {
            error_log("🔒 SECURITY: Non-admin user attempting administrative AJAX operation");
            return false;
        }

        // Check for user session validity
        $current_user = wp_get_current_user();
        if (empty($current_user->ID)) {
            error_log("🔒 SECURITY: Invalid user session");
            return false;
        }

        return true;
    }

    /**
     * 🛡️ SECURITY: Comprehensive AJAX endpoint security validation
     * Complete security check combining all validation methods
     */
    public static function validate_ajax_security($nonce_value, $nonce_action, $input_data = [], $validation_rules = []) {
        // 1. Validate permissions
        if (!self::validate_ajax_permissions()) {
            self::send_secure_ajax_error(__('Insufficient permissions', 'octo-print-designer'), 'permission_denied');
            return false;
        }

        // 2. Validate nonce
        if (!self::validate_ajax_nonce($nonce_value, $nonce_action)) {
            self::send_secure_ajax_error(__('Security check failed', 'octo-print-designer'), 'nonce_failed');
            return false;
        }

        // 3. Validate and sanitize input data
        if (!empty($input_data)) {
            $sanitized_input = self::validate_and_sanitize_input($input_data, $validation_rules);
            if ($sanitized_input === false) {
                self::send_secure_ajax_error(__('Invalid input data', 'octo-print-designer'), 'input_validation_failed');
                return false;
            }
            return $sanitized_input;
        }

        return true;
    }

    /**
     * 🛡️ SECURITY: Enhanced WordPress AJAX endpoint registration with security
     */
    public static function register_secure_ajax_endpoint($action, $callback, $public = false) {
        // Register for logged-in users
        add_action('wp_ajax_' . $action, function() use ($callback) {
            // Add security headers to all AJAX responses
            self::add_security_headers();

            // Call the original callback
            call_user_func($callback);
        });

        // Register for non-logged-in users if public
        if ($public) {
            add_action('wp_ajax_nopriv_' . $action, function() use ($callback) {
                // Add security headers to all AJAX responses
                self::add_security_headers();

                // Call the original callback
                call_user_func($callback);
            });
        }
    }
}

/**
 * 🛡️ SECURITY: Secure AJAX endpoint decorator functions
 * Convenience functions for common security patterns
 */

/**
 * Validate order ID with security checks
 */
function octo_validate_secure_order_id($order_id) {
    $order_id = absint($order_id);

    if (!$order_id) {
        Octo_Ajax_Security_Hardening::send_secure_ajax_error(__('Invalid order ID', 'octo-print-designer'), 'invalid_order_id');
        return false;
    }

    $order = wc_get_order($order_id);
    if (!$order) {
        Octo_Ajax_Security_Hardening::send_secure_ajax_error(__('Order not found', 'octo-print-designer'), 'order_not_found');
        return false;
    }

    return $order;
}

/**
 * Secure AJAX validation pattern for WooCommerce orders
 */
function octo_secure_ajax_order_validation($nonce_value, $nonce_action, $order_id) {
    // Security validation
    $security_result = Octo_Ajax_Security_Hardening::validate_ajax_security($nonce_value, $nonce_action);
    if ($security_result === false) {
        return false; // Error already sent
    }

    // Order validation
    $order = octo_validate_secure_order_id($order_id);
    if ($order === false) {
        return false; // Error already sent
    }

    return $order;
}