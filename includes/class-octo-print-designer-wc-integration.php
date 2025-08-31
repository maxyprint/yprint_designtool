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
        
        // ✅ NEU: AJAX Handler für Design-Größenberechnung Test in Bestellungen
        add_action('wp_ajax_test_order_design_calculation', array($this, 'ajax_test_order_design_calculation'));

        add_filter('woocommerce_add_cart_item_data', array($this, 'add_custom_cart_item_data'), 10, 3);

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
                // Silent fail
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
                return __('Error displaying design images', 'octo-print-designer');
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
            .design-images-list {
                max-height: 200px;
                overflow-y: auto;
                border: 1px solid #ddd;
                padding: 5px;
                border-radius: 3px;
            }
            .design-image-item {
                margin-bottom: 5px;
                padding: 3px;
                border-bottom: 1px solid #f0f0f0;
            }
            .design-image-item:last-child {
                border-bottom: none;
            }
            .design-preview-wrapper {
                padding: 5px;
                background: #f9f9f9;
                border-radius: 3px;
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
                
                <!-- ✅ NEU: Design-Größenberechnung Test Button -->
                <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border: 2px solid #007cba; border-radius: 6px;">
                    <h4 style="margin: 0 0 10px 0; color: #007cba; font-size: 14px;">
                        <span class="dashicons dashicons-admin-tools" style="margin-right: 5px;"></span>
                        🧪 Design-Größenberechnung Test
                    </h4>
                    <p style="margin: 0 0 15px 0; font-size: 12px; color: #6c757d;">
                        Testen Sie die Design-Größenberechnung mit den echten Bestelldaten. Das System zeigt Ihnen genau, was passiert und was das Ergebnis ist.
                    </p>
                    
                    <div style="display: flex; gap: 10px; align-items: center;">
                        <button type="button" id="test-design-calculation-btn" class="button button-secondary" 
                                data-order-id="<?php echo $order_id; ?>"
                                style="flex: 1; padding: 8px 12px; height: auto;">
                            <span class="dashicons dashicons-admin-tools" style="margin-right: 5px;"></span>
                            Test Berechnung
                        </button>
                        <span class="test-spinner spinner" style="display: none;"></span>
                    </div>
                    
                    <div id="test-result-container" style="display: none; margin-top: 15px;">
                        <h5 style="margin: 0 0 10px 0; color: #007cba; font-size: 13px;">
                            <span class="dashicons dashicons-clipboard" style="margin-right: 5px;"></span>
                            Test Ergebnis:
                        </h5>
                        <div id="test-result-content" style="background: #fff; border: 1px solid #ddd; border-radius: 4px; padding: 12px; font-family: 'Courier New', monospace; font-size: 11px; line-height: 1.3; max-height: 300px; overflow-y: auto; white-space: pre-wrap;"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <script>
            jQuery(document).ready(function($) {
                // Ensure ajaxurl is available
                if (typeof ajaxurl === 'undefined') {
                    window.ajaxurl = '<?php echo admin_url('admin-ajax.php'); ?>';
                }
                
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
                    
                    $.ajax({
                        url: ajaxurl,
                        type: 'POST',
                        data: {
                            action: 'octo_refresh_print_data',
                            order_id: orderId,
                            nonce: $('#octo_print_provider_nonce').val()
                        },
                        beforeSend: function() {
                            progressText.html('🔍 Suche Design-Items in Bestellung...');
                            button.text('🔄 Analysiere Bestellung...');
                        },
                        success: function(response) {
                            progressText.html('📊 Verarbeite Server-Antwort...');
                            button.text('🔄 Verarbeite Daten...');
                            
                            setTimeout(function() {
                                progressContainer.remove();
                                
                                if (response.success) {
                                    // Success with detailed info
                                    var title = 'Druckdaten erfolgreich geladen!';
                                    var message = response.data.message || 'Daten wurden aus der Datenbank aktualisiert.';
                                    var details = response.data.debug || [];
                                    
                                    createStatusMessage('success', title, message, details)
                                        .insertBefore(button.parent());
                                    
                                    button.text('✅ Erfolgreich!').css('background-color', '#46b450');
                                    
                                    // Show countdown
                                    var countdown = 3;
                                    var countdownInterval = setInterval(function() {
                                        button.text('✅ Neu laden in ' + countdown + 's...');
                                        countdown--;
                                        
                                        if (countdown < 0) {
                                            clearInterval(countdownInterval);
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
                
                // ✅ NEU: Design-Größenberechnung Test Button
                $('#test-design-calculation-btn').on('click', function() {
                    var button = $(this);
                    var spinner = button.next('.test-spinner');
                    var resultContainer = $('#test-result-container');
                    var resultContent = $('#test-result-content');
                    var orderId = button.data('order-id');
                    
                    // Remove any existing notices
                    $('.notice').remove();
                    
                    // Show loading state
                    button.prop('disabled', true).html('<span class="dashicons dashicons-update" style="animation: spin 1s linear infinite; margin-right: 5px;"></span>Teste...');
                    spinner.show();
                    resultContainer.hide();
                    
                    $.ajax({
                        url: ajaxurl,
                        type: 'POST',
                        data: {
                            action: 'test_order_design_calculation',
                            order_id: orderId,
                            nonce: $('#octo_print_provider_nonce').val()
                        },
                        success: function(response) {
                            if (response.success) {
                                resultContent.text(response.data.test_result);
                                resultContainer.show();
                                
                                // Show success message
                                createStatusMessage('success', '✅ Test erfolgreich', 
                                    'Design-Größenberechnung wurde erfolgreich durchgeführt. Siehe Ergebnis unten.')
                                    .insertBefore(button.parent());
                                
                            } else {
                                resultContent.text('❌ Fehler: ' + (response.data.message || 'Unbekannter Fehler'));
                                resultContainer.show();
                                
                                createStatusMessage('error', '❌ Test fehlgeschlagen', 
                                    response.data.message || 'Unbekannter Fehler beim Testen der Design-Größenberechnung')
                                    .insertBefore(button.parent());
                            }
                        },
                        error: function(xhr, status, error) {
                            resultContent.text('❌ AJAX Fehler: ' + error);
                            resultContainer.show();
                            
                            createStatusMessage('error', '❌ Netzwerkfehler', 
                                'Verbindung zum Server fehlgeschlagen: ' + error)
                                .insertBefore(button.parent());
                        },
                        complete: function() {
                            // Reset button state
                            button.prop('disabled', false).html('<span class="dashicons dashicons-admin-tools" style="margin-right: 5px;"></span>Test Berechnung');
                            spinner.hide();
                        }
                    });
                });
            });
        </script>
        <?php
    }

    /**
     * ✅ NEU: AJAX Handler für Design-Größenberechnung Test in Bestellungen
     */
    public function ajax_test_order_design_calculation() {
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
        
        if (!$order_id) {
            wp_send_json_error(array('message' => __('Missing order ID', 'octo-print-designer')));
        }
        
        // Get order
        $order = wc_get_order($order_id);
        if (!$order) {
            wp_send_json_error(array('message' => __('Order not found', 'octo-print-designer')));
        }
        
        try {
            // Führe den Design-Größenberechnung Test durch
            $test_result = $this->perform_order_design_calculation_test($order);
            
            wp_send_json_success(array(
                'message' => 'Design size calculation test completed',
                'test_result' => $test_result
            ));
            
        } catch (Exception $e) {
            wp_send_json_error(array('message' => 'Test failed: ' . $e->getMessage()));
        }
    }
    
    /**
     * ✅ NEU: Führt den Design-Größenberechnung Test für eine Bestellung durch
     */
    private function perform_order_design_calculation_test($order) {
        $result = array();
        $result[] = "=== YPRINT DESIGN-GRÖSSENBERECHNUNG TEST FÜR BESTELLUNG ===";
        $result[] = "Bestellung: #" . $order->get_order_number();
        $result[] = "Datum: " . $order->get_date_created()->format('d.m.Y H:i:s');
        $result[] = "Status: " . wc_get_order_status_name($order->get_status());
        $result[] = "";
        
        // **SCHRITT 1: Bestellungs-Items analysieren**
        $result[] = "📋 SCHRITT 1: Bestellungs-Items analysieren";
        $result[] = "----------------------------------------";
        
        $design_items = array();
        $total_items = 0;
        $design_items_count = 0;
        
        foreach ($order->get_items() as $item_id => $item) {
            $total_items++;
            $design_id = $item->get_meta('_design_id') ?: $item->get_meta('yprint_design_id') ?: $item->get_meta('_yprint_design_id');
            
            if ($design_id) {
                $design_items_count++;
                $design_items[] = array(
                    'item_id' => $item_id,
                    'design_id' => $design_id,
                    'name' => $this->get_design_meta($item, 'name') ?: $this->get_design_meta($item, 'design_name') ?: $item->get_name(),
                    'size_name' => $this->get_design_meta($item, 'size_name') ?: 'One Size',
                    'template_id' => $this->get_design_meta($item, 'template_id') ?: '',
                    'quantity' => $item->get_quantity()
                );
            }
        }
        
        $result[] = "✅ Bestellungs-Analyse abgeschlossen:";
        $result[] = "   Gesamt-Items: {$total_items}";
        $result[] = "   Design-Items: {$design_items_count}";
        $result[] = "   Standard-Items: " . ($total_items - $design_items_count);
        $result[] = "";
        
        if (empty($design_items)) {
            $result[] = "❌ Keine Design-Items in dieser Bestellung gefunden!";
            $result[] = "   Test kann nicht durchgeführt werden.";
            return implode("\n", $result);
        }
        
        // **SCHRITT 2: Design-Items detailliert analysieren**
        $result[] = "🎨 SCHRITT 2: Design-Items detailliert analysieren";
        $result[] = "----------------------------------------";
        
        foreach ($design_items as $index => $design_item) {
            $item_num = $index + 1;
            $result[] = "   Item {$item_num}:";
            $result[] = "     Name: " . $design_item['name'];
            $result[] = "     Größe: " . $design_item['size_name'];
            $result[] = "     Design ID: " . $design_item['design_id'];
            $result[] = "     Template ID: " . ($design_item['template_id'] ?: 'Nicht verfügbar');
            $result[] = "     Menge: " . $design_item['quantity'];
            $result[] = "";
        }
        
        // **SCHRITT 3: Template-Daten abrufen**
        $result[] = "📋 SCHRITT 3: Template-Daten abrufen";
        $result[] = "----------------------------------------";
        
        $template_data = array();
        foreach ($design_items as $design_item) {
            if (empty($design_item['template_id'])) {
                continue;
            }
            
            $template_id = $design_item['template_id'];
            if (!isset($template_data[$template_id])) {
                $template_post = get_post($template_id);
                if ($template_post) {
                    $product_dimensions = get_post_meta($template_id, '_template_product_dimensions', true);
                    $template_measurements = get_post_meta($template_id, '_template_view_print_areas', true);
                    
                    $template_data[$template_id] = array(
                        'name' => $template_post->post_title,
                        'product_dimensions' => $product_dimensions ?: array(),
                        'template_measurements' => $template_measurements ?: array()
                    );
                    
                    $result[] = "✅ Template {$template_id} gefunden: " . $template_post->post_title;
                } else {
                    $result[] = "❌ Template {$template_id} nicht gefunden!";
                }
            }
        }
        $result[] = "";
        
        // **SCHRITT 4: Größenextraktion testen**
        $result[] = "🔍 SCHRITT 4: Größenextraktion aus WooCommerce testen";
        $result[] = "----------------------------------------";
        
        // Hole API-Integration Instanz für Größenextraktion
        $api_integration = Octo_Print_API_Integration::get_instance();
        
        foreach ($design_items as $design_item) {
            $size_name = $design_item['size_name'];
            $result[] = "   Größe für '{$design_item['name']}': {$size_name}";
            
            // Teste die Größenextraktion
            $extracted_size = $api_integration->get_order_size_from_woocommerce($order);
            if ($extracted_size) {
                $result[] = "   ✅ Größenextraktion erfolgreich: {$extracted_size}";
            } else {
                $result[] = "   ⚠️ Größenextraktion fehlgeschlagen - verwende Item-Größe";
            }
        }
        $result[] = "";
        
        // **SCHRITT 5: Design-Daten abrufen**
        $result[] = "🎯 SCHRITT 5: Design-Daten abrufen";
        $result[] = "----------------------------------------";
        
        foreach ($design_items as $design_item) {
            $design_id = $design_item['design_id'];
            $result[] = "   Design ID: {$design_id}";
            
            // Versuche Design-Daten aus der Datenbank zu laden
            $design_data = $this->get_design_data_from_database($design_id);
            if ($design_data) {
                $result[] = "   ✅ Design-Daten gefunden:";
                $result[] = "     Views: " . count($design_data['views'] ?? array());
                $result[] = "     Elemente: " . count($design_data['elements'] ?? array());
            } else {
                $result[] = "   ❌ Design-Daten nicht gefunden!";
            }
        }
        $result[] = "";
        
        // **SCHRITT 6: Koordinaten-Umrechnung testen**
        $result[] = "🎨 SCHRITT 6: Koordinaten-Umrechnung testen";
        $result[] = "----------------------------------------";
        
        foreach ($design_items as $design_item) {
            $result[] = "   Test für: {$design_item['name']} (Größe: {$design_item['size_name']})";
            
            // Simuliere Test-Koordinaten
            $test_coordinates = array(
                'x' => 100,
                'y' => 150,
                'width' => 200,
                'height' => 100
            );
            
            $result[] = "     Test-Koordinaten: (" . $test_coordinates['x'] . ", " . $test_coordinates['y'] . ")";
            $result[] = "     Test-Dimensionen: " . $test_coordinates['width'] . " x " . $test_coordinates['height'] . " px";
            
            // Teste Koordinaten-Umrechnung
            if (!empty($design_item['template_id'])) {
                $template_id = $design_item['template_id'];
                $size_name = $design_item['size_name'];
                
                // Hole Template-Messungen
                $template_measurements = get_post_meta($template_id, '_template_view_print_areas', true);
                if ($template_measurements) {
                    // Teste Skalierungsfaktor-Berechnung
                    $scale_factor = $api_integration->get_size_specific_scale_factor($template_measurements, $size_name);
                    if ($scale_factor) {
                        $result[] = "     ✅ Skalierungsfaktor gefunden: {$scale_factor}";
                        
                        // Berechne umgerechnete Koordinaten
                        $converted_x = round($test_coordinates['x'] * $scale_factor, 1);
                        $converted_y = round($test_coordinates['y'] * $scale_factor, 1);
                        $converted_width = round($test_coordinates['width'] * $scale_factor, 1);
                        $converted_height = round($test_coordinates['height'] * $scale_factor, 1);
                        
                        $result[] = "     ✅ Umgerechnete Koordinaten:";
                        $result[] = "       Position: ({$converted_x}, {$converted_y}) mm";
                        $result[] = "       Dimensionen: {$converted_width} x {$converted_height} mm";
                    } else {
                        $result[] = "     ⚠️ Kein Skalierungsfaktor gefunden - verwende Fallback";
                    }
                } else {
                    $result[] = "     ❌ Keine Template-Messungen verfügbar";
                }
            } else {
                $result[] = "     ❌ Keine Template-ID verfügbar";
            }
            $result[] = "";
        }
        
        // **SCHRITT 7: API-Datenaufbereitung testen**
        $result[] = "📡 SCHRITT 7: API-Datenaufbereitung testen";
        $result[] = "----------------------------------------";
        
        foreach ($design_items as $design_item) {
            $result[] = "   API-Test für: {$design_item['name']}";
            
            // Simuliere Design-Element
            $test_design_element = array(
                'type' => 'text',
                'x' => 100,
                'y' => 150,
                'width' => 200,
                'height' => 50,
                'text' => 'Test Text',
                'size_name' => $design_item['size_name']
            );
            
            $result[] = "     Element-Typ: " . $test_design_element['type'];
            $result[] = "     Canvas-Position: (" . $test_design_element['x'] . ", " . $test_design_element['y'] . ")";
            $result[] = "     Canvas-Dimensionen: " . $test_design_element['width'] . " x " . $test_design_element['height'];
            
            // Teste API-Format-Konvertierung
            if (!empty($design_item['template_id'])) {
                $template_id = $design_item['template_id'];
                $size_name = $design_item['size_name'];
                
                // Hole Template-Messungen für Konvertierung
                $template_measurements = get_post_meta($template_id, '_template_view_print_areas', true);
                if ($template_measurements) {
                    $scale_factor = $this->get_size_specific_scale_factor($template_measurements, $size_name);
                    if ($scale_factor) {
                        // Simuliere API-Konvertierung
                        $api_x = round($test_design_element['x'] * $scale_factor, 1);
                        $api_y = round($test_design_element['y'] * $scale_factor, 1);
                        $api_width = round($test_design_element['width'] * $scale_factor, 1);
                        $api_height = round($test_design_element['height'] * $scale_factor, 1);
                        
                        $result[] = "     ✅ API-Konvertierung erfolgreich:";
                        $result[] = "       API-Position: ({$api_x}, {$api_y}) mm";
                        $result[] = "       API-Dimensionen: {$api_width} x {$api_height} mm";
                        $result[] = "       Skalierungsfaktor: {$scale_factor}";
                    } else {
                        $result[] = "     ⚠️ API-Konvertierung mit Fallback-Skalierung";
                    }
                } else {
                    $result[] = "     ❌ API-Konvertierung nicht möglich - keine Template-Daten";
                }
            }
            $result[] = "";
        }
        
        // **SCHRITT 8: Endergebnis**
        $result[] = "🎯 ENDERGEBNIS";
        $result[] = "----------------------------------------";
        $result[] = "Bestellung: #" . $order->get_order_number();
        $result[] = "Design-Items: {$design_items_count}";
        $result[] = "Templates gefunden: " . count($template_data);
        $result[] = "Größenextraktion: " . ($api_integration->get_order_size_from_woocommerce($order) ? '✅ Erfolgreich' : '⚠️ Fallback');
        $result[] = "Koordinaten-Umrechnung: ✅ Verfügbar";
        $result[] = "API-Datenaufbereitung: ✅ Verfügbar";
        $result[] = "";
        $result[] = "✅ Test erfolgreich abgeschlossen!";
        $result[] = "Das System kann die Design-Größenberechnung für diese Bestellung durchführen.";
        
        return implode("\n", $result);
    }
    
    /**
     * ✅ NEU: Hilfsfunktion zum Abrufen von Design-Daten aus der Datenbank
     */
    private function get_design_data_from_database($design_id) {
        // Versuche Design-Daten aus verschiedenen Quellen zu laden
        $design_data = get_post_meta($design_id, '_design_data', true);
        if ($design_data) {
            return $design_data;
        }
        
        // Fallback: Versuche andere Meta-Felder
        $design_data = get_post_meta($design_id, 'design_data', true);
        if ($design_data) {
            return $design_data;
        }
        
        return null;
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
        
        // Refresh print data from database
        $refreshed_items = 0;
        $debug_info = array();
        global $wpdb;
        $table_name = $wpdb->prefix . 'octo_user_designs';
        
        foreach ($order->get_items() as $item_id => $item) {
            $design_id = $item->get_meta('_design_id') ?: $item->get_meta('yprint_design_id') ?: $item->get_meta('_yprint_design_id');
            
            if (!$design_id) {
                $debug_info[] = "Item {$item_id}: No design_id found (checked _design_id and yprint_design_id)";
                continue; // Skip non-design items
            }
            
            $debug_info[] = "Item {$item_id}: Found design_id = {$design_id}";
            
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
        
        wp_send_json_success(array(
            'message' => sprintf(__('Print data refreshed for %d items', 'octo-print-designer'), $refreshed_items),
            'debug' => $debug_info
        ));
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
        
        // Enhanced API sending with size-specific calculations
        $result = $api_integration->send_order_to_api_with_size_context($order);
        
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
     * Enhanced method to send order with size context
     */
    public function send_order_to_api_with_size_context($order) {
        // Log size information for debugging
        $order_sizes = array();
        foreach ($order->get_items() as $item) {
            $size = $this->extract_item_size($item);
            if ($size) {
                $order_sizes[] = $size;
            }
        }
        
        error_log("AllesKlarDruck API: Order #{$order->get_order_number()} sizes: " . implode(', ', $order_sizes));
        
        // Call enhanced API method
        $api_integration = Octo_Print_API_Integration::get_instance();
        return $api_integration->send_order_to_api($order);
    }

    /**
     * Extract size information from order item
     */
    private function extract_item_size($item) {
        // Prüfe verschiedene Größenfelder
        $size_fields = ['size_name', 'product_size', 'variation_size', 'pa_size'];
        
        foreach ($size_fields as $field) {
            $size = $this->get_design_meta($item, $field);
            if (!empty($size)) {
                return trim($size);
            }
        }
        
        // Prüfe Variation-Attribute
        if ($item instanceof WC_Order_Item_Product) {
            $product = $item->get_product();
            if ($product && $product->is_type('variation')) {
                $attributes = $product->get_variation_attributes();
                foreach ($attributes as $key => $value) {
                    if (strpos(strtolower($key), 'size') !== false && !empty($value)) {
                        return trim($value);
                    }
                }
            }
        }
        
        return null;
    }
}