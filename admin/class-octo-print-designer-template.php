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

        add_meta_box(
            'template_design_calculation',
            __('Design Calculation Fields', 'octo-print-designer'),
            array($this, 'render_design_calculation_meta_box'),
            'design_template',
            'normal',
            'high'
        );

        add_meta_box(
            'template_printable_area',
            __('Printable Area Calculation Methods', 'octo-print-designer'),
            array($this, 'render_printable_area_meta_box'),
            'design_template',
            'normal',
            'high'
        );

        add_meta_box(
            'template_reference_lines',
            __('Reference Lines & Measurements', 'octo-print-designer'),
            array($this, 'render_reference_lines_meta_box'),
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
            
            $physical_width = isset($_POST['physical_width_cm']) ? 
                (float) sanitize_text_field($_POST['physical_width_cm']) : 30;
            $physical_height = isset($_POST['physical_height_cm']) ? 
                (float) sanitize_text_field($_POST['physical_height_cm']) : 40;
                
            update_post_meta($post_id, '_template_physical_width_cm', $physical_width);
            update_post_meta($post_id, '_template_physical_height_cm', $physical_height);
        }
        
        $this->save_inventory_meta($post_id);
        $this->save_pricing_meta($post_id);
        $this->save_design_calculation_meta($post_id);
        $this->save_printable_area_meta($post_id);
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
     * Save the template design calculation data
     */
    private function save_design_calculation_meta($post_id) {
        // Verify nonce
        if (!isset($_POST['template_design_calculation_nonce']) ||
            !wp_verify_nonce($_POST['template_design_calculation_nonce'], 'save_template_design_calculation')) {
            return;
        }

        // Save mockup image URL
        if (isset($_POST['mockup_image_url'])) {
            $mockup_image_url = sanitize_url($_POST['mockup_image_url']);
            update_post_meta($post_id, '_mockup_image_url', $mockup_image_url);
        }

        // Save print template image URL
        if (isset($_POST['print_template_image_url'])) {
            $print_template_image_url = sanitize_url($_POST['print_template_image_url']);
            update_post_meta($post_id, '_print_template_image_url', $print_template_image_url);
        }

        // Save mockup design area (JSON)
        if (isset($_POST['mockup_design_area_px'])) {
            $mockup_design_area_px = $this->sanitize_json_field($_POST['mockup_design_area_px']);
            update_post_meta($post_id, '_mockup_design_area_px', $mockup_design_area_px);
        }
    }

    /**
     * Save the template printable area data
     */
    private function save_printable_area_meta($post_id) {
        // Verify nonce
        if (!isset($_POST['template_printable_area_nonce']) ||
            !wp_verify_nonce($_POST['template_printable_area_nonce'], 'save_template_printable_area')) {
            return;
        }

        // Save Method 1 fields
        if (isset($_POST['printable_area_px'])) {
            $printable_area_px = $this->sanitize_json_field($_POST['printable_area_px']);
            update_post_meta($post_id, '_printable_area_px', $printable_area_px);
        }

        if (isset($_POST['printable_area_mm'])) {
            $printable_area_mm = $this->sanitize_json_field($_POST['printable_area_mm']);
            update_post_meta($post_id, '_printable_area_mm', $printable_area_mm);
        }

        // Save Method 2 fields
        if (isset($_POST['ref_chest_line_px'])) {
            $ref_chest_line_px = $this->sanitize_json_field($_POST['ref_chest_line_px']);
            update_post_meta($post_id, '_ref_chest_line_px', $ref_chest_line_px);
        }

        if (isset($_POST['anchor_point_px'])) {
            $anchor_point_px = $this->sanitize_json_field($_POST['anchor_point_px']);
            update_post_meta($post_id, '_anchor_point_px', $anchor_point_px);
        }
    }

    /**
     * Sanitize JSON field data
     */
    private function sanitize_json_field($json_string) {
        if (empty($json_string)) {
            return '';
        }

        // Remove any slashes and decode
        $cleaned = stripslashes($json_string);

        // Try to decode to validate JSON format
        $decoded = json_decode($cleaned, true);

        // If JSON is invalid, return empty string
        if (json_last_error() !== JSON_ERROR_NONE) {
            return '';
        }

        // Return the cleaned JSON string
        return sanitize_textarea_field($cleaned);
    }

    /**
     * Render the physical dimensions meta box
     */
    public function render_physical_dimensions_meta_box($post) {
        wp_nonce_field('save_template_physical_dimensions', 'template_physical_dimensions_nonce');

        // Get saved dimensions
        $physical_width = get_post_meta($post->ID, '_template_physical_width_cm', true);
        $physical_height = get_post_meta($post->ID, '_template_physical_height_cm', true);

        // Default values if not set
        if (empty($physical_width)) $physical_width = 30; // Default 30cm
        if (empty($physical_height)) $physical_height = 40; // Default 40cm

        ?>
        <div id="template-physical-dimensions-container" class="template-physical-dimensions-wrapper">
            <p class="description">
                <?php esc_html_e('Enter the physical dimensions of the printable area on the t-shirt. These values will be used to accurately calculate pricing based on the actual size of the design.', 'octo-print-designer'); ?>
            </p>

            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="physical_width_cm"><?php esc_html_e('Physical Width (cm)', 'octo-print-designer'); ?></label>
                    </th>
                    <td>
                        <input
                            type="number"
                            id="physical_width_cm"
                            name="physical_width_cm"
                            value="<?php echo esc_attr($physical_width); ?>"
                            step="0.1"
                            min="1"
                            class="regular-text"
                            required
                        />
                        <p class="description">
                            <?php esc_html_e('The maximum printable width in centimeters', 'octo-print-designer'); ?>
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="physical_height_cm"><?php esc_html_e('Physical Height (cm)', 'octo-print-designer'); ?></label>
                    </th>
                    <td>
                        <input
                            type="number"
                            id="physical_height_cm"
                            name="physical_height_cm"
                            value="<?php echo esc_attr($physical_height); ?>"
                            step="0.1"
                            min="1"
                            class="regular-text"
                            required
                        />
                        <p class="description">
                            <?php esc_html_e('The maximum printable height in centimeters', 'octo-print-designer'); ?>
                        </p>
                    </td>
                </tr>
            </table>
        </div>
        <?php
    }

    /**
     * Render the design calculation meta box
     */
    public function render_design_calculation_meta_box($post) {
        wp_nonce_field('save_template_design_calculation', 'template_design_calculation_nonce');

        // Get saved values
        $mockup_image_url = get_post_meta($post->ID, '_mockup_image_url', true);
        $print_template_image_url = get_post_meta($post->ID, '_print_template_image_url', true);
        $mockup_design_area_px = get_post_meta($post->ID, '_mockup_design_area_px', true);

        ?>
        <div id="template-design-calculation-container" class="template-design-calculation-wrapper">
            <p class="description">
                <?php esc_html_e('Configure the basic design calculation parameters used for mapping designs onto mockups and print templates.', 'octo-print-designer'); ?>
            </p>

            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="mockup_image_url"><?php esc_html_e('Mockup Image URL', 'octo-print-designer'); ?></label>
                    </th>
                    <td>
                        <input
                            type="url"
                            id="mockup_image_url"
                            name="mockup_image_url"
                            value="<?php echo esc_attr($mockup_image_url); ?>"
                            class="large-text"
                            placeholder="https://example.com/mockup-image.jpg"
                        />
                        <p class="description">
                            <?php esc_html_e('URL to the mockup image used for design preview', 'octo-print-designer'); ?>
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="print_template_image_url"><?php esc_html_e('Print Template Image URL', 'octo-print-designer'); ?></label>
                    </th>
                    <td>
                        <input
                            type="url"
                            id="print_template_image_url"
                            name="print_template_image_url"
                            value="<?php echo esc_attr($print_template_image_url); ?>"
                            class="large-text"
                            placeholder="https://example.com/print-template.jpg"
                        />
                        <p class="description">
                            <?php esc_html_e('URL to the print template image used for production', 'octo-print-designer'); ?>
                        </p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="mockup_design_area_px"><?php esc_html_e('Mockup Design Area (JSON)', 'octo-print-designer'); ?></label>
                    </th>
                    <td>
                        <textarea
                            id="mockup_design_area_px"
                            name="mockup_design_area_px"
                            rows="8"
                            class="large-text code"
                            placeholder='{"x": 100, "y": 150, "width": 300, "height": 400}'
                        ><?php echo esc_textarea($mockup_design_area_px); ?></textarea>
                        <p class="description">
                            <?php esc_html_e('JSON defining the design area coordinates on the mockup image in pixels. Example: {"x": 100, "y": 150, "width": 300, "height": 400}', 'octo-print-designer'); ?>
                        </p>
                    </td>
                </tr>
            </table>
        </div>
        <?php
    }

    /**
     * Render the printable area calculation methods meta box
     */
    public function render_printable_area_meta_box($post) {
        wp_nonce_field('save_template_printable_area', 'template_printable_area_nonce');

        // Get saved values for Method 1
        $printable_area_px = get_post_meta($post->ID, '_printable_area_px', true);
        $printable_area_mm = get_post_meta($post->ID, '_printable_area_mm', true);

        // Get saved values for Method 2
        $ref_chest_line_px = get_post_meta($post->ID, '_ref_chest_line_px', true);
        $anchor_point_px = get_post_meta($post->ID, '_anchor_point_px', true);

        ?>
        <div id="template-printable-area-container" class="template-printable-area-wrapper">
            <p class="description">
                <?php esc_html_e('Define the printable area calculation methods. Choose either Method 1 (Direct Area Definition) or Method 2 (Reference Line & Anchor Point).', 'octo-print-designer'); ?>
            </p>

            <div class="calculation-methods-tabs">
                <div class="method-tabs">
                    <button type="button" class="method-tab active" data-method="method1">
                        <?php esc_html_e('Method 1: Direct Area', 'octo-print-designer'); ?>
                    </button>
                    <button type="button" class="method-tab" data-method="method2">
                        <?php esc_html_e('Method 2: Reference & Anchor', 'octo-print-designer'); ?>
                    </button>
                </div>

                <div id="method1-content" class="method-content active">
                    <h4><?php esc_html_e('Method 1: Direct Printable Area Definition', 'octo-print-designer'); ?></h4>
                    <p class="description">
                        <?php esc_html_e('Define the printable area directly in pixels and millimeters.', 'octo-print-designer'); ?>
                    </p>

                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="printable_area_px"><?php esc_html_e('Printable Area in Pixels (JSON)', 'octo-print-designer'); ?></label>
                            </th>
                            <td>
                                <textarea
                                    id="printable_area_px"
                                    name="printable_area_px"
                                    rows="8"
                                    class="large-text code"
                                    placeholder='{"x": 50, "y": 100, "width": 250, "height": 300}'
                                ><?php echo esc_textarea($printable_area_px); ?></textarea>
                                <p class="description">
                                    <?php esc_html_e('JSON defining the printable area in pixels. Example: {"x": 50, "y": 100, "width": 250, "height": 300}', 'octo-print-designer'); ?>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="printable_area_mm"><?php esc_html_e('Printable Area in Millimeters (JSON)', 'octo-print-designer'); ?></label>
                            </th>
                            <td>
                                <textarea
                                    id="printable_area_mm"
                                    name="printable_area_mm"
                                    rows="8"
                                    class="large-text code"
                                    placeholder='{"x": 25.0, "y": 50.0, "width": 125.0, "height": 150.0}'
                                ><?php echo esc_textarea($printable_area_mm); ?></textarea>
                                <p class="description">
                                    <?php esc_html_e('JSON defining the printable area in millimeters. Example: {"x": 25.0, "y": 50.0, "width": 125.0, "height": 150.0}', 'octo-print-designer'); ?>
                                </p>
                            </td>
                        </tr>
                    </table>
                </div>

                <div id="method2-content" class="method-content">
                    <h4><?php esc_html_e('Method 2: Reference Chest Line & Anchor Point', 'octo-print-designer'); ?></h4>
                    <p class="description">
                        <?php esc_html_e('Define the printable area using a reference chest line and anchor point for dynamic calculations.', 'octo-print-designer'); ?>
                    </p>

                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="ref_chest_line_px"><?php esc_html_e('Reference Chest Line in Pixels (JSON)', 'octo-print-designer'); ?></label>
                            </th>
                            <td>
                                <textarea
                                    id="ref_chest_line_px"
                                    name="ref_chest_line_px"
                                    rows="6"
                                    class="large-text code"
                                    placeholder='{"start": {"x": 100, "y": 200}, "end": {"x": 400, "y": 200}}'
                                ><?php echo esc_textarea($ref_chest_line_px); ?></textarea>
                                <p class="description">
                                    <?php esc_html_e('JSON defining the reference chest line coordinates. Example: {"start": {"x": 100, "y": 200}, "end": {"x": 400, "y": 200}}', 'octo-print-designer'); ?>
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="anchor_point_px"><?php esc_html_e('Anchor Point in Pixels (JSON)', 'octo-print-designer'); ?></label>
                            </th>
                            <td>
                                <textarea
                                    id="anchor_point_px"
                                    name="anchor_point_px"
                                    rows="6"
                                    class="large-text code"
                                    placeholder='{"x": 250, "y": 150, "type": "center-top"}'
                                ><?php echo esc_textarea($anchor_point_px); ?></textarea>
                                <p class="description">
                                    <?php esc_html_e('JSON defining the anchor point for design placement. Example: {"x": 250, "y": 150, "type": "center-top"}', 'octo-print-designer'); ?>
                                </p>
                            </td>
                        </tr>
                    </table>
                </div>
            </div>
        </div>

        <style>
        .calculation-methods-tabs .method-tabs {
            border-bottom: 1px solid #ccc;
            margin-bottom: 20px;
        }
        .method-tab {
            background: none;
            border: none;
            padding: 10px 15px;
            cursor: pointer;
            border-bottom: 2px solid transparent;
        }
        .method-tab.active {
            border-bottom-color: #0073aa;
            color: #0073aa;
            font-weight: bold;
        }
        .method-content {
            display: none;
        }
        .method-content.active {
            display: block;
        }
        </style>

        <script>
        jQuery(document).ready(function($) {
            $('.method-tab').click(function() {
                var method = $(this).data('method');

                // Update tabs
                $('.method-tab').removeClass('active');
                $(this).addClass('active');

                // Update content
                $('.method-content').removeClass('active');
                $('#' + method + '-content').addClass('active');
            });
        });
        </script>
        <?php
    }

    /**
     * Render the reference lines meta box
     */
    public function render_reference_lines_meta_box($post) {
        wp_nonce_field('octo_template_nonce_action', 'octo_template_nonce');

        $reference_lines = get_post_meta($post->ID, '_reference_lines_data', true);
        if (!is_array($reference_lines)) {
            $reference_lines = [];
        }
        ?>
        <div class="reference-lines-container">
            <div class="reference-lines-info">
                <p><strong><?php esc_html_e('Interactive Reference Line System', 'octo-print-designer'); ?></strong></p>
                <p><?php esc_html_e('Use the "Edit Reference Line" button in the template view toolbar to create measurement references by clicking two points on your template image.', 'octo-print-designer'); ?></p>
            </div>

            <?php if (!empty($reference_lines)): ?>
                <div class="existing-reference-lines">
                    <h4><?php esc_html_e('Existing Reference Lines', 'octo-print-designer'); ?></h4>
                    <table class="widefat">
                        <thead>
                            <tr>
                                <th><?php esc_html_e('Type', 'octo-print-designer'); ?></th>
                                <th><?php esc_html_e('Length (px)', 'octo-print-designer'); ?></th>
                                <th><?php esc_html_e('Coordinates', 'octo-print-designer'); ?></th>
                                <th><?php esc_html_e('Created', 'octo-print-designer'); ?></th>
                                <th><?php esc_html_e('Actions', 'octo-print-designer'); ?></th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach ($reference_lines as $index => $line): ?>
                                <tr>
                                    <td>
                                        <strong><?php echo esc_html(str_replace('_', ' ', ucwords($line['type']))); ?></strong>
                                    </td>
                                    <td><?php echo esc_html($line['lengthPx']); ?>px</td>
                                    <td>
                                        <small>
                                            Start: <?php echo esc_html(round($line['start']['x'])); ?>, <?php echo esc_html(round($line['start']['y'])); ?><br>
                                            End: <?php echo esc_html(round($line['end']['x'])); ?>, <?php echo esc_html(round($line['end']['y'])); ?>
                                        </small>
                                    </td>
                                    <td>
                                        <?php
                                        if (isset($line['timestamp'])) {
                                            echo esc_html(date('Y-m-d H:i', $line['timestamp'] / 1000));
                                        } else {
                                            echo esc_html__('Unknown', 'octo-print-designer');
                                        }
                                        ?>
                                    </td>
                                    <td>
                                        <button type="button" class="button button-small delete-reference-line" data-index="<?php echo esc_attr($index); ?>">
                                            <?php esc_html_e('Delete', 'octo-print-designer'); ?>
                                        </button>
                                    </td>
                                </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            <?php else: ?>
                <div class="no-reference-lines">
                    <p><em><?php esc_html_e('No reference lines created yet. Use the template view toolbar to create your first reference line.', 'octo-print-designer'); ?></em></p>
                </div>
            <?php endif; ?>

            <div class="reference-lines-usage">
                <h4><?php esc_html_e('How to Use', 'octo-print-designer'); ?></h4>
                <ol>
                    <li><?php esc_html_e('Scroll down to the Template View section', 'octo-print-designer'); ?></li>
                    <li><?php esc_html_e('Click the "Edit Reference Line" button in the toolbar', 'octo-print-designer'); ?></li>
                    <li><?php esc_html_e('Choose either "Chest Width" or "Height from Shoulder" measurement type', 'octo-print-designer'); ?></li>
                    <li><?php esc_html_e('Click two points on the template image to define your reference line', 'octo-print-designer'); ?></li>
                    <li><?php esc_html_e('The reference line will be saved and displayed in this section', 'octo-print-designer'); ?></li>
                </ol>
            </div>
        </div>

        <style>
            .reference-lines-container {
                padding: 15px;
            }

            .reference-lines-info {
                background: #f0f8ff;
                padding: 15px;
                border-left: 4px solid #0073aa;
                margin-bottom: 20px;
            }

            .existing-reference-lines {
                margin: 20px 0;
            }

            .reference-lines-usage {
                background: #f9f9f9;
                padding: 15px;
                border-radius: 5px;
                margin-top: 20px;
            }

            .reference-lines-usage ol {
                padding-left: 20px;
            }

            .delete-reference-line:hover {
                background: #d63638;
                color: white;
            }

            .no-reference-lines {
                text-align: center;
                padding: 30px;
                background: #f9f9f9;
                border-radius: 5px;
                margin: 20px 0;
            }
        </style>

        <script>
        jQuery(document).ready(function($) {
            $('.delete-reference-line').click(function() {
                const index = $(this).data('index');
                const postId = $('#post_ID').val();

                if (confirm('<?php echo esc_js(__('Are you sure you want to delete this reference line?', 'octo-print-designer')); ?>')) {
                    $.post(ajaxurl, {
                        action: 'delete_reference_line',
                        post_id: postId,
                        line_index: index,
                        nonce: $('#octo_template_nonce').val()
                    })
                    .done(function(response) {
                        if (response.success) {
                            location.reload();
                        } else {
                            alert('<?php echo esc_js(__('Failed to delete reference line', 'octo-print-designer')); ?>');
                        }
                    });
                }
            });
        });
        </script>
        <?php
    }

}