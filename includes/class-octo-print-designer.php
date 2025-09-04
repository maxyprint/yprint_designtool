<?php
class Octo_Print_Designer {
    protected $loader;
    protected $plugin_name;
    protected $version;
    protected $wc_integration;
    protected $api_integration;

    public function __construct() {
        $this->version = OCTO_PRINT_DESIGNER_VERSION;
        $this->plugin_name = 'octo-print-designer';
        
        $this->load_dependencies();

        new Octo_Print_Designer_User_Images();
        $this->wc_integration = Octo_Print_Designer_WC_Integration::get_instance();
        $this->api_integration = Octo_Print_API_Integration::get_instance();

        $plugin_admin = new Octo_Print_Designer_Admin($this->plugin_name, $this->version);
        $plugin_public = new Octo_Print_Designer_Public($this->plugin_name, $this->version);
    }

    private function load_dependencies() {
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-octo-print-designer-loader.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-octo-print-designer-user-images.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-octo-print-designer-wc-integration.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'includes/class-octo-print-api-integration.php';
        
        require_once plugin_dir_path(dirname(__FILE__)) . 'admin/class-octo-print-designer-template.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'admin/class-octo-print-designer-admin.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'admin/class-octo-print-designer-settings.php';

        require_once plugin_dir_path(dirname(__FILE__)) . 'public/class-octo-print-designer-public.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'public/class-octo-print-designer-designer.php';
        require_once plugin_dir_path(dirname(__FILE__)) . 'public/class-octo-print-designer-products.php';  
        
        $this->loader = new Octo_Print_Designer_Loader();
        Octo_Print_Designer_Settings::get_instance();

    }

    public function run() {
        $this->loader->run();
    }

    /**
     * Create design from template with relative coordinates
     * 
     * @param int $template_id Template ID
     * @param int $user_id User ID
     * @param array $design_elements Design elements with relative coordinates
     * @return int|false Design ID or false on failure
     */
    public function create_design_from_template($template_id, $user_id, $design_elements) {
        error_log("YPrint: 🎨 Erstelle Design aus Template {$template_id}");
        
        // Hole Template-Referenzmessungen
        $template_views = get_post_meta($template_id, '_template_view_print_areas', true);
        if (empty($template_views)) {
            error_log("YPrint: ❌ Keine Template-Views gefunden");
            return false;
        }
        
        // Erstelle Design-Post
        $design_data = array(
            'post_title' => 'Design from Template ' . $template_id,
            'post_content' => '',
            'post_status' => 'publish',
            'post_type' => 'octo_design',
            'post_author' => $user_id,
            'meta_input' => array(
                '_design_template_id' => $template_id,
                '_design_views' => array(),
                '_design_elements' => array(),
                '_design_created_at' => current_time('mysql')
            )
        );
        
        $design_id = wp_insert_post($design_data);
        if (!$design_id) {
            error_log("YPrint: ❌ Fehler beim Erstellen des Design-Posts");
            return false;
        }
        
        // Kopiere Template-Views in Design
        $design_views = array();
        foreach ($template_views as $view_id => $view_data) {
            $reference_measurement = $view_data['measurements']['reference_measurement'] ?? null;
            
            if ($reference_measurement) {
                $design_views[$view_id] = array(
                    'canvas_width' => $view_data['canvas_width'],
                    'canvas_height' => $view_data['canvas_height'],
                    'reference_measurement' => $reference_measurement,
                    'elements' => array()
                );
                
                error_log("YPrint: ✅ View {$view_id} in Design kopiert mit Referenzmaß: {$reference_measurement['measurement_type']}");
            }
        }
        
        // Speichere Design-Views
        update_post_meta($design_id, '_design_views', $design_views);
        
        // Füge Design-Elemente hinzu (mit relativen Koordinaten)
        if (!empty($design_elements)) {
            $this->add_design_elements($design_id, $design_elements, $design_views);
        }
        
        error_log("YPrint: ✅ Design {$design_id} erfolgreich aus Template {$template_id} erstellt");
        return $design_id;
    }
    
    /**
     * Add design elements with relative coordinates
     * 
     * @param int $design_id Design ID
     * @param array $elements Design elements
     * @param array $design_views Design views with reference measurements
     */
    private function add_design_elements($design_id, $elements, $design_views) {
        $design_elements = array();
        
        foreach ($elements as $element_id => $element_data) {
            $view_id = $element_data['view_id'] ?? array_keys($design_views)[0];
            $view_data = $design_views[$view_id] ?? null;
            
            if (!$view_data || !isset($view_data['reference_measurement'])) {
                error_log("YPrint: ⚠️ Keine Referenzmessung für View {$view_id}");
                continue;
            }
            
            $reference_distance = $view_data['reference_measurement']['pixel_distance'];
            
            // Konvertiere absolute Koordinaten zu relativen Faktoren
            $relative_element = array(
                'position_x_factor' => $element_data['x'] / $reference_distance,
                'position_y_factor' => $element_data['y'] / $reference_distance,
                'width_factor' => $element_data['width'] / $reference_distance,
                'height_factor' => $element_data['height'] / $reference_distance,
                'template_view_id' => $view_id,
                'content' => $element_data['content'] ?? '',
                'font_size_factor' => ($element_data['font_size'] ?? 16) / $reference_distance,
                'element_type' => $element_data['type'] ?? 'text'
            );
            
            $design_elements[$element_id] = $relative_element;
            
            error_log("YPrint: ✅ Element {$element_id} mit relativen Koordinaten hinzugefügt");
        }
        
        // Speichere Design-Elemente
        update_post_meta($design_id, '_design_elements', $design_elements);
    }
}