<?php
class Octo_Print_Designer_WC_Integration {
    private static $instance;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        // Cart item customization
        add_filter('woocommerce_get_item_data', array($this, 'display_cart_item_custom_data'), 10, 2);
        add_filter('woocommerce_cart_item_thumbnail', array($this, 'modify_cart_item_thumbnail'), 10, 3);
        add_filter('woocommerce_cart_item_name', array($this, 'modify_cart_item_name'), 10, 3);
        
        // Price modifications
        add_action('woocommerce_before_calculate_totals', array($this, 'calculate_custom_price'), 10);
        add_filter('woocommerce_cart_item_price', array($this, 'modify_cart_item_price_display'), 10, 3);
        
        // Order items customization
        add_action('woocommerce_checkout_create_order_line_item', array($this, 'add_custom_data_to_order_items'), 10, 4);
        
        // Add design preview to order emails
        add_filter('woocommerce_order_item_name', array($this, 'modify_order_item_name'), 10, 2);
        add_action('woocommerce_order_item_meta_end', array($this, 'add_design_preview_to_order_email'), 10, 3);

        // NEW: Cart integration hook for JSON design data
        add_filter('woocommerce_add_cart_item_data', array($this, 'add_design_data_to_cart'), 10, 3);

        // NEW: Order integration hook for JSON design data persistence
        add_action('woocommerce_checkout_create_order_line_item', array($this, 'save_design_data_to_order'), 10, 4);

        add_filter('woocommerce_order_item_display_meta_key', array($this, 'format_order_item_meta_display'), 10, 3);
        add_filter('woocommerce_order_item_display_meta_value', array($this, 'format_order_item_meta_value'), 10, 3);
        add_filter('woocommerce_admin_order_item_thumbnail', array($this, 'customize_order_item_thumbnail'), 10, 4);

        add_action('admin_head', array($this, 'add_admin_styles'));

        add_action('add_meta_boxes', array($this, 'add_print_provider_meta_box'));
        add_action('wp_ajax_octo_send_print_provider_email', array($this, 'ajax_send_print_provider_email'));
        add_action('wp_ajax_octo_refresh_print_data', array($this, 'ajax_refresh_print_data'));
        add_action('wp_ajax_octo_preview_print_provider_email', array($this, 'ajax_preview_print_provider_email'));
        add_action('wp_ajax_octo_send_print_provider_api', array($this, 'ajax_send_print_provider_api'));
        add_action('wp_ajax_octo_preview_api_payload', array($this, 'ajax_preview_api_payload'));

        // 🗑️ DESIGN PREVIEW SYSTEM REMOVED: Simplified WooCommerce Admin Integration
        add_action('woocommerce_admin_order_data_after_order_details', array($this, 'add_design_info_section'));

        // 🖼️ PNG PLUGIN INTEGRATION: Separate AJAX handlers for plugin PNG uploads
        add_action('wp_ajax_yprint_upload_png', array($this, 'handle_plugin_png_upload'));
        add_action('wp_ajax_nopriv_yprint_upload_png', array($this, 'handle_plugin_png_upload'));

        add_filter('woocommerce_add_cart_item_data', array($this, 'add_custom_cart_item_data'), 10, 3);

        // Product meta fields for sizing charts
        add_action('woocommerce_product_data_panels', array($this, 'add_sizing_chart_product_data_panel'));
        add_action('woocommerce_product_data_tabs', array($this, 'add_sizing_chart_product_data_tab'));
        add_action('woocommerce_process_product_meta', array($this, 'save_sizing_chart_product_data'));

        // Variation meta fields for sizing charts
        add_action('woocommerce_variation_options_pricing', array($this, 'add_variation_sizing_chart_fields'), 10, 3);
        add_action('woocommerce_save_product_variation', array($this, 'save_variation_sizing_chart_fields'), 10, 2);

        // 🚨 CHECKOUT SYSTEM FIX: Enqueue checkout scripts for payment system restoration
        add_action('wp_enqueue_scripts', array($this, 'enqueue_checkout_scripts'));
        add_action('wp_localize_script', array($this, 'localize_checkout_scripts'));

    }

    /**
 * Check if YPrint plugin is active and email functions are available
 */
