<?php
class Octo_Print_Designer_Admin {
    private $plugin_name;
    private $version;
    private $template_manager;

    public function __construct($plugin_name, $version) {
        $this->plugin_name = $plugin_name;
        $this->version = $version;
        
        $this->template_manager = new Octo_Print_Designer_Template();

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
    
    }

    public function enqueue_scripts($hook) {

        if (!$this->is_template_edit_page($hook)) return;

        wp_enqueue_media();
        
        wp_enqueue_script(
            'octo-print-designer-vendor',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/dist/vendor.bundle.js',
            [], // no dependencies for vendor
            rand(),
            true
        );
        
        wp_enqueue_script(
            'octo-print-designer-admin',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/dist/admin.bundle.js',
            ['octo-print-designer-vendor'], // vendor bundle must load first
            rand(),
            true
        );

        wp_enqueue_script(
            'octo-reference-line-system',
            OCTO_PRINT_DESIGNER_URL . 'admin/js/reference-line-system.js',
            ['octo-print-designer-admin', 'jquery'],
            $this->version . '-' . time(),
            true
        );

        wp_localize_script('octo-print-designer-admin', 'octoPrintDesigner', [
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('octo_print_designer_nonce'),
            'postId' => get_the_ID()
        ]);

    }

    public function enqueue_styles($hook) {
        if (!$this->is_template_edit_page($hook)) return;

        wp_enqueue_style(
            'octo-print-designer-admin',
            plugin_dir_url(__FILE__) . 'css/octo-print-designer-admin.css',
            [],
            $this->version
        );
    }

    private function is_template_edit_page($hook) {
        if (!in_array($hook, ['post.php', 'post-new.php'])) return false;

        $screen = get_current_screen();
        return $screen && $screen->post_type === 'design_template';
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
}