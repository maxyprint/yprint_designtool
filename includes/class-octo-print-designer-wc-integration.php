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
        
        // Get design items from the order
        $design_items = array();
        
        foreach ($order->get_items() as $item) {
            $design_id = $item->get_meta('_design_id');
            if (!$design_id) {
                continue;
            }
            
            // Get all design data
$design_item = array(
    'name' => $item->get_meta('_design_name') ?: $item->get_name(),
    'variation_name' => $item->get_meta('_design_color') ?: __('Default', 'octo-print-designer'),
    'size_name' => $item->get_meta('_design_size') ?: __('One Size', 'octo-print-designer'),
    'preview_url' => $item->get_meta('_design_preview_url') ?: '',
    'width_cm' => $item->get_meta('_design_width_cm') ?: '',
    'height_cm' => $item->get_meta('_design_height_cm') ?: '',
    'design_image_url' => $item->get_meta('_design_image_url') ?: '',
    'product_images' => null,
    'aligned_files' => array()
);

// Get individual design images with their calculated dimensions
$design_images_json = $item->get_meta('_design_images');
if ($design_images_json) {
    try {
        $design_images = json_decode($design_images_json, true);
        if (is_array($design_images) && !empty($design_images)) {
            $aligned_files = array();
            
            foreach ($design_images as $image) {
                if (!empty($image['url'])) {
                    $aligned_files[] = array(
                        'url' => $image['url'],
                        'view_name' => isset($image['view_name']) ? $image['view_name'] : __('Design File', 'octo-print-designer'),
                        'view_id' => isset($image['view_id']) ? $image['view_id'] : '',
                        'width_cm' => isset($image['width_cm']) ? round(floatval($image['width_cm']), 2) : 0,
                        'height_cm' => isset($image['height_cm']) ? round(floatval($image['height_cm']), 2) : 0,
                        'scaleX' => isset($image['scaleX']) ? $image['scaleX'] : 1,
                        'scaleY' => isset($image['scaleY']) ? $image['scaleY'] : 1
                    );
                }
            }
            
            $design_item['aligned_files'] = $aligned_files;
        }
    } catch (Exception $e) {
        error_log('Error processing design images for print provider email: ' . $e->getMessage());
    }
}
            
            // Get product images with view information
            $product_images_json = $item->get_meta('_design_product_images');
            if ($product_images_json) {
                try {
                    $design_item['product_images'] = json_decode($product_images_json, true);
                } catch (Exception $e) {
                    error_log('Error decoding product images JSON: ' . $e->getMessage());
                }
            }
            
            // Get all design images if available
            $images_json = $item->get_meta('_design_images');
            if ($images_json) {
                try {
                    $design_item['design_images'] = json_decode($images_json, true);
                } catch (Exception $e) {
                    error_log('Error decoding design images JSON: ' . $e->getMessage());
                }
            }
            
            $design_items[] = $design_item;
        }
        
        if (empty($design_items)) {
            return new WP_Error('no_designs', __('No design products found in this order', 'octo-print-designer'));
        }
        
        // Get admin email as sender
        $from_email = get_option('admin_email');
        $from_name = get_bloginfo('name');
        
        // Set up email content
        ob_start();
        
        // Include email template
        include OCTO_PRINT_DESIGNER_PATH . 'includes/email-templates/print-provider-email.php';
        
        $email_content = ob_get_clean();
        
        // Set up email headers
        $headers = array(
            'Content-Type: text/html; charset=UTF-8',
            "From: {$from_name} <{$from_email}>"
        );
        
        // Send the email
        $subject = sprintf(__('New yprint Order #%s', 'octo-print-designer'), $order->get_order_number());
        $sent = wp_mail($email, $subject, $email_content, $headers);
        
        if (!$sent) {
            return new WP_Error('email_failed', __('Failed to send email to print provider', 'octo-print-designer'));
        }
        
        return true;
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