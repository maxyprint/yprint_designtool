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
        $design_name = $item->get_meta('_design_name');
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
            if ($item->get_meta('_design_id')) {
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
            $design_id = $item->get_meta('_design_id');
            if (!$design_id) continue;
            
            $total_design_items++;
            $has_processed_views = !empty($item->get_meta('_db_processed_views'));
            $has_preview = !empty($item->get_meta('_design_preview_url'));
            
            if ($has_processed_views) $items_with_data++;
            
            $design_items_status[] = array(
                'item_id' => $item_id,
                'design_id' => $design_id,
                'name' => $item->get_meta('_design_name') ?: $item->get_name(),
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
                
                <p style="margin: 0 0 8px 0; font-size: 12px; <?php echo $all_data_complete ? 'color: #155724;' : 'color: #856404;'; ?>">
                    <strong><?php echo $items_with_data; ?> von <?php echo $total_design_items; ?> Design-Items</strong> haben vollständige Druckdaten
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
                
                <p style="margin-bottom: 0;">
                    <button type="button" id="send_to_print_provider" class="button button-primary" <?php echo !$all_data_complete ? 'disabled title="Erst alle Druckdaten laden"' : ''; ?>>
                        <?php _e('📧 Send to Print Provider', 'octo-print-designer'); ?>
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
                    
                    if (!email) {
                        alert('<?php echo esc_js(__('Please enter a valid email address', 'octo-print-designer')); ?>');
                        return;
                    }
                    
                    // Remove any existing notices
                    $('.notice').not('.email-sent-notice').remove();
                    
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
                            order_id: <?php echo intval($order_id); ?>,
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
                                    var title = 'E-Mail konnte nicht gesendet werden';
                                    var message = response.data.message || 'Unbekannter Fehler beim E-Mail-Versand.';
                                    
                                    createStatusMessage('error', title, message)
                                        .insertBefore(button.parent());
                                    
                                    button.prop('disabled', false).text('📧 Send to Print Provider').css('background-color', '');
                                }
                            }, 300);
                        },
                        error: function() {
                            emailProgress.remove();
                            
                            var title = 'E-Mail-Versand fehlgeschlagen';
                            var message = 'Netzwerkfehler beim Senden der E-Mail.';
                            
                            createStatusMessage('error', title, message)
                                .insertBefore(button.parent());
                            
                            button.prop('disabled', false).text('📧 Send to Print Provider').css('background-color', '');
                        },
                        complete: function() {
                            spinner.css('visibility', 'hidden');
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
        $design_id = $item->get_meta('_design_id');
        
        // Handle design products
        if ($design_id) {
            $design_item = array(
                'name' => $item->get_meta('_design_name') ?: $item->get_name(),
                'variation_name' => $item->get_meta('_design_color') ?: 'Standard',
                'size_name' => $item->get_meta('_design_size') ?: 'One Size',
                'design_id' => $design_id,
                'template_id' => $item->get_meta('_db_design_template_id') ?: '',
                'preview_url' => $item->get_meta('_design_preview_url') ?: '',
                'design_views' => $this->parse_design_views($item),
                'is_design_product' => true
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
    null, // Username ist null – vermeidet Leerzeichen in "Hi!"
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
            $design_id = $item->get_meta('_design_id');
            
            if (!$design_id) {
                $debug_info[] = "Item {$item_id}: No design_id found";
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
            $design_id = $item->get_meta('_design_id');
            
            // Handle design products
            if ($design_id) {
                $design_item = array(
                    'name' => $item->get_meta('_design_name') ?: $item->get_name(),
                    'variation_name' => $item->get_meta('_design_color') ?: 'Standard',
                    'size_name' => $item->get_meta('_design_size') ?: 'One Size',
                    'design_id' => $design_id,
                    'template_id' => $item->get_meta('_db_design_template_id') ?: '',
                    'preview_url' => $item->get_meta('_design_preview_url') ?: '',
                    'design_views' => $this->parse_design_views($item),
                    'is_design_product' => true
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
}