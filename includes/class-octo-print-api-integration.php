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
        register_setting('octo_print_designer_settings', 'octo_allesklardruck_app_id');
        register_setting('octo_print_designer_settings', 'octo_allesklardruck_api_key');
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
     * AJAX handler for previewing API payload
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
        
        // Create formatted preview
        $preview_html = '<div style="font-family: monospace; background: #f5f5f5; padding: 15px; border-radius: 5px; max-height: 400px; overflow-y: auto;">';
        $preview_html .= '<h3 style="margin-top: 0;">AllesKlarDruck API Payload Preview</h3>';
        $preview_html .= '<pre style="white-space: pre-wrap;">' . wp_json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . '</pre>';
        $preview_html .= '</div>';
        
        wp_send_json_success(array(
            'preview' => $preview_html,
            'payload' => $payload
        ));
    }

    /**
     * Send order to AllesKlarDruck API
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
        
        // Make API request
        return $this->make_api_request('/order', $payload, 'POST');
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
                'variation_id' => $item->get_variation_id()
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
        $recipient = array(
            'name' => trim($shipping_address['first_name'] . ' ' . $shipping_address['last_name']),
            'street' => $shipping_address['address_1'],
            'city' => $shipping_address['city'],
            'postalCode' => $shipping_address['postcode'],
            'country' => $shipping_address['country']
        );
        
        // Add address line 2 if available
        if (!empty($shipping_address['address_2'])) {
            $recipient['street'] .= ', ' . $shipping_address['address_2'];
        }
        
        // Sender data (YPrint company info)
        $sender = array(
            'name' => get_option('octo_allesklardruck_sender_name', 'YPrint'),
            'street' => get_option('octo_allesklardruck_sender_street', 'Company Street 1'),
            'city' => get_option('octo_allesklardruck_sender_city', 'Company City'),
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
        $product_mapping = $this->get_product_mapping($design_item['product_id'], $design_item['variation_id']);
        
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
                
                $print_positions[] = array(
                    'position' => $this->map_view_to_position($view['view_name']),
                    'width' => $print_dimensions['width_mm'],
                    'height' => $print_dimensions['height_mm'],
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
     * Get product mapping for AllesKlarDruck API
     */
    private function get_product_mapping($product_id, $variation_id = 0) {
        // Default mapping - should be configurable in future versions
        $default_mapping = array(
            'print_method' => 'DTG',
            'manufacturer' => 'Stanley/Stella',
            'series' => 'Basic',
            'type' => 'T-Shirt'
        );
        
        // TODO: Implement product-specific mapping based on template_id or product_id
        // This could be stored in WordPress options or a custom table
        
        return apply_filters('octo_allesklardruck_product_mapping', $default_mapping, $product_id, $variation_id);
    }

    /**
     * Map WordPress view name to API position
     */
    private function map_view_to_position($view_name) {
        $view_name_lower = strtolower($view_name);
        
        $position_mapping = array(
            'front' => 'front',
            'vorne' => 'front',
            'back' => 'back',
            'hinten' => 'back',
            'rücken' => 'back',
            'left' => 'left',
            'links' => 'left',
            'right' => 'right',
            'rechts' => 'right'
        );
        
        foreach ($position_mapping as $search => $position) {
            if (strpos($view_name_lower, $search) !== false) {
                return $position;
            }
        }
        
        return 'front'; // Default fallback
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
            'm' => 'M',
            'medium' => 'M',
            'l' => 'L',
            'large' => 'L',
            'xl' => 'XL',
            'extra large' => 'XL',
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
                        'images' => $this->parse_view_images($view_data['images'] ?: array())
                    );
                }
            }
        }
        
        return $views;
    }

    /**
     * Parse images from view data (reused from WC Integration)
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
                'transform' => $transform
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
     * Make HTTP request to AllesKlarDruck API
     */
    private function make_api_request($endpoint, $data = array(), $method = 'GET') {
        if (!$this->has_valid_credentials()) {
            return new WP_Error('no_credentials', __('API credentials not configured', 'octo-print-designer'));
        }
        
        $url = $this->api_base_url . $endpoint;
        
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
            'timeout' => 30,
            'sslverify' => true
        );
        
        if ($method === 'POST' && !empty($data)) {
            $args['body'] = wp_json_encode($data);
        }
        
        // Debug logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('AllesKlarDruck API Request: ' . $method . ' ' . $url);
            if (!empty($data)) {
                error_log('Request Data: ' . wp_json_encode($data, JSON_PRETTY_PRINT));
            }
        }
        
        $response = wp_remote_request($url, $args);
        
        if (is_wp_error($response)) {
            return $response;
        }
        
        $status_code = wp_remote_retrieve_response_code($response);
        $body = wp_remote_retrieve_body($response);
        
        // Debug logging
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('AllesKlarDruck API Response: ' . $status_code);
            error_log('Response Body: ' . $body);
        }
        
        if ($status_code >= 200 && $status_code < 300) {
            return json_decode($body, true);
        } else {
            return new WP_Error('api_error', sprintf(
                __('API request failed with status %d: %s', 'octo-print-designer'),
                $status_code,
                $body
            ));
        }
    }

    /**
     * Test API connection
     */
    public function test_connection() {
        $result = $this->make_api_request('/');
        
        if (is_wp_error($result)) {
            return $result;
        }
        
        return array(
            'success' => true,
            'message' => __('API connection successful', 'octo-print-designer')
        );
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
        
        // Default sender address (should be configurable in future)
        $sender_address = array(
            'name' => 'YPrint',
            'street' => 'YPrint Street 1',
            'city' => 'YPrint City',
            'postalCode' => '12345',
            'country' => 'DE'
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
                                $print_positions[] = array(
                                    'position' => strtolower($view['view_name'] ?: 'front'),
                                    'width' => round($image['print_width_mm'] ?: 200), // Default 200mm if not calculated
                                    'height' => round($image['print_height_mm'] ?: 250), // Default 250mm if not calculated
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
            
            // Map product data (simplified mapping for Phase 3)
            $order_positions[] = array(
                'printMethod' => 'DTG', // Default print method
                'manufacturer' => 'Generic', // Would need product mapping
                'series' => 'Basic', // Would need product mapping  
                'color' => $this->map_color_name($design_item['variation_name']),
                'type' => 'T-Shirt', // Would need product mapping
                'size' => $this->map_size_name($design_item['size_name']),
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
        $size_mapping = array(
            'One Size' => 'M',
            'Klein' => 'S',
            'Mittel' => 'M', 
            'Groß' => 'L',
            'Extra Groß' => 'XL'
        );
        
        return $size_mapping[$wp_size] ?? $wp_size;
    }
}