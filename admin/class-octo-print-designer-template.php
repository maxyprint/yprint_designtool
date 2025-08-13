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

            // View-spezifische Druckbereich-Konfigurationen
            if (isset($_POST['view_print_areas']) && is_array($_POST['view_print_areas'])) {
                $view_print_areas = array();
                
                foreach ($_POST['view_print_areas'] as $view_id => $config) {
                    $view_print_areas[sanitize_text_field($view_id)] = array(
                        'print_width_mm' => floatval($config['print_width_mm'] ?? 0),
                        'print_height_mm' => floatval($config['print_height_mm'] ?? 0),
                        'canvas_width' => intval($config['canvas_width'] ?? 0),
                        'canvas_height' => intval($config['canvas_height'] ?? 0)
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
     * Get default print area configuration based on view name
     */
    private function get_default_print_area_by_view_name($view_name) {
        $view_name_lower = strtolower($view_name);
        
        // Standard-Konfigurationen basierend auf View-Namen
        if (strpos($view_name_lower, 'front') !== false || strpos($view_name_lower, 'vorne') !== false) {
            return array(
                'print_width_mm' => 200,
                'print_height_mm' => 250,
                'canvas_width' => 800,
                'canvas_height' => 600
            );
        } elseif (strpos($view_name_lower, 'back') !== false || strpos($view_name_lower, 'hinten') !== false) {
            return array(
                'print_width_mm' => 200,
                'print_height_mm' => 250,
                'canvas_width' => 800,
                'canvas_height' => 600
            );
        } elseif (strpos($view_name_lower, 'left') !== false || strpos($view_name_lower, 'links') !== false) {
            return array(
                'print_width_mm' => 80,
                'print_height_mm' => 100,
                'canvas_width' => 400,
                'canvas_height' => 300
            );
        } elseif (strpos($view_name_lower, 'right') !== false || strpos($view_name_lower, 'rechts') !== false) {
            return array(
                'print_width_mm' => 80,
                'print_height_mm' => 100,
                'canvas_width' => 400,
                'canvas_height' => 300
            );
        } elseif (strpos($view_name_lower, 'sleeve') !== false || strpos($view_name_lower, 'ärmel') !== false) {
            return array(
                'print_width_mm' => 80,
                'print_height_mm' => 100,
                'canvas_width' => 400,
                'canvas_height' => 300
            );
        }
        
        // Default für unbekannte Views
        return array(
            'print_width_mm' => 200,
            'print_height_mm' => 250,
            'canvas_width' => 800,
            'canvas_height' => 600
        );
    }

    /**
     * Render the physical dimensions meta box
     */
    public function render_physical_dimensions_meta_box($post) {
        wp_nonce_field('save_template_physical_dimensions', 'template_physical_dimensions_nonce');
        
        // Lade Template-Variationen
        $template_variations = get_post_meta($post->ID, '_template_variations', true);
        $view_print_areas = get_post_meta($post->ID, '_template_view_print_areas', true);
        
        if (!is_array($view_print_areas)) {
            $view_print_areas = array();
        }
        
        // Legacy-Support: Globale Dimensionen
        $global_width = get_post_meta($post->ID, '_template_physical_width_cm', true);
        $global_height = get_post_meta($post->ID, '_template_physical_height_cm', true);
        
        if (empty($global_width)) $global_width = 30;
        if (empty($global_height)) $global_height = 40;
        
        ?>
        <div class="template-physical-dimensions-wrapper">
            <div style="display: flex; gap: 20px; margin-bottom: 20px;">
                <div style="flex: 1;">
                    <h3><?php esc_html_e('Print Area Configuration per View', 'octo-print-designer'); ?></h3>
                    <p class="description">
                        <?php esc_html_e('Configure the precise printable dimensions for each view. This ensures accurate size calculations and proper positioning for print providers.', 'octo-print-designer'); ?>
                    </p>
                </div>
                <div style="flex: 1; padding: 15px; background: #e7f3ff; border-left: 4px solid #2271b1; border-radius: 4px;">
                    <h4 style="margin-top: 0;"><?php esc_html_e('💡 How to measure:', 'octo-print-designer'); ?></h4>
                    <ul style="margin: 10px 0; padding-left: 20px; font-size: 14px;">
                        <li><?php esc_html_e('Measure the maximum printable area on the physical product', 'octo-print-designer'); ?></li>
                        <li><?php esc_html_e('Front/Back: Usually 20-25cm wide, 25-30cm high', 'octo-print-designer'); ?></li>
                        <li><?php esc_html_e('Sleeves: Usually 8-10cm wide, 10-15cm high', 'octo-print-designer'); ?></li>
                        <li><?php esc_html_e('Canvas Size: Pixel dimensions of the design canvas', 'octo-print-designer'); ?></li>
                    </ul>
                </div>
            </div>

            <?php if (is_array($template_variations) && !empty($template_variations)): ?>
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
                        
                        // Standard-Werte basierend auf View-Namen
                        $defaults = $this->get_default_print_area_by_view_name($view_name);
                        
                        $print_width = $view_config['print_width_mm'] ?? $defaults['print_width_mm'];
                        $print_height = $view_config['print_height_mm'] ?? $defaults['print_height_mm'];
                        $canvas_width = $view_config['canvas_width'] ?? $defaults['canvas_width'];
                        $canvas_height = $view_config['canvas_height'] ?? $defaults['canvas_height'];
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
                                <!-- Druckbereich-Dimensionen -->
                                <div style="background: #fff; padding: 15px; border-radius: 6px; border: 1px solid #e0e0e0;">
                                    <h5 style="margin: 0 0 10px 0; color: #d63384;"><?php esc_html_e('🎯 Print Area (Physical)', 'octo-print-designer'); ?></h5>
                                    <div style="display: flex; gap: 10px; margin-bottom: 10px;">
                                        <div style="flex: 1;">
                                            <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 12px;">
                                                <?php esc_html_e('Width (mm)', 'octo-print-designer'); ?>
                                            </label>
                                            <input type="number" 
                                                   name="view_print_areas[<?php echo esc_attr($view_id); ?>][print_width_mm]"
                                                   value="<?php echo esc_attr($print_width); ?>"
                                                   step="0.1" min="1" max="500" 
                                                   class="regular-text" style="width: 100%;" />
                                        </div>
                                        <div style="flex: 1;">
                                            <label style="display: block; font-weight: 600; margin-bottom: 5px; font-size: 12px;">
                                                <?php esc_html_e('Height (mm)', 'octo-print-designer'); ?>
                                            </label>
                                            <input type="number" 
                                                   name="view_print_areas[<?php echo esc_attr($view_id); ?>][print_height_mm]"
                                                   value="<?php echo esc_attr($print_height); ?>"
                                                   step="0.1" min="1" max="500" 
                                                   class="regular-text" style="width: 100%;" />
                                        </div>
                                    </div>
                                    <p style="margin: 0; font-size: 11px; color: #666;">
                                        <?php esc_html_e('Real-world printable area on the product', 'octo-print-designer'); ?>
                                    </p>
                                </div>

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
                            </div>

                            <!-- Kalkulierte Auflösung -->
                            <div style="margin-top: 15px; padding: 10px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
                                <p style="margin: 0; font-size: 12px; color: #856404;">
                                    <strong><?php esc_html_e('📊 Resolution:', 'octo-print-designer'); ?></strong>
                                    <span class="resolution-display">
                                        <?php echo round($canvas_width / ($print_width / 10), 1); ?> px/cm 
                                        (<?php echo round(($canvas_width / ($print_width / 10)) * 2.54, 1); ?> DPI)
                                    </span>
                                </p>
                            </div>
                        </div>
                    <?php endforeach; ?>
                </div>
            <?php else: ?>
                <!-- Fallback: Template hat noch keine Views -->
                <div style="padding: 20px; background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 4px;">
                    <h4><?php esc_html_e('⚠️ No Views Found', 'octo-print-designer'); ?></h4>
                    <p><?php esc_html_e('This template has no views configured yet. Create variations and views first, then return here to configure print areas.', 'octo-print-designer'); ?></p>
                    
                    <!-- Legacy-Einstellungen -->
                    <h5><?php esc_html_e('Legacy Global Settings', 'octo-print-designer'); ?></h5>
                    <table class="form-table">
                        <tr>
                            <th scope="row">
                                <label for="physical_width_cm"><?php esc_html_e('Physical Width (cm)', 'octo-print-designer'); ?></label>
                            </th>
                            <td>
                                <input type="number" id="physical_width_cm" name="physical_width_cm" 
                                       value="<?php echo esc_attr($global_width); ?>" step="0.1" min="1" class="regular-text" />
                            </td>
                        </tr>
                        <tr>
                            <th scope="row">
                                <label for="physical_height_cm"><?php esc_html_e('Physical Height (cm)', 'octo-print-designer'); ?></label>
                            </th>
                            <td>
                                <input type="number" id="physical_height_cm" name="physical_height_cm" 
                                       value="<?php echo esc_attr($global_height); ?>" step="0.1" min="1" class="regular-text" />
                            </td>
                        </tr>
                    </table>
                </div>
            <?php endif; ?>
        </div>

        <script>
        jQuery(document).ready(function($) {
            // Live-Berechnung der Auflösung
            $('input[name*="canvas_width"], input[name*="canvas_height"], input[name*="print_width_mm"], input[name*="print_height_mm"]').on('input', function() {
                var container = $(this).closest('.view-print-area-config');
                var canvasWidth = parseFloat(container.find('input[name*="canvas_width"]').val()) || 0;
                var printWidth = parseFloat(container.find('input[name*="print_width_mm"]').val()) || 0;
                
                if (canvasWidth > 0 && printWidth > 0) {
                    var pxPerCm = canvasWidth / (printWidth / 10);
                    var dpi = pxPerCm * 2.54;
                    container.find('.resolution-display').text(pxPerCm.toFixed(1) + ' px/cm (' + dpi.toFixed(1) + ' DPI)');
                }
            });
        });
        </script>
        <?php
    }

}