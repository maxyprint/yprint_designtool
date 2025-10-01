<?php
class Octo_Print_Designer_Admin {
    private $plugin_name;
    private $version;
    private $template_manager;
    private $point_to_point_admin;

    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;

        $this->template_manager = new Octo_Print_Designer_Template();

        // Gap 2: Point-to-Point Admin Integration
        require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-point-to-point-admin.php';
        $this->point_to_point_admin = new Octo_Print_Designer_Point_To_Point_Admin($plugin_name, $version);

        $this->define_hooks();
    }

    private function define_hooks() {
        
        Octo_Print_Designer_Loader::$instance->add_action('admin_enqueue_scripts', $this, 'enqueue_styles');
        Octo_Print_Designer_Loader::$instance->add_action('admin_enqueue_scripts', $this, 'enqueue_scripts');
        Octo_Print_Designer_Loader::$instance->add_action('init', $this->template_manager, 'register_post_type');
        Octo_Print_Designer_Loader::$instance->add_action('add_meta_boxes', $this->template_manager, 'add_meta_boxes');
        Octo_Print_Designer_Loader::$instance->add_action('save_post_design_template', $this->template_manager, 'save_post');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_get_template_variations', $this->template_manager, 'get_variations');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_get_template_sizes', $this->template_manager, 'get_sizes');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_save_reference_line_data', $this, 'save_reference_line_data');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_delete_reference_line', $this, 'delete_reference_line');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_calculate_size_factors', $this, 'calculate_size_factors');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_sync_sizes_to_woocommerce', $this, 'sync_sizes_to_woocommerce');

        // NEW: Canvas-Meta-Fields Synchronization Bridge
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_sync_canvas_to_meta_fields', $this, 'sync_canvas_to_meta_fields');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_load_meta_fields_to_canvas', $this, 'load_meta_fields_to_canvas');

        // 🧠 AGENT 3 DELIVERABLE: Measurement Database AJAX Handlers
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_get_design_templates_for_measurements', $this, 'get_design_templates_for_measurements');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_get_template_sizes_for_measurements', $this, 'get_template_sizes_for_measurements');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_get_template_measurements_for_admin', $this, 'get_template_measurements_for_admin');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_save_template_measurements_from_admin', $this, 'save_template_measurements_from_admin');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_validate_template_measurements', $this, 'validate_template_measurements');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_sync_template_sizes_measurements', $this, 'sync_template_sizes_measurements');

        // 🎨 AGENT 2 DELIVERABLE: WooCommerce Order Design Preview Meta Box
        Octo_Print_Designer_Loader::$instance->add_action('add_meta_boxes_shop_order', $this, 'add_order_design_preview_meta_box');
        Octo_Print_Designer_Loader::$instance->add_action('add_meta_boxes_woocommerce_page_wc-orders', $this, 'add_order_design_preview_meta_box');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_get_order_design_preview', $this, 'get_order_design_preview');

    }

    public function enqueue_scripts($hook) {
        // 🧠 AGENT FIX: AdminContextOptimizer - Smart admin context detection

        // Detect admin context type for optimized script loading
        $is_template_page = $this->is_template_edit_page($hook);
        $is_woocommerce_page = $this->is_woocommerce_order_edit_page($hook);
        $admin_context = $this->detect_admin_context($hook);

        // 🔍 DEBUG: Enhanced logging with context detection
        $debug_script = "
        <script>
        console.log('🧠 [ADMIN OPTIMIZER] Hook: " . esc_js($hook) . "');
        console.log('🧠 [ADMIN OPTIMIZER] Template Page: " . ($is_template_page ? 'YES' : 'NO') . "');
        console.log('🧠 [ADMIN OPTIMIZER] WooCommerce Page: " . ($is_woocommerce_page ? 'YES' : 'NO') . "');
        console.log('🧠 [ADMIN OPTIMIZER] Admin Context: " . esc_js($admin_context) . "');
        </script>";

        echo $debug_script;

        // Optimized script loading based on admin context
        if (!$is_template_page && !$is_woocommerce_page) {
            echo "<script>console.log('🧠 [ADMIN OPTIMIZER] Skipping scripts - not applicable context');</script>";
            return;
        }

        echo "<script>console.log('🧠 [ADMIN OPTIMIZER] Loading optimized scripts for: " . esc_js($admin_context) . "');</script>";

        // 🎯 CRITICAL FIX: Context-optimized script loading
        $this->load_context_optimized_scripts($admin_context);

        wp_enqueue_media();

        // 🎯 AGENT 4: Hash-based bundle versioning for optimal browser caching
        // Use file hash instead of rand() to enable proper cache invalidation
        $vendor_bundle_hash = md5_file(OCTO_PRINT_DESIGNER_PATH . 'admin/js/dist/vendor.bundle.js');
        $admin_bundle_hash = md5_file(OCTO_PRINT_DESIGNER_PATH . 'admin/js/dist/admin.bundle.js');

        wp_enqueue_script(
            'octo-print-designer-vendor',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/dist/vendor.bundle.js',
            [], // no dependencies for vendor
            $vendor_bundle_hash,
            true
        );

        wp_enqueue_script(
            'octo-print-designer-admin',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/dist/admin.bundle.js',
            ['octo-print-designer-vendor'], // vendor bundle must load first
            $admin_bundle_hash,
            true
        );

        wp_enqueue_script(
            'octo-jquery-ui-compat-fix',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/jquery-ui-compat-fix.js',
            ['jquery'],
            $this->version . '.1',
            true
        );

        // 🔍 AGENT 7: SYSTEM VALIDATOR SCRIPT
        wp_enqueue_script(
            'octo-system-validator',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/system-validator.js',
            [], // No dependencies - standalone validator
            $this->version . '.validator',
            true
        );

        // 🎯 ARTEFAKT-GESTEUERTES SYSTEM: Admin Webpack Fabric Extraction
        // Phase 1: Immediate Fabric Extraction from Webpack Bundle
        wp_enqueue_script(
            'octo-webpack-fabric-extractor-admin',
            OCTO_PRINT_DESIGNER_URL . 'public/js/webpack-fabric-loader-optimized.js',
            ['octo-print-designer-vendor'], // Load immediately after vendor bundle
            $this->version . '.extractor-admin-v2',
            true
        );

        // Phase 2: Fabric Singleton Wrapper (only after extraction)
        wp_enqueue_script(
            'octo-fabric-canvas-singleton',
            OCTO_PRINT_DESIGNER_URL . 'public/js/fabric-canvas-singleton.js',
            ['octo-webpack-fabric-extractor-admin', 'jquery'], // After fabric is extracted and globally available
            $this->version . '.1-singleton',
            true
        );

        // Phase 3: Canvas Initialization Controller
        wp_enqueue_script(
            'octo-canvas-initialization-controller',
            OCTO_PRINT_DESIGNER_URL . 'public/js/canvas-initialization-controller.js',
            ['octo-fabric-canvas-singleton', 'jquery'],
            $this->version . '.1-controller',
            true
        );

        // Phase 4: Script Load Coordinator
        wp_enqueue_script(
            'octo-script-load-coordinator',
            OCTO_PRINT_DESIGNER_URL . 'public/js/script-load-coordinator.js',
            ['octo-canvas-initialization-controller', 'jquery'],
            $this->version . '.1-coordinator',
            true
        );

        // Phase 4: Fabric Global Exposure (Enhanced)
        wp_enqueue_script(
            'octo-fabric-global-exposure',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/fabric-global-exposure.js',
            ['octo-script-load-coordinator', 'octo-print-designer-admin', 'jquery'],
            $this->version . '.4-enhanced',
            true
        );

        // Phase 5: Optimized Canvas Detection (Performance Enhanced)
        wp_enqueue_script(
            'octo-optimized-canvas-detection',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/optimized-canvas-detection.js',
            ['octo-fabric-global-exposure'], // Minimal dependencies for performance
            $this->version . '.5-performance',
            true
        );

        // Phase 6: Optimized AJAX Manager (Performance Enhanced)
        wp_enqueue_script(
            'octo-optimized-ajax-manager',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/optimized-ajax-manager.js',
            ['jquery'], // Only requires jQuery for AJAX
            $this->version . '.6-ajax-performance',
            true
        );

        // Phase 7: Dependency Optimizer (Load Performance Monitor)
        wp_enqueue_script(
            'octo-dependency-optimizer',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/dependency-optimizer.js',
            [], // Load early to monitor other scripts
            $this->version . '.7-dependency-perf',
            false // Load in head for early monitoring
        );

        wp_enqueue_script(
            'octo-reference-line-system',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/reference-line-system.js',
            ['octo-fabric-global-exposure', 'octo-print-designer-vendor', 'octo-print-designer-admin', 'octo-optimized-canvas-detection', 'jquery'],
            $this->version . '.5',
            true
        );

        wp_enqueue_script(
            'octo-canvas-detection-test',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/canvas-detection-test.js',
            ['octo-reference-line-system', 'jquery'],
            $this->version . '.1',
            true
        );

        wp_enqueue_script(
            'octo-canvas-meta-fields-sync',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/canvas-meta-fields-sync.js',
            ['octo-reference-line-system', 'octo-optimized-canvas-detection', 'jquery'],
            $this->version . '.1',
            true
        );

        // 🎯 ADMIN CONTEXT FIX: Design Data Capture System Integration
        // CRITICAL: Enable generateDesignData() function in WordPress admin context
        if ($this->is_woocommerce_order_edit_page($hook)) {
            wp_enqueue_script(
                'octo-admin-optimized-capture',
                OCTO_PRINT_DESIGNER_URL . 'public/js/optimized-design-data-capture.js',
                ['octo-fabric-global-exposure'], // REMOVED jQuery dependency + reduced race conditions
                $this->version . '-race-condition-fix',
                true
            );

            wp_enqueue_script(
                'octo-admin-enhanced-json',
                OCTO_PRINT_DESIGNER_URL . 'public/js/enhanced-json-coordinate-system.js',
                ['octo-admin-optimized-capture'], // REMOVED jQuery dependency
                $this->version . '-jquery-free-json',
                true
            );

            // 🎨 AGENT 3: WooCommerce Admin Canvas Rendering System
            // Phase 1: Admin Canvas Renderer (Pure Vanilla JS, no dependencies)
            wp_enqueue_script(
                'octo-admin-canvas-renderer',
                OCTO_PRINT_DESIGNER_URL . 'admin/js/admin-canvas-renderer.js',
                [], // NO dependencies - pure vanilla JS
                $this->version . '.agent3-v1',
                true
            );

            // Phase 2: Design Preview Generator (Data Processing Engine)
            wp_enqueue_script(
                'octo-design-preview-generator',
                OCTO_PRINT_DESIGNER_URL . 'admin/js/design-preview-generator.js',
                ['octo-admin-canvas-renderer'], // Only depends on canvas renderer
                $this->version . '.agent3-v1',
                true
            );

            // Phase 3: Admin Preview Integration (WooCommerce Integration Layer)
            wp_enqueue_script(
                'octo-admin-preview-integration',
                OCTO_PRINT_DESIGNER_URL . 'admin/js/admin-preview-integration.js',
                ['octo-design-preview-generator'], // Complete dependency chain
                $this->version . '.agent3-v1',
                true
            );

            // 🎯 AGENT 3: WooCommerce Order Preview Integration
            // Phase 4: Order-specific preview event listener (connects meta box with rendering system)
            wp_enqueue_script(
                'octo-woocommerce-order-preview',
                OCTO_PRINT_DESIGNER_URL . 'admin/js/woocommerce-order-preview.js',
                ['octo-admin-preview-integration'], // Depends on preview integration
                $this->version . '.agent3-order-v1',
                true
            );
        }

        // 🧪 Load test suite in development mode (WP_DEBUG enabled)
        if (defined('WP_DEBUG') && WP_DEBUG) {
            wp_enqueue_script(
                'octo-canvas-meta-sync-tests',
                OCTO_PRINT_DESIGNER_URL . 'admin/js/canvas-meta-sync-test.js',
                ['octo-canvas-meta-fields-sync', 'jquery'],
                $this->version . '.1',
                true
            );
        }

        // Admin Console Log Copier (Admin-only)
        if (current_user_can('administrator')) {
            wp_enqueue_script(
                'octo-admin-console-log-copier',
                OCTO_PRINT_DESIGNER_URL . 'admin/js/admin-console-log-copier.js',
                ['jquery'],
                $this->version . '.console-copier',
                true
            );
        }

        wp_localize_script('octo-print-designer-admin', 'octoPrintDesigner', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('octo_print_designer_nonce'),
            'postId' => get_the_ID()
        ]);

        // Admin-specific localization for console log copier
        if (current_user_can('administrator')) {
            wp_localize_script('octo-print-designer-admin', 'octoPrintDesignerAdmin', [
                'isAdmin' => true,
                'userId' => get_current_user_id(),
                'userRole' => 'administrator'
            ]);
        }

        // NEW: Canvas-Meta-Fields Sync Configuration
        wp_localize_script('octo-print-designer-admin', 'octoPrintDesignerSync', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'syncNonce' => wp_create_nonce('octo_canvas_meta_sync'),
            'postId' => get_the_ID(),
            'autoSyncEnabled' => true,
            'debounceDelay' => 1000
        ]);

    }

    public function enqueue_styles($hook) {
        // Template edit page styles
        if ($this->is_template_edit_page($hook)) {
            wp_enqueue_style(
                'octo-print-designer-admin',
                plugin_dir_url(__FILE__) . 'css/octo-print-designer-admin.css',
                [],
                $this->version
            );

            // 🎨 AGENT 6: PROFESSIONAL UI ENHANCEMENT STYLES
            wp_enqueue_style(
                'octo-print-designer-admin-ui-enhancement',
                plugin_dir_url(__FILE__) . 'css/admin-ui-enhancement.css',
                ['octo-print-designer-admin'], // Load after base admin styles
                $this->version . '.ui-enhanced'
            );

            // 🧠 AGENT 5 DELIVERABLE: Measurement Table Styling
            wp_enqueue_style(
                'octo-measurement-table-styling',
                plugin_dir_url(__FILE__) . 'css/measurement-table-styling.css',
                ['octo-print-designer-admin-ui-enhancement'],
                $this->version . '.measurement'
            );
        }

        // 🎨 AGENT 5 DELIVERABLE: WooCommerce Order Design Preview Styles
        // Only load on WooCommerce order pages
        if ($this->is_woocommerce_order_edit_page($hook)) {
            wp_enqueue_style(
                'octo-order-design-preview',
                plugin_dir_url(__FILE__) . 'css/order-design-preview.css',
                [], // No dependencies - standalone styles
                $this->version . '.order-preview'
            );
        }
    }

    private function is_template_edit_page($hook) {
        if (!in_array($hook, ['post.php', 'post-new.php'])) return false;

        $screen = get_current_screen();
        return $screen && $screen->post_type === 'design_template';
    }

    // 🎯 ADMIN CONTEXT FIX: WooCommerce Order Page Detection
    private function is_woocommerce_order_edit_page($hook) {
        // 🚨 CRITICAL FIX: WooCommerce uses 'woocommerce_page_wc-orders' hook, not 'post.php'!
        $wc_order_hooks = ['post.php', 'post-new.php', 'woocommerce_page_wc-orders'];
        if (!in_array($hook, $wc_order_hooks)) return false;

        $screen = get_current_screen();
        if (!$screen) return false;

        // Check for WooCommerce order edit pages
        return $screen->post_type === 'shop_order' ||
               $screen->id === 'woocommerce_page_wc-orders' ||  // NEW: Modern WC orders page
               (isset($_GET['post_type']) && $_GET['post_type'] === 'shop_order') ||
               (isset($_GET['post']) && get_post_type($_GET['post']) === 'shop_order');
    }

    public function save_reference_line_data() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_print_designer_nonce')) {
            wp_die('Security check failed');
        }

        // Check permissions
        if (!current_user_can('edit_posts')) {
            wp_die('Insufficient permissions');
        }

        $post_id = intval($_POST['post_id']);
        $reference_data = sanitize_textarea_field($_POST['reference_data']);

        if (!$post_id || !$reference_data) {
            wp_send_json_error('Missing required data');
            return;
        }

        // Validate JSON
        $decoded_data = json_decode($reference_data, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json_error('Invalid JSON data');
            return;
        }

        // Get existing reference lines
        $existing_lines = get_post_meta($post_id, '_reference_lines_data', true);
        if (!is_array($existing_lines)) {
            $existing_lines = [];
        }

        // Add new reference line
        $existing_lines[] = $decoded_data;

        // Save updated reference lines
        $saved = update_post_meta($post_id, '_reference_lines_data', $existing_lines);

        if ($saved !== false) {
            wp_send_json_success([
                'message' => 'Reference line saved successfully',
                'reference_id' => count($existing_lines) - 1,
                'total_lines' => count($existing_lines)
            ]);
        } else {
            wp_send_json_error('Failed to save reference line data');
        }
    }

    public function delete_reference_line() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_template_nonce_action')) {
            wp_die('Security check failed');
        }

        // Check permissions
        if (!current_user_can('edit_posts')) {
            wp_die('Insufficient permissions');
        }

        $post_id = intval($_POST['post_id']);
        $line_index = intval($_POST['line_index']);

        if (!$post_id || $line_index < 0) {
            wp_send_json_error('Missing or invalid data');
            return;
        }

        // Get existing reference lines
        $existing_lines = get_post_meta($post_id, '_reference_lines_data', true);
        if (!is_array($existing_lines)) {
            wp_send_json_error('No reference lines found');
            return;
        }

        // Check if index exists
        if (!isset($existing_lines[$line_index])) {
            wp_send_json_error('Reference line not found');
            return;
        }

        // Remove the line at the specified index
        array_splice($existing_lines, $line_index, 1);

        // Save updated reference lines
        $saved = update_post_meta($post_id, '_reference_lines_data', $existing_lines);

        if ($saved !== false) {
            wp_send_json_success([
                'message' => 'Reference line deleted successfully',
                'remaining_lines' => count($existing_lines)
            ]);
        } else {
            wp_send_json_error('Failed to delete reference line');
        }
    }

    public function calculate_size_factors() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_size_definitions_nonce_action')) {
            wp_die('Security check failed');
        }

        // Check permissions
        if (!current_user_can('edit_posts')) {
            wp_die('Insufficient permissions');
        }

        $post_id = intval($_POST['post_id']);
        if (!$post_id) {
            wp_send_json_error(['message' => 'Missing post ID']);
            return;
        }

        // Parse form data
        parse_str($_POST['form_data'], $form_data);

        if (!isset($form_data['size_definitions']) || !is_array($form_data['size_definitions'])) {
            wp_send_json_error(['message' => 'No size definitions found']);
            return;
        }

        // Get reference lines
        $reference_lines = get_post_meta($post_id, '_reference_lines_data', true);
        if (!is_array($reference_lines)) {
            wp_send_json_error(['message' => 'No reference lines found']);
            return;
        }

        $size_calculations = [];

        // Calculate scale factors for each size definition
        foreach ($form_data['size_definitions'] as $size_def) {
            if (empty($size_def['size']) || empty($size_def['target_mm']) || !isset($size_def['reference_type'])) {
                continue;
            }

            $reference_index = intval($size_def['reference_type']);
            if (!isset($reference_lines[$reference_index])) {
                continue;
            }

            $reference_line = $reference_lines[$reference_index];
            $target_mm = floatval($size_def['target_mm']);

            // For calculation, we need to know the real-world measurement of the reference line
            // We'll assume the reference line represents a standard measurement (e.g., Medium = reference)
            // User should define what the reference line represents in millimeters
            $reference_mm = $this->estimate_reference_measurement($reference_line, $target_mm);

            // Calculate scale factor
            $scale_factor = $target_mm / $reference_mm;

            $size_calculations[] = [
                'size' => sanitize_text_field($size_def['size']),
                'target_mm' => $target_mm,
                'reference_mm' => $reference_mm,
                'scale_factor' => $scale_factor,
                'reference_index' => $reference_index,
                'reference_type' => $reference_line['type']
            ];
        }

        // Save size definitions
        update_post_meta($post_id, '_size_definitions', $form_data['size_definitions']);

        // Save calculations
        update_post_meta($post_id, '_size_calculations', $size_calculations);

        wp_send_json_success([
            'message' => 'Size factors calculated successfully',
            'calculations' => $size_calculations
        ]);
    }

    public function sync_sizes_to_woocommerce() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_size_definitions_nonce_action')) {
            wp_die('Security check failed');
        }

        // Check permissions
        if (!current_user_can('edit_posts')) {
            wp_die('Insufficient permissions');
        }

        $post_id = intval($_POST['post_id']);
        if (!$post_id) {
            wp_send_json_error(['message' => 'Missing post ID']);
            return;
        }

        // Get size calculations
        $size_calculations = get_post_meta($post_id, '_size_calculations', true);
        if (!is_array($size_calculations) || empty($size_calculations)) {
            wp_send_json_error(['message' => 'No size calculations found. Please calculate sizes first.']);
            return;
        }

        // Convert to WooCommerce sizing chart format
        $wc_sizing_chart = [];
        foreach ($size_calculations as $calc) {
            $wc_sizing_chart[$calc['size']] = $calc['scale_factor'];
        }

        // Find connected WooCommerce products (assuming template is linked to products)
        $connected_products = $this->find_connected_products($post_id);

        if (empty($connected_products)) {
            // Save as template-level sizing chart for future use
            update_post_meta($post_id, '_wc_sizing_chart', json_encode($wc_sizing_chart));

            wp_send_json_success([
                'message' => 'Sizing chart saved to template. Connect to WooCommerce products to sync automatically.',
                'sizing_chart' => $wc_sizing_chart
            ]);
            return;
        }

        // Sync to connected products
        $synced_products = [];
        foreach ($connected_products as $product_id) {
            update_post_meta($product_id, '_sizing_chart_json', json_encode($wc_sizing_chart));
            $synced_products[] = $product_id;
        }

        wp_send_json_success([
            'message' => 'Successfully synced to ' . count($synced_products) . ' WooCommerce products',
            'sizing_chart' => $wc_sizing_chart,
            'synced_products' => $synced_products
        ]);
    }

    private function estimate_reference_measurement($reference_line, $target_mm) {
        // This is a simplified estimation
        // In a real scenario, user should define what the reference line represents
        // For now, we'll assume the reference line is the "Medium" size equivalent

        // If target is provided, we'll use a heuristic based on common sizing
        // Chest width: S=400mm, M=450mm, L=500mm, XL=550mm (typical T-shirt)
        // Height: S=680mm, M=720mm, L=760mm, XL=800mm (typical T-shirt)

        if ($reference_line['type'] === 'chest_width') {
            return 450.0; // Assume reference line represents Medium chest width
        } elseif ($reference_line['type'] === 'shoulder_height') {
            return 720.0; // Assume reference line represents Medium height
        }

        // Fallback: use target as reference (scale factor = 1.0)
        return $target_mm;
    }

    private function find_connected_products($template_id) {
        // Query products that use this template
        $products = get_posts([
            'post_type' => 'product',
            'meta_query' => [
                [
                    'key' => '_design_template_id',
                    'value' => $template_id,
                    'compare' => '='
                ]
            ],
            'posts_per_page' => -1,
            'fields' => 'ids'
        ]);

        return $products;
    }

    /**
     * 🚀 CANVAS-META-FIELDS SYNCHRONIZATION BRIDGE
     * Automatic bidirectional sync between Canvas coordinates and WordPress Meta-Fields
     * Eliminates manual JSON copy-paste workflow completely
     */

    /**
     * Sync Canvas data to Meta-Fields automatically
     * AJAX Handler: wp_ajax_sync_canvas_to_meta_fields
     */
    public function sync_canvas_to_meta_fields() {
        // Enhanced security validation
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_canvas_meta_sync')) {
            wp_send_json_error([
                'message' => 'Security check failed',
                'code' => 'SECURITY_FAILED'
            ]);
            return;
        }

        // Check permissions
        if (!current_user_can('edit_posts')) {
            wp_send_json_error([
                'message' => 'Insufficient permissions',
                'code' => 'PERMISSION_DENIED'
            ]);
            return;
        }

        $post_id = intval($_POST['post_id']);
        $canvas_data = sanitize_textarea_field($_POST['canvas_data']);
        $meta_fields_data = sanitize_textarea_field($_POST['meta_fields_data']);

        if (!$post_id) {
            wp_send_json_error([
                'message' => 'Missing post ID',
                'code' => 'MISSING_POST_ID'
            ]);
            return;
        }

        // Validate JSON data
        $decoded_canvas = json_decode($canvas_data, true);
        $decoded_meta = json_decode($meta_fields_data, true);

        if (json_last_error() !== JSON_ERROR_NONE) {
            wp_send_json_error([
                'message' => 'Invalid JSON data: ' . json_last_error_msg(),
                'code' => 'INVALID_JSON'
            ]);
            return;
        }

        // Validate Canvas data structure
        if (!$this->validate_canvas_data($decoded_canvas)) {
            wp_send_json_error([
                'message' => 'Invalid Canvas data structure',
                'code' => 'INVALID_CANVAS_DATA'
            ]);
            return;
        }

        // Save Canvas data (preserve existing functionality)
        $existing_lines = get_post_meta($post_id, '_reference_lines_data', true);
        if (!is_array($existing_lines)) {
            $existing_lines = [];
        }

        // Add timestamp and source info
        $decoded_canvas['timestamp'] = current_time('mysql');
        $decoded_canvas['source'] = 'canvas_sync';
        $existing_lines[] = $decoded_canvas;

        update_post_meta($post_id, '_reference_lines_data', $existing_lines);

        // 🎯 AUTO-POPULATE META-FIELDS (Eliminate manual entry)
        $meta_updates = [];
        foreach ($decoded_meta as $field_key => $field_value) {
            $meta_key = '_' . sanitize_key($field_key);
            $sanitized_value = is_string($field_value) ? sanitize_text_field($field_value) : $field_value;

            update_post_meta($post_id, $meta_key, $sanitized_value);
            $meta_updates[$field_key] = $sanitized_value;
        }

        // Auto-trigger size calculations if applicable
        if (isset($decoded_canvas['referenceLines']) && !empty($decoded_canvas['referenceLines'])) {
            $calculation_result = $this->auto_calculate_size_factors($post_id, $decoded_canvas);
        }

        // Success response with comprehensive data
        wp_send_json_success([
            'message' => 'Canvas synchronized to Meta-Fields successfully',
            'meta_fields' => $meta_updates,
            'canvas_data' => $decoded_canvas,
            'reference_line_id' => count($existing_lines) - 1,
            'calculation_triggered' => isset($calculation_result),
            'timestamp' => current_time('c')
        ]);
    }

    /**
     * Load Meta-Fields data back to Canvas (reverse sync)
     * AJAX Handler: wp_ajax_load_meta_fields_to_canvas
     */
    public function load_meta_fields_to_canvas() {
        // Security validation
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_canvas_meta_sync')) {
            wp_send_json_error([
                'message' => 'Security check failed',
                'code' => 'SECURITY_FAILED'
            ]);
            return;
        }

        if (!current_user_can('edit_posts')) {
            wp_send_json_error([
                'message' => 'Insufficient permissions',
                'code' => 'PERMISSION_DENIED'
            ]);
            return;
        }

        $post_id = intval($_POST['post_id']);
        if (!$post_id) {
            wp_send_json_error([
                'message' => 'Missing post ID',
                'code' => 'MISSING_POST_ID'
            ]);
            return;
        }

        // Collect Meta-Fields data
        $meta_data = [
            'base_coordinate_x' => get_post_meta($post_id, '_base_coordinate_x', true),
            'base_coordinate_y' => get_post_meta($post_id, '_base_coordinate_y', true),
            'base_width' => get_post_meta($post_id, '_base_width', true),
            'base_height' => get_post_meta($post_id, '_base_height', true),
            'scalable_area_coordinates' => get_post_meta($post_id, '_scalable_area_coordinates', true),
            'reference_lines_data' => get_post_meta($post_id, '_reference_lines_data', true),
            'size_calculation_method' => get_post_meta($post_id, '_size_calculation_method', true)
        ];

        // Transform Meta-Fields data to Canvas format
        $canvas_data = $this->transform_meta_fields_to_canvas($meta_data);

        if (!$canvas_data) {
            wp_send_json_error([
                'message' => 'No valid Canvas data found in Meta-Fields',
                'code' => 'NO_CANVAS_DATA'
            ]);
            return;
        }

        wp_send_json_success([
            'message' => 'Meta-Fields data loaded for Canvas',
            'canvas_data' => $canvas_data,
            'meta_fields' => $meta_data,
            'timestamp' => current_time('c')
        ]);
    }

    /**
     * Validate Canvas data structure for security and integrity
     */
    private function validate_canvas_data($data) {
        if (!is_array($data)) {
            return false;
        }

        // Define expected structure
        $allowed_keys = ['referenceLines', 'scalableArea', 'baseCoordinates', 'baseDimensions', 'calculationMethod', 'timestamp', 'source'];

        // Check for invalid keys
        foreach (array_keys($data) as $key) {
            if (!in_array($key, $allowed_keys)) {
                error_log("Canvas data validation failed: unexpected key '$key'");
                return false;
            }
        }

        // Validate reference lines structure if present
        if (isset($data['referenceLines']) && is_array($data['referenceLines'])) {
            foreach ($data['referenceLines'] as $line) {
                if (!isset($line['coordinates']) || !isset($line['type'])) {
                    return false;
                }
            }
        }

        return true;
    }

    /**
     * Transform Meta-Fields data to Canvas-compatible format
     */
    private function transform_meta_fields_to_canvas($meta_data) {
        $canvas_data = [];

        // Transform base coordinates
        if (!empty($meta_data['base_coordinate_x']) && !empty($meta_data['base_coordinate_y'])) {
            $canvas_data['baseCoordinates'] = [
                'x' => floatval($meta_data['base_coordinate_x']),
                'y' => floatval($meta_data['base_coordinate_y'])
            ];
        }

        // Transform base dimensions
        if (!empty($meta_data['base_width']) && !empty($meta_data['base_height'])) {
            $canvas_data['baseDimensions'] = [
                'width' => floatval($meta_data['base_width']),
                'height' => floatval($meta_data['base_height'])
            ];
        }

        // Transform scalable area
        if (!empty($meta_data['scalable_area_coordinates'])) {
            $scalable_area = json_decode($meta_data['scalable_area_coordinates'], true);
            if ($scalable_area && json_last_error() === JSON_ERROR_NONE) {
                $canvas_data['scalableArea'] = $scalable_area;
            }
        }

        // Transform reference lines
        if (!empty($meta_data['reference_lines_data'])) {
            if (is_array($meta_data['reference_lines_data'])) {
                $canvas_data['referenceLines'] = $meta_data['reference_lines_data'];
            } else {
                $reference_lines = json_decode($meta_data['reference_lines_data'], true);
                if ($reference_lines && json_last_error() === JSON_ERROR_NONE) {
                    $canvas_data['referenceLines'] = $reference_lines;
                }
            }
        }

        // Add calculation method
        if (!empty($meta_data['size_calculation_method'])) {
            $canvas_data['calculationMethod'] = $meta_data['size_calculation_method'];
        }

        return !empty($canvas_data) ? $canvas_data : null;
    }

    /**
     * Auto-trigger size factor calculations (enhanced version)
     */
    private function auto_calculate_size_factors($post_id, $canvas_data) {
        if (!isset($canvas_data['referenceLines']) || empty($canvas_data['referenceLines'])) {
            return false;
        }

        // Get existing size definitions
        $size_definitions = get_post_meta($post_id, '_size_definitions', true);
        if (!is_array($size_definitions) || empty($size_definitions)) {
            // Create default size definitions if none exist
            $size_definitions = [
                ['size' => 'S', 'target_mm' => 400, 'reference_type' => 0],
                ['size' => 'M', 'target_mm' => 450, 'reference_type' => 0],
                ['size' => 'L', 'target_mm' => 500, 'reference_type' => 0],
                ['size' => 'XL', 'target_mm' => 550, 'reference_type' => 0]
            ];
            update_post_meta($post_id, '_size_definitions', $size_definitions);
        }

        // Calculate size factors using existing logic
        $size_calculations = [];
        foreach ($size_definitions as $size_def) {
            if (empty($size_def['size']) || empty($size_def['target_mm'])) {
                continue;
            }

            $reference_index = intval($size_def['reference_type']);
            if (!isset($canvas_data['referenceLines'][$reference_index])) {
                continue;
            }

            $reference_line = $canvas_data['referenceLines'][$reference_index];
            $target_mm = floatval($size_def['target_mm']);
            $reference_mm = $this->estimate_reference_measurement($reference_line, $target_mm);
            $scale_factor = $target_mm / $reference_mm;

            $size_calculations[] = [
                'size' => sanitize_text_field($size_def['size']),
                'target_mm' => $target_mm,
                'reference_mm' => $reference_mm,
                'scale_factor' => $scale_factor,
                'reference_index' => $reference_index,
                'reference_type' => $reference_line['type'] ?? 'unknown',
                'auto_calculated' => true,
                'timestamp' => current_time('mysql')
            ];
        }

        // Save calculations
        if (!empty($size_calculations)) {
            update_post_meta($post_id, '_size_calculations', $size_calculations);
            return true;
        }

        return false;
    }

    /**
     * 🧠 AGENT METHOD: AdminContextOptimizer - Detect admin context type
     */
    private function detect_admin_context($hook) {
        if ($this->is_template_edit_page($hook)) {
            return 'template_editor';
        } elseif ($this->is_woocommerce_order_edit_page($hook)) {
            return 'woocommerce_admin';
        } else {
            return 'other_admin';
        }
    }

    /**
     * 🧠 AGENT METHOD: AdminContextOptimizer - Load context-optimized scripts
     */
    private function load_context_optimized_scripts($admin_context) {
        switch ($admin_context) {
            case 'template_editor':
                $this->load_full_editor_scripts();
                break;

            case 'woocommerce_admin':
                $this->load_preview_only_scripts();
                break;

            default:
                // No scripts needed for other admin contexts
                break;
        }
    }

    /**
     * 🧠 AGENT METHOD: AdminContextOptimizer - Load full editor scripts
     */
    private function load_full_editor_scripts() {
        echo "<script>console.log('🧠 [ADMIN OPTIMIZER] Loading full editor scripts');</script>";

        // Continue with existing full script loading logic
        // (keeping existing enqueue logic intact)
    }

    /**
     * 🧠 AGENT METHOD: AdminContextOptimizer - Load preview-only scripts (lightweight)
     */
    private function load_preview_only_scripts() {
        echo "<script>console.log('🧠 [ADMIN OPTIMIZER] Loading lightweight preview scripts');</script>";

        // Load only essential scripts for design preview
        wp_enqueue_script('jquery');

        // Emergency Fabric.js loader (bypasses webpack issues)
        wp_enqueue_script(
            'octo-emergency-fabric-loader',
            OCTO_PRINT_DESIGNER_URL . 'public/js/emergency-fabric-loader.js',
            ['jquery'],
            $this->version . '-emergency',
            true
        );

        // Design data capture (lightweight version)
        wp_enqueue_script(
            'octo-admin-design-capture',
            OCTO_PRINT_DESIGNER_URL . 'public/js/optimized-design-data-capture.js',
            ['octo-emergency-fabric-loader'],
            $this->version . '-admin',
            true
        );

        // Admin context flag
        wp_localize_script('octo-admin-design-capture', 'octoAdminContext', [
            'context' => 'woocommerce_admin',
            'skip_canvas_polling' => true,
            'enable_modal_preview' => true,
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('design_preview_nonce')
        ]);

        echo "<script>console.log('🧠 [ADMIN OPTIMIZER] Preview scripts loaded - canvas polling disabled');</script>";
    }

    // 🧠 AGENT 3 DELIVERABLE: Measurement Database AJAX Handler Methods

    /**
     * Get all design templates for measurement management
     */
    public function get_design_templates_for_measurements() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }

        $templates = get_posts([
            'post_type' => 'design_template',
            'post_status' => 'publish',
            'posts_per_page' => -1,
            'orderby' => 'title',
            'order' => 'ASC'
        ]);

        $template_data = [];
        foreach ($templates as $template) {
            $template_data[] = [
                'id' => $template->ID,
                'title' => $template->post_title
            ];
        }

        wp_send_json_success($template_data);
    }

    /**
     * Get Template Sizes for a specific template
     */
    public function get_template_sizes_for_measurements() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }

        $template_id = intval($_POST['template_id']);
        if (!$template_id) {
            wp_send_json_error('Missing template ID');
            return;
        }

        // Use TemplateMeasurementManager to get sizes
        if (class_exists('TemplateMeasurementManager')) {
            $manager = new TemplateMeasurementManager();
            $sizes = $manager->get_template_sizes($template_id);
            wp_send_json_success($sizes);
        } else {
            wp_send_json_error('TemplateMeasurementManager not available');
        }
    }

    /**
     * Get measurements for admin interface
     */
    public function get_template_measurements_for_admin() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }

        $template_id = intval($_POST['template_id']);
        if (!$template_id) {
            wp_send_json_error('Missing template ID');
            return;
        }

        if (class_exists('TemplateMeasurementManager')) {
            $manager = new TemplateMeasurementManager();
            $measurements = $manager->get_measurements($template_id);
            $sizes = $manager->get_template_sizes($template_id);

            wp_send_json_success([
                'measurements' => $measurements,
                'sizes' => $sizes
            ]);
        } else {
            wp_send_json_error('TemplateMeasurementManager not available');
        }
    }

    /**
     * Save measurements from admin interface
     */
    public function save_template_measurements_from_admin() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }

        // 🧠 AGENT DEBUG: Log all received POST data
        error_log('🔍 AJAX DEBUG - Full $_POST data: ' . print_r($_POST, true));

        $template_id = intval($_POST['template_id']); // 🧠 AGENT-4 FIX: Match working pattern
        $measurements_raw = $_POST['measurements'] ?? null;

        // 🧠 AGENT-4 FINAL: Direct measurement data handling with comprehensive debugging
        $measurements = $_POST['measurements'] ?? null;

        // 🧠 AGENT-4 DEBUG: Comprehensive data structure analysis
        error_log('🔍 PHP FINAL DEBUG - template_id: ' . $template_id);
        error_log('🔍 PHP FINAL DEBUG - measurements type: ' . gettype($measurements));
        error_log('🔍 PHP FINAL DEBUG - measurements is_array: ' . (is_array($measurements) ? 'YES' : 'NO'));
        error_log('🔍 PHP FINAL DEBUG - measurements empty: ' . (empty($measurements) ? 'YES' : 'NO'));
        error_log('🔍 PHP FINAL DEBUG - measurements count: ' . (is_array($measurements) ? count($measurements) : 'NOT_ARRAY'));
        error_log('🔍 PHP FINAL DEBUG - measurements content: ' . print_r($measurements, true));

        if (is_array($measurements)) {
            error_log('🔍 PHP FINAL DEBUG - measurements keys: ' . implode(', ', array_keys($measurements)));
        }

        if (!$template_id || !$measurements) {
            $error_msg = sprintf(
                'Missing template ID (%s) or measurements data (%s)',
                $template_id ? 'OK' : 'MISSING',
                $measurements ? 'OK' : 'MISSING'
            );
            error_log('❌ AJAX DEBUG - Error: ' . $error_msg);
            wp_send_json_error($error_msg);
            return;
        }

        if (class_exists('TemplateMeasurementManager')) {
            $manager = new TemplateMeasurementManager();

            // Validate measurements first
            $validation_errors = $manager->validate_measurements($measurements);
            if (!empty($validation_errors)) {
                wp_send_json_error('Validation failed: ' . implode(', ', $validation_errors));
                return;
            }

            $result = $manager->save_measurements($template_id, $measurements);
            if ($result) {
                wp_send_json_success('Measurements saved successfully');
            } else {
                wp_send_json_error('Failed to save measurements');
            }
        } else {
            wp_send_json_error('TemplateMeasurementManager not available');
        }
    }

    /**
     * Validate measurements precision
     */
    public function validate_template_measurements() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }

        $template_id = intval($_POST['template_id']);
        if (!$template_id) {
            wp_send_json_error('Missing template ID');
            return;
        }

        if (class_exists('MeasurementValidationFramework')) {
            $validator = new MeasurementValidationFramework();
            $validation_results = $validator->validate_complete_system($template_id);
            wp_send_json_success($validation_results);
        } else {
            wp_send_json_error('Validation framework not available');
        }
    }

    /**
     * Sync Template Sizes with measurement table
     */
    public function sync_template_sizes_measurements() {
        if (!current_user_can('manage_options')) {
            wp_send_json_error('Insufficient permissions');
            return;
        }

        $template_id = intval($_POST['template_id']);
        if (!$template_id) {
            wp_send_json_error('Missing template ID');
            return;
        }

        if (class_exists('TemplateMeasurementManager')) {
            $manager = new TemplateMeasurementManager();
            $result = $manager->sync_with_template_sizes($template_id);

            if ($result) {
                wp_send_json_success('Template Sizes synchronized successfully');
            } else {
                wp_send_json_error('Failed to sync Template Sizes');
            }
        } else {
            wp_send_json_error('TemplateMeasurementManager not available');
        }
    }

    /**
     * 🎨 WOOCOMMERCE ORDER DESIGN PREVIEW
     * AJAX Handler: Get design data from order for preview generation
     *
     * Security: Nonce validation + capability checks
     * Data Flow: Order Meta -> Design Data -> Canvas Dimensions -> JSON Response
     * Error Handling: Comprehensive validation at each step
     */
    public function get_order_design_preview() {
        // 🔒 SECURITY: Nonce validation
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'design_preview_nonce')) {
            error_log('❌ DESIGN PREVIEW: Security check failed - invalid nonce');
            wp_send_json_error([
                'message' => 'Security check failed',
                'code' => 'SECURITY_FAILED'
            ]);
            return;
        }

        // 🔒 SECURITY: Permission validation
        if (!current_user_can('edit_shop_orders') && !current_user_can('manage_woocommerce')) {
            error_log('❌ DESIGN PREVIEW: Insufficient permissions');
            wp_send_json_error([
                'message' => 'Insufficient permissions',
                'code' => 'PERMISSION_DENIED'
            ]);
            return;
        }

        // 📦 VALIDATION: Order ID
        $order_id = intval($_POST['order_id'] ?? 0);
        if (!$order_id) {
            error_log('❌ DESIGN PREVIEW: Missing order ID');
            wp_send_json_error([
                'message' => 'Missing order ID',
                'code' => 'MISSING_ORDER_ID'
            ]);
            return;
        }

        // 📦 VALIDATION: Order existence
        $order = wc_get_order($order_id);
        if (!$order) {
            error_log('❌ DESIGN PREVIEW: Order not found - ID: ' . $order_id);
            wp_send_json_error([
                'message' => 'Order not found',
                'code' => 'ORDER_NOT_FOUND',
                'order_id' => $order_id
            ]);
            return;
        }

        // 🔍 AGENT 7 FIX: Use comprehensive data extraction instead of simple meta check
        $wc_integration = Octo_Print_Designer_WC_Integration::get_instance();

        error_log('🔍 AGENT 7: Attempting comprehensive design data extraction for order ' . $order_id);

        // Try comprehensive extraction first (handles both _design_data and _db_processed_views)
        $extracted_data = $wc_integration->extract_design_data_with_canvas_metadata($order_id);

        $design_data = null;
        $mockup_url = null;

        if ($extracted_data && is_array($extracted_data)) {
            error_log('✅ AGENT 7: Successfully extracted design data via comprehensive method');

            // Use extracted data for preview
            $design_data = $extracted_data;

            // Try to extract mockup URL from design elements
            if (isset($extracted_data['design_elements']) && is_array($extracted_data['design_elements'])) {
                foreach ($extracted_data['design_elements'] as $element) {
                    if (isset($element['element_data']['backgroundImage'])) {
                        $mockup_url = $element['element_data']['backgroundImage'];
                        error_log('🔍 AGENT 7: Found mockup in design elements: ' . $mockup_url);
                        break;
                    }
                }
            }

            // Fallback: Try order meta for mockup
            if (!$mockup_url) {
                $mockup_url = $order->get_meta('_mockup_image_url', true);
                if ($mockup_url) {
                    error_log('🔍 AGENT 7: Found mockup in order meta: ' . $mockup_url);
                }
            }

        } else {
            // Fallback to original method
            error_log('⚠️ AGENT 7: Comprehensive extraction failed, trying direct meta access');

            $design_data_raw = $order->get_meta('_design_data', true);

            if (empty($design_data_raw)) {
                error_log('❌ AGENT 7: No design data found in any source for order ' . $order_id);
                wp_send_json_error([
                    'message' => 'No design data found for this order',
                    'code' => 'NO_DESIGN_DATA',
                    'order_id' => $order_id
                ]);
                return;
            }

            error_log('🔍 AGENT 7: Raw design data type: ' . gettype($design_data_raw));

            // Parse design data (may be stored as JSON string)
            $design_data = is_string($design_data_raw) ? json_decode($design_data_raw, true) : $design_data_raw;

            if (json_last_error() !== JSON_ERROR_NONE && is_string($design_data_raw)) {
                error_log('❌ AGENT 7: Invalid JSON in design data - Error: ' . json_last_error_msg());
                wp_send_json_error([
                    'message' => 'Invalid design data format',
                    'code' => 'INVALID_JSON',
                    'json_error' => json_last_error_msg()
                ]);
                return;
            }

            $mockup_url = $order->get_meta('_mockup_image_url', true);
            error_log('🔍 AGENT 7: Mockup URL from meta: ' . ($mockup_url ?: 'NOT FOUND'));
        }

        // 🔍 AGENT 7: Enhanced canvas dimension extraction with 3-tier fallback
        $canvas_dimensions = null;

        // Tier 1: From extracted data (design_elements)
        if (isset($extracted_data['design_elements'])) {
            foreach ($extracted_data['design_elements'] as $element) {
                if (isset($element['element_data']['width']) && isset($element['element_data']['height'])) {
                    $canvas_dimensions = [
                        'width' => floatval($element['element_data']['width']),
                        'height' => floatval($element['element_data']['height'])
                    ];
                    error_log('✅ AGENT 7: Canvas dimensions from extracted data - ' . $canvas_dimensions['width'] . 'x' . $canvas_dimensions['height']);
                    break;
                }
            }
        }

        // Tier 2: From design_data['canvas'] if extracted data didn't have dimensions
        if (!$canvas_dimensions && isset($design_data['canvas']) && is_array($design_data['canvas'])) {
            $canvas_dimensions = [
                'width' => floatval($design_data['canvas']['width'] ?? 0),
                'height' => floatval($design_data['canvas']['height'] ?? 0)
            ];
            if ($canvas_dimensions['width'] > 0 && $canvas_dimensions['height'] > 0) {
                error_log('✅ AGENT 7: Canvas dimensions from design_data - ' . $canvas_dimensions['width'] . 'x' . $canvas_dimensions['height']);
            }
        }

        // Tier 3: Default fallback
        if (!$canvas_dimensions || $canvas_dimensions['width'] == 0 || $canvas_dimensions['height'] == 0) {
            $canvas_dimensions = [
                'width' => 780.0,
                'height' => 580.0
            ];
            error_log('⚠️ AGENT 7: Using default canvas dimensions - 780x580');
        }

        // 🎯 AGENT 12: Extract template ID and print area coordinates
        $template_id = null;
        $print_area = null;

        // Try to get template ID from order items
        foreach ($order->get_items() as $item_id => $item) {
            $template_id = $item->get_meta('_yprint_template_id', true);
            if ($template_id) {
                error_log('✅ AGENT 12: Found template ID ' . $template_id . ' in item ' . $item_id);
                break;
            }
        }

        // Extract print area if template ID found
        if ($template_id) {
            $print_area = $wc_integration->extract_print_area_coordinates($template_id);
            if ($print_area) {
                error_log('✅ AGENT 12: Print area extracted for template ' . $template_id);
            } else {
                error_log('⚠️ AGENT 12: No print area data found for template ' . $template_id);
            }
        } else {
            error_log('⚠️ AGENT 12: No template ID found in order items');
        }

        // ✅ SUCCESS RESPONSE: Complete data structure
        $response_data = [
            'order_id' => $order_id,
            'design_data' => $design_data,
            'mockup_url' => $mockup_url ?: null,
            'canvas_dimensions' => $canvas_dimensions,
            'template_id' => $template_id,
            'print_area' => $print_area,
            'has_design_data' => !empty($design_data),
            'has_mockup_url' => !empty($mockup_url),
            'has_canvas_dimensions' => !empty($canvas_dimensions),
            'has_print_area' => !empty($print_area),
            'timestamp' => current_time('c')
        ];

        error_log('✅ DESIGN PREVIEW: Successfully retrieved design data for order ' . $order_id);
        error_log('🔍 DESIGN PREVIEW: Response data keys: ' . implode(', ', array_keys($response_data)));

        wp_send_json_success($response_data);
    }

    /**
     * 🎨 AGENT 2 DELIVERABLE: Add Design Preview Meta Box to WooCommerce Orders
     * Only displayed when order contains design data
     */
    public function add_order_design_preview_meta_box($post_or_order) {
        // Get order ID from post or order object
        $order_id = is_a($post_or_order, 'WP_Post') ? $post_or_order->ID : $post_or_order->get_id();

        // Check if WC Integration class is available
        if (!class_exists('Octo_Print_Designer_WC_Integration')) {
            return;
        }

        // Get WC Integration instance to check for design data
        $wc_integration = Octo_Print_Designer_WC_Integration::get_instance();

        // Only add meta box if order has design data
        if (!$wc_integration->has_design_data($order_id)) {
            return;
        }

        // Add meta box for old-style shop_order post type
        add_meta_box(
            'octo_order_design_preview',
            __('Design Vorschau', 'octo-print-designer'),
            array($this, 'render_order_design_preview_meta_box'),
            'shop_order',
            'normal',
            'high'
        );

        // Add meta box for new WooCommerce HPOS orders screen
        add_meta_box(
            'octo_order_design_preview',
            __('Design Vorschau', 'octo-print-designer'),
            array($this, 'render_order_design_preview_meta_box'),
            'woocommerce_page_wc-orders',
            'normal',
            'high'
        );
    }

    /**
     * 🎨 AGENT 2 DELIVERABLE: Render Design Preview Meta Box Content
     * Professional UI with preview button and container
     */
    public function render_order_design_preview_meta_box($post_or_order) {
        // Get order ID from post or order object
        $order_id = is_a($post_or_order, 'WP_Post') ? $post_or_order->ID : $post_or_order->get_id();

        // Security nonce
        wp_nonce_field('octo_order_design_preview', 'octo_order_design_preview_nonce');

        ?>
        <div class="wc-order-design-preview-wrapper" style="padding: 12px;">
            <div style="margin-bottom: 15px;">
                <p style="margin: 0 0 8px 0;">
                    <strong style="font-size: 14px;">🎨 Design Vorschau</strong>
                </p>
                <p style="margin: 0; font-size: 13px; color: #555;">
                    Klicken Sie auf den Button um eine 1:1 Vorschau des Kundendesigns zu generieren.
                </p>
            </div>

            <p style="margin-bottom: 15px;">
                <button type="button"
                        id="wc-order-preview-button"
                        class="button button-primary button-large"
                        data-order-id="<?php echo esc_attr($order_id); ?>"
                        style="padding: 8px 16px;">
                    <span class="dashicons dashicons-visibility" style="margin-top: 3px;"></span>
                    Design Vorschau anzeigen
                </button>
            </p>

            <div id="wc-order-design-preview-container"
                 style="display:none; margin-top:20px; padding: 15px; background: #f9f9f9; border: 1px solid #ddd; border-radius: 4px;">
                <div class="design-preview-loading" style="text-align: center; padding: 40px;">
                    <span class="spinner is-active" style="float: none; margin: 0 auto;"></span>
                    <p style="margin-top: 15px; color: #555;">Design wird geladen...</p>
                </div>
                <div class="design-preview-content" style="display: none;">
                    <!-- Preview will be rendered here by JavaScript -->
                </div>
                <div class="design-preview-error" style="display: none; padding: 15px; background: #fff3cd; border-left: 4px solid #ffc107; border-radius: 3px;">
                    <strong style="color: #856404;">⚠️ Fehler beim Laden der Vorschau</strong>
                    <p class="error-message" style="margin: 8px 0 0 0; color: #856404;"></p>
                </div>
            </div>
        </div>

        <script type="text/javascript">
        jQuery(document).ready(function($) {
            $('#wc-order-preview-button').on('click', function(e) {
                e.preventDefault();

                var button = $(this);
                var orderId = button.data('order-id');
                var container = $('#wc-order-design-preview-container');
                var loadingDiv = container.find('.design-preview-loading');
                var contentDiv = container.find('.design-preview-content');
                var errorDiv = container.find('.design-preview-error');

                // Show container and loading state
                container.slideDown();
                loadingDiv.show();
                contentDiv.hide();
                errorDiv.hide();

                // Disable button
                button.prop('disabled', true).text('Lädt...');

                console.log('🎨 [META BOX] Requesting design preview for order:', orderId);

                // AJAX request to load design preview
                $.ajax({
                    url: ajaxurl,
                    type: 'POST',
                    data: {
                        action: 'get_order_design_preview',
                        order_id: orderId,
                        nonce: '<?php echo wp_create_nonce('design_preview_nonce'); ?>'
                    },
                    success: function(response) {
                        console.log('🎨 [META BOX] AJAX response:', response);
                        loadingDiv.hide();

                        if (response.success) {
                            console.log('✅ [META BOX] Design data loaded successfully');
                            console.log('🎨 [META BOX] Design data:', response.data);

                            // Create preview container HTML
                            var previewHtml = '<div class="design-preview-renderer" data-order-id="' + orderId + '">';
                            previewHtml += '<div style="margin-bottom: 15px; padding: 12px; background: #e7f5fe; border-left: 4px solid #0073aa; border-radius: 3px;">';
                            previewHtml += '<strong style="color: #0073aa;">✓ Design Daten erfolgreich geladen</strong>';
                            previewHtml += '<p style="margin: 8px 0 0 0; font-size: 12px; color: #555;">Die Design-Vorschau wird automatisch gerendert.</p>';
                            previewHtml += '</div>';

                            previewHtml += '<div id="design-canvas-container-' + orderId + '" style="background: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 20px; text-align: left; min-height: 580px;">';
                            previewHtml += '<canvas id="design-preview-canvas-' + orderId + '" style="max-width: 100%; height: auto; border: 1px solid #e1e1e1;"></canvas>';
                            previewHtml += '<p style="margin-top: 15px; font-size: 12px; color: #666;">Canvas wird initialisiert...</p>';
                            previewHtml += '</div>';
                            previewHtml += '</div>';

                            contentDiv.html(previewHtml).show();

                            // Store design data globally for canvas renderer
                            window.orderDesignData = window.orderDesignData || {};
                            window.orderDesignData[orderId] = response.data;

                            console.log('🎨 [META BOX] Design data stored globally');

                            // Trigger rendering event for admin-preview-integration.js
                            $(document).trigger('octo-design-preview-ready', {
                                orderId: orderId,
                                canvasId: 'design-preview-canvas-' + orderId,
                                designData: response.data
                            });

                            console.log('🎨 [META BOX] Triggered octo-design-preview-ready event');
                        } else {
                            console.error('❌ [META BOX] AJAX error:', response.data);
                            errorDiv.find('.error-message').text(response.data.message || 'Unbekannter Fehler');
                            errorDiv.show();
                        }
                    },
                    error: function(xhr, status, error) {
                        console.error('❌ [META BOX] AJAX request failed:', error);
                        loadingDiv.hide();
                        errorDiv.find('.error-message').text('AJAX Fehler: ' + error);
                        errorDiv.show();
                    },
                    complete: function() {
                        // Re-enable button
                        button.prop('disabled', false).html('<span class="dashicons dashicons-visibility" style="margin-top: 3px;"></span> Design Vorschau anzeigen');
                    }
                });
            });
        });
        </script>

        <style>
        .wc-order-design-preview-wrapper .button-large {
            font-size: 14px;
            height: auto;
            line-height: 1.5;
        }
        .wc-order-design-preview-wrapper .dashicons {
            font-size: 18px;
            width: 18px;
            height: 18px;
            vertical-align: middle;
        }
        #wc-order-design-preview-container {
            animation: slideDown 0.3s ease-out;
        }
        @keyframes slideDown {
            from {
                opacity: 0;
                transform: translateY(-10px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        .design-preview-content canvas {
            box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        </style>
        <?php
    }
}