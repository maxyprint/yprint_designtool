<?php

class Octo_Print_Designer_Products {

    public function __construct() {
        Octo_Print_Designer_Loader::$instance->add_action('init', $this, 'register_shortcodes');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_get_templates', $this, 'get_templates');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_nopriv_get_templates', $this, 'get_templates');

        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_upload_product_image', $this, 'handle_product_image_upload');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_delete_product_image', $this, 'handle_product_image_delete');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_update_design_images', $this, 'handle_update_design_images');

        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_bulk_delete_designs', $this, 'handle_bulk_delete_designs');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_bulk_toggle_designs', $this, 'handle_bulk_toggle_designs');

        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_add_to_cart', $this, 'handle_add_to_cart');
    }

    public function register_shortcodes() {
        add_shortcode('ops-products-listing', array($this, 'shortcode'));
    }

    public function shortcode($atts) {

        wp_enqueue_script('octo-print-designer-products-listing');
        
        wp_enqueue_style('octo-print-designer-toast-style');
        wp_enqueue_style('octo-print-designer-products-style');

        wp_enqueue_editor();

        ob_start();
        include OCTO_PRINT_DESIGNER_PATH . 'public/partials/products-listing.php';
        return ob_get_clean();

    }

    /**
     * Handle product image upload for designs
     */
    public function handle_product_image_upload() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_print_designer_nonce')) {
            wp_send_json_error(array(
                'message' => __('Security check failed', 'octo-print-designer')
            ));
        }

        // Check if user is logged in
        if (!is_user_logged_in()) {
            wp_send_json_error(array(
                'message' => __('You must be logged in to upload images', 'octo-print-designer')
            ));
        }

        // Check if file was uploaded
        if (empty($_FILES['image'])) {
            wp_send_json_error(array(
                'message' => __('No image was uploaded', 'octo-print-designer')
            ));
        }

        // Handle the upload using the User_Images class with type 'design'
        $result = Octo_Print_Designer_User_Images::$instance->save_image(
            $_FILES['image'],
            get_current_user_id(),
            'design'
        );

        error_log("IMAGE RESULT " . print_r($result, true));

        if (is_wp_error($result)) {
            wp_send_json_error(array(
                'message' => $result->get_error_message()
            ));
        }

        wp_send_json_success($result);
    }

    /**
     * Handle product image deletion
     */
    public function handle_product_image_delete() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_print_designer_nonce')) {
            wp_send_json_error(array(
                'message' => __('Security check failed', 'octo-print-designer')
            ));
        }

        // Check if user is logged in
        if (!is_user_logged_in()) {
            wp_send_json_error(array(
                'message' => __('You must be logged in to delete images', 'octo-print-designer')
            ));
        }

        // Check for image ID
        if (empty($_POST['image_id'])) {
            wp_send_json_error(array(
                'message' => __('No image ID provided', 'octo-print-designer')
            ));
        }

        $image_id = sanitize_text_field($_POST['image_id']);
        
        // Handle the deletion with type check
        $result = Octo_Print_Designer_User_Images::$instance->delete_image(
            $image_id,
            get_current_user_id(),
            'design'
        );

        if (is_wp_error($result)) {
            wp_send_json_error(array(
                'message' => $result->get_error_message()
            ));
        }

        wp_send_json_success(array(
            'message' => __('Image deleted successfully', 'octo-print-designer')
        ));
    }

    /**
     * Handle updating the design's product images
     */
    public function handle_update_design_images() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_print_designer_nonce')) {
            wp_send_json_error(array(
                'message' => __('Security check failed', 'octo-print-designer')
            ));
        }

        // Check if user is logged in
        if (!is_user_logged_in()) {
            wp_send_json_error(array(
                'message' => __('You must be logged in to update designs', 'octo-print-designer')
            ));
        }

        // Validate required fields
        if (!isset($_POST['design_id']) || !isset($_POST['images'])) {
            wp_send_json_error(array(
                'message' => __('Missing required fields', 'octo-print-designer')
            ));
        }

        $design_id = absint($_POST['design_id']);
        $images = json_decode(stripslashes($_POST['images']), true);

        if (!is_array($images)) {
            wp_send_json_error(array(
                'message' => __('Invalid images data', 'octo-print-designer')
            ));
        }

        // Verify user owns the design
        global $wpdb;
        $table_name = $wpdb->prefix . 'octo_user_designs';
        
        $design = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$table_name} WHERE id = %d AND user_id = %d",
            $design_id,
            get_current_user_id()
        ));

        if (!$design) {
            wp_send_json_error(array(
                'message' => __('Design not found or access denied', 'octo-print-designer')
            ));
        }

        // Validate that all images exist and belong to the user
        $image_ids = array_map(function($img) { return $img['id']; }, $images);
        $images_table = $wpdb->prefix . 'octo_user_images';
        
        $existing_images = $wpdb->get_col($wpdb->prepare(
            "SELECT image_id FROM {$images_table} 
            WHERE user_id = %d AND image_id IN (" . implode(',', array_fill(0, count($image_ids), '%s')) . ")",
            array_merge(array(get_current_user_id()), $image_ids)
        ));

        if (count($existing_images) !== count($image_ids)) {
            wp_send_json_error(array(
                'message' => __('One or more images not found or access denied', 'octo-print-designer')
            ));
        }

        // Update the design's product_images
        $result = $wpdb->update(
            $table_name,
            array('product_images' => wp_json_encode($images)),
            array('id' => $design_id),
            array('%s'),
            array('%d')
        );

        if ($result === false) {
            wp_send_json_error(array(
                'message' => __('Failed to update design images', 'octo-print-designer')
            ));
        }

        wp_send_json_success(array(
            'message' => __('Design images updated successfully', 'octo-print-designer')
        ));
    }

    /**
     * Handle bulk deletion of designs
     */
    public function handle_bulk_delete_designs() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_print_designer_nonce')) {
            wp_send_json_error(array(
                'message' => __('Security check failed', 'octo-print-designer')
            ));
        }

        // Check if user is logged in
        if (!is_user_logged_in()) {
            wp_send_json_error(array(
                'message' => __('You must be logged in to delete designs', 'octo-print-designer')
            ));
        }

        // Get design IDs
        $design_ids = isset($_POST['design_ids']) ? explode(',', sanitize_text_field($_POST['design_ids'])) : array();
        if (empty($design_ids)) {
            wp_send_json_error(array(
                'message' => __('No designs selected', 'octo-print-designer')
            ));
        }

        global $wpdb;
        $designs_table = $wpdb->prefix . 'octo_user_designs';
        $user_id = get_current_user_id();

        // Start transaction
        $wpdb->query('START TRANSACTION');

        try {
            // Get all design data first to collect image IDs
            $designs = $wpdb->get_results($wpdb->prepare(
                "SELECT id, product_images FROM {$designs_table} 
                WHERE id IN (" . implode(',', array_fill(0, count($design_ids), '%d')) . ") 
                AND user_id = %d",
                array_merge($design_ids, array($user_id))
            ));

            // Collect all image IDs to delete
            $image_ids = array();
            foreach ($designs as $design) {
                $images = json_decode($design->product_images, true);
                if (is_array($images)) {
                    foreach ($images as $image) {
                        if (isset($image['id'])) {
                            $image_ids[] = $image['id'];
                        }
                    }
                }
            }

            // Delete designs
            $deleted = $wpdb->query($wpdb->prepare(
                "DELETE FROM {$designs_table} 
                WHERE id IN (" . implode(',', array_fill(0, count($design_ids), '%d')) . ") 
                AND user_id = %d",
                array_merge($design_ids, array($user_id))
            ));

            if ($deleted === false) {
                throw new Exception(__('Failed to delete designs', 'octo-print-designer'));
            }

            // Delete associated images
            if (!empty($image_ids)) {
                foreach ($image_ids as $image_id) {
                    Octo_Print_Designer_User_Images::$instance->delete_image($image_id, $user_id, 'design');
                }
            }

            $wpdb->query('COMMIT');
            
            wp_send_json_success(array(
                'message' => sprintf(
                    _n(
                        '%d design deleted successfully',
                        '%d designs deleted successfully',
                        count($design_ids),
                        'octo-print-designer'
                    ),
                    count($design_ids)
                )
            ));

        } catch (Exception $e) {
            $wpdb->query('ROLLBACK');
            wp_send_json_error(array(
                'message' => $e->getMessage()
            ));
        }
    }

    /**
     * Handle bulk toggling of designs
     */
    public function handle_bulk_toggle_designs() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_print_designer_nonce')) {
            wp_send_json_error(array(
                'message' => __('Security check failed', 'octo-print-designer')
            ));
        }

        // Check if user is logged in
        if (!is_user_logged_in()) {
            wp_send_json_error(array(
                'message' => __('You must be logged in to modify designs', 'octo-print-designer')
            ));
        }

        // Get design IDs and state
        $design_ids = isset($_POST['design_ids']) ? explode(',', sanitize_text_field($_POST['design_ids'])) : array();
        $enabled = isset($_POST['enabled']) ? (bool)$_POST['enabled'] : false;

        if (empty($design_ids)) {
            wp_send_json_error(array(
                'message' => __('No designs selected', 'octo-print-designer')
            ));
        }

        global $wpdb;
        $table_name = $wpdb->prefix . 'octo_user_designs';
        $user_id = get_current_user_id();

        // Update designs
        $result = $wpdb->query($wpdb->prepare(
            "UPDATE {$table_name} 
            SET is_enabled = %d 
            WHERE id IN (" . implode(',', array_fill(0, count($design_ids), '%d')) . ") 
            AND user_id = %d",
            array_merge(array($enabled ? 1 : 0), $design_ids, array($user_id))
        ));

        if ($result === false) {
            wp_send_json_error(array(
                'message' => __('Failed to update designs', 'octo-print-designer')
            ));
        }

        wp_send_json_success(array(
            'message' => sprintf(
                _n(
                    '%d design updated successfully',
                    '%d designs updated successfully',
                    count($design_ids),
                    'octo-print-designer'
                ),
                count($design_ids)
            )
        ));
    }

    public function handle_add_to_cart() {
        try {
            // Verify nonce
            if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_print_designer_nonce')) {
                throw new Exception(__('Security check failed', 'octo-print-designer'));
            }
    
            // Get and validate base product
            $base_product_id = Octo_Print_Designer_Settings::get_base_product_id();
            if (!$base_product_id) {
                throw new Exception(__('Base product not configured', 'octo-print-designer'));
            }
    
            // Validate required parameters
            $design_id = isset($_POST['design_id']) ? absint($_POST['design_id']) : 0;
            $variation_id = isset($_POST['variation_id']) ? sanitize_text_field($_POST['variation_id']) : '';
            $size_id = isset($_POST['size_id']) ? sanitize_text_field($_POST['size_id']) : '';
    
            if (!$design_id || !$variation_id || !$size_id) {
                throw new Exception(__('Missing required parameters', 'octo-print-designer'));
            }
    
            // Get design data
            global $wpdb;
            $design = $wpdb->get_row($wpdb->prepare(
                "SELECT * FROM {$wpdb->prefix}octo_user_designs WHERE id = %d",
                $design_id
            ));
    
            if (!$design) {
                throw new Exception(__('Design not found', 'octo-print-designer'));
            }
    
            // Get template data
            $template_variations = get_post_meta($design->template_id, '_template_variations', true);
            $template_sizes = get_post_meta($design->template_id, '_template_sizes', true);
            $template_pricing_rules = get_post_meta($design->template_id, '_template_pricing_rules', true);
    
            // Validate variation and get variation details
            if (!isset($template_variations[$variation_id])) {
                throw new Exception(__('Invalid variation selected', 'octo-print-designer'));
            }
            $variation = $template_variations[$variation_id];
    
            // Validate size and get size details
            $selected_size = null;
            foreach ($template_sizes as $size) {
                if ($size['id'] === $size_id) {
                    $selected_size = $size;
                    break;
                }
            }
            if (!$selected_size) {
                throw new Exception(__('Invalid size selected', 'octo-print-designer'));
            }
    
            // Get design dimensions and variation image
            $design_details = $this->get_design_details($design, $template_variations, $variation_id);
            if (!$design_details) {
                throw new Exception(__('Unable to process design details', 'octo-print-designer'));
            }
    
            // Calculate price based on design dimensions
            $price = $this->calculate_design_price($design, $template_pricing_rules, $template_variations, $variation_id);
            if ($price === false) {
                throw new Exception(__('Unable to calculate price', 'octo-print-designer'));
            }
    
            // Get all design images for this variation
            $design_images = $this->get_all_design_images($design, $variation_id, $template_variations);
    
            $product_images_json = $design->product_images;
            $product_images = json_decode($product_images_json, true) ?: [];

            // Add to cart with enhanced data
            $cart_item_data = array(
                'print_design' => array(
                    'design_id' => $design_id,
                    'name' => $design->name,
                    'template_id' => $design->template_id,
                    'variation_id' => $variation_id,
                    'variation_name' => sanitize_text_field($variation['name']),
                    'variation_color' => sanitize_hex_color($variation['color_code']),
                    'size_id' => $size_id,
                    'size_name' => sanitize_text_field($selected_size['name']),
                    'calculated_price' => $price,
                    'preview_url' => $this->get_preview_url($design->product_images),
                    // Store largest dimensions for price calculation reference
                    'design_width_cm' => $design_details['width_cm'],
                    'design_height_cm' => $design_details['height_cm'],
                    // For backward compatibility
                    'design_scaleX' => $design_details['scaleX'],
                    'design_scaleY' => $design_details['scaleY'],
                    'design_image_url' => $design_details['image_url'],
                    // New field with all images
                    'design_images' => $design_images,
                    // Add product images with view information
                    'product_images' => $product_images,
                    // Flag for multiple images support
                    'has_multiple_images' => count($design_images) > 0
                ),
                'unique_key' => md5(microtime() . $design_id . $variation_id . $size_id)
            );
    
            $result = WC()->cart->add_to_cart($base_product_id, 1, 0, array(), $cart_item_data);
    
            if ($result === false) {
                throw new Exception(__('Failed to add item to cart', 'octo-print-designer'));
            }
    
            wp_send_json_success(array(
                'message' => __('Added to cart successfully', 'octo-print-designer'),
                'cart_url' => wc_get_cart_url(),
                'redirect_to_cart' => true
            ));
    
        } catch (Exception $e) {
            wp_send_json_error(array(
                'message' => $e->getMessage()
            ));
        }
    }

    private function get_design_details($design, $template_variations, $variation_id) {
        try {
            $design_data = json_decode($design->design_data, true);
            if (!isset($design_data['variationImages'])) {
                return false;
            }
    
            // Initialize max dimensions
            $max_width = 0;
            $max_height = 0;
            $scale_x = 1;
            $scale_y = 1;
            $image_url = null;
    
            // Process each view's dimensions for the selected variation
            foreach ($design_data['variationImages'] as $key => $image_data) {
                // Only process views for the selected variation
                if (strpos($key, $variation_id . '_') !== 0) {
                    continue;
                }
    
                // Extract view ID from the key
                $parts = explode('_', $key);
                $view_id = $parts[1];
    
                // Get view settings
                $view = isset($template_variations[$variation_id]['views'][$view_id]) ? 
                       $template_variations[$variation_id]['views'][$view_id] : null;
                
                if (!$view) continue;
                
                // Get safe zone dimensions
                $safe_zone_width = isset($view['safeZone']['width']) ? $view['safeZone']['width'] : 800;
                $safe_zone_height = isset($view['safeZone']['height']) ? $view['safeZone']['height'] : 500;
                
                // Handle both old (object) and new (array) formats
                $images = is_array($image_data) ? $image_data : array($image_data);
                
                // Process each image in this view
                foreach ($images as $img) {
                    if (!isset($img['transform'])) continue;
                    
                    // Calculate dimensions considering scaling
                    $width = (isset($img['transform']['width']) ? $img['transform']['width'] : 1) * 
                             (isset($img['transform']['scaleX']) ? $img['transform']['scaleX'] : 1);
                    $height = (isset($img['transform']['height']) ? $img['transform']['height'] : 1) * 
                              (isset($img['transform']['scaleY']) ? $img['transform']['scaleY'] : 1);
                    
                    // Constrain to safe zone dimensions
                    $width = min($width, $safe_zone_width);
                    $height = min($height, $safe_zone_height);
                    
                    // Update max dimensions
                    if ($width > $max_width) {
                        $max_width = $width;
                        $scale_x = isset($img['transform']['scaleX']) ? $img['transform']['scaleX'] : 1;
                    }
                    
                    if ($height > $max_height) {
                        $max_height = $height;
                        $scale_y = isset($img['transform']['scaleY']) ? $img['transform']['scaleY'] : 1;
                    }
                    
                    // Store first image URL if not set yet (for preview purposes)
                    if (!$image_url && isset($img['url'])) {
                        $image_url = $img['url'];
                    }
                }
            }
    
            // Get physical dimensions from template
            $template_id = $design->template_id;
            $physical_width_cm = get_post_meta($template_id, '_template_physical_width_cm', true);
            $physical_height_cm = get_post_meta($template_id, '_template_physical_height_cm', true);
            
            if (empty($physical_width_cm)) $physical_width_cm = 30; // Default 30cm
            if (empty($physical_height_cm)) $physical_height_cm = 40; // Default 40cm
            
            // Get max safe zone dimensions across all views for this variation
            $max_safe_width = 800; // Default
            $max_safe_height = 500; // Default
            
            if (isset($template_variations[$variation_id]['views'])) {
                foreach ($template_variations[$variation_id]['views'] as $view) {
                    if (isset($view['safeZone']['width']) && $view['safeZone']['width'] > $max_safe_width) {
                        $max_safe_width = $view['safeZone']['width'];
                    }
                    if (isset($view['safeZone']['height']) && $view['safeZone']['height'] > $max_safe_height) {
                        $max_safe_height = $view['safeZone']['height'];
                    }
                }
            }
            
            // Calculate proportional dimensions
            $width_cm = round(($max_width / $max_safe_width) * $physical_width_cm, 2);
            $height_cm = round(($max_height / $max_safe_height) * $physical_height_cm, 2);
    
            return array(
                'width_cm' => $width_cm,
                'height_cm' => $height_cm,
                'image_url' => esc_url($image_url),
                'scaleX' => $scale_x,
                'scaleY' => $scale_y
            );
    
        } catch (Exception $e) {
            error_log('Error calculating design details: ' . $e->getMessage());
            return false;
        }
    }
    
    private function get_preview_url($product_images) {
        if (empty($product_images)) {
            return null;
        }
    
        $images = json_decode($product_images, true);
        if (!is_array($images) || empty($images)) {
            return null;
        }
    
        // Get the first image URL
        return isset($images[0]['url']) ? esc_url($images[0]['url']) : null;
    }

    private function calculate_design_price($design, $pricing_rules, $template_variations, $variation_id) {
        try {
            $design_data = json_decode($design->design_data, true);
            if (!isset($design_data['variationImages'])) {
                return false;
            }
    
            // Initialize max dimensions
            $max_width = 0;
            $max_height = 0;
    
            // Process each view's dimensions for the selected variation
            foreach ($design_data['variationImages'] as $key => $image_data) {
                // Only process views for the selected variation
                if (strpos($key, $variation_id . '_') !== 0) {
                    continue;
                }
    
                // Extract view ID from the key
                $parts = explode('_', $key);
                $view_id = $parts[1];
    
                // Get view settings
                $view = isset($template_variations[$variation_id]['views'][$view_id]) ? 
                       $template_variations[$variation_id]['views'][$view_id] : null;
                
                if (!$view) continue;
                
                // Get safe zone dimensions
                $safe_zone_width = isset($view['safeZone']['width']) ? $view['safeZone']['width'] : 800;
                $safe_zone_height = isset($view['safeZone']['height']) ? $view['safeZone']['height'] : 500;
                
                // Handle both old (object) and new (array) formats
                $images = is_array($image_data) ? $image_data : array($image_data);
                
                // Process each image in this view
                foreach ($images as $img) {
                    if (!isset($img['transform'])) continue;
                    
                    // Calculate dimensions considering scaling
                    $width = (isset($img['transform']['width']) ? $img['transform']['width'] : 1) * 
                             (isset($img['transform']['scaleX']) ? $img['transform']['scaleX'] : 1);
                    $height = (isset($img['transform']['height']) ? $img['transform']['height'] : 1) * 
                              (isset($img['transform']['scaleY']) ? $img['transform']['scaleY'] : 1);
                    
                    // Constrain to safe zone dimensions
                    $width = min($width, $safe_zone_width);
                    $height = min($height, $safe_zone_height);
                    
                    // Update max dimensions
                    $max_width = max($max_width, $width);
                    $max_height = max($max_height, $height);
                }
            }
    
            // Get physical dimensions from template
            $template_id = $design->template_id;
            $physical_width_cm = get_post_meta($template_id, '_template_physical_width_cm', true);
            $physical_height_cm = get_post_meta($template_id, '_template_physical_height_cm', true);
            
            if (empty($physical_width_cm)) $physical_width_cm = 30; // Default 30cm
            if (empty($physical_height_cm)) $physical_height_cm = 40; // Default 40cm
            
            // Get max safe zone dimensions across all views for this variation
            $max_safe_width = 800; // Default
            $max_safe_height = 500; // Default
            
            if (isset($template_variations[$variation_id]['views'])) {
                foreach ($template_variations[$variation_id]['views'] as $view) {
                    if (isset($view['safeZone']['width']) && $view['safeZone']['width'] > $max_safe_width) {
                        $max_safe_width = $view['safeZone']['width'];
                    }
                    if (isset($view['safeZone']['height']) && $view['safeZone']['height'] > $max_safe_height) {
                        $max_safe_height = $view['safeZone']['height'];
                    }
                }
            }
            
            // Calculate proportional dimensions
            $width_cm = ($max_width / $max_safe_width) * $physical_width_cm;
            $height_cm = ($max_height / $max_safe_height) * $physical_height_cm;
    
            // Sort rules by size
            usort($pricing_rules, function($a, $b) {
                return ($a['width'] * $a['height']) - ($b['width'] * $b['height']);
            });
    
            // Find applicable price
            foreach ($pricing_rules as $rule) {
                if ($width_cm <= $rule['width'] && $height_cm <= $rule['height']) {
                    return floatval($rule['price']);
                }
            }
    
            // If no rule matches, use the largest rule's price
            if (!empty($pricing_rules)) {
                $largest_rule = end($pricing_rules);
                return floatval($largest_rule['price']);
            }
    
            return false;
    
        } catch (Exception $e) {
            error_log('Error calculating design price: ' . $e->getMessage());
            return false;
        }
    }

    /**
     * Get all design images from design data for a specific variation
     * 
     * @param object $design The design object from database
     * @param string $variation_id The variation ID
     * @param array $template_variations Template variations data
     * @return array Array of image data
     */
    private function get_all_design_images($design, $variation_id, $template_variations) {
        $design_images = [];
        $design_data = json_decode($design->design_data, true);
        
        if (!isset($design_data['variationImages'])) {
            return $design_images;
        }
        
        foreach ($design_data['variationImages'] as $key => $image_data) {
            // Only include images for the selected variation
            if (strpos($key, $variation_id . '_') === 0) {
                // Handle both old (object) and new (array) formats
                $images = is_array($image_data) ? $image_data : array($image_data);
                
                foreach ($images as $img) {
                    if (isset($img['url']) && isset($img['transform'])) {
                        // Extract view ID from the key
                        $parts = explode('_', $key);
                        $view_id = $parts[1] ?? null;
                        
                        // Get safe zone dimensions
                        $safe_zone_width = 800; // Default
                        $safe_zone_height = 500; // Default
                        
                        if ($view_id && isset($template_variations[$variation_id]['views'][$view_id]['safeZone'])) {
                            $safe_zone = $template_variations[$variation_id]['views'][$view_id]['safeZone'];
                            $safe_zone_width = $safe_zone['width'] ?? 800;
                            $safe_zone_height = $safe_zone['height'] ?? 500;
                        }
                        
                        // Get physical dimensions from template
                        $physical_width_cm = get_post_meta($design->template_id, '_template_physical_width_cm', true) ?: 30;
                        $physical_height_cm = get_post_meta($design->template_id, '_template_physical_height_cm', true) ?: 40;
                        
                        // Calculate individual image dimensions
                        $width = min(($img['transform']['width'] ?? 200) * ($img['transform']['scaleX'] ?? 1), $safe_zone_width);
                        $height = min(($img['transform']['height'] ?? 200) * ($img['transform']['scaleY'] ?? 1), $safe_zone_height);
                        
                        $width_cm = round(($width / $safe_zone_width) * $physical_width_cm, 2);
                        $height_cm = round(($height / $safe_zone_height) * $physical_height_cm, 2);
                        
                        // Add image data to the array
                        $design_images[] = array(
                            'url' => $img['url'],
                            'view_id' => $view_id,
                            'view_name' => isset($template_variations[$variation_id]['views'][$view_id]['name']) ? 
                                $template_variations[$variation_id]['views'][$view_id]['name'] : __('View', 'octo-print-designer'),
                            'transform' => $img['transform'],
                            'scaleX' => $img['transform']['scaleX'] ?? 1,
                            'scaleY' => $img['transform']['scaleY'] ?? 1,
                            'width_cm' => $width_cm,
                            'height_cm' => $height_cm,
                            'visible' => $img['visible'] ?? true
                        );
                    }
                }
            }
        }
        
        return $design_images;
    }

}