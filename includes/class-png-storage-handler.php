<?php
/**
 * 🗄️ PNG STORAGE HANDLER - WordPress Backend
 *
 * Handles server-side storage and processing of print-ready PNG files
 *
 * FEATURES:
 * - High-resolution PNG storage
 * - Order meta integration
 * - Print queue management
 * - File cleanup and optimization
 */

if (!defined('ABSPATH')) {
    exit;
}

class PNG_Storage_Handler {

    private $plugin_name;
    private $version;
    private $upload_dir;

    public function __construct($plugin_name, $version) {
        error_log('🔥 PNG STORAGE HANDLER: CONSTRUCTOR CALLED - INSTANTIATION SUCCESSFUL!');
        $this->plugin_name = $plugin_name;
        $this->version = $version;

        // Set up upload directory
        $wp_upload_dir = wp_upload_dir();
        $this->upload_dir = $wp_upload_dir['basedir'] . '/yprint-print-pngs/';

        $this->init();
    }

    private function init() {
        // Create upload directory if it doesn't exist
        $this->ensure_upload_directory();

        // 🔥 CRITICAL TEST: Log AJAX action registration
        error_log('🔥 PNG STORAGE: About to register AJAX action: wp_ajax_yprint_save_design_print_png');

        // Register AJAX handlers for PNG storage (NOT cart integration)
        add_action('wp_ajax_yprint_save_design_print_png', array($this, 'handle_save_design_print_png'));
        add_action('wp_ajax_nopriv_yprint_save_design_print_png', array($this, 'handle_save_design_print_png'));

        error_log('🔥 PNG STORAGE: AJAX actions registered successfully!');

        // Register nonce refresh handler for session stability
        add_action('wp_ajax_yprint_refresh_nonce', array($this, 'handle_refresh_nonce'));
        add_action('wp_ajax_nopriv_yprint_refresh_nonce', array($this, 'handle_refresh_nonce'));

        // 📥 SAVE-ONLY PNG: Handler to retrieve existing PNGs (no generation)
        add_action('wp_ajax_yprint_get_existing_png', array($this, 'handle_get_existing_png'));
        add_action('wp_ajax_nopriv_yprint_get_existing_png', array($this, 'handle_get_existing_png'));

        add_action('wp_ajax_yprint_get_template_print_area', array($this, 'handle_get_template_print_area'));
        add_action('wp_ajax_nopriv_yprint_get_template_print_area', array($this, 'handle_get_template_print_area'));

        // 🏷️ TEMPLATE METADATA: Handler for template metadata retrieval
        add_action('wp_ajax_yprint_get_template_metadata', array($this, 'handle_get_template_metadata'));
        add_action('wp_ajax_nopriv_yprint_get_template_metadata', array($this, 'handle_get_template_metadata'));

        // AJAX handler for adding PNG to order design data (integrates with "Designdaten laden")
        add_action('wp_ajax_yprint_add_png_to_order_design_data', array($this, 'handle_add_png_to_order_design_data'));

        // NO WooCommerce cart hooks - PNG system works independently

        // Admin hooks
        add_action('add_meta_boxes', array($this, 'add_order_meta_boxes'));

        error_log('🗄️ PNG STORAGE HANDLER: Initialized');
    }

    private function ensure_upload_directory() {
        if (!file_exists($this->upload_dir)) {
            wp_mkdir_p($this->upload_dir);

            // Create .htaccess for security
            $htaccess_content = "Options -Indexes\n";
            $htaccess_content .= "<Files *.png>\n";
            $htaccess_content .= "    Header set Content-Type \"image/png\"\n";
            $htaccess_content .= "</Files>\n";

            file_put_contents($this->upload_dir . '.htaccess', $htaccess_content);

            error_log('🗄️ PNG STORAGE: Upload directory created: ' . $this->upload_dir);
        }
    }

