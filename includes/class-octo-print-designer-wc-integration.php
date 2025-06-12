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
        
        // Get saved print provider email
        $print_provider_email = get_post_meta($order_id, '_print_provider_email', true);
        $email_sent = get_post_meta($order_id, '_print_provider_email_sent', true);
        
        wp_nonce_field('octo_send_to_print_provider', 'octo_print_provider_nonce');
        
        ?>
        <div class="print-provider-form">
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
            
            <p>
                <button type="button" id="send_to_print_provider" class="button button-primary">
                    <?php _e('Send to Print Provider', 'octo-print-designer'); ?>
                </button>
                <span class="spinner" style="float: none; margin: 0 0 0 5px;"></span>
            </p>
        </div>
        
        <script>
            jQuery(document).ready(function($) {
                $('#send_to_print_provider').on('click', function() {
                    var button = $(this);
                    var spinner = button.next('.spinner');
                    var email = $('#print_provider_email').val();
                    
                    if (!email) {
                        alert('<?php echo esc_js(__('Please enter a valid email address', 'octo-print-designer')); ?>');
                        return;
                    }
                    
                    button.prop('disabled', true);
                    spinner.css('visibility', 'visible');
                    
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
                        success: function(response) {
                            if (response.success) {
                                $('<div class="notice notice-success"><p>' + response.data.message + '</p></div>')
                                    .insertBefore(button.parent())
                                    .delay(5000)
                                    .fadeOut();
                                    
                                // Refresh page after a short delay
                                setTimeout(function() {
                                    location.reload();
                                }, 1500);
                            } else {
                                $('<div class="notice notice-error"><p>' + response.data.message + '</p></div>')
                                    .insertBefore(button.parent());
                            }
                        },
                        error: function() {
                            $('<div class="notice notice-error"><p><?php echo esc_js(__('An error occurred. Please try again.', 'octo-print-designer')); ?></p></div>')
                                .insertBefore(button.parent());
                        },
                        complete: function() {
                            button.prop('disabled', false);
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
    '', // No username needed
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
    
    // Get processed views data
    $processed_views = $item->get_meta('_db_processed_views');
    if (!empty($processed_views) && is_array($processed_views)) {
        foreach ($processed_views as $view_key => $view_data) {
            $views[] = array(
                'view_name' => $view_data['view_name'] ?: 'Unbekannte Ansicht',
                'view_id' => $view_data['system_id'] ?: '',
                'variation_id' => $view_data['variation_id'] ?: '',
                'images' => $this->parse_view_images($view_data['images'] ?: array())
            );
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
        Hi!<br><br>
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
            <td style="padding: 10px 15px; border-bottom: 1px solid #e5e5e5; font-weight: bold;">Bestelldatum:</td>
            <td style="padding: 10px 15px; border-bottom: 1px solid #e5e5e5;"><?php echo esc_html($order->get_date_created()->format('d.m.Y H:i')); ?></td>
        </tr>
        <tr>
            <td style="padding: 10px 15px; font-weight: bold;">Gesamtbetrag:</td>
            <td style="padding: 10px 15px; font-weight: bold; color: #0079FF;"><?php echo wp_kses_post($order->get_formatted_order_total()); ?></td>
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

    <!-- Produktdetails -->
    <?php foreach ($design_items as $index => $item) : ?>
        <?php if ($item['is_design_product']) : ?>
            <table style="width: 100%; border-collapse: collapse; margin: 30px 0; background: #fff; border: 2px solid #0079FF; border-radius: 8px; overflow: hidden;">
                <tr style="background: #0079FF; color: white;">
                    <td style="padding: 15px; font-weight: bold; font-size: 16px;">
                        🧾 <strong>Druckdaten-Aufstellung für „<?php echo esc_html($item['name']); ?>"</strong>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px;">
                        <p style="margin: 0 0 15px 0; font-size: 14px;">
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
                                <img src="<?php echo esc_url($item['preview_url']); ?>" alt="Produkt Preview" style="max-width: 300px; height: auto; border: 1px solid #ddd; border-radius: 4px; margin-top: 5px;">
                            </div>
                        <?php endif; ?>

                        <?php if (!empty($item['design_views'])) : ?>
                            <?php foreach ($item['design_views'] as $view_index => $view) : ?>
                                <div style="margin: 25px 0; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #0079FF; border-radius: 4px;">
                                    <h4 style="margin-top: 0; color: #0079FF;">🔹 <strong>View <?php echo ($view_index + 1); ?>: <?php echo esc_html($view['view_name']); ?></strong></h4>
                                    
                                    <ul style="margin: 8px 0; padding-left: 0; list-style: none; font-size: 13px;">
                                        <li>• <strong>System-ID der View:</strong> <code><?php echo esc_html($view['view_id']); ?></code></li>
                                        <li>• <strong>Produktvariante (Variation-ID):</strong> <code><?php echo esc_html($view['variation_id']); ?></code></li>
                                    </ul>
                                    
                                    <?php if (!empty($view['images'])) : ?>
                                        <?php foreach ($view['images'] as $img_index => $img) : ?>
                                            <div style="margin: 15px 0; padding: 12px; background-color: #ffffff; border: 1px solid #e1e5e9; border-radius: 3px;">
                                                <h5 style="margin-top: 0; color: #333;">🎨 <strong>Bild <?php echo ($img_index + 1); ?>: <?php echo esc_html($img['filename']); ?></strong></h5>
                                                
                                                <ul style="margin: 5px 0; padding-left: 0; list-style: none; font-size: 12px;">
                                                    <li>• <strong>Dateiname:</strong> <code><?php echo esc_html($img['filename']); ?></code></li>
                                                    <li>• <strong>Bild-URL:</strong> <a href="<?php echo esc_url($img['url']); ?>" target="_blank" style="color: #0079FF;"><?php echo esc_html($img['filename']); ?></a></li>
                                                    <li>• <strong>Originalgröße:</strong> <?php echo esc_html($img['original_width_px']); ?> px × <?php echo esc_html($img['original_height_px']); ?> px</li>
                                                </ul>
                                                
                                                <p style="margin: 8px 0 5px 0; font-weight: bold; font-size: 12px;">📍 <strong>Platzierung im Designbereich:</strong></p>
                                                <ul style="margin: 5px 0; padding-left: 20px; font-size: 12px;">
                                                    <li><code>left</code>: <strong><?php echo esc_html($img['position_left_px']); ?> px</strong></li>
                                                    <li><code>top</code>: <strong><?php echo esc_html($img['position_top_px']); ?> px</strong></li>
                                                </ul>
                                                
                                                <p style="margin: 8px 0 5px 0; font-weight: bold; font-size: 12px;">🔍 <strong>Skalierung:</strong></p>
                                                <ul style="margin: 5px 0; padding-left: 20px; font-size: 12px;">
                                                    <li><code>scaleX</code>: <strong><?php echo esc_html($img['scale_x']); ?></strong> → ca. <strong><?php echo esc_html($img['scale_x_percent']); ?>%</strong></li>
                                                    <li><code>scaleY</code>: <strong><?php echo esc_html($img['scale_y']); ?></strong> → ca. <strong><?php echo esc_html($img['scale_y_percent']); ?>%</strong></li>
                                                </ul>
                                                
                                                <div style="margin: 8px 0; padding: 8px; background-color: #e8f5e8; border-radius: 3px;">
                                                    <p style="margin: 0; font-weight: bold; color: #2d5016; font-size: 12px;">🎯 <strong>Druckgröße (berechnet):</strong></p>
                                                    <ul style="margin: 5px 0; padding-left: 20px; font-size: 12px; color: #2d5016;">
                                                        <li><strong>Breite:</strong> <?php echo esc_html($img['original_width_px']); ?> × <?php echo esc_html($img['scale_x']); ?> = <strong>~<?php echo esc_html($img['print_width_mm']); ?> mm</strong></li>
                                                        <li><strong>Höhe:</strong> <?php echo esc_html($img['original_height_px']); ?> × <?php echo esc_html($img['scale_y']); ?> = <strong>~<?php echo esc_html($img['print_height_mm']); ?> mm</strong></li>
                                                    </ul>
                                                </div>
                                                
                                                <p style="margin: 8px 0 0 0; text-align: center;">
                                                    <a href="<?php echo esc_url($img['url']); ?>" target="_blank" 
                                                       style="display: inline-block; padding: 8px 16px; background-color: #0079FF; color: white; text-decoration: none; border-radius: 3px; font-weight: bold; font-size: 12px;">
                                                        📥 Download Original File
                                                    </a>
                                                </p>
                                            </div>
                                        <?php endforeach; ?>
                                    <?php endif; ?>
                                </div>
                            <?php endforeach; ?>
                        <?php endif; ?>
                    </td>
                </tr>
            </table>
        <?php else : ?>
            <!-- Blank Product -->
            <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: #fff; border: 2px solid #ccc; border-radius: 8px; overflow: hidden;">
                <tr style="background: #666; color: white;">
                    <td style="padding: 15px; font-weight: bold; font-size: 16px;">
                        📦 <strong>Blank-Produkt: „<?php echo esc_html($item['name']); ?>"</strong>
                    </td>
                </tr>
                <tr>
                    <td style="padding: 20px;">
                        <p style="margin: 0; font-size: 14px;">
                            <strong>Produktvariante:</strong> <?php echo esc_html($item['variation_name']); ?> – <?php echo esc_html($item['size_name']); ?><br>
                            <strong>Menge:</strong> <?php echo esc_html($item['quantity']); ?><br>
                            <strong>Hinweis:</strong> <em>Dies ist ein Blank-Produkt ohne Design - einfach das Standardprodukt versenden.</em>
                        </p>
                    </td>
                </tr>
            </table>
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
        Das YPrint Team
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
}