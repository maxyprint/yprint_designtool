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
            'template_data_foundation',
            __('Data Foundation - Calculation Methods', 'octo-print-designer'),
            array($this, 'render_data_foundation_meta_box'),
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

        add_meta_box(
            'template_size_definitions',
            __('Size Definitions & Calculations', 'octo-print-designer'),
            array($this, 'render_size_definitions_meta_box'),
            'design_template',
            'normal',
            'high'
        );

        // 🧠 AGENT 7 SOLUTION: Template Measurements Database Meta-Box
        add_meta_box(
            'template_measurements_database',
            __('Template Measurements Database', 'octo-print-designer'),
            array($this, 'render_measurements_database_meta_box'),
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

        // Save data foundation fields
        if (isset($_POST['template_data_foundation_nonce']) &&
            wp_verify_nonce($_POST['template_data_foundation_nonce'], 'save_template_data_foundation')) {

            // Base fields
            $mockup_image_url = isset($_POST['mockup_image_url']) ?
                esc_url_raw($_POST['mockup_image_url']) : '';
            $print_template_image_url = isset($_POST['print_template_image_url']) ?
                esc_url_raw($_POST['print_template_image_url']) : '';
            $mockup_design_area_px = isset($_POST['mockup_design_area_px']) ?
                $this->sanitize_json_field($_POST['mockup_design_area_px']) : '';

            // Method 1: Scalable Area
            $printable_area_px = isset($_POST['printable_area_px']) ?
                $this->sanitize_json_field($_POST['printable_area_px']) : '';
            $printable_area_mm = isset($_POST['printable_area_mm']) ?
                $this->sanitize_json_field($_POST['printable_area_mm']) : '';

            // Method 2: Reference Lines
            $ref_chest_line_px = isset($_POST['ref_chest_line_px']) ?
                $this->sanitize_json_field($_POST['ref_chest_line_px']) : '';
            $anchor_point_px = isset($_POST['anchor_point_px']) ?
                $this->sanitize_json_field($_POST['anchor_point_px']) : '';

            // Save all meta fields
            update_post_meta($post_id, '_template_mockup_image_url', $mockup_image_url);
            update_post_meta($post_id, '_template_print_template_image_url', $print_template_image_url);
            update_post_meta($post_id, '_template_mockup_design_area_px', $mockup_design_area_px);
            update_post_meta($post_id, '_template_printable_area_px', $printable_area_px);
            update_post_meta($post_id, '_template_printable_area_mm', $printable_area_mm);
            update_post_meta($post_id, '_template_ref_chest_line_px', $ref_chest_line_px);
            update_post_meta($post_id, '_template_anchor_point_px', $anchor_point_px);
        }

        $this->save_inventory_meta($post_id);
        $this->save_pricing_meta($post_id);
        $this->save_size_definitions_meta($post_id);
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
     * Save the size definitions data
     */
    private function save_size_definitions_meta($post_id) {
        // Verify nonce
        if (!isset($_POST['octo_size_definitions_nonce']) ||
            !wp_verify_nonce($_POST['octo_size_definitions_nonce'], 'octo_size_definitions_nonce_action')) {
            return;
        }

        // Save size definitions
        if (isset($_POST['size_definitions']) && is_array($_POST['size_definitions'])) {
            $size_definitions = [];
            foreach ($_POST['size_definitions'] as $size_def) {
                if (!empty($size_def['size']) && !empty($size_def['target_mm'])) {
                    $size_definitions[] = [
                        'size' => sanitize_text_field($size_def['size']),
                        'target_mm' => floatval($size_def['target_mm']),
                        'reference_type' => isset($size_def['reference_type']) ? intval($size_def['reference_type']) : ''
                    ];
                }
            }
            update_post_meta($post_id, '_size_definitions', $size_definitions);
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

    /**
     * Render the size definitions meta box
     */
    public function render_size_definitions_meta_box($post) {
        wp_nonce_field('octo_size_definitions_nonce_action', 'octo_size_definitions_nonce');

        $size_definitions = get_post_meta($post->ID, '_size_definitions', true);
        if (!is_array($size_definitions)) {
            $size_definitions = [];
        }

        $reference_lines = get_post_meta($post->ID, '_reference_lines_data', true);
        if (!is_array($reference_lines)) {
            $reference_lines = [];
        }

        // Get current calculations
        $size_calculations = get_post_meta($post->ID, '_size_calculations', true);
        if (!is_array($size_calculations)) {
            $size_calculations = [];
        }
        ?>
        <div class="size-definitions-container">
            <div class="size-definitions-info">
                <p><strong><?php esc_html_e('Size Definition & Automatic Calculation System', 'octo-print-designer'); ?></strong></p>
                <p><?php esc_html_e('Define target measurements for each size. The system will automatically calculate scale factors based on your reference lines.', 'octo-print-designer'); ?></p>
            </div>

            <?php if (!empty($reference_lines)): ?>
                <div class="reference-line-info">
                    <h4><?php esc_html_e('Available Reference Lines', 'octo-print-designer'); ?></h4>
                    <div class="reference-lines-summary">
                        <?php foreach ($reference_lines as $index => $line): ?>
                            <div class="reference-line-item">
                                <strong><?php echo esc_html(str_replace('_', ' ', ucwords($line['type']))); ?></strong>:
                                <?php echo esc_html($line['lengthPx']); ?>px
                                <small>(Created: <?php echo esc_html(date('Y-m-d H:i', $line['timestamp'] / 1000)); ?>)</small>
                            </div>
                        <?php endforeach; ?>
                    </div>
                </div>

                <div class="size-definitions-table">
                    <h4><?php esc_html_e('Size Definitions', 'octo-print-designer'); ?></h4>
                    <p class="description"><?php esc_html_e('Enter the target measurement in millimeters for each size. The system will calculate scale factors automatically.', 'octo-print-designer'); ?></p>

                    <table class="widefat size-definitions-table-input">
                        <thead>
                            <tr>
                                <th><?php esc_html_e('Size', 'octo-print-designer'); ?></th>
                                <th><?php esc_html_e('Target Measurement (mm)', 'octo-print-designer'); ?></th>
                                <th><?php esc_html_e('Reference Type', 'octo-print-designer'); ?></th>
                                <th><?php esc_html_e('Actions', 'octo-print-designer'); ?></th>
                            </tr>
                        </thead>
                        <tbody id="size-definitions-tbody">
                            <?php if (!empty($size_definitions)): ?>
                                <?php foreach ($size_definitions as $index => $size_def): ?>
                                    <tr data-index="<?php echo esc_attr($index); ?>">
                                        <td>
                                            <input type="text" name="size_definitions[<?php echo esc_attr($index); ?>][size]"
                                                   value="<?php echo esc_attr($size_def['size']); ?>"
                                                   placeholder="S, M, L, XL..." class="regular-text" />
                                        </td>
                                        <td>
                                            <input type="number" name="size_definitions[<?php echo esc_attr($index); ?>][target_mm]"
                                                   value="<?php echo esc_attr($size_def['target_mm']); ?>"
                                                   placeholder="450" step="0.1" class="regular-text" />
                                        </td>
                                        <td>
                                            <select name="size_definitions[<?php echo esc_attr($index); ?>][reference_type]" class="regular-text">
                                                <option value=""><?php esc_html_e('Select Reference...', 'octo-print-designer'); ?></option>
                                                <?php foreach ($reference_lines as $ref_index => $ref_line): ?>
                                                    <option value="<?php echo esc_attr($ref_index); ?>"
                                                            <?php selected($size_def['reference_type'], $ref_index); ?>>
                                                        <?php echo esc_html(str_replace('_', ' ', ucwords($ref_line['type']))); ?>
                                                        (<?php echo esc_html($ref_line['lengthPx']); ?>px)
                                                    </option>
                                                <?php endforeach; ?>
                                            </select>
                                        </td>
                                        <td>
                                            <button type="button" class="button remove-size-definition"><?php esc_html_e('Remove', 'octo-print-designer'); ?></button>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            <?php endif; ?>
                        </tbody>
                    </table>

                    <div class="size-definitions-actions">
                        <button type="button" id="add-size-definition" class="button"><?php esc_html_e('Add Size Definition', 'octo-print-designer'); ?></button>
                        <button type="button" id="calculate-sizes" class="button button-primary"><?php esc_html_e('Calculate Scale Factors', 'octo-print-designer'); ?></button>
                        <button type="button" id="sync-to-woocommerce" class="button button-secondary"><?php esc_html_e('Sync to WooCommerce', 'octo-print-designer'); ?></button>
                    </div>
                </div>

                <?php if (!empty($size_calculations)): ?>
                    <div class="size-calculations-results">
                        <h4><?php esc_html_e('Calculated Scale Factors', 'octo-print-designer'); ?></h4>
                        <table class="widefat">
                            <thead>
                                <tr>
                                    <th><?php esc_html_e('Size', 'octo-print-designer'); ?></th>
                                    <th><?php esc_html_e('Target (mm)', 'octo-print-designer'); ?></th>
                                    <th><?php esc_html_e('Reference (mm)', 'octo-print-designer'); ?></th>
                                    <th><?php esc_html_e('Scale Factor', 'octo-print-designer'); ?></th>
                                    <th><?php esc_html_e('Percentage', 'octo-print-designer'); ?></th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($size_calculations as $calc): ?>
                                    <tr>
                                        <td><strong><?php echo esc_html($calc['size']); ?></strong></td>
                                        <td><?php echo esc_html($calc['target_mm']); ?>mm</td>
                                        <td><?php echo esc_html($calc['reference_mm']); ?>mm</td>
                                        <td><?php echo esc_html(round($calc['scale_factor'], 4)); ?></td>
                                        <td><?php echo esc_html(round($calc['scale_factor'] * 100, 1)); ?>%</td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                <?php endif; ?>

            <?php else: ?>
                <div class="no-reference-lines">
                    <p><em><?php esc_html_e('No reference lines found. Please create a reference line first using the Template View toolbar above.', 'octo-print-designer'); ?></em></p>
                    <p><?php esc_html_e('Once you have reference lines, you can define size measurements here.', 'octo-print-designer'); ?></p>
                </div>
            <?php endif; ?>
        </div>

        <style>
            .size-definitions-container {
                padding: 15px;
            }

            .size-definitions-info {
                background: #e8f4fd;
                padding: 15px;
                border-left: 4px solid #0073aa;
                margin-bottom: 20px;
            }

            .reference-line-info {
                background: #f9f9f9;
                padding: 15px;
                border-radius: 5px;
                margin-bottom: 20px;
            }

            .reference-line-item {
                padding: 8px 0;
                border-bottom: 1px solid #eee;
            }

            .reference-line-item:last-child {
                border-bottom: none;
            }

            .size-definitions-table-input th,
            .size-definitions-table-input td {
                padding: 10px;
                vertical-align: middle;
            }

            .size-definitions-actions {
                margin-top: 15px;
                padding: 15px;
                background: #f9f9f9;
                border-radius: 5px;
            }

            .size-calculations-results {
                margin-top: 20px;
                padding: 15px;
                background: #d4edda;
                border-left: 4px solid #28a745;
                border-radius: 5px;
            }

            .no-reference-lines {
                text-align: center;
                padding: 40px;
                background: #fff3cd;
                border-radius: 5px;
                border-left: 4px solid #ffc107;
            }

            .remove-size-definition:hover {
                background: #d63638;
                color: white;
            }
        </style>

        <script>
        jQuery(document).ready(function($) {
            let sizeIndex = $('#size-definitions-tbody tr').length;

            // Build reference line options safely
            let referenceOptions = '';
            referenceOptions += '<option value=""><?php echo esc_js(__('Select Reference...', 'octo-print-designer')); ?></option>';
            <?php foreach ($reference_lines as $ref_index => $ref_line): ?>
            referenceOptions += '<option value="<?php echo esc_js($ref_index); ?>"><?php echo esc_js(str_replace('_', ' ', ucwords($ref_line['type']))); ?> (<?php echo esc_js($ref_line['lengthPx']); ?>px)</option>';
            <?php endforeach; ?>

            // Add new size definition row
            $('#add-size-definition').click(function() {
                const newRow = '<tr data-index="' + sizeIndex + '">' +
                    '<td>' +
                        '<input type="text" name="size_definitions[' + sizeIndex + '][size]" ' +
                               'placeholder="S, M, L, XL..." class="regular-text" />' +
                    '</td>' +
                    '<td>' +
                        '<input type="number" name="size_definitions[' + sizeIndex + '][target_mm]" ' +
                               'placeholder="450" step="0.1" class="regular-text" />' +
                    '</td>' +
                    '<td>' +
                        '<select name="size_definitions[' + sizeIndex + '][reference_type]" class="regular-text">' +
                            referenceOptions +
                        '</select>' +
                    '</td>' +
                    '<td>' +
                        '<button type="button" class="button remove-size-definition">Remove</button>' +
                    '</td>' +
                '</tr>';
                $('#size-definitions-tbody').append(newRow);
                sizeIndex++;
            });

            // Remove size definition row
            $(document).on('click', '.remove-size-definition', function() {
                $(this).closest('tr').remove();
            });

            // Calculate scale factors
            $('#calculate-sizes').click(function() {
                const postId = $('#post_ID').val();
                const formData = $('#post').serialize();

                $.post(ajaxurl, {
                    action: 'calculate_size_factors',
                    post_id: postId,
                    form_data: formData,
                    nonce: $('#octo_size_definitions_nonce').val()
                })
                .done(function(response) {
                    if (response.success) {
                        location.reload();
                    } else {
                        alert('Calculation failed: ' + response.data.message);
                    }
                });
            });

            // Sync to WooCommerce
            $('#sync-to-woocommerce').click(function() {
                const postId = $('#post_ID').val();

                $.post(ajaxurl, {
                    action: 'sync_sizes_to_woocommerce',
                    post_id: postId,
                    nonce: $('#octo_size_definitions_nonce').val()
                })
                .done(function(response) {
                    if (response.success) {
                        alert('Successfully synced to WooCommerce!');
                    } else {
                        alert('Sync failed: ' + response.data.message);
                    }
                });
            });
        });
        </script>
        <?php
    }

    /**
     * Render the data foundation meta box for calculation methods
     */
    public function render_data_foundation_meta_box($post) {
        wp_nonce_field('save_template_data_foundation', 'template_data_foundation_nonce');

        // Get saved meta values
        $mockup_image_url = get_post_meta($post->ID, '_template_mockup_image_url', true);
        $print_template_image_url = get_post_meta($post->ID, '_template_print_template_image_url', true);
        $mockup_design_area_px = get_post_meta($post->ID, '_template_mockup_design_area_px', true);
        $printable_area_px = get_post_meta($post->ID, '_template_printable_area_px', true);
        $printable_area_mm = get_post_meta($post->ID, '_template_printable_area_mm', true);
        $ref_chest_line_px = get_post_meta($post->ID, '_template_ref_chest_line_px', true);
        $anchor_point_px = get_post_meta($post->ID, '_template_anchor_point_px', true);
        ?>

        <div id="template-data-foundation-container" class="data-foundation-wrapper">
            <div class="data-foundation-info">
                <h4><?php esc_html_e('Data Foundation for Calculation Methods', 'octo-print-designer'); ?></h4>
                <p><?php esc_html_e('Configure the essential data fields that enable both calculation methods for design scaling and positioning.', 'octo-print-designer'); ?></p>
            </div>

            <!-- Basis-Felder -->
            <h3><?php esc_html_e('Base Fields', 'octo-print-designer'); ?></h3>
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="mockup_image_url"><?php esc_html_e('Mockup Image URL', 'octo-print-designer'); ?></label>
                    </th>
                    <td>
                        <input type="url" id="mockup_image_url" name="mockup_image_url"
                               value="<?php echo esc_attr($mockup_image_url); ?>" class="regular-text" />
                        <p class="description"><?php esc_html_e('URL to the customer mockup image', 'octo-print-designer'); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="print_template_image_url"><?php esc_html_e('Print Template Image URL', 'octo-print-designer'); ?></label>
                    </th>
                    <td>
                        <input type="url" id="print_template_image_url" name="print_template_image_url"
                               value="<?php echo esc_attr($print_template_image_url); ?>" class="regular-text" />
                        <p class="description"><?php esc_html_e('URL to the flat production template', 'octo-print-designer'); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="mockup_design_area_px"><?php esc_html_e('Mockup Design Area (JSON)', 'octo-print-designer'); ?></label>
                    </th>
                    <td>
                        <textarea id="mockup_design_area_px" name="mockup_design_area_px"
                                  rows="3" class="large-text code"><?php echo esc_textarea($mockup_design_area_px); ?></textarea>
                        <p class="description"><?php esc_html_e('Clickable area on mockup. Example: {"x": 250, "y": 300, "width": 500, "height": 625}', 'octo-print-designer'); ?></p>
                    </td>
                </tr>
            </table>

            <!-- Methode 1: Skalierbare Fläche -->
            <h3><?php esc_html_e('Method 1: Scalable Area', 'octo-print-designer'); ?></h3>
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="printable_area_px"><?php esc_html_e('Printable Area Pixels (JSON)', 'octo-print-designer'); ?></label>
                    </th>
                    <td>
                        <textarea id="printable_area_px" name="printable_area_px"
                                  rows="3" class="large-text code"><?php echo esc_textarea($printable_area_px); ?></textarea>
                        <p class="description"><?php esc_html_e('Exact print area on template. Example: {"x": 100, "y": 150, "width": 4000, "height": 5000}', 'octo-print-designer'); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="printable_area_mm"><?php esc_html_e('Printable Area Millimeters (JSON)', 'octo-print-designer'); ?></label>
                    </th>
                    <td>
                        <textarea id="printable_area_mm" name="printable_area_mm"
                                  rows="3" class="large-text code"><?php echo esc_textarea($printable_area_mm); ?></textarea>
                        <p class="description"><?php esc_html_e('Real size for reference (e.g. "M"). Example: {"width": 300, "height": 375}', 'octo-print-designer'); ?></p>
                    </td>
                </tr>
            </table>

            <!-- Methode 2: Referenzlinien -->
            <h3><?php esc_html_e('Method 2: Reference Lines', 'octo-print-designer'); ?></h3>
            <table class="form-table">
                <tr>
                    <th scope="row">
                        <label for="ref_chest_line_px"><?php esc_html_e('Reference Chest Line (JSON)', 'octo-print-designer'); ?></label>
                    </th>
                    <td>
                        <textarea id="ref_chest_line_px" name="ref_chest_line_px"
                                  rows="3" class="large-text code"><?php echo esc_textarea($ref_chest_line_px); ?></textarea>
                        <p class="description"><?php esc_html_e('Horizontal reference line. Example: {"x1": 200, "y1": 300, "x2": 800, "y2": 300}', 'octo-print-designer'); ?></p>
                    </td>
                </tr>
                <tr>
                    <th scope="row">
                        <label for="anchor_point_px"><?php esc_html_e('Anchor Point (JSON)', 'octo-print-designer'); ?></label>
                    </th>
                    <td>
                        <textarea id="anchor_point_px" name="anchor_point_px"
                                  rows="3" class="large-text code"><?php echo esc_textarea($anchor_point_px); ?></textarea>
                        <p class="description"><?php esc_html_e('Anchor point on print template. Example: {"x": 500, "y": 300}', 'octo-print-designer'); ?></p>
                    </td>
                </tr>
            </table>

            <div class="data-foundation-note">
                <p><strong><?php esc_html_e('Note:', 'octo-print-designer'); ?></strong>
                   <?php esc_html_e('Per design template, you can choose which calculation method to use. Both sets of fields can be filled for maximum flexibility.', 'octo-print-designer'); ?>
                </p>
            </div>

            <!-- 🚀 CANVAS-META-FIELDS SYNCHRONIZATION BRIDGE -->
            <div id="canvas-meta-sync-container" class="canvas-sync-section">
                <h3><?php esc_html_e('🔄 Canvas-Meta-Fields Synchronization', 'octo-print-designer'); ?></h3>
                <div class="sync-controls">
                    <p class="description">
                        <?php esc_html_e('Automatically sync coordinates between the Canvas editor and Meta-Fields below. This eliminates manual JSON copy-paste.', 'octo-print-designer'); ?>
                    </p>

                    <div class="sync-buttons">
                        <button id="sync-canvas-to-meta" class="button button-primary" type="button">
                            <span class="dashicons dashicons-download"></span>
                            <?php esc_html_e('Sync from Canvas', 'octo-print-designer'); ?>
                        </button>
                        <button id="sync-meta-to-canvas" class="button button-secondary" type="button">
                            <span class="dashicons dashicons-upload"></span>
                            <?php esc_html_e('Load to Canvas', 'octo-print-designer'); ?>
                        </button>
                    </div>

                    <div class="sync-options">
                        <label>
                            <input type="checkbox" id="auto-sync-toggle" checked>
                            <?php esc_html_e('Auto-sync when Canvas changes', 'octo-print-designer'); ?>
                        </label>
                    </div>

                    <div id="sync-status" class="sync-status info">
                        <?php esc_html_e('Sync bridge ready - make changes in Canvas to see automatic synchronization', 'octo-print-designer'); ?>
                    </div>
                </div>

                <!-- Canvas-Sync Meta-Fields (Auto-populated, Read-only) -->
                <h4><?php esc_html_e('Canvas Coordinate Fields (Auto-populated)', 'octo-print-designer'); ?></h4>
                <table class="form-table canvas-sync-fields">
                    <tr>
                        <th scope="row">
                            <label for="base_coordinate_x"><?php esc_html_e('Base Coordinate X', 'octo-print-designer'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="base_coordinate_x" name="base_coordinate_x"
                                   value="<?php echo esc_attr(get_post_meta($post->ID, '_base_coordinate_x', true)); ?>"
                                   class="regular-text readonly-meta-field" readonly />
                            <p class="description"><?php esc_html_e('X coordinate of base position (auto-synced from Canvas)', 'octo-print-designer'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="base_coordinate_y"><?php esc_html_e('Base Coordinate Y', 'octo-print-designer'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="base_coordinate_y" name="base_coordinate_y"
                                   value="<?php echo esc_attr(get_post_meta($post->ID, '_base_coordinate_y', true)); ?>"
                                   class="regular-text readonly-meta-field" readonly />
                            <p class="description"><?php esc_html_e('Y coordinate of base position (auto-synced from Canvas)', 'octo-print-designer'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="base_width"><?php esc_html_e('Base Width', 'octo-print-designer'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="base_width" name="base_width"
                                   value="<?php echo esc_attr(get_post_meta($post->ID, '_base_width', true)); ?>"
                                   class="regular-text readonly-meta-field" readonly />
                            <p class="description"><?php esc_html_e('Canvas width dimension (auto-synced)', 'octo-print-designer'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="base_height"><?php esc_html_e('Base Height', 'octo-print-designer'); ?></label>
                        </th>
                        <td>
                            <input type="text" id="base_height" name="base_height"
                                   value="<?php echo esc_attr(get_post_meta($post->ID, '_base_height', true)); ?>"
                                   class="regular-text readonly-meta-field" readonly />
                            <p class="description"><?php esc_html_e('Canvas height dimension (auto-synced)', 'octo-print-designer'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="scalable_area_coordinates"><?php esc_html_e('Scalable Area Coordinates', 'octo-print-designer'); ?></label>
                        </th>
                        <td>
                            <textarea id="scalable_area_coordinates" name="scalable_area_coordinates"
                                      rows="3" class="large-text code readonly-meta-field" readonly><?php echo esc_textarea(get_post_meta($post->ID, '_scalable_area_coordinates', true)); ?></textarea>
                            <p class="description"><?php esc_html_e('JSON coordinates of scalable design area (auto-synced from Canvas)', 'octo-print-designer'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="reference_lines_data_display"><?php esc_html_e('Reference Lines Data', 'octo-print-designer'); ?></label>
                        </th>
                        <td>
                            <textarea id="reference_lines_data_display" name="reference_lines_data_display"
                                      rows="5" class="large-text code readonly-meta-field" readonly><?php echo esc_textarea(json_encode(get_post_meta($post->ID, '_reference_lines_data', true), JSON_PRETTY_PRINT)); ?></textarea>
                            <p class="description"><?php esc_html_e('Reference lines coordinate data (auto-synced from Canvas)', 'octo-print-designer'); ?></p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">
                            <label for="size_calculation_method"><?php esc_html_e('Size Calculation Method', 'octo-print-designer'); ?></label>
                        </th>
                        <td>
                            <select id="size_calculation_method" name="size_calculation_method" class="regular-text">
                                <option value="reference_lines" <?php selected(get_post_meta($post->ID, '_size_calculation_method', true), 'reference_lines'); ?>>
                                    <?php esc_html_e('Reference Lines', 'octo-print-designer'); ?>
                                </option>
                                <option value="scalable_area" <?php selected(get_post_meta($post->ID, '_size_calculation_method', true), 'scalable_area'); ?>>
                                    <?php esc_html_e('Scalable Area', 'octo-print-designer'); ?>
                                </option>
                            </select>
                            <p class="description"><?php esc_html_e('Method used for size calculations (can be manually selected)', 'octo-print-designer'); ?></p>
                        </td>
                    </tr>
                </table>
            </div>
        </div>

        <style>
            .data-foundation-wrapper {
                padding: 15px;
            }
            .data-foundation-info {
                background: #e8f4fd;
                padding: 15px;
                border-left: 4px solid #0073aa;
                margin-bottom: 20px;
            }
            .data-foundation-info h4 {
                margin-top: 0;
                color: #0073aa;
            }
            .data-foundation-note {
                background: #f0f8e7;
                padding: 15px;
                border-left: 4px solid #46b450;
                margin-top: 20px;
            }
            .data-foundation-note p {
                margin: 0;
            }

            /* 🚀 Canvas-Meta-Fields Sync Styles */
            .canvas-sync-section {
                background: #f0f8ff;
                padding: 20px;
                border: 2px solid #0073aa;
                border-radius: 8px;
                margin-top: 25px;
            }
            .canvas-sync-section h3 {
                color: #0073aa;
                margin-top: 0;
                font-size: 18px;
            }
            .sync-controls {
                margin-bottom: 20px;
            }
            .sync-buttons {
                margin: 15px 0;
            }
            .sync-buttons button {
                margin-right: 10px;
                min-width: 140px;
            }
            .sync-options {
                margin: 10px 0;
                font-size: 13px;
            }
            .sync-status {
                margin-top: 15px;
                padding: 8px 12px;
                border-radius: 4px;
                font-size: 13px;
                font-weight: 500;
                min-height: 20px;
            }
            .sync-status.success {
                background: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            .sync-status.error {
                background: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            .sync-status.info {
                background: #d1ecf1;
                color: #0c5460;
                border: 1px solid #bee5eb;
            }
            .sync-status.warning {
                background: #fff3cd;
                color: #856404;
                border: 1px solid #ffeaa7;
            }
            .readonly-meta-field {
                background-color: #f9f9f9 !important;
                border: 1px solid #ccc !important;
                cursor: not-allowed;
                color: #666;
            }
            .canvas-sync-fields h4 {
                color: #0073aa;
                border-bottom: 1px solid #ddd;
                padding-bottom: 5px;
            }
            .field-updated {
                background-color: #d4edda !important;
                border-color: #c3e6cb !important;
                transition: all 0.3s ease;
            }
        </style>
        <?php
    }

    /**
     * 🧠 AGENT 7 SOLUTION: Render the measurements database meta box
     */
    public function render_measurements_database_meta_box($post) {
        wp_nonce_field('template_measurements_database', 'template_measurements_database_nonce');
        ?>
        <p><strong>Template Measurements Database</strong></p>
        <p>Manage precise measurements synchronized with Template Sizes. This system replaces hardcoded S/M/L/XL with dynamic size definitions.</p>

        <!-- Template Measurements Database Interface -->
        <div class="octo-measurement-management">
            <div id="template-sizes-section" style="margin-bottom: 20px; padding: 15px; background: #f1f8ff; border-radius: 8px;">
                <h4>📐 Template Sizes:</h4>
                <div id="template-sizes-display" style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 15px;"></div>
            </div>

            <div id="measurements-table-container">
                <h4>📏 Measurements Table:</h4>
                <div style="overflow-x: auto; border: 1px solid #e1e1e1; border-radius: 8px; background: white;">
                    <table id="measurements-table" style="width: 100%; border-collapse: collapse; font-size: 14px;">
                        <thead>
                            <tr style="background: #2c3e50; color: white;">
                                <th style="padding: 12px 8px; text-align: center; font-weight: 600;">Size</th>
                                <th style="padding: 12px 8px; text-align: center; font-weight: 600;">A (Chest)</th>
                                <th style="padding: 12px 8px; text-align: center; font-weight: 600;">B (Hem Width)</th>
                                <th style="padding: 12px 8px; text-align: center; font-weight: 600;">C (Height)</th>
                                <th style="padding: 12px 8px; text-align: center; font-weight: 600;">D (Sleeve)</th>
                                <th style="padding: 12px 8px; text-align: center; font-weight: 600;">E (Opening)</th>
                                <th style="padding: 12px 8px; text-align: center; font-weight: 600;">F (Shoulder)</th>
                                <th style="padding: 12px 8px; text-align: center; font-weight: 600;">G (Neck)</th>
                                <th style="padding: 12px 8px; text-align: center; font-weight: 600;">H (Biceps)</th>
                                <th style="padding: 12px 8px; text-align: center; font-weight: 600;">J (Rib Height)</th>
                                <th style="padding: 12px 8px; text-align: center; font-weight: 600;">Actions</th>
                            </tr>
                        </thead>
                        <tbody id="measurements-tbody">
                            <tr><td colspan="11" style="text-align: center; padding: 20px; color: #666;">Select a template to load measurements...</td></tr>
                        </tbody>
                    </table>
                </div>

                <div style="margin-top: 15px; display: flex; gap: 10px; flex-wrap: wrap;">
                    <button type="button" class="button button-primary" onclick="saveAllMeasurements()">
                        <span class="dashicons dashicons-saved"></span> Save All Measurements
                    </button>
                    <button type="button" class="button" onclick="exportMeasurements()">
                        <span class="dashicons dashicons-download"></span> Export CSV
                    </button>
                </div>
            </div>
        </div>

        <script>
        jQuery(document).ready(function($) {
            // 🧠 MEASUREMENT DATABASE JAVASCRIPT
            let currentTemplateId = <?php echo $post->ID; ?>;
            let measurementData = {}; // 🧠 AGENT-1 FINAL: Standard object for jQuery compatibility

            // Initialize template measurements immediately
            window.loadTemplateMeasurements = function() {
                if (!currentTemplateId) {
                    return;
                }

                console.log('🔄 Loading template measurements for ID:', currentTemplateId);

                $.post(ajaxurl, {
                    action: 'get_template_sizes_for_measurements',
                    template_id: currentTemplateId
                }, function(response) {
                    if (response.success && response.data) {
                        displayTemplateSizes(response.data);
                        loadMeasurementTable(currentTemplateId);
                    } else {
                        console.log('❌ Failed to load template sizes');
                    }
                });
            };

            function displayTemplateSizes(sizes) {
                const container = $('#template-sizes-display');
                container.empty();

                sizes.forEach(size => {
                    container.append('<div style="background: #0073aa; color: white; padding: 6px 12px; border-radius: 20px; font-size: 13px; font-weight: 500;"><strong>' + size.id + '</strong> - ' + size.name + '</div>');
                });

                $('#template-sizes-section').show();
            }

            function loadMeasurementTable(templateId) {
                $.post(ajaxurl, {
                    action: 'get_template_measurements_for_admin',
                    template_id: templateId
                }, function(response) {
                    if (response.success) {
                        measurementData = response.data.measurements || {};
                        const sizes = response.data.sizes || [];
                        buildMeasurementTable(sizes, measurementData);
                        $('#measurements-table-container').show();
                        console.log('✅ Measurements loaded successfully');
                    } else {
                        console.log('❌ Failed to load measurements');
                    }
                });
            }

            function buildMeasurementTable(sizes, measurements) {
                const tbody = $('#measurements-tbody');
                tbody.empty();

                const measurementKeys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J'];

                sizes.forEach(size => {
                    let rowHtml = '<tr><td style="padding: 12px 8px; background: #f8f9fa; font-weight: 600;"><strong>' + size.id + '</strong><br><small>' + size.name + '</small></td>';

                    measurementKeys.forEach(key => {
                        const value = measurements[size.id] && measurements[size.id][key] ? measurements[size.id][key].value_cm : '';
                        rowHtml += '<td style="padding: 12px 8px; text-align: center;"><input type="number" step="0.1" min="0" max="1000" value="' + value + '" data-size="' + size.id + '" data-measurement="' + key + '" onchange="updateMeasurementValue(this)" style="width: 70px; text-align: center; border: 1px solid #ddd; border-radius: 4px; padding: 6px 8px;"></td>';
                    });

                    rowHtml += '<td style="padding: 12px 8px; text-align: center;"><button type="button" class="button button-small" onclick="resetSizeMeasurements(\'' + size.id + '\')">Reset</button></td></tr>';
                    tbody.append(rowHtml);
                });
            }

            window.updateMeasurementValue = function(input) {
                const sizeKey = input.dataset.size;
                const measurementKey = input.dataset.measurement;
                const value = parseFloat(input.value) || 0;

                // 🧠 AGENT-5 DEBUG: Track measurement updates
                console.log('🔍 UPDATE DEBUG - Size:', sizeKey, 'Measurement:', measurementKey, 'Value:', value);

                if (!measurementData[sizeKey]) {
                    measurementData[sizeKey] = {};
                }

                measurementData[sizeKey][measurementKey] = {
                    value_cm: value,
                    label: getMeasurementLabel(measurementKey)
                };

                // 🧠 AGENT-5 FINAL: Direct property enumeration testing
                console.log('🔍 UPDATE DEBUG - Added:', sizeKey, measurementKey, value);
                console.log('🔍 UPDATE DEBUG - measurementData type:', typeof measurementData);
                console.log('🔍 UPDATE DEBUG - measurementData instanceof Object:', measurementData instanceof Object);
                console.log('🔍 UPDATE DEBUG - Object.keys length:', Object.keys(measurementData).length);
                console.log('🔍 UPDATE DEBUG - Direct property check:', measurementData.hasOwnProperty(sizeKey));

                // Agent-6: Verify object structure integrity
                for (let key in measurementData) {
                    console.log('🔍 VERIFY - Property:', key, 'Value type:', typeof measurementData[key]);
                }

                // Visual feedback for precision
                if (value > 0 && (value * 10) % 1 !== 0) {
                    input.style.backgroundColor = '#fff2cd';
                } else {
                    input.style.backgroundColor = '';
                }
            };

            function getMeasurementLabel(key) {
                const labels = {
                    'A': 'Chest', 'B': 'Hem Width', 'C': 'Height from Shoulder',
                    'D': 'Sleeve Length', 'E': 'Sleeve Opening', 'F': 'Shoulder to Shoulder',
                    'G': 'Neck Opening', 'H': 'Biceps', 'J': 'Rib Height'
                };
                return labels[key] || key;
            }

            window.saveAllMeasurements = function() {
                if (!currentTemplateId) {
                    alert('❌ No template selected');
                    return;
                }

                // 🧠 AGENT-5 DEBUG: Validate data before transmission
                console.log('🔍 PRE-SAVE DEBUG - template ID:', currentTemplateId);
                console.log('🔍 PRE-SAVE DEBUG - measurementData:', measurementData);
                console.log('🔍 PRE-SAVE DEBUG - measurementData keys:', Object.keys(measurementData));
                console.log('🔍 PRE-SAVE DEBUG - measurementData empty?:', Object.keys(measurementData).length === 0);

                if (Object.keys(measurementData).length === 0) {
                    alert('❌ No measurements to save. Please enter measurements in the table first.');
                    console.error('❌ measurementData is empty - user needs to enter values first');
                    return;
                }

                console.log('💾 Saving measurements for template:', currentTemplateId);
                console.log('💾 Measurement data:', measurementData);

                // 🧠 AGENT-2 FINAL: Explicit data validation and backup serialization
                const validatedData = Object.assign({}, measurementData);
                console.log('💾 Validated data keys:', Object.keys(validatedData));
                console.log('💾 Validated data values:', Object.values(validatedData));

                // Agent-3: Backup validation
                if (Object.keys(validatedData).length === 0) {
                    alert('❌ No measurement data to save. Please enter values first.');
                    console.error('❌ Validated data is empty after Object.assign');
                    return;
                }

                $.post(ajaxurl, {
                    action: 'save_template_measurements_from_admin',
                    template_id: currentTemplateId,
                    measurements: validatedData // Use validated copy
                }, function(response) {
                    console.log('🔍 AJAX Response received:', response);
                    if (response.success) {
                        alert('✅ All measurements saved successfully');
                        console.log('✅ All measurements saved successfully');
                    } else {
                        alert('❌ Failed to save measurements: ' + (response.data || 'Unknown error'));
                        console.error('❌ Save error response:', response);
                    }
                }).fail(function(xhr, status, error) {
                    alert('❌ AJAX error: ' + error);
                    console.error('❌ AJAX error details:', {
                        status: status,
                        error: error,
                        responseText: xhr.responseText,
                        xhr: xhr
                    });
                });
            };


            window.exportMeasurements = function() {
                if (!currentTemplateId) {
                    alert('No template selected');
                    return;
                }

                console.log('📁 Exporting measurements...');

                const csvContent = generateMeasurementsCSV();
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'template-' + currentTemplateId + '-measurements.csv';
                a.click();

                console.log('✅ Measurements exported successfully');
            };

            function generateMeasurementsCSV() {
                const headers = ['Size', 'A (Chest)', 'B (Hem Width)', 'C (Height)', 'D (Sleeve)', 'E (Opening)', 'F (Shoulder)', 'G (Neck)', 'H (Biceps)', 'J (Rib Height)'];
                let csv = headers.join(',') + '\n';

                Object.keys(measurementData).forEach(sizeKey => {
                    const row = [sizeKey];
                    ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J'].forEach(key => {
                        const value = measurementData[sizeKey] && measurementData[sizeKey][key] ? measurementData[sizeKey][key].value_cm : '';
                        row.push(value);
                    });
                    csv += row.join(',') + '\n';
                });

                return csv;
            }

            window.resetSizeMeasurements = function(sizeKey) {
                if (confirm('Reset all measurements for size ' + sizeKey + '?')) {
                    $('input[data-size="' + sizeKey + '"]').each(function() {
                        this.value = '';
                        this.style.backgroundColor = '';
                    });

                    if (measurementData[sizeKey]) {
                        delete measurementData[sizeKey];
                    }

                    console.log('🔄 Measurements reset for size ' + sizeKey);
                }
            };

            // Initialize - Load template measurements automatically
            console.log('🧠 MEASUREMENT UI: Initializing database interface for template:', currentTemplateId);

            // Auto-load template sizes and measurements on page load
            if (currentTemplateId) {
                loadTemplateMeasurements();
            } else {
                console.error('❌ No template ID available for measurement loading');
            }
        });
        </script>
        <?php
    }
}