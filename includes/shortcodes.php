<?php
/**
 * Shortcodes für das YPrint DesignTool
 *
 * @package YPrint_DesignTool
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Registriert die Shortcodes für das DesignTool
 */
function yprint_designtool_register_shortcodes() {
    add_shortcode('yprint_designtool', 'yprint_designtool_shortcode');
    add_shortcode('yprint_vectorizer', 'yprint_vectorizer_shortcode');
}
add_action('init', 'yprint_designtool_register_shortcodes');

/**
 * Callback-Funktion für den DesignTool-Shortcode
 *
 * @param array $atts Shortcode-Attribute
 * @return string HTML-Ausgabe des DesignTools
 */
function yprint_designtool_shortcode($atts) {
    // Standardattribute
    $atts = shortcode_atts(array(
        'width' => '100%',
        'height' => '600px',
        'mode' => 'standard',
        'tools' => 'all',
        'products' => '',
        'template' => ''
    ), $atts, 'yprint_designtool');
    
    // Eindeutige ID für dieses DesignTool-Instanz
    $instance_id = 'yprint-designtool-' . uniqid();
    
    // Container-Stil basierend auf Breite und Höhe
    $container_style = sprintf(
        'width: %s; height: %s; max-width: 100%%;', 
        esc_attr($atts['width']), 
        esc_attr($atts['height'])
    );
    
    // Assets laden
    wp_enqueue_style('yprint-designtool-frontend');
    wp_enqueue_script('yprint-designtool-frontend');
    
    // Ausgabe-Buffer starten
    ob_start();
    
    ?>
    <div id="<?php echo esc_attr($instance_id); ?>" class="yprint-designtool-container" style="<?php echo $container_style; ?>">
        <div class="yprint-designtool-loading">
            <div class="yprint-designtool-spinner"></div>
            <p><?php _e('Design-Tool wird geladen...', 'yprint-designtool'); ?></p>
        </div>
        
        <div class="yprint-designtool-interface" style="display: none;">
            <!-- Die Benutzeroberfläche wird per JavaScript eingefügt -->
        </div>
        
        <noscript>
            <div class="yprint-designtool-error">
                <p><?php _e('JavaScript muss aktiviert sein, um das Design-Tool zu verwenden.', 'yprint-designtool'); ?></p>
            </div>
        </noscript>
    </div>
    
    <script type="text/javascript">
        // Diese Daten werden vom JavaScript des DesignTools verwendet
        if (typeof yprintDesignToolInstances === 'undefined') {
            var yprintDesignToolInstances = {};
        }
        
        yprintDesignToolInstances['<?php echo esc_js($instance_id); ?>'] = {
            mode: '<?php echo esc_js($atts['mode']); ?>',
            tools: '<?php echo esc_js($atts['tools']); ?>',
            products: '<?php echo esc_js($atts['products']); ?>',
            template: '<?php echo esc_js($atts['template']); ?>'
        };
    </script>
    <?php
    
    // Rückgabe des Ausgabe-Buffers
    return ob_get_clean();
}

/**
 * Callback-Funktion für den Vektorisierungs-Shortcode
 *
 * @param array $atts Shortcode-Attribute
 * @return string HTML-Ausgabe des Vektorisierungs-Tools
 */
function yprint_vectorizer_shortcode($atts) {
    // Standardattribute
    $atts = shortcode_atts(array(
        'width' => '100%',
        'height' => 'auto',
        'detail' => 'medium',
        'color' => 'mono',
        'target' => ''
    ), $atts, 'yprint_vectorizer');
    
    // Assets laden
    wp_enqueue_style('yprint-vectorizer', YPRINT_DESIGNTOOL_PLUGIN_URL . 'assets/css/vectorizer.css');
    wp_enqueue_script('yprint-vectorizer', YPRINT_DESIGNTOOL_PLUGIN_URL . 'assets/js/vectorizer.js', array('jquery'), null, true);
    
    // Einstellungen an das JavaScript übergeben
    wp_localize_script('yprint-vectorizer', 'yprintVectorizerSettings', array(
        'ajaxUrl' => admin_url('admin-ajax.php'),
        'nonce' => wp_create_nonce('yprint-designtool-nonce'),
        'maxUploadSize' => yprint_designtool_get_max_upload_size(),
        'defaultDetail' => $atts['detail'],
        'defaultColor' => $atts['color'],
        'targetField' => $atts['target']
    ));
    
    // Eindeutige ID für diese Vektorisierer-Instanz
    $instance_id = 'yprint-vectorizer-' . uniqid();
    
    // Container-Stil
    $container_style = sprintf(
        'width: %s; height: %s;', 
        esc_attr($atts['width']), 
        esc_attr($atts['height'])
    );
    
    // Ausgabe-Buffer starten
    ob_start();
    
    ?>
    <div id="<?php echo esc_attr($instance_id); ?>" 
         class="yprint-vectorizer-container" 
         style="<?php echo $container_style; ?>"
         data-yprint-vectorizer
         data-nonce="<?php echo wp_create_nonce('yprint-designtool-nonce'); ?>"
         data-ajax-url="<?php echo admin_url('admin-ajax.php'); ?>"
         data-max-upload-size="<?php echo yprint_designtool_get_max_upload_size(); ?>"
         data-default-detail="<?php echo esc_attr($atts['detail']); ?>"
         data-default-color="<?php echo esc_attr($atts['color']); ?>"
         data-target-field="<?php echo esc_attr($atts['target']); ?>">
        <!-- Container wird per JavaScript gefüllt -->
    </div>
    <?php
    
    // Rückgabe des Ausgabe-Buffers
    return ob_get_clean();
}