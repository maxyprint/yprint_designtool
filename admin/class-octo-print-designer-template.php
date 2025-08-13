<?php
/**
 * Class responsible for registering and managing the Design Template CPT
 */
class Octo_Print_Designer_Template {
    
    /**
     * Register the custom post type and taxonomies
     */
    public function register_post_type() {
        register_post_type('design_template', array(
            'labels' => array(
                'name'               => __('Design Templates', 'octo-print-designer'),
                'singular_name'      => __('Design Template', 'octo-print-designer'),
                'add_new'           => __('Add New Template', 'octo-print-designer'),
                'add_new_item'      => __('Add New Design Template', 'octo-print-designer'),
                'edit_item'         => __('Edit Design Template', 'octo-print-designer'),
                'new_item'          => __('New Design Template', 'octo-print-designer'),
                'view_item'         => __('View Design Template', 'octo-print-designer'),
                'search_items'      => __('Search Design Templates', 'octo-print-designer'),
                'not_found'         => __('No design templates found', 'octo-print-designer'),
                'not_found_in_trash'=> __('No design templates found in Trash', 'octo-print-designer')
            ),
            'public'              => false,
            'show_ui'             => true,
            'show_in_menu'        => true,
            'menu_icon'           => 'dashicons-art',
            'capability_type'     => 'post',
            'hierarchical'        => false,
            'supports'            => array('title', 'thumbnail'),
            'show_in_rest'        => true,
            'rest_base'           => 'design-templates',
            'menu_position'       => 20,
        ));

        register_taxonomy('template_category', 'design_template', array(
            'labels' => array(
                'name'              => __('Template Categories', 'octo-print-designer'),
                'singular_name'     => __('Template Category', 'octo-print-designer'),
                'search_items'      => __('Search Categories', 'octo-print-designer'),
                'all_items'         => __('All Categories', 'octo-print-designer'),
                'edit_item'         => __('Edit Category', 'octo-print-designer'),
                'update_item'       => __('Update Category', 'octo-print-designer'),
                'add_new_item'      => __('Add New Category', 'octo-print-designer'),
                'new_item_name'     => __('New Category Name', 'octo-print-designer'),
                'menu_name'         => __('Categories', 'octo-print-designer')
            ),
            'hierarchical'        => true,
            'show_ui'             => true,
            'show_admin_column'   => true,
            'query_var'           => true,
            'rewrite'            => array('slug' => 'template-category'),
            'show_in_rest'        => true
        ));
    }

    /**
     * Register meta boxes for the design template
     */
    public function add_meta_boxes() {
        // Remove old views meta box
        add_meta_box(
            'template_sizes',
            __('Template Sizes', 'octo-print-designer'),
            array($this, 'render_sizes_meta_box'),
            'design_template',
            'normal',
            'high'
        );

        add_meta_box(
            'template_variations',
            __('Template Variations', 'octo-print-designer'),
            array($this, 'render_variations_meta_box'),
            'design_template',
            'normal',
            'high'
        );

        add_meta_box(
            'template_inventory',
            __('Template Inventory', 'octo-print-designer'),
            array($this, 'render_inventory_meta_box'),
            'design_template',
            'normal',
            'high'
        );
        
        add_meta_box(
            'template_physical_dimensions',
            __('Template Physical Dimensions', 'octo-print-designer'),
            array($this, 'render_physical_dimensions_meta_box'),
            'design_template',
            'normal',
            'high'
        );

        add_meta_box(
            'template_pricing',
            __('Template Pricing', 'octo-print-designer'),
            array($this, 'render_pricing_meta_box'),
            'design_template',
            'normal',
            'high'
        );
    }

    /**
     * Render the sizes meta box
     */
    public function render_sizes_meta_box($post) {
        wp_nonce_field('save_template_sizes', 'template_sizes_nonce');
        $sizes = get_post_meta($post->ID, '_template_sizes', true);
        if (!is_array($sizes)) {
            $sizes = array();
        }
        ?>
        <div id="template-sizes-container" class="template-sizes-wrapper">
            <div class="sizes-list">
                <?php foreach ($sizes as $index => $size): ?>
                <div class="size-item" data-index="<?php echo esc_attr($index); ?>">
                    <input type="text" 
                           name="sizes[<?php echo esc_attr($index); ?>][id]" 
                           value="<?php echo esc_attr($size['id']); ?>" 
                           placeholder="<?php esc_attr_e('Size ID (e.g., S, M, L)', 'octo-print-designer'); ?>"
                           pattern="[A-Za-z0-9_-]+"
                           required>
                    <input type="text" 
                           name="sizes[<?php echo esc_attr($index); ?>][name]" 
                           value="<?php echo esc_attr($size['name']); ?>" 
                           placeholder="<?php esc_attr_e('Size Name', 'octo-print-designer'); ?>"
                           required>
                    <input type="number" 
                           name="sizes[<?php echo esc_attr($index); ?>][order]" 
                           value="<?php echo esc_attr($size['order']); ?>" 
                           class="small-text"
                           min="0">
                    <button type="button" class="button remove-size">
                        <?php esc_html_e('Remove', 'octo-print-designer'); ?>
                    </button>
                </div>
                <?php endforeach; ?>
            </div>
            <button type="button" class="button add-size">
                <?php esc_html_e('Add Size', 'octo-print-designer'); ?>
            </button>
        </div>
        <?php
    }

