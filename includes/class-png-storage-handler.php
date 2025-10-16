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

        // Register AJAX handlers
        add_action('wp_ajax_yprint_add_to_cart_with_print_png', array($this, 'handle_add_to_cart_with_print_png'));
        add_action('wp_ajax_nopriv_yprint_add_to_cart_with_print_png', array($this, 'handle_add_to_cart_with_print_png'));

        add_action('wp_ajax_yprint_save_order_print_data', array($this, 'handle_save_order_print_data'));
        add_action('wp_ajax_nopriv_yprint_save_order_print_data', array($this, 'handle_save_order_print_data'));

        add_action('wp_ajax_yprint_get_template_print_area', array($this, 'handle_get_template_print_area'));
        add_action('wp_ajax_nopriv_yprint_get_template_print_area', array($this, 'handle_get_template_print_area'));

        // WooCommerce hooks
        add_action('woocommerce_add_order_item_meta', array($this, 'add_print_png_to_order_item'), 10, 3);
        add_action('woocommerce_order_status_completed', array($this, 'prepare_print_files'));

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
     * Handle AJAX request to add to cart with print PNG
     */
    public function handle_add_to_cart_with_print_png() {
        // Verify nonce
        if (!wp_verify_nonce($_POST['nonce'], 'octo_print_designer_nonce')) {
            wp_send_json_error('Invalid nonce');
            return;
        }

        try {
            $product_id = intval($_POST['product_id']);
            $design_data = stripslashes($_POST['design_data']);
            $print_png = $_POST['print_png'];
            $print_area_px = stripslashes($_POST['print_area_px']);
            $print_area_mm = stripslashes($_POST['print_area_mm']);
            $template_id = sanitize_text_field($_POST['template_id']);

            // Validate inputs
            if (!$product_id || !$print_png || !$design_data) {
                wp_send_json_error('Missing required data');
                return;
            }

            // Save print PNG file
            $png_file_info = $this->save_print_png($print_png, $product_id, $template_id);

            if (!$png_file_info) {
                wp_send_json_error('Failed to save print PNG');
                return;
            }

            // Prepare cart item data
            $cart_item_data = array(
                'yprint_design_data' => $design_data,
                'yprint_print_png_url' => $png_file_info['url'],
                'yprint_print_png_path' => $png_file_info['path'],
                'yprint_print_area_px' => $print_area_px,
                'yprint_print_area_mm' => $print_area_mm,
                'yprint_template_id' => $template_id,
                'yprint_print_ready' => true,
                'yprint_created' => current_time('mysql')
            );

            // Add to WooCommerce cart
            $cart_item_key = WC()->cart->add_to_cart($product_id, 1, 0, array(), $cart_item_data);

            if (!$cart_item_key) {
                wp_send_json_error('Failed to add to cart');
                return;
            }

            error_log('🛒 PNG STORAGE: Added to cart with print PNG - Product: ' . $product_id);

            wp_send_json_success(array(
                'cart_item_key' => $cart_item_key,
                'png_url' => $png_file_info['url'],
                'redirect_url' => wc_get_cart_url(),
                'message' => 'Print-ready design added to cart!'
            ));

        } catch (Exception $e) {
            error_log('❌ PNG STORAGE: Add to cart failed: ' . $e->getMessage());
            wp_send_json_error('Failed to process request: ' . $e->getMessage());
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

            // Validate saved file
            if (!file_exists($file_path) || filesize($file_path) === 0) {
                throw new Exception('PNG file validation failed');
            }

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
     * Handle AJAX request to save order print data
     */
    public function handle_save_order_print_data() {
        if (!wp_verify_nonce($_POST['nonce'], 'octo_print_designer_nonce')) {
            wp_send_json_error('Invalid nonce');
            return;
        }

        try {
            $order_id = intval($_POST['order_id']);
            $print_data = stripslashes($_POST['print_data']);

            if (!$order_id || !$print_data) {
                wp_send_json_error('Missing required data');
                return;
            }

            // Save to order meta
            $result = update_post_meta($order_id, '_yprint_print_data', $print_data);

            if ($result) {
                error_log('📦 PNG STORAGE: Order print data saved - Order: ' . $order_id);
                wp_send_json_success('Print data saved to order');
            } else {
                wp_send_json_error('Failed to save print data');
            }

        } catch (Exception $e) {
            error_log('❌ PNG STORAGE: Save order data failed: ' . $e->getMessage());
            wp_send_json_error('Failed to save: ' . $e->getMessage());
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
}

// Initialize if WooCommerce is active
if (class_exists('WooCommerce')) {
    new PNG_Storage_Handler('octo-print-designer', '1.0.0');
} else {
    error_log('⚠️ PNG STORAGE HANDLER: WooCommerce not active, skipping initialization');
}
?>