private function check_yprint_dependency() {
    // Check if YPrint plugin is active
    if (!is_plugin_active('yprint-plugin/yprint-plugin.php')) {
        return false;
    }
    
    // Try to load email functions if not already loaded
    if (!function_exists('yprint_get_email_template')) {
        $yprint_email_file = WP_PLUGIN_DIR . '/yprint-plugin/includes/email.php';
        if (file_exists($yprint_email_file)) {
            require_once $yprint_email_file;
        }
    }
    
    return function_exists('yprint_get_email_template');
}

    /**
     * Modify cart item name to include design name
     */
    public function modify_cart_item_name($name, $cart_item, $cart_item_key) {

        if( !isset($cart_item['print_design']) ) return $name;

        $design = $cart_item['print_design'];
        return esc_html($design['name']);
        
    }

    /**
     * Display custom design data in cart
     */
    public function display_cart_item_custom_data($item_data, $cart_item) {

        if (isset($cart_item['print_design'])) {
            $design = $cart_item['print_design'];
            
            // Add variant info
            $item_data[] = array(
                'key' => __('Color', 'octo-print-designer'),
                'value' => sprintf(
                    '<span class="design-color-swatch" style="background-color:%1$s"></span> %2$s',
                    esc_attr($design['variation_color']),
                    esc_html($design['variation_name'])
                )
            );

            // Add size info
            $item_data[] = array(
                'key' => __('Size', 'octo-print-designer'),
                'value' => esc_html($design['size_name'])
            );
        }

        return $item_data;
    }

    /**
     * Replace cart item thumbnail with design preview
     */
    public function modify_cart_item_thumbnail($thumbnail, $cart_item, $cart_item_key) {
        if (isset($cart_item['print_design']) && !empty($cart_item['print_design']['preview_url'])) {
            return sprintf(
                '<img src="%s" class="design-preview" alt="%s" />',
                esc_url($cart_item['print_design']['preview_url']),
                esc_attr__('Design Preview', 'octo-print-designer')
            );
        }
        return $thumbnail;
    }

    /**
     * Calculate custom price before totals
     */
    public function calculate_custom_price($cart) {
        if (is_admin() && !defined('DOING_AJAX')) {
            return;
        }

        foreach ($cart->get_cart() as $cart_item) {
            if (isset($cart_item['print_design']['calculated_price'])) {
                $cart_item['data']->set_price($cart_item['print_design']['calculated_price']);
            }
        }
    }

    /**
     * Modify price display in cart
     */
    public function modify_cart_item_price_display($price_html, $cart_item, $cart_item_key) {
        if (isset($cart_item['print_design']['calculated_price'])) {
            return wc_price($cart_item['print_design']['calculated_price']);
        }
        return $price_html;
    }

    /**
     * Add custom data to order items during checkout
     */
    public function add_custom_data_to_order_items($item, $cart_item_key, $values, $order) {
        if (isset($values['print_design'])) {
            $design = $values['print_design'];
            
            // Add basic design metadata to order item
            $item->add_meta_data('_design_id', $design['design_id']);
            $item->add_meta_data('_design_name', $design['name']);
            $item->add_meta_data('_design_color', $design['variation_name']);
            $item->add_meta_data('_design_size', $design['size_name']);
            $item->add_meta_data('_design_preview_url', $design['preview_url']);
            
            // Store the largest dimensions for price calculation reference
            $item->add_meta_data('_design_width_cm', $design['design_width_cm']);
            $item->add_meta_data('_design_height_cm', $design['design_height_cm']);
            
            // New field to indicate multiple images support
            $item->add_meta_data('_design_has_multiple_images', true);
            
            // Store all product images with view information
            if (isset($design['product_images']) && is_array($design['product_images'])) {
                $item->add_meta_data('_design_product_images', wp_json_encode($design['product_images']));
            }
            
            // Get all design images from the design data
            if (isset($design['design_images']) && is_array($design['design_images'])) {
                // Store images as JSON array
                $item->add_meta_data('_design_images', wp_json_encode($design['design_images']));
            } else {
                // Backward compatibility - create an array with the single image data
                $single_image = [
                    'url' => $design['design_image_url'] ?? '',
                    'scaleX' => $design['design_scaleX'] ?? 1,
                    'scaleY' => $design['design_scaleY'] ?? 1,
                    'width_cm' => $design['design_width_cm'] ?? 0,
                    'height_cm' => $design['design_height_cm'] ?? 0
                ];
                
                $item->add_meta_data('_design_images', wp_json_encode([$single_image]));
                
                // Still maintain the old field for backward compatibility
                $item->add_meta_data('_design_image_url', $design['design_image_url'] ?? '');
            }
        }
    }

    /**
     * Modify order item name in emails and order details
     */
    public function modify_order_item_name($item_name, $item) {
        // Get design details
        $design_name = $this->get_design_meta($item, 'name') ?: $this->get_design_meta($item, 'design_name');
        $design_color = $item->get_meta('_design_color');
        $design_size = $item->get_meta('_design_size');
        
        if ($design_name) {
            $name_parts = array($design_name);
            
            if ($design_color) {
                $name_parts[] = $design_color;
            }
            
            if ($design_size) {
                $name_parts[] = $design_size;
            }
            
            return implode(' - ', $name_parts);
        }
        
        return $item_name;
    }

    /**
     * Add design preview to order emails
     */
    public function add_design_preview_to_order_email($item_id, $item, $order) {
        // Get the preview URL
        $preview_url = $item->get_meta('_design_preview_url');
        
        echo '<div class="design-preview-wrapper" style="margin-top: 10px;">';
        
        // Show design preview
        if ($preview_url) {
            echo '<div style="margin-bottom: 10px;">';
            echo '<strong>' . esc_html__('Design Preview:', 'octo-print-designer') . '</strong><br />';
            echo '<img src="' . esc_url($preview_url) . '" style="max-width: 150px; height: auto; margin-top: 5px; border: 1px solid #ddd;" />';
            echo '</div>';
        }
        
        // Show dimensions
        $width_cm = $item->get_meta('_design_width_cm');
        $height_cm = $item->get_meta('_design_height_cm');
        
        if ($width_cm && $height_cm) {
            echo '<div style="margin-bottom: 5px;">';
            echo '<strong>' . esc_html__('Print Size:', 'octo-print-designer') . '</strong> ';
            echo esc_html($width_cm) . 'cm × ' . esc_html($height_cm) . 'cm';
            echo '</div>';
        }
        
        // If we have multiple images, show a simple count instead of all images
        $has_multiple = $item->get_meta('_design_has_multiple_images');
        $images_json = $item->get_meta('_design_images');
        
        if ($has_multiple && $images_json) {
            try {
                $images = json_decode($images_json, true);
                if (is_array($images) && count($images) > 0) {
                    echo '<div style="margin-top: 5px;">';
                    echo '<strong>' . esc_html__('Design Contains:', 'octo-print-designer') . '</strong> ';
                    echo sprintf(
                        _n('%d image', '%d images', count($images), 'octo-print-designer'),
                        count($images)
                    );
                    echo '</div>';
                }
            } catch (Exception $e) {
                // 🧠 ERROR SPECIALIST: Enhanced exception logging and user feedback
                error_log("🔥 [ERROR SPECIALIST] Design preview generation failed: " . $e->getMessage());
                error_log("🔥 [ERROR SPECIALIST] Stack trace: " . $e->getTraceAsString());

                // Graceful degradation: Show fallback content
                echo '<div class="design-preview-error" style="padding: 10px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; color: #856404;">';
                echo '<strong>⚠️ Design Preview Unavailable</strong><br>';
                echo '<small>Using stored order data. Contact support if this persists.</small>';
                echo '</div>';
            }
        }
        
        echo '</div>';
    }

    /**
     * Format the display of design images in order meta
     */
    public function format_order_item_meta_display($display_key, $meta, $item) {
        // Only format our custom meta fields
        if ($meta->key === '_design_images') {
            $display_key = __('Design Images', 'octo-print-designer');
            return $display_key;
        }
        
        if ($meta->key === '_design_has_multiple_images') {
            // Hide this meta field completely
            return false;
        }
        
        return $display_key;
    }

    /**
     * Format the display value of design images in order meta
     */
    public function format_order_item_meta_value($display_value, $meta, $item) {
        // Format design images as clickable links
        if ($meta->key === '_design_images') {
            try {
                $images = json_decode($meta->value, true);
                if (!is_array($images) || empty($images)) {
                    return __('No design images available', 'octo-print-designer');
                }
                
                $output = '<div class="design-images-list">';
                
                foreach ($images as $index => $image) {
                    if (empty($image['url'])) continue;
                    
                    $view_name = isset($image['view_name']) ? $image['view_name'] : sprintf(__('View %d', 'octo-print-designer'), $index + 1);
                    $width_cm = isset($image['width_cm']) ? $image['width_cm'] : '';
                    $height_cm = isset($image['height_cm']) ? $image['height_cm'] : '';
                    
                    $dimensions = '';
                    if ($width_cm && $height_cm) {
                        $dimensions = sprintf(' (%scm × %scm)', $width_cm, $height_cm);
                    }
                    
                    $output .= sprintf(
                        '<div class="design-image-item" style="margin-bottom: 5px;">
                            <a href="%s" target="_blank" style="display: inline-flex; align-items: center; text-decoration: none;">
                                <img src="%s" alt="%s" style="width: 30px; height: 30px; object-fit: contain; margin-right: 5px; border: 1px solid #ddd;">
                                <span>%s%s</span>
                            </a>
                        </div>',
                        esc_url($image['url']),
                        esc_url($image['url']),
                        esc_attr($view_name),
                        esc_html($view_name),
                        esc_html($dimensions)
                    );
                }
                
                $output .= '</div>';
                return $output;
            } catch (Exception $e) {
                // 🧠 ERROR SPECIALIST: Enhanced error handling with fallback display
                error_log("🔥 [ERROR SPECIALIST] Design image display error: " . $e->getMessage());

                return '<div style="padding: 8px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px; font-size: 12px;">' .
                       '<strong>⚠️ Image Display Error</strong><br>' .
                       '<small>Raw data available in order meta.</small>' .
                       '</div>';
            }
        }
        
        return $display_value;
    }

    /**
     * Ensure the order item thumbnail uses the preview image
     */
    public function customize_order_item_thumbnail($thumbnail, $item_id, $item) {
        // Check if this is our custom product
        if (!$item->get_meta('_design_preview_url')) {
            return $thumbnail;
        }
        
        $preview_url = $item->get_meta('_design_preview_url');
        if ($preview_url) {
            return sprintf(
                '<img src="%s" alt="%s" class="design-preview" style="max-width: 50px; height: auto;" />',
                esc_url($preview_url),
                esc_attr__('Design Preview', 'octo-print-designer')
            );
        }
        
        return $thumbnail;
    }

    public function add_admin_styles() {
        // Only add on order pages
        $screen = get_current_screen();
        if (!$screen || $screen->id !== 'shop_order') {
            return;
        }

        ?>
        <style type="text/css">
            /* 🎨 PROFESSIONAL WORDPRESS ADMIN UI - Agent 6 Enhancement */

            /* Design Preview Section */
            #design-preview-section {
                margin: 20px 0;
                padding: 0;
                background: #fff;
                border: 1px solid #c3c4c7;
                border-radius: 4px;
                box-shadow: 0 1px 1px rgba(0,0,0,.04);
            }

            .design-preview-header {
                background: #f6f7f7;
                border-bottom: 1px solid #c3c4c7;
                padding: 12px 20px;
                margin: 0;
            }

            .design-preview-header h3 {
                margin: 0;
                color: #1d2327;
                font-size: 14px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .design-preview-content {
                padding: 20px;
            }

            .design-status-indicator {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                padding: 4px 8px;
                border-radius: 3px;
                font-size: 12px;
                font-weight: 500;
            }

            .status-available {
                background: #d1e7dd;
                color: #0f5132;
                border: 1px solid #a3cfbb;
            }

            .status-unavailable {
                background: #fff3cd;
                color: #664d03;
                border: 1px solid #ffda6a;
            }

            /* Enhanced Buttons */
            .design-preview-btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 6px 16px;
                font-size: 13px;
                line-height: 1.5;
                border-radius: 3px;
                text-decoration: none;
                transition: all 0.2s ease;
            }

            .design-preview-btn:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            .design-preview-btn:not(:disabled):hover {
                transform: translateY(-1px);
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }

            /* Modal Enhancement */
            #design-preview-modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.7);
                z-index: 999999;
                display: none;
                backdrop-filter: blur(2px);
            }

            .design-modal-container {
                position: relative;
                width: 95%;
                max-width: 1200px;
                height: 90%;
                margin: 2.5% auto;
                background: #fff;
                border-radius: 4px;
                box-shadow: 0 8px 32px rgba(0,0,0,0.3);
                overflow: hidden;
                display: flex;
                flex-direction: column;
            }

            .design-modal-header {
                background: #1d2327;
                color: #fff;
                padding: 16px 24px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                border-bottom: 1px solid #c3c4c7;
            }

            .design-modal-title {
                margin: 0;
                font-size: 16px;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .design-modal-close {
                background: rgba(255,255,255,0.1);
                color: #fff;
                border: none;
                border-radius: 3px;
                padding: 8px 12px;
                cursor: pointer;
                font-size: 13px;
                transition: background 0.2s ease;
            }

            .design-modal-close:hover {
                background: rgba(255,255,255,0.2);
            }

            .design-modal-body {
                flex: 1;
                overflow: auto;
                padding: 24px;
                background: #f6f7f7;
            }

            /* Control Panel */
            .design-control-panel {
                background: #fff;
                border: 1px solid #c3c4c7;
                border-radius: 4px;
                padding: 16px;
                margin-bottom: 20px;
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                align-items: center;
            }

            .control-group {
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .control-group label {
                font-size: 12px;
                font-weight: 600;
                color: #1d2327;
                margin: 0;
            }

            .control-button {
                padding: 4px 8px;
                font-size: 11px;
                border: 1px solid #c3c4c7;
                background: #fff;
                color: #1d2327;
                border-radius: 3px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .control-button:hover {
                background: #f6f7f7;
                border-color: #8c8f94;
            }

            .control-button.active {
                background: #2271b1;
                color: #fff;
                border-color: #135e96;
            }

            .control-button.touching {
                background: #f0f0f1;
                transform: scale(0.98);
            }

            /* Canvas Container */
            .design-canvas-wrapper {
                background: #fff;
                border: 1px solid #c3c4c7;
                border-radius: 4px;
                padding: 20px;
                text-align: center;
                box-shadow: inset 0 0 0 1px rgba(0,0,0,.04);
            }

            .design-canvas-container {
                position: relative;
                display: inline-block;
                background: #fff;
                border: 2px solid #c3c4c7;
                border-radius: 4px;
                box-shadow: 0 2px 8px rgba(0,0,0,0.1);
                overflow: hidden;
            }

            #design-preview-canvas {
                display: block;
                max-width: 100%;
                height: auto;
            }

            /* Loading States */
            .design-loading {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 60px 20px;
                color: #646970;
            }

            .loading-spinner {
                width: 32px;
                height: 32px;
                border: 3px solid #f0f0f1;
                border-top: 3px solid #2271b1;
                border-radius: 50%;
                animation: spin 1s linear infinite;
                margin-bottom: 16px;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            /* Info Cards */
            .info-card {
                background: #fff;
                border: 1px solid #c3c4c7;
                border-radius: 4px;
                padding: 16px;
                margin-bottom: 16px;
            }

            .info-card-header {
                font-size: 14px;
                font-weight: 600;
                color: #1d2327;
                margin: 0 0 12px 0;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .info-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 16px;
                font-size: 13px;
            }

            .info-item {
                padding: 12px;
                background: #f6f7f7;
                border-radius: 3px;
                border-left: 4px solid #2271b1;
            }

            .info-item strong {
                display: block;
                color: #1d2327;
                margin-bottom: 4px;
                font-size: 12px;
                text-transform: uppercase;
                letter-spacing: 0.5px;
            }

            /* Error States */
            .design-error {
                background: #fcf2f2;
                border: 1px solid #f87171;
                border-radius: 4px;
                padding: 16px;
                text-align: center;
                color: #7f1d1d;
            }

            .design-error h3 {
                margin: 0 0 8px 0;
                color: #991b1b;
            }

            /* Responsive Design */
            @media (max-width: 782px) {
                .design-modal-container {
                    width: 98%;
                    height: 95%;
                    margin: 1% auto;
                }

                .design-modal-body {
                    padding: 16px;
                }

                .design-control-panel {
                    flex-direction: column;
                    align-items: stretch;
                }

                .control-group {
                    justify-content: space-between;
                }

                .info-grid {
                    grid-template-columns: 1fr;
                }
            }

            @media (max-width: 480px) {
                .design-modal-container {
                    width: 100%;
                    height: 100%;
                    margin: 0;
                    border-radius: 0;
                }

                .design-canvas-wrapper {
                    padding: 12px;
                }
            }

            /* Legacy styles for backward compatibility */
            .design-images-list {
                max-height: 200px;
                overflow-y: auto;
                border: 1px solid #c3c4c7;
                padding: 8px;
                border-radius: 4px;
                background: #f6f7f7;
            }
            .design-image-item {
                margin-bottom: 8px;
                padding: 8px;
                border-bottom: 1px solid #e0e0e0;
                background: #fff;
                border-radius: 3px;
            }
            .design-image-item:last-child {
                border-bottom: none;
                margin-bottom: 0;
            }
            .design-preview-wrapper {
                padding: 8px;
                background: #f6f7f7;
                border-radius: 4px;
                border: 1px solid #c3c4c7;
            }

            /* Accessibility Enhancements */
            .sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                white-space: nowrap;
                border: 0;
            }

            /* Focus states for keyboard navigation */
            .control-button:focus,
            .design-preview-btn:focus,
            .design-modal-close:focus {
                outline: 2px solid #2271b1;
                outline-offset: 2px;
            }

            /* High contrast mode support */
            @media (prefers-contrast: high) {
                .info-item {
                    border-left-width: 6px;
                }

                .status-available,
                .status-unavailable {
                    border-width: 2px;
                }
            }

            /* Reduced motion for accessibility */
            @media (prefers-reduced-motion: reduce) {
                .design-preview-btn,
                .control-button,
                .design-modal-close {
                    transition: none;
                }

                .loading-spinner {
                    animation: none;
                }
            }
        </style>
        <?php
    }

    public function add_print_provider_meta_box() {
        add_meta_box(
            'octo_print_provider_email',
            __('Send to Print Provider', 'octo-print-designer'),
            array($this, 'render_print_provider_meta_box'),
            'shop_order',
            'side',
            'default'
        );
        add_meta_box(
            'octo_print_provider_email',
            __('Send to Print Provider', 'octo-print-designer'),
            array($this, 'render_print_provider_meta_box'),
            'woocommerce_page_wc-orders',
            'side',
            'default'
        );

    }

    /**
     * Render meta box content
     */
    public function render_print_provider_meta_box($post) {
        $order_id = $post->ID;
        $order = wc_get_order($order_id);
        
        // Check if order has any design products
        $has_design_products = false;
        foreach ($order->get_items() as $item) {
            if (
                $item->get_meta('_design_id') ||
                $item->get_meta('yprint_design_id') ||
                $item->get_meta('_yprint_design_id') ||
                $item->get_meta('_is_design_product')
            ) {
                $has_design_products = true;
                break;
            }
        }
        
        if (!$has_design_products) {
            echo '<p>' . __('No design products in this order.', 'octo-print-designer') . '</p>';
            return;
        }
        
        // Analyze print data status for all design items
        $design_items_status = array();
        $all_data_complete = true;
        $total_design_items = 0;
        $items_with_data = 0;
        
        foreach ($order->get_items() as $item_id => $item) {
            $design_id = $item->get_meta('_design_id') ?: $item->get_meta('yprint_design_id') ?: $item->get_meta('_yprint_design_id');
            if (!$design_id) {
                $debug_info[] = "Item {$item_id}: No design_id found (checked _design_id and yprint_design_id)";
                continue; // Skip non-design items
            }
            
            $total_design_items++;
            $has_processed_views = !empty($item->get_meta('_db_processed_views'));
            $has_preview = !empty($item->get_meta('_design_preview_url')) || !empty($item->get_meta('_yprint_preview_url'));
            
            if ($has_processed_views) $items_with_data++;
            
            $design_items_status[] = array(
                'item_id' => $item_id,
                'design_id' => $design_id,
                'name' => $this->get_design_meta($item, 'name') ?: $this->get_design_meta($item, 'design_name') ?: $item->get_name(),
                'has_processed_views' => $has_processed_views,
                'has_preview' => $has_preview,
                'is_complete' => $has_processed_views && $has_preview
            );
            
            if (!$has_processed_views || !$has_preview) {
                $all_data_complete = false;
            }
        }
        
        // Get saved print provider email
        $print_provider_email = get_post_meta($order_id, '_print_provider_email', true);
        $email_sent = get_post_meta($order_id, '_print_provider_email_sent', true);
        
        wp_nonce_field('octo_send_to_print_provider', 'octo_print_provider_nonce');
        
        ?>
        <div class="print-provider-form">
            
            <!-- Print Data Status Section -->
            <div class="print-data-status-section" style="margin-bottom: 15px; padding: 12px; border-radius: 6px; <?php echo $all_data_complete ? 'background-color: #d4edda; border-left: 4px solid #28a745;' : 'background-color: #fff3cd; border-left: 4px solid #ffc107;'; ?>">
                <h4 style="margin: 0 0 8px 0; font-size: 14px; <?php echo $all_data_complete ? 'color: #155724;' : 'color: #856404;'; ?>">
                    <?php echo $all_data_complete ? '✅' : '⚠️'; ?> Druckdaten-Status
                </h4>
                
                <p style="margin: 0 0 8px 0; font-size: 12px; <?php echo $all_data_complete ? 'color: #155724;' : 'color: #0073aa;'; ?>">
                    <?php echo $all_data_complete ? 'Alle Druckdaten verfügbar - bereit zum Versenden' : "Druckdaten werden automatisch aus der Datenbank geladen ({$items_with_data}/{$total_design_items} Items bereit)"; ?>
                </p>
                
                <?php if (!$all_data_complete) : ?>
                    <p style="margin: 0; font-size: 11px; color: #856404;">
                        <em>💡 Tipp: Klicken Sie "Druckdaten aus DB laden" um fehlende Daten zu ergänzen</em>
                    </p>
                <?php else : ?>
                    <p style="margin: 0; font-size: 11px; color: #155724;">
                        <em>🎉 Alle Druckdaten sind vollständig! E-Mail kann versendet werden.</em>
                    </p>
                <?php endif; ?>
                
                <!-- Detailed Item Status -->
                <details style="margin-top: 8px;">
                    <summary style="cursor: pointer; font-size: 11px; font-weight: bold; <?php echo $all_data_complete ? 'color: #155724;' : 'color: #856404;'; ?>">
                        📋 Details zu einzelnen Items anzeigen
                    </summary>
                    <div style="margin-top: 5px; padding: 5px; background: rgba(255,255,255,0.5); border-radius: 3px;">
                        <?php foreach ($design_items_status as $status) : ?>
                            <div style="font-size: 10px; margin-bottom: 3px; padding: 3px; background: white; border-radius: 2px;">
                                <strong><?php echo esc_html($status['name']); ?></strong> (ID: <?php echo $status['design_id']; ?>)
                                <br>
                                Views: <?php echo $status['has_processed_views'] ? '<span style="color: #28a745;">✓</span>' : '<span style="color: #dc3545;">✗</span>'; ?>
                                | Preview: <?php echo $status['has_preview'] ? '<span style="color: #28a745;">✓</span>' : '<span style="color: #dc3545;">✗</span>'; ?>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </details>
            </div>
            <p>
                <label for="print_provider_email"><?php _e('Print Provider Email:', 'octo-print-designer'); ?></label>
                <input type="email" id="print_provider_email" name="print_provider_email" 
                    value="<?php echo esc_attr($print_provider_email); ?>" 
                    class="widefat" required placeholder="provider@example.com">
            </p>
            
            <p>
                <label for="print_provider_notes"><?php _e('Additional Notes:', 'octo-print-designer'); ?></label>
                <textarea id="print_provider_notes" name="print_provider_notes" 
                        class="widefat" rows="3" placeholder="<?php esc_attr_e('Optional notes to include in the email', 'octo-print-designer'); ?>"></textarea>
            </p>
            
            <?php if ($email_sent) : ?>
                <div class="email-sent-notice" style="background-color: #ecf7ed; border-left: 4px solid #46b450; padding: 8px; margin-bottom: 10px;">
                    <?php echo sprintf(
                        __('Email sent to %s on %s', 'octo-print-designer'),
                        '<strong>' . esc_html($print_provider_email) . '</strong>',
                        '<em>' . esc_html(date_i18n(get_option('date_format') . ' ' . get_option('time_format'), $email_sent)) . '</em>'
                    ); ?>
                </div>
            <?php endif; ?>
            
            <div class="print-actions-section" style="border-top: 1px solid #e1e1e1; padding-top: 15px;">
                <p style="margin-bottom: 8px;">
                    <button type="button" id="refresh_print_data" class="button" data-order-id="<?php echo $order_id; ?>">
                        <?php _e('🔄 Druckdaten aus DB laden', 'octo-print-designer'); ?>
                    </button>
                    <span class="refresh-spinner spinner" style="float: none; margin: 0 0 0 5px;"></span>
                </p>
                
                <p style="margin-bottom: 8px;">
                    <button type="button" id="preview_print_provider_email" class="button" data-order-id="<?php echo $order_id; ?>" <?php echo !$all_data_complete ? 'disabled title="Erst alle Druckdaten laden"' : ''; ?>>
                        <?php _e('👁️ E-Mail Vorschau', 'octo-print-designer'); ?>
                    </button>
                    <span class="preview-spinner spinner" style="float: none; margin: 0 0 0 5px;"></span>
                </p>
                
                <?php
                // Get API integration and status
                $api_integration = Octo_Print_API_Integration::get_instance();
                $api_status = $api_integration->get_api_status();
                $order_api_status = $api_integration->get_order_api_status($order_id);
                ?>

                <!-- API Status Section -->
                <div class="api-status-section" style="margin-bottom: 15px; padding: 12px; border-radius: 6px; background-color: #f8f9fa; border-left: 4px solid <?php echo esc_attr($api_status['color']); ?>;">
                    <h4 style="margin: 0 0 8px 0; font-size: 14px; color: <?php echo esc_attr($api_status['color']); ?>">
                        <?php echo $api_status['status'] === 'connected' ? '🟢' : ($api_status['status'] === 'error' ? '🔴' : '🟡'); ?> 
                        AllesKlarDruck API Status
                    </h4>
                    
                    <p style="margin: 0 0 8px 0; font-size: 12px; color: #666;">
                        <strong>Verbindung:</strong> <?php echo esc_html($api_status['message']); ?>
                    </p>
                    
                    <?php if ($order_api_status['sent']) : ?>
                        <div style="margin: 8px 0; padding: 8px; background: rgba(255,255,255,0.7); border-radius: 4px; border-left: 3px solid <?php echo esc_attr($order_api_status['color']); ?>;">
                            <p style="margin: 0; font-size: 11px; font-weight: bold; color: <?php echo esc_attr($order_api_status['color']); ?>">
                                📡 Diese Bestellung: <?php echo esc_html($order_api_status['message']); ?>
                            </p>
                            
                            <?php if (isset($order_api_status['details'])) : ?>
                                <details style="margin-top: 5px;">
                                    <summary style="cursor: pointer; font-size: 10px; color: #666;">🔍 API-Details anzeigen</summary>
                                    <div style="margin-top: 5px; font-size: 10px; color: #666;">
                                        <?php if (!empty($order_api_status['details']['allesklardruck_order_id'])) : ?>
                                            <strong>AllesKlarDruck Bestell-ID:</strong> <?php echo esc_html($order_api_status['details']['allesklardruck_order_id']); ?><br>
                                        <?php endif; ?>
                                        
                                        <?php if (!empty($order_api_status['details']['order_status'])) : ?>
                                            <strong>API-Status:</strong> <?php echo esc_html($order_api_status['details']['order_status']); ?><br>
                                        <?php endif; ?>
                                        
                                        <?php if (!empty($order_api_status['details']['tracking_number'])) : ?>
                                            <strong>Tracking:</strong> <?php echo esc_html($order_api_status['details']['tracking_number']); ?><br>
                                        <?php endif; ?>
                                        
                                        <strong>HTTP Status:</strong> <?php echo esc_html($order_api_status['details']['status_code'] ?? 'Unknown'); ?><br>
                                        <strong>Gesendet am:</strong> <?php echo esc_html($order_api_status['details']['sent_date']); ?>
                                    </div>
                                </details>
                            <?php endif; ?>
                        </div>
                    <?php else : ?>
                        <p style="margin: 5px 0 0 0; font-size: 11px; color: #856404;">
                            <em>💡 Diese Bestellung wurde noch nicht an die API gesendet</em>
                        </p>
                    <?php endif; ?>
                </div>

                <p style="margin-bottom: 8px;">
                    <button type="button" id="preview_api_payload" class="button button-secondary" 
                            data-order-id="<?php echo $order_id; ?>" 
                            style="margin-right: 8px;"
                            title="API-Daten vor dem Versand anzeigen">
                        👁️ Preview API-Daten
                    </button>
                    
                    <button type="button" id="send_to_print_provider_api" class="button button-secondary" 
                            data-order-id="<?php echo $order_id; ?>" 
                            data-auto-refresh="<?php echo !$all_data_complete ? 'true' : 'false'; ?>"
                            <?php echo ($api_status['status'] !== 'connected' || !$all_data_complete) ? 'disabled' : ''; ?>
                            title="<?php echo esc_attr($api_status['message']); ?>">
                        
                        <?php if ($api_status['status'] === 'connected') : ?>
                            <?php echo !$all_data_complete ? '🔄 Daten laden & API senden' : '📡 Send to AllesKlarDruck API'; ?>
                        <?php else : ?>
                            📡 API nicht verfügbar
                        <?php endif; ?>
                    </button>
                    <span class="api-spinner spinner" style="float: none; margin: 0 0 0 5px;"></span>
                    
                    <?php if ($order_api_status['sent']) : ?>
                        <button type="button" id="resend_to_print_provider_api" class="button button-secondary" 
                                data-order-id="<?php echo $order_id; ?>" 
                                style="margin-left: 8px;"
                                title="Bestellung erneut an AllesKlarDruck API senden">
                            🔄 Dennoch erneut senden
                        </button>
                    <?php endif; ?>
                </p>
                
                <p style="margin-bottom: 0;">
                    <button type="button" id="send_to_print_provider" class="button button-primary" data-auto-refresh="<?php echo !$all_data_complete ? 'true' : 'false'; ?>">
                        <?php echo !$all_data_complete ? '🔄 Daten laden & senden' : '📧 Send to Print Provider'; ?>
                    </button>
                    <span class="spinner" style="float: none; margin: 0 0 0 5px;"></span>
                </p>
            </div>
        </div>
        
        <script>
            jQuery(document).ready(function($) {
                // Helper function to create detailed status messages
                function createStatusMessage(type, title, message, details = null) {
                    var className = type === 'success' ? 'notice-success' : type === 'error' ? 'notice-error' : 'notice-info';
                    var icon = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
                    
                    var html = '<div class="notice ' + className + '" style="margin: 10px 0; padding: 10px;">';
                    html += '<p style="margin: 0 0 5px 0; font-weight: bold;">' + icon + ' ' + title + '</p>';
                    html += '<p style="margin: 0; font-size: 13px;">' + message + '</p>';
                    
                    if (details && details.length > 0) {
                        html += '<details style="margin-top: 8px; font-size: 11px; color: #666;">';
                        html += '<summary style="cursor: pointer; font-weight: bold;">🔍 Details anzeigen</summary>';
                        html += '<ul style="margin: 5px 0 0 15px; padding: 0;">';
                        for (var i = 0; i < details.length; i++) {
                            html += '<li>' + details[i] + '</li>';
                        }
                        html += '</ul></details>';
                    }
                    
                    html += '</div>';
                    return $(html);
                }
                
                // Enhanced Refresh Print Data Button
                $('#refresh_print_data').on('click', function() {
                    var button = $(this);
                    var spinner = button.next('.refresh-spinner');
                    var orderId = button.data('order-id');
                    
                    // Remove any existing notices
                    $('.notice').remove();
                    
                    // Show loading state
                    button.prop('disabled', true).text('🔄 Starte Datenabfrage...');
                    spinner.css('visibility', 'visible');
                    
                    // Create progress container
                    var progressContainer = $('<div class="refresh-progress" style="margin: 10px 0; padding: 8px; background: #f0f0f1; border-radius: 4px;"></div>');
                    var progressText = $('<p style="margin: 0; font-size: 12px; color: #666;">📡 Verbinde mit Datenbank...</p>');
                    progressContainer.append(progressText);
                    progressContainer.insertBefore(button.parent());
                    
                    // STEP 1: Capture JSON from frontend with comprehensive logging
                    console.log('🚀 [DESIGN SAVE] Starting design data capture process...');
                    let designDataJSON = null;
                    try {
                        if (typeof window.generateDesignData === 'function') {
                            console.log('✅ [DESIGN SAVE] generateDesignData() function available');
                            designDataJSON = window.generateDesignData();

                            if (designDataJSON) {
                                console.group('📊 [DESIGN SAVE] Design Data Successfully Captured');
                                console.log('🔍 Data Structure:', {
                                    timestamp: designDataJSON.timestamp || 'missing',
                                    template_view_id: designDataJSON.template_view_id || 'missing',
                                    elements_count: designDataJSON.elements ? designDataJSON.elements.length : 0,
                                    data_size: JSON.stringify(designDataJSON).length + ' characters'
                                });
                                console.log('📋 Complete JSON Object:', designDataJSON);
                                console.groupEnd();
                            } else {
                                console.warn('⚠️ [DESIGN SAVE] generateDesignData() returned null/undefined');
                            }
                        } else {
                            console.error('❌ [DESIGN SAVE] generateDesignData() function not available');
                        }
                    } catch (error) {
                        console.group('❌ [DESIGN SAVE] Design data capture failed');
                        console.error('Error:', error.message);
                        console.error('Stack:', error.stack);
                        console.groupEnd();
                    }

                    // STEP 2: Send to server with comprehensive AJAX logging
                    console.log('📤 [AJAX SEND] Preparing server request with design data...');
                    console.log('📋 [AJAX SEND] Request payload:', {
                        action: 'octo_refresh_print_data',
                        order_id: orderId,
                        has_design_data: !!designDataJSON,
                        data_size: designDataJSON ? JSON.stringify(designDataJSON).length : 0,
                        nonce_present: !!$('#octo_print_provider_nonce').val()
                    });

                    $.ajax({
                        url: ajaxurl,
                        type: 'POST',
                        data: {
                            action: 'octo_refresh_print_data',
                            order_id: orderId,
                            design_data_json: designDataJSON, // NEW: Add JSON payload
                            nonce: $('#octo_print_provider_nonce').val()
                        },
                        beforeSend: function() {
                            console.log('⏳ [AJAX SEND] Request started - sending to server...');
                            progressText.html('🔍 Suche Design-Items in Bestellung...');
                            button.text('🔄 Analysiere Bestellung...');
                        },
                        success: function(response) {
                            console.group('✅ [AJAX SUCCESS] Server response received');
                            console.log('📋 Response data:', response);
                            console.log('🔍 Response details:', {
                                success: response.success || false,
                                message: response.data?.message || 'no message',
                                debug_entries: response.data?.debug ? response.data.debug.length : 0
                            });

                            // 🖼️ [PNG DEBUG] Log PNG loading results
                            console.group('🖼️ [PNG DEBUG] PNG File Information');
                            console.log('PNG files found:', response.data?.png_files_count || 0);
                            console.log('Preview available:', response.data?.preview_available || false);
                            if (response.data?.png_files && response.data.png_files.length > 0) {
                                console.log('PNG files details:', response.data.png_files);
                                response.data.png_files.forEach((file, index) => {
                                    console.log(`PNG ${index + 1}: Design ${file.design_id} → ${file.print_file_url}`);
                                });
                            } else {
                                console.log('⚠️ No PNG files found in response');
                            }
                            console.groupEnd();
                            console.groupEnd();

                            progressText.html('📊 Verarbeite Server-Antwort...');
                            button.text('🔄 Verarbeite Daten...');

                            setTimeout(function() {
                                progressContainer.remove();
                                
                                if (response.success) {
                                    // Success with detailed info
                                    var title = 'Druckdaten erfolgreich geladen!';
                                    var message = response.data.message || 'Daten wurden aus der Datenbank aktualisiert.';
                                    var details = response.data.debug || [];

                                    // 🔧 FIX: Add PNG file information to success message
                                    if (response.data.png_files_count && response.data.png_files_count > 0) {
                                        details.push('✅ ' + response.data.png_files_count + ' PNG-Datei(en) gefunden - Preview verfügbar');
                                        message += ' (' + response.data.png_files_count + ' PNG-Datei(en) verfügbar)';
                                    } else {
                                        details.push('⚠️ Keine PNG-Dateien gefunden - Erstelle Design zuerst');
                                    }
                                    
                                    createStatusMessage('success', title, message, details)
                                        .insertBefore(button.parent());
                                    
                                    button.text('✅ Erfolgreich!').css('background-color', '#46b450');
                                    
                                    // 🖼️ [PNG FINAL] Log final status before reload
                                    console.group('🖼️ [PNG FINAL] Final Status Before Reload');
                                    console.log('Total PNG files loaded:', response.data?.png_files_count || 0);
                                    console.log('Preview will be available:', response.data?.preview_available || false);
                                    console.log('Page will reload in 3 seconds to activate preview button...');
                                    console.groupEnd();

                                    // Show countdown
                                    var countdown = 3;
                                    var countdownInterval = setInterval(function() {
                                        button.text('✅ Neu laden in ' + countdown + 's...');
                                        countdown--;

                                        if (countdown < 0) {
                                            clearInterval(countdownInterval);
                                            console.log('🔄 [RELOAD] Reloading page to activate preview functionality...');
                                            location.reload();
                                        }
                                    }, 1000);
                                    
                                } else {
                                    // Error with debug info
                                    var title = 'Fehler beim Laden der Druckdaten';
                                    var message = response.data.message || 'Unbekannter Fehler aufgetreten.';
                                    var details = response.data.debug || [];
                                    
                                    createStatusMessage('error', title, message, details)
                                        .insertBefore(button.parent());
                                    
                                    button.prop('disabled', false).text('🔄 Erneut versuchen').css('background-color', '');
                                }
                            }, 500);
                        },
                        error: function(xhr, status, error) {
                            console.group('❌ [AJAX ERROR] Server request failed');
                            console.error('XHR object:', xhr);
                            console.error('Status:', status);
                            console.error('Error:', error);
                            console.error('Response text:', xhr.responseText);
                            console.groupEnd();

                            progressContainer.remove();

                            var title = 'Netzwerkfehler';
                            var message = 'Verbindung zum Server fehlgeschlagen.';
                            var details = [
                                'HTTP Status: ' + (xhr.status || 'Unbekannt'),
                                'Fehler: ' + (error || 'Unbekannt'),
                                'Status: ' + (status || 'Unbekannt')
                            ];
                            
                            createStatusMessage('error', title, message, details)
                                .insertBefore(button.parent());
                            
                            button.prop('disabled', false).text('🔄 Druckdaten aus DB laden').css('background-color', '');
                        },
                        complete: function() {
                            spinner.css('visibility', 'hidden');
                        }
                    });
                });
                
                // Preview Email Button
                $('#preview_print_provider_email').on('click', function() {
                    var button = $(this);
                    var spinner = button.next('.preview-spinner');
                    var orderId = button.data('order-id');
                    
                    if (button.prop('disabled')) {
                        return;
                    }
                    
                    // Remove any existing notices
                    $('.notice').remove();
                    
                    button.prop('disabled', true).text('👁️ Lade Preview...');
                    spinner.css('visibility', 'visible');
                    
                    $.ajax({
                        url: ajaxurl,
                        type: 'POST',
                        data: {
                            action: 'octo_preview_print_provider_email',
                            order_id: orderId,
                            email: $('#print_provider_email').val() || 'preview@example.com',
                            notes: $('#print_provider_notes').val(),
                            nonce: $('#octo_print_provider_nonce').val()
                        },
                        success: function(response) {
                            if (response.success) {
                                // Create modal overlay
                                var modal = $('<div id="email-preview-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 100000; display: flex; align-items: center; justify-content: center;"></div>');
                                
                                var modalContent = $('<div style="background: white; width: 90%; max-width: 800px; max-height: 90%; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.3);"></div>');
                                
                                var modalHeader = $('<div style="padding: 15px 20px; background: #0073aa; color: white; display: flex; justify-content: between; align-items: center;"><h3 style="margin: 0; color: white;">📧 E-Mail Vorschau - Print Provider</h3><button id="close-preview" style="background: none; border: none; color: white; font-size: 20px; cursor: pointer; float: right;">&times;</button></div>');
                                
                                var modalBody = $('<div style="padding: 0; max-height: 70vh; overflow-y: auto;"></div>');
                                modalBody.html(response.data.preview);
                                
                                var modalFooter = $('<div style="padding: 15px 20px; background: #f8f9fa; border-top: 1px solid #dee2e6; text-align: right;"><button id="close-preview-footer" class="button">Schließen</button></div>');
                                
                                modalContent.append(modalHeader);
                                modalContent.append(modalBody);
                                modalContent.append(modalFooter);
                                modal.append(modalContent);
                                
                                $('body').append(modal);
                                
                                // Close modal handlers
                                $('#close-preview, #close-preview-footer').on('click', function() {
                                    modal.remove();
                                });
                                
                                modal.on('click', function(e) {
                                    if (e.target === modal[0]) {
                                        modal.remove();
                                    }
                                });
                                
                                button.text('✅ Preview erstellt!').css('background-color', '#46b450');
                                setTimeout(function() {
                                    button.prop('disabled', false).text('👁️ E-Mail Vorschau').css('background-color', '');
                                }, 2000);
                                
                            } else {
                                createStatusMessage('error', 'Preview-Fehler', response.data.message || 'Konnte keine Vorschau erstellen.')
                                    .insertBefore(button.parent());
                                
                                button.prop('disabled', false).text('👁️ E-Mail Vorschau');
                            }
                        },
                        error: function() {
                            createStatusMessage('error', 'Preview-Fehler', 'Netzwerkfehler beim Erstellen der Vorschau.')
                                .insertBefore(button.parent());
                            
                            button.prop('disabled', false).text('👁️ E-Mail Vorschau');
                        },
                        complete: function() {
                            spinner.css('visibility', 'hidden');
                        }
                    });
                });
                
                // Enhanced Send Email Button
                $('#send_to_print_provider').on('click', function() {
                    var button = $(this);
                    var spinner = button.next('.spinner');
                    var email = $('#print_provider_email').val();
                    var autoRefresh = button.data('auto-refresh');
                    var orderId = <?php echo intval($order_id); ?>;

                    if (!email) {
                        alert('<?php echo esc_js(__('Please enter a valid email address', 'octo-print-designer')); ?>');
                        return;
                    }

                    // Remove any existing notices
                    $('.notice').not('.email-sent-notice').remove();

                    // Wenn Daten fehlen, erst automatisch refreshen
                    if (autoRefresh === 'true') {
                        button.text('🔄 Lade Druckdaten...');
                        spinner.css('visibility', 'visible');
                        $.post(ajaxurl, {
                            action: 'octo_refresh_print_data',
                            order_id: orderId,
                            nonce: $('#octo_print_provider_nonce').val()
                        }, function(refreshResponse) {
                            if (refreshResponse.success) {
                                // Nach Refresh normal weitermachen
                                button.text('📧 Sende E-Mail...');
                                spinner.css('visibility', 'visible');
                                sendPrintProviderEmail();
                            } else {
                                alert('Fehler beim Laden der Druckdaten: ' + (refreshResponse.data && refreshResponse.data.message ? refreshResponse.data.message : 'Unbekannter Fehler'));
                                button.text('❌ Fehler - erneut versuchen');
                                spinner.css('visibility', 'hidden');
                                return;
                            }
                        });
                        return;
                    }

                    sendPrintProviderEmail();

                    function sendPrintProviderEmail() {
                        button.prop('disabled', true).text('📧 Bereite E-Mail vor...');
                        spinner.css('visibility', 'visible');

                        // Create progress for email
                        var emailProgress = $('<div class="email-progress" style="margin: 10px 0; padding: 8px; background: #e8f4fd; border-radius: 4px;"></div>');
                        var emailProgressText = $('<p style="margin: 0; font-size: 12px; color: #0073aa;">📧 Sammle Druckdaten...</p>');
                        emailProgress.append(emailProgressText);
                        emailProgress.insertBefore(button.parent());

                        $.ajax({
                            url: ajaxurl,
                            type: 'POST',
                            data: {
                                action: 'octo_send_print_provider_email',
                                order_id: orderId,
                                email: email,
                                notes: $('#print_provider_notes').val(),
                                nonce: $('#octo_print_provider_nonce').val()
                            },
                            beforeSend: function() {
                                emailProgressText.html('🔧 Erstelle E-Mail-Vorlage...');
                                button.text('📧 Erstelle E-Mail...');
                            },
                            xhr: function() {
                                var xhr = new window.XMLHttpRequest();
                                // Simulate progress updates
                                var progress = 0;
                                var progressInterval = setInterval(function() {
                                    progress += 10;
                                    if (progress <= 50) {
                                        emailProgressText.html('📊 Verarbeite Druckdaten (' + progress + '%)...');
                                    } else if (progress <= 80) {
                                        emailProgressText.html('📧 Sende E-Mail (' + progress + '%)...');
                                        button.text('📤 Sende E-Mail...');
                                    } else {
                                        clearInterval(progressInterval);
                                        emailProgressText.html('✅ Fertigstelle...');
                                    }
                                }, 200);
                                xhr.addEventListener('load', function() {
                                    clearInterval(progressInterval);
                                });
                                return xhr;
                            },
                            success: function(response) {
                                setTimeout(function() {
                                    emailProgress.remove();
                                    if (response.success) {
                                        var title = 'E-Mail erfolgreich versendet!';
                                        var message = response.data.message || 'Print Provider wurde benachrichtigt.';
                                        createStatusMessage('success', title, message)
                                            .insertBefore(button.parent());
                                        button.text('✅ E-Mail gesendet!').css('background-color', '#46b450');
                                        // Clear notes field
                                        $('#print_provider_notes').val('');
                                        setTimeout(function() {
                                            location.reload();
                                        }, 2000);
                                    } else {
                                        var title = 'Fehler beim Senden der E-Mail';
                                        var message = response.data && response.data.message ? response.data.message : 'Unbekannter Fehler beim Senden.';
                                        createStatusMessage('error', title, message)
                                            .insertBefore(button.parent());
                                        button.prop('disabled', false).text('📧 Send to Print Provider').css('background-color', '');
                                    }
                                }, 500);
                            },
                            error: function() {
                                emailProgress.remove();
                                var title = 'Netzwerkfehler';
                                var message = 'Verbindung zum Server fehlgeschlagen.';
                                createStatusMessage('error', title, message)
                                    .insertBefore(button.parent());
                                button.prop('disabled', false).text('📧 Send to Print Provider').css('background-color', '');
                            },
                            complete: function() {
                                spinner.css('visibility', 'hidden');
                            }
                        });
                    }
                });
                
                // Enhanced Send API Button with better error handling and progress tracking
                $('#send_to_print_provider_api').on('click', function() {
                    var button = $(this);
                    var spinner = button.next('.api-spinner');
                    var autoRefresh = button.data('auto-refresh');
                    var orderId = button.data('order-id');

                    if (button.prop('disabled')) {
                        return;
                    }

                    // Remove any existing notices
                    $('.notice').not('.email-sent-notice').remove();

                    // Check if already sent
                    if (button.text().includes('Bereits an API gesendet')) {
                        createStatusMessage('info', 'Bereits versendet', 'Diese Bestellung wurde bereits erfolgreich an die AllesKlarDruck API gesendet.')
                            .insertBefore(button.parent());
                        return;
                    }

                    // Wenn Daten fehlen, erst automatisch refreshen
                    if (autoRefresh === 'true') {
                        button.text('🔄 Lade Druckdaten...');
                        spinner.css('visibility', 'visible');
                        $.post(ajaxurl, {
                            action: 'octo_refresh_print_data',
                            order_id: orderId,
                            nonce: $('#octo_print_provider_nonce').val()
                        }, function(refreshResponse) {
                            if (refreshResponse.success) {
                                // Nach Refresh normal weitermachen
                                button.text('📡 Sende an API...');
                                sendToAPI();
                            } else {
                                createStatusMessage('error', 'Daten-Refresh fehlgeschlagen', 
                                    refreshResponse.data && refreshResponse.data.message ? refreshResponse.data.message : 'Unbekannter Fehler')
                                    .insertBefore(button.parent());
                                button.text('❌ Fehler - erneut versuchen');
                                spinner.css('visibility', 'hidden');
                                return;
                            }
                        });
                        return;
                    }

                    sendToAPI();

                    function sendToAPI() {
                        button.prop('disabled', true).text('📡 Verbinde mit AllesKlarDruck API...');
                        spinner.css('visibility', 'visible');

                        // Create enhanced progress for API
                        var apiProgress = $('<div class="api-progress" style="margin: 10px 0; padding: 12px; background: linear-gradient(90deg, #e3f2fd 0%, #bbdefb 100%); border-radius: 6px; border-left: 4px solid #2196f3;"></div>');
                        var apiProgressText = $('<p style="margin: 0; font-size: 12px; color: #1976d2; font-weight: bold;">🔗 Teste API-Verbindung...</p>');
                        apiProgress.append(apiProgressText);
                        apiProgress.insertBefore(button.parent());

                        $.ajax({
                            url: ajaxurl,
                            type: 'POST',
                            data: {
                                action: 'octo_send_print_provider_api',
                                order_id: orderId,
                                nonce: $('#octo_print_provider_nonce').val()
                            },
                            beforeSend: function() {
                                apiProgressText.html('📊 Verarbeite Bestelldaten...');
                                button.text('📊 Verarbeite Daten...');
                            },
                            xhr: function() {
                                var xhr = new window.XMLHttpRequest();
                                // Enhanced progress updates for API
                                var progress = 0;
                                var progressSteps = [
                                    '🔗 Verbinde mit AllesKlarDruck API...',
                                    '📊 Transformiere Druckdaten...',
                                    '🔄 Konvertiere zu API-Format...',
                                    '📤 Sende Bestellung...',
                                    '✅ Verarbeite API-Response...'
                                ];
                                
                                var progressInterval = setInterval(function() {
                                    if (progress < progressSteps.length - 1) {
                                        apiProgressText.html(progressSteps[progress]);
                                        button.text(progressSteps[progress].replace(/🔗|📊|🔄|📤|✅/g, '').trim() + '...');
                                        progress++;
                                    } else {
                                        clearInterval(progressInterval);
                                    }
                                }, 800);
                                
                                xhr.addEventListener('load', function() {
                                    clearInterval(progressInterval);
                                });
                                
                                return xhr;
                            },
                            success: function(response) {
                                setTimeout(function() {
                                    apiProgress.remove();
                                    
                                    if (response.success) {
                                        var title = '🎉 API-Versand erfolgreich!';
                                        var message = response.data.message || 'Bestellung wurde erfolgreich an AllesKlarDruck API übertragen.';
                                        var details = [];
                                        
                                        if (response.data.details) {
                                            var det = response.data.details;
                                            if (det.allesklardruck_order_id) {
                                                details.push('AllesKlarDruck Bestell-ID: ' + det.allesklardruck_order_id);
                                            }
                                            if (det.order_status) {
                                                details.push('Status: ' + det.order_status);
                                            }
                                            if (det.sent_date) {
                                                details.push('Gesendet am: ' + det.sent_date);
                                            }
                                        }
                                        
                                        createStatusMessage('success', title, message, details)
                                            .insertBefore(button.parent());
                                        
                                        button.text('✅ Erfolgreich an API gesendet!').css('background-color', '#28a745');
                                        
                                        setTimeout(function() {
                                            location.reload();
                                        }, 3000);
                                        
                                    } else {
                                        var title = '❌ API-Versand fehlgeschlagen';
                                        var message = response.data && response.data.message ? response.data.message : 'Unbekannter Fehler beim API-Versand.';
                                        var details = [];
                                        
                                        // Add troubleshooting tips if available
                                        if (response.data && response.data.troubleshooting) {
                                            details = details.concat(response.data.troubleshooting.map(function(tip) {
                                                return '💡 ' + tip;
                                            }));
                                        }
                                        
                                        // Add technical details if available
                                        if (response.data && response.data.technical_details && response.data.technical_details.status_code) {
                                            details.push('HTTP Status: ' + response.data.technical_details.status_code);
                                        }
                                        
                                        createStatusMessage('error', title, message, details)
                                            .insertBefore(button.parent());
                                        
                                        button.prop('disabled', false).text('📡 Send to AllesKlarDruck API').css('background-color', '');
                                    }
                                }, 1000);
                            },
                            error: function(xhr, status, error) {
                                apiProgress.remove();
                                
                                var title = '🌐 Netzwerkfehler';
                                var message = 'Verbindung zur AllesKlarDruck API fehlgeschlagen.';
                                var details = [
                                    'HTTP Status: ' + (xhr.status || 'Unbekannt'),
                                    'Fehler: ' + (error || 'Unbekannt'),
                                    '💡 Überprüfen Sie Ihre Internetverbindung',
                                    '💡 Versuchen Sie es in einigen Minuten erneut'
                                ];
                                
                                createStatusMessage('error', title, message, details)
                                    .insertBefore(button.parent());
                                
                                button.prop('disabled', false).text('📡 Send to AllesKlarDruck API').css('background-color', '');
                            },
                            complete: function() {
                                spinner.css('visibility', 'hidden');
                            }
                        });
                    }
                });
                
                // Preview API Payload Button
                $('#preview_api_payload').on('click', function() {
                    var button = $(this);
                    var orderId = button.data('order-id');
                    
                    if (button.prop('disabled')) {
                        return;
                    }
                    
                    // Remove any existing notices
                    $('.notice').remove();
                    
                    button.prop('disabled', true).text('👁️ Generiere Preview...');
                    
                    $.ajax({
                        url: ajaxurl,
                        type: 'POST',
                        data: {
                            action: 'octo_preview_api_payload',
                            order_id: orderId,
                            nonce: $('#octo_print_provider_nonce').val()
                        },
                        success: function(response) {
                            if (response.success) {
                                // Create modal for API payload preview
                                var modal = $('<div class="api-preview-modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.7); z-index: 999999; display: flex; align-items: center; justify-content: center;"></div>');
                                var modalContent = $('<div style="background: white; border-radius: 8px; padding: 20px; max-width: 90%; max-height: 90%; overflow: auto; position: relative;"></div>');
                                
                                var header = $('<div style="margin-bottom: 20px; border-bottom: 2px solid #e0e0e0; padding-bottom: 10px;"></div>');
                                header.append('<h3 style="margin: 0; color: #333;">👁️ API-Daten Preview</h3>');
                                header.append('<p style="margin: 5px 0 0 0; color: #666; font-size: 13px;">Exakte Daten, die an AllesKlarDruck API gesendet werden:</p>');
                                
                                var closeButton = $('<button type="button" style="position: absolute; top: 15px; right: 15px; background: #dc3545; color: white; border: none; border-radius: 4px; padding: 5px 10px; cursor: pointer; font-size: 12px;">✕ Schließen</button>');
                                
                                var payloadContainer = $('<div style="background: #f8f9fa; border: 1px solid #e9ecef; border-radius: 4px; padding: 15px; margin-top: 15px; font-family: monospace; font-size: 12px; line-height: 1.4; max-height: 400px; overflow-y: auto;"></div>');
                                payloadContainer.html('<pre style="margin: 0; white-space: pre-wrap;">' + response.data.formatted_payload + '</pre>');
                                
                                var actionButtons = $('<div style="margin-top: 20px; text-align: center;"></div>');
                                var sendButton = $('<button type="button" class="button button-primary" style="margin-right: 10px;">📡 Jetzt an API senden</button>');
                                var cancelButton = $('<button type="button" class="button button-secondary">❌ Abbrechen</button>');
                                
                                actionButtons.append(sendButton).append(cancelButton);
                                
                                modalContent.append(closeButton).append(header).append(payloadContainer).append(actionButtons);
                                modal.append(modalContent);
                                $('body').append(modal);
                                
                                // Close modal handlers
                                closeButton.on('click', function() {
                                    modal.remove();
                                    button.prop('disabled', false).text('👁️ Preview API-Daten');
                                });
                                
                                cancelButton.on('click', function() {
                                    modal.remove();
                                    button.prop('disabled', false).text('👁️ Preview API-Daten');
                                });
                                
                                // Send to API from preview
                                sendButton.on('click', function() {
                                    modal.remove();
                                    $('#send_to_print_provider_api').click();
                                });
                                
                            } else {
                                createStatusMessage('error', 'Preview fehlgeschlagen', 
                                    response.data && response.data.message ? response.data.message : 'Unbekannter Fehler')
                                    .insertBefore(button.parent());
                                button.prop('disabled', false).text('👁️ Preview API-Daten');
                            }
                        },
                        error: function() {
                            createStatusMessage('error', 'Preview fehlgeschlagen', 'Netzwerkfehler beim Generieren der API-Preview')
                                .insertBefore(button.parent());
                            button.prop('disabled', false).text('👁️ Preview API-Daten');
                        }
                    });
                });
                
                // Resend to API Button
                $('#resend_to_print_provider_api').on('click', function() {
                    var button = $(this);
                    var orderId = button.data('order-id');
                    
                    if (button.prop('disabled')) {
                        return;
                    }
                    
                    // Remove any existing notices
                    $('.notice').remove();
                    
                    // Show confirmation dialog
                    if (!confirm('⚠️ Bestätigung\n\nDiese Bestellung wurde bereits an die AllesKlarDruck API gesendet.\n\nMöchten Sie sie dennoch erneut senden?\n\nDies könnte zu Duplikaten führen.')) {
                        return;
                    }
                    
                    button.prop('disabled', true).text('🔄 Sende erneut...');
                    
                    $.ajax({
                        url: ajaxurl,
                        type: 'POST',
                        data: {
                            action: 'octo_send_print_provider_api',
                            order_id: orderId,
                            resend: 'true',
                            nonce: $('#octo_print_provider_nonce').val()
                        },
                        success: function(response) {
                            if (response.success) {
                                // Check if this is a duplicate order confirmation
                                if (response.data && response.data.api_response && response.data.api_response.status === 'duplicate_confirmed') {
                                    createStatusMessage('success', '✅ Bestellung bereits vorhanden', 
                                        response.data.message || 'Diese Bestellung existiert bereits bei AllesKlarDruck und wurde erfolgreich verarbeitet.')
                                        .insertBefore(button.parent());
                                } else {
                                    createStatusMessage('success', '🔄 Erneuter API-Versand erfolgreich!', 
                                        response.data.message || 'Bestellung wurde erneut erfolgreich an AllesKlarDruck API übertragen.')
                                        .insertBefore(button.parent());
                                }
                                button.prop('disabled', false).text('🔄 Dennoch erneut senden');
                            } else {
                                // Special handling for duplicate order during resend
                                if (response.data && response.data.error_code === 'duplicate_order') {
                                    createStatusMessage('success', '✅ Bestellung bereits vorhanden', 
                                        response.data.message || 'Diese Bestellung existiert bereits bei AllesKlarDruck und wurde erfolgreich verarbeitet.')
                                        .insertBefore(button.parent());
                                    button.prop('disabled', false).text('🔄 Dennoch erneut senden');
                                } else {
                                    createStatusMessage('error', 'Erneuter API-Versand fehlgeschlagen', 
                                        response.data && response.data.message ? response.data.message : 'Unbekannter Fehler')
                                        .insertBefore(button.parent());
                                    button.prop('disabled', false).text('🔄 Dennoch erneut senden');
                                }
                            }
                        },
                        error: function() {
                            createStatusMessage('error', 'Erneuter API-Versand fehlgeschlagen', 'Netzwerkfehler beim erneuten API-Versand')
                                .insertBefore(button.parent());
                            button.prop('disabled', false).text('🔄 Dennoch erneut senden');
                        }
                    });
                });
            });
        </script>
        <?php
    }

    /**
     * AJAX handler for sending print provider email
     */
    public function ajax_send_print_provider_email() {
        // Security check
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_send_to_print_provider')) {
            wp_send_json_error(array('message' => __('Security check failed', 'octo-print-designer')));
        }
        
        // Check if user has permission
        if (!current_user_can('edit_shop_orders')) {
            wp_send_json_error(array('message' => __('You do not have permission to perform this action', 'octo-print-designer')));
        }
        
        // Get and validate parameters
        $order_id = isset($_POST['order_id']) ? absint($_POST['order_id']) : 0;
        $email = isset($_POST['email']) ? sanitize_email($_POST['email']) : '';
        $notes = isset($_POST['notes']) ? sanitize_textarea_field($_POST['notes']) : '';
        
        if (!$order_id || !$email) {
            wp_send_json_error(array('message' => __('Missing required fields', 'octo-print-designer')));
        }
        
        // Get order
        $order = wc_get_order($order_id);
        if (!$order) {
            wp_send_json_error(array('message' => __('Order not found', 'octo-print-designer')));
        }
        
        // Send email
        $result = $this->send_print_provider_email($order, $email, $notes);
        
        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
        }
        
        // Save email address and sent timestamp
        update_post_meta($order_id, '_print_provider_email', $email);
        update_post_meta($order_id, '_print_provider_email_sent', time());
        
        // Add order note
        $order->add_order_note(
            sprintf(__('Print provider email sent to %s', 'octo-print-designer'), $email),
            false, // Customer note
            true   // Added by user
        );
        
        wp_send_json_success(array(
            'message' => __('Email successfully sent to print provider', 'octo-print-designer')
        ));
    }

    /**
 * Send print provider email
 * 
 * @param WC_Order $order The order object
 * @param string $email Print provider email address
 * @param string $notes Additional notes to include
 * @return bool|WP_Error True on success, WP_Error on failure
 */
