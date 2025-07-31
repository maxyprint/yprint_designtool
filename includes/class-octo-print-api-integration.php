<?php
/**
 * AllesKlarDruck API Integration Class
 * 
 * Handles communication with AllesKlarDruck API for print orders
 * 
 * @since 1.0.9
 * @package Octo_Print_Designer
 */

class Octo_Print_API_Integration {
    
    private static $instance;
    private $api_base_url = 'https://api.allesklardruck.de';
    private $app_id;
    private $api_key;
    
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    private function __construct() {
        $this->load_credentials();
        $this->init_hooks();
    }

    /**
     * Load API credentials from WordPress options
     */
    private function load_credentials() {
        $this->app_id = get_option('octo_allesklardruck_app_id', '');
        $this->api_key = get_option('octo_allesklardruck_api_key', '');
    }

    /**
     * Initialize WordPress hooks
     */
    private function init_hooks() {
        add_action('wp_ajax_octo_send_print_provider_api', array($this, 'ajax_send_to_allesklardruck'));
        add_action('wp_ajax_octo_preview_api_payload', array($this, 'ajax_preview_api_payload'));
        add_action('admin_init', array($this, 'register_admin_settings'));
        

    }

    /**
     * Register admin settings for API credentials
     */
    public function register_admin_settings() {
        // API credentials
        register_setting('octo_print_designer_settings', 'octo_allesklardruck_app_id');
        register_setting('octo_print_designer_settings', 'octo_allesklardruck_api_key');
        
        // Sender data
        register_setting('octo_print_designer_settings', 'octo_allesklardruck_sender_name');
        register_setting('octo_print_designer_settings', 'octo_allesklardruck_sender_street');
        register_setting('octo_print_designer_settings', 'octo_allesklardruck_sender_city');
        register_setting('octo_print_designer_settings', 'octo_allesklardruck_sender_postal');
        register_setting('octo_print_designer_settings', 'octo_allesklardruck_sender_country');
        
        // Template position mappings
        register_setting('octo_print_designer_settings', 'octo_allesklardruck_template_position_mappings');
        
        // Canvas configurations for coordinate conversion
        register_setting('octo_print_designer_settings', 'octo_allesklardruck_canvas_configs');
    }

    /**
     * Check if API credentials are configured
     */
    public function has_valid_credentials() {
        return !empty($this->app_id) && !empty($this->api_key);
    }

    /**
     * AJAX handler for sending order to AllesKlarDruck API
     */
    public function ajax_send_to_allesklardruck() {
        // Security check
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_send_to_print_provider')) {
            wp_send_json_error(array('message' => __('Security check failed', 'octo-print-designer')));
        }
        
        // Check permissions
        if (!current_user_can('edit_shop_orders')) {
            wp_send_json_error(array('message' => __('Insufficient permissions', 'octo-print-designer')));
        }
        
        // Check API credentials
        if (!$this->has_valid_credentials()) {
            wp_send_json_error(array('message' => __('AllesKlarDruck API credentials not configured', 'octo-print-designer')));
        }
        
        $order_id = isset($_POST['order_id']) ? absint($_POST['order_id']) : 0;
        if (!$order_id) {
            wp_send_json_error(array('message' => __('Invalid order ID', 'octo-print-designer')));
        }
        
        $order = wc_get_order($order_id);
        if (!$order) {
            wp_send_json_error(array('message' => __('Order not found', 'octo-print-designer')));
        }
        
