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
            $this->version,
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
}