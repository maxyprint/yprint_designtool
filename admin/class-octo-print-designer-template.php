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

            // Add new size definition row
            $('#add-size-definition').click(function() {
                const newRow = `
                    <tr data-index="${sizeIndex}">
                        <td>
                            <input type="text" name="size_definitions[${sizeIndex}][size]"
                                   placeholder="S, M, L, XL..." class="regular-text" />
                        </td>
                        <td>
                            <input type="number" name="size_definitions[${sizeIndex}][target_mm]"
                                   placeholder="450" step="0.1" class="regular-text" />
                        </td>
                        <td>
                            <select name="size_definitions[${sizeIndex}][reference_type]" class="regular-text">
                                <option value=""><?php esc_html_e('Select Reference...', 'octo-print-designer'); ?></option>
                                <?php foreach ($reference_lines as $ref_index => $ref_line): ?>
                                    <option value="<?php echo esc_attr($ref_index); ?>">
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
                `;
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

}