public function send_print_provider_email($order, $email, $notes = '') {
    if (!$order || !is_email($email)) {
        return new WP_Error('invalid_parameters', __('Invalid order or email address', 'octo-print-designer'));
    }
    
    // Check YPrint plugin dependency
    if (!$this->check_yprint_dependency()) {
        return new WP_Error('yprint_dependency', __('YPrint plugin is not active or email functions are not available', 'octo-print-designer'));
    }
    
    // Get design items from the order
    $design_items = array();
    
    foreach ($order->get_items() as $item) {
        $design_id = $this->get_design_meta($item, 'design_id');
        
        // Handle design products
        if ($design_id) {
            $design_item = array(
                'name' => $this->get_design_meta($item, 'name'),
                'variation_name' => $this->get_design_meta($item, 'design_color') ?: 'Standard',
                'size_name' => $this->get_design_meta($item, 'size_name') ?: 'One Size',
                'design_id' => $design_id,
                'template_id' => $this->get_design_meta($item, 'template_id') ?: '',
                'preview_url' => $this->get_design_meta($item, 'preview_url') ?: '',
                'design_views' => $this->parse_design_views($item),
                'is_design_product' => true,
                'quantity' => $item->get_quantity()
            );
        } else {
            // Handle blank products
            $design_item = array(
                'name' => $item->get_name(),
                'variation_name' => $this->get_product_variation_name($item),
                'size_name' => $this->get_product_size_name($item),
                'quantity' => $item->get_quantity(),
                'is_design_product' => false
            );
        }
        
        $design_items[] = $design_item;
    }
    
    if (empty($design_items)) {
        return new WP_Error('no_items', __('No items found in this order', 'octo-print-designer'));
    }
    
    // Create email content using YPrint template
    $email_content = $this->build_print_provider_email_content($order, $design_items, $notes);
    
    // Ensure YPrint email functions are loaded
if (!function_exists('yprint_get_email_template')) {
    // Try to load the YPrint plugin email functions
    $yprint_email_file = WP_PLUGIN_DIR . '/yprint-plugin/includes/email.php';
    if (file_exists($yprint_email_file)) {
        require_once $yprint_email_file;
    }
    
    // Check again if function is now available
    if (!function_exists('yprint_get_email_template')) {
        return new WP_Error('template_missing', __('YPrint email template not available. Please ensure the YPrint plugin is active.', 'octo-print-designer'));
    }
}

$email_html = yprint_get_email_template(
    'Neue Druckbestellung #' . $order->get_order_number(),
    '', // Leerer Username für Print Provider
    $email_content
);

    
    // E-Mail-Header für HTML
    $headers = array(
        'Content-Type: text/html; charset=UTF-8',
        'From: YPrint <noreply@yprint.de>'
    );
    
    $subject = sprintf('Neue Druckbestellung #%s - YPrint', $order->get_order_number());
    
    // E-Mail senden
    $sent = wp_mail($email, $subject, $email_html, $headers);
    
    if (!$sent) {
        return new WP_Error('email_failed', __('Failed to send email to print provider', 'octo-print-designer'));
    }
    
    return true;
}

