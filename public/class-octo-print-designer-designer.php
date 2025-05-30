<?php

class Octo_Print_Designer_Designer {

    public function __construct() {
        Octo_Print_Designer_Loader::$instance->add_action('init', $this, 'register_shortcodes');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_get_templates', $this, 'get_templates');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_nopriv_get_templates', $this, 'get_templates');

        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_upload_user_image', $this, 'handle_image_upload');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_delete_user_image', $this, 'handle_image_delete');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_get_user_images', $this, 'get_user_images');

        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_save_design', $this, 'handle_save_design');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_load_design', $this, 'handle_load_design');
        Octo_Print_Designer_Loader::$instance->add_action('wp_ajax_get_user_designs', $this, 'get_user_designs');
    }

    /**
     * Create the database table on plugin activation
     */
    public static function create_table() {
        global $wpdb;
        $table_name = $wpdb->prefix . 'octo_user_designs';
        
        $charset_collate = $wpdb->get_charset_collate();

        $sql = "CREATE TABLE $table_name (
            id bigint(20) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            template_id bigint(20) NOT NULL,
            name varchar(255) NOT NULL,
            product_name varchar(255) NOT NULL DEFAULT '',
            product_description text NOT NULL DEFAULT '',
            product_images longtext NOT NULL DEFAULT '[]',
            design_data longtext NOT NULL,
            product_status enum('on', 'off', 'syncing') DEFAULT 'syncing',
            inventory_status enum('in_stock', 'out_of_stock') DEFAULT 'in_stock',
            is_enabled tinyint(1) DEFAULT 1,
            variations longtext NOT NULL DEFAULT '{}',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY  (id),
            KEY user_id (user_id),
            KEY template_id (template_id),
            KEY product_status (product_status),
            KEY inventory_status (inventory_status),
            KEY is_enabled (is_enabled)
        ) $charset_collate;";

        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
    }

    public function register_shortcodes() {
        add_shortcode('ops-designer', array($this, 'shortcode'));
    }

    public function shortcode($atts) {

        $atts = shortcode_atts([
            'template_id' => null
        ], $atts);
    
        wp_enqueue_script('octo-print-designer-designer');

// Fabric.js global verfügbar machen NACH dem Designer Bundle
wp_add_inline_script('octo-print-designer-designer', '
    console.log("Checking Fabric.js availability after script load:", typeof window.fabric);
    
    // Extrahiere Fabric.js aus dem Webpack Bundle und mache es global verfügbar
    if (typeof window.fabric === "undefined") {
        console.log("Making Fabric.js globally available...");
        
        // Sofortige Webpack-Prüfung
function tryWebpackExtraction() {
    console.log("Attempting webpack extraction...");
    
    if (typeof __webpack_require__ !== "undefined") {
        try {
            console.log("Webpack require available, searching for fabric modules...");
            
            // Zuerst alle verfügbaren Module auflisten
            if (typeof __webpack_require__.cache !== "undefined") {
                const moduleKeys = Object.keys(__webpack_require__.cache);
                const fabricModules = moduleKeys.filter(key => 
                    key.toLowerCase().includes("fabric") || 
                    key.includes("node_modules/fabric")
                );
                console.log("Found potential fabric modules:", fabricModules);
                
                // Versuche diese Module zu laden
                for (const moduleKey of fabricModules) {
                    try {
                        const fabricModule = __webpack_require__.cache[moduleKey];
                        if (fabricModule && fabricModule.exports) {
                            const fabric = fabricModule.exports.default || fabricModule.exports;
                            if (fabric && (fabric.Canvas || fabric.fabric?.Canvas)) {
                                window.fabric = fabric.fabric || fabric;
                                console.log("Fabric.js extracted from cached module:", moduleKey);
                                window.dispatchEvent(new CustomEvent("fabricReady", { detail: { source: "webpack_cache" } }));
                                return true;
                            }
                        }
                    } catch (e) {
                        console.log("Failed to extract from module", moduleKey, ":", e.message);
                    }
                }
            }
            
            // Fallback: Bekannte Modul-IDs versuchen
            const knownModules = [
                "./node_modules/fabric/dist/index.min.mjs",
                "fabric",
                "./node_modules/fabric/dist/fabric.min.js",
                "./node_modules/fabric/dist/index.mjs"
            ];
            
            for (const moduleId of knownModules) {
                try {
                    const fabric = __webpack_require__(moduleId);
                    if (fabric && (fabric.Canvas || fabric.default?.Canvas)) {
                        window.fabric = fabric.default || fabric;
                        console.log("Fabric.js made globally available via webpack:", moduleId);
                        window.dispatchEvent(new CustomEvent("fabricReady", { detail: { source: "webpack_direct" } }));
                        return true;
                    }
                } catch (e) {
                    console.log("Module", moduleId, "not found:", e.message);
                }
            }
        } catch (e) {
            console.error("Error during webpack extraction:", e);
        }
    } else {
        console.log("Webpack require not available");
    }
    
    return false;
}
        
        // Versuche sofortige Extraktion
        if (!tryWebpackExtraction()) {
            console.log("Immediate webpack extraction failed, setting up canvas watcher...");
            
            // Alternative: Warte auf DesignerWidget Initialisierung
let checkCount = 0;
const maxChecks = 60; // 30 Sekunden
const checkInterval = setInterval(() => {
    checkCount++;
    console.log(`Canvas watcher attempt ${checkCount}/${maxChecks}`);
    
    // Versuche Webpack-Extraktion erneut
    if (tryWebpackExtraction()) {
        clearInterval(checkInterval);
        return;
    }
    
    // Suche nach Canvas-Instanzen die bereits Fabric verwenden
    const canvasElements = document.querySelectorAll("canvas");
    let fabricFound = false;
    
    for (let i = 0; i < canvasElements.length; i++) {
        const canvas = canvasElements[i];
        console.log(`Checking canvas ${i}:`, {
            id: canvas.id,
            className: canvas.className,
            hasFabric: !!canvas.__fabric,
            fabricType: canvas.__fabric ? typeof canvas.__fabric : "none"
        });
        
        if (canvas.__fabric && canvas.__fabric.constructor) {
            const fabricInstance = canvas.__fabric;
            console.log("Found fabric instance, checking methods...");
            
            // Validiere Fabric-Methoden
            const requiredMethods = ["getObjects", "add", "remove", "renderAll"];
            const hasRequiredMethods = requiredMethods.every(method => 
                typeof fabricInstance[method] === "function"
            );
            
            console.log("Required methods check:", {
                hasGetObjects: typeof fabricInstance.getObjects === "function",
                hasAdd: typeof fabricInstance.add === "function",
                hasRemove: typeof fabricInstance.remove === "function",
                hasRenderAll: typeof fabricInstance.renderAll === "function",
                allMethodsPresent: hasRequiredMethods
            });
            
            if (hasRequiredMethods) {
                const fabricConstructor = fabricInstance.constructor;
                
                // Erstelle globales Fabric-Objekt
                window.fabric = {
                    Canvas: fabricConstructor,
                    Image: fabricConstructor.Image || createImageMock(),
                    util: fabricConstructor.util || {},
                    Object: fabricConstructor.Object || class FabricObject {},
                    filters: fabricConstructor.filters || {},
                    getInstances: function() {
                        return fabricConstructor.getInstances ? 
                               fabricConstructor.getInstances() : [fabricInstance];
                    }
                };
                
                console.log("Fabric.js extracted from canvas instance:", typeof window.fabric);
                console.log("Available Fabric methods:", Object.keys(window.fabric));
                
                // Event für Design-Loader triggern
                window.dispatchEvent(new CustomEvent("fabricReady", { 
                    detail: { 
                        source: "canvas",
                        canvasId: canvas.id,
                        attempt: checkCount
                    } 
                }));
                
                fabricFound = true;
                clearInterval(checkInterval);
                break;
            }
        }
    }
    
    if (!fabricFound && checkCount >= maxChecks) {
        console.error("Could not extract Fabric.js after", maxChecks, "attempts");
        
        // Als letzter Ausweg: Erstelle minimales Mock
        if (typeof window.fabric === "undefined") {
            console.log("Creating minimal Fabric.js mock as fallback");
            window.fabric = createMinimalFabricMock();
            window.dispatchEvent(new CustomEvent("fabricReady", { 
                detail: { source: "mock", attempt: checkCount } 
            }));
        }
        
        clearInterval(checkInterval);
    }
}, 500);

// Hilfsfunktionen
function createImageMock() {
    return {
        fromURL: function(url, callback, options) {
            console.log("Mock Image.fromURL called:", url);
            const img = new Image();
            img.crossOrigin = options?.crossOrigin || "anonymous";
            img.onload = () => {
                const mockFabricImage = {
                    width: img.width,
                    height: img.height,
                    src: url,
                    element: img,
                    set: function(props) { Object.assign(this, props); return this; },
                    setCoords: function() { return this; }
                };
                callback && callback(mockFabricImage);
            };
            img.onerror = () => {
                console.error("Failed to load image:", url);
                callback && callback(null);
            };
            img.src = url;
        }
    };
}

function createMinimalFabricMock() {
    return {
        Canvas: {
            getInstances: function() { return []; }
        },
        Image: createImageMock(),
        util: {},
        Object: class MockFabricObject {},
        filters: {}
    };
}
        }
    } else {
    console.log("Fabric.js already available globally");
    console.log("Fabric.js details:", {
        hasCanvas: typeof window.fabric.Canvas !== "undefined",
        hasImage: typeof window.fabric.Image !== "undefined",
        canvasInstances: window.fabric.Canvas?.getInstances?.().length || 0
    });
    
    // Event für Design-Loader triggern - sofort und nach kurzer Verzögerung
    window.dispatchEvent(new CustomEvent("fabricReady", { 
        detail: { source: "already_available" } 
    }));
    
    // Zusätzliches Event nach kurzer Verzögerung für den Fall dass der Listener noch nicht bereit ist
    setTimeout(() => {
        window.dispatchEvent(new CustomEvent("fabricReady", { 
            detail: { source: "delayed_trigger" } 
        }));
    }, 100);
}
', 'after');

$this->enqueue_design_loader();
        $this->enqueue_design_loader(); // Diese Zeile hinzufügen
        
        wp_enqueue_style('octo-print-designer-toast-style');
        wp_enqueue_style('octo-print-designer-designer-style');
    
        // Prüfe auf design_id Parameter und lade Design-Daten
        $design_data = null;
        $design_id = isset($_GET['design_id']) ? intval($_GET['design_id']) : null;
        
        if ($design_id && is_user_logged_in()) {
            $design = $this->get_design_from_db($design_id, get_current_user_id());
            if (!is_wp_error($design)) {
                $design_data = $design;
            }
        }
    
        // Debug-Ausgabe für Design-Loading
error_log('=== SHORTCODE DEBUG ===');
error_log('design_id from URL: ' . ($design_id ? $design_id : 'none'));
error_log('design_data available: ' . (!is_null($design_data) ? 'yes' : 'no'));

if ($design_data) {
    error_log('Design data keys: ' . implode(', ', array_keys($design_data)));
    error_log('Design data size: ' . strlen($design_data['design_data']) . ' characters');
}

// JavaScript-Variablen für Auto-Loading bereitstellen
$auto_load_data = [
    'designId' => $design_id,
    'designData' => $design_data,
    'hasDesignToLoad' => !is_null($design_data),
    'debug' => [
        'timestamp' => time(),
        'user_id' => get_current_user_id(),
        'has_design_data' => !is_null($design_data),
        'design_data_length' => $design_data ? strlen($design_data['design_data']) : 0
    ]
];

wp_add_inline_script('octo-print-designer-designer', '
    window.octoPrintDesignerAutoLoad = ' . json_encode($auto_load_data) . ';
    console.log("Auto-load data prepared:", window.octoPrintDesignerAutoLoad);
', 'before');
    
        ob_start();
        extract($atts);
        include OCTO_PRINT_DESIGNER_PATH . 'public/partials/designer/widget.php';
        return ob_get_clean();
    
    }

    /**
     * Handle the AJAX request to get templates
     */
    public function get_templates() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_print_designer_nonce')) {
            wp_send_json_error('Invalid security token');
        }

        try {
            $templates = $this->fetch_templates();
            wp_send_json_success($templates);
        } catch (Exception $e) {
            wp_send_json_error($e->getMessage());
        }
    }

    /**
     * Handle image upload request
     */
    public function handle_image_upload() {
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

        // Handle the upload
        $result = Octo_Print_Designer_User_Images::$instance->save_image(
            $_FILES['image'],
            get_current_user_id()
        );

        if (is_wp_error($result)) {
            wp_send_json_error(array(
                'message' => $result->get_error_message()
            ));
        }

        wp_send_json_success($result);
    }

    /**
     * Handle image deletion request
     */
    public function handle_image_delete() {
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
        
        // Handle the deletion
        $result = Octo_Print_Designer_User_Images::$instance->delete_image(
            $image_id,
            get_current_user_id()
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
     * Get all images for the current user
     */
    public function get_user_images() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_print_designer_nonce')) {
            wp_send_json_error(array(
                'message' => __('Security check failed', 'octo-print-designer')
            ));
        }

        // Check if user is logged in
        if (!is_user_logged_in()) {
            wp_send_json_error(array(
                'message' => __('You must be logged in to view images', 'octo-print-designer')
            ));
        }

        // Get user's images
        $images = Octo_Print_Designer_User_Images::$instance->get_user_images(get_current_user_id());

        wp_send_json_success(array(
            'images' => $images,
            'count' => count($images)
        ));
    }

    /**
     * Handle design saving request
     */
    public function handle_save_design() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_print_designer_nonce')) {
            wp_send_json_error(array(
                'message' => __('Security check failed', 'octo-print-designer')
            ));
        }
    
        // Check if user is logged in
        if (!is_user_logged_in()) {
            wp_send_json_error(array(
                'message' => __('You must be logged in to save designs', 'octo-print-designer')
            ));
        }
    
        // Validate required fields
        $required_fields = array('template_id', 'name');
        foreach ($required_fields as $field) {
            if (!isset($_POST[$field])) {
                wp_send_json_error(array(
                    'message' => sprintf(__('Missing required field: %s', 'octo-print-designer'), $field)
                ));
            }
        }
    
        // Sanitize and validate input
        $template_id = absint($_POST['template_id']);
        $name = sanitize_text_field($_POST['name']);
        
        if (!$template_id || !$name) {
            wp_send_json_error(array(
                'message' => __('Invalid input data', 'octo-print-designer')
            ));
        }
    
        // Prepare design data array
        $design_data_array = array(
            'user_id' => get_current_user_id(),
            'template_id' => $template_id,
            'name' => $name
        );
    
        // Optional fields for updates
        if (isset($_POST['product_name'])) {
            $design_data_array['product_name'] = sanitize_text_field($_POST['product_name']);
        }
    
        if (isset($_POST['description'])) {
            $design_data_array['product_description'] = wp_kses_post($_POST['description']);
        }
    
        if (isset($_POST['design_data'])) {
            $design_data = json_decode(stripslashes($_POST['design_data']), true);
            if (is_array($design_data)) {
                $design_data_array['design_data'] = wp_json_encode($design_data);
            }
        }

        // Handle preview images
        $product_images = array();
        $preview_count = isset($_POST['preview_count']) ? intval($_POST['preview_count']) : 0;
        
        if ($preview_count > 0) {

            $preview_keys = array();
            foreach ($_FILES as $key => $file) {
                if (preg_match('/^preview_image_(.+)$/', $key, $matches)) {
                    $view_id = $matches[1];
                    $preview_keys[] = $view_id;
                }
            }
            
            // Process each preview image
            foreach ($preview_keys as $view_id) {
                $view_name = isset($_POST["preview_view_name_{$view_id}"]) ? sanitize_text_field($_POST["preview_view_name_{$view_id}"]) : '';
                
                if (isset($_FILES["preview_image_{$view_id}"])) {
                    $preview_result = Octo_Print_Designer_User_Images::$instance->save_image(
                        $_FILES["preview_image_{$view_id}"],
                        get_current_user_id(),
                        'design'
                    );
                    
                    if (!is_wp_error($preview_result)) {
                        $product_images[] = array(
                            'id' => $preview_result['id'],
                            'url' => $preview_result['url'],
                            'view_id' => $view_id,
                            'view_name' => $view_name
                        );
                    }
                }
            }
            
            if (!empty($product_images)) $design_data_array['product_images'] = wp_json_encode($product_images);
            
        } else if (!isset($_POST['design_id']) && isset($_FILES['preview_image'])) {
            // Legacy single preview image handling
            $preview_result = Octo_Print_Designer_User_Images::$instance->save_image(
                $_FILES['preview_image'],
                get_current_user_id(),
                'design'
            );
    
            if (!is_wp_error($preview_result)) {
                $design_data_array['product_images'] = wp_json_encode(array(
                    array(
                        'id' => $preview_result['id'],
                        'url' => $preview_result['url']
                    )
                ));
            }
        } else {
            // Check if product_images is being updated
            if (isset($_POST['product_images'])) {
                $product_images = json_decode(stripslashes($_POST['product_images']), true);
                if (is_array($product_images)) {
                    $design_data_array['product_images'] = wp_json_encode($product_images);
                }
            } else if (!isset($_POST['design_id'])) {
                // If this is a new design, initialize empty product images array
                $design_data_array['product_images'] = '[]';
            }
        }
    
        if (isset($_POST['variations'])) {
            $variations = json_decode(stripslashes($_POST['variations']), true);
            if (is_array($variations)) {
                $design_data_array['variations'] = wp_json_encode($variations);
            }
        }
    
        // If this is a new design, set defaults
        if (!isset($_POST['design_id'])) {
            $design_data_array = array_merge($design_data_array, array(
                'product_status' => 'syncing',
                'inventory_status' => 'in_stock',
                'is_enabled' => true,
                'variations' => '{}',
                'product_description' => ''
            ));
        }
    
        // Save or update the design
        $design_id = isset($_POST['design_id']) ? absint($_POST['design_id']) : null;
        $result = $this->save_design_to_db($design_data_array, $design_id);
    
        if (is_wp_error($result)) {
            wp_send_json_error(array(
                'message' => $result->get_error_message()
            ));
        }
    
        wp_send_json_success(array(
            'design_id' => $result,
            'message' => $design_id ? 
                __('Design updated successfully', 'octo-print-designer') : 
                __('Design saved successfully', 'octo-print-designer'),
            'redirect_url' => $this->get_redirect_url($result),
        ));
    }

    public function handle_load_design() {
        error_log('=== DESIGN LOAD DEBUG START ===');
        
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_print_designer_nonce')) {
            error_log('DESIGN LOAD ERROR: Security check failed');
            wp_send_json_error(array(
                'message' => __('Security check failed', 'octo-print-designer'),
                'debug' => 'nonce_verification_failed'
            ));
        }
    
        // Check if user is logged in
        if (!is_user_logged_in()) {
            error_log('DESIGN LOAD ERROR: User not logged in');
            wp_send_json_error(array(
                'message' => __('You must be logged in to load designs', 'octo-print-designer'),
                'debug' => 'user_not_logged_in'
            ));
        }
    
        // Validate design ID
        if (!isset($_POST['design_id'])) {
            error_log('DESIGN LOAD ERROR: No design ID provided');
            wp_send_json_error(array(
                'message' => __('No design ID provided', 'octo-print-designer'),
                'debug' => 'no_design_id'
            ));
        }
    
        $design_id = absint($_POST['design_id']);
        $user_id = get_current_user_id();
        
        error_log("DESIGN LOAD: Loading design ID {$design_id} for user {$user_id}");
        
        $design = $this->get_design_from_db($design_id, $user_id);
    
        if (is_wp_error($design)) {
            error_log('DESIGN LOAD ERROR: ' . $design->get_error_message());
            wp_send_json_error(array(
                'message' => $design->get_error_message(),
                'debug' => 'database_error'
            ));
        }
    
        error_log('DESIGN LOAD SUCCESS: Design data retrieved');
        error_log('Design data keys: ' . implode(', ', array_keys($design)));
        error_log('Design data size: ' . strlen($design['design_data']) . ' characters');
        error_log('First 200 chars of design_data: ' . substr($design['design_data'], 0, 200));
        
        // Test JSON validity
        $test_decode = json_decode($design['design_data'], true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            error_log('DESIGN LOAD ERROR: Invalid JSON in design_data - ' . json_last_error_msg());
            wp_send_json_error(array(
                'message' => 'Invalid design data format',
                'debug' => 'invalid_json',
                'json_error' => json_last_error_msg()
            ));
        }
        
        error_log('DESIGN LOAD: JSON validation passed');
        error_log('=== DESIGN LOAD DEBUG END ===');
    
        wp_send_json_success(array(
            'design' => $design,
            'debug' => array(
                'design_id' => $design_id,
                'user_id' => $user_id,
                'design_data_length' => strlen($design['design_data']),
                'has_variation_images' => isset($test_decode['variationImages']),
                'variation_images_count' => isset($test_decode['variationImages']) ? count($test_decode['variationImages']) : 0
            )
        ));
    }

    /**
     * Get all designs for current user
     */
    public function get_user_designs() {
        // Verify nonce
        if (!isset($_POST['nonce']) || !wp_verify_nonce($_POST['nonce'], 'octo_print_designer_nonce')) {
            wp_send_json_error(array(
                'message' => __('Security check failed', 'octo-print-designer')
            ));
        }

        // Check if user is logged in
        if (!is_user_logged_in()) {
            wp_send_json_error(array(
                'message' => __('You must be logged in to view designs', 'octo-print-designer')
            ));
        }

        $designs = $this->get_user_designs_from_db(get_current_user_id());

        if (is_wp_error($designs)) {
            wp_send_json_error(array(
                'message' => $designs->get_error_message()
            ));
        }

        wp_send_json_success(array(
            'designs' => $designs
        ));
    }

    /**
     * Fetch templates from the database
     * 
     * @return array Formatted template data
     */
    private function fetch_templates() {
        $args = array(
            'post_type' => 'design_template',
            'posts_per_page' => -1,
            'post_status' => 'publish'
        );

        $templates = array();
        $query = new WP_Query($args);

        if ($query->have_posts()) {
            while ($query->have_posts()) {
                $query->the_post();
                $template_id = get_the_ID();
                
                // Get template variations
                $variations = get_post_meta($template_id, '_template_variations', true);
                if (empty($variations)) continue;

                $default_variation = $this->get_default_variation($variations);
                if (!$default_variation) continue;

                // Get physical dimensions
                $physical_width_cm = get_post_meta($template_id, '_template_physical_width_cm', true);
                $physical_height_cm = get_post_meta($template_id, '_template_physical_height_cm', true);
                
                if (empty($physical_width_cm)) $physical_width_cm = 30; // Default 30cm
                if (empty($physical_height_cm)) $physical_height_cm = 40; // Default 40cm

                // Convert template variations to format expected by frontend
                $variations = $this->format_variations($variations);

                // Add template to array
                $templates[$template_id] = array(
                    'id' => $template_id,
                    'name' => get_the_title(),
                    'variations' => $variations,
                    'physical_width_cm' => (float) $physical_width_cm,
                    'physical_height_cm' => (float) $physical_height_cm
                );
            }
        }
        wp_reset_postdata();

        return $templates;
    }

    private function format_variations($variations) {
        $formatted_variations = array();
    
        foreach ($variations as $variation_id => $variation) {
            $formatted_variations[$variation_id] = array(
                'id' => $variation_id,
                'name' => sanitize_text_field($variation['name']),
                'color' => sanitize_text_field($variation['color_code']),
                'is_default' => (bool) $variation['is_default'],
                'is_dark_shirt' => (bool) $variation['is_dark_shirt'],
                // 'available_sizes' => $this->format_sizes($variation['available_sizes']),
                'views' => $this->format_views($variation['views'])
            );
        }
    
        return $formatted_variations;
    }

    /**
     * Find the default variation from the variations array
     * 
     * @param array $variations Array of template variations
     * @return array|null Default variation or null if not found
     */
    private function get_default_variation($variations) {
        foreach ($variations as $variation) {
            if (isset($variation['is_default']) && $variation['is_default']) {
                return $variation;
            }
        }
        return null;
    }

    /**
     * Format views data for frontend consumption
     * 
     * @param array $views Raw views data from database
     * @return array Formatted views data
     */
    private function format_views($views) {
        $formatted_views = array();

        foreach ($views as $view_id => $view) {
            if (empty($view['image'])) continue;

            $image_url = wp_get_attachment_url($view['image']);
            if (!$image_url) continue;

            $formatted_views[$view_id] = array(
                'name' => sanitize_text_field($view['name']),
                'image' => absint($view['image']),
                'image_url' => esc_url($image_url),
                'colorOverlayEnabled' => (bool) $view['colorOverlayEnabled'],
                'overlayOpacity' => (float) $view['overlayOpacity'],
                'overlayCOlor' => sanitize_hex_color($view['overlayColor']),
                'safeZone' => $this->sanitize_zone_data($view['safeZone']),
                'imageZone' => $this->sanitize_zone_data($view['imageZone'])
            );
        }

        return $formatted_views;
    }

    /**
     * Sanitize zone data (safe zone or image zone)
     * 
     * @param string|array $zone_data Zone data from database
     * @return array Sanitized zone data
     */
    private function sanitize_zone_data($zone_data) {

        if (is_string($zone_data)) $zone_data = json_decode($zone_data, true);

        if (!is_array($zone_data)) {
            return array(
                'left' => 0,
                'top' => 0,
                'width' => 200,
                'height' => 200,
                'scaleX' => 1,
                'scaleY' => 1,
                'angle' => 0
            );
        }

        $sanitized = array();
        
        // Sanitize numeric values
        $numeric_fields = array('left', 'top', 'width', 'height', 'scaleX', 'scaleY', 'angle');
        foreach ($numeric_fields as $field) {
            if (isset($zone_data[$field])) $sanitized[$field] = (float) $zone_data[$field];
        }

        return $sanitized;

    }

    /**
     * Save or update a design in the database
     */
    private function save_design_to_db($data, $design_id = null) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'octo_user_designs';
    
        // Format specifiers for all possible fields
        $format = array(
            'user_id' => '%d',
            'template_id' => '%d',
            'name' => '%s',
            'product_name' => '%s',
            'product_description' => '%s',
            'product_images' => '%s',
            'design_data' => '%s',
            'product_status' => '%s',
            'inventory_status' => '%s',
            'is_enabled' => '%d',
            'variations' => '%s'
        );
    
        // If design_id is provided, update existing record
        if ($design_id) {
            // Verify ownership
            $existing = $wpdb->get_row($wpdb->prepare(
                "SELECT id FROM {$table_name} WHERE id = %d AND user_id = %d",
                $design_id,
                $data['user_id']
            ));
    
            if (!$existing) {
                return new WP_Error('not_found', __('Design not found or access denied', 'octo-print-designer'));
            }
    
            // Get format array only for the fields we're updating
            $update_format = array_intersect_key($format, $data);
    
            $result = $wpdb->update(
                $table_name,
                $data,
                array('id' => $design_id),
                array_values($update_format),
                array('%d')
            );
    
            if ($result === false) {
                return new WP_Error('db_error', __('Failed to update design', 'octo-print-designer'));
            }
    
            return $design_id;
        }
    
        // Insert new record
        $result = $wpdb->insert(
            $table_name,
            $data,
            array_values(array_intersect_key($format, $data))
        );
    
        if ($result === false) {
            return new WP_Error('db_error', __('Failed to save design', 'octo-print-designer'));
        }
    
        return $wpdb->insert_id;
    }

    /**
     * Get a single design from the database
     */
    private function get_design_from_db($design_id, $user_id) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'octo_user_designs';

        $design = $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$table_name} WHERE id = %d AND user_id = %d",
                $design_id,
                $user_id
            ),
            ARRAY_A
        );

        if (!$design) {
            return new WP_Error('not_found', __('Design not found or access denied', 'octo-print-designer'));
        }

        // Get template sizes
        $template_sizes = get_post_meta($design['template_id'], '_template_sizes', true);
        if (is_string($template_sizes)) {
            $unserialized_sizes = maybe_unserialize($template_sizes);
            $template_sizes = is_array($unserialized_sizes) ? $unserialized_sizes : array();
        }

        // Get template variations
        $template_variations = get_post_meta($design['template_id'], '_template_variations', true);
        if (is_string($template_variations)) {
            $unserialized_variations = maybe_unserialize($template_variations);
            $template_variations = is_array($unserialized_variations) ? $unserialized_variations : array();
        }

        // Add template data to the design data
        $design['template_sizes'] = $template_sizes;
        $design['template_variations'] = $template_variations;

        return $design;
    }

    /**
     * Get all designs for a user from the database
     */
    private function get_user_designs_from_db($user_id) {
        global $wpdb;
        $table_name = $wpdb->prefix . 'octo_user_designs';
    
        $designs = $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$table_name} WHERE user_id = %d ORDER BY updated_at DESC",
                $user_id
            ),
            ARRAY_A
        );
    
        if (!$designs) return array();
    
        // Get unique template IDs
        $template_ids = array_unique(array_column($designs, 'template_id'));
        
        // Cache template data
        $template_cache = array();
        foreach ($template_ids as $template_id) {
            // Get sizes
            $sizes = get_post_meta($template_id, '_template_sizes', true);
            if (is_string($sizes)) {
                $unserialized_sizes = maybe_unserialize($sizes);
                $sizes = is_array($unserialized_sizes) ? $unserialized_sizes : array();
            }
            
            // Get variations
            $variations = get_post_meta($template_id, '_template_variations', true);
            if (is_string($variations)) {
                $unserialized_variations = maybe_unserialize($variations);
                $variations = is_array($unserialized_variations) ? $unserialized_variations : array();
            }
    
            // Get stock status
            $in_stock = get_post_meta($template_id, '_template_in_stock', true);

            // Get pricing rules
            $pricing_rules = get_post_meta($template_id, '_template_pricing_rules', true);
            
            // Get physical dimensions
            $physical_width_cm = get_post_meta($template_id, '_template_physical_width_cm', true);
            $physical_height_cm = get_post_meta($template_id, '_template_physical_height_cm', true);
            
            if (empty($physical_width_cm)) $physical_width_cm = 30; // Default 30cm
            if (empty($physical_height_cm)) $physical_height_cm = 40; // Default 40cm
    
            $template_cache[$template_id] = array(
                'sizes' => $sizes,
                'variations' => $variations,
                'in_stock' => $in_stock,
                'pricing_rules' => $pricing_rules,
                'physical_width_cm' => $physical_width_cm,
                'physical_height_cm' => $physical_height_cm,
                'name' => get_the_title($template_id),
            );
        }
    
        // Add template data to each design
        foreach ($designs as &$design) {
            $template_id = $design['template_id'];
            $design['template_sizes'] = $template_cache[$template_id]['sizes'];
            $design['template_variations'] = $template_cache[$template_id]['variations'];
            $design['template_pricing_rules'] = $template_cache[$template_id]['pricing_rules'];
            $design['physical_width_cm'] = $template_cache[$template_id]['physical_width_cm'];
            $design['physical_height_cm'] = $template_cache[$template_id]['physical_height_cm'];
            $design['template_data'] = array(
                'in_stock' => $template_cache[$template_id]['in_stock']
            );
            $design['template_name'] = $template_cache[$template_id]['name'];
        }
    
        return $designs;
    }

    private function get_redirect_url($design_id) {
        $slug = Octo_Print_Designer_Settings::get_redirect_slug();
        $url = home_url($slug);
        
        if ($design_id) {
            $url = add_query_arg('design_id', $design_id, $url);
        }
        
        return $url;
    }

    /**
 * Enqueue design loader script
 */
private function enqueue_design_loader() {
    wp_enqueue_script(
        'octo-print-designer-loader',
        OCTO_PRINT_DESIGNER_URL . 'public/js/design-loader.js',
        array('octo-print-designer-designer'), // Abhängigkeit zu Designer
        OCTO_PRINT_DESIGNER_VERSION,
        true // Im Footer laden
    );
    
    // Debug-Information hinzufügen
    wp_add_inline_script('octo-print-designer-loader', '
        console.log("Design loader script enqueued successfully");
        console.log("Dependencies loaded:", typeof window.fabric !== "undefined");
    ', 'before');
}
}