    /**
     * Render the variations meta box
     */
    public function render_variations_meta_box($post) {

        wp_nonce_field('save_template_variations', 'template_variations_nonce');
        
        // Create default variation if none exists
        // $variations = array(
        //     array(
        //         'id' => 'default',
        //         'name' => __('Default', 'octo-print-designer'),
        //         'is_default' => true,
        //         'color_code' => '#FFFFFF',
        //         'available_sizes' => array(),
        //         'views' => array()
        //     )
        // );
        ?>

        <div id="template-variations-container" class="template-variations-wrapper">
            <div class="variations-tabs">
                <div class="tabs-list">
                    <button type="button" class="add-variation">
                        <span class="dashicons dashicons-plus"></span>
                    </button>
                </div>
                <div class="tabs-content">
                </div>
            </div>
        </div>
        
        <?php require_once OCTO_PRINT_DESIGNER_PATH . 'admin/partials/template-designer/variation-tab-button-template.php'; ?>
        <?php require_once OCTO_PRINT_DESIGNER_PATH . 'admin/partials/template-designer/variation-item-template.php'; ?>
        <?php require_once OCTO_PRINT_DESIGNER_PATH . 'admin/partials/template-designer/variation-size-item-template.php'; ?>
        <?php require_once OCTO_PRINT_DESIGNER_PATH . 'admin/partials/template-designer/view-item-template.php'; ?>

        <?php
    }

    /**
     * Render the inventory meta box
     * 
     * @param WP_Post $post The post object
     */
    public function render_inventory_meta_box($post) {
        wp_nonce_field('save_template_inventory', 'template_inventory_nonce');
        
        // Get current stock status
        $in_stock = get_post_meta($post->ID, '_template_in_stock', true);
        
        ?>
        <div id="template-inventory-container" class="template-inventory-wrapper">
            <label class="inventory-status">
                <input type="checkbox" 
                    name="template_in_stock" 
                    value="1" 
                    <?php checked($in_stock, '1'); ?>
                />
                <?php esc_html_e('Product is in stock', 'octo-print-designer'); ?>
            </label>
            <p class="description">
                <?php esc_html_e('Check this box if this template is currently in stock. This will affect the stock status display for all designs using this template.', 'octo-print-designer'); ?>
            </p>
        </div>
        <?php
    }

    /**
     * Save the template inventory data
     * 
     * @param int $post_id The post ID
     */
    private function save_inventory_meta($post_id) {
        // Verify nonce
        if (!isset($_POST['template_inventory_nonce']) || 
            !wp_verify_nonce($_POST['template_inventory_nonce'], 'save_template_inventory')) {
            return;
        }

        // Update stock status
        $in_stock = isset($_POST['template_in_stock']) ? '1' : '0';
        update_post_meta($post_id, '_template_in_stock', sanitize_text_field($in_stock));
    }

    /**
     * Render variation views
     */
    private function render_variation_views($views, $variation_index) {
        ?>
        
        <?php
    }

    /**
     * Save the template data
     */
    public function save_post($post_id) {
        if (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE) {
            return;
        }

        if (!current_user_can('edit_post', $post_id)) {
            return;
        }

        // Save sizes
        if (isset($_POST['template_sizes_nonce']) && 
            wp_verify_nonce($_POST['template_sizes_nonce'], 'save_template_sizes')) {
            
            $sizes = isset($_POST['sizes']) ? $this->sanitize_sizes($_POST['sizes']) : array();
            update_post_meta($post_id, '_template_sizes', $sizes);
        }

        // Save variations
        if (isset($_POST['template_variations_nonce']) && 
            wp_verify_nonce($_POST['template_variations_nonce'], 'save_template_variations')) {
            
            $variations = isset($_POST['variations']) ? $this->sanitize_variations($_POST['variations']) : array();
            update_post_meta($post_id, '_template_variations', $variations);
        }
        
        // Save physical dimensions
        if (isset($_POST['template_physical_dimensions_nonce']) && 
            wp_verify_nonce($_POST['template_physical_dimensions_nonce'], 'save_template_physical_dimensions')) {
            
            // Legacy-Support
            if (isset($_POST['physical_width_cm'])) {
                update_post_meta($post_id, '_template_physical_width_cm', sanitize_text_field($_POST['physical_width_cm']));
            }
            if (isset($_POST['physical_height_cm'])) {
                update_post_meta($post_id, '_template_physical_height_cm', sanitize_text_field($_POST['physical_height_cm']));
            }

            // Produkt-Dimensionen pro Größe
            if (isset($_POST['product_dimensions']) && is_array($_POST['product_dimensions'])) {
                $product_dimensions = array();
                $measurement_keys = array_keys($this->get_measurement_labels());
                
                foreach ($_POST['product_dimensions'] as $size_id => $config) {
                    $product_dimensions[sanitize_text_field($size_id)] = array();
                    
                    // Speichere alle verfügbaren Messungen
                    foreach ($measurement_keys as $measurement_key) {
                        if (isset($config[$measurement_key])) {
                            $product_dimensions[sanitize_text_field($size_id)][$measurement_key] = floatval($config[$measurement_key]);
                        }
                    }
                }
                
                update_post_meta($post_id, '_template_product_dimensions', $product_dimensions);
            }

            // View-spezifische Konfigurationen
            if (isset($_POST['view_print_areas']) && is_array($_POST['view_print_areas'])) {
                $view_print_areas = array();
                
                foreach ($_POST['view_print_areas'] as $view_id => $config) {
                    $view_print_areas[sanitize_text_field($view_id)] = array(
                        'canvas_width' => intval($config['canvas_width'] ?? 0),
                        'canvas_height' => intval($config['canvas_height'] ?? 0),
                        'photo_width_px' => intval($config['photo_width_px'] ?? 0),
                        'photo_height_px' => intval($config['photo_height_px'] ?? 0)
                    );
                }
                
                update_post_meta($post_id, '_template_view_print_areas', $view_print_areas);
            }
        }
        
        $this->save_inventory_meta($post_id);
        $this->save_pricing_meta($post_id);
    }