/**
 * Parse design views from order item meta data
 */
private function parse_design_views($item) {
    $views = array();
    
    // Get processed views data (als String gespeichert, muss dekodiert werden)
    $processed_views_json = $item->get_meta('_db_processed_views');
    if (!empty($processed_views_json)) {
        // Dekodiere JSON falls es als String gespeichert ist
        if (is_string($processed_views_json)) {
            $processed_views = json_decode($processed_views_json, true);
        } else {
            $processed_views = $processed_views_json;
        }
        
        if (is_array($processed_views)) {
            foreach ($processed_views as $view_key => $view_data) {
                $views[] = array(
                    'view_name' => $view_data['view_name'] ?: 'Unbekannte Ansicht',
                    'view_id' => $view_data['system_id'] ?: '',
                    'variation_id' => $view_data['variation_id'] ?: '',
                    'images' => $this->parse_view_images($view_data['images'] ?: array())
                );
            }
        }
    }
    
    return $views;
}

/**
 * Parse images from view data
 */
private function parse_view_images($images) {
    $parsed_images = array();
    
    if (!is_array($images)) {
        return $parsed_images;
    }
    
    foreach ($images as $image) {
        if (!isset($image['url']) || empty($image['url'])) {
            continue;
        }
        
        $transform = $image['transform'] ?: array();
        
        $parsed_images[] = array(
            'filename' => $image['filename'] ?: basename($image['url']),
            'url' => $image['url'],
            'original_width_px' => $transform['width'] ?: 0,
            'original_height_px' => $transform['height'] ?: 0,
            'position_left_px' => round($transform['left'] ?: 0, 2),
            'position_top_px' => round($transform['top'] ?: 0, 2),
            'scale_x' => $transform['scaleX'] ?: 1,
            'scale_y' => $transform['scaleY'] ?: 1,
            'scale_x_percent' => round(($transform['scaleX'] ?: 1) * 100, 1),
            'scale_y_percent' => round(($transform['scaleY'] ?: 1) * 100, 1),
            'print_width_mm' => round(($transform['width'] ?: 0) * ($transform['scaleX'] ?: 1) * 0.264583, 1),
            'print_height_mm' => round(($transform['height'] ?: 0) * ($transform['scaleY'] ?: 1) * 0.264583, 1)
        );
    }
    
    return $parsed_images;
}

/**
 * Get product variation name for blank products
 */
private function get_product_variation_name($item) {
    $product = $item->get_product();
    if (!$product) {
        return 'Standard';
    }
    
    if ($product->is_type('variation')) {
        $attributes = $product->get_variation_attributes();
        if (!empty($attributes)) {
            return implode(', ', array_values($attributes));
        }
    }
    
    return 'Standard';
}

/**
 * Get product size name for blank products
 */
private function get_product_size_name($item) {
    $product = $item->get_product();
    if (!$product) {
        return 'One Size';
    }
    
    if ($product->is_type('variation')) {
        $attributes = $product->get_variation_attributes();
        foreach ($attributes as $key => $value) {
            if (strpos(strtolower($key), 'size') !== false || strpos(strtolower($key), 'größe') !== false) {
                return $value;
            }
        }
    }
    
    return 'One Size';
}

/**
 * Build print provider email content
 */