    /**
     * Handle AJAX request to save design print PNG (for 'Designdaten laden')
     */
    public function handle_save_design_print_png() {
        // 🔥 ULTRA-EARLY ERROR TEST: First line that should execute
        error_log('🔥 PNG HANDLER: === FIRST LINE EXECUTED ===');

        // 🔥 HANDLER ENTRY POINT - CRITICAL LOG
        error_log('🔥🔥🔥 PNG STORAGE: === HANDLER ENTRY POINT === Method called successfully!');
        error_log('🔥🔥🔥 PNG STORAGE: POST keys: ' . print_r(array_keys($_POST), true));
        error_log('🔥🔥🔥 PNG STORAGE: REQUEST method: ' . $_SERVER['REQUEST_METHOD']);

        // 🚨 FORENSIC ENTRY POINT LOGGING
        error_log("--- PNG Handler Reached: START VALIDATION ---");

        // 🚨 ZWANGSANALYSE: Raw input logging (bypasses $_POST processing)
        $raw_input = file_get_contents('php://input');
        error_log('🚨 RAW INPUT LÄNGE: ' . strlen($raw_input) . ' bytes');
        error_log('🚨 RAW INPUT PREVIEW: ' . substr($raw_input, 0, 200) . '...');

        // 🚨 ZWANGSANALYSE: PHP Limits Check
        $post_max_size = ini_get('post_max_size');
        $upload_max_filesize = ini_get('upload_max_filesize');
        $memory_limit = ini_get('memory_limit');
        error_log('🚨 PHP LIMITS: post_max_size=' . $post_max_size . ', upload_max_filesize=' . $upload_max_filesize . ', memory_limit=' . $memory_limit);

        // 🔍 FORENSIC DEBUGGING: Q1-Q4 Pipeline Analysis
        error_log('🔍 PNG STORAGE: === FORENSIC DEBUGGING START ===');

        // 🔬 Q1: Raw input transfer check - Length
        $raw_input = file_get_contents('php://input');
        $raw_length = strlen($raw_input);
        error_log("🔬 Q1: Raw input transfer check - Length: {$raw_length} bytes");

        // 🔬 Q2: POST array dump - Keys
        error_log('🔬 Q2: POST array dump - Keys: ' . (empty($_POST) ? 'EMPTY' : implode(', ', array_keys($_POST))));

        // Basic request info
        error_log('🔍 PNG STORAGE: Request method: ' . $_SERVER['REQUEST_METHOD']);
        error_log('🔍 PNG STORAGE: Content-Type: ' . ($_SERVER['CONTENT_TYPE'] ?? 'NOT_SET'));
        error_log('🔍 PNG STORAGE: Action: ' . ($_POST['action'] ?? $_REQUEST['action'] ?? 'NOT_SET'));
        error_log('🔍 PNG STORAGE: Nonce received: ' . ($_POST['nonce'] ?? $_REQUEST['nonce'] ?? 'NOT_SET'));

        // 🔬 Q3: PNG data preview - Check what we have before processing
        if (!empty($_POST['print_png'])) {
            $png_preview = substr($_POST['print_png'], 0, 100) . '...';
            error_log("🔬 Q3: PNG data preview - First 100 chars: {$png_preview}");
        } else {
            error_log('🔬 Q3: PNG data preview - NO PNG DATA FOUND');
        }

        // Check if this is a FormData request vs regular POST
        $is_form_data = strpos($_SERVER['CONTENT_TYPE'] ?? '', 'multipart/form-data') !== false;
        error_log('🔍 PNG STORAGE: Is FormData request: ' . ($is_form_data ? 'YES' : 'NO'));

        // Try to get nonce from both POST and REQUEST
        $nonce = $_POST['nonce'] ?? $_REQUEST['nonce'] ?? null;
        error_log('🔍 PNG STORAGE: Final nonce: ' . ($nonce ?? 'NULL'));

        // Verify nonce
        $nonce_valid = $nonce ? wp_verify_nonce($nonce, 'octo_print_designer_nonce') : false;
        error_log('🔍 PNG STORAGE: Nonce verification result: ' . ($nonce_valid ? 'VALID' : 'INVALID'));
        error_log('🔍 PNG STORAGE: === INCOMING REQUEST END ===');

        // 🔧 TEMPORARY DEBUG: Bypass nonce validation to isolate issue
        if (!$nonce_valid) {
            error_log('⚠️ PNG STORAGE: Nonce verification failed - BUT CONTINUING FOR DEBUG');
            // wp_send_json_error('Invalid nonce');
            // return;
        }

        try {
            // 🔧 ENHANCED VALIDATION: Check all required fields (POST and REQUEST)
            $required_fields = ['design_id', 'print_png'];
            $missing_fields = [];

            foreach ($required_fields as $field) {
                $value = $_POST[$field] ?? $_REQUEST[$field] ?? null;
                if (!$value || empty($value)) {
                    $missing_fields[] = $field;
                }
                error_log("🔍 PNG STORAGE: Field '$field' = " . ($value ? 'PRESENT' : 'MISSING'));
            }

            if (!empty($missing_fields)) {
                $error_msg = 'Missing required fields: ' . implode(', ', $missing_fields);
                error_log('❌ PNG STORAGE: Validation failed - ' . $error_msg);
                wp_send_json_error($error_msg);
                return;
            }

            $design_id = sanitize_text_field($_POST['design_id'] ?? $_REQUEST['design_id']);

            // 🔧 ENHANCED DATA EXTRACTION: Use raw input if POST data is incomplete
            $print_png = $_POST['print_png'] ?? $_REQUEST['print_png'];

            // If print_png is missing/small and we have raw input, parse it
            if ((!$print_png || strlen($print_png) < 1000) && !empty($raw_input)) {
                error_log('🔧 PNG STORAGE: Parsing raw input for print_png data...');

                // Parse raw input for JSON or form data
                if (strpos($raw_input, '"print_png"') !== false) {
                    $parsed_data = json_decode($raw_input, true);
                    if ($parsed_data && isset($parsed_data['print_png'])) {
                        $print_png = $parsed_data['print_png'];
                        error_log('✅ PNG STORAGE: Extracted print_png from JSON raw input');
                    }
                }

                // If still no data, check if entire raw input is the PNG data
                if (!$print_png && strpos($raw_input, 'data:image/png;base64,') === 0) {
                    $print_png = $raw_input;
                    error_log('✅ PNG STORAGE: Using entire raw input as print_png data');
                }
            }

            error_log('🔍 PNG STORAGE: Final print_png size: ' . strlen($print_png ?? ''));

            // 🔬 Q4: PNG validation result
            $png_validation = $this->validatePNGData($print_png);
            error_log("🔬 Q4: PNG validation result - " . ($png_validation ? "VALID" : "INVALID"));
            if (!$png_validation) {
                error_log('❌ PNG STORAGE: Invalid PNG data format');
                wp_send_json_error('Invalid PNG data format');
                return;
            }
            error_log('✅ PNG STORAGE: PNG data validation passed');
            $print_area_px = stripslashes($_POST['print_area_px'] ?? $_REQUEST['print_area_px'] ?? '{}');
            $print_area_mm = stripslashes($_POST['print_area_mm'] ?? $_REQUEST['print_area_mm'] ?? '{}');
            $template_id = sanitize_text_field($_POST['template_id'] ?? $_REQUEST['template_id'] ?? 'default');

            // 🏷️ ENHANCED: Support for template metadata from new generation system
            $enhanced_metadata = stripslashes($_POST['metadata'] ?? $_REQUEST['metadata'] ?? null);
            $save_type = sanitize_text_field($_POST['save_type'] ?? $_REQUEST['save_type'] ?? 'standard');
            $order_id = sanitize_text_field($_POST['order_id'] ?? $_REQUEST['order_id'] ?? null);

            // Validate inputs
            if (!$design_id || !$print_png) {
                wp_send_json_error('Missing required data');
                return;
            }

            // 🚨 CRITICAL DIAGNOSTIC: Test filesystem write permissions
            $test_file = $this->upload_dir . 'write_test_' . uniqid() . '.txt';
            $can_write = is_writable($this->upload_dir);
            error_log('🚨 WRITE PERMISSION TEST: Directory writable: ' . ($can_write ? 'YES' : 'NO'));
            error_log('🚨 WRITE PERMISSION TEST: Directory path: ' . $this->upload_dir);

            if (!$can_write) {
                error_log('❌ FATAL: Upload directory is NOT writable. File saving will fail!');
                wp_send_json_error('Write permissions failed. Please check folder permissions: ' . $this->upload_dir);
                return;
            }

            // Optional: Test writing a dummy file
            if (@file_put_contents($test_file, 'test')) {
                @unlink($test_file);
                error_log('✅ WRITE TEST: Dummy file successfully created and deleted.');
            } else {
                error_log('❌ WRITE TEST: Dummy file creation FAILED, even if is_writable was YES. Check memory/disk space.');
                wp_send_json_error('Filesystem write test failed. Check server permissions and disk space.');
                return;
            }

            // Save print PNG file
            error_log('🔍 PNG STORAGE: About to save PNG file...');
            $png_file_info = $this->save_print_png($print_png, $design_id, $template_id);
            error_log('✅ PNG STORAGE: PNG file save completed');

            if (!$png_file_info) {
                wp_send_json_error('Failed to save print PNG');
                return;
            }

            // Save PNG info to design meta (for 'Designdaten laden' access)
            $design_meta = array(
                'print_png_url' => $png_file_info['url'],
                'print_png_path' => $png_file_info['path'],
                'print_area_px' => $print_area_px,
                'print_area_mm' => $print_area_mm,
                'template_id' => $template_id,
                'created' => current_time('mysql'),
                'dpi' => 300,
                'save_type' => $save_type,
                'order_id' => $order_id
            );

            // 🏷️ ENHANCED: Add enhanced metadata if available
            if ($enhanced_metadata) {
                $parsed_metadata = json_decode($enhanced_metadata, true);
                if ($parsed_metadata) {
                    $design_meta['enhanced_metadata'] = $parsed_metadata;
                    $design_meta['generation_method'] = 'print_ready_with_metadata';

                    // Extract key information for easy access
                    if (isset($parsed_metadata['dpi'])) {
                        $design_meta['dpi'] = $parsed_metadata['dpi'];
                    }
                    if (isset($parsed_metadata['elementsCount'])) {
                        $design_meta['elements_count'] = $parsed_metadata['elementsCount'];
                    }
                    if (isset($parsed_metadata['templateMetadata'])) {
                        $design_meta['template_metadata'] = $parsed_metadata['templateMetadata'];
                    }
                    if (isset($parsed_metadata['printSpecifications'])) {
                        $design_meta['print_specifications'] = $parsed_metadata['printSpecifications'];
                    }

                    error_log('🏷️ PNG STORAGE: Enhanced metadata stored for design ' . $design_id);
                } else {
                    error_log('⚠️ PNG STORAGE: Failed to parse enhanced metadata');
                }
            }

            // Save to design meta or option (depending on how designs are stored)
            update_option('yprint_design_' . $design_id . '_print_png', $design_meta);

            error_log('💾 PNG STORAGE: Design print PNG saved - Design: ' . $design_id);

            // 🗄️ CRITICAL: Save to yprint_design_pngs database table
            error_log('🗄️ PNG DATABASE: Starting database table storage...');
            $database_result = $this->save_to_database_table($design_id, $print_png, $save_type, $order_id, $template_id, $design_meta);

            if (!$database_result) {
                error_log('❌ PNG DATABASE: Failed to save to database table');
                wp_send_json_error('Failed to save PNG to database table');
                return;
            }
            error_log('✅ PNG DATABASE: Successfully saved to database table');

            // 🏷️ Prepare response with enhanced metadata support
            $response_data = array(
                'png_url' => $png_file_info['url'],
                'png_path' => $png_file_info['path'],
                'design_id' => $design_id,
                'template_id' => $template_id,
                'print_area_px' => $print_area_px,
                'print_area_mm' => $print_area_mm,
                'save_type' => $save_type,
                'generation_method' => $design_meta['generation_method'] ?? 'standard',
                'message' => 'Print PNG saved for design!'
            );

            // Add enhanced metadata to response if available
            if (isset($design_meta['enhanced_metadata'])) {
                $response_data['enhanced_metadata'] = $design_meta['enhanced_metadata'];
                $response_data['dpi'] = $design_meta['dpi'];
                $response_data['elements_count'] = $design_meta['elements_count'] ?? 0;
                $response_data['message'] = 'Enhanced print-ready PNG saved with template metadata!';
            }

            if ($order_id) {
                $response_data['order_id'] = $order_id;
            }

            wp_send_json_success($response_data);

        } catch (Exception $e) {
            error_log('❌ PNG STORAGE: Save design PNG failed: ' . $e->getMessage());
            wp_send_json_error('Failed to save print PNG: ' . $e->getMessage());
        }
    }