    public function get_variations() {

        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_print_designer_nonce')) {
            wp_send_json_error('Invalid nonce');
        }

        // Verify post ID
        $post_id = isset($_POST['post_id']) ? absint($_POST['post_id']) : 0;
        if (!$post_id || !current_user_can('edit_post', $post_id)) {
            wp_send_json_error('Invalid post ID or insufficient permissions');
        }

        // Get variations from post meta
        $variations = get_post_meta($post_id, '_template_variations', true);
        
        if (!is_array($variations)) {
            $variations = array();
        }

        wp_send_json_success($variations);
    }

    public function get_sizes() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_print_designer_nonce')) {
            wp_send_json_error('Invalid nonce');
        }

        // Verify post ID
        $post_id = isset($_POST['post_id']) ? absint($_POST['post_id']) : 0;
        if (!$post_id || !current_user_can('edit_post', $post_id)) {
            wp_send_json_error('Invalid post ID or insufficient permissions');
        }

        // Get sizes from post meta
        $sizes = get_post_meta($post_id, '_template_sizes', true);
        
        if (!is_array($sizes)) {
            $sizes = array();
        }

        wp_send_json_success($sizes);
    }

    /**
     * Sanitize the sizes data
     */
    private function sanitize_sizes($sizes) {
        if (!is_array($sizes)) {
            return array();
        }

        $sanitized = array();
        foreach ($sizes as $size) {
            if (!isset($size['id'], $size['name'])) {
                continue;
            }

            $sanitized[] = array(
                'id' => sanitize_key($size['id']),
                'name' => sanitize_text_field($size['name']),
                'order' => absint($size['order'])
            );
        }

        // Sort by order
        usort($sanitized, function($a, $b) {
            return $a['order'] - $b['order'];
        });

        return $sanitized;
    }

    /**
     * Sanitize the variations data
     */
    private function sanitize_variations($variations) {

        if (!is_array($variations)) return array();
    
        $sanitized = array();
        foreach ($variations as $variation_id => $variation) {

            if (!isset($variation['name'])) continue;
    
            $sanitized_variation = array(
                'id' => sanitize_key($variation_id),
                'name' => sanitize_text_field($variation['name']),
                'is_default' => $variation['is_default'] == 1,
                'is_dark_shirt' => isset($variation['is_dark_shirt']) && $variation['is_dark_shirt'] == 1,
                'color_code' => sanitize_hex_color($variation['color_code']),
                'available_sizes' => isset($variation['available_sizes']) ? 
                    array_map('sanitize_key', $variation['available_sizes']) : 
                    array()
            );
    
            // Sanitize views
            if (isset($variation['views']) && is_array($variation['views'])) {
                $sanitized_variation['views'] = array();
                foreach ($variation['views'] as $view_id => $view) {
                    $sanitized_view = array(
                        'id' => sanitize_key($view_id),
                        'name' => sanitize_text_field($view['name']),
                        'image' => absint($view['image']),
                        'use_default' => $view['use_default'] == 1
                    );
    
                    // Sanitize image zone

                    if (isset($view['image_zone'])) {
                        $imageZone = json_decode(stripslashes($view['image_zone']), true);
                        $sanitized_view['imageZone'] = array(
                            'left' => floatval($imageZone['left']),
                            'top' => floatval($imageZone['top']),
                            'scaleX' => floatval($imageZone['scaleX']),
                            'scaleY' => floatval($imageZone['scaleY']),
                            'angle' => floatval($imageZone['angle'])
                        );
                    }
    
                    // Sanitize safe zone
                    if (isset($view['safe_zone'])) {
                        $safeZone = json_decode(stripslashes($view['safe_zone']), true);
                        $sanitized_view['safeZone'] = array(
                            'left' => floatval($safeZone['left']),
                            'top' => floatval($safeZone['top']),
                            'width' => floatval($safeZone['width']),
                            'height' => floatval($safeZone['height'])
                        );
                    }
    
                    // Sanitize overlay settings
                    $sanitized_view['colorOverlayEnabled'] = $view['colorOverlayEnabled'] == 1;
                    if (isset($view['overlay_opacity'])) $sanitized_view['overlayOpacity'] = floatval($view['overlay_opacity']);
    
                    $sanitized_variation['views'][$view_id] = $sanitized_view;
                }
            }
    
            $sanitized[$variation_id] = $sanitized_variation;
        }
    
        return $sanitized;
    }

    /**
     * Render the pricing meta box
     */
    public function render_pricing_meta_box($post) {
        wp_nonce_field('save_template_pricing', 'template_pricing_nonce');
        $pricing_rules = get_post_meta($post->ID, '_template_pricing_rules', true);
        if (!is_array($pricing_rules)) {
            $pricing_rules = array();
        }
        ?>
        <div id="template-pricing-container" class="template-pricing-wrapper">
            <table class="widefat template-pricing-table">
                <thead>
                    <tr>
                        <th><?php esc_html_e('Rule Name', 'octo-print-designer'); ?></th>
                        <th><?php esc_html_e('Width (cm)', 'octo-print-designer'); ?></th>
                        <th><?php esc_html_e('Height (cm)', 'octo-print-designer'); ?></th>
                        <th><?php esc_html_e('Price', 'octo-print-designer'); ?></th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    <?php foreach ($pricing_rules as $index => $rule): ?>
                    <tr class="pricing-rule-row">
                        <td>
                            <input type="text" 
                                   name="pricing_rules[<?php echo esc_attr($index); ?>][name]" 
                                   value="<?php echo esc_attr($rule['name']); ?>" 
                                   class="regular-text"
                                   required>
                        </td>
                        <td>
                            <input type="number" 
                                   name="pricing_rules[<?php echo esc_attr($index); ?>][width]" 
                                   value="<?php echo esc_attr($rule['width']); ?>" 
                                   class="small-text"
                                   step="0.1"
                                   min="0"
                                   required>
                        </td>
                        <td>
                            <input type="number" 
                                   name="pricing_rules[<?php echo esc_attr($index); ?>][height]" 
                                   value="<?php echo esc_attr($rule['height']); ?>" 
                                   class="small-text"
                                   step="0.1"
                                   min="0"
                                   required>
                        </td>
                        <td>
                            <input type="number" 
                                   name="pricing_rules[<?php echo esc_attr($index); ?>][price]" 
                                   value="<?php echo esc_attr($rule['price']); ?>" 
                                   class="small-text"
                                   step="0.01"
                                   min="0"
                                   required>
                        </td>
                        <td>
                            <button type="button" class="button remove-pricing-rule">
                                <?php esc_html_e('Remove', 'octo-print-designer'); ?>
                            </button>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </tbody>
            </table>
            <button type="button" class="button add-pricing-rule">
                <?php esc_html_e('Add Pricing Rule', 'octo-print-designer'); ?>
            </button>
        </div>

        <template id="pricing-rule-template">
            <tr class="pricing-rule-row">
                <td>
                    <input type="text" name="pricing_rules[{index}][name]" class="regular-text" required>
                </td>
                <td>
                    <input type="number" name="pricing_rules[{index}][width]" class="small-text" step="0.1" min="0" required>
                </td>
                <td>
                    <input type="number" name="pricing_rules[{index}][height]" class="small-text" step="0.1" min="0" required>
                </td>
                <td>
                    <input type="number" name="pricing_rules[{index}][price]" class="small-text" step="0.01" min="0" required>
                </td>
                <td>
                    <button type="button" class="button remove-pricing-rule"><?php esc_html_e('Remove', 'octo-print-designer'); ?></button>
                </td>
            </tr>
        </template>
        <?php
    }

    /**
     * Save the template pricing data
     */
    private function save_pricing_meta($post_id) {
        // Verify nonce
        if (!isset($_POST['template_pricing_nonce']) || 
            !wp_verify_nonce($_POST['template_pricing_nonce'], 'save_template_pricing')) {
            return;
        }
    
        // Get and sanitize pricing rules
        $pricing_rules = isset($_POST['pricing_rules']) ? $this->sanitize_pricing_rules($_POST['pricing_rules']) : array();
        
        // Save pricing rules
        update_post_meta($post_id, '_template_pricing_rules', $pricing_rules);
    }

    /**
     * Sanitize the pricing rules data
     */
    private function sanitize_pricing_rules($rules) {
        if (!is_array($rules)) {
            return array();
        }

        $sanitized = array();
        foreach ($rules as $rule) {
            if (!isset($rule['name'], $rule['width'], $rule['height'], $rule['price'])) {
                continue;
            }

            $sanitized[] = array(
                'name' => sanitize_text_field($rule['name']),
                'width' => (float) $rule['width'],
                'height' => (float) $rule['height'],
                'price' => (float) $rule['price']
            );
        }

        return $sanitized;
    }

    /**
     * Get default product dimensions based on size
     */
    private function get_default_product_dimensions_by_size($size_id) {
        $size_id_lower = strtolower($size_id);
        
        // Standard-Produktabmessungen basierend auf Größe (T-Shirt Beispiel)
        $dimensions = array(
            'xs' => array(
                'chest' => 44, 'hem_width' => 40, 'height_from_shoulder' => 62, 
                'sleeve_length' => 24.5, 'sleeve_opening' => 17, 'shoulder_to_shoulder' => 50.5,
                'neck_opening' => 18, 'biceps' => 22.5, 'rib_height' => 2
            ),
            's' => array(
                'chest' => 47, 'hem_width' => 43, 'height_from_shoulder' => 65, 
                'sleeve_length' => 25, 'sleeve_opening' => 17.5, 'shoulder_to_shoulder' => 52,
                'neck_opening' => 18.5, 'biceps' => 23, 'rib_height' => 2
            ),
            'm' => array(
                'chest' => 50, 'hem_width' => 46, 'height_from_shoulder' => 68, 
                'sleeve_length' => 25.5, 'sleeve_opening' => 18, 'shoulder_to_shoulder' => 53.5,
                'neck_opening' => 19, 'biceps' => 23.5, 'rib_height' => 2
            ),
            'l' => array(
                'chest' => 53, 'hem_width' => 49, 'height_from_shoulder' => 71, 
                'sleeve_length' => 26, 'sleeve_opening' => 18.5, 'shoulder_to_shoulder' => 55,
                'neck_opening' => 19.5, 'biceps' => 24, 'rib_height' => 2
            ),
            'xl' => array(
                'chest' => 56, 'hem_width' => 52, 'height_from_shoulder' => 74, 
                'sleeve_length' => 26.5, 'sleeve_opening' => 19, 'shoulder_to_shoulder' => 56.5,
                'neck_opening' => 20, 'biceps' => 24.5, 'rib_height' => 2
            ),
            'xxl' => array(
                'chest' => 59, 'hem_width' => 55, 'height_from_shoulder' => 77, 
                'sleeve_length' => 27, 'sleeve_opening' => 19.5, 'shoulder_to_shoulder' => 58,
                'neck_opening' => 20.5, 'biceps' => 25, 'rib_height' => 2
            ),
            '3xl' => array(
                'chest' => 62, 'hem_width' => 58, 'height_from_shoulder' => 80, 
                'sleeve_length' => 27.5, 'sleeve_opening' => 20, 'shoulder_to_shoulder' => 59.5,
                'neck_opening' => 21, 'biceps' => 25.5, 'rib_height' => 2
            ),
            '4xl' => array(
                'chest' => 65, 'hem_width' => 61, 'height_from_shoulder' => 83, 
                'sleeve_length' => 28, 'sleeve_opening' => 20.5, 'shoulder_to_shoulder' => 61,
                'neck_opening' => 21.5, 'biceps' => 26, 'rib_height' => 2
            ),
        );
        
        return $dimensions[$size_id_lower] ?? array(
            'chest' => 50, 'hem_width' => 46, 'height_from_shoulder' => 68, 
            'sleeve_length' => 25.5, 'sleeve_opening' => 18, 'shoulder_to_shoulder' => 53.5,
            'neck_opening' => 19, 'biceps' => 23.5, 'rib_height' => 2
        );
    }

    /**
     * Get measurement labels for display
     */
    private function get_measurement_labels() {
        return array(
            'chest' => __('Chest', 'octo-print-designer'),
            'hem_width' => __('Hem Width', 'octo-print-designer'),
            'height_from_shoulder' => __('Height from Shoulder', 'octo-print-designer'),
            'sleeve_length' => __('Sleeve Length', 'octo-print-designer'),
            'sleeve_opening' => __('Sleeve Opening', 'octo-print-designer'),
            'shoulder_to_shoulder' => __('Shoulder to Shoulder', 'octo-print-designer'),
            'neck_opening' => __('Neck Opening', 'octo-print-designer'),
            'biceps' => __('Biceps', 'octo-print-designer'),
            'rib_height' => __('Rib Height', 'octo-print-designer')
        );
    }

    /**
     * Calculate print area dimensions based on product photo and detailed measurements
     */
    private function calculate_print_area_from_photo($product_width_px, $product_height_px, $size_measurements, $canvas_width, $canvas_height, $view_name = '') {
        // Bestimme die relevanten Messungen basierend auf View-Namen
        $view_name_lower = strtolower($view_name);
        
        if (strpos($view_name_lower, 'front') !== false || strpos($view_name_lower, 'back') !== false || 
            strpos($view_name_lower, 'vorne') !== false || strpos($view_name_lower, 'hinten') !== false) {
            // Front/Back View: Verwende Chest und Height from Shoulder
            $real_width_cm = $size_measurements['chest'] ?? 50;
            $real_height_cm = $size_measurements['height_from_shoulder'] ?? 68;
        } elseif (strpos($view_name_lower, 'sleeve') !== false || strpos($view_name_lower, 'ärmel') !== false ||
                   strpos($view_name_lower, 'left') !== false || strpos($view_name_lower, 'right') !== false ||
                   strpos($view_name_lower, 'links') !== false || strpos($view_name_lower, 'rechts') !== false) {
            // Sleeve View: Verwende Biceps und Sleeve Length
            $real_width_cm = $size_measurements['biceps'] ?? 24;
            $real_height_cm = $size_measurements['sleeve_length'] ?? 26;
        } else {
            // Default: Verwende Chest und Height from Shoulder
            $real_width_cm = $size_measurements['chest'] ?? 50;
            $real_height_cm = $size_measurements['height_from_shoulder'] ?? 68;
        }
        
        // Berechne Skalierungsfaktor (cm pro Pixel)
        $scale_x = $real_width_cm / $product_width_px;
        $scale_y = $real_height_cm / $product_height_px;
        
        // Verwende den kleineren Skalierungsfaktor für konsistente Berechnung
        $scale = min($scale_x, $scale_y);
        
        // Berechne Druckbereich basierend auf Canvas-Größe
        $print_width_mm = ($canvas_width * $scale) * 10; // Konvertiere zu mm
        $print_height_mm = ($canvas_height * $scale) * 10;
        
        return array(
            'print_width_mm' => round($print_width_mm, 1),
            'print_height_mm' => round($print_height_mm, 1),
            'scale_factor' => $scale,
            'used_measurements' => array(
                'width' => $real_width_cm,
                'height' => $real_height_cm
            )
        );
    }

    /**
     * Render the physical dimensions meta box
     */
    public function render_physical_dimensions_meta_box($post) {
        wp_nonce_field('save_template_physical_dimensions', 'template_physical_dimensions_nonce');
        
        // Lade Template-Daten
        $template_variations = get_post_meta($post->ID, '_template_variations', true);
        $template_sizes = get_post_meta($post->ID, '_template_sizes', true);
        $product_dimensions = get_post_meta($post->ID, '_template_product_dimensions', true);
        $view_print_areas = get_post_meta($post->ID, '_template_view_print_areas', true);
        
        if (!is_array($product_dimensions)) {
            $product_dimensions = array();
        }
        if (!is_array($view_print_areas)) {
            $view_print_areas = array();
        }
        
        ?>
        <div class="template-physical-dimensions-wrapper">
            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                <div style="flex: 1;">
                    <h3><?php esc_html_e('Automatic Print Area Calculation', 'octo-print-designer'); ?></h3>
                    <p class="description">
                        <?php esc_html_e('Configure real product dimensions for each size. The system will automatically calculate print areas based on your product photos.', 'octo-print-designer'); ?>
                    </p>
                </div>
                <div style="flex: 1; padding: 15px; background: #e7f3ff; border-left: 4px solid #2271b1; border-radius: 4px;">
                    <h4 style="margin-top: 0;"><?php esc_html_e('📸 How it works:', 'octo-print-designer'); ?></h4>
                    <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
                        <li><?php esc_html_e('1. Enter real product dimensions for each size', 'octo-print-designer'); ?></li>
                        <li><?php esc_html_e('2. Take photos where product fills the entire canvas', 'octo-print-designer'); ?></li>
                        <li><?php esc_html_e('3. System calculates print areas automatically', 'octo-print-designer'); ?></li>
                        <li><?php esc_html_e('4. Print areas scale proportionally for all sizes', 'octo-print-designer'); ?></li>
                    </ul>
                </div>
            </div>

            <!-- Produkt-Dimensionen pro Größe -->
            <?php if (is_array($template_sizes) && !empty($template_sizes)): ?>
                <div style="margin-bottom: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px; border: 1px solid #dee2e6;">
                    <h4 style="margin-top: 0; color: #495057;"><?php esc_html_e('📏 Detailed Product Measurements per Size', 'octo-print-designer'); ?></h4>
                    <p style="margin-bottom: 20px; font-size: 14px; color: #6c757d;">
                        <?php esc_html_e('Enter the detailed measurements for each size. These professional measurements will be used for accurate print area calculations.', 'octo-print-designer'); ?>
                    </p>
                    
                    <?php 
                    $measurement_labels = $this->get_measurement_labels();
                    $measurement_keys = array_keys($measurement_labels);
                    ?>
                    
                    <div style="overflow-x: auto;">
                        <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 6px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                            <thead>
                                <tr style="background: #007cba; color: white;">
                                    <th style="padding: 12px; text-align: left; font-weight: 600; min-width: 120px;"><?php esc_html_e('Measurement', 'octo-print-designer'); ?></th>
                                    <?php foreach ($template_sizes as $size): ?>
                                        <th style="padding: 12px; text-align: center; font-weight: 600; min-width: 80px;">
                                            <div style="display: flex; flex-direction: column; align-items: center; gap: 4px;">
                                                <div style="width: 30px; height: 30px; background: rgba(255,255,255,0.2); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 12px;">
                                                    <?php echo esc_html(strtoupper(substr($size['id'], 0, 1))); ?>
                                                </div>
                                                <span style="font-size: 11px;"><?php echo esc_html($size['name']); ?></span>
                                            </div>
                                        </th>
                                    <?php endforeach; ?>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($measurement_keys as $measurement_key): ?>
                                    <tr style="border-bottom: 1px solid #e0e0e0;">
                                        <td style="padding: 12px; font-weight: 600; background: #f8f9fa; color: #495057; font-size: 13px;">
                                            <?php echo esc_html($measurement_labels[$measurement_key]); ?>
                                        </td>
                                        <?php foreach ($template_sizes as $size): ?>
                                            <?php 
                                            $size_id = $size['id'];
                                            $size_config = $product_dimensions[$size_id] ?? array();
                                            $defaults = $this->get_default_product_dimensions_by_size($size_id);
                                            $value = $size_config[$measurement_key] ?? $defaults[$measurement_key] ?? 0;
                                            ?>
                                            <td style="padding: 8px; text-align: center;">
                                                <input type="number" 
                                                       name="product_dimensions[<?php echo esc_attr($size_id); ?>][<?php echo esc_attr($measurement_key); ?>]"
                                                       value="<?php echo esc_attr($value); ?>"
                                                       step="0.1" min="0" max="200" 
                                                       style="width: 60px; text-align: center; padding: 4px; border: 1px solid #ddd; border-radius: 3px; font-size: 12px;" />
                                                <span style="font-size: 10px; color: #666; display: block; margin-top: 2px;">cm</span>
                                            </td>
                                        <?php endforeach; ?>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                    
                    <div style="margin-top: 15px; padding: 10px; background: #e7f3ff; border-left: 4px solid #2271b1; border-radius: 4px;">
                        <p style="margin: 0; font-size: 12px; color: #0c5460;">
                            <strong><?php esc_html_e('💡 Tip:', 'octo-print-designer'); ?></strong>
                            <?php esc_html_e('These measurements are used to calculate print areas. For front/back views, use "Chest" and "Height from Shoulder". For sleeve views, use "Sleeve Length" and "Biceps".', 'octo-print-designer'); ?>
                        </p>
                    </div>
                </div>
            <?php endif; ?>

            <!-- View-spezifische Konfiguration -->
            <?php if (is_array($template_variations) && !empty($template_variations)): ?>
                <div style="margin-bottom: 30px;">
                    <h4 style="color: #495057;"><?php esc_html_e('🎯 View-Specific Configuration', 'octo-print-designer'); ?></h4>
                    <p style="margin-bottom: 20px; font-size: 14px; color: #6c757d;">
                        <?php esc_html_e('Configure canvas dimensions and photo measurements for each view. The system will calculate print areas automatically.', 'octo-print-designer'); ?>
                    </p>
                    
                    <div class="template-views-print-areas">
                        <?php 
                        // Sammle alle einzigartigen Views aus allen Variationen
                        $all_views = array();
                        foreach ($template_variations as $var_id => $variation) {
                            if (isset($variation['views'])) {
                                foreach ($variation['views'] as $view_id => $view) {
                                    $all_views[$view_id] = $view;
                                }
                            }
                        }
                        ?>

                        <?php foreach ($all_views as $view_id => $view): ?>
                            <?php 
                            $view_name = $view['name'] ?? __('View', 'octo-print-designer');
                            $view_config = $view_print_areas[$view_id] ?? array();
                            
                            $canvas_width = $view_config['canvas_width'] ?? 800;
                            $canvas_height = $view_config['canvas_height'] ?? 600;
                            $photo_width_px = $view_config['photo_width_px'] ?? 0;
                            $photo_height_px = $view_config['photo_height_px'] ?? 0;
                            ?>
                            
                            <div class="view-print-area-config" style="margin-bottom: 25px; padding: 20px; border: 1px solid #ddd; border-radius: 8px; background: #fafafa;">
                                <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 15px;">
                                    <div style="display: flex; align-items: center; gap: 10px;">
                                        <?php if (isset($view['mockup'])): ?>
                                            <img src="<?php echo esc_url($view['mockup']); ?>" 
                                                 style="width: 60px; height: 60px; object-fit: cover; border-radius: 4px; border: 1px solid #ddd;" 
                                                 alt="<?php echo esc_attr($view_name); ?>">
                                        <?php else: ?>
                                            <div style="width: 60px; height: 60px; background: #e0e0e0; border-radius: 4px; display: flex; align-items: center; justify-content: center; font-size: 12px; color: #666;">
                                                <?php echo esc_html(substr($view_name, 0, 2)); ?>
                                            </div>
                                        <?php endif; ?>
                                        <h4 style="margin: 0; font-size: 16px;"><?php echo esc_html($view_name); ?></h4>
                                    </div>
                                    <span style="font-size: 12px; color: #666; background: #fff; padding: 4px 8px; border-radius: 12px;">
                                        ID: <?php echo esc_html($view_id); ?>
                                    </span>
                                </div>

                                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
                                    <!-- Canvas-Dimensionen -->
                                    <div style="background: #fff; padding: 15px; border-radius: 6px; border: 1px solid #e0e0e0;">
                                        <h5 style="margin: 0 0 10px 0; color: #0f5132;"><?php esc_html_e('🖥️ Canvas (Digital)', 'octo-print-designer'); ?></h5>
                                        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                                            <div style="flex: 1;">
                                                <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 12px;">
                                                    <?php esc_html_e('Width (px)', 'octo-print-designer'); ?>
                                                </label>
                                                <input type="number" 
                                                       name="view_print_areas[<?php echo esc_attr($view_id); ?>][canvas_width]"
                                                       value="<?php echo esc_attr($canvas_width); ?>"
                                                       step="1" min="100" max="2000" 
                                                       class="regular-text" style="width: 100%;" />
                                            </div>
                                            <div style="flex: 1;">
                                                <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 12px;">
                                                    <?php esc_html_e('Height (px)', 'octo-print-designer'); ?>
                                                </label>
                                                <input type="number" 
                                                       name="view_print_areas[<?php echo esc_attr($view_id); ?>][canvas_height]"
                                                       value="<?php echo esc_attr($canvas_height); ?>"
                                                       step="1" min="100" max="2000" 
                                                       class="regular-text" style="width: 100%;" />
                                            </div>
                                        </div>
                                        <p style="margin: 0; font-size: 11px; color: #666;">
                                            <?php esc_html_e('Canvas pixel dimensions in the designer', 'octo-print-designer'); ?>
                                        </p>
                                    </div>

                                    <!-- Foto-Messungen -->
                                    <div style="background: #fff; padding: 15px; border-radius: 6px; border: 1px solid #e0e0e0;">
                                        <h5 style="margin: 0 0 10px 0; color: #d63384;"><?php esc_html_e('📸 Photo Measurements', 'octo-print-designer'); ?></h5>
                                        <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                                            <div style="flex: 1;">
                                                <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 12px;">
                                                    <?php esc_html_e('Product Width (px)', 'octo-print-designer'); ?>
                                                </label>
                                                <input type="number" 
                                                       name="view_print_areas[<?php echo esc_attr($view_id); ?>][photo_width_px]"
                                                       value="<?php echo esc_attr($photo_width_px); ?>"
                                                       step="1" min="0" max="2000" 
                                                       class="regular-text" style="width: 100%;" 
                                                       placeholder="e.g. 750" />
                                            </div>
                                            <div style="flex: 1;">
                                                <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 12px;">
                                                    <?php esc_html_e('Product Height (px)', 'octo-print-designer'); ?>
                                                </label>
                                                <input type="number" 
                                                       name="view_print_areas[<?php echo esc_attr($view_id); ?>][photo_height_px]"
                                                       value="<?php echo esc_attr($photo_height_px); ?>"
                                                       step="1" min="0" max="2000" 
                                                       class="regular-text" style="width: 100%;" 
                                                       placeholder="e.g. 600" />
                                            </div>
                                        </div>
                                        <p style="margin: 0; font-size: 11px; color: #666;">
                                            <?php esc_html_e('Pixel dimensions of product in the photo', 'octo-print-designer'); ?>
                                        </p>
                                    </div>
                                </div>

                                <!-- Automatisch berechnete Druckbereiche -->
                                <div style="margin-top: 15px; padding: 15px; background: #d1ecf1; border: 1px solid #bee5eb; border-radius: 4px;">
                                    <h6 style="margin: 0 0 10px 0; color: #0c5460;"><?php esc_html_e('🔄 Automatically Calculated Print Areas', 'octo-print-designer'); ?></h6>
                                    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                                        <?php foreach ($template_sizes as $size): ?>
                                                                                         <?php 
                                             $size_id = $size['id'];
                                             $size_config = $product_dimensions[$size_id] ?? array();
                                             
                                             if ($photo_width_px > 0 && $photo_height_px > 0) {
                                                 $calculated = $this->calculate_print_area_from_photo(
                                                     $photo_width_px, $photo_height_px, 
                                                     $size_config, 
                                                     $canvas_width, $canvas_height,
                                                     $view_name
                                                 );
                                             } else {
                                                 $calculated = array('print_width_mm' => 0, 'print_height_mm' => 0, 'used_measurements' => array('width' => 0, 'height' => 0));
                                             }
                                             ?>
                                            <div style="background: #fff; padding: 10px; border-radius: 4px; border: 1px solid #bee5eb;">
                                                <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 8px;">
                                                    <span style="width: 20px; height: 20px; background: #007cba; color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: bold;">
                                                        <?php echo esc_html(strtoupper(substr($size_id, 0, 1))); ?>
                                                    </span>
                                                    <span style="font-weight: 600; font-size: 12px;"><?php echo esc_html($size['name']); ?></span>
                                                </div>
                                                                                                 <div style="font-size: 11px; color: #0c5460;">
                                                     <div><?php esc_html_e('Width:', 'octo-print-designer'); ?> <strong><?php echo $calculated['print_width_mm']; ?> mm</strong></div>
                                                     <div><?php esc_html_e('Height:', 'octo-print-designer'); ?> <strong><?php echo $calculated['print_height_mm']; ?> mm</strong></div>
                                                     <?php if ($calculated['used_measurements']['width'] > 0): ?>
                                                         <div style="font-size: 9px; color: #6c757d; margin-top: 4px; border-top: 1px solid #dee2e6; padding-top: 4px;">
                                                             <?php esc_html_e('Based on:', 'octo-print-designer'); ?> <?php echo $calculated['used_measurements']['width']; ?>×<?php echo $calculated['used_measurements']['height']; ?> cm
                                                         </div>
                                                     <?php endif; ?>
                                                 </div>
                                            </div>
                                        <?php endforeach; ?>
                                    </div>
                                </div>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>
            <?php else: ?>
                <!-- Fallback: Template hat noch keine Views -->
                <div style="padding: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
                    <h4><?php esc_html_e('⚠️ No Views Found', 'octo-print-designer'); ?></h4>
                    <p><?php esc_html_e('This template has no views configured yet. Create variations and views first, then return here to configure print areas.', 'octo-print-designer'); ?></p>
                </div>
            <?php endif; ?>
        </div>

        <script>
        jQuery(document).ready(function($) {
            // Live-Berechnung der Druckbereiche
            function updateCalculatedAreas() {
                $('.view-print-area-config').each(function() {
                    var container = $(this);
                    var canvasWidth = parseFloat(container.find('input[name*="canvas_width"]').val()) || 0;
                    var canvasHeight = parseFloat(container.find('input[name*="canvas_height"]').val()) || 0;
                    var photoWidth = parseFloat(container.find('input[name*="photo_width_px"]').val()) || 0;
                    var photoHeight = parseFloat(container.find('input[name*="photo_height_px"]').val()) || 0;
                    
                    // Update calculated areas for each size
                    container.find('.calculated-print-area').each(function() {
                        var sizeContainer = $(this);
                        var realWidth = parseFloat(sizeContainer.data('real-width')) || 0;
                        var realHeight = parseFloat(sizeContainer.data('real-height')) || 0;
                        
                        if (photoWidth > 0 && photoHeight > 0 && realWidth > 0 && realHeight > 0) {
                            var scaleX = realWidth / photoWidth;
                            var scaleY = realHeight / photoHeight;
                            var scale = Math.min(scaleX, scaleY);
                            
                            var printWidth = (canvasWidth * scale) * 10;
                            var printHeight = (canvasHeight * scale) * 10;
                            
                            sizeContainer.find('.print-width').text(printWidth.toFixed(1));
                            sizeContainer.find('.print-height').text(printHeight.toFixed(1));
                        }
                    });
                });
            }
            
            // Event listeners
            $('input[name*="canvas_width"], input[name*="canvas_height"], input[name*="photo_width_px"], input[name*="photo_height_px"], input[name*="width_cm"], input[name*="height_cm"]').on('input', updateCalculatedAreas);
            
            // Initial calculation
            updateCalculatedAreas();
        });
        </script>
        <?php
    }

}