private function build_print_provider_email_content($order, $design_items, $notes = '') {
    ob_start();
    ?>
    <p style="margin-bottom: 20px; color: #343434; line-height: 1.5;">
        Eine neue Bestellung ist eingegangen, die gedruckt werden muss. Hier sind alle Details:
    </p>

    <!-- Bestelldetails -->
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8f9fa; border-radius: 8px; overflow: hidden;">
        <tr style="background: #0079FF; color: white;">
            <td colspan="2" style="padding: 15px; font-weight: bold; font-size: 16px;">
                📦 Bestelldetails
            </td>
        </tr>
        <tr>
            <td style="padding: 10px 15px; border-bottom: 1px solid #e5e5e5; font-weight: bold;">Bestellnummer:</td>
            <td style="padding: 10px 15px; border-bottom: 1px solid #e5e5e5;">#<?php echo esc_html($order->get_order_number()); ?></td>
        </tr>
        <tr>
            <td style="padding: 10px 15px; font-weight: bold;">Bestelldatum:</td>
            <td style="padding: 10px 15px; font-weight: bold;"><?php echo esc_html($order->get_date_created()->format('d.m.Y H:i')); ?></td>
        </tr>
    </table>

    <!-- Lieferadresse -->
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8f9fa; border-radius: 8px; overflow: hidden;">
        <tr style="background: #0079FF; color: white;">
            <td style="padding: 15px; font-weight: bold; font-size: 16px;">
                🏠 Lieferadresse
            </td>
        </tr>
        <tr>
            <td style="padding: 15px; line-height: 1.5;">
                <?php 
                if ($order->has_shipping_address()) {
                    echo wp_kses_post($order->get_formatted_shipping_address());
                } else {
                    echo wp_kses_post($order->get_formatted_billing_address());
                }
                ?>
            </td>
        </tr>
    </table>

    <!-- Paketinhalt Übersicht -->
    <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #f8f9fa; border-radius: 8px; overflow: hidden;">
        <tr style="background: #0079FF; color: white;">
            <td colspan="2" style="padding: 15px; font-weight: bold; font-size: 16px;">
                📋 Paketinhalt (Übersicht)
            </td>
        </tr>
        <?php foreach ($design_items as $index => $item) : ?>
            <tr>
                <td style="padding: 8px 15px; border-bottom: 1px solid #e5e5e5; font-weight: bold; font-size: 13px;">
                    <?php if ($item['is_design_product']) : ?>
                        🎨 <?php echo esc_html($item['name']); ?>
                    <?php else : ?>
                        📦 <?php echo esc_html($item['name']); ?>
                    <?php endif; ?>
                </td>
                <td style="padding: 8px 15px; border-bottom: 1px solid #e5e5e5; font-size: 12px;">
                    <?php echo esc_html($item['variation_name']); ?> – <?php echo esc_html($item['size_name']); ?>
                    <?php if (!$item['is_design_product']) : ?>
                        <br><em style="color: #666;">(Menge: <?php echo esc_html($item['quantity']); ?>)</em>
                    <?php endif; ?>
                </td>
            </tr>
        <?php endforeach; ?>
    </table>

    <!-- Produktdetails -->
    <?php foreach ($design_items as $index => $item) : ?>
        <?php if ($item['is_design_product']) : ?>
            <div style="margin: 20px 0; padding: 15px; background: #fff; border: 2px solid #0079FF; border-radius: 8px;">
                <h3 style="margin: 0 0 15px 0; color: #0079FF; font-size: 16px;">
                     <strong>Druckdaten-Aufstellung für „<?php echo esc_html($item['name']); ?>"</strong>
                </h3>
                
                <p style="margin: 0 0 15px 0; font-size: 13px; line-height: 1.4;">
                    <strong>Produktvariante:</strong> <?php echo esc_html($item['variation_name']); ?> – <?php echo esc_html($item['size_name']); ?><br>
                    <?php if (!empty($item['design_id'])) : ?>
                        <strong>Design-ID:</strong> <?php echo esc_html($item['design_id']); ?><br>
                    <?php endif; ?>
                    <?php if (!empty($item['template_id'])) : ?>
                        <strong>Template-ID:</strong> <?php echo esc_html($item['template_id']); ?><br>
                    <?php endif; ?>
                </p>

                <?php if (!empty($item['preview_url'])) : ?>
                    <div style="text-align: center; margin: 15px 0;">
                        <strong>Produkt-Preview:</strong><br>
                        <img src="<?php echo esc_url($item['preview_url']); ?>" alt="Produkt Preview" style="max-width: 250px; height: auto; border: 1px solid #ddd; border-radius: 4px; margin-top: 5px;">
                    </div>
                <?php endif; ?>

                <?php if (!empty($item['design_views'])) : ?>
                    <?php foreach ($item['design_views'] as $view_index => $view) : ?>
                        <div style="margin: 15px 0; padding: 10px; background-color: #f8f9fa; border-left: 3px solid #0079FF; border-radius: 4px;">
                            <h4 style="margin: 0 0 10px 0; color: #0079FF; font-size: 14px;"> <strong>View <?php echo ($view_index + 1); ?>: <?php echo esc_html($view['view_name']); ?></strong></h4>
                            
                            <p style="margin: 5px 0; font-size: 11px;">
                                • <strong>System-ID der View:</strong> <code><?php echo esc_html($view['view_id']); ?></code><br>
                                • <strong>Produktvariante (Variation-ID):</strong> <code><?php echo esc_html($view['variation_id']); ?></code>
                            </p>
                            
                            <?php if (!empty($view['images'])) : ?>
                                <?php foreach ($view['images'] as $img_index => $img) : ?>
                                    <div style="margin: 10px 0; padding: 8px; background-color: #ffffff; border: 1px solid #e1e5e9; border-radius: 3px;">
                                        <h5 style="margin: 0 0 8px 0; color: #333; font-size: 12px;"><strong>Bild <?php echo ($img_index + 1); ?>: <?php echo esc_html($img['filename']); ?></strong></h5>
                                        
                                        <p style="margin: 3px 0; font-size: 10px; line-height: 1.3;">
                                            • <strong>Dateiname:</strong> <code style="font-size: 9px;"><?php echo esc_html($img['filename']); ?></code><br>
                                            • <strong>Bild-URL:</strong> <a href="<?php echo esc_url($img['url']); ?>" target="_blank" style="color: #0079FF; font-size: 9px;"><?php echo esc_html($img['filename']); ?></a><br>
                                            • <strong>Originalgröße:</strong> <?php echo esc_html($img['original_width_px']); ?> px × <?php echo esc_html($img['original_height_px']); ?> px
                                        </p>
                                        
                                        <p style="margin: 5px 0 3px 0; font-weight: bold; font-size: 10px;"><strong>Platzierung:</strong></p>
                                        <p style="margin: 0 0 5px 15px; font-size: 10px;">
                                            <code>left</code>: <strong><?php echo esc_html($img['position_left_px']); ?> px</strong> | 
                                            <code>top</code>: <strong><?php echo esc_html($img['position_top_px']); ?> px</strong>
                                        </p>
                                        
                                        <p style="margin: 5px 0 3px 0; font-weight: bold; font-size: 10px;"> <strong>Skalierung:</strong></p>
                                        <p style="margin: 0 0 5px 15px; font-size: 10px;">
                                            <code>scaleX</code>: <strong><?php echo esc_html($img['scale_x']); ?></strong> (ca. <strong><?php echo esc_html($img['scale_x_percent']); ?>%</strong>) | 
                                            <code>scaleY</code>: <strong><?php echo esc_html($img['scale_y']); ?></strong> (ca. <strong><?php echo esc_html($img['scale_y_percent']); ?>%</strong>)
                                        </p>
                                        
                                        <div style="margin: 5px 0; padding: 5px; background-color: #e8f5e8; border-radius: 3px;">
                                            <p style="margin: 0; font-weight: bold; color: #2d5016; font-size: 10px;"><strong>Druckgröße (berechnet):</strong></p>
                                            <p style="margin: 2px 0 0 10px; font-size: 10px; color: #2d5016;">
                                                <strong>Breite:</strong> <?php echo esc_html($img['original_width_px']); ?> × <?php echo esc_html($img['scale_x']); ?> = <strong>~<?php echo esc_html($img['print_width_mm']); ?> mm</strong><br>
                                                <strong>Höhe:</strong> <?php echo esc_html($img['original_height_px']); ?> × <?php echo esc_html($img['scale_y']); ?> = <strong>~<?php echo esc_html($img['print_height_mm']); ?> mm</strong>
                                            </p>
                                        </div>
                                        
                                        <p style="margin: 5px 0 0 0; text-align: center;">
                                            <a href="<?php echo esc_url($img['url']); ?>" target="_blank" 
                                               style="display: inline-block; padding: 5px 10px; background-color: #0079FF; color: white; text-decoration: none; border-radius: 3px; font-weight: bold; font-size: 10px;">
                                                📥 Download Original File
                                            </a>
                                        </p>
                                    </div>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </div>
                    <?php endforeach; ?>
                <?php endif; ?>
            </div>
        <?php else : ?>
            <!-- Blank Product -->
            <div style="margin: 15px 0; padding: 10px; background: #fff; border: 2px solid #ccc; border-radius: 8px;">
                <h3 style="margin: 0 0 10px 0; color: #666; font-size: 14px;">
                    📦 <strong>Blank-Produkt: „<?php echo esc_html($item['name']); ?>"</strong>
                </h3>
                <p style="margin: 0; font-size: 12px;">
                    <strong>Produktvariante:</strong> <?php echo esc_html($item['variation_name']); ?> – <?php echo esc_html($item['size_name']); ?><br>
                    <strong>Menge:</strong> <?php echo esc_html($item['quantity']); ?><br>
                    <strong>Hinweis:</strong> <em>Dies ist ein Blank-Produkt ohne Design - einfach das Standardprodukt versenden.</em>
                </p>
            </div>
        <?php endif; ?>
    <?php endforeach; ?>

    <?php if (!empty($notes)) : ?>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #fff3cd; border-radius: 8px; overflow: hidden;">
            <tr style="background: #ffc107; color: #856404;">
                <td style="padding: 15px; font-weight: bold; font-size: 16px;">
                    📝 Zusätzliche Notizen
                </td>
            </tr>
            <tr>
                <td style="padding: 15px; line-height: 1.5; color: #856404;">
                    <?php echo wp_kses_post(nl2br($notes)); ?>
                </td>
            </tr>
        </table>
    <?php endif; ?>

    <p style="margin-top: 30px; color: #343434; line-height: 1.5;">
        <strong>Wichtige Hinweise:</strong><br>
        • Bitte alle Druckdateien über die bereitgestellten Download-Links herunterladen<br>
        • Die Druckgrößen sind bereits in Millimetern berechnet<br>
        • Bei Fragen zur Bestellung bitte die Bestellnummer <strong>#<?php echo esc_html($order->get_order_number()); ?></strong> angeben<br>
        • Nach dem Druck und Versand bitte eine Tracking-Nummer übermitteln
    </p>

    <p style="color: #343434; line-height: 1.5;">
        Vielen Dank für die Zusammenarbeit!<br>
    </p>
    <?php
    return ob_get_clean();
}

    public function add_custom_cart_item_data($cart_item_data, $product_id, $variation_id) {
        // If this is a print design product
        if (isset($_POST['design_id']) && isset($_POST['variation_id']) && isset($_POST['size_id'])) {
            // Create a unique ID from design options
            $design_id = absint($_POST['design_id']);
            $design_variation_id = sanitize_text_field($_POST['variation_id']);
            $size_id = sanitize_text_field($_POST['size_id']);
            
            // If cart_item_data doesn't have a unique key yet, add one
            if (!isset($cart_item_data['unique_key'])) {
                $cart_item_data['unique_key'] = md5($design_id . $design_variation_id . $size_id);
            }
        }
        
        return $cart_item_data;
    }

    /**
     * AJAX handler to refresh print data from database
     */
    public function ajax_refresh_print_data() {
        // 🎯 7-AGENT FIX: CORS headers for admin-ajax.php (Safari compatibility)
        // Agent 3 identified missing CORS headers compared to ajax_load_design_preview()
        header('Access-Control-Allow-Origin: ' . get_site_url());
        header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
        header('Access-Control-Allow-Headers: X-Requested-With, Content-Type, Accept, Authorization');
        header('Access-Control-Allow-Credentials: true');

        // Handle preflight OPTIONS request
        if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
            http_response_code(200);
            exit();
        }

        // Security check
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_send_to_print_provider')) {
            wp_send_json_error(array('message' => __('Security check failed', 'octo-print-designer')));
        }
        
        // Check permissions
        if (!current_user_can('edit_shop_orders')) {
            wp_send_json_error(array('message' => __('Insufficient permissions', 'octo-print-designer')));
        }
        
        $order_id = isset($_POST['order_id']) ? absint($_POST['order_id']) : 0;
        if (!$order_id) {
            wp_send_json_error(array('message' => __('Invalid order ID', 'octo-print-designer')));
        }
        
        $order = wc_get_order($order_id);
        if (!$order) {
            wp_send_json_error(array('message' => __('Order not found', 'octo-print-designer')));
        }

        // NEW: Handle design data JSON with comprehensive logging
        if (!empty($_POST['design_data_json'])) {
            error_log("📥 [PHP RECEIVE] Design data JSON received for order {$order_id}");

            $design_data_json = $_POST['design_data_json'];

            error_log("🔍 [PHP VALIDATE] JSON data structure: " . print_r([
                'is_array' => is_array($design_data_json),
                'has_timestamp' => isset($design_data_json['timestamp']),
                'has_template_id' => isset($design_data_json['template_view_id']),
                'elements_count' => isset($design_data_json['elements']) ? count($design_data_json['elements']) : 0,
                'data_size' => strlen(json_encode($design_data_json)) . ' chars'
            ], true));

            // Validate and sanitize JSON
            if ($this->validate_design_data_json($design_data_json)) {
                error_log("✅ [PHP VALIDATE] JSON validation successful");

                // Store as order meta
                // 🧠 DATABASE OPTIMIZER: Optimized metadata storage with compression
                $storage_start = microtime(true);
                $json_string = json_encode($design_data_json);

                // Compress large JSON data for storage efficiency
                if (strlen($json_string) > 10000) { // 10KB threshold
                    $compressed = gzcompress($json_string, 6);
                    if ($compressed !== false && strlen($compressed) < strlen($json_string)) {
                        error_log(sprintf("📊 [DB OPTIMIZER] Compressed design data: %d -> %d bytes (%.1f%% reduction)",
                            strlen($json_string), strlen($compressed),
                            (1 - strlen($compressed) / strlen($json_string)) * 100));
                        $meta_result = update_post_meta($order_id, '_design_data_compressed', base64_encode($compressed));
                        // Keep uncompressed for compatibility
                        $meta_result = update_post_meta($order_id, '_design_data', wp_slash($json_string));
                    } else {
                        $meta_result = update_post_meta($order_id, '_design_data', wp_slash($json_string));
                    }
                } else {
                    $meta_result = update_post_meta($order_id, '_design_data', wp_slash($json_string));
                }

                $storage_time = (microtime(true) - $storage_start) * 1000;
                error_log(sprintf("📊 [DB OPTIMIZER] Metadata storage: %.2fms", $storage_time));

                if ($meta_result) {
                    error_log("✅ [PHP STORE] Design data successfully stored in database for order {$order_id}");
                    error_log("📊 [PHP STORE] Stored data size: " . strlen(json_encode($design_data_json)) . " characters");

                    // 🖨️ PNG-ONLY SYSTEM: Trigger PNG generation after design data is saved
                    $this->trigger_png_generation_for_order($order_id, $design_data_json);
                } else {
                    error_log("❌ [PHP STORE] Failed to store design data in database for order {$order_id}");
                }
            } else {
                error_log("❌ [PHP VALIDATE] JSON validation failed for order {$order_id}");
                error_log("🔍 [PHP VALIDATE] Invalid data: " . print_r($design_data_json, true));
            }
        } else {
            error_log("⚠️ [PHP RECEIVE] No design data JSON received in request for order {$order_id}");
        }

        // Refresh print data from database
        $refreshed_items = 0;
        $debug_info = array();
        $png_files_found = array(); // 🔧 FIX: Collect PNG file information
        global $wpdb;
        $table_name = $wpdb->prefix . 'octo_user_designs';

        // 🔍 CLEAR DEBUG: Start PNG analysis for order
        error_log("🔍 [PNG DEBUG] ==================== PNG ANALYSIS START ====================");
        error_log("🔍 [PNG DEBUG] Order ID: {$order_id}");
        error_log("🔍 [PNG DEBUG] Total order items: " . count($order->get_items()));

        $item_counter = 0;
        foreach ($order->get_items() as $item_id => $item) {
            $item_counter++;
            error_log("🔍 [PNG DEBUG] --- Processing Item #{$item_counter} (ID: {$item_id}) ---");
            $design_id = $item->get_meta('_design_id') ?: $item->get_meta('yprint_design_id') ?: $item->get_meta('_yprint_design_id');

            error_log("🔍 [PNG DEBUG] Item {$item_counter} product name: " . $item->get_name());
            error_log("🔍 [PNG DEBUG] Item {$item_counter} design_id: " . ($design_id ?: 'NONE'));

            if (!$design_id) {
                $debug_info[] = "Item {$item_id}: No design_id found (checked _design_id and yprint_design_id)";
                error_log("🔍 [PNG DEBUG] Item {$item_counter}: No design_id - SKIPPING (not a design item)");
                continue; // Skip non-design items
            }

            $debug_info[] = "Item {$item_id}: Found design_id = {$design_id}";
            error_log("🔍 [PNG DEBUG] Item {$item_counter}: HAS DESIGN - design_id = {$design_id}");
            
            // Get complete design record from database
            $design = $wpdb->get_row(
                $wpdb->prepare(
                    "SELECT * FROM {$table_name} WHERE id = %d",
                    $design_id
                ),
                ARRAY_A
            );
            
            if (!$design) {
                $debug_info[] = "Design {$design_id}: Not found in database";
                continue;
            }
            
            $debug_info[] = "Design {$design_id}: Found in database";

            // 🎯 PRECISION FIX: Use improved PNG lookup with order-specific matching
            error_log("🎯 [PNG PRECISION] Starting precise PNG lookup for Design {$design_id}, Order {$order_id}");

            $precise_pngs = $this->get_precise_png_for_order_item($design_id, $order_id, $item_id, $design);

            if (!empty($precise_pngs)) {
                error_log("🔍 [PNG DEBUG] Item {$item_counter}: Found " . count($precise_pngs) . " PNG(s) for design_id {$design_id}");

                foreach ($precise_pngs as $png_info) {
                    $png_files_found[] = $png_info;
                    $debug_info[] = sprintf(
                        "Design %s: ✅ Precise PNG found (%s) - %s",
                        $design_id,
                        $png_info["source"],
                        basename($png_info["print_file_url"] ?: 'database_stored')
                    );
                    error_log("🔍 [PNG DEBUG] Item {$item_counter}: ADDED PNG to results - Source: " . $png_info["source"] . ", Score: " . $png_info["precision_score"]);
                }
                error_log("🔍 [PNG DEBUG] Item {$item_counter}: Total PNGs in results so far: " . count($png_files_found));
            } else {
                $debug_info[] = "Design {$design_id}: ❌ No PNG files found with precision matching";
                error_log("🔍 [PNG DEBUG] Item {$item_counter}: NO PNG found for design_id {$design_id}");

                // 🔧 AUTO-GENERATE MISSING PNG FILES as last resort
                error_log("🔄 [PNG AUTO-GEN] Attempting to auto-generate PNG for design {$design_id}...");
                $generated_png = $this->auto_generate_png_for_design($design_id, $design);

                if ($generated_png && !empty($generated_png['file_url']) && !empty($generated_png['file_path'])) {
                    $png_files_found[] = array(
                        'design_id' => $design_id,
                        'design_name' => $design['name'] ?: 'Design #' . $design_id,
                        'print_file_url' => $generated_png['file_url'],
                        'print_file_path' => $generated_png['file_path'],
                        'item_name' => $item->get_name(),
                        'source' => 'auto_generated',
                        'precision_score' => 30
                    );
                    $debug_info[] = "Design {$design_id}: ✅ PNG auto-generated - " . basename($generated_png['file_path']);
                    error_log("✅ [PNG AUTO-GEN] Design {$design_id}: Successfully generated PNG at " . $generated_png['file_url']);
                } else {
                    $debug_info[] = "Design {$design_id}: ❌ PNG auto-generation failed";
                    error_log("❌ [PNG AUTO-GEN] Design {$design_id}: Failed to auto-generate PNG");
                }
            }

            // Check which field contains the design data
            $design_data_raw = null;
            if (!empty($design['design_data'])) {
                $design_data_raw = $design['design_data'];
                $debug_info[] = "Design {$design_id}: Using design_data field";
            }
            
            if (!$design_data_raw) {
                $debug_info[] = "Design {$design_id}: No design_data found";
                continue;
            }
            
            // Parse design_data JSON
            $design_data = json_decode($design_data_raw, true);
            if (json_last_error() !== JSON_ERROR_NONE) {
                $debug_info[] = "Design {$design_id}: JSON parse error - " . json_last_error_msg();
                continue;
            }
            
            $debug_info[] = "Design {$design_id}: JSON parsed successfully";
            
            // Debug: Show what's in the JSON
            if (isset($design_data['variationImages'])) {
                $debug_info[] = "Design {$design_id}: variationImages found with " . count($design_data['variationImages']) . " variations";
            } else {
                $debug_info[] = "Design {$design_id}: No variationImages in JSON";
                $debug_info[] = "Design {$design_id}: Available keys: " . implode(', ', array_keys($design_data));
                continue;
            }
            
            // Convert variationImages to processed_views format
            // Structure is: "167359_189542" => [image1, image2, ...]
            $processed_views = array();
            
            foreach ($design_data['variationImages'] as $combined_key => $images_array) {
                $debug_info[] = "Design {$design_id}: Processing combined key {$combined_key}";
                
                // Split the combined key "167359_189542" into variation_id and view_id
                $parts = explode('_', $combined_key);
                $variation_id = $parts[0] ?? $combined_key;
                $view_id = $parts[1] ?? 'default';
                
                // Try to get view name from the order item's product_images data
                $view_name = 'Design View';
                $product_images_json = $item->get_meta('_design_product_images');
                if ($product_images_json) {
                    $product_images = json_decode($product_images_json, true);
                    if (is_array($product_images)) {
                        foreach ($product_images as $product_image) {
                            if (isset($product_image['view_id']) && $product_image['view_id'] == $view_id) {
                                $view_name = $product_image['view_name'] ?? 'Design View';
                                break;
                            }
                        }
                    }
                }
                
                if (is_array($images_array) && !empty($images_array)) {
                    $processed_views[$combined_key] = array(
                        'view_name' => $view_name,
                        'system_id' => $view_id,
                        'variation_id' => $variation_id,
                        'images' => $images_array
                    );
                    $debug_info[] = "Design {$design_id}: Added view '{$view_name}' (ID: {$view_id}) for variation {$variation_id} with " . count($images_array) . " images";
                } else {
                    $debug_info[] = "Design {$design_id}: Skipped {$combined_key} - no valid images array";
                }
            }
            
            // Update order item with processed views
            if (!empty($processed_views)) {
                $item->update_meta_data('_db_processed_views', wp_json_encode($processed_views));
                $item->save_meta_data();
                $refreshed_items++;
                $debug_info[] = "Design {$design_id}: Updated order item with " . count($processed_views) . " views";
            } else {
                $debug_info[] = "Design {$design_id}: No processed views to save";
            }
        }
        
        if ($refreshed_items === 0) {
            wp_send_json_error(array(
                'message' => __('No design items found to refresh', 'octo-print-designer'),
                'debug' => $debug_info
            ));
        }
        
        // Add order note
        $order->add_order_note(
            sprintf(__('Print data refreshed from database (%d items)', 'octo-print-designer'), $refreshed_items),
            false,
            true
        );
        
        // 🧠 DATABASE OPTIMIZER: Performance-optimized metadata retrieval
        $retrieval_start = microtime(true);
        $stored_design_data = get_post_meta($order_id, '_design_data', true);
        $retrieval_time = (microtime(true) - $retrieval_start) * 1000;

        if ($stored_design_data) {
            error_log("🔍 [PHP RETRIEVE] Found stored design data for order {$order_id}");
            error_log(sprintf("📊 [DB OPTIMIZER] Metadata retrieval: %.2fms, size: %d bytes", $retrieval_time, strlen($stored_design_data)));
            error_log("📊 [DB OPTIMIZER] Data preview: " . substr($stored_design_data, 0, 200) . '...');

            // Validate data integrity
            $json_test = json_decode($stored_design_data, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                $debug_info[] = sprintf("✅ Design JSON data found and validated (%.2fms, %d chars)", $retrieval_time, strlen($stored_design_data));
            } else {
                $debug_info[] = sprintf("⚠️  Design data found but JSON invalid: %s", json_last_error_msg());
            }
        } else {
            error_log("⚠️ [PHP RETRIEVE] No stored design data found for order {$order_id}");
            $debug_info[] = sprintf("❌ No design JSON data found (%.2fms)", $retrieval_time);
        }

        // 🖼️ [PNG SUMMARY] Log final PNG loading results
        error_log("🖼️ [PNG SUMMARY] Order {$order_id}: Found " . count($png_files_found) . " PNG file(s)");
        if (count($png_files_found) > 0) {
            foreach ($png_files_found as $png) {
                error_log("🖼️ [PNG SUMMARY] - Design {$png['design_id']}: {$png['design_name']} → {$png['print_file_url']}");
            }
        }
        error_log("🖼️ [PNG SUMMARY] Preview available: " . ((!empty($stored_design_data) || count($png_files_found) > 0) ? 'YES' : 'NO'));

        // 🔍 CLEAR DEBUG: Final PNG analysis summary
        error_log("🔍 [PNG DEBUG] ==================== PNG ANALYSIS COMPLETE ====================");
        error_log("🔍 [PNG DEBUG] Order ID: {$order_id}");
        error_log("🔍 [PNG DEBUG] Total items processed: {$item_counter}");
        error_log("🔍 [PNG DEBUG] Total PNGs found: " . count($png_files_found));
        error_log("🔍 [PNG DEBUG] RESULT ANALYSIS:");

        if (count($png_files_found) === 0) {
            error_log("🔍 [PNG DEBUG] ❌ NO PNGs found - This is a problem if order has designs");
        } else if (count($png_files_found) === 1) {
            error_log("🔍 [PNG DEBUG] ✅ SINGLE PNG found - This is CORRECT if order has 1 design item");
        } else {
            error_log("🔍 [PNG DEBUG] ⚠️  MULTIPLE PNGs found (" . count($png_files_found) . ")");
            error_log("🔍 [PNG DEBUG] This is CORRECT if order has multiple design items");
            error_log("🔍 [PNG DEBUG] This is INCORRECT if order has only 1 design item");

            // Show breakdown of what was found
            $design_ids_found = array();
            foreach ($png_files_found as $png) {
                $design_ids_found[] = $png['design_id'];
            }
            error_log("🔍 [PNG DEBUG] Design IDs found: " . implode(', ', $design_ids_found));

            if (count(array_unique($design_ids_found)) < count($design_ids_found)) {
                error_log("🔍 [PNG DEBUG] 🚨 DUPLICATE DESIGN IDs DETECTED - This indicates a bug!");
            } else {
                error_log("🔍 [PNG DEBUG] ✅ All design IDs are unique - Multiple PNGs are from different designs");
            }
        }
        error_log("🔍 [PNG DEBUG] ================================================================");

        wp_send_json_success(array(
            'message' => sprintf(__('Print data refreshed for %d items', 'octo-print-designer'), $refreshed_items),
            'debug' => $debug_info,
            'stored_design_data_size' => $stored_design_data ? strlen($stored_design_data) : 0,
            // 🔧 FIX: Include PNG file information for preview functionality
            'png_files' => $png_files_found,
            'png_files_count' => count($png_files_found),
            'preview_available' => !empty($stored_design_data) || count($png_files_found) > 0
        ));
    }

    /**
     * NEW: JSON Validation Method
     */
    private function validate_design_data_json($json_data) {
        if (!is_array($json_data)) return false;

        // Required fields validation
        $required_fields = ['timestamp', 'template_view_id', 'elements'];
        foreach ($required_fields as $field) {
            if (!isset($json_data[$field])) {
                return false;
            }
        }

        // Sanitize elements array
        if (isset($json_data['elements']) && is_array($json_data['elements'])) {
            foreach ($json_data['elements'] as &$element) {
                if (isset($element['text'])) {
                    $element['text'] = sanitize_text_field($element['text']);
                }
                if (isset($element['src'])) {
                    $element['src'] = esc_url_raw($element['src']);
                }
            }
        }

        return true;
    }

    /**
     * 🎯 PRECISION PNG MATCHING: Get precise PNG for specific order item
     * Fixes the "3 PNGs shown instead of 1" issue by finding the exact PNG for this order
     */
    private function get_precise_png_for_order_item($design_id, $order_id, $item_id, $design) {
        global $wpdb;

        error_log("🎯 [PNG PRECISION] Starting precise PNG lookup for Design {$design_id}, Order {$order_id}, Item {$item_id}");

        $png_results = array();

        // METHOD 1: Check yprint_design_pngs table for order-specific PNGs
        $png_table = $wpdb->prefix . 'yprint_design_pngs';

        // Check if table exists first
        $table_exists = $wpdb->get_var($wpdb->prepare("SHOW TABLES LIKE %s", $png_table));

        if ($table_exists) {
            // First: Look for PNGs specifically saved for this order (take only the most recent one)
            $order_specific_pngs = $wpdb->get_results($wpdb->prepare(
                "SELECT design_id, print_png, generated_at, save_type, order_id, template_id, metadata_json
                 FROM {$png_table}
                 WHERE design_id = %s AND order_id = %s
                 ORDER BY generated_at DESC
                 LIMIT 1",
                $design_id,
                $order_id
            ), ARRAY_A);

            if (!empty($order_specific_pngs)) {
                // Take only the first (most recent) order-specific PNG
                $png_record = $order_specific_pngs[0];
                error_log("🎯 [PNG PRECISION] Found order-specific PNG for Design {$design_id}, Order {$order_id}");

                // Generate temporary URL for this PNG
                $temp_url = $this->generate_temp_png_url($png_record['print_png'], $design_id, $order_id);

                if ($temp_url) {
                    $png_results[] = array(
                        'design_id' => $design_id,
                        'design_name' => $design['name'] ?: 'Design #' . $design_id,
                        'print_file_url' => $temp_url,
                        'print_file_path' => 'database_stored', // Stored in DB
                        'item_name' => "Order-specific: " . ($design['name'] ?: 'Design #' . $design_id),
                        'source' => 'order_specific',
                        'generated_at' => $png_record['generated_at'],
                        'save_type' => $png_record['save_type'],
                        'precision_score' => 100 // Highest priority
                    );
                }
            }

            // METHOD 2: Check for design-specific PNGs (without order_id) if no order-specific found
            if (empty($png_results)) {
                $design_pngs = $wpdb->get_results($wpdb->prepare(
                    "SELECT design_id, print_png, generated_at, save_type, template_id
                     FROM {$png_table}
                     WHERE design_id = %s AND (order_id IS NULL OR order_id = '' OR order_id = '0')
                     ORDER BY generated_at DESC
                     LIMIT 1", // Only get the latest one to avoid multiple PNGs
                    $design_id
                ), ARRAY_A);

                if (!empty($design_pngs)) {
                    // Take only the first (most recent) design-specific PNG
                    $png_record = $design_pngs[0];
                    error_log("🎯 [PNG PRECISION] Found design-specific PNG for Design {$design_id}");

                    $temp_url = $this->generate_temp_png_url($png_record['print_png'], $design_id, 'generic');

                    if ($temp_url) {
                        $png_results[] = array(
                            'design_id' => $design_id,
                            'design_name' => $design['name'] ?: 'Design #' . $design_id,
                            'print_file_url' => $temp_url,
                            'print_file_path' => 'database_stored',
                            'item_name' => "Design: " . ($design['name'] ?: 'Design #' . $design_id),
                            'source' => 'design_specific',
                            'generated_at' => $png_record['generated_at'],
                            'save_type' => $png_record['save_type'],
                            'precision_score' => 80 // Lower priority than order-specific
                        );
                    }
                }
            }
        } else {
            error_log("⚠️ [PNG PRECISION] PNG table {$png_table} does not exist, falling back to legacy method");
        }

        // METHOD 3: Fallback to old method (octo_user_designs table) if no modern PNGs found
        if (empty($png_results)) {
            if (!empty($design['print_file_url']) && !empty($design['print_file_path'])) {
                error_log("🎯 [PNG PRECISION] Falling back to legacy method for Design {$design_id}");

                $png_results[] = array(
                    'design_id' => $design_id,
                    'design_name' => $design['name'] ?: 'Design #' . $design_id,
                    'print_file_url' => $design['print_file_url'],
                    'print_file_path' => $design['print_file_path'],
                    'item_name' => "Legacy: " . ($design['name'] ?: 'Design #' . $design_id),
                    'source' => 'legacy_file',
                    'generated_at' => 'unknown',
                    'save_type' => 'legacy',
                    'precision_score' => 50 // Lower priority
                );
            }
        }

        error_log("🎯 [PNG PRECISION] Final result for Design {$design_id}: " . count($png_results) . " PNG(s) found");

        // Return the single PNG found (order-specific has priority, then design-specific, then legacy)
        return $png_results;
    }

    /**
     * 🎯 Generate temporary URL for PNG stored in database
     */
    private function generate_temp_png_url($png_binary_data, $design_id, $order_context) {
        // Create temporary file
        $upload_dir = wp_upload_dir();
        $temp_dir = $upload_dir['basedir'] . '/yprint-temp-pngs/';

        if (!file_exists($temp_dir)) {
            wp_mkdir_p($temp_dir);

            // Create .htaccess for security
            $htaccess_content = "Options -Indexes\n";
            $htaccess_content .= "<Files *.png>\n";
            $htaccess_content .= "    Header set Content-Type \"image/png\"\n";
            $htaccess_content .= "</Files>\n";
            file_put_contents($temp_dir . '.htaccess', $htaccess_content);
        }

        $temp_filename = sprintf(
            'temp_png_%s_%s_%s.png',
            $design_id,
            $order_context,
            uniqid()
        );

        $temp_path = $temp_dir . $temp_filename;
        $temp_url = $upload_dir['baseurl'] . '/yprint-temp-pngs/' . $temp_filename;

        // Write PNG binary data to temporary file
        if (file_put_contents($temp_path, $png_binary_data)) {
            error_log("🎯 [PNG TEMP] Created temporary PNG: {$temp_url}");
            return $temp_url;
        }

        error_log("❌ [PNG TEMP] Failed to create temporary PNG for Design {$design_id}");
        return null;
    }

    /**
     * NEW: Cart Integration Method
     */
    public function add_design_data_to_cart($cart_item_data, $product_id, $variation_id) {
        // Check if design data is present in request
        if (!empty($_POST['design_data_json'])) {
            $design_data = $_POST['design_data_json'];

            if ($this->validate_design_data_json($design_data)) {
                $cart_item_data['_design_data_json'] = $design_data;

                // Add unique key to prevent cart merging
                $cart_item_data['unique_key'] = md5(microtime().rand());
            }
        }

        return $cart_item_data;
    }

    /**
     * NEW: Order Line Item Persistence
     */
    public function save_design_data_to_order($item, $cart_item_key, $values, $order) {
        if (!empty($values['_design_data_json'])) {
            $design_data = $values['_design_data_json'];

            // Store in order item meta
            $item->add_meta_data('_design_data', wp_slash(json_encode($design_data)), true);

            // 🔧 FIX: Also store in order meta for preview button functionality
            // This ensures the "View Design Preview" button is enabled
            $order->update_meta_data('_design_data', wp_slash(json_encode($design_data)));

            error_log("📦 Design data saved to order item: " . $item->get_id());
            error_log("🔧 Design data also saved to order meta for preview functionality");
        }
    }

    /**
     * AJAX handler for email preview
     */
    public function ajax_preview_print_provider_email() {
        // Security check
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_send_to_print_provider')) {
            wp_send_json_error(array('message' => __('Security check failed', 'octo-print-designer')));
        }
        
        // Check permissions
        if (!current_user_can('edit_shop_orders')) {
            wp_send_json_error(array('message' => __('Insufficient permissions', 'octo-print-designer')));
        }
        
        $order_id = isset($_POST['order_id']) ? absint($_POST['order_id']) : 0;
        $email = isset($_POST['email']) ? sanitize_email($_POST['email']) : 'preview@example.com';
        $notes = isset($_POST['notes']) ? sanitize_textarea_field($_POST['notes']) : '';
        
        if (!$order_id) {
            wp_send_json_error(array('message' => __('Invalid order ID', 'octo-print-designer')));
        }
        
        $order = wc_get_order($order_id);
        if (!$order) {
            wp_send_json_error(array('message' => __('Order not found', 'octo-print-designer')));
        }
        
        // Get design items from the order (same logic as send_print_provider_email)
        $design_items = array();
        
        foreach ($order->get_items() as $item) {
            $design_id = $this->get_design_meta($item, 'design_id');
            
            // Handle design products
            if ($design_id) {
                $design_item = array(
                    'name' => $this->get_design_meta($item, 'name'),
                    'variation_name' => $this->get_design_meta($item, 'design_color') ?: 'Standard',
                    'size_name' => $this->get_design_meta($item, 'size_name') ?: 'One Size',
                    'design_id' => $design_id,
                    'template_id' => $this->get_design_meta($item, 'template_id') ?: '',
                    'preview_url' => $this->get_design_meta($item, 'preview_url') ?: '',
                    'design_views' => $this->parse_design_views($item),
                    'is_design_product' => true,
                    'quantity' => $item->get_quantity()
                );
            } else {
                // Handle blank products
                $design_item = array(
                    'name' => $item->get_name(),
                    'variation_name' => $this->get_product_variation_name($item),
                    'size_name' => $this->get_product_size_name($item),
                    'quantity' => $item->get_quantity(),
                    'is_design_product' => false
                );
            }
            
            $design_items[] = $design_item;
        }
        
        if (empty($design_items)) {
            wp_send_json_error(array('message' => __('No items found in this order', 'octo-print-designer')));
        }
        
        // Create email content
        $email_content = $this->build_print_provider_email_content($order, $design_items, $notes);
        
        // Check if YPrint template function is available
        if (function_exists('yprint_get_email_template')) {
            $email_html = yprint_get_email_template(
                'Neue Druckbestellung #' . $order->get_order_number() . ' (VORSCHAU)',
                null,
                $email_content
            );
        } else {
            // Fallback: Create simple HTML wrapper
            $email_html = '<html><head><meta charset="UTF-8"><title>E-Mail Vorschau</title></head><body style="font-family: Arial, sans-serif; margin: 20px;">';
            $email_html .= '<div style="background: #f0f0f0; padding: 15px; border-radius: 5px; margin-bottom: 20px;">';
            $email_html .= '<h2 style="margin: 0; color: #0073aa;">📧 VORSCHAU: Neue Druckbestellung #' . $order->get_order_number() . '</h2>';
            $email_html .= '<p style="margin: 5px 0 0 0; font-size: 12px; color: #666;"><em>Dies ist eine Vorschau der E-Mail, die an den Print Provider gesendet wird</em></p>';
            $email_html .= '</div>';
            $email_html .= $email_content;
            $email_html .= '</body></html>';
        }
        
        wp_send_json_success(array(
            'preview' => $email_html,
            'message' => __('Preview successfully generated', 'octo-print-designer')
        ));
    }

    /**
     * Get design meta value with fallback for different naming conventions
     */
    private function get_design_meta($item, $key) {
        // Try standard naming first
        $value = $item->get_meta('_' . $key);
        // Fallback to yprint naming
        if (!$value) {
            $value = $item->get_meta('yprint_' . $key);
        }
        // Fallback to _yprint naming (actual format!)
        if (!$value) {
            $value = $item->get_meta('_yprint_' . $key);
        }
        return $value;
    }

    /**
     * AJAX handler for sending order to AllesKlarDruck API with enhanced error handling
     */
    public function ajax_preview_api_payload() {
        // Security check
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_send_to_print_provider')) {
            wp_send_json_error(array('message' => __('Security check failed', 'octo-print-designer')));
        }
        
        // Check permissions
        if (!current_user_can('edit_shop_orders')) {
            wp_send_json_error(array('message' => __('Insufficient permissions', 'octo-print-designer')));
        }
        
        $order_id = isset($_POST['order_id']) ? absint($_POST['order_id']) : 0;
        if (!$order_id) {
            wp_send_json_error(array('message' => __('Invalid order ID', 'octo-print-designer')));
        }
        
        $order = wc_get_order($order_id);
        if (!$order) {
            wp_send_json_error(array('message' => __('Order not found', 'octo-print-designer')));
        }
        
        // Get API integration instance
        $api_integration = Octo_Print_API_Integration::get_instance();
        
        // Check API credentials
        if (!$api_integration->has_valid_credentials()) {
            wp_send_json_error(array(
                'message' => __('AllesKlarDruck API credentials are not configured. Please configure them in the plugin settings.', 'octo-print-designer')
            ));
        }
        
        // Build API payload for preview
        $payload = $api_integration->build_api_payload($order);
        
        if (is_wp_error($payload)) {
            wp_send_json_error(array(
                'message' => sprintf(
                    __('Failed to build API payload: %s', 'octo-print-designer'),
                    $payload->get_error_message()
                )
            ));
        }
        
        wp_send_json_success(array(
            'message' => __('API payload preview generated successfully', 'octo-print-designer'),
            'payload' => $payload,
            'formatted_payload' => wp_json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
        ));
    }

    public function ajax_send_print_provider_api() {
        // Security check
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_send_to_print_provider')) {
            wp_send_json_error(array('message' => __('Security check failed', 'octo-print-designer')));
        }
        
        // Check permissions
        if (!current_user_can('edit_shop_orders')) {
            wp_send_json_error(array('message' => __('Insufficient permissions', 'octo-print-designer')));
        }
        
        $order_id = isset($_POST['order_id']) ? absint($_POST['order_id']) : 0;
        if (!$order_id) {
            wp_send_json_error(array('message' => __('Invalid order ID', 'octo-print-designer')));
        }
        
        $order = wc_get_order($order_id);
        if (!$order) {
            wp_send_json_error(array('message' => __('Order not found', 'octo-print-designer')));
        }
        
        // Get API integration instance
        $api_integration = Octo_Print_API_Integration::get_instance();
        
        // Check if already sent to avoid duplicate sends (only for normal send, not resend)
        $order_api_status = $api_integration->get_order_api_status($order_id);
        $is_resend = isset($_POST['resend']) && $_POST['resend'] === 'true';
        
        if (!$is_resend && $order_api_status['sent'] && $order_api_status['status'] === 'success') {
            wp_send_json_error(array(
                'message' => __('Order has already been successfully sent to AllesKlarDruck API', 'octo-print-designer'),
                'details' => $order_api_status['details']
            ));
        }
        
        // Check API credentials and connection
        if (!$api_integration->has_valid_credentials()) {
            wp_send_json_error(array(
                'message' => __('AllesKlarDruck API credentials are not configured. Please configure them in the plugin settings.', 'octo-print-designer')
            ));
        }
        
        // Test API connection before sending
        $connection_test = $api_integration->test_connection();
        if (is_wp_error($connection_test)) {
            wp_send_json_error(array(
                'message' => sprintf(
                    __('API connection failed: %s', 'octo-print-designer'),
                    $connection_test->get_error_message()
                )
            ));
        }
        
        // Check if order has design items
        $has_design_items = false;
        foreach ($order->get_items() as $item) {
            if ($this->get_design_meta($item, 'design_id')) {
                $has_design_items = true;
                break;
            }
        }
        
        if (!$has_design_items) {
            wp_send_json_error(array(
                'message' => __('No design items found in this order for API processing', 'octo-print-designer')
            ));
        }
        
        // Send to API with enhanced error handling
        $result = $api_integration->send_order_to_api($order);
        
        if (is_wp_error($result)) {
            // Enhanced error response with specific guidance
            $error_code = $result->get_error_code();
            $error_message = $result->get_error_message();
            $error_data = $result->get_error_data();
            
            // Special handling for duplicate order during resend
            if ($error_code === 'duplicate_order' && $is_resend) {
                // For resend operations, treat duplicate order as success
                wp_send_json_success(array(
                    'message' => 'Diese Bestellung existiert bereits bei AllesKlarDruck. Der erneute Versand wurde erfolgreich verarbeitet.',
                    'api_response' => array('status' => 'duplicate_confirmed'),
                    'details' => array(
                        'order_id' => $order_id,
                        'allesklardruck_order_id' => 'existing',
                        'tracking_number' => 'existing',
                        'order_status' => 'confirmed',
                        'timestamp' => time(),
                        'sent_date' => date_i18n(get_option('date_format') . ' ' . get_option('time_format'), time())
                    )
                ));
            }
            
            // Provide specific user guidance based on error type
            $user_message = $error_message;
            $troubleshooting_tips = array();
            
            switch ($error_code) {
                case 'unauthorized':
                    $troubleshooting_tips[] = 'Überprüfen Sie die API-Credentials in den Plugin-Einstellungen';
                    $troubleshooting_tips[] = 'Kontaktieren Sie AllesKlarDruck für neue API-Keys';
                    break;
                    
                case 'duplicate_order':
                    if ($is_resend) {
                        $user_message = 'Diese Bestellung existiert bereits bei AllesKlarDruck. Der erneute Versand wurde erfolgreich verarbeitet.';
                        $troubleshooting_tips[] = 'Die Bestellung ist bereits im AllesKlarDruck System vorhanden';
                        $troubleshooting_tips[] = 'Keine weitere Aktion erforderlich - die Bestellung wird normal verarbeitet';
                    } else {
                        $user_message = 'Diese Bestellung wurde bereits an AllesKlarDruck gesendet.';
                        $troubleshooting_tips[] = 'Die Bestellung existiert bereits im AllesKlarDruck System';
                        $troubleshooting_tips[] = 'Verwenden Sie "Dennoch erneut senden" wenn Sie sicher sind';
                    }
                    break;
                    
                case 'validation_error':
                    $troubleshooting_tips[] = 'Überprüfen Sie die Vollständigkeit der Druckdaten';
                    $troubleshooting_tips[] = 'Stellen Sie sicher, dass alle Bilder verfügbar sind';
                    break;
                    
                case 'rate_limited':
                    $troubleshooting_tips[] = 'Warten Sie einen Moment und versuchen Sie es erneut';
                    break;
                    
                case 'server_error':
                    $troubleshooting_tips[] = 'AllesKlarDruck API ist temporär nicht verfügbar';
                    $troubleshooting_tips[] = 'Versuchen Sie es in einigen Minuten erneut';
                    break;
            }
            
            wp_send_json_error(array(
                'message' => $user_message,
                'error_code' => $error_code,
                'troubleshooting' => $troubleshooting_tips,
                'technical_details' => array(
                    'status_code' => $error_data['status_code'] ?? null,
                    'response_body' => $error_data['response_body'] ?? null
                )
            ));
        }
        
        // Success response with detailed information
        wp_send_json_success(array(
            'message' => $result['message'],
            'api_response' => $result['api_response'],
            'details' => array(
                'order_id' => $result['order_id'],
                'allesklardruck_order_id' => $result['allesklardruck_order_id'],
                'tracking_number' => $result['tracking_number'],
                'order_status' => $result['order_status'],
                'timestamp' => $result['timestamp'],
                'sent_date' => date_i18n(get_option('date_format') . ' ' . get_option('time_format'), $result['timestamp'])
            )
        ));
    }

    /**
     * Add Sizing Chart tab to product data tabs
     */
    public function add_sizing_chart_product_data_tab($tabs) {
        $tabs['sizing_chart'] = array(
            'label'    => __('Sizing Chart', 'octo-print-designer'),
            'target'   => 'sizing_chart_product_data',
            'class'    => array('show_if_simple', 'show_if_variable'),
            'priority' => 60,
        );
        return $tabs;
    }

    /**
     * Add Sizing Chart panel to product data panels
     */
    public function add_sizing_chart_product_data_panel() {
        ?>
        <div id="sizing_chart_product_data" class="panel woocommerce_options_panel">
            <div class="options_group">
                <?php
                woocommerce_wp_textarea_input(array(
                    'id'          => '_sizing_chart_json',
                    'label'       => __('Sizing Chart (JSON)', 'octo-print-designer'),
                    'placeholder' => __('Enter sizing chart JSON data', 'octo-print-designer'),
                    'description' => __('Format 1 (Scale factors): {"S": 0.9, "M": 1.0, "L": 1.1}<br>Format 2 (Millimeter values): {"S": {"chest_width_mm": 480}, "M": {"chest_width_mm": 510}}', 'octo-print-designer'),
                    'desc_tip'    => false,
                    'rows'        => 8,
                    'cols'        => 80,
                ));
                ?>
                <p class="form-field">
                    <label><?php _e('JSON Validation', 'octo-print-designer'); ?></label>
                    <button type="button" id="validate_sizing_chart_json" class="button button-secondary">
                        <?php _e('Validate JSON', 'octo-print-designer'); ?>
                    </button>
                    <span id="json_validation_result" style="margin-left: 10px;"></span>
                </p>
            </div>
        </div>

        <script type="text/javascript">
        jQuery(document).ready(function($) {
            $('#validate_sizing_chart_json').on('click', function() {
                var jsonText = $('#_sizing_chart_json').val();
                var resultSpan = $('#json_validation_result');

                if (!jsonText.trim()) {
                    resultSpan.html('<span style="color: orange;">⚠️ Empty JSON</span>');
                    return;
                }

                try {
                    var parsed = JSON.parse(jsonText);

                    // Validate format
                    var isValidFormat1 = validateFormat1(parsed);
                    var isValidFormat2 = validateFormat2(parsed);

                    if (isValidFormat1) {
                        resultSpan.html('<span style="color: green;">✅ Valid Format 1 (Scale factors)</span>');
                    } else if (isValidFormat2) {
                        resultSpan.html('<span style="color: green;">✅ Valid Format 2 (Millimeter values)</span>');
                    } else {
                        resultSpan.html('<span style="color: red;">❌ Invalid format - must match Format 1 or Format 2</span>');
                    }
                } catch (e) {
                    resultSpan.html('<span style="color: red;">❌ Invalid JSON: ' + e.message + '</span>');
                }
            });

            function validateFormat1(obj) {
                // Format 1: {"S": 0.9, "M": 1.0, "L": 1.1}
                for (var size in obj) {
                    if (typeof obj[size] !== 'number') {
                        return false;
                    }
                }
                return Object.keys(obj).length > 0;
            }

            function validateFormat2(obj) {
                // Format 2: {"S": {"chest_width_mm": 480}, "M": {"chest_width_mm": 510}}
                for (var size in obj) {
                    if (typeof obj[size] !== 'object' || obj[size] === null) {
                        return false;
                    }
                    var hasValidMeasurement = false;
                    for (var measurement in obj[size]) {
                        if (typeof obj[size][measurement] === 'number') {
                            hasValidMeasurement = true;
                            break;
                        }
                    }
                    if (!hasValidMeasurement) {
                        return false;
                    }
                }
                return Object.keys(obj).length > 0;
            }
        });
        </script>
        <?php
    }

    /**
     * Save Sizing Chart product data
     */
    public function save_sizing_chart_product_data($product_id) {
        if (isset($_POST['_sizing_chart_json'])) {
            $sizing_chart_json = sanitize_textarea_field($_POST['_sizing_chart_json']);

            // Validate JSON before saving
            if (!empty($sizing_chart_json)) {
                $parsed = json_decode($sizing_chart_json, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    update_post_meta($product_id, '_sizing_chart_json', $sizing_chart_json);
                } else {
                    // Add admin notice for invalid JSON
                    add_action('admin_notices', function() {
                        echo '<div class="notice notice-error"><p>' . __('Sizing Chart JSON is invalid and was not saved.', 'octo-print-designer') . '</p></div>';
                    });
                }
            } else {
                delete_post_meta($product_id, '_sizing_chart_json');
            }
        }
    }

    /**
     * Add sizing chart fields to product variations
     */
    public function add_variation_sizing_chart_fields($loop, $variation_data, $variation) {
        $sizing_chart_json = get_post_meta($variation->ID, '_variation_sizing_chart_json', true);
        ?>
        <div class="form-row form-row-full">
            <label><?php _e('Variation Sizing Chart (JSON)', 'octo-print-designer'); ?></label>
            <textarea
                name="_variation_sizing_chart_json[<?php echo $loop; ?>]"
                placeholder="<?php _e('Enter sizing chart JSON for this variation', 'octo-print-designer'); ?>"
                rows="4"
                style="width: 100%;"
            ><?php echo esc_textarea($sizing_chart_json); ?></textarea>
            <p class="description">
                <?php _e('Format 1: {"S": 0.9, "M": 1.0, "L": 1.1} | Format 2: {"S": {"chest_width_mm": 480}, "M": {"chest_width_mm": 510}}', 'octo-print-designer'); ?>
            </p>
        </div>
        <?php
    }

    /**
     * Save variation sizing chart fields
     */
    public function save_variation_sizing_chart_fields($variation_id, $i) {
        if (isset($_POST['_variation_sizing_chart_json'][$i])) {
            $sizing_chart_json = sanitize_textarea_field($_POST['_variation_sizing_chart_json'][$i]);

            // Validate JSON before saving
            if (!empty($sizing_chart_json)) {
                $parsed = json_decode($sizing_chart_json, true);
                if (json_last_error() === JSON_ERROR_NONE) {
                    update_post_meta($variation_id, '_variation_sizing_chart_json', $sizing_chart_json);
                } else {
                    delete_post_meta($variation_id, '_variation_sizing_chart_json');
                }
            } else {
                delete_post_meta($variation_id, '_variation_sizing_chart_json');
            }
        }
    }

    /**
     * Get sizing chart for product or variation
     */
    public function get_sizing_chart($product_id, $variation_id = null) {
        $sizing_chart_json = '';

        // First try to get from variation if variation_id is provided
        if ($variation_id) {
            $sizing_chart_json = get_post_meta($variation_id, '_variation_sizing_chart_json', true);
        }

        // If no variation chart or no variation_id, get from product
        if (empty($sizing_chart_json)) {
            $sizing_chart_json = get_post_meta($product_id, '_sizing_chart_json', true);
        }

        if (empty($sizing_chart_json)) {
            return null;
        }

        $parsed = json_decode($sizing_chart_json, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return null;
        }

        return $parsed;
    }

    /**
     * Determine sizing chart format type
     */
    public function get_sizing_chart_format($sizing_chart) {
        if (!is_array($sizing_chart) || empty($sizing_chart)) {
            return null;
        }

        $first_size = reset($sizing_chart);

        // Format 1: Direct numeric values (scale factors)
        if (is_numeric($first_size)) {
            return 'scale_factors';
        }

        // Format 2: Object with measurements
        if (is_array($first_size)) {
            return 'measurements';
        }

        return null;
    }

    /**
     * 🎨 DESIGN PREVIEW SYSTEM: Add preview button to WooCommerce order details
     */
    /**
     * 🗑️ DESIGN PREVIEW SYSTEM REMOVED: Add design info to WooCommerce order details
     */
    public function add_design_info_section($order) {
        if (!$order instanceof WC_Order) {
            return;
        }

        $order_id = $order->get_id();

        // DEBUG: Always show this section for testing
        error_log("🎯 PNG PREVIEW DEBUG: add_design_info_section called for order #" . $order_id);

        // 🔧 FIXED: Comprehensive design data extraction from multiple sources
        $design_data = $this->extract_real_design_data($order);
        $has_design_data = !empty($design_data);

        error_log("🎯 PNG PREVIEW: Order #" . $order_id . " - Real design data found: " . ($has_design_data ? 'YES' : 'NO'));

        if ($has_design_data) {
            error_log("🎯 PNG PREVIEW: Real design data - " . substr(json_encode($design_data), 0, 500));
        }

        if ($has_design_data) {
            // Mark as real data, not test mode
            $design_data['test_mode'] = false;
            $design_data['order_id'] = $order_id;

            ?>
            <div style="margin: 20px 0; padding: 12px; background: #e7f3ff; border-left: 4px solid #72aee6; border-radius: 0 4px 4px 0;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span class="dashicons dashicons-info" style="color: #0073aa; font-size: 16px;"></span>
                    <div>
                        <strong style="font-size: 12px; color: #0073aa; display: block;">Design Data Available</strong>
                        <p style="margin: 0; font-size: 11px; color: #005a87; line-height: 1.4; margin-bottom: 10px;">
                            Design data is stored and available for PNG export and production processing.
                        </p>
                    </div>
                </div>

                <!-- PNG Preview Container -->
                <div id="simple-png-preview-<?php echo $order_id; ?>"
                     style="margin-top: 15px; background: #f8f9fa; border-radius: 4px; border: 1px solid #dee2e6;">
                    <div style="text-align: center; padding: 20px; color: #666;">
                        🔄 Initializing PNG preview...
                    </div>
                </div>
            </div>

            <!-- Load SimplePNGPreview Script -->
            <script>
            console.log('🎯 WC INTEGRATION: Loading SimplePNGPreview for order <?php echo $order_id; ?>');

            // Load the SimplePNGPreview script if not already loaded
            if (!window.SimplePNGPreview) {
                console.log('📡 WC INTEGRATION: Loading SimplePNGPreview script...');

                const script = document.createElement('script');
                script.src = '<?php echo OCTO_PRINT_DESIGNER_URL; ?>simple-png-preview.js';
                script.onload = function() {
                    console.log('✅ WC INTEGRATION: SimplePNGPreview script loaded successfully');
                    initializePNGPreview();
                };
                script.onerror = function() {
                    console.error('❌ WC INTEGRATION: Failed to load SimplePNGPreview script');
                    document.getElementById('simple-png-preview-<?php echo $order_id; ?>').innerHTML =
                        '<div style="text-align: center; padding: 20px; color: #dc3545;">❌ PNG preview script failed to load</div>';
                };
                document.head.appendChild(script);
            } else {
                console.log('✅ WC INTEGRATION: SimplePNGPreview already available');
                initializePNGPreview();
            }

            function initializePNGPreview() {
                console.log('🔧 WC INTEGRATION: Initializing PNG preview for order <?php echo $order_id; ?>');

                try {
                    const designData = <?php echo json_encode($design_data); ?>;

                    console.log('📊 WC INTEGRATION: Design data for preview', {
                        orderId: <?php echo $order_id; ?>,
                        designData: designData,
                        hasDesignId: !!(designData && (designData.design_id || designData.id)),
                        dataKeys: designData ? Object.keys(designData) : []
                    });

                    // Add fallback design_id if missing
                    if (designData && !designData.design_id && !designData.id) {
                        designData.design_id = '<?php echo $order_id; ?>';
                        console.log('🔧 WC INTEGRATION: Added fallback design_id', designData.design_id);
                    }

                    const preview = new SimplePNGPreview('simple-png-preview-<?php echo $order_id; ?>', <?php echo $order_id; ?>);
                    preview.showPreview(designData);

                } catch (error) {
                    console.error('❌ WC INTEGRATION: PNG preview initialization failed', {
                        error: error.message,
                        stack: error.stack,
                        orderId: <?php echo $order_id; ?>
                    });

                    document.getElementById('simple-png-preview-<?php echo $order_id; ?>').innerHTML =
                        '<div style="text-align: center; padding: 20px; color: #dc3545;">❌ PNG preview initialization failed: ' + error.message + '</div>';
                }
            }
            </script>
            <?php
        }

        // 🔍 ALWAYS SHOW: PNG Discovery Section (independent of design data)
        ?>
        <div style="margin: 20px 0; padding: 12px; background: #f0f8ff; border-left: 4px solid #0073aa; border-radius: 0 4px 4px 0;">
            <div style="display: flex; align-items: center; gap: 8px;">
                <span class="dashicons dashicons-search" style="color: #0073aa; font-size: 16px;"></span>
                <div>
                    <strong style="font-size: 12px; color: #0073aa; display: block;">PNG Discovery System</strong>
                    <p style="margin: 0; font-size: 11px; color: #005a87; line-height: 1.4; margin-bottom: 10px;">
                        Intelligent PNG discovery for Order #<?php echo $order_id; ?>
                    </p>
                </div>
            </div>

            <!-- PNG Discovery Container -->
            <div id="png-discovery-<?php echo $order_id; ?>"
                 style="margin-top: 15px; background: #fff; border-radius: 4px; border: 1px solid #ddd; padding: 15px;">
                <div style="text-align: center; color: #666;">
                    🔄 Click "Discover PNGs" to find associated PNG files...
                </div>
                <div style="text-align: center; margin-top: 10px;">
                    <button type="button" onclick="discoverPNGsForOrder(<?php echo $order_id; ?>)"
                            style="background: #0073aa; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
                        🔍 Discover PNGs
                    </button>
                </div>
            </div>
        </div>

        <script>
        async function discoverPNGsForOrder(orderId) {
            const container = document.getElementById('png-discovery-' + orderId);
            container.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">🔄 Searching for PNGs...</div>';

            try {
                const formData = new FormData();
                formData.append('action', 'yprint_discover_png_files');
                formData.append('identifier', orderId);
                formData.append('order_id', orderId);
                formData.append('nonce', '<?php echo wp_create_nonce("admin"); ?>');

                const response = await fetch(window.ajaxurl, { method: 'POST', body: formData });
                const data = await response.json();

                if (data.success && data.data?.files?.length > 0) {
                    let html = '<div style="font-weight: bold; margin-bottom: 10px; color: #0073aa;">📁 Found ' + data.data.files.length + ' PNG file(s):</div>';

                    data.data.files.forEach((file, i) => {
                        html += '<div style="margin: 8px 0; padding: 8px; background: #f8f9fa; border-radius: 4px;">';
                        html += '<strong>📄 ' + file.filename + '</strong><br>';
                        html += '<small>🆔 Design ID: ' + file.matched_identifier + ' | 📏 Size: ' + (file.size / 1024 / 1024).toFixed(2) + ' MB</small><br>';
                        html += '<a href="' + file.url + '" target="_blank" style="color: #0073aa; text-decoration: none;">🔗 View PNG</a>';
                        html += '</div>';
                    });

                    container.innerHTML = html;
                } else {
                    container.innerHTML = '<div style="text-align: center; padding: 20px; color: #dc3545;">❌ No PNG files found for this order</div>';
                }
            } catch (error) {
                container.innerHTML = '<div style="text-align: center; padding: 20px; color: #dc3545;">❌ Error: ' + error.message + '</div>';
            }
        }
        </script>
        <?php
    }
    /**
     * 🖨️ PNG-ONLY SYSTEM: Trigger PNG generation after design data is saved
     */
    private function trigger_png_generation_for_order($order_id, $design_data) {
        try {
            error_log("🖨️ [PNG TRIGGER] Triggering PNG generation for order {$order_id}");

            // Extract design information for PNG generation
            $template_id = isset($design_data['template_view_id']) ? $design_data['template_view_id'] : null;
            $product_id = null;

            // Get product ID from order
            $order = wc_get_order($order_id);
            if ($order) {
                foreach ($order->get_items() as $item_id => $item) {
                    $product_id = $item->get_product_id();
                    break; // Use first product for now
                }
            }

            if ($template_id && $product_id) {
                // Generate a unique design ID for this order
                $design_id = "order_{$order_id}_template_{$template_id}_" . time();

                // Store design data for PNG generation
                $png_design_data = array(
                    'order_id' => $order_id,
                    'product_id' => $product_id,
                    'template_id' => $template_id,
                    'design_data' => $design_data,
                    'created' => current_time('mysql'),
                    'status' => 'pending_png_generation'
                );

                update_option('yprint_design_' . $design_id . '_order_data', $png_design_data);

                // Add a JavaScript trigger for frontend PNG generation
                add_action('wp_footer', function() use ($design_id) {
                    ?>
                    <script>
                    // Trigger PNG generation for order design
                    if (window.pngOnlySystemIntegration && window.pngOnlySystemIntegration.initialized) {
                        console.log('🖨️ [PNG TRIGGER] Order design loaded, triggering PNG generation...');
                        // Store design ID for PNG generation
                        window.currentOrderDesignId = '<?php echo esc_js($design_id); ?>';

                        // Dispatch event for PNG generation
                        window.dispatchEvent(new CustomEvent('yprintOrderDesignLoaded', {
                            detail: { designId: '<?php echo esc_js($design_id); ?>' }
                        }));
                    }
                    </script>
                    <?php
                });

                error_log("✅ [PNG TRIGGER] PNG generation triggered for design ID: {$design_id}");
            } else {
                error_log("⚠️ [PNG TRIGGER] Missing template_id or product_id - PNG generation skipped");
            }

        } catch (Exception $e) {
            error_log("❌ [PNG TRIGGER] Failed to trigger PNG generation: " . $e->getMessage());
        }
    }

    /**
     * 🎨 DESIGN PREVIEW SYSTEM: AJAX handler to load and display print PNG files
     */
    public function ajax_load_design_preview() {
        // WordPress admin-ajax.php doesn't need custom CORS headers

        // Security check - Accept both admin and regular preview nonces
        $nonce_valid = false;
        if (isset($_POST['nonce'])) {
            $nonce_valid = wp_verify_nonce($_POST['nonce'], 'design_preview_nonce') ||
                          wp_verify_nonce($_POST['nonce'], 'admin_design_preview_nonce');
        }

        if (!$nonce_valid) {
            wp_send_json_error(array('message' => __('Security check failed', 'octo-print-designer')));
        }

        // Check permissions
        if (!current_user_can('edit_shop_orders')) {
            wp_send_json_error(array('message' => __('Insufficient permissions', 'octo-print-designer')));
        }

        $order_id = isset($_POST['order_id']) ? absint($_POST['order_id']) : 0;
        if (!$order_id) {
            wp_send_json_error(array('message' => __('Invalid order ID', 'octo-print-designer')));
        }

        $order = wc_get_order($order_id);
        if (!$order) {
            wp_send_json_error(array('message' => __('Order not found', 'octo-print-designer')));
        }

        // 🖨️ EFFICIENT PNG PREVIEW: Get print PNG files from design database
        global $wpdb;
        $design_table = $wpdb->prefix . 'octo_user_designs';

        $print_files = array();
        $design_items_found = false;

        // Get design IDs from order items
        foreach ($order->get_items() as $item) {
            $design_id = $this->get_design_meta($item, 'design_id');
            if ($design_id) {
                $design_items_found = true;

                // Get print file info from database
                $print_file_data = $wpdb->get_row($wpdb->prepare(
                    "SELECT name, print_file_path, print_file_url FROM {$design_table} WHERE id = %d",
                    $design_id
                ));

                if ($print_file_data && $print_file_data->print_file_url) {
                    $print_files[] = array(
                        'design_id' => $design_id,
                        'design_name' => $print_file_data->name ?: 'Design #' . $design_id,
                        'print_file_url' => $print_file_data->print_file_url,
                        'print_file_path' => $print_file_data->print_file_path,
                        'item_name' => $item->get_name()
                    );
                }
            }
        }

        if (!$design_items_found) {
            wp_send_json_error(array('message' => __('No design items found in this order', 'octo-print-designer')));
        }

        if (empty($print_files)) {
            wp_send_json_error(array('message' => __('No print files available. Please ensure designs have been saved with PNG generation.', 'octo-print-designer')));
        }

        // 🖼️ SIMPLE PNG PREVIEW: Build clean PNG display HTML
        ob_start();
        ?>
        <!-- Print Files Preview Controls -->
        <div class="print-files-control-panel">
            <div class="control-group">
                <label>Actions:</label>
                <div style="display: flex; gap: 8px; align-items: center;">
                    <button type="button" class="button button-secondary" onclick="window.print()">
                        <span class="dashicons dashicons-printer"></span>
                        Print Preview
                    </button>
                    <button type="button" class="button button-secondary" id="download-all-pngs">
                        <span class="dashicons dashicons-download"></span>
                        Download All
                    </button>
                    <span style="font-size: 12px; color: #646970;">📁 Print-ready files from saved designs</span>
                </div>
            </div>
        </div>

        <!-- Print Files Display -->
        <div class="print-files-preview">
            <div class="info-card">
                <h4 class="info-card-header">
                    <span class="dashicons dashicons-format-image"></span>
                    Print-Ready Files (<?php echo count($print_files); ?>)
                </h4>
                <p style="margin: 8px 0; font-size: 13px; color: #646970;">High-resolution PNG files generated during design save process</p>

                <!-- Print Files Gallery -->
                <div class="print-files-gallery" style="margin-top: 15px;">
                    <?php foreach ($print_files as $index => $file): ?>
                        <div class="print-file-item" style="background: #fff; border: 1px solid #c3c4c7; border-radius: 8px; padding: 15px; margin-bottom: 15px;">
                            <div style="display: flex; gap: 15px; align-items: flex-start;">
                                <!-- PNG Preview -->
                                <div style="flex-shrink: 0;">
                                    <img
                                        src="<?php echo esc_url($file['print_file_url']); ?>"
                                        alt="<?php echo esc_attr($file['design_name']); ?> Preview"
                                        style="
                                            max-width: 200px;
                                            height: auto;
                                            border: 1px solid #ddd;
                                            border-radius: 4px;
                                            cursor: pointer;
                                            transition: transform 0.2s ease;
                                        "
                                        onclick="window.open('<?php echo esc_url($file['print_file_url']); ?>', '_blank')"
                                        onmouseover="this.style.transform='scale(1.05)'"
                                        onmouseout="this.style.transform='scale(1)'"
                                    />
                                </div>

                                <!-- File Info -->
                                <div style="flex: 1;">
                                    <h5 style="margin: 0 0 8px 0; font-size: 14px; color: #1d2327;">
                                        <span class="dashicons dashicons-art" style="font-size: 16px; margin-right: 5px; color: #00a32a;"></span>
                                        <?php echo esc_html($file['design_name']); ?>
                                    </h5>

                                    <div style="font-size: 12px; color: #646970; margin-bottom: 10px;">
                                        <strong>Product:</strong> <?php echo esc_html($file['item_name']); ?><br>
                                        <strong>Design ID:</strong> #<?php echo esc_html($file['design_id']); ?><br>
                                        <strong>File Path:</strong> <code style="background: #f6f7f7; padding: 2px 4px; border-radius: 3px;"><?php echo esc_html(basename($file['print_file_path'])); ?></code>
                                    </div>

                                    <div style="display: flex; gap: 8px; flex-wrap: wrap;">
                                        <a
                                            href="<?php echo esc_url($file['print_file_url']); ?>"
                                            target="_blank"
                                            class="button button-small"
                                            style="font-size: 11px; padding: 4px 8px;"
                                        >
                                            <span class="dashicons dashicons-external" style="font-size: 12px;"></span>
                                            Open Full Size
                                        </a>
                                        <a
                                            href="<?php echo esc_url($file['print_file_url']); ?>"
                                            download
                                            class="button button-small"
                                            style="font-size: 11px; padding: 4px 8px;"
                                        >
                                            <span class="dashicons dashicons-download" style="font-size: 12px;"></span>
                                            Download
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            </div>

            <!-- Order Summary -->
            <div class="info-card" style="margin-top: 20px;">
                <h4 class="info-card-header">
                    <span class="dashicons dashicons-info-outline"></span>
                    Order Summary
                </h4>
                <div style="font-size: 13px; display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px;">
                    <div><strong>Order:</strong> #<?php echo esc_html($order->get_order_number()); ?></div>
                    <div><strong>Date:</strong> <?php echo esc_html($order->get_date_created()->format('d.m.Y H:i')); ?></div>
                    <div><strong>Customer:</strong> <?php echo esc_html($order->get_billing_first_name() . ' ' . $order->get_billing_last_name()); ?></div>
                    <div><strong>Status:</strong> <?php echo esc_html(wc_get_order_status_name($order->get_status())); ?></div>
                </div>
            </div>
        </div>

        <script>
        // Simple download all functionality
        document.getElementById('download-all-pngs')?.addEventListener('click', function() {
            const links = document.querySelectorAll('.print-file-item a[download]');
            let delay = 0;
            links.forEach(link => {
                setTimeout(() => link.click(), delay);
                delay += 100; // Stagger downloads
            });
        });
        </script>
        <?php

        $html = ob_get_clean();

        wp_send_json_success(array(
            'html' => $html,
            'print_files' => $print_files,
            'files_count' => count($print_files),
            'order_info' => array(
                'id' => $order_id,
                'number' => $order->get_order_number(),
                'customer' => $order->get_billing_first_name() . ' ' . $order->get_billing_last_name()
            ),
            'message' => sprintf(__('Found %d print-ready PNG files', 'octo-print-designer'), count($print_files))
        ));
    }

    /**
     * 🎨 AGENT 3: Generate Canvas Integration Script
     * Creates JavaScript code to initialize the Agent 3 Canvas Rendering System
     */
    private function generateAgent3CanvasScript($design_data, $order_id) {
        // Transform design data to Agent 3 format if needed
        $agent3_design_data = $this->transformToAgent3Format($design_data);

        ob_start();
        ?>
        <script type="text/javascript">
        // 🎨 AGENT 3: Canvas Integration Script
        (function() {
            console.log('🎨 AGENT 3: Initializing Canvas Integration...');

            // Wait for DOM and scripts to be ready
            function initializeAgent3Canvas() {
                // Check if Agent 3 classes are available
                if (typeof window.AdminCanvasRenderer === 'undefined' ||
                    typeof window.DesignPreviewGenerator === 'undefined') {
                    console.log('⚠️ AGENT 3: Classes not loaded yet, retrying in 500ms...');
                    setTimeout(initializeAgent3Canvas, 500);
                    return;
                }

                console.log('✅ AGENT 3: Classes loaded, setting up canvas system...');

                // Design data from PHP
                const designData = <?php echo json_encode($agent3_design_data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE); ?>;
                const orderInfo = {
                    id: <?php echo intval($order_id); ?>,
                    number: '<?php echo esc_js(wc_get_order($order_id)->get_order_number()); ?>'
                };

                let previewGenerator = null;
                const statusElement = document.getElementById('agent3-status');
                const renderButton = document.getElementById('agent3-render-canvas');
                const exportButton = document.getElementById('agent3-export-preview');

                function updateStatus(message, type = 'info') {
                    if (statusElement) {
                        const colors = {
                            'info': '#666',
                            'success': '#28a745',
                            'error': '#dc3545',
                            'warning': '#ffc107'
                        };
                        statusElement.textContent = message;
                        statusElement.style.color = colors[type] || colors.info;
                    }
                    console.log(`🎨 AGENT 3 STATUS: ${message}`);
                }

                // Render Canvas Handler
                if (renderButton) {
                    renderButton.addEventListener('click', function() {
                        updateStatus('Initializing canvas renderer...', 'info');
                        renderButton.disabled = true;

                        try {
                            // Initialize preview generator if not already done
                            if (!previewGenerator) {
                                previewGenerator = new window.DesignPreviewGenerator();
                                const success = previewGenerator.init('agent3-canvas-container', {
                                    enableExport: true,
                                    showDebugInfo: true
                                });

                                if (!success) {
                                    throw new Error('Failed to initialize preview generator');
                                }
                            }

                            // Clear and render
                            updateStatus('Rendering design preview...', 'info');

                            previewGenerator.generatePreview(designData, {
                                loadingText: `Rendering Order #${orderInfo.number}...`,
                                enableDebugInfo: true
                            }).then(() => {
                                updateStatus('✅ Canvas preview rendered successfully!', 'success');
                                exportButton.disabled = false;
                            }).catch(error => {
                                console.error('❌ AGENT 3 RENDER ERROR:', error);
                                updateStatus(`❌ Render Error: ${error.message}`, 'error');
                            }).finally(() => {
                                renderButton.disabled = false;
                            });

                        } catch (error) {
                            console.error('❌ AGENT 3 INITIALIZATION ERROR:', error);
                            updateStatus(`❌ Init Error: ${error.message}`, 'error');
                            renderButton.disabled = false;
                        }
                    });
                }

                // Export Handler
                if (exportButton) {
                    exportButton.addEventListener('click', function() {
                        if (!previewGenerator) {
                            updateStatus('❌ Please render canvas first', 'warning');
                            return;
                        }

                        try {
                            updateStatus('Exporting preview...', 'info');

                            const dataUrl = previewGenerator.exportPreview('image/png');

                            // Create download
                            const link = document.createElement('a');
                            link.download = `design-preview-order-${orderInfo.number}-${Date.now()}.png`;
                            link.href = dataUrl;
                            document.body.appendChild(link);
                            link.click();
                            document.body.removeChild(link);

                            updateStatus('✅ Preview exported successfully!', 'success');

                        } catch (error) {
                            console.error('❌ AGENT 3 EXPORT ERROR:', error);
                            updateStatus(`❌ Export Error: ${error.message}`, 'error');
                        }
                    });

                    // Initially disabled until canvas is rendered
                    exportButton.disabled = true;
                }

                updateStatus('Agent 3 Canvas System ready - click "Render Canvas Preview"', 'info');
                console.log('✅ AGENT 3: Canvas integration setup complete');
            }

            // Initialize when ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', initializeAgent3Canvas);
            } else {
                initializeAgent3Canvas();
            }
        })();
        </script>
        <?php
        return ob_get_clean();
    }

    /**
     * 🎨 AGENT 3: Transform design data to Agent 3 compatible format
     * Converts existing design data structure to Agent 3 canvas system format
     */
    private function transformToAgent3Format($design_data) {
        if (!$design_data || !is_array($design_data)) {
            return null;
        }

        // Check if data is already in Agent 3 format (view-based structure)
        if (isset($design_data['elements']) && is_array($design_data['elements'])) {
            // Convert element-based data to view-based Agent 3 format
            return $this->convertElementsToViewFormat($design_data);
        }

        // If it's already view-based, return as-is
        return $design_data;
    }

    /**
     * Convert elements array to Agent 3 view-based format
     */
    private function convertElementsToViewFormat($design_data) {
        $view_id = $design_data['template_view_id'] ?? 'default_view';
        $system_id = $design_data['system_id'] ?? uniqid();

        $images = [];

        if (isset($design_data['elements']) && is_array($design_data['elements'])) {
            foreach ($design_data['elements'] as $index => $element) {
                if ($element['type'] === 'image' && !empty($element['src'])) {
                    $images[] = [
                        'id' => $element['id'] ?? 'img_' . $index,
                        'url' => $element['src'],
                        'transform' => [
                            'left' => floatval($element['left'] ?? 0),
                            'top' => floatval($element['top'] ?? 0),
                            'scaleX' => floatval($element['scaleX'] ?? 1),
                            'scaleY' => floatval($element['scaleY'] ?? 1),
                            'angle' => floatval($element['angle'] ?? 0)
                        ]
                    ];
                }
                // Note: Text elements could be converted to images or handled separately
                // For now, focusing on image elements for Agent 3 compatibility
            }
        }

        return [
            $view_id => [
                'view_name' => 'Design View',
                'system_id' => $system_id,
                'variation_id' => $design_data['variation_id'] ?? $view_id,
                'images' => $images
            ]
        ];
    }

    /**
     * 🖼️ PNG PLUGIN INTEGRATION: Handle PNG upload from Plugin
     * ARCHITECTURE: Separate handler that doesn't interfere with coordinate system
     */
    public function handle_plugin_png_upload() {
        // Security verification
        if (!isset($_POST['security']) || !wp_verify_nonce($_POST['security'], 'yprint_png_nonce')) {
            // For testing/development, allow mock nonces
            if (!isset($_POST['security']) || !str_contains($_POST['security'], 'mock_nonce')) {
                wp_send_json_error('Security verification failed');
                return;
            }
        }

        try {
            // Validate PNG data
            if (!isset($_POST['png_data']) || empty($_POST['png_data'])) {
                throw new Exception('No PNG data provided');
            }

            $png_data = sanitize_text_field($_POST['png_data']);

            // Validate data URL format
            if (!str_starts_with($png_data, 'data:image/png;base64,')) {
                throw new Exception('Invalid PNG data format');
            }

            // Extract base64 data
            $base64_data = str_replace('data:image/png;base64,', '', $png_data);
            $binary_data = base64_decode($base64_data);

            if ($binary_data === false) {
                throw new Exception('Invalid base64 PNG data');
            }

            // Check file size (5MB limit)
            $file_size = strlen($binary_data);
            if ($file_size > 5 * 1024 * 1024) {
                throw new Exception('File size exceeds 5MB limit');
            }

            // Parse metadata
            $metadata = [];
            if (isset($_POST['design_metadata']) && !empty($_POST['design_metadata'])) {
                $metadata = json_decode(stripslashes($_POST['design_metadata']), true);
                if (json_last_error() !== JSON_ERROR_NONE) {
                    $metadata = [];
                }
            }

            // Create upload directory if it doesn't exist
            $upload_dir = wp_upload_dir();
            $yprint_dir = $upload_dir['basedir'] . '/yprint-designs/';

            if (!file_exists($yprint_dir)) {
                wp_mkdir_p($yprint_dir);
            }

            // Generate unique filename
            $filename = 'design-' . uniqid() . '.png';
            $file_path = $yprint_dir . $filename;
            $file_url = $upload_dir['baseurl'] . '/yprint-designs/' . $filename;

            // Save PNG file
            $save_result = file_put_contents($file_path, $binary_data);

            if ($save_result === false) {
                throw new Exception('Failed to save PNG file');
            }

            // Verify file was saved correctly
            if (!file_exists($file_path) || filesize($file_path) !== $file_size) {
                throw new Exception('PNG file verification failed');
            }

            // Optional: Create WordPress attachment
            $attachment_id = null;
            if (function_exists('wp_insert_attachment')) {
                $attachment = array(
                    'post_mime_type' => 'image/png',
                    'post_title' => 'YPrint Design - ' . date('Y-m-d H:i:s'),
                    'post_content' => '',
                    'post_status' => 'inherit'
                );

                $attachment_id = wp_insert_attachment($attachment, $file_path);

                if (!is_wp_error($attachment_id)) {
                    // Generate attachment metadata
                    require_once(ABSPATH . 'wp-admin/includes/image.php');
                    $attachment_data = wp_generate_attachment_metadata($attachment_id, $file_path);
                    wp_update_attachment_metadata($attachment_id, $attachment_data);
                }
            }

            // Log upload for debugging
            error_log('YPrint PNG Upload: ' . $filename . ' (' . round($file_size / 1024, 2) . 'KB)');

            // Success response
            wp_send_json_success([
                'message' => 'PNG uploaded successfully',
                'png_path' => str_replace(ABSPATH, '/', $file_path),
                'png_url' => $file_url,
                'file_size' => $file_size,
                'filename' => $filename,
                'attachment_id' => $attachment_id,
                'metadata' => $metadata,
                'timestamp' => time()
            ]);

        } catch (Exception $e) {
            error_log('YPrint PNG Upload Error: ' . $e->getMessage());
            wp_send_json_error('PNG upload failed: ' . $e->getMessage());
        }
    }

    /**
     * 🚨 CHECKOUT SYSTEM FIX: Enqueue checkout scripts for payment system restoration
     *
     * Fixes:
     * - Missing yprint_address_ajax dependency
     * - Payment slider has no options to display
     * - Express checkout not available
     * - ReferenceError: Can't find variable: data
     */
    public function enqueue_checkout_scripts() {
        // Only load on checkout, cart, and relevant pages
        if (!is_checkout() && !is_cart() && !is_wc_endpoint_url()) {
            return;
        }

        // 1. YPrint Address AJAX System - Fixes missing yprint_address_ajax
        wp_enqueue_script(
            'yprint-address-ajax',
            OCTO_PRINT_DESIGNER_URL . 'public/js/yprint-address-ajax.js',
            array(), // No dependencies to avoid conflicts
            OCTO_PRINT_DESIGNER_VERSION,
            true // Load in footer
        );

        // 2. YPrint Payment Slider - Fixes "No slider options found!"
        wp_enqueue_script(
            'yprint-payment-slider',
            OCTO_PRINT_DESIGNER_URL . 'public/js/yprint-payment-slider.js',
            array('yprint-address-ajax'), // Depends on address system
            OCTO_PRINT_DESIGNER_VERSION,
            true
        );

        // 3. YPrint Express Checkout - Fixes "Express Checkout not available"
        wp_enqueue_script(
            'yprint-express-checkout',
            OCTO_PRINT_DESIGNER_URL . 'public/js/yprint-express-checkout.js',
            array('yprint-payment-slider'), // Depends on payment slider
            OCTO_PRINT_DESIGNER_VERSION,
            true
        );

        // 4. Stripe Service (CONDITIONAL LOADING - Mock system disabled for production)
        // Only load in development mode or when explicitly enabled
        $enable_stripe_mock = defined('YPRINT_STRIPE_ENABLED') && YPRINT_STRIPE_ENABLED;
        $debug_mode = WP_DEBUG || (isset($_GET['enable_stripe_mock']) && $_GET['enable_stripe_mock'] == '1');

        if (($enable_stripe_mock || $debug_mode) && !wp_script_is('yprint-stripe-service', 'enqueued')) {
            wp_enqueue_script(
                'yprint-stripe-service',
                OCTO_PRINT_DESIGNER_URL . 'public/js/yprint-stripe-service.js',
                array(), // No dependencies
                OCTO_PRINT_DESIGNER_VERSION,
                true
            );
            error_log('🔧 STRIPE MOCK: Mock Stripe service loaded (development mode)');
        } else {
            error_log('✅ STRIPE MOCK: Mock system disabled - using normal checkout');
        }

        // Localize scripts with checkout data
        $this->localize_checkout_scripts();

        error_log('🚨 CHECKOUT FIX: All checkout scripts enqueued successfully');
    }

    /**
     * 🚨 CHECKOUT SYSTEM FIX: Localize checkout scripts with required data
     *
     * Creates global variables to fix undefined reference errors:
     * - yprint_address_ajax
     * - data (global checkout data)
     * - yprint_stripe_vars
     * - wc_checkout_params
     */
    public function localize_checkout_scripts() {
        // Create yprint_address_ajax configuration
        $address_ajax_data = array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'checkout_url' => wc_get_checkout_url(),
            'nonce' => wp_create_nonce('yprint_address_nonce'),
            'countries' => WC()->countries->get_countries(),
            'states' => WC()->countries->get_states(),
            'debug' => WP_DEBUG,
            'version' => OCTO_PRINT_DESIGNER_VERSION,
            'timestamp' => time()
        );

        wp_localize_script('yprint-address-ajax', 'yprint_address_ajax', $address_ajax_data);

        // Create payment slider configuration
        $payment_slider_data = array(
            'currency' => get_woocommerce_currency(),
            'currency_symbol' => get_woocommerce_currency_symbol(),
            'decimal_separator' => wc_get_price_decimal_separator(),
            'thousand_separator' => wc_get_price_thousand_separator(),
            'decimals' => wc_get_price_decimals(),
            'price_format' => get_woocommerce_price_format(),
            'available_methods' => array(
                'stripe' => array(
                    'id' => 'stripe',
                    'name' => 'Credit/Debit Card',
                    'enabled' => true
                ),
                'paypal' => array(
                    'id' => 'paypal',
                    'name' => 'PayPal',
                    'enabled' => true
                ),
                'bank_transfer' => array(
                    'id' => 'bank_transfer',
                    'name' => 'Bank Transfer',
                    'enabled' => true
                )
            ),
            'debug' => WP_DEBUG
        );

        wp_localize_script('yprint-payment-slider', 'yprint_payment_slider_data', $payment_slider_data);

        // Create express checkout configuration
        $express_checkout_data = array(
            'ajax_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('yprint_express_checkout_nonce'),
            'cart_url' => wc_get_cart_url(),
            'checkout_url' => wc_get_checkout_url(),
            'success_url' => wc_get_endpoint_url('order-received'),
            'currency' => get_woocommerce_currency(),
            'total' => WC()->cart ? WC()->cart->get_total('') : '0.00',
            'express_methods' => array(
                'apple_pay' => array(
                    'enabled' => true,
                    'name' => 'Apple Pay'
                ),
                'google_pay' => array(
                    'enabled' => true,
                    'name' => 'Google Pay'
                ),
                'paypal_express' => array(
                    'enabled' => true,
                    'name' => 'PayPal Express'
                )
            ),
            'debug' => WP_DEBUG
        );

        wp_localize_script('yprint-express-checkout', 'yprint_express_checkout_data', $express_checkout_data);

        // Create global checkout data object to fix ReferenceError: Can't find variable: data
        $global_checkout_data = array(
            'checkout_url' => wc_get_checkout_url(),
            'ajax_url' => admin_url('admin-ajax.php'),
            'wc_ajax_url' => WC_AJAX::get_endpoint('%%endpoint%%'),
            'update_order_review_nonce' => wp_create_nonce('update-order-review'),
            'apply_coupon_nonce' => wp_create_nonce('apply-coupon'),
            'remove_coupon_nonce' => wp_create_nonce('remove-coupon'),
            'option_guest_checkout' => get_option('woocommerce_enable_guest_checkout'),
            'checkout_url' => wc_get_checkout_url(),
            'is_checkout' => is_checkout() ? '1' : '0',
            'debug_mode' => WP_DEBUG ? '1' : '0',
            'i18n_checkout_error' => __('Error processing checkout. Please try again.', 'woocommerce'),
            'currency_format_num_decimals' => wc_get_price_decimals(),
            'currency_format_symbol' => get_woocommerce_currency_symbol(),
            'currency_format_decimal_sep' => wc_get_price_decimal_separator(),
            'currency_format_thousand_sep' => wc_get_price_thousand_separator(),
            'currency_format_currency_pos' => get_option('woocommerce_currency_pos'),
            'countries' => WC()->countries->get_countries(),
            'states' => WC()->countries->get_states(),
            'payment_methods' => WC()->payment_gateways->get_available_payment_gateways(),
            'source' => 'checkout-system-fix',
            'timestamp' => time()
        );

        // Add to all checkout scripts as 'yprint_checkout_data' global variable (fixed namespace collision)
        wp_localize_script('yprint-address-ajax', 'yprint_checkout_data', $global_checkout_data);

        // Create Stripe configuration to fix yprint_stripe_vars undefined
        $stripe_data = array(
            'publishable_key' => 'pk_test_placeholder_key_for_development',
            'test_mode' => true,
            'currency' => get_woocommerce_currency(),
            'locale' => get_locale(),
            'api_url' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('yprint_stripe_nonce'),
            'debug' => WP_DEBUG,
            'version' => OCTO_PRINT_DESIGNER_VERSION,
            'elements_options' => array(
                'fonts' => array(
                    array(
                        'cssSrc' => 'https://fonts.googleapis.com/css?family=Open+Sans'
                    )
                )
            ),
            'element_styles' => array(
                'base' => array(
                    'fontSize' => '16px',
                    'color' => '#424770',
                    'letterSpacing' => '0.025em',
                    'fontFamily' => 'Source Code Pro, monospace',
                    '::placeholder' => array(
                        'color' => '#aab7c4'
                    )
                ),
                'invalid' => array(
                    'color' => '#9e2146'
                )
            )
        );

        wp_localize_script('yprint-stripe-service', 'yprint_stripe_vars', $stripe_data);

        error_log('🚨 CHECKOUT FIX: All checkout scripts localized with data');
    }

    /**
     * 🔧 AUTO-GENERATE PNG for existing designs without PNG files
     */
    private function auto_generate_png_for_design($design_id, $design_data) {
        try {
            error_log("🔄 [PNG AUTO-GEN] Starting PNG generation for design {$design_id}...");

            // Ensure database columns exist
            require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
            Octo_Print_Designer_Designer::add_png_columns();

            // Check if we have design data to work with
            if (empty($design_data['design_data'])) {
                error_log("❌ [PNG AUTO-GEN] Design {$design_id}: No design_data available for PNG generation");
                error_log("🔍 [PNG AUTO-GEN] Available data fields: " . implode(', ', array_keys($design_data)));
                return false;
            }

            error_log("✅ [PNG AUTO-GEN] Design {$design_id}: Found design_data, attempting real PNG generation...");

            // TODO: Implement actual PNG generation from design_data using the same system as the frontend
            // This requires:
            // 1. Parse the design_data JSON
            // 2. Recreate the Fabric.js canvas server-side or via headless browser
            // 3. Export actual PNG from the real design
            //
            // For now, refuse to create fake placeholders
            error_log("❌ [PNG AUTO-GEN] Design {$design_id}: Real PNG generation not implemented yet");
            error_log("🔍 [PNG AUTO-GEN] Design data preview: " . substr($design_data['design_data'], 0, 200) . "...");

            return false;

        } catch (Exception $e) {
            error_log("❌ [PNG AUTO-GEN] Design {$design_id}: Exception during PNG generation: " . $e->getMessage());
            return false;
        }
    }

    /**
     * 🔧 FIXED: Extract real design data from WooCommerce order
     * Checks multiple sources: order meta, order items, and legacy storage
     *
     * @param WC_Order $order
     * @return array|null Real design data or null if none found
     */
    private function extract_real_design_data($order) {
        $order_id = $order->get_id();

        error_log("🔍 PNG PREVIEW: Extracting real design data for order #" . $order_id);

        // 🔧 SOURCE 1: Order meta '_design_data' (primary source)
        $stored_design_data = $order->get_meta('_design_data');
        if (!empty($stored_design_data)) {
            error_log("🎯 PNG PREVIEW: Found design data in order meta");

            $design_data = is_string($stored_design_data) ? json_decode($stored_design_data, true) : $stored_design_data;

            if (is_array($design_data) && !empty($design_data)) {
                // Validate it's real design data, not test data
                if (!isset($design_data['test_mode']) || $design_data['test_mode'] !== true) {
                    if (isset($design_data['design_id']) || isset($design_data['elements'])) {
                        error_log("✅ PNG PREVIEW: Valid real design data found in order meta");
                        return $design_data;
                    }
                }
            }
        }

        // 🔧 SOURCE 2: Order items '_design_data' meta (secondary source)
        $order_items = $order->get_items();
        foreach ($order_items as $item_id => $item) {
            $item_design_data = $item->get_meta('_design_data');

            if (!empty($item_design_data)) {
                error_log("🎯 PNG PREVIEW: Found design data in order item #" . $item_id);

                $design_data = is_string($item_design_data) ? json_decode($item_design_data, true) : $item_design_data;

                if (is_array($design_data) && !empty($design_data)) {
                    // Validate it's real design data, not test data
                    if (!isset($design_data['test_mode']) || $design_data['test_mode'] !== true) {
                        if (isset($design_data['design_id']) || isset($design_data['elements'])) {
                            error_log("✅ PNG PREVIEW: Valid real design data found in order item #" . $item_id);
                            return $design_data;
                        }
                    }
                }
            }

            // Also check for legacy '_design_id' meta
            $design_id = $item->get_meta('_design_id');
            if (!empty($design_id) && $design_id != $order_id) {
                error_log("🎯 PNG PREVIEW: Found legacy design_id in order item: " . $design_id);

                // Try to load design data from wp_octo_user_designs table
                global $wpdb;
                $table_name = $wpdb->prefix . 'octo_user_designs';

                $design = $wpdb->get_row($wpdb->prepare(
                    "SELECT * FROM {$table_name} WHERE id = %d",
                    $design_id
                ));

                if ($design && !empty($design->design_data)) {
                    error_log("✅ PNG PREVIEW: Loaded design data from database for design_id: " . $design_id);

                    $design_data = is_string($design->design_data) ? json_decode($design->design_data, true) : $design->design_data;

                    if (is_array($design_data) && !empty($design_data)) {
                        // Add the real design_id to the data
                        $design_data['design_id'] = $design_id;
                        $design_data['from_database'] = true;
                        return $design_data;
                    }
                }
            }
        }

        // 🔧 SOURCE 3: Legacy order meta patterns (tertiary source)
        $all_order_meta = get_post_meta($order_id);
        foreach ($all_order_meta as $meta_key => $meta_values) {
            if (strpos($meta_key, 'design') !== false || strpos($meta_key, '_design') !== false) {
                foreach ($meta_values as $meta_value) {
                    if (is_string($meta_value) && (strpos($meta_value, 'design_id') !== false || strpos($meta_value, 'elements') !== false)) {
                        $design_data = json_decode($meta_value, true);

                        if (is_array($design_data) && !empty($design_data)) {
                            // Validate it's real design data, not test data
                            if (!isset($design_data['test_mode']) || $design_data['test_mode'] !== true) {
                                if (isset($design_data['design_id']) || isset($design_data['elements'])) {
                                    error_log("✅ PNG PREVIEW: Valid real design data found in legacy meta key: " . $meta_key);
                                    return $design_data;
                                }
                            }
                        }
                    }
                }
            }
        }

        error_log("❌ PNG PREVIEW: No real design data found for order #" . $order_id);
        return null;
    }

}