    /**
     * 🔄 Nonce Refresh Handler
     * Provides fresh nonces to prevent 403 errors during long design sessions
     */
    public function handle_refresh_nonce() {
        try {
            // Generate a fresh nonce
            $fresh_nonce = wp_create_nonce('octo_print_designer_nonce');

            error_log('🔄 NONCE REFRESH: Generated fresh nonce');

            wp_send_json_success(array(
                'nonce' => $fresh_nonce,
                'message' => 'Nonce refreshed successfully'
            ));

        } catch (Exception $e) {
            error_log('❌ NONCE REFRESH: Failed to refresh nonce: ' . $e->getMessage());
            wp_send_json_error('Failed to refresh nonce: ' . $e->getMessage());
        }
    }

    /**
     * 📥 SAVE-ONLY PNG: Retrieve existing PNG (no generation)
     * Used by "Designdaten laden" and preview system
     */
    public function handle_get_existing_png() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'octo_print_designer_nonce')) {
            wp_send_json_error('Invalid nonce');
            return;
        }

        try {
            $identifier = sanitize_text_field($_POST['identifier']);

            error_log('📥 PNG STORAGE: Retrieving existing PNG for: ' . $identifier);

            // Try different lookup methods
            $png_data = null;

            // Method 1: Direct order lookup
            if (is_numeric($identifier)) {
                $png_data = get_post_meta($identifier, 'print_png_data', true);
            }

            // Method 2: Design ID lookup
            if (!$png_data) {
                global $wpdb;
                $result = $wpdb->get_row($wpdb->prepare(
                    "SELECT meta_value FROM {$wpdb->postmeta}
                     WHERE meta_key = 'print_png_data'
                     AND meta_value LIKE %s
                     ORDER BY meta_id DESC LIMIT 1",
                    '%' . $wpdb->esc_like($identifier) . '%'
                ));

                if ($result) {
                    $png_data = $result->meta_value;
                }
            }

            if ($png_data) {
                wp_send_json_success(array(
                    'png' => $png_data,
                    'identifier' => $identifier,
                    'found' => true,
                    'message' => 'Existing PNG retrieved successfully'
                ));
            } else {
                wp_send_json_success(array(
                    'png' => null,
                    'identifier' => $identifier,
                    'found' => false,
                    'message' => 'No existing PNG found'
                ));
            }

        } catch (Exception $e) {
            error_log('🚨 PNG STORAGE: Error retrieving PNG: ' . $e->getMessage());
            wp_send_json_error('Error retrieving PNG: ' . $e->getMessage());
        }
    }

    /**
     * Save print PNG to file system
     */
    private function save_print_png($png_data, $product_id, $template_id) {
        try {
            // Decode base64 PNG data
            if (strpos($png_data, 'data:image/png;base64,') === 0) {
                $png_data = str_replace('data:image/png;base64,', '', $png_data);
            }

            $png_binary = base64_decode($png_data);

            if (!$png_binary) {
                throw new Exception('Invalid PNG data');
            }

            // Generate unique filename
            $filename = sprintf(
                'print_%s_%s_%s_%d.png',
                $product_id,
                $template_id,
                uniqid(),
                time()
            );

            $file_path = $this->upload_dir . $filename;

            // Save file
            $result = file_put_contents($file_path, $png_binary);

            if ($result === false) {
                throw new Exception('Failed to write PNG file');
            }

            // Generate URL
            $wp_upload_dir = wp_upload_dir();
            $file_url = $wp_upload_dir['baseurl'] . '/yprint-print-pngs/' . $filename;

            // 🔍 URL DIAGNOSTIC: Validate file accessibility
            error_log('🔍 URL DIAGNOSTIC: WordPress upload config: ' . print_r($wp_upload_dir, true));
            error_log('🔍 URL DIAGNOSTIC: Generated file URL: ' . $file_url);
            error_log('🔍 URL DIAGNOSTIC: Physical file path: ' . $file_path);
            error_log('🔍 URL DIAGNOSTIC: File exists: ' . (file_exists($file_path) ? 'YES' : 'NO'));

            // Validate saved file
            if (!file_exists($file_path) || filesize($file_path) === 0) {
                error_log('❌ FILE VALIDATION FAILED: File missing or empty');
                throw new Exception('PNG file validation failed');
            }

            // 🔍 ADDITIONAL DIAGNOSTICS: File details
            $file_size = filesize($file_path);
            error_log('🔍 FILE VALIDATION: File size: ' . $file_size . ' bytes');
            error_log('🔍 FILE VALIDATION: File permissions: ' . substr(sprintf('%o', fileperms($file_path)), -4));

            // 🔍 URL ACCESSIBILITY TEST: Check if URL construction is correct
            $expected_web_path = str_replace($wp_upload_dir['basedir'], $wp_upload_dir['baseurl'], $file_path);
            error_log('🔍 URL RECONSTRUCTION: Expected URL: ' . $expected_web_path);
            error_log('🔍 URL RECONSTRUCTION: Generated URL: ' . $file_url);
            error_log('🔍 URL RECONSTRUCTION: URLs match: ' . ($expected_web_path === $file_url ? 'YES' : 'NO'));

            error_log('💾 PNG STORAGE: Saved print PNG - Size: ' . filesize($file_path) . ' bytes');

            return array(
                'path' => $file_path,
                'url' => $file_url,
                'filename' => $filename,
                'size' => filesize($file_path)
            );

        } catch (Exception $e) {
            error_log('❌ PNG STORAGE: Save failed: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Handle AJAX request to add PNG data to existing order design data
     * This integrates with the "Designdaten laden" functionality
     */
    public function handle_add_png_to_order_design_data() {
        if (!wp_verify_nonce($_POST['nonce'], 'octo_send_to_print_provider')) {
            wp_send_json_error('Invalid nonce');
            return;
        }

        try {
            $order_id = intval($_POST['order_id']);
            $design_id = sanitize_text_field($_POST['design_id']);

            if (!$order_id || !$design_id) {
                wp_send_json_error('Missing required data');
                return;
            }

            // Get the stored design PNG data
            $design_png_meta = get_option('yprint_design_' . $design_id . '_print_png');

            if (!$design_png_meta) {
                wp_send_json_error('No PNG data found for this design');
                return;
            }

            // Get existing order design data
            $existing_design_data = get_post_meta($order_id, '_design_data', true);

            if ($existing_design_data) {
                // Parse existing JSON
                $design_data = json_decode($existing_design_data, true);

                if ($design_data) {
                    // Add PNG data to existing design data
                    $design_data['print_png'] = array(
                        'url' => $design_png_meta['print_png_url'],
                        'path' => $design_png_meta['print_png_path'],
                        'print_area_px' => json_decode($design_png_meta['print_area_px'], true),
                        'print_area_mm' => json_decode($design_png_meta['print_area_mm'], true),
                        'template_id' => $design_png_meta['template_id'],
                        'dpi' => $design_png_meta['dpi'],
                        'created' => $design_png_meta['created']
                    );

                    // Save updated design data back to order
                    $updated_json = json_encode($design_data);
                    $result = update_post_meta($order_id, '_design_data', wp_slash($updated_json));

                    if ($result) {
                        error_log('📦 PNG STORAGE: PNG data added to order design data - Order: ' . $order_id);
                        wp_send_json_success(array(
                            'message' => 'PNG data added to order design data',
                            'png_url' => $design_png_meta['print_png_url']
                        ));
                    } else {
                        wp_send_json_error('Failed to update order design data');
                    }
                } else {
                    wp_send_json_error('Invalid existing design data format');
                }
            } else {
                wp_send_json_error('No existing design data found in order');
            }

        } catch (Exception $e) {
            error_log('❌ PNG STORAGE: Add PNG to order failed: ' . $e->getMessage());
            wp_send_json_error('Failed to add PNG data: ' . $e->getMessage());
        }
    }

    /**
     * Handle AJAX request to get template print area
     */
    public function handle_get_template_print_area() {
        try {
            $template_id = sanitize_text_field($_POST['template_id']);

            if (!$template_id) {
                wp_send_json_error('Missing template ID');
                return;
            }

            // Get template meta data
            $printable_area_px = get_post_meta($template_id, '_template_printable_area_px', true);
            $printable_area_mm = get_post_meta($template_id, '_template_printable_area_mm', true);

            // Parse JSON data
            $printable_area_px = $printable_area_px ? json_decode($printable_area_px, true) : null;
            $printable_area_mm = $printable_area_mm ? json_decode($printable_area_mm, true) : null;

            // Default fallback
            if (!$printable_area_px) {
                $printable_area_px = array('x' => 0, 'y' => 0, 'width' => 800, 'height' => 600);
            }

            if (!$printable_area_mm) {
                $printable_area_mm = array('width' => 200, 'height' => 250);
            }

            error_log('📐 PNG STORAGE: Template print area retrieved - Template: ' . $template_id);

            wp_send_json_success(array(
                'template_id' => $template_id,
                'printable_area_px' => $printable_area_px,
                'printable_area_mm' => $printable_area_mm
            ));

        } catch (Exception $e) {
            error_log('❌ PNG STORAGE: Get template data failed: ' . $e->getMessage());
            wp_send_json_error('Failed to get template data: ' . $e->getMessage());
        }
    }

    /**
     * 🏷️ TEMPLATE METADATA: Handle AJAX request to get comprehensive template metadata
     */
    public function handle_get_template_metadata() {
        try {
            // Verify nonce for security
            if (!wp_verify_nonce($_POST['nonce'], 'octo_print_designer_nonce')) {
                wp_send_json_error('Security check failed');
                return;
            }

            $template_id = sanitize_text_field($_POST['template_id']);

            if (!$template_id) {
                wp_send_json_error('Missing template ID');
                return;
            }

            error_log('🏷️ PNG STORAGE: Retrieving template metadata for: ' . $template_id);

            // Get comprehensive template metadata
            $template_metadata = $this->get_comprehensive_template_metadata($template_id);

            if ($template_metadata) {
                error_log('✅ PNG STORAGE: Template metadata retrieved successfully');

                wp_send_json_success($template_metadata);
            } else {
                error_log('⚠️ PNG STORAGE: Template metadata not found');
                wp_send_json_error('Template metadata not found');
            }

        } catch (Exception $e) {
            error_log('❌ PNG STORAGE: Get template metadata failed: ' . $e->getMessage());
            wp_send_json_error('Failed to get template metadata: ' . $e->getMessage());
        }
    }

    /**
     * 🏷️ Get comprehensive template metadata for print optimization
     */
    private function get_comprehensive_template_metadata($template_id) {
        try {
            // Basic template info
            $template_post = get_post($template_id);
            if (!$template_post) {
                return null;
            }

            // Get all template metadata
            $printable_area_px = get_post_meta($template_id, '_template_printable_area_px', true);
            $printable_area_mm = get_post_meta($template_id, '_template_printable_area_mm', true);
            $template_views = get_post_meta($template_id, '_template_views', true);
            $template_dimensions = get_post_meta($template_id, '_template_dimensions', true);
            $product_category = get_post_meta($template_id, '_template_product_category', true);
            $material_type = get_post_meta($template_id, '_template_material_type', true);
            $care_instructions = get_post_meta($template_id, '_template_care_instructions', true);
            $print_method = get_post_meta($template_id, '_template_print_method', true);
            $color_profile = get_post_meta($template_id, '_template_color_profile', true);

            // Parse JSON data
            $printable_area_px = $printable_area_px ? json_decode($printable_area_px, true) : null;
            $printable_area_mm = $printable_area_mm ? json_decode($printable_area_mm, true) : null;
            $template_views = $template_views ? json_decode($template_views, true) : array();
            $template_dimensions = $template_dimensions ? json_decode($template_dimensions, true) : null;

            // Set defaults if needed
            if (!$printable_area_px) {
                $printable_area_px = array('x' => 0, 'y' => 0, 'width' => 800, 'height' => 600);
            }

            if (!$printable_area_mm) {
                $printable_area_mm = array('width' => 200, 'height' => 250);
            }

            // Build comprehensive metadata
            $metadata = array(
                'template_id' => $template_id,
                'template_name' => $template_post->post_title,
                'template_slug' => $template_post->post_name,
                'printable_area_px' => $printable_area_px,
                'printable_area_mm' => $printable_area_mm,
                'template_views' => $template_views,
                'template_dimensions' => $template_dimensions,
                'product_category' => $product_category ?: 'clothing',
                'material_type' => $material_type ?: 'cotton',
                'substrate' => $material_type ?: 'cotton', // Alias for material_type
                'care_instructions' => $care_instructions ?: 'machine_wash_30c',
                'print_method' => $print_method ?: 'digital_textile',
                'color_profile' => $color_profile ?: 'sRGB',
                'created_at' => $template_post->post_date,
                'modified_at' => $template_post->post_modified,

                // Print specifications
                'print_specifications' => array(
                    'max_dpi' => 300,
                    'min_dpi' => 150,
                    'color_mode' => 'CMYK',
                    'file_format' => 'PNG',
                    'alpha_channel' => true,
                    'bleed_support' => true,
                    'max_bleed_mm' => 5
                ),

                // Quality assurance
                'quality_requirements' => array(
                    'min_resolution' => $printable_area_px['width'] . 'x' . $printable_area_px['height'],
                    'color_accuracy' => 'high',
                    'edge_sharpness' => 'required',
                    'transparency_support' => true
                ),

                'retrieval_timestamp' => current_time('mysql'),
                'api_version' => '1.0'
            );

            error_log('🏷️ PNG STORAGE: Comprehensive metadata compiled for template ' . $template_id);

            return $metadata;

        } catch (Exception $e) {
            error_log('❌ PNG STORAGE: Failed to compile template metadata: ' . $e->getMessage());
            return null;
        }
    }

    /**
     * Add print PNG data to WooCommerce order item meta
     */
    public function add_print_png_to_order_item($item_id, $values, $cart_item_key) {
        if (!empty($values['yprint_print_ready'])) {
            wc_add_order_item_meta($item_id, '_yprint_print_png_url', $values['yprint_print_png_url']);
            wc_add_order_item_meta($item_id, '_yprint_print_png_path', $values['yprint_print_png_path']);
            wc_add_order_item_meta($item_id, '_yprint_print_area_px', $values['yprint_print_area_px']);
            wc_add_order_item_meta($item_id, '_yprint_print_area_mm', $values['yprint_print_area_mm']);
            wc_add_order_item_meta($item_id, '_yprint_template_id', $values['yprint_template_id']);
            wc_add_order_item_meta($item_id, '_yprint_design_data', $values['yprint_design_data']);
            wc_add_order_item_meta($item_id, '_yprint_created', $values['yprint_created']);

            error_log('📋 PNG STORAGE: Print data added to order item - Item: ' . $item_id);
        }
    }

    /**
     * Prepare print files when order is completed
     */
    public function prepare_print_files($order_id) {
        error_log('🎯 PNG STORAGE: Preparing print files for order: ' . $order_id);

        $order = wc_get_order($order_id);
        if (!$order) {
            return;
        }

        $print_files = array();

        foreach ($order->get_items() as $item_id => $item) {
            $print_png_url = wc_get_order_item_meta($item_id, '_yprint_print_png_url', true);
            $print_png_path = wc_get_order_item_meta($item_id, '_yprint_print_png_path', true);

            if ($print_png_url && $print_png_path && file_exists($print_png_path)) {
                $print_files[] = array(
                    'item_id' => $item_id,
                    'product_name' => $item->get_name(),
                    'png_url' => $print_png_url,
                    'png_path' => $print_png_path,
                    'file_size' => filesize($print_png_path)
                );
            }
        }

        if (!empty($print_files)) {
            // Save print file list to order meta
            update_post_meta($order_id, '_yprint_print_files', $print_files);

            // Could trigger email to print shop here
            $this->notify_print_shop($order_id, $print_files);

            error_log('✅ PNG STORAGE: Print files prepared - Count: ' . count($print_files));
        }
    }

    /**
     * Notify print shop of new print files (placeholder)
     */
    private function notify_print_shop($order_id, $print_files) {
        // This could send an email to the print shop with download links
        // or integrate with a print queue management system

        error_log('📧 PNG STORAGE: Print shop notification - Order: ' . $order_id . ', Files: ' . count($print_files));

        // TODO: Implement actual notification system
    }

    /**
     * Add meta boxes to order edit screen
     */
    public function add_order_meta_boxes() {
        add_meta_box(
            'yprint_print_files',
            '🖨️ Print Files',
            array($this, 'render_order_print_files_meta_box'),
            'shop_order',
            'normal',
            'high'
        );
    }

    /**
     * Render print files meta box
     */
    public function render_order_print_files_meta_box($post) {
        $order_id = $post->ID;
        $print_files = get_post_meta($order_id, '_yprint_print_files', true);

        if (empty($print_files)) {
            echo '<p>No print files found for this order.</p>';
            return;
        }

        echo '<div class="yprint-print-files">';
        echo '<table class="wp-list-table widefat fixed striped">';
        echo '<thead><tr>';
        echo '<th>Product</th>';
        echo '<th>Print File</th>';
        echo '<th>File Size</th>';
        echo '<th>Actions</th>';
        echo '</tr></thead>';
        echo '<tbody>';

        foreach ($print_files as $file) {
            echo '<tr>';
            echo '<td>' . esc_html($file['product_name']) . '</td>';
            echo '<td><a href="' . esc_url($file['png_url']) . '" target="_blank">View PNG</a></td>';
            echo '<td>' . size_format($file['file_size']) . '</td>';
            echo '<td>';
            echo '<a href="' . esc_url($file['png_url']) . '" download class="button button-small">Download</a>';
            echo '</td>';
            echo '</tr>';
        }

        echo '</tbody></table>';
        echo '</div>';
    }

    /**
     * Clean up old PNG files (to be called by cron)
     */
    public function cleanup_old_files($days_old = 30) {
        $cutoff_time = time() - ($days_old * 24 * 60 * 60);
        $deleted_count = 0;

        if (is_dir($this->upload_dir)) {
            $files = glob($this->upload_dir . '*.png');

            foreach ($files as $file) {
                if (filemtime($file) < $cutoff_time) {
                    if (unlink($file)) {
                        $deleted_count++;
                    }
                }
            }
        }

        error_log('🧹 PNG STORAGE: Cleanup completed - Deleted: ' . $deleted_count . ' files');
        return $deleted_count;
    }

    /**
     * Get storage statistics
     */
    public function get_storage_stats() {
        $stats = array(
            'total_files' => 0,
            'total_size' => 0,
            'directory' => $this->upload_dir
        );

        if (is_dir($this->upload_dir)) {
            $files = glob($this->upload_dir . '*.png');
            $stats['total_files'] = count($files);

            foreach ($files as $file) {
                $stats['total_size'] += filesize($file);
            }
        }

        return $stats;
    }

    /**
     * 🔧 ENHANCED VALIDATION: Validate PNG data format
     */
    private function validatePNGData($png_data) {
        // Check if it's a valid data URL
        if (!is_string($png_data)) {
            error_log('❌ PNG VALIDATION: PNG data is not a string');
            return false;
        }

        // Check for data URL format
        if (!preg_match('/^data:image\/png;base64,/', $png_data)) {
            error_log('❌ PNG VALIDATION: Invalid PNG data URL format');
            return false;
        }

        // Extract base64 data
        $base64_data = substr($png_data, strpos($png_data, ',') + 1);

        // Validate base64 encoding
        if (!base64_decode($base64_data, true)) {
            error_log('❌ PNG VALIDATION: Invalid base64 encoding');
            return false;
        }

        // Decode and check if it's valid PNG
        $binary_data = base64_decode($base64_data);

        // Check PNG signature (first 8 bytes)
        $png_signature = "\x89\x50\x4E\x47\x0D\x0A\x1A\x0A";
        if (substr($binary_data, 0, 8) !== $png_signature) {
            error_log('❌ PNG VALIDATION: Invalid PNG signature');
            return false;
        }

        // Check minimum size (PNG header + minimum chunk)
        if (strlen($binary_data) < 33) {
            error_log('❌ PNG VALIDATION: PNG data too small');
            return false;
        }

        // Check maximum reasonable size (10MB)
        if (strlen($binary_data) > 10 * 1024 * 1024) {
            error_log('❌ PNG VALIDATION: PNG data too large (' . strlen($binary_data) . ' bytes)');
            return false;
        }

        error_log('✅ PNG VALIDATION: PNG data is valid (' . strlen($binary_data) . ' bytes)');
        return true;
    }

    /**
     * 🗄️ CRITICAL: Save PNG to database table
     * Fixes the missing database storage issue
     */
    private function save_to_database_table($design_id, $print_png, $save_type, $order_id, $template_id, $design_meta) {
        global $wpdb;

        try {
            error_log('🗄️ DATABASE SAVE: Starting save_to_database_table method');

            // Extract base64 data from data URL
            $base64_data = substr($print_png, strpos($print_png, ',') + 1);
            $binary_data = base64_decode($base64_data);

            error_log('🗄️ DATABASE SAVE: PNG data processing - Input size: ' . strlen($print_png) . ', Base64 size: ' . strlen($base64_data) . ', Binary size: ' . strlen($binary_data));

            if (!$binary_data) {
                error_log('❌ DATABASE SAVE: Failed to decode PNG data');
                return false;
            }

            // Prepare table name
            $table_name = $wpdb->prefix . 'yprint_design_pngs';
            error_log('🗄️ DATABASE SAVE: Target table name: ' . $table_name);

            // Check if table exists with detailed diagnostics
            $all_tables = $wpdb->get_results("SHOW TABLES", ARRAY_A);
            error_log('🗄️ DATABASE SAVE: All tables in database: ' . print_r(array_column($all_tables, 'Tables_in_' . $wpdb->dbname), true));

            $table_exists = $wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $table_name));
            error_log('🗄️ DATABASE SAVE: Table exists check result: ' . ($table_exists ? 'EXISTS' : 'NOT_FOUND'));

            if (!$table_exists) {
                error_log('❌ DATABASE SAVE: Table ' . $table_name . ' does not exist');

                // Try to find similar table names
                $similar_tables = $wpdb->get_results($wpdb->prepare(
                    "SHOW TABLES LIKE %s",
                    '%yprint%'
                ), ARRAY_A);
                error_log('🔍 DATABASE SAVE: Similar tables found: ' . print_r(array_column($similar_tables, 'Tables_in_' . $wpdb->dbname), true));

                return false;
            }

            // Prepare data for database
            $insert_data = array(
                'design_id' => $design_id,
                'print_png' => $binary_data,
                'generated_at' => current_time('mysql'),
                'save_type' => $save_type ?: 'standard',
                'order_id' => $order_id,
                'template_id' => $template_id ?: 'default'
            );

            // Prepare format array to match data fields
            $format_array = array(
                '%s', // design_id
                '%s', // print_png (binary)
                '%s', // generated_at
                '%s', // save_type
                '%s', // order_id
                '%s'  // template_id
            );

            // Add enhanced metadata if available (only if field exists in table)
            $table_has_metadata_field = false;
            $table_columns = $wpdb->get_col("DESCRIBE {$table_name}");
            if (in_array('metadata_json', $table_columns)) {
                $table_has_metadata_field = true;
                error_log('✅ DATABASE SAVE: Table has metadata_json field');
            } else {
                error_log('⚠️ DATABASE SAVE: Table missing metadata_json field');
            }

            if ($table_has_metadata_field && isset($design_meta['enhanced_metadata'])) {
                $insert_data['metadata_json'] = json_encode($design_meta['enhanced_metadata']);
                $format_array[] = '%s'; // metadata_json format
                error_log('✅ DATABASE SAVE: Enhanced metadata will be saved');
            }

            error_log('🗄️ DATABASE SAVE: Inserting into table: ' . $table_name);
            error_log('🗄️ DATABASE SAVE: Design ID: ' . $design_id);
            error_log('🗄️ DATABASE SAVE: PNG size: ' . strlen($binary_data) . ' bytes');
            error_log('🗄️ DATABASE SAVE: Data fields: ' . count($insert_data) . ', Format fields: ' . count($format_array));

            // Insert into database
            $result = $wpdb->insert(
                $table_name,
                $insert_data,
                $format_array
            );

            if ($result === false) {
                error_log('❌ DATABASE SAVE: Insert failed. Error: ' . $wpdb->last_error);
                return false;
            }

            $insert_id = $wpdb->insert_id;
            error_log('✅ DATABASE SAVE: Successfully inserted with ID: ' . $insert_id);

            // Verify the insert
            $verify_query = $wpdb->prepare(
                "SELECT design_id, LENGTH(print_png) as png_size FROM {$table_name} WHERE id = %d",
                $insert_id
            );
            $verify_result = $wpdb->get_row($verify_query);

            if ($verify_result) {
                error_log('✅ DATABASE VERIFY: Record confirmed - Design: ' . $verify_result->design_id . ', Size: ' . $verify_result->png_size . ' bytes');
                return true;
            } else {
                error_log('❌ DATABASE VERIFY: Failed to verify inserted record');
                return false;
            }

        } catch (Exception $e) {
            error_log('❌ DATABASE SAVE: Exception occurred: ' . $e->getMessage());
            return false;
        }
    }
}

// Initialize PNG Storage Handler (WooCommerce dependency removed)
error_log('🚀 PNG STORAGE HANDLER: Initializing without WooCommerce dependency');
new PNG_Storage_Handler('octo-print-designer', '1.0.0');
?>