        // Send to API
        $result = $this->send_order_to_api($order);
        
        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
        }
        
        // Save API response
        update_post_meta($order_id, '_allesklardruck_api_sent', time());
        update_post_meta($order_id, '_allesklardruck_api_response', $result);
        
        // Add order note
        $order->add_order_note(
            sprintf(__('Order sent to AllesKlarDruck API. Response: %s', 'octo-print-designer'), wp_json_encode($result)),
            false,
            true
        );
        
        wp_send_json_success(array(
            'message' => __('Order successfully sent to AllesKlarDruck API', 'octo-print-designer'),
            'response' => $result
        ));
    }

    /**
     * AJAX handler for previewing API payload with enhanced print specifications info
     */
    public function ajax_preview_api_payload() {
        // Security check
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_send_to_print_provider')) {
            wp_send_json_error(array('message' => __('Security check failed', 'octo-print-designer')));
        }
        
        $order_id = isset($_POST['order_id']) ? absint($_POST['order_id']) : 0;
        if (!$order_id) {
            wp_send_json_error(array('message' => __('Invalid order ID', 'octo-print-designer')));
        }
        
        $order = wc_get_order($order_id);
        if (!$order) {
            wp_send_json_error(array('message' => __('Order not found', 'octo-print-designer')));
        }
        
        // Build API payload
        $payload = $this->build_api_payload($order);
        
        if (is_wp_error($payload)) {
            wp_send_json_error(array('message' => $payload->get_error_message()));
        }
        
        // Get print specifications summary
        $print_specs_summary = $this->get_print_specifications_summary($order);
        
        // Create enhanced preview with print specifications info
        $preview_html = '<div style="font-family: monospace; background: #f5f5f5; padding: 15px; border-radius: 5px; max-height: 400px; overflow-y: auto;">';
        $preview_html .= '<h3 style="margin-top: 0;">AllesKlarDruck API Payload Preview</h3>';
        
        // Add print specifications summary
        if (!empty($print_specs_summary)) {
            $preview_html .= '<div style="background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 4px; padding: 10px; margin-bottom: 15px;">';
            $preview_html .= '<h4 style="margin: 0 0 10px 0; color: #0066cc;">📋 Print Specifications Summary</h4>';
            $preview_html .= '<ul style="margin: 0; padding-left: 20px; color: #333;">';
            foreach ($print_specs_summary as $spec) {
                $status_icon = $spec['valid'] ? '✅' : '⚠️';
                $preview_html .= '<li>' . $status_icon . ' <strong>' . esc_html($spec['template']) . '</strong> (' . esc_html($spec['position']) . '): ';
                $preview_html .= esc_html($spec['resolution']) . ' DPI, ' . esc_html($spec['colorProfile']) . ', ' . esc_html($spec['printQuality']);
                if (!$spec['valid']) {
                    $preview_html .= ' - <span style="color: #d63384;">' . esc_html($spec['error']) . '</span>';
                }
                $preview_html .= '</li>';
            }
            $preview_html .= '</ul></div>';
        }
        
        $preview_html .= '<pre style="white-space: pre-wrap;">' . wp_json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . '</pre>';
        $preview_html .= '</div>';
        
        wp_send_json_success(array(
            'preview' => $preview_html,
            'payload' => $payload,
            'print_specs_summary' => $print_specs_summary
        ));
    }

    /**
     * Send order to AllesKlarDruck API with enhanced error handling
     */
    public function send_order_to_api($order) {
        if (!$order) {
            return new WP_Error('invalid_order', __('Invalid order object', 'octo-print-designer'));
        }
        
        // Build API payload
        $payload = $this->build_api_payload($order);
        
        if (is_wp_error($payload)) {
            return $payload;
        }
        
        // Log the attempt
        error_log("AllesKlarDruck API: Sending order #{$order->get_order_number()} to API");
        
        // Make API request
        $api_response = $this->make_api_request('/order', $payload, 'POST');
        
        if (is_wp_error($api_response)) {
            // Log the error
            error_log("AllesKlarDruck API Error for order #{$order->get_order_number()}: " . $api_response->get_error_message());
            return $api_response;
        }
        
        // Process successful response
        $processed_response = $this->save_api_response_to_order($order, $api_response, $payload);
        
        if (!is_wp_error($processed_response)) {
            error_log("AllesKlarDruck API: Successfully sent order #{$order->get_order_number()}");
        }
        
        return $processed_response;
    }

    /**
     * Build complete API payload from WordPress order
     */
    public function build_api_payload($order) {
        if (!$order) {
            return new WP_Error('invalid_order', __('Invalid order object', 'octo-print-designer'));
        }
        
        // Extract order items with design data
        $design_items = $this->extract_design_items($order);
        
        if (empty($design_items)) {
            return new WP_Error('no_design_items', __('No design items found in order', 'octo-print-designer'));
        }
        
        // Build shipping information
        $shipping = $this->build_shipping_data($order);
        
        if (is_wp_error($shipping)) {
            return $shipping;
        }
        
        // Convert design items to API format
        $order_positions = array();
        
        foreach ($design_items as $item) {
            $api_positions = $this->convert_item_to_api_format($item);
            
            if (is_wp_error($api_positions)) {
                return $api_positions;
            }
            
            $order_positions = array_merge($order_positions, $api_positions);
        }
        
        if (empty($order_positions)) {
            return new WP_Error('no_valid_positions', __('No valid order positions could be created', 'octo-print-designer'));
        }
        
        // Build complete payload
        $payload = array(
            'orderNumber' => (string) $order->get_order_number(),
            'orderDate' => $order->get_date_created()->format('c'), // ISO 8601 format
            'shipping' => $shipping,
            'orderPositions' => $order_positions
        );
        
        return $payload;
    }

    /**
     * Extract design items from order
     */
    private function extract_design_items($order) {
        $design_items = array();
        
        foreach ($order->get_items() as $item_id => $item) {
            // Check if this is a design item
            $design_id = $this->get_design_meta($item, 'design_id');
            
            if (!$design_id) {
                continue; // Skip non-design items
            }
            
            // Parse design views and images
            $design_views = $this->parse_design_views($item);
            
            if (empty($design_views)) {
                continue; // Skip items without proper design data
            }
            
            // Template ID aus verschiedenen Quellen extrahieren
            $template_id = $this->extract_template_id($item);
            
            $design_items[] = array(
                'item_id' => $item_id,
                'item' => $item,
                'design_id' => $design_id,
                'name' => $this->get_design_meta($item, 'name') ?: $item->get_name(),
                'design_color' => $this->get_design_meta($item, 'design_color') ?: 'Standard',
                'size_name' => $this->get_design_meta($item, 'size_name') ?: 'One Size',
                'quantity' => $item->get_quantity(),
                'design_views' => $design_views,
                'product_id' => $item->get_product_id(),
                'variation_id' => $item->get_variation_id(),
                'template_id' => $template_id
            );
        }
        
        return $design_items;
    }

    /**
     * Build shipping data for API
     */
    private function build_shipping_data($order) {
        // Get shipping address (fallback to billing if no shipping)
        $shipping_address = $order->has_shipping_address() ? 
            $order->get_address('shipping') : 
            $order->get_address('billing');
        
        if (empty($shipping_address['first_name']) || empty($shipping_address['last_name'])) {
            return new WP_Error('invalid_shipping', __('Invalid shipping address', 'octo-print-designer'));
        }
        
        // Recipient data
        $recipient_city = $this->sanitize_city_name($shipping_address['city']);
        

        
        $recipient = array(
            'name' => trim($shipping_address['first_name'] . ' ' . $shipping_address['last_name']),
            'street' => $shipping_address['address_1'],
            'city' => $recipient_city,
            'postalCode' => $shipping_address['postcode'],
            'country' => $shipping_address['country']
        );
        
        // Add address line 2 if available
        if (!empty($shipping_address['address_2'])) {
            $recipient['street'] .= ', ' . $shipping_address['address_2'];
        }
        
        // Sender data (YPrint company info)
        $sender_city = $this->sanitize_city_name(get_option('octo_allesklardruck_sender_city', 'Berlin'));
        

        
        $sender = array(
            'name' => get_option('octo_allesklardruck_sender_name', 'YPrint'),
            'street' => get_option('octo_allesklardruck_sender_street', 'Company Street 1'),
            'city' => $sender_city,
            'postalCode' => get_option('octo_allesklardruck_sender_postal', '12345'),
            'country' => get_option('octo_allesklardruck_sender_country', 'DE')
        );
        
        return array(
            'recipient' => $recipient,
            'sender' => $sender
        );
    }

    /**
     * Convert WordPress design item to AllesKlarDruck API format
     */
    private function convert_item_to_api_format($design_item) {
        $api_positions = array();
        
        // Get product mapping
        $template_id = $design_item['template_id'];
        $product_mapping = $this->get_product_mapping($template_id, $design_item['product_id'], $design_item['variation_id']);
        
        foreach ($design_item['design_views'] as $view) {
            if (empty($view['images'])) {
                continue;
            }
            
            // Build print positions for this view
            $print_positions = array();
            
            foreach ($view['images'] as $image) {
                if (empty($image['url'])) {
                    continue;
                }
                
                // Convert pixel dimensions to millimeters
                $print_dimensions = $this->convert_to_print_dimensions($image);
                
                // Enhanced position mapping with all available data
                $position = $this->map_view_to_position(
                    $view['view_name'],
                    $view['view_id'],
                    $design_item['template_id'],
                    $image['transform_data'] ?? array()
                );
                
                // Convert canvas coordinates to print area coordinates
                $print_coordinates = $this->convert_canvas_to_print_coordinates(
                    $image['transform_data'] ?? array(),
                    $design_item['template_id'],
                    $position
                );
                
                // Get print specifications configuration
                $print_specs = $this->get_print_specifications(
                    $design_item['template_id'],
                    $design_item['product_id'],
                    $position
                );
                
                $print_positions[] = array(
                    'position' => $position,
                    'width' => $print_dimensions['width_mm'],
                    'height' => $print_dimensions['height_mm'],
                    'unit' => $print_specs['unit'],
                    'offsetX' => $print_coordinates['offset_x_mm'],
                    'offsetY' => $print_coordinates['offset_y_mm'],
                    'offsetUnit' => $print_specs['offsetUnit'],
                    'referencePoint' => $print_specs['referencePoint'],
                    'resolution' => $print_specs['resolution'],
                    'colorProfile' => $print_specs['colorProfile'],
                    'bleed' => $print_specs['bleed'],
                    'scaling' => $print_specs['scaling'],
                    'printQuality' => $print_specs['printQuality'],
                    'printFile' => $image['url']
                );
            }
            
            if (!empty($print_positions)) {
                $api_positions[] = array(
                    'printMethod' => $product_mapping['print_method'],
                    'manufacturer' => $product_mapping['manufacturer'],
                    'series' => $product_mapping['series'],
                    'color' => $this->map_color_to_api($design_item['design_color']),
                    'type' => $product_mapping['type'],
                    'size' => $this->map_size_to_api($design_item['size_name']),
                    'quantity' => $design_item['quantity'],
                    'printPositions' => $print_positions
                );
            }
        }
        
        if (empty($api_positions)) {
            return new WP_Error('no_print_positions', sprintf(
                __('No valid print positions found for item: %s', 'octo-print-designer'),
                $design_item['name']
            ));
        }
        
        return $api_positions;
    }

    /**
     * Convert pixel dimensions to millimeters for printing
     */
    private function convert_to_print_dimensions($image) {
        // Get original dimensions
        $width_px = isset($image['original_width_px']) ? $image['original_width_px'] : 
                   (isset($image['transform']['width']) ? $image['transform']['width'] : 0);
        $height_px = isset($image['original_height_px']) ? $image['original_height_px'] : 
                    (isset($image['transform']['height']) ? $image['transform']['height'] : 0);
        
        // Get scale factors
        $scale_x = isset($image['scale_x']) ? $image['scale_x'] : 
                  (isset($image['transform']['scaleX']) ? $image['transform']['scaleX'] : 1);
        $scale_y = isset($image['scale_y']) ? $image['scale_y'] : 
                  (isset($image['transform']['scaleY']) ? $image['transform']['scaleY'] : 1);
        
        // Calculate final pixel dimensions
        $final_width_px = $width_px * $scale_x;
        $final_height_px = $height_px * $scale_y;
        
        // Convert to millimeters (1 pixel = 0.264583 mm at 96 DPI)
        $width_mm = round($final_width_px * 0.264583, 1);
        $height_mm = round($final_height_px * 0.264583, 1);
        
        // Ensure minimum dimensions
        $width_mm = max($width_mm, 10); // Minimum 10mm
        $height_mm = max($height_mm, 10); // Minimum 10mm
        
        return array(
            'width_mm' => $width_mm,
            'height_mm' => $height_mm,
            'original_width_px' => $width_px,
            'original_height_px' => $height_px,
            'scale_x' => $scale_x,
            'scale_y' => $scale_y
        );
    }

    /**
     * Convert canvas coordinates to print area coordinates for AllesKlarDruck API
     */
    private function convert_canvas_to_print_coordinates($transform_data, $template_id = null, $position = 'front') {
        // Canvas-Dimensionen (template-spezifisch konfigurierbar)
        $canvas_config = $this->get_canvas_config($template_id, $position);
        
        $canvas_width = $canvas_config['width'];
        $canvas_height = $canvas_config['height'];
        $print_area_width_mm = $canvas_config['print_area_width_mm'];
        $print_area_height_mm = $canvas_config['print_area_height_mm'];
        
        // Transform-Daten aus WordPress
        $left_px = isset($transform_data['left']) ? floatval($transform_data['left']) : 0;
        $top_px = isset($transform_data['top']) ? floatval($transform_data['top']) : 0;
        
        // Canvas-Koordinaten zu Millimeter umrechnen
        $pixel_to_mm_x = $print_area_width_mm / $canvas_width;
        $pixel_to_mm_y = $print_area_height_mm / $canvas_height;
        
        // Berechne Position in mm (von top-left des Druckbereichs)
        $offset_x_mm = round($left_px * $pixel_to_mm_x, 1);
        $offset_y_mm = round($top_px * $pixel_to_mm_y, 1);
        
        // Validierung: Position muss im Druckbereich bleiben
        $offset_x_mm = max(0, min($offset_x_mm, $print_area_width_mm));
        $offset_y_mm = max(0, min($offset_y_mm, $print_area_height_mm));
        
        return array(
            'offset_x_mm' => $offset_x_mm,
            'offset_y_mm' => $offset_y_mm,
            'canvas_left_px' => $left_px,
            'canvas_top_px' => $top_px
        );
    }

    /**
     * Get canvas configuration for coordinate conversion
     */
    private function get_canvas_config($template_id = null, $position = 'front') {
        // Template-spezifische Konfiguration aus WordPress-Optionen
        $canvas_configs = get_option('octo_allesklardruck_canvas_configs', array());
        
        $config_key = $template_id . '_' . $position;
        
        if (isset($canvas_configs[$config_key])) {
            return $canvas_configs[$config_key];
        }
        
        // Fallback-Konfiguration für Standard T-Shirt
        $default_configs = array(
            'front' => array(
                'width' => 800,                    // Canvas-Breite in Pixel
                'height' => 600,                   // Canvas-Höhe in Pixel
                'print_area_width_mm' => 200,      // Druckbereich-Breite in mm
                'print_area_height_mm' => 250      // Druckbereich-Höhe in mm
            ),
            'back' => array(
                'width' => 800,
                'height' => 600,
                'print_area_width_mm' => 200,
                'print_area_height_mm' => 250
            ),
            'left' => array(
                'width' => 400,
                'height' => 300,
                'print_area_width_mm' => 80,       // Kleinerer Druckbereich für Ärmel
                'print_area_height_mm' => 100
            ),
            'right' => array(
                'width' => 400,
                'height' => 300,
                'print_area_width_mm' => 80,
                'print_area_height_mm' => 100
            )
        );
        
        return isset($default_configs[$position]) ? 
               $default_configs[$position] : 
               $default_configs['front'];
    }

    /**
     * Extract template ID from order item using multiple strategies
     */
    private function extract_template_id($item) {
        // Strategy 1: Direct template_id meta
        $template_id = $item->get_meta('_template_id');
        if (!empty($template_id)) {
            error_log("YPrint Debug: Template ID found in _template_id meta: {$template_id}");
            return $template_id;
        }
        
        // Strategy 2: Get from design_data JSON
        $design_data = $item->get_meta('_design_data');
        if (!empty($design_data)) {
            if (is_string($design_data)) {
                $design_data = json_decode($design_data, true);
            }
            if (is_array($design_data) && isset($design_data['templateId'])) {
                error_log("YPrint Debug: Template ID found in design_data.templateId: {$design_data['templateId']}");
                return $design_data['templateId'];
            }
        }
        
        // Strategy 3: Get from user_designs table via design_id
        $design_id = $item->get_meta('_yprint_design_id');
        if (!empty($design_id)) {
            global $wpdb;
            $template_id = $wpdb->get_var($wpdb->prepare(
                "SELECT template_id FROM {$wpdb->prefix}octo_user_designs WHERE id = %d",
                $design_id
            ));
            if (!empty($template_id)) {
                error_log("YPrint Debug: Template ID found in user_designs table: {$template_id}");
                return $template_id;
            }
        }
        
        // Strategy 4: Parse from processed_views JSON structure
        $processed_views_json = $item->get_meta('_db_processed_views');
        if (!empty($processed_views_json)) {
            if (is_string($processed_views_json)) {
                $processed_views = json_decode($processed_views_json, true);
            } else {
                $processed_views = $processed_views_json;
            }
            
            if (is_array($processed_views)) {
                // Try to extract template ID from design structure
                foreach ($processed_views as $view_data) {
                    if (isset($view_data['template_id'])) {
                        error_log("YPrint Debug: Template ID found in processed_views: {$view_data['template_id']}");
                        return $view_data['template_id'];
                    }
                }
            }
        }
        
        error_log("YPrint Debug: No template ID found for item");
        return null;
    }

    /**
     * Get print specifications with enhanced validation and error handling
     */
    private function get_print_specifications($template_id = null, $product_id = null, $position = 'front') {
        // Get configured print specifications from WordPress options
        $print_specs = get_option('octo_allesklardruck_print_specifications', array());
        
        $config_key = $template_id . '_' . $position;
        
        // Debug-Logging
        error_log("YPrint Debug: Available print specs keys: " . implode(', ', array_keys($print_specs)));
        error_log("YPrint Debug: Looking for config_key: '{$config_key}'");
        
        if (isset($print_specs[$config_key])) {
            $specs = $print_specs[$config_key];
            error_log("YPrint Debug: Print specs found for exact match: {$config_key}");
            
            // Validate print specifications
            $validation_result = $this->validate_print_specifications($specs, $template_id, $position);
            if (is_wp_error($validation_result)) {
                error_log("Print specifications validation failed for {$config_key}: " . $validation_result->get_error_message());
            }
            
            return $specs;
        }
        
        // Fallback to default specifications with warning
        error_log("No print specifications found for template: {$template_id}, position: {$position}. Using defaults.");
        
        $default_specs = array(
            'unit' => 'mm',
            'offsetUnit' => 'mm',
            'referencePoint' => 'top-left',
            'resolution' => 300,
            'colorProfile' => 'sRGB',
            'bleed' => 2,
            'scaling' => 'proportional',
            'printQuality' => 'standard'
        );
        
        return $default_specs;
    }

    /**
     * Validate print specifications
     */
    private function validate_print_specifications($specs, $template_id = null, $position = 'front') {
        $required_fields = array('unit', 'offsetUnit', 'referencePoint', 'resolution', 'colorProfile', 'bleed', 'scaling', 'printQuality');
        
        foreach ($required_fields as $field) {
            if (!isset($specs[$field]) || empty($specs[$field])) {
                return new WP_Error(
                    'missing_print_spec_field',
                    sprintf(__('Missing required print specification field: %s for template %s position %s', 'octo-print-designer'), 
                        $field, $template_id, $position)
                );
            }
        }
        
        // Validate specific fields
        if (!in_array($specs['unit'], array('mm', 'cm', 'px'))) {
            return new WP_Error('invalid_unit', __('Invalid unit specified in print specifications', 'octo-print-designer'));
        }
        
        if (!in_array($specs['referencePoint'], array('top-left', 'center', 'top-center'))) {
            return new WP_Error('invalid_reference_point', __('Invalid reference point specified in print specifications', 'octo-print-designer'));
        }
        
        if ($specs['resolution'] < 72 || $specs['resolution'] > 600) {
            return new WP_Error('invalid_resolution', __('Resolution must be between 72 and 600 DPI', 'octo-print-designer'));
        }
        
        if ($specs['bleed'] < 0 || $specs['bleed'] > 10) {
            return new WP_Error('invalid_bleed', __('Bleed must be between 0 and 10mm', 'octo-print-designer'));
        }
        
        return true;
    }

    /**
     * Get product mapping for AllesKlarDruck API based on template and product data
     */
    private function get_product_mapping($template_id = null, $product_id = null, $variation_id = 0) {
        // Get configured mappings from WordPress options
        $configured_mappings = get_option('octo_allesklardruck_product_mappings', array());
        
        // Build template and product mappings from configuration
        $template_mappings = array();
        $product_mappings = array();
        
        foreach ($configured_mappings as $mapping) {
            if ($mapping['type'] === 'template') {
                $template_mappings[$mapping['id']] = array(
                    'print_method' => $mapping['print_method'],
                    'manufacturer' => $mapping['manufacturer'],
                    'series' => $mapping['series'],
                    'type' => $mapping['product_type']
                );
            } elseif ($mapping['type'] === 'product') {
                $product_mappings[$mapping['id']] = array(
                    'print_method' => $mapping['print_method'],
                    'manufacturer' => $mapping['manufacturer'],
                    'series' => $mapping['series'],
                    'type' => $mapping['product_type']
                );
            }
        }
        
        // Check if we have a specific mapping for this template
        if ($template_id && isset($template_mappings[$template_id])) {
            $mapping = $template_mappings[$template_id];
        } else {
            // Fallback: Product-ID basiertes Mapping
            if ($product_id && isset($product_mappings[$product_id])) {
                $mapping = $product_mappings[$product_id];
            } else {
                // Letzter Fallback: Standardwerte
                $mapping = array(
                    'print_method' => 'DTG',
                    'manufacturer' => 'Stanley/Stella',
                    'series' => 'Basic',
                    'type' => 'T-Shirt'
                );
            }
        }
        
        return apply_filters('octo_allesklardruck_product_mapping', $mapping, $template_id, $product_id, $variation_id);
    }

    /**
     * Map WordPress view to API position using multiple strategies
     */
    private function map_view_to_position($view_name, $view_id = '', $template_id = '', $transform_data = array()) {
        // Strategy 1: Check for explicit template + view mapping
        if (!empty($template_id) && !empty($view_id)) {
            $explicit_mapping = $this->get_template_view_position_mapping($template_id, $view_id);
            if ($explicit_mapping !== false) {
                return $explicit_mapping;
            }
        }
        
        // Strategy 2: Analyze view name for position keywords
        $view_name_lower = strtolower($view_name);
        
        $position_mapping = array(
            'front' => 'front',
            'vorne' => 'front',
            'vorderseite' => 'front',
            'back' => 'back',
            'hinten' => 'back',
            'rücken' => 'back',
            'rückseite' => 'back',
            'left' => 'left',
            'links' => 'left',
            'left sleeve' => 'left',
            'linker ärmel' => 'left',
            'right' => 'right',
            'rechts' => 'right',
            'right sleeve' => 'right',
            'rechter ärmel' => 'right'
        );
        
        foreach ($position_mapping as $search => $position) {
            if (strpos($view_name_lower, $search) !== false) {
                return $position;
            }
        }
        
        // Strategy 3: Estimate position based on canvas coordinates (fallback)
        if (!empty($transform_data)) {
            return $this->estimate_position_from_canvas($transform_data);
        }
        
        return 'front'; // Ultimate fallback
    }

    /**
     * Get explicit template-view position mapping
     */
    private function get_template_view_position_mapping($template_id, $view_id) {
        // Get position mappings from WordPress options or database
        $template_mappings = get_option('octo_allesklardruck_template_position_mappings', array());
        
        $mapping_key = $template_id . '_' . $view_id;
        
        if (isset($template_mappings[$mapping_key])) {
            return $template_mappings[$mapping_key];
        }
        
        return false;
    }

    /**
     * Estimate print position based on canvas coordinates
     */
    private function estimate_position_from_canvas($transform_data) {
        $left = isset($transform_data['left']) ? floatval($transform_data['left']) : 0;
        $top = isset($transform_data['top']) ? floatval($transform_data['top']) : 0;
        $width = isset($transform_data['width']) ? floatval($transform_data['width']) : 0;
        
        // Canvas dimensions estimation (adjust based on your template sizes)
        $canvas_width = 800; // Typical canvas width
        $canvas_height = 600; // Typical canvas height
        
        $center_x = $left + ($width / 2);
        $center_y = $top;
        
        // Position estimation logic
        if ($center_y < ($canvas_height * 0.6)) {
            // Upper area = front
            return 'front';
        } elseif ($center_x < ($canvas_width * 0.3)) {
            // Left side = left sleeve
            return 'left';
        } elseif ($center_x > ($canvas_width * 0.7)) {
            // Right side = right sleeve  
            return 'right';
        } else {
            // Lower center = back
            return 'back';
        }
    }

    /**
     * Map WordPress color to AllesKlarDruck API color
     */
    private function map_color_to_api($wordpress_color) {
        $color_mapping = array(
            'schwarz' => 'Black',
            'black' => 'Black',
            'weiß' => 'White',
            'white' => 'White',
            'grau' => 'Grey',
            'grey' => 'Grey',
            'gray' => 'Grey',
            'blau' => 'Blue',
            'blue' => 'Blue',
            'rot' => 'Red',
            'red' => 'Red',
            'grün' => 'Green',
            'green' => 'Green'
        );
        
        $color_lower = strtolower($wordpress_color);
        
        return isset($color_mapping[$color_lower]) ? 
               $color_mapping[$color_lower] : 
               ucfirst($wordpress_color);
    }

    /**
     * Map WordPress size to AllesKlarDruck API size
     */
    private function map_size_to_api($wordpress_size) {
        $size_mapping = array(
            'xs' => 'XS',
            'extra small' => 'XS',
            's' => 'S',
            'small' => 'S',
            'klein' => 'S',
            'm' => 'M',
            'medium' => 'M',
            'mittel' => 'M',
            'one size' => 'M',
            'l' => 'L',
            'large' => 'L',
            'groß' => 'L',
            'xl' => 'XL',
            'extra large' => 'XL',
            'extra groß' => 'XL',
            'xxl' => 'XXL',
            '2xl' => 'XXL'
        );
        
        $size_lower = strtolower($wordpress_size);
        
        return isset($size_mapping[$size_lower]) ? 
               $size_mapping[$size_lower] : 
               strtoupper($wordpress_size);
    }

    /**
     * Parse design views from order item (reused from WC Integration)
     */
    private function parse_design_views($item) {
        $views = array();
        
        // Get processed views data
        $processed_views_json = $item->get_meta('_db_processed_views');
        if (!empty($processed_views_json)) {
            if (is_string($processed_views_json)) {
                $processed_views = json_decode($processed_views_json, true);
            } else {
                $processed_views = $processed_views_json;
            }
            
            if (is_array($processed_views)) {
                foreach ($processed_views as $view_key => $view_data) {
                    $views[] = array(
                        'view_name' => $view_data['view_name'] ?: 'Unknown View',
                        'view_id' => $view_data['system_id'] ?: '',
                        'variation_id' => $view_data['variation_id'] ?: '',
                        'view_key' => $view_key, // Wichtig für Template-Mapping
                        'images' => $this->parse_view_images($view_data['images'] ?: array(), $view_data)
                    );
                }
            }
        }
        
        return $views;
    }

    /**
     * Parse images from view data (reused from WC Integration)
     */
    private function parse_view_images($images, $view_data = array()) {
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
                'transform' => $transform,
                'transform_data' => $transform // Vollständige Transform-Daten für Position-Schätzung
            );
        }
        
        return $parsed_images;
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
        // Fallback to _yprint naming
        if (!$value) {
            $value = $item->get_meta('_yprint_' . $key);
        }
        return $value;
    }

    /**
     * Sanitize city name to contain only letters (a-zA-Z) as required by AllesKlarDruck API
     * 
     * @param string $city_name Raw city name
     * @return string Sanitized city name
     */
    private function sanitize_city_name($city_name) {
        if (empty($city_name)) {
            return 'Berlin';
        }
        
        // Remove ALL non-letter characters except spaces - very strict for API compliance
        $sanitized = preg_replace('/[^a-zA-Z\s]/', '', $city_name);
        
        // Remove multiple spaces and trim
        $sanitized = preg_replace('/\s+/', ' ', trim($sanitized));
        
        // If result is empty, return a default
        if (empty($sanitized)) {
            return 'Berlin';
        }
        
        return $sanitized;
    }

    /**
     * Make HTTP request to AllesKlarDruck API with enhanced retry logic and error handling
     */
    private function make_api_request($endpoint, $data = array(), $method = 'GET', $retry_count = 0) {
        if (!$this->has_valid_credentials()) {
            return new WP_Error('no_credentials', __('API credentials not configured', 'octo-print-designer'));
        }
        
        $url = $this->api_base_url . $endpoint;
        $max_retries = 3;
        $timeout = apply_filters('octo_allesklardruck_api_timeout', 45);
        
        $headers = array(
            'X-App-Id' => $this->app_id,
            'X-Api-Key' => $this->api_key,
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
            'User-Agent' => 'YPrint-WordPress/' . OCTO_PRINT_DESIGNER_VERSION
        );
        
        $args = array(
            'method' => $method,
            'headers' => $headers,
            'timeout' => $timeout,
            'sslverify' => true,
            'redirection' => 3,
            'httpversion' => '1.1'
        );
        
        if ($method === 'POST' && !empty($data)) {
            $args['body'] = wp_json_encode($data);
            $args['headers']['Content-Length'] = strlen($args['body']);
        }
        
        // Rate limiting protection - wait between retries
        if ($retry_count > 0) {
            $wait_time = pow(2, $retry_count); // Exponential backoff: 2, 4, 8 seconds
            sleep(min($wait_time, 10)); // Cap at 10 seconds
        }
        
        // Debug logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log(sprintf('AllesKlarDruck API Request (Attempt %d/%d): %s %s', 
                $retry_count + 1, $max_retries + 1, $method, $url));
            if (!empty($data)) {
                error_log('Request Data: ' . wp_json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            }
        }
        
        $response = wp_remote_request($url, $args);
        
        // Handle WordPress HTTP errors
        if (is_wp_error($response)) {
            $error_message = $response->get_error_message();
            
            // Retry on certain network errors
            if ($retry_count < $max_retries && $this->should_retry_error($response)) {
                error_log("AllesKlarDruck API: Retrying due to network error: {$error_message}");
                return $this->make_api_request($endpoint, $data, $method, $retry_count + 1);
            }
            
            return new WP_Error('http_error', sprintf(
                __('HTTP request failed after %d attempts: %s', 'octo-print-designer'),
                $retry_count + 1,
                $error_message
            ));
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        $response_headers = wp_remote_retrieve_headers($response);
        
        // Debug logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("AllesKlarDruck API Response (Attempt {$retry_count}): Status {$status_code}");
            error_log('Response Headers: ' . wp_json_encode($response_headers->getAll()));
            error_log('Response Body: ' . $body);
        }
        
        // Process response based on status code
        $processed_response = $this->process_api_response($status_code, $body, $response_headers);
        
        // Retry on server errors (5xx) and rate limiting (429)
        if (is_wp_error($processed_response) && $retry_count < $max_retries) {
            $error_code = $processed_response->get_error_code();
            
            if (in_array($error_code, ['server_error', 'rate_limited', 'timeout'])) {
                error_log("AllesKlarDruck API: Retrying due to {$error_code}");
                return $this->make_api_request($endpoint, $data, $method, $retry_count + 1);
            }
        }
        
        return $processed_response;
    }

    /**
     * Determine if an error should trigger a retry
     * 
     * @param WP_Error $error The error object
     * @return bool Whether to retry
     */
    private function should_retry_error($error) {
        $retryable_errors = array(
            'http_request_failed',
            'timeout',
            'connection_timeout',
            'resolve_host',
            'connect_error'
        );
        
        return in_array($error->get_error_code(), $retryable_errors);
    }

    /**
     * Process API response with enhanced error handling for different status codes
     * 
     * @param int $status_code HTTP status code
     * @param string $body Response body
     * @param WP_HTTP_Requests_Response_Headers $headers Response headers
     * @return array|WP_Error Processed response or detailed error
     */
    private function process_api_response($status_code, $body, $headers) {
        // Success responses (2xx)
        if ($status_code >= 200 && $status_code < 300) {
            // Check if this is HTML content (like the root endpoint)
            if (strpos($body, '<html') !== false || strpos($body, 'Das ist die Bestell-API') !== false) {
                return array(
                    'success' => true,
                    'status_code' => $status_code,
                    'data' => array('message' => 'API endpoint available'),
                    'headers' => $headers->getAll()
                );
            }
            
            $decoded_body = json_decode($body, true);
            
            if (json_last_error() !== JSON_ERROR_NONE) {
                return new WP_Error('json_decode_error', sprintf(
                    __('Invalid JSON response: %s', 'octo-print-designer'),
                    json_last_error_msg()
                ));
            }
            
            return array(
                'success' => true,
                'status_code' => $status_code,
                'data' => $decoded_body,
                'headers' => $headers->getAll()
            );
        }
        
        // Parse error response body
        $error_data = json_decode($body, true);
        $error_message = $this->extract_error_message($error_data, $body);
        
        // Handle specific status codes
        switch ($status_code) {
            case 400:
                return new WP_Error('bad_request', sprintf(
                    __('Bad Request (400): %s', 'octo-print-designer'),
                    $error_message
                ), array('status_code' => 400, 'response_body' => $body));
                
            case 401:
                return new WP_Error('unauthorized', sprintf(
                    __('Unauthorized (401): Invalid API credentials. %s', 'octo-print-designer'),
                    $error_message
                ), array('status_code' => 401, 'response_body' => $body));
                
            case 403:
                return new WP_Error('forbidden', sprintf(
                    __('Forbidden (403): Access denied. %s', 'octo-print-designer'),
                    $error_message
                ), array('status_code' => 403, 'response_body' => $body));
                
            case 404:
                return new WP_Error('not_found', sprintf(
                    __('Not Found (404): API endpoint not found. %s', 'octo-print-designer'),
                    $error_message
                ), array('status_code' => 404, 'response_body' => $body));
                
            case 422:
                return new WP_Error('validation_error', sprintf(
                    __('Validation Error (422): %s', 'octo-print-designer'),
                    $error_message
                ), array('status_code' => 422, 'response_body' => $body));
                
            case 429:
                $retry_after = $headers->offsetGet('retry-after') ?: 60;
                return new WP_Error('rate_limited', sprintf(
                    __('Rate Limited (429): Too many requests. Retry after %d seconds.', 'octo-print-designer'),
                    $retry_after
                ), array('status_code' => 429, 'retry_after' => $retry_after));
                
            case 500:
            case 502:
            case 503:
            case 504:
                return new WP_Error('server_error', sprintf(
                    __('Server Error (%d): AllesKlarDruck API is temporarily unavailable. %s', 'octo-print-designer'),
                    $status_code,
                    $error_message
                ), array('status_code' => $status_code, 'response_body' => $body));
                
            default:
                return new WP_Error('api_error', sprintf(
                    __('API Error (%d): %s', 'octo-print-designer'),
                    $status_code,
                    $error_message
                ), array('status_code' => $status_code, 'response_body' => $body));
        }
    }

    /**
     * Extract error message from API response
     * 
     * @param array|null $error_data Decoded error response
     * @param string $raw_body Raw response body
     * @return string Error message
     */
    private function extract_error_message($error_data, $raw_body) {
        if (is_array($error_data)) {
            // Try common error message fields
            $message_fields = array('message', 'error', 'detail', 'description', 'errors');
            
            foreach ($message_fields as $field) {
                if (isset($error_data[$field])) {
                    if (is_string($error_data[$field])) {
                        return $error_data[$field];
                    } elseif (is_array($error_data[$field])) {
                        return implode(', ', $error_data[$field]);
                    }
                }
            }
            
            // If no standard message field, return the whole error data
            return wp_json_encode($error_data);
        }
        
        // Fallback to raw body if JSON parsing failed
        return !empty($raw_body) ? $raw_body : __('Unknown API error', 'octo-print-designer');
    }

    /**
     * Save API response data to order meta with detailed information
     * 
     * @param WC_Order $order WordPress order object
     * @param array $api_response API response data
     * @param array $payload Original payload sent to API
     * @return array Enhanced response data
     */
    private function save_api_response_to_order($order, $api_response, $payload) {
        $order_id = $order->get_id();
        $timestamp = time();
        
        // Extract API response data
        $response_data = $api_response['data'] ?? array();
        $status_code = $api_response['status_code'] ?? 200;
        
        // Save comprehensive API response meta
        update_post_meta($order_id, '_allesklardruck_api_sent', $timestamp);
        update_post_meta($order_id, '_allesklardruck_api_status_code', $status_code);
        update_post_meta($order_id, '_allesklardruck_api_response', $response_data);
        update_post_meta($order_id, '_allesklardruck_api_payload', $payload);
        
        // Extract and save specific response fields if available
        if (isset($response_data['orderId'])) {
            update_post_meta($order_id, '_allesklardruck_order_id', $response_data['orderId']);
        }
        
        if (isset($response_data['trackingNumber'])) {
            update_post_meta($order_id, '_allesklardruck_tracking_number', $response_data['trackingNumber']);
        }
        
        if (isset($response_data['status'])) {
            update_post_meta($order_id, '_allesklardruck_order_status', $response_data['status']);
        }
        
        // Create comprehensive order note
        $order_note_parts = array();
        $order_note_parts[] = '📡 Order successfully sent to AllesKlarDruck API';
        $order_note_parts[] = "Status Code: {$status_code}";
        
        if (isset($response_data['orderId'])) {
            $order_note_parts[] = "AllesKlarDruck Order ID: {$response_data['orderId']}";
        }
        
        if (isset($response_data['status'])) {
            $order_note_parts[] = "Status: {$response_data['status']}";
        }
        
        if (isset($response_data['estimatedProcessingTime'])) {
            $order_note_parts[] = "Estimated Processing: {$response_data['estimatedProcessingTime']}";
        }
        
        $order_note = implode("\n", $order_note_parts);
        
        $order->add_order_note($order_note, false, true);
        
        // Return enhanced response with metadata
        return array(
            'success' => true,
            'message' => __('Order successfully sent to AllesKlarDruck API', 'octo-print-designer'),
            'api_response' => $response_data,
            'status_code' => $status_code,
            'timestamp' => $timestamp,
            'order_id' => $order_id,
            'allesklardruck_order_id' => $response_data['orderId'] ?? null,
            'tracking_number' => $response_data['trackingNumber'] ?? null,
            'order_status' => $response_data['status'] ?? null
        );
    }

    /**
     * Test basic server connectivity without authentication
     */
    public function test_server_connectivity() {
        $url = $this->api_base_url;
        $timeout = 10;
        
        $args = array(
            'method' => 'GET',
            'timeout' => $timeout,
            'sslverify' => true,
            'redirection' => 0,
            'httpversion' => '1.1',
            'headers' => array(
                'User-Agent' => 'YPrint-WordPress/' . OCTO_PRINT_DESIGNER_VERSION
            )
        );
        
        $response = wp_remote_request($url, $args);
        
        if (is_wp_error($response)) {
            return new WP_Error('server_unreachable', sprintf(
                __('Server unreachable: %s', 'octo-print-designer'),
                $response->get_error_message()
            ));
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        
        return array(
            'success' => true,
            'status_code' => $status_code,
            'message' => sprintf(__('Server is reachable (Status: %d)', 'octo-print-designer'), $status_code)
        );
    }

    /**
     * Simple ping test to check basic connectivity
     */
    public function ping_api() {
        if (!$this->has_valid_credentials()) {
            return new WP_Error('no_credentials', __('API credentials not configured', 'octo-print-designer'));
        }
        
        $url = $this->api_base_url;
        $timeout = 10; // Shorter timeout for ping
        
        $headers = array(
            'X-App-Id' => $this->app_id,
            'X-Api-Key' => $this->api_key,
            'Accept' => 'application/json',
            'User-Agent' => 'YPrint-WordPress/' . OCTO_PRINT_DESIGNER_VERSION
        );
        
        $args = array(
            'method' => 'GET',
            'headers' => $headers,
            'timeout' => $timeout,
            'sslverify' => true,
            'redirection' => 0, // No redirects for ping
            'httpversion' => '1.1'
        );
        
        $response = wp_remote_request($url, $args);
        
        if (is_wp_error($response)) {
            return new WP_Error('ping_failed', sprintf(
                __('Ping failed: %s', 'octo-print-designer'),
                $response->get_error_message()
            ));
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        
        // Any response (even 404, 500, etc.) means the server is reachable
        return array(
            'success' => true,
            'status_code' => $status_code,
            'message' => sprintf(__('Server reachable (Status: %d)', 'octo-print-designer'), $status_code)
        );
    }

    /**
     * Validate API credentials format
     */
    public function validate_credentials_format() {
        if (empty($this->app_id)) {
            return new WP_Error('missing_app_id', __('App ID is missing', 'octo-print-designer'));
        }
        
        if (empty($this->api_key)) {
            return new WP_Error('missing_api_key', __('API Key is missing', 'octo-print-designer'));
        }
        
        // Check if credentials look like they might be valid
        if (strlen($this->app_id) < 3) {
            return new WP_Error('invalid_app_id', __('App ID appears to be too short', 'octo-print-designer'));
        }
        
        if (strlen($this->api_key) < 10) {
            return new WP_Error('invalid_api_key', __('API Key appears to be too short', 'octo-print-designer'));
        }
        
        return true;
    }

    /**
     * Test API connection with enhanced error handling
     */
    public function test_connection() {
        if (!$this->has_valid_credentials()) {
            return new WP_Error('no_credentials', __('API credentials not configured', 'octo-print-designer'));
        }
        
        $start_time = microtime(true);
        $debug_info = array();
        
        // Validate credentials format
        $debug_info[] = "Validating credentials format...";
        $credentials_validation = $this->validate_credentials_format();
        
        if (is_wp_error($credentials_validation)) {
            $debug_info[] = "Credentials validation failed: " . $credentials_validation->get_error_message();
            return new WP_Error(
                'invalid_credentials',
                __('API credentials appear to be invalid. Please check your App ID and API Key.', 'octo-print-designer'),
                array('debug_info' => $debug_info)
            );
        }
        
        $debug_info[] = "Credentials format validation OK";
        
        // First, test basic server connectivity
        $debug_info[] = "Testing basic server connectivity...";
        $connectivity_test = $this->test_server_connectivity();
        
        if (is_wp_error($connectivity_test)) {
            $debug_info[] = "Server connectivity failed: " . $connectivity_test->get_error_message();
            return new WP_Error(
                'server_unreachable',
                __('Server is not reachable. Check your internet connection and firewall settings.', 'octo-print-designer'),
                array('debug_info' => $debug_info)
            );
        }
        
        $debug_info[] = "Server connectivity OK: " . $connectivity_test['message'];
        
        // Test with endpoints in order of likelihood to work
        // The root endpoint (/) is known to work, so we'll try it first
        $test_endpoints = array(
            '/' => 'Root endpoint (known to work)'
        );
        
        $last_error = null;
        
        foreach ($test_endpoints as $endpoint => $description) {
            $debug_info[] = "Testing endpoint: {$endpoint} ({$description})";
            
            $result = $this->make_api_request($endpoint, array(), 'GET', 0);
            
            if (!is_wp_error($result)) {
                $response_time = round((microtime(true) - $start_time) * 1000, 2);
                
                // Log successful connection
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("AllesKlarDruck API: Connection test successful on endpoint {$endpoint}");
                }
                
                return array(
                    'success' => true,
                    'message' => sprintf(__('API connection successful (Response time: %s ms)', 'octo-print-designer'), $response_time),
                    'endpoint' => $endpoint,
                    'endpoint_description' => $description,
                    'response_time_ms' => $response_time,
                    'status_code' => $result['status_code'] ?? 200,
                    'api_version' => $result['data']['version'] ?? 'Unknown',
                    'debug_info' => $debug_info
                );
            }
            
            $error_code = $result->get_error_code();
            $error_message = $result->get_error_message();
            
            $debug_info[] = "Endpoint {$endpoint} failed: {$error_code} - {$error_message}";
            
            // Log the error for debugging
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("AllesKlarDruck API: Connection test failed on endpoint {$endpoint}: {$error_code} - {$error_message}");
            }
            
            $last_error = $result;
            
            // Don't retry on auth errors
            if ($error_code === 'unauthorized') {
                $debug_info[] = "Stopping tests due to authentication error";
                break;
            }
        }
        
        // If all endpoints failed, return the last error with debug info
        if ($last_error) {
            $error_data = $last_error->get_error_data();
            $enhanced_error = new WP_Error(
                $last_error->get_error_code(),
                sprintf(
                    __('Server is reachable but API endpoints failed. Last error: %s. Check your API credentials.', 'octo-print-designer'),
                    $last_error->get_error_message()
                ),
                array_merge($error_data ?: array(), array('debug_info' => $debug_info))
            );
            return $enhanced_error;
        }
        
        return new WP_Error('unknown_error', __('Unknown connection error', 'octo-print-designer'));
    }

    /**
     * Get API status for admin display
     */
    public function get_api_status() {
        if (!$this->has_valid_credentials()) {
            return array(
                'status' => 'not_configured',
                'message' => __('API credentials not configured', 'octo-print-designer'),
                'color' => '#dc3545'
            );
        }
        
        $test_result = $this->test_connection();
        
        if (is_wp_error($test_result)) {
            return array(
                'status' => 'error',
                'message' => sprintf(__('API Error: %s', 'octo-print-designer'), $test_result->get_error_message()),
                'color' => '#dc3545'
            );
        }
        
        return array(
            'status' => 'connected',
            'message' => __('API connection OK', 'octo-print-designer'),
            'color' => '#28a745'
        );
    }

    /**
     * Check if API credentials are configured (alias for has_valid_credentials)
     */
    public function has_credentials() {
        return $this->has_valid_credentials();
    }

    /**
     * AJAX handler for sending order to AllesKlarDruck API
     */
    public function ajax_send_print_provider_api() {
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
            wp_send_json_error(array('message' => __('Missing required order ID', 'octo-print-designer')));
        }
        
        // Get order
        $order = wc_get_order($order_id);
        if (!$order) {
            wp_send_json_error(array('message' => __('Order not found', 'octo-print-designer')));
        }
        
        // Get API integration instance
        $api_integration = Octo_Print_API_Integration::get_instance();
        
        // Check API credentials
        if (!$api_integration->has_credentials()) {
            wp_send_json_error(array(
                'message' => __('AllesKlarDruck API credentials are not configured. Please configure them in the plugin settings.', 'octo-print-designer')
            ));
        }
        
        // Transform order data for API
        $api_order_data = $this->transform_order_for_api($order);
        
        if (is_wp_error($api_order_data)) {
            wp_send_json_error(array('message' => $api_order_data->get_error_message()));
        }
        
        // Send to API
        $result = $api_integration->send_order($api_order_data);
        
        if (is_wp_error($result)) {
            wp_send_json_error(array('message' => $result->get_error_message()));
        }
        
        // Save API response information
        update_post_meta($order_id, '_allesklardruck_api_sent', time());
        if (isset($result['response_data']['order_id'])) {
            update_post_meta($order_id, '_allesklardruck_order_id', $result['response_data']['order_id']);
        }
        
        // Add order note
        $order->add_order_note(
            sprintf(__('Order sent to AllesKlarDruck API successfully. API Response: %s', 'octo-print-designer'), 
                wp_json_encode($result['response_data'])),
            false, // Customer note
            true   // Added by user
        );
        
        wp_send_json_success(array(
            'message' => __('Order successfully sent to AllesKlarDruck API', 'octo-print-designer'),
            'api_response' => $result['response_data']
        ));
    }
    
    /**
     * Transform WordPress order data to AllesKlarDruck API format
     * 
     * @param WC_Order $order The WooCommerce order
     * @return array|WP_Error Transformed data or error
     */
    private function transform_order_for_api($order) {
        // Get design items from the order
        $design_items = array();
        
        foreach ($order->get_items() as $item_id => $item) {
            $design_id = $this->get_design_meta($item, 'design_id');
            
            // Only process design products for now
            if ($design_id) {
                $design_item = array(
                    'name' => $this->get_design_meta($item, 'name'),
                    'variation_name' => $this->get_design_meta($item, 'design_color') ?: 'Standard',
                    'size_name' => $this->get_design_meta($item, 'size_name') ?: 'One Size',
                    'design_id' => $design_id,
                    'template_id' => $this->get_design_meta($item, 'template_id') ?: '',
                    'product_id' => $item->get_product_id(),
                    'variation_id' => $item->get_variation_id(),
                    'design_views' => $this->parse_design_views($item),
                    'quantity' => $item->get_quantity()
                );
                
                $design_items[] = $design_item;
            }
        }
        
        if (empty($design_items)) {
            return new WP_Error('no_design_items', __('No design items found in this order for API processing', 'octo-print-designer'));
        }
        
        // Get shipping address
        $shipping_address = array(
            'name' => trim($order->get_shipping_first_name() . ' ' . $order->get_shipping_last_name()),
            'street' => $order->get_shipping_address_1(),
            'city' => $order->get_shipping_city(),
            'postalCode' => $order->get_shipping_postcode(),
            'country' => $order->get_shipping_country()
        );
        
        // Fallback to billing address if shipping is empty
        if (empty($shipping_address['name']) || empty($shipping_address['street'])) {
            $shipping_address = array(
                'name' => trim($order->get_billing_first_name() . ' ' . $order->get_billing_last_name()),
                'street' => $order->get_billing_address_1(),
                'city' => $order->get_billing_city(),
                'postalCode' => $order->get_billing_postcode(),
                'country' => $order->get_billing_country()
            );
        }
        
        // Sender data from settings
        $sender_city = $this->sanitize_city_name(get_option('octo_allesklardruck_sender_city', 'Berlin'));
        
        $sender_address = array(
            'name' => get_option('octo_allesklardruck_sender_name', 'YPrint'),
            'street' => get_option('octo_allesklardruck_sender_street', 'Company Street 1'),
            'city' => $sender_city,
            'postalCode' => get_option('octo_allesklardruck_sender_postal', '12345'),
            'country' => get_option('octo_allesklardruck_sender_country', 'DE')
        );
        
        // Transform design items to API order positions
        $order_positions = array();
        
        foreach ($design_items as $design_item) {
            $print_positions = array();
            
            // Process design views/images
            if (!empty($design_item['design_views'])) {
                foreach ($design_item['design_views'] as $view) {
                    if (!empty($view['images'])) {
                        foreach ($view['images'] as $image) {
                            if (!empty($image['url'])) {
                                // Get print specifications configuration
                                $position = strtolower($view['view_name'] ?: 'front');
                                $print_specs = $this->get_print_specifications(
                                    $design_item['template_id'],
                                    $design_item['product_id'],
                                    $position
                                );
                                
                                $print_positions[] = array(
                                    'position' => $position,
                                    'width' => round($image['print_width_mm'] ?: 200), // Default 200mm if not calculated
                                    'height' => round($image['print_height_mm'] ?: 250), // Default 250mm if not calculated
                                    'unit' => $print_specs['unit'],
                                    'offsetX' => isset($image['offset_x_mm']) ? round($image['offset_x_mm'], 1) : 0,
                                    'offsetY' => isset($image['offset_y_mm']) ? round($image['offset_y_mm'], 1) : 0,
                                    'offsetUnit' => $print_specs['offsetUnit'],
                                    'referencePoint' => $print_specs['referencePoint'],
                                    'resolution' => $print_specs['resolution'],
                                    'colorProfile' => $print_specs['colorProfile'],
                                    'bleed' => $print_specs['bleed'],
                                    'scaling' => $print_specs['scaling'],
                                    'printQuality' => $print_specs['printQuality'],
                                    'printFile' => $image['url']
                                );
                            }
                        }
                    }
                }
            }
            
            if (empty($print_positions)) {
                continue; // Skip items without printable content
            }
            
            // Get product mapping from template/product data
            $product_mapping = $this->get_product_mapping($design_item['template_id'], $design_item['product_id'], $design_item['variation_id']);

            $order_positions[] = array(
                'printMethod' => $product_mapping['print_method'],
                'manufacturer' => $product_mapping['manufacturer'],
                'series' => $product_mapping['series'],
                'color' => $this->map_color_to_api($design_item['variation_name']),
                'type' => $product_mapping['type'],
                'size' => $this->map_size_to_api($design_item['size_name']),
                'quantity' => $design_item['quantity'],
                'printPositions' => $print_positions
            );
        }
        
        if (empty($order_positions)) {
            return new WP_Error('no_printable_items', __('No printable items found in design data', 'octo-print-designer'));
        }
        
        // Build final API payload
        $api_order = array(
            'orderNumber' => (string) $order->get_order_number(),
            'orderDate' => $order->get_date_created()->format('c'), // ISO 8601 format
            'shipping' => array(
                'recipient' => $shipping_address,
                'sender' => $sender_address
            ),
            'orderPositions' => $order_positions
        );
        
        return $api_order;
    }
    
    /**
     * Map WordPress color name to API color name
     * 
     * @param string $wp_color WordPress color name
     * @return string API color name
     */
    private function map_color_name($wp_color) {
        $color_mapping = array(
            'Schwarz' => 'Black',
            'Weiß' => 'White',
            'Grau' => 'Grey',
            'Rot' => 'Red',
            'Blau' => 'Blue',
            'Grün' => 'Green'
        );
        
        return $color_mapping[$wp_color] ?? $wp_color;
    }
    
    /**
     * Map WordPress size name to API size name
     * 
     * @param string $wp_size WordPress size name
     * @return string API size name
     */
    private function map_size_name($wp_size) {
        return $this->map_size_to_api($wp_size);
    }

    /**
     * Get API status for a specific order
     * 
     * @param int $order_id WordPress order ID
     * @return array Order API status information
     */
    public function get_order_api_status($order_id) {
        $api_sent = get_post_meta($order_id, '_allesklardruck_api_sent', true);
        $status_code = get_post_meta($order_id, '_allesklardruck_api_status_code', true);
        $allesklardruck_order_id = get_post_meta($order_id, '_allesklardruck_order_id', true);
        $order_status = get_post_meta($order_id, '_allesklardruck_order_status', true);
        $tracking_number = get_post_meta($order_id, '_allesklardruck_tracking_number', true);
        
        if (!$api_sent) {
            return array(
                'sent' => false,
                'status' => 'not_sent',
                'message' => __('Order not sent to API yet', 'octo-print-designer'),
                'color' => '#6c757d'
            );
        }
        
        $sent_date = date_i18n(get_option('date_format') . ' ' . get_option('time_format'), $api_sent);
        
        if ($status_code && $status_code >= 200 && $status_code < 300) {
            return array(
                'sent' => true,
                'status' => 'success',
                'message' => sprintf(__('Successfully sent on %s', 'octo-print-designer'), $sent_date),
                'details' => array(
                    'sent_date' => $sent_date,
                    'status_code' => $status_code,
                    'allesklardruck_order_id' => $allesklardruck_order_id,
                    'order_status' => $order_status,
                    'tracking_number' => $tracking_number
                ),
                'color' => '#28a745'
            );
        } else {
            return array(
                'sent' => true,
                'status' => 'error',
                'message' => sprintf(__('API error (Status: %s) on %s', 'octo-print-designer'), $status_code ?: 'Unknown', $sent_date),
                'details' => array(
                    'sent_date' => $sent_date,
                    'status_code' => $status_code
                ),
                'color' => '#dc3545'
            );
        }
    }

    /**
     * Get print specifications summary for an order
     */
    private function get_print_specifications_summary($order) {
        $summary = array();
        
        foreach ($order->get_items() as $item) {
            $design_data = $item->get_meta('_design_data');
            if (empty($design_data)) {
                continue;
            }
            
            // Template ID aus verschiedenen Quellen extrahieren
            $template_id = $this->extract_template_id($item);
            $views = $this->parse_design_views($item);
            
            foreach ($views as $view) {
                if (empty($view['images'])) {
                    continue;
                }
                
                $position = $this->map_view_to_position(
                    $view['view_name'],
                    $view['view_id'],
                    $template_id,
                    $view['images'][0]['transform_data'] ?? array()
                );

                // Debug-Logging für Print Specifications Lookup
                error_log("YPrint Debug: Looking for print specs with template_id: '{$template_id}', position: '{$position}', config_key: '{$template_id}_{$position}'");
                
                $print_specs = $this->get_print_specifications($template_id, $item->get_product_id(), $position);
                $validation_result = $this->validate_print_specifications($print_specs, $template_id, $position);
                
                $summary[] = array(
                    'template' => $template_id ?: 'Unknown',
                    'position' => $position,
                    'resolution' => $print_specs['resolution'],
                    'colorProfile' => $print_specs['colorProfile'],
                    'printQuality' => $print_specs['printQuality'],
                    'valid' => !is_wp_error($validation_result),
                    'error' => is_wp_error($validation_result) ? $validation_result->get_error_message() : ''
                );
            }
        }
        
        return $summary